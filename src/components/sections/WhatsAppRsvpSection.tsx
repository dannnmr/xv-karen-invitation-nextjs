"use client";

import { useRef, useState, type CSSProperties, type FormEvent } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LaceFrame, trimmedAsset } from "@/components/ui/LaceFrame";
import { ASSETS, type InvitationConfig } from "@/config/invitation";

/**
 * Confirmación por WhatsApp (Karen no tiene RSVP automático): el invitado
 * escribe su nombre (obligatorio, a pedido: la familia necesita saber quién
 * confirma) y toca el único botón "Confirmar asistencia"; se abre WhatsApp
 * con el mensaje armado hacia el número de la familia. Mismo patrón que
 * `buildWhatsAppUrl` de gredmarie-xv-invitation (RSVPSection.tsx). Sin
 * botón de "no podré asistir" (pedido de la clienta). Sin backend: nada se
 * guarda en Supabase.
 * El formulario va sobre el encaje rectangular (`LaceFrame`), con el
 * corazón de encaje asomando detrás.
 */
function buildWhatsAppUrl(config: InvitationConfig, guestName: string) {
  const { name, eventType } = config.client;
  const message = `¡Hola! Soy ${guestName.trim()} y confirmo mi asistencia a los ${eventType} de ${name}.`;
  return `https://wa.me/${config.rsvp.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function WhatsAppRsvpSection({ config }: { config: InvitationConfig }) {
  const { colors } = config.theme;
  const [guestName, setGuestName] = useState("");
  // El aviso aparece solo después de intentar confirmar sin nombre (no
  // antes: un error en rojo de entrada se leería como algo roto).
  const [showError, setShowError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const missingName = !guestName.trim();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (missingName) {
      setShowError(true);
      inputRef.current?.focus();
      return;
    }
    window.open(
      buildWhatsAppUrl(config, guestName),
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <section className="relative py-20 px-6 flex flex-col items-center overflow-hidden">
      {/* En móvil el encaje es más ancho que la pantalla (el overflow de la
          sección recorta los bordes de encaje) para que la zona lisa tenga
          espacio para el formulario. */}
      <div className="relative w-[92vw] max-w-[560px] shrink-0">
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
            Confirmar antes del{" "}
            {config.rsvp.deadline.toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
            })}
          </p>

          <form onSubmit={handleSubmit} noValidate>
            <label
              htmlFor="guestName"
              className="block font-sans text-[0.7rem] md:text-xs uppercase tracking-[0.2em] font-semibold mb-2 text-center"
              style={{ color: colors.accent }}
            >
              Escribe tu nombre completo
            </label>
            {/* Campo en caja (no una línea fina): que se note que hay que
                llenarlo antes de confirmar. */}
            <input
              ref={inputRef}
              id="guestName"
              value={guestName}
              onChange={(e) => {
                setGuestName(e.target.value);
                if (showError) setShowError(false);
              }}
              placeholder="Ej. María Pérez"
              autoComplete="name"
              required
              aria-invalid={showError}
              aria-describedby={showError ? "guestNameError" : undefined}
              // `text-base` (16px): con menos, iOS Safari hace zoom al enfocar.
              className="w-full rounded-xl border-[1.5px] px-4 py-3 text-center font-display italic text-base shadow-inner focus:outline-none focus:ring-2 placeholder-black/35"
              style={
                {
                  color: colors.ink,
                  backgroundColor: "rgba(255,255,255,0.85)",
                  borderColor: showError ? "#B3261E" : colors.gold,
                  "--tw-ring-color": `${colors.gold}55`,
                } as CSSProperties
              }
            />
            <p
              id="guestNameError"
              role="alert"
              className="min-h-5 mt-1.5 mb-3 font-sans text-[0.65rem] text-center"
              style={{ color: "#B3261E" }}
            >
              {showError && "Por favor, escribe tu nombre para confirmar."}
            </p>

            <motion.button
              type="submit"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-sans text-[0.7rem] uppercase tracking-[0.25em] font-semibold shadow-md transition-opacity"
              style={{
                backgroundColor: colors.accent,
                color: colors.paper,
                boxShadow: `0 10px 22px ${colors.accent}40`,
                // Atenuado (no deshabilitado) sin nombre: sigue tocable para
                // mostrar el aviso de por qué no avanza.
                opacity: missingName ? 0.6 : 1,
              }}
            >
              <MessageCircle size={15} />
              Confirmar asistencia
            </motion.button>
          </form>
        </LaceFrame>
      </div>
    </section>
  );
}
