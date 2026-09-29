"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LaceFrame, trimmedAsset } from "@/components/ui/LaceFrame";
import { ASSETS, type InvitationConfig } from "@/config/invitation";

/**
 * Confirmación por WhatsApp (Karen no tiene RSVP automático): el invitado
 * escribe su nombre (opcional) y elige "asistiré" / "no podré asistir"; se
 * abre WhatsApp con el mensaje armado hacia el número de la familia. Mismo
 * patrón que `buildWhatsAppUrl` de gredmarie-xv-invitation
 * (RSVPSection.tsx), con las dos respuestas explícitas de las demás
 * invitaciones. Sin backend: nada se guarda en Supabase.
 * El formulario va sobre el encaje rectangular (`LaceFrame`), con el
 * corazón de encaje asomando detrás.
 */
function buildWhatsAppUrl(
  config: InvitationConfig,
  guestName: string,
  attending: boolean,
) {
  const { name, eventType } = config.client;
  const who = guestName.trim() ? ` Soy ${guestName.trim()}.` : "";
  const message = attending
    ? `¡Hola! Confirmo mi asistencia a los ${eventType} de ${name}.${who}`
    : `¡Hola! Lamentablemente no podré asistir a los ${eventType} de ${name}.${who}`;
  return `https://wa.me/${config.rsvp.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function WhatsAppRsvpSection({ config }: { config: InvitationConfig }) {
  const { colors } = config.theme;
  const [guestName, setGuestName] = useState("");

  const open = (attending: boolean) =>
    window.open(
      buildWhatsAppUrl(config, guestName, attending),
      "_blank",
      "noopener,noreferrer",
    );

  return (
    <section className="relative py-20 px-6 flex flex-col items-center overflow-hidden">
      {/* En móvil el encaje es más ancho que la pantalla (el overflow de la
          sección recorta los bordes de encaje) para que la zona lisa tenga
          espacio para el formulario. */}
      <div className="relative w-[112vw] max-w-[560px] shrink-0">
        {/* Corazón de encaje asomando por detrás del marco (arriba a la
            derecha), inclinado. */}
        <div
          aria-hidden="true"
          className="absolute -top-14 right-[6%] md:-right-16 w-[130px] h-[118px] md:w-[170px] md:h-[154px] rotate-12 pointer-events-none"
        >
          <Image
            src={trimmedAsset(ASSETS.corazonEncaje, 400)}
            alt=""
            fill
            sizes="170px"
            className="object-contain"
          />
        </div>

        <LaceFrame
          src={config.visuals.rsvpFrame}
          // Zona lisa del asset (500x613): 16-82% del ancho, 16.6-83.3% del
          // alto. Con el aspect ratio fijo, el borde vertical (~20% del alto)
          // equivale a ~20% del ANCHO, que es la base del padding en %.
          // Si el contenido no entra, el aspect ratio cede y el marco crece.
          padding="22% 20% 22% 18%"
          className="aspect-[500/613] flex flex-col justify-center"
          fallbackColor={colors.paper}
        >
          <SectionHeader
            eyebrow="Reserva tu lugar"
            title="Confirma tu asistencia"
            colors={colors}
            className="mb-4"
            titleClassName="text-[2.2rem] md:text-[3rem] leading-[0.95]"
          />
          <p
            className="font-sans text-[0.65rem] md:text-xs tracking-[0.12em] uppercase mb-6 text-center"
            style={{ color: colors.ink, opacity: 0.75 }}
          >
            Por WhatsApp, antes del{" "}
            {config.rsvp.deadline.toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
            })}
          </p>

          <label
            htmlFor="guestName"
            className="block font-sans text-[0.6rem] uppercase tracking-[0.3em] font-medium mb-1"
            style={{ color: colors.accent }}
          >
            Tu nombre
          </label>
          <input
            id="guestName"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Ej. María Pérez"
            // `text-base` (16px): con menos, iOS Safari hace zoom al enfocar.
            className="w-full bg-transparent border-b focus:outline-none font-display italic text-base pb-1 mb-6 placeholder-black/30"
            style={{ color: colors.ink, borderColor: `${colors.gold}66` }}
          />

          <div className="flex flex-col gap-3">
            <motion.button
              type="button"
              onClick={() => open(true)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-sans text-[0.7rem] uppercase tracking-[0.25em] font-semibold shadow-md"
              style={{
                backgroundColor: colors.accent,
                color: colors.paper,
                boxShadow: `0 10px 22px ${colors.accent}40`,
              }}
            >
              <MessageCircle size={15} />
              Sí, asistiré
            </motion.button>
            <button
              type="button"
              onClick={() => open(false)}
              className="w-full py-3 rounded-full font-sans text-[0.65rem] uppercase tracking-[0.25em] border"
              style={{ color: colors.accent, borderColor: `${colors.gold}80` }}
            >
              No podré asistir
            </button>
          </div>
        </LaceFrame>
      </div>
    </section>
  );
}
