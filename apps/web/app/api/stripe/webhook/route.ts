import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, commissionCents } from "@/lib/stripe";
import { createSupabaseServerClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ code: "validation/invalid_field", message: "Missing signature" }, { status: 400 });
  }

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ code: "auth/forbidden", message: `Invalid signature: ${String(err)}` }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  // Idempotency: reject duplicate events
  const { error: insertErr } = await supabase
    .from("stripe_events")
    .insert({ id: event.id, type: event.type });
  if (insertErr && insertErr.code !== "23505") {
    // 23505 = unique_violation = already processed; treat as success
    return NextResponse.json({ code: "internal", message: insertErr.message }, { status: 500 });
  }
  if (insertErr?.code === "23505") {
    return NextResponse.json({ ok: true, deduped: true });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      const jobId = pi.metadata.job_id;
      if (!jobId) break;
      await supabase.from("payments").upsert(
        {
          job_id: jobId,
          stripe_payment_intent: pi.id,
          amount_cents: pi.amount_received ?? pi.amount,
          commission_cents: commissionCents(pi.amount_received ?? pi.amount),
          status: "held",
        },
        { onConflict: "stripe_payment_intent" }
      );
      await supabase.from("job_events").insert({
        job_id: jobId,
        event_type: "payment_held",
        payload: { payment_intent: pi.id, amount_cents: pi.amount },
      });
      break;
    }
    case "charge.captured": {
      const charge = event.data.object as Stripe.Charge;
      await supabase
        .from("payments")
        .update({ status: "released", released_at: new Date().toISOString(), stripe_charge: charge.id })
        .eq("stripe_payment_intent", charge.payment_intent as string);
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      await supabase
        .from("payments")
        .update({ status: "refunded" })
        .eq("stripe_payment_intent", charge.payment_intent as string);
      break;
    }
    case "charge.dispute.created": {
      const dispute = event.data.object as Stripe.Dispute;
      await supabase
        .from("payments")
        .update({ status: "disputed" })
        .eq("stripe_charge", dispute.charge as string);
      break;
    }
    default:
      // Unhandled events are still recorded in stripe_events for audit.
      break;
  }

  return NextResponse.json({ ok: true });
}
