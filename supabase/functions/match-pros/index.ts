// Supabase Edge Function: match-pros
// Trigger: pg_cron every 5 minutes, or direct call after job insert.
// Behavior: finds pros within radius for every new pending job and inserts notifications.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async () => {
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, category_id, geo, created_at")
    .eq("status", "pending")
    .gte("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString());

  if (!jobs?.length) return new Response("no jobs", { status: 200 });

  for (const job of jobs) {
    // Use a SQL function for the geo match (defined in a later migration).
    const { data: pros } = await supabase.rpc("find_pros_for_job", { p_job_id: job.id });
    if (!pros?.length) continue;
    const rows = pros.map((p: { profile_id: string }) => ({
      profile_id: p.profile_id,
      channel: "push" as const,
      payload: { type: "new_job", job_id: job.id },
    }));
    await supabase.from("notifications").insert(rows);
  }

  return new Response(JSON.stringify({ ok: true, count: jobs.length }));
});
