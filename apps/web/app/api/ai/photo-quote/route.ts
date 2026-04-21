import { NextResponse } from "next/server";
import { z } from "zod";
import { anthropic, MODELS } from "@/lib/anthropic";
import { createSupabaseServerClient } from "@/lib/supabase";
import { photoQuoteSystemPrompt, PHOTO_QUOTE_PROMPT_VERSION } from "@werkspot/ai-prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

const Body = z.object({
  job_id: z.string().uuid(),
  photos: z.array(z.string().url()).min(1).max(5),
});

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ code: "auth/unauthorized", message: "Sign in required" }, { status: 401 });
  }

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { code: "validation/invalid_field", message: parsed.error.message },
      { status: 400 }
    );
  }

  const { data: job } = await supabase.from("jobs").select("id, category_id, postal_code").eq("id", parsed.data.job_id).single();
  if (!job) {
    return NextResponse.json({ code: "validation/invalid_field", message: "Job not found" }, { status: 404 });
  }

  // Pricing benchmark from materialized view
  const { data: stats } = await supabase
    .from("postal_code_stats")
    .select("avg_price_cents, p25_cents, p75_cents, job_count")
    .eq("postal_code", job.postal_code)
    .eq("category_id", job.category_id)
    .maybeSingle();

  const stream = await anthropic.messages.stream({
    model: MODELS.sonnet,
    max_tokens: 600,
    system: [
      {
        type: "text",
        text: photoQuoteSystemPrompt({ categoryId: job.category_id, postalPrefix: job.postal_code?.slice(0, 4) ?? "" }),
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [
      {
        role: "user",
        content: [
          ...parsed.data.photos.map((url) => ({
            type: "image" as const,
            source: { type: "url" as const, url },
          })),
          {
            type: "text" as const,
            text: `Benchmark for buurt: ${JSON.stringify(stats ?? { note: "no local data yet" })}\n\nRespond with JSON only: {min_cents, max_cents, confidence, verify_onsite[]}`,
          },
        ],
      },
    ],
  });

  const encoder = new TextEncoder();
  const rs = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: event.delta.text })}\n\n`));
          }
        }
        const final = await stream.finalMessage();
        controller.enqueue(
          encoder.encode(
            `event: done\ndata: ${JSON.stringify({
              usage: final.usage,
              prompt_version: PHOTO_QUOTE_PROMPT_VERSION,
            })}\n\n`
          )
        );
        controller.close();
      } catch (err) {
        controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ message: String(err) })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(rs, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
