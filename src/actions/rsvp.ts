"use server";

import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { checkRateLimit, recordAttempt } from "@/lib/rateLimit";
import { invitationConfig } from "@/config/invitation";

// Tabla namespaceada por invitación (no un sufijo numérico "adivinado":
// en el proyecto compartido `invitados3` ya existía con otra forma --
// lección del 2026-09-03). Ver supabase/schema.sql.
const TABLE = "invitados_karen";
const RATE_LIMIT_SCOPE = `${invitationConfig.id}:rsvp`;

// 1 pase por confirmación: solo nombre + sí/no, sin columna de pases.
const rsvpSchema = z.object({
  nombre: z.string().trim().min(2, "Escribe tu nombre completo").max(120),
  asistencia: z.enum(["si", "no"], { message: "Indica si asistirás" }),
  // Honeypot: campo invisible para personas, atractivo para bots.
  // Si llega con contenido, se descarta en silencio (no se le dice al bot que falló).
  sitioWeb: z.string().max(0).optional().or(z.literal("")),
});

export type RsvpFormState = {
  status: "idle" | "success" | "error" | "closed";
  message?: string;
};

export async function submitRsvp(_prev: RsvpFormState, formData: FormData): Promise<RsvpFormState> {
  // Cierre por fecha límite (pedido de la clienta). El form ya se oculta
  // en el cliente; esto cubre una pestaña abierta desde antes del cierre.
  // La policy de insert de la tabla repite el corte como última capa.
  if (Date.now() > invitationConfig.rsvp.deadline.getTime()) {
    return { status: "closed" };
  }

  const raw = {
    nombre: formData.get("nombre"),
    asistencia: formData.get("asistencia"),
    sitioWeb: formData.get("sitioWeb") ?? "",
  };

  const parsed = rsvpSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Revisa el formulario" };
  }

  // Honeypot lleno -> probablemente un bot. Respondemos "éxito" para no
  // darle señal útil, pero no insertamos nada.
  if (parsed.data.sitioWeb) {
    return { status: "success" };
  }

  const { allowed, ipHash } = await checkRateLimit(RATE_LIMIT_SCOPE);
  if (!allowed) {
    return { status: "error", message: "Demasiados intentos. Intenta de nuevo en unos minutos." };
  }
  await recordAttempt(RATE_LIMIT_SCOPE, ipHash);

  const { error } = await supabase.from(TABLE).insert({
    nombre: parsed.data.nombre,
    asistencia: parsed.data.asistencia,
  });

  if (error) {
    // Campos explícitos: el objeto de error de Supabase se serializa como
    // `{}` en los logs del servidor.
    console.error(`submitRsvp: error de Supabase [${error.code}] ${error.message}`);
    return { status: "error", message: "No se pudo enviar. Intenta de nuevo en un momento." };
  }

  return { status: "success" };
}
