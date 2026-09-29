"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useCountdown } from "@/hooks/useCountdown";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { trimmedAsset } from "@/components/ui/LaceFrame";
import { ASSETS, type InvitationConfig } from "@/config/invitation";

/**
 * Rediseño estilo gredmarie: título en script sólido (`SectionHeader`,
 * variante por defecto -- el trazo hueco quedó reservado solo para
 * Ubicación, a pedido explícito) + cápsulas de tiempo tipo "pastilla"
 * redondeada. Dos decisiones se apartan a propósito del
 * original de gredmarie, por reglas de rendimiento ya documentadas de este
 * proyecto (ver invitation-master/reference.md):
 *  - Cápsulas con fondo CASI SÓLIDO, no `bg-white/5 backdrop-blur-md`: el
 *    número se re-renderiza cada segundo (`useCountdown`/`setInterval`) --
 *    combinar eso con `backdrop-filter` repinta el blur en cada tick,
 *    carísimo en iOS Safari (hallazgo ya documentado, mismo motivo por el
 *    que el botón de música usa fondo casi sólido). Se mantiene el mismo
 *    tratamiento casi sólido que ya tenía esta sección antes del rediseño.
 * Sin la bola de disco de la base clonada (tema NY ajeno a esta
 * invitación). El taxi SÍ vuelve, pero con el auto propio de esta
 * invitación (el de "Hasta Pronto" del itinerario), a pedido explícito.
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

  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  // En `vw` (no `%`): `x` es un `transform` (compositor-only, sin reflow),
  // y `translateX(%)` es relativo al ANCHO DEL PROPIO ELEMENTO, no al de la
  // sección -- `vw` sí cruza la pantalla completa.
  // Auto "Just Married" (config.visuals.countdownCar) cruzando la sección
  // atado al scroll -- réplica del taxi de xv-andrea-carolina. El auto de
  // la acuarela MIRA A LA IZQUIERDA -> cruza de derecha a izquierda.
  const carImage = config.visuals.countdownCar;
  const carX = useTransform(scrollYProgress, [0, 1], ["110vw", "-35vw"]);

  return (
    <section
      ref={containerRef}
      // Sin auto (asset pendiente), sin "calle" vacía abajo.
      className={`relative pt-5 ${carImage ? "pb-34 md:pb-40" : "pb-16"} px-4 flex flex-col items-center overflow-hidden`}
    >
      {/* Resplandor central ("efecto discoteca" de gredmarie), en plateado
          en vez de dorado -- coherente con el acento de esta invitación. */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[600px] md:h-[600px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${colors.accentSoft}26 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto w-full flex flex-col items-center">
        {/* Máscara veneciana (con plumas y cintas) apoyada junto al título,
            inclinada: el guiño de "baile de máscaras" de la temática. */}
        <div
          aria-hidden="true"
          className="absolute top-8 -right-5 md:top-2 md:right-4 w-[64px] h-[66px] md:w-[120px] md:h-[123px] rotate-[14deg] pointer-events-none"
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
          className="mb-10"
          titleClassName="text-[2.75rem] md:text-[4.5rem] leading-[0.9] whitespace-nowrap"
        />

        {/* Separadores ":" entre unidades (como un reloj). El ":" mide lo
            mismo de alto que la cápsula y se centra contra ella, no contra
            la etiqueta de abajo. */}
        <div className="flex justify-center items-start gap-4 md:gap-2">
          {units.map((u, i) => (
            <div key={u.label} className="flex items-start gap-1 md:gap-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center group"
              >
                <div
                  className="relative w-16 h-[5.5rem] md:w-24 md:h-32 rounded-[2rem] shadow-lg border flex items-center justify-center mb-3 overflow-hidden transition-transform duration-300 group-hover:-translate-y-2"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.85)",
                    borderColor: "rgba(255,255,255,0.7)",
                  }}
                >
                  {/* Brillo interior sutil (esquina superior), look "liquid
                      glass" -- radial-gradient, no `blur()` en un div aparte
                      (serían dos capas costosas en vez de una). */}
                  <div
                    className="absolute -top-4 -left-4 w-14 h-14 rounded-full pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(255,255,255,0.35) 0%, transparent 70%)",
                    }}
                  />
                  {/* Texto estilo xv-sofia-salome (pedido explícito): número
                      en serif display de peso normal (acá Cormorant, la
                      display de esta invitación) y etiqueta en versalita
                      mono fina, sin pastilla. */}
                  <span
                    className="relative z-10 font-display text-4xl md:text-6xl font-medium leading-none tabular-nums lining-nums"
                    style={{ color: colors.accent }}
                  >
                    {String(u.value).padStart(2, "0")}
                  </span>
                </div>
                <span
                  className="font-mono text-[0.55rem] md:text-[0.65rem] uppercase tracking-[0.25em]"
                  style={{ color: colors.leaf }}
                >
                  {u.label}
                </span>
              </motion.div>
              {i < units.length - 1 && (
                <span
                  aria-hidden="true"
                  className="font-display text-2xl md:text-5xl leading-none select-none h-[5.5rem] md:h-32 flex items-center"
                  style={{ color: colors.accent, opacity: 0.55 }}
                >
                  :
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Auto cruzando la sección por la "calle" de abajo (`pb-36/40`),
          atado al scroll (transform, no `left` -- compositor-only, evita el
          reflow que causaría animar layout). Proporción del asset ~0.9. */}
      {carImage && (
        <motion.div
          aria-hidden="true"
          style={{ x: carX }}
          className="absolute bottom-2 left-0 w-[120px] h-[125px] md:w-[150px] md:h-[160px] z-10 pointer-events-none"
        >
          <Image
            src={carImage}
            alt=""
            fill
            sizes="(max-width: 768px) 120px, 150px"
            className="object-contain"
          />
        </motion.div>
      )}
    </section>
  );
}
