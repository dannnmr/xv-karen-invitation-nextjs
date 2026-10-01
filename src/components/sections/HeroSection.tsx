"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { trimmedAsset } from "@/components/ui/LaceFrame";
import { ASSETS, type InvitationConfig } from "@/config/invitation";

/**
 * Hero de Karen según la referencia de la clienta: la escena de fondo
 * (`visuals.heroBackground`: arco con cortinaje y balcón al paisaje) y,
 * encima, los assets de la invitación:
 *  - candelabro colgando arriba al centro, con balanceo leve;
 *  - marco oval dorado = retrato, con "XV AÑOS", el "XV" translúcido y el
 *    nombre ADENTRO (el paisaje se ve a través del óvalo);
 *  - abajo, "objetos del salón": ornamentos dorados en las dos esquinas,
 *    vela a la izquierda, máscara negra al centro, espejo de mano y
 *    máscara dorada a la derecha.
 *
 * Escenario (`stage`): en móvil es la sección entera; en desktop, una
 * columna centrada con la proporción del fondo (600x1041) para que el arco
 * no se recorte, con el mismo fondo difuminado a los costados. Todas las
 * posiciones van en % del escenario -> la composición se mantiene igual en
 * cualquier pantalla.
 *
 * Todos los assets pasan por `trimmedAsset` (Cloudinary `e_trim`): cada caja
 * mide lo que mide el dibujo.
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
  const background = config.visuals.heroBackground;
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
      style={{ backgroundColor: colors.ink }}
    >
      {/* Fondo a pantalla completa. En móvil es LA escena (cover); en
          desktop queda difuminado detrás de la columna centrada. */}
      {background && (
        <Image
          src={background}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center md:blur-md md:scale-110 md:brightness-75"
        />
      )}

      {/* Escenario: toda la sección en móvil, columna con la proporción del
          fondo en desktop. */}
      <div className="absolute inset-0 md:inset-auto md:top-0 md:bottom-0 md:left-1/2 md:-translate-x-1/2 md:aspect-600/1041 md:overflow-hidden">
        {background && (
          <div className="hidden md:block absolute inset-0 shadow-2xl">
            <Image
              src={background}
              alt=""
              fill
              priority
              sizes="(min-width: 768px) 60svh, 0px"
              className="object-cover"
            />
          </div>
        )}

        {/* Candelabro colgando del borde superior, balanceo leve desde la
            cadena (origen arriba). */}
        <motion.div
          {...reveal(0.3, { y: -60 })}
          className="absolute -top-[8%] left-[28%] w-[44%] aspect-300/362 z-20 pointer-events-none"
        >
          <motion.div
            animate={inView ? { rotate: [-1.5, 1.5, -1.5] } : { rotate: 0 }}
            transition={
              inView
                ? { duration: 6, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0 }
            }
            style={{ transformOrigin: "top center" }}
            className="absolute inset-0"
          >
            <Image
              src={T(ASSETS.candelabro)}
              alt=""
              fill
              loading="eager"
              sizes="(max-width: 768px) 44vw, 260px"
              className="object-contain object-top"
            />
          </motion.div>
        </motion.div>

        {/* Retrato: marco oval dorado con el nombre adentro, centrado un
            poco por debajo del candelabro (como en la referencia). */}
        <div className="absolute inset-x-0 top-[49%] -translate-y-1/2 z-10 flex justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={
              isRevealed
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.92 }
            }
            transition={{
              duration: 1.2,
              delay: 0.35,
              type: "spring",
              bounce: 0.2,
            }}
            className="relative w-[75%] md:w-[76%] aspect-1000/1347"
          >
            <Image
              src={T(ASSETS.cuadroDorado)}
              alt=""
              fill
              loading="eager"
              sizes="(max-width: 768px) 88vw, 460px"
              className="object-contain"
              style={{ filter: "drop-shadow(0 12px 22px rgba(0,0,0,0.35))" }}
            />
            {/* Contenido dentro del hueco del óvalo (18.6-82.3% del ancho,
                16.6-79.4% del alto del asset). */}
            <div className="absolute left-[18%] right-[18%] top-[17%] bottom-[21%] flex flex-col items-center justify-center text-center">
              <span
                className="font-mono text-[0.65rem] md:text-sm uppercase tracking-[0.35em] -translate-y-10 md:-translate-y-14"
                style={{ color: colors.ink, opacity: 0.85 }}
              >
                {config.client.eventType}
              </span>
              <div className="relative flex items-center justify-center w-full">
                {/* "XV" grande translúcido detrás del nombre. */}
                <span
                  aria-hidden="true"
                  className="absolute font-display font-semibold text-[130px] md:text-[170px] leading-none select-none"
                  style={{ color: colors.paper, opacity: 0.6 }}
                >
                  XV
                </span>
                <h1
                  className="relative font-pinyon-script text-[68px] md:text-[84px] leading-none"
                  style={{
                    color: colors.accent,
                    textShadow:
                      "0 0 14px rgba(255,251,242,0.9), 0 2px 6px rgba(59,47,32,0.35)",
                  }}
                >
                  {config.client.name}
                </h1>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Ornamentos dorados en las dos esquinas inferiores (el de la
            izquierda espejado). */}
        <motion.div
          {...reveal(0.2, { y: 40 })}
          className="absolute -bottom-[1%] -left-[4%] w-[48%] md:w-[42%] aspect-300/307 z-20 pointer-events-none -scale-x-100"
        >
          <Image
            src={T(ASSETS.borde)}
            alt=""
            fill
            loading="eager"
            sizes="(max-width: 768px) 48vw, 240px"
            className="object-contain object-bottom"
          />
        </motion.div>
        <motion.div
          {...reveal(0.2, { y: 40 })}
          className="absolute -bottom-[1%] -right-[4%] w-[48%] md:w-[42%] aspect-300/307 z-20 pointer-events-none"
        >
          <Image
            src={T(ASSETS.borde)}
            alt=""
            fill
            loading="eager"
            sizes="(max-width: 768px) 48vw, 240px"
            className="object-contain object-bottom"
          />
        </motion.div>

        {/* Vela a la izquierda, apoyada en el piso. */}
        <motion.div
          {...reveal(0.4, { y: 30 })}
          className="absolute bottom-[2%] left-[15%] w-[21%] md:w-[17%] aspect-300/642 z-30 pointer-events-none"
        >
          <Image
            src={T(ASSETS.vela)}
            alt=""
            fill
            loading="eager"
            sizes="(max-width: 768px) 21vw, 100px"
            className="object-contain object-bottom"
          />
        </motion.div>

        {/* Espejo de mano a la derecha, apoyado e inclinado. */}
        <motion.div
          {...reveal(0.45, { y: 30 })}
          className="absolute bottom-[2%] right-[18%] w-[21%] md:w-[17%] aspect-300/757 z-50 pointer-events-none rotate-16"
        >
          <Image
            src={T(ASSETS.espejo)}
            alt=""
            fill
            loading="eager"
            sizes="(max-width: 768px) 21vw, 100px"
            className="object-contain object-bottom"
          />
        </motion.div>

        {/* Máscaras en el piso: la negra al centro, la dorada a la derecha
            (por delante del espejo). */}
        <motion.div
          {...reveal(0.55, { y: 30 })}
          className="absolute -bottom-[12%] left-[24%] w-[46%] md:w-[40%] aspect-square z-40 pointer-events-none -rotate-12"
        >
          <Image
            src={T(ASSETS.mascaraNegra)}
            alt=""
            fill
            loading="eager"
            sizes="(max-width: 768px) 48vw, 240px"
            className="object-contain object-bottom"
          />
        </motion.div>
        <motion.div
          {...reveal(0.6, { y: 30 })}
          className="absolute -bottom-[5%] -right-[12%] w-[44%] md:w-[38%] aspect-square z-40 pointer-events-none rotate-6"
        >
          <Image
            src={T(ASSETS.mascaraDorada)}
            alt=""
            fill
            loading="eager"
            sizes="(max-width: 768px) 48vw, 240px"
            className="object-contain object-bottom"
          />
        </motion.div>
      </div>
    </section>
  );
}
