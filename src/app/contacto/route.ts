import { after, NextResponse, type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { invitationConfig } from "@/config/invitation";

/**
 * Botón "Escribir" del footer -> /contacto -> WhatsApp.
 *
 * Registra el TOQUE (invitación + dispositivo + hora) en `contact_clicks`
 * (supabase/contact-clicks.sql, tabla compartida entre invitaciones) y
 * redirige a WhatsApp con el mensaje de siempre, SIN cambios (pedido
 * explícito). Rastrear el toque y no el texto: la persona puede editar o
 * borrar el mensaje antes de enviarlo, el toque ya quedó registrado.
 */
const WHATSAPP_URL =
  "https://wa.me/59168183484?text=Hola%20Daniela!%20Me%20gustar%C3%ADa%20saber%20m%C3%A1s%20sobre%20tus%20dise%C3%B1os%20de%20invitaciones%20digitales.";

// Crawlers / generadores de previews: no son personas, no cuentan.
const BOT_UA =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|discord|slack|headless/i;

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";

  if (!BOT_UA.test(ua)) {
    const device = /Mobi|Android|iPhone|iPad|iPod/i.test(ua)
      ? "movil"
      : "escritorio";
    // `after`: el insert corre DESPUÉS de enviar la redirección -> la
    // persona llega a WhatsApp sin esperar a la base de datos. Si el
    // registro falla, se loguea y el contacto no se pierde.
    after(async () => {
      const { error } = await supabase
        .from("contact_clicks")
        .insert({ invitation: invitationConfig.id, device });
      // Campos explícitos: el objeto de error de Supabase se serializa
      // como `{}` en los logs del servidor y no dice nada.
      if (error) {
        console.error(
          `contacto: no se pudo registrar el toque [${error.code}] ${error.message}`,
        );
      }
    });
  }

  return NextResponse.redirect(WHATSAPP_URL, 302);
}
