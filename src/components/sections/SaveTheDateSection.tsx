"use client";

import { motion } from "framer-motion";
import { CalendarPlus, Heart } from "lucide-react";
import { getCalendarLinks } from "@/lib/calendar";
import { DecorationField } from "@/components/ui/DecorationField";
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
    <section className="relative flex flex-col items-center justify-center pt-16 pb-32 md:pb-16 px-6 overflow-hidden">
      <DecorationField
        decorations={DECOR_MOBILE}
        colors={colors}
        wrapperClassName="absolute inset-0 pointer-events-none z-0 md:hidden"
      />

      <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center">
        <DecorationField
          decorations={DECOR_DESKTOP}
          colors={colors}
          wrapperClassName="absolute inset-0 pointer-events-none -z-10 hidden md:block"
        />
        <p
          className="font-mono text-xs uppercase tracking-[0.4em] mb-4"
          style={{ color: colors.accent }}
        >
          Cuándo
        </p>
        <div
          className="flex items-end justify-center gap-3 mb-4"
          style={{ color: colors.accent }}
        >
          <span className="font-sans text-6xl md:text-7xl font-bold tracking-tighter leading-[0.8]">
            {day}
          </span>
          <div className="flex flex-col items-start pb-1">
            <span className="font-sans text-base md:text-xl uppercase tracking-[0.2em] font-light capitalize">
              {monthName}
            </span>
            <span className="font-sans text-[0.55rem] md:text-xs tracking-[0.5em] font-bold opacity-80">
              {year}
            </span>
          </div>
          <div
            className="w-px h-10 md:h-14 mx-2"
            style={{
              background: `linear-gradient(to bottom, transparent, ${colors.accent}40, transparent)`,
            }}
          />
          <span className="font-script text-3xl md:text-4xl whitespace-nowrap">
            {config.event.startTime}
          </span>
        </div>

        <div
          className="w-16 h-px my-6"
          style={{ backgroundColor: `${colors.accent}30` }}
        />

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-script text-4xl md:text-5xl text-center"
          style={{ color: colors.accent }}
        >
          {monthName}, {year}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex justify-center items-end gap-2 md:gap-4 mt-8 w-full"
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
                  className="font-serif text-xs md:text-base mb-2"
                  style={{ color: colors.ink, opacity: 0.6 }}
                >
                  {dayName}
                </span>
                <div className="relative flex items-center justify-center w-9 h-9 md:w-14 md:h-14">
                  {isTarget ? (
                    <>
                      <Heart
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 md:w-20 md:h-20 fill-current drop-shadow-md"
                        style={{ color: colors.accent }}
                        strokeWidth={0}
                      />
                      <span className="relative z-10 font-serif text-xl md:text-3xl text-white font-medium">
                        {d.getDate()}
                      </span>
                    </>
                  ) : (
                    <span
                      className="font-serif text-lg md:text-2xl font-medium"
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
          className="group flex items-center gap-3 px-8 py-3 rounded-full border-[1.5px] mt-10 shadow-md hover:shadow-lg transition-shadow duration-300"
          style={{
            backgroundColor: "transparent",
            borderColor: colors.accent,
            color: colors.accent,
          }}
        >
          <CalendarPlus
            size={18}
            className="transition-transform group-hover:scale-110"
          />
          <span className="font-serif italic tracking-wide text-sm md:text-base">
            Agendar en calendario
          </span>
        </motion.button>
      </div>
    </section>
  );
}
