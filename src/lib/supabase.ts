import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Cliente Supabase compartido (browser + Server Actions + /contacto).
 * Usa la anon key a propósito — es pública por diseño; la protección real
 * vive en las policies RLS de cada tabla (ver supabase/schema.sql) y, para
 * RSVP y Música, en la validación de las Server Actions (src/actions/),
 * no en mantener esta key en secreto.
 */
export const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
