"use server";

import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { checkRateLimit, recordAttempt } from "@/lib/rateLimit";
import { invitationConfig } from "@/config/invitation";

const TABLE = "musica_karen";
const RATE_LIMIT_SCOPE = `${invitationConfig.id}:music`;

const musicSchema = z.object({
  cancion: z.string().trim().min(2, "Escribe una canción").max(150),
  sitioWeb: z.string().max(0).optional().or(z.literal("")), // honeypot
});

export type MusicFormState = { status: "idle" | "success" | "error"; message?: string };

export async function suggestSong(_prev: MusicFormState, formData: FormData): Promise<MusicFormState> {
  const parsed = musicSchema.safeParse({
    cancion: formData.get("cancion"),
    sitioWeb: formData.get("sitioWeb") ?? "",
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Revisa el formulario" };
  }
  if (parsed.data.sitioWeb) {
    return { status: "success" };
  }

  const { allowed, ipHash } = await checkRateLimit(RATE_LIMIT_SCOPE);
  if (!allowed) {
    return { status: "error", message: "Demasiados intentos. Intenta de nuevo en unos minutos." };
  }
  await recordAttempt(RATE_LIMIT_SCOPE, ipHash);

  const { error } = await supabase.from(TABLE).insert({ cancion: parsed.data.cancion });
  if (error) {
    console.error(`suggestSong: error de Supabase [${error.code}] ${error.message}`);
    return { status: "error", message: "No se pudo enviar. Intenta de nuevo en un momento." };
  }

  return { status: "success" };
}
