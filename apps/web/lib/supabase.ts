import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// NB: we intentionally do not pass a `Database` generic yet — the placeholder
// type in packages/shared-types collapses every row to `never` in supabase-js.
// Regenerate with `pnpm db:types` and re-introduce the generic once real types exist.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (items: { name: string; value: string; options: CookieOptions }[]) => {
          try {
            items.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // called from a Server Component; Next forbids cookie writes there
          }
        },
      },
    }
  );
}
