import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";

const WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const MAX_ATTEMPTS_PER_WINDOW = 5;

/**
 * Rate limiting persistente (tabla write_attempts) en vez de en memoria del
 * proceso -> sobrevive reinicios/despliegues. Best-effort: identifica al
 * visitante por IP (x-forwarded-for) cuando el hosting la expone; si no,
 * agrupa bajo un mismo bucket "desconocido" (más restrictivo, no menos).
 * Portado sin cambios de xv-andrea-carolina.
 *
 * `scope` debe venir ya namespaceado por invitación (ej. "karen:rsvp"),
 * porque write_attempts es una tabla COMPARTIDA entre varias invitaciones
 * en el mismo proyecto Supabase -- sin el prefijo, un visitante que pase
 * por dos invitaciones distintas contaría contra el límite de ambas.
 */
export async function checkRateLimit(scope: string) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "desconocido";
  const ipHash = createHash("sha256").update(ip).digest("hex");

  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const { count, error } = await supabase
    .from("write_attempts")
    .select("id", { count: "exact", head: true })
    .eq("scope", scope)
    .eq("ip_hash", ipHash)
    .gte("created_at", since);

  if (error) {
    // Si el ledger falla, no bloqueamos el envío legítimo por un problema
    // de infraestructura -- pero sí lo registramos para revisarlo.
    console.error("rateLimit: no se pudo verificar write_attempts", error);
    return { allowed: true, ipHash };
  }

  if ((count ?? 0) >= MAX_ATTEMPTS_PER_WINDOW) {
    return { allowed: false, ipHash };
  }

  return { allowed: true, ipHash };
}

export async function recordAttempt(scope: string, ipHash: string) {
  await supabase.from("write_attempts").insert({ scope, ip_hash: ipHash });
}
