"use client";

import { useRef } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { useCountdown } from "@/hooks/useCountdown";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { trimmedAsset } from "@/components/ui/LaceFrame";
import { ASSETS, type InvitationConfig } from "@/config/invitation";

/**
 * Cuenta regresiva con la estética barroca/victoriana de Karen:
 *  - Cada unidad es una VENTANA ARQUEADA (arco de medio punto arriba, como
 *    los ventanales de un palacio) con doble filete dorado: borde exterior
 *    en `gold` + filete interior hecho con `box-shadow inset` (una sola
 *    capa, sin divs extra).
 *  - Ornamento dorado (el mismo de Padres) arriba del contador y espejado
 *    abajo: enmarca el reloj como una cartela.
 *  - Separadores en rombo dorado en vez de ":" (más joya, menos reloj
 *    digital).
 *  - Los dígitos entran deslizándose al cambiar (`AnimatePresence` con
 *    `key` = valor), recortados por la ventana.
 *  - Debajo, la fecha y hora completas entre filetes.
 * Fondo de las ventanas CASI SÓLIDO (no `backdrop-blur`): el número se
 * re-renderiza cada segundo y el blur se repintaría en cada tick (caro en
 * iOS Safari -- ver invitation-master/reference.md).
 * El auto (`countdownCar`) sigue opcional, cruzando atado al scroll.
 */
export function CountdownSection({ config }: { config: InvitationConfig }) {
  const { colors } = config.theme;
  const { days, hours, minutes, seconds } = useCountdown(config.event.date);
  const units = [
    { label: "Días", value: days },
    { label: "Horas", value: hours },
    { label: "Minutos", value: minutes },
    { label: "Segundos", value: seconds },
  ];

  const rawDate = config.event.date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const fullDate = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);

  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  // En `vw` (no `%`): `x` es un `transform` (compositor-only, sin reflow),
  // y `translateX(%)` es relativo al ANCHO DEL PROPIO ELEMENTO, no al de la
  // sección -- `vw` sí cruza la pantalla completa. El auto de la acuarela
  // MIRA A LA IZQUIERDA -> cruza de derecha a izquierda.
  const carImage = config.visuals.countdownCar;
  const carX = useTransform(scrollYProgress, [0, 1], ["110vw", "-35vw"]);

  const ornament = trimmedAsset(ASSETS.ornamento, 600);

  return (
    <section
      ref={containerRef}
      // Sin auto (asset pendiente), sin "calle" vacía abajo.
      className={`relative pt-5 ${carImage ? "pb-34 md:pb-40" : "pb-16"} px-4 flex flex-col items-center overflow-hidden`}
    >
      {/* Resplandor cálido detrás del contador. */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vw] md:w-[640px] md:h-[640px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${colors.gold}1f 0%, ${colors.accentSoft}14 40%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto w-full flex flex-col items-center">
        {/* Máscara veneciana (con plumas y cintas) apoyada junto al título,
            inclinada: el guiño de "baile de máscaras" de la temática. */}
        <div
          aria-hidden="true"
          className="absolute top-8 -right-5 md:top-2 md:right-4 w-[114px] h-[116px] md:w-[120px] md:h-[123px] rotate-[14deg] pointer-events-none"
        >
          <Image
            src={trimmedAsset(ASSETS.mascaraNegra, 400)}
            alt=""
            fill
            sizes="140px"
            className="object-contain"
          />
        </div>
        <SectionHeader
          eyebrow="Empieza la cuenta"
          title="Falta muy poco"
          colors={colors}
          className="mb-6"
          titleClassName="text-[2.75rem] md:text-[4.5rem] leading-[0.9] whitespace-nowrap"
        />

        {/* Ornamento superior (asset 574x135 recortado). */}
        <div
          aria-hidden="true"
          className="relative w-[210px] md:w-[300px] aspect-[574/135] mb-5 pointer-events-none"
        >
          <Image
            src={ornament}
            alt=""
            fill
            sizes="300px"
            className="object-contain"
          />
        </div>

        <div className="flex justify-center items-start gap-1.5 md:gap-4">
          {units.map((u, i) => (
            <div key={u.label} className="flex items-start gap-1.5 md:gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="flex flex-col items-center"
              >
                {/* Ventana arqueada con doble filete dorado. */}
                <div
                  className="relative w-16 h-24 md:w-28 md:h-40 rounded-t-full rounded-b-2xl border-[1.5px] flex items-center justify-center overflow-hidden pt-3 md:pt-5"
                  style={{
                    borderColor: colors.gold,
                    background: `linear-gradient(to bottom, ${colors.paper}f5, ${colors.accentSoft}e6)`,
                    boxShadow: `inset 0 0 0 3px ${colors.paper}, inset 0 0 0 4px ${colors.gold}66, 0 10px 24px rgba(59,47,32,0.14)`,
                  }}
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span
                      key={u.value}
                      initial={{ y: "-60%", opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: "60%", opacity: 0 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="font-display text-[2.1rem] md:text-6xl font-medium leading-none tabular-nums lining-nums"
                      style={{ color: colors.accent }}
                    >
                      {String(u.value).padStart(2, "0")}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <span
                  className="mt-2.5 font-display italic text-[0.8rem] md:text-lg tracking-wide"
                  style={{ color: colors.ink, opacity: 0.8 }}
                >
                  {u.label}
                </span>
              </motion.div>
              {i < units.length - 1 && (
                // Rombo dorado centrado contra la ventana (misma altura).
                <span
                  aria-hidden="true"
                  className="h-24 md:h-40 flex items-center pt-3 md:pt-5"
                >
                  <span
                    className="block w-1.5 h-1.5 md:w-2 md:h-2 rotate-45"
                    style={{ backgroundColor: colors.gold }}
                  />
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Ornamento inferior: el mismo, espejado en vertical. */}
        <div
          aria-hidden="true"
          className="relative w-[210px] md:w-[300px] aspect-[574/135] mt-6 -scale-y-100 pointer-events-none"
        >
          <Image
            src={ornament}
            alt=""
            fill
            sizes="300px"
            className="object-contain"
          />
        </div>

        {/* Fecha y hora completas entre filetes dorados. */}
        <div className="flex items-center gap-3 mt-4 w-full max-w-md">
          <span
            className="flex-1 h-px"
            style={{
              background: `linear-gradient(to right, transparent, ${colors.gold})`,
            }}
          />
          <p
            className="font-display italic text-sm md:text-lg text-center"
            style={{ color: colors.accent }}
          >
            {fullDate}
            <span className="mx-2" style={{ color: colors.gold }}>
              ·
            </span>
            {config.event.startTime}
          </p>
          <span
            className="flex-1 h-px"
            style={{
              background: `linear-gradient(to left, transparent, ${colors.gold})`,
            }}
          />
        </div>
      </div>
    </section>
  );
}
