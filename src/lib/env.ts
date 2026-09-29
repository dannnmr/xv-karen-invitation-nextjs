import { z } from "zod";

/**
 * Validación centralizada de variables de entorno.
 *
 * Regla (ver ~/.claude/CLAUDE.md y la skill invitation-master):
 * no leer `process.env.*` disperso en componentes/config — todo pasa por aquí.
 * Solo se valida lo que los módulos activos de ESTA invitación necesitan
 * (RSVP + Gallery + Music dependen de Supabase).
 */
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url(
      "NEXT_PUBLIC_SUPABASE_URL debe ser una URL válida del proyecto Supabase",
    ),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY es requerida"),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

if (!parsed.success) {
  // Falla rápido y explícito en vez de dejar que Supabase falle silenciosamente
  // más abajo con un cliente inicializado con '' (ese fue un defecto real
  // encontrado en los 4 proyectos de referencia).
  const issues = parsed.error.issues
    .map((i) => `- ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(
    `Variables de entorno inválidas o faltantes:\n${issues}\n\n` +
      `Copia .env.local.example a .env.local y completa los valores del proyecto Supabase de esta invitación.`,
  );
}

export const env = parsed.data;
