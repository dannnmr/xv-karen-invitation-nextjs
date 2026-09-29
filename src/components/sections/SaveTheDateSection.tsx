"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CalendarPlus, Heart } from "lucide-react";
import { getCalendarLinks } from "@/lib/calendar";
import { DecorationField } from "@/components/ui/DecorationField";
import { trimmedAsset } from "@/components/ui/LaceFrame";
import {
  ASSETS,
  type DecorationSpec,
  type InvitationConfig,
} from "@/config/invitation";

// Lirios con tallo (flores7, 400x536) "creciendo" desde abajo a los dos
// lados del calendario, en espejo -- enmarcan un contenido centrado y
// simétrico (vivían en Countdown; movidos acá a pedido explícito).
// Anclados abajo (nunca arriba: los tallos quedarían colgando) y SIN
// animación (una planta con tallo que flota se ve despegada del suelo).
// Dos composiciones: en móvil la tira de días ocupa todo el ancho -> los
// lirios van en las esquinas de la SECCIÓN, en el aire extra de `pb-32`
// bajo el botón; en desktop van pegados al bloque central (las esquinas de
// una sección de 1440px quedan desconectadas del contenido).
const FLORES7 = ASSETS.floresDoradas; // enredadera de flores doradas (353x770)
const lily = (
  position: "bottom-left" | "bottom-right",
  width: number,
  offset: { x: number; y: number },
): DecorationSpec => ({
  motif: "flower",
  tone: "accent",
  position,
  src: FLORES7,
  width,
  height: Math.round(width * 2.1),
  loop: "none",
  flipX: position === "bottom-right",
  offset,
});
const DECOR_MOBILE = [
  lily("bottom-left", 86, { x: -20, y: 30 }),
  lily("bottom-right", 86, { x: 20, y: 30 }),
];
const DECOR_DESKTOP = [
  lily("bottom-left", 110, { x: -170, y: 40 }),
  lily("bottom-right", 110, { x: 170, y: 40 }),
];

/**
 * "Agendar" (Save the Date), portado de xv-antonella a pedido explícito:
 * fecha/hora masivas + tira de 7 días con el día del evento marcado con un
 * corazón + botón de calendario. Reemplaza al "Agendar" que antes vivía
 * fusionado dentro del pase (TicketSection) -- el pase ahora es una sección
 * aparte, después de Regalos.
 * Sin el telón de flores de antonella (asset de esa clienta).
 * Karen: todo va escrito sobre la tarjeta de la mano con guante
 * (manoTarjeta, la misma ilustración de "Lluvia de sobres"). La tarjeta es
 * apaisada y baja, así que se quitó el título "Mes, año" repetido (ya
 * figura en la fecha) y los tamaños van en `cqw` de la tarjeta.
 */
