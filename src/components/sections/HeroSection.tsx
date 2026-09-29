"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { trimmedAsset } from "@/components/ui/LaceFrame";
import { ASSETS, type InvitationConfig } from "@/config/invitation";

/**
 * Hero de Karen: un "escenario" barroco con los 7 assets que la clienta
 * pidió sí o sí, cada uno ubicado según su forma real:
 *  - Cortina drapeada (cortina) a todo el ancho arriba: enmarca la escena
 *    como un telón.
 *  - Candelabro colgando del borde superior al centro, con un balanceo leve.
 *  - Marco oval dorado (cuadro dorado) = retrato: el nombre va DENTRO.
 *  - Escalera de palacio como base/escenario, anclada abajo al centro.
 *  - Ornamentos dorados (borde, una esquina en L) en las dos esquinas
 *    inferiores, espejados.
 *  - Vela y paraguas de encaje a los lados de la escalera (objetos "del
 *    salón", apoyados en el piso).
 * Sin foto de fondo propia: la textura global de la invitación (page.tsx)
 * se ve detrás. La frase de la clienta vive en su propia sección
 * (QuoteSection, sobre el pergamino) para dejar libre la escalera.
 *
 * Todos los assets pasan por `trimmedAsset` (Cloudinary `e_trim`): quita el
 * aire transparente del lienzo, así cada caja mide lo que mide el dibujo.
 */
const T = (url: string) => trimmedAsset(url, 900);

