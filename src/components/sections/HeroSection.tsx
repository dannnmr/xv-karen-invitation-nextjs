"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { trimmedAsset } from "@/components/ui/LaceFrame";
import { ASSETS, type InvitationConfig } from "@/config/invitation";

/**
 * Hero de Karen: un "escenario" barroco con los 7 assets que la clienta
 * pidió sí o sí, cada uno ubicado según su forma real:
 *  - Cortinas drapeadas (cortina) en las dos esquinas superiores (la
 *    izquierda espejada): enmarcan la escena como un telón.
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
      {/* Cortinas: la izquierda espejada. Por encima de todo lo demás
          (enmarcan la escena como un telón). */}
      <motion.div
        {...reveal(0.1, { y: -30 })}
        className="absolute top-0 left-0 z-30 w-[56vw] max-w-[440px] aspect-[484/505] pointer-events-none"
        // `scaleX` como valor de Framer (no `transform: "scaleX(-1)"`): la
        // animación de entrada arma su propio transform y pisaría el string.
        style={{ scaleX: -1 }}
      >
        <Image
          src={T(ASSETS.cortina)}
          alt=""
          fill
          loading="eager"
          sizes="(max-width: 768px) 56vw, 440px"
          className="object-contain object-top"
        />
      </motion.div>
      <motion.div
        {...reveal(0.1, { y: -30 })}
        className="absolute top-0 right-0 z-30 w-[56vw] max-w-[440px] aspect-[484/505] pointer-events-none"
      >
        <Image
          src={T(ASSETS.cortina)}
          alt=""
          fill
          loading="eager"
          sizes="(max-width: 768px) 56vw, 440px"
          className="object-contain object-top"
        />
      </motion.div>

      {/* Candelabro colgando del borde superior, balanceo leve desde la
          cadena (origen arriba). */}
      <motion.div
        {...reveal(0.3, { y: -60 })}
        // Por ENCIMA de las cortinas (z-35): en móvil las dos cortinas se
        // juntan al centro y lo tapaban.
        className="absolute top-0 left-1/2 -translate-x-1/2 z-[35] pointer-events-none"
      >
        <motion.div
          animate={inView ? { rotate: [-1.5, 1.5, -1.5] } : { rotate: 0 }}
          transition={
            inView
              ? { duration: 6, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0 }
          }
          style={{ transformOrigin: "top center" }}
          className="relative w-[112px] h-[134px] md:w-[210px] md:h-[252px]"
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

      {/* Escalera: escenario, anclada abajo al centro. */}
      <motion.div
        {...reveal(0.2, { y: 40 })}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 w-[82vw] max-w-[520px] aspect-square pointer-events-none"
      >
        <Image
          src={T(ASSETS.escaleras)}
          alt=""
          fill
          loading="eager"
          sizes="(max-width: 768px) 82vw, 520px"
          className="object-contain object-bottom"
        />
      </motion.div>

      {/* Ornamentos dorados en las esquinas inferiores (el asset ES una
          esquina: vértice abajo-izquierda). */}
      <div className="absolute bottom-0 left-0 z-20 w-[34vw] max-w-[260px] aspect-[500/512] pointer-events-none">
        <Image
          src={ASSETS.borde}
          alt=""
          fill
          loading="eager"
          sizes="(max-width: 768px) 34vw, 260px"
          className="object-contain object-left-bottom"
        />
      </div>
      <div
        className="absolute bottom-0 right-0 z-20 w-[34vw] max-w-[260px] aspect-[500/512] pointer-events-none"
        style={{ transform: "scaleX(-1)" }}
      >
        <Image
          src={ASSETS.borde}
          alt=""
          fill
          loading="eager"
          sizes="(max-width: 768px) 34vw, 260px"
          className="object-contain object-left-bottom"
        />
      </div>

      {/* Vela (izquierda) y paraguas (derecha), apoyados junto a la
          escalera. */}
      <motion.div
        {...reveal(0.5, { x: -20 })}
        className="absolute z-20 left-[5%] md:left-[18%] bottom-[16%] md:bottom-[10%] w-[64px] h-[136px] md:w-[100px] md:h-[212px] pointer-events-none"
      >
        <Image
          src={T(ASSETS.vela)}
          alt=""
          fill
          loading="eager"
          sizes="(max-width: 768px) 64px, 100px"
          className="object-contain object-bottom"
        />
      </motion.div>
      <motion.div
        {...reveal(0.5, { x: 20 })}
        className="absolute z-20 right-[2%] md:right-[16%] bottom-[14%] md:bottom-[9%] w-[120px] h-[124px] md:w-[190px] md:h-[196px] pointer-events-none"
        style={{ rotate: "12deg" }}
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
          className="relative w-[250px] h-[338px] md:w-[340px] md:h-[460px] flex flex-col items-center justify-center"
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
          <Image
            src={T(ASSETS.cuadroDorado)}
            alt=""
            fill
            loading="eager"
            sizes="(max-width: 768px) 250px, 340px"
            className="object-contain"
            style={{ filter: "drop-shadow(0 10px 18px rgba(59,47,32,0.25))" }}
          />
          <span
            className="relative font-mono text-[0.6rem] md:text-xs uppercase tracking-[0.35em] mb-1"
            style={{ color: colors.accent }}
          >
            {config.client.eventType}
          </span>
          <h1
            className="relative font-pinyon-script text-[54px] md:text-[78px] leading-none"
            style={{
              color: colors.accent,
              textShadow: "0 3px 10px rgba(59,47,32,0.18)",
            }}
          >
            {config.client.name}
          </h1>
          <span
            className="relative font-display italic text-sm md:text-base mt-1"
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