export function SaveTheDateSection({ config }: { config: InvitationConfig }) {
  const { colors } = config.theme;
  const { date } = config.event;

  const handleAddToCalendar = () => {
    const isApple =
      /iPad|iPhone|iPod|Macintosh/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const { googleUrl, icsContent } = getCalendarLinks(
      date,
      `${config.client.eventType} — ${config.client.name}`,
      // Todos los lugares con su hora (boda: iglesia -> salón).
      config.event.venues
        .map((v) => `${v.time} ${v.label}: ${v.name}`)
        .join("\n"),
      // Nombre + dirección del PRIMER lugar (a dónde llegar): así Google/
      // Apple Calendar pueden geolocalizarlo en vez de una búsqueda ambigua.
      `${config.event.venues[0].name}, ${config.event.venues[0].address}`,
    );
    if (isApple) {
      // iOS Safari ignora `download` y no guarda un `data:` URI como .ics.
      // Un Blob abierto en pestaña nueva (sin `download`) sí lo previsualiza
      // con la opción nativa "Añadir a Calendario".
      const url = URL.createObjectURL(
        new Blob([icsContent], { type: "text/calendar;charset=utf-8" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } else {
      window.open(googleUrl, "_blank", "noopener,noreferrer");
    }
  };

  const day = date.getDate();
  const rawMonth = date.toLocaleDateString("es-ES", { month: "long" });
  const monthName = rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1);
  const year = date.getFullYear();

  const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(date);
    d.setDate(d.getDate() + (i - 3));
    return d;
  });

  return (
    <section className="relative flex flex-col items-center justify-center pt-12 pb-10 px-6 overflow-hidden">
      <DecorationField
        decorations={DECOR_MOBILE}
        colors={colors}
        wrapperClassName="absolute inset-0 pointer-events-none z-0 md:hidden"
      />

      {/* Todo el contenido va SOBRE la tarjeta que sostiene la mano
          (manoTarjeta, 862x1436 recortada). Solo se muestra el 55% de
          arriba del dibujo (tarjeta + dedos), desvanecido hacia abajo: la
          mano entera hacía la sección enorme. */}
      <div className="relative z-10 w-[80vw] max-w-[360px] aspect-[862/790] shrink-0">
        <DecorationField
          decorations={DECOR_DESKTOP}
          colors={colors}
          wrapperClassName="absolute inset-0 pointer-events-none -z-10 hidden md:block"
        />
        <Image
          src={trimmedAsset(ASSETS.manoTarjeta, 900)}
          alt=""
          fill
          sizes="(max-width: 768px) 80vw, 360px"
          className="object-cover object-top"
          style={{
            maskImage: "linear-gradient(to bottom, #000 72%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, #000 72%, transparent)",
          }}
        />

        {/* Zona útil de la tarjeta (medida sobre el asset completo): 0-96.5%
            del ancho y 0-34.5% del alto, con el pulgar asomando desde ~30%
            -> sobre el 55% visible: top 4.5%, alto 50%.
            `@container`: los tamaños van en `cqw` y escalan con la tarjeta. */}
        <div className="@container absolute left-[4%] w-[88%] top-[4.5%] h-[50%] flex flex-col items-center justify-center">
          <p
            className="font-mono text-[3.4cqw] uppercase tracking-[0.4em] mb-[2cqw]"
            style={{ color: colors.accent }}
          >
            Cuándo
          </p>
          <div
            className="flex items-end justify-center gap-[2.5cqw] mb-[3cqw]"
            style={{ color: colors.accent }}
          >
            <span className="font-sans text-[13cqw] font-bold tracking-tighter leading-[0.8]">
              {day}
            </span>
            <div className="flex flex-col items-start pb-[0.5cqw]">
              <span className="font-sans text-[4.6cqw] uppercase tracking-[0.2em] font-light capitalize">
                {monthName}
              </span>
              <span className="font-sans text-[2.4cqw] tracking-[0.5em] font-bold opacity-80">
                {year}
              </span>
            </div>
            <div
              className="w-px h-[10cqw] mx-[1.5cqw]"
              style={{
                background: `linear-gradient(to bottom, transparent, ${colors.accent}40, transparent)`,
              }}
            />
            <span className="font-script text-[8cqw] whitespace-nowrap">
              {config.event.startTime}
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center items-end gap-[3cqw] w-full"
          >
            {daysOfWeek.map((d, i) => {
              const isTarget = i === 3;
              const dayName = d
                .toLocaleDateString("es-ES", { weekday: "short" })
                .slice(0, 2)
                .toLowerCase();
              return (
                <div key={i} className="flex flex-col items-center relative">
                  <span
                    className="font-serif text-[3.4cqw] mb-[1.2cqw]"
                    style={{ color: colors.ink, opacity: 0.6 }}
                  >
                    {dayName}
                  </span>
                  <div className="relative flex items-center justify-center w-[8.5cqw] h-[8.5cqw]">
                    {isTarget ? (
                      <>
                        <Heart
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[13cqw] h-[13cqw] fill-current drop-shadow-md"
                          style={{ color: colors.accent }}
                          strokeWidth={0}
                        />
                        <span className="relative z-10 font-serif text-[5.6cqw] text-white font-medium">
                          {d.getDate()}
                        </span>
                      </>
                    ) : (
                      <span
                        className="font-serif text-[5cqw] font-medium"
                        style={{ color: colors.ink, opacity: 0.75 }}
                      >
                        {d.getDate()}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            onClick={handleAddToCalendar}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.97 }}
            className="group flex items-center gap-[2cqw] px-[6cqw] py-[2cqw] rounded-full border-[1.5px] mt-[4cqw] shadow-md hover:shadow-lg transition-shadow duration-300"
            style={{
              backgroundColor: "transparent",
              borderColor: colors.accent,
              color: colors.accent,
            }}
          >
            <CalendarPlus className="w-[4.4cqw] h-[4.4cqw] transition-transform group-hover:scale-110" />
            <span className="font-serif italic tracking-wide text-[3.8cqw]">
              Agendar en calendario
            </span>
          </motion.button>
        </div>
      </div>
    </section>
  );
}