export function HeroSection({
  config,
  isRevealed,
}: {
  config: InvitationConfig;
  isRevealed: boolean;
}) {
  const { colors } = config.theme;
  const sectionRef = useRef<HTMLElement>(null);
  // Pausa el balanceo del candelabro cuando el Hero sale de pantalla.
  const inView = useInView(sectionRef, { margin: "200px 0px" });

  const reveal = (delay: number, from: { x?: number; y?: number } = {}) => ({
    initial: { opacity: 0, ...from },
    animate: isRevealed ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...from },
    transition: { duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <section
      ref={sectionRef}
      className="relative min-h-svh w-full overflow-hidden"
    >
      {/* Cortina: más ancha que la pantalla (anclada a la derecha, sobra
          por la izquierda y la recorta el overflow de la sección) para que
          no asome el fondo. Por encima de todo lo demás (telón). `max-h`
          evita que en desktop cubra la pantalla entera; ahí `object-cover`
          recorta desde arriba. */}
      <motion.div
        {...reveal(0.1, { y: -30 })}
        className="absolute -top-10 -right-10 z-30 w-[125vw] max-h-[80svh] aspect-[484/505] pointer-events-none"
      >
        <Image
          src={T(ASSETS.cortina)}
          alt=""
          fill
          loading="eager"
          sizes="125vw"
          className="object-cover object-top-right"
        />
      </motion.div>

      {/* Candelabro colgando del borde superior, balanceo leve desde la
          cadena (origen arriba). */}
      <motion.div
        {...reveal(0.3, { y: -60 })}
        // Por ENCIMA de la cortina (z-35): a todo el ancho lo taparía.
        className="absolute -top-10 left-1/2 -translate-x-1/2 z-[35] pointer-events-none"
      >
        <motion.div
          animate={inView ? { rotate: [-1.5, 1.5, -1.5] } : { rotate: 0 }}
          transition={
            inView
              ? { duration: 6, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0 }
          }
          style={{ transformOrigin: "top center" }}
          className="relative w-[222px] h-[244px] md:w-[210px] md:h-[252px]"
        >
          <Image
            src={T(ASSETS.candelabro)}
            alt=""
            fill
            loading="eager"
            sizes="(max-width: 768px) 150px, 230px"
            className="object-contain object-top"
          />
        </motion.div>
      </motion.div>

      {/* Escalera: escenario, corrida a la izquierda y un poco por debajo
          del borde (la base queda recortada) para dejar el lado derecho a
          la vela y el paraguas. z-31: por ENCIMA de la cortina (z-30), por
          debajo del candelabro (z-35) y del retrato (z-40). */}
      <motion.div
        {...reveal(0.2, { x: 40, y: 40 })}
        className="absolute -bottom-[1%] left-[22%] -translate-x-1/2 z-[31] w-[65vw] max-w-[520px] aspect-square pointer-events-none"
      >
        <Image
          src={T(ASSETS.escaleras)}
          alt=""
          fill
          loading="eager"
          sizes="(max-width: 768px) 65vw, 520px"
          className="object-contain object-bottom"
        />
      </motion.div>

      {/* Ornamentos dorados en las esquinas inferiores (el asset ES una
          esquina: vértice abajo-izquierda). */}

      <div className="absolute -bottom-5 -right-6 z-1  w-[94vw] max-w-[260px] aspect-[500/512] pointer-events-none">
        <Image
          src={ASSETS.borde}
          alt=""
          fill
          loading="eager"
          sizes="(max-width: 768px) 34vw, 260px"
          className="object-contain object-left-bottom"
        />
      </div>

      {/* Vela y paraguas, los dos del lado derecho de la escalera (la vela
          más adentro, el paraguas contra el borde). */}

      <motion.div
        {...reveal(0.5, { x: 20 })}
        className="absolute z-20 -right-[2%] md:right-[16%] bottom-[4%] md:bottom-[9%] w-[180px] h-[184px] md:w-[190px] md:h-[196px] pointer-events-none"
        style={{ rotate: "-65deg" }}
      >
        <Image
          src={T(ASSETS.paraguas)}
          alt=""
          fill
          loading="eager"
          sizes="(max-width: 768px) 120px, 190px"
          className="object-contain object-bottom"
        />
      </motion.div>

      {/* Retrato: marco oval dorado con el nombre adentro. Centrado un poco
          por encima del medio (la escalera ocupa el tercio inferior). */}
      <div className="absolute inset-x-0 top-[22%] md:top-[24%] z-40 flex justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={
            isRevealed ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }
          }
          transition={{
            duration: 1.2,
            delay: 0.35,
            type: "spring",
            bounce: 0.2,
          }}
          className="relative w-[76vw] max-w-[300px] md:w-[92vw] md:max-w-[500px] aspect-[250/338] flex flex-col items-center justify-center"
        >
          {/* Fondo del óvalo: crema translúcido para que el nombre se lea
              sobre la escalera/candelabro que quedan detrás. */}
          <div
            aria-hidden="true"
            className="absolute inset-[17%_19%] rounded-[50%]"
            style={{
              background: `radial-gradient(ellipse, ${colors.paper}f2 55%, ${colors.paper}c0 100%)`,
            }}
          />
          {/* "XV" de fondo, detrás del nombre: dorado liso (sin gradiente ni
              animación, a pedido: que no brille). Translúcido para que el
              nombre se siga leyendo encima. */}
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center font-display font-semibold text-[140px] md:text-[230px] leading-none select-none pointer-events-none"
            style={{ color: colors.gold, opacity: 0.35 }}
          >
            XV
          </span>
          <Image
            src={T(ASSETS.cuadroDorado)}
            alt=""
            fill
            loading="eager"
            sizes="(max-width: 768px) 300px, 500px"
            className="object-contain"
            style={{ filter: "drop-shadow(0 10px 18px rgba(59,47,32,0.25))" }}
          />
          <span
            className="relative font-mono text-[0.7rem] md:text-sm uppercase tracking-[0.35em] mb-1"
            style={{ color: colors.accent }}
          >
            {config.client.eventType}
          </span>
          <h1
            className="relative font-pinyon-script text-[70px] md:text-[98px] leading-none"
            style={{
              color: colors.accent,
              textShadow: "0 3px 10px rgba(59,47,32,0.18)",
            }}
          >
            {config.client.name}
          </h1>
          <span
            className="relative font-display italic text-base md:text-lg mt-1"
            style={{ color: colors.ink, opacity: 0.75 }}
          >
            {config.event.date.toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </motion.div>
      </div>
    </section>
  );
}
