// Placeholder. Regenerate with `pnpm db:types` once Supabase local stack runs.
// Intentionally permissive so the supabase-js client does not collapse
// every row to `never` while we scaffold.

/* eslint-disable @typescript-eslint/no-explicit-any */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Row = Record<string, any>;

export interface Database {
  public: {
    Tables: {
      [table: string]: {
        Row: Row;
        Insert: Row;
        Update: Row;
        Relationships: [];
      };
    };
    Views: {
      [view: string]: { Row: Row };
    };
    Functions: Record<string, { Args: Row; Returns: Row }>;
    Enums: Record<string, string>;
    CompositeTypes: Record<string, Row>;
  };
}
