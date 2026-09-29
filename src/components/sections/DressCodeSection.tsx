"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Footprints } from "lucide-react";
import { trimmedAsset } from "@/components/ui/LaceFrame";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ASSETS, type InvitationConfig } from "@/config/invitation";

/**
 * Dress code SIN tarjeta: el contenido va directo sobre la textura global
 * de la invitación, enmarcado por el ornamento dorado real (el de
 * Padres/Countdown) arriba y espejado abajo. Una tarjeta con degradado y
 * filetes hechos en CSS se veía genérica ("hecha por IA", según la
 * clienta); los ornamentos ilustrados dan el marco sin caja.
 *  - La descripción ("Formal") entre filetes con rombos.
 *  - La imagen de referencia (abanico con perlas, 1408x975 recortado) en
 *    grande y sin círculo: es una pieza lucida por sí sola -- antes quedaba
 *    encajonada en ~96px.
 *  - Colores reservados como "joyas": muestra con aro dorado y el nombre
 *    debajo de cada una, más la regla en una frase (no un párrafo en
 *    mayúsculas).
 */
// Filete dorado con rombo al centro (divisor usado dos veces).
function Filete({ gold, className = "" }: { gold: string; className?: string }) {
  return (
    <div aria-hidden="true" className={`flex items-center gap-2 ${className}`}>
      <span
        className="w-12 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${gold})` }}
      />
      <span className="w-1.5 h-1.5 rotate-45" style={{ backgroundColor: gold }} />
      <span
        className="w-12 h-px"
        style={{ background: `linear-gradient(to left, transparent, ${gold})` }}
      />
    </div>
  );
}

export function DressCodeSection({ config }: { config: InvitationConfig }) {
  const { colors } = config.theme;
  const reserved = config.dressCode.colors;
  const ornament = trimmedAsset(ASSETS.ornamento, 600);

  return (
    <section className="relative py-10 px-6 flex flex-col items-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-[380px] md:max-w-[420px] flex flex-col items-center text-center"
      >
        {/* Ornamento superior (asset 574x135 recortado). */}
        <div
          aria-hidden="true"
          className="relative w-[200px] md:w-[240px] aspect-[574/135] mb-4 pointer-events-none"
        >
          <Image src={ornament} alt="" fill sizes="240px" className="object-contain" />
        </div>

        <SectionHeader
          eyebrow="Sugerencia de estilo"
          title="Dress Code"
          colors={colors}
          className="mb-3"
        />

        {/* Descripción entre filetes. */}
        <Filete gold={colors.gold} className="mb-1" />
        <p
          className="font-display italic text-3xl md:text-4xl leading-tight"
          style={{ color: colors.accent }}
        >
          {config.dressCode.description}
        </p>
        <Filete gold={colors.gold} className="mt-1 mb-4" />

        {config.dressCode.image ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-[230px] md:w-[270px] aspect-[1408/975] mb-6"
            style={{ filter: "drop-shadow(0 10px 16px rgba(59,47,32,0.18))" }}
          >
            <Image
              src={trimmedAsset(config.dressCode.image, 700)}
              alt="Referencia de estilo"
              fill
              sizes="(max-width: 768px) 230px, 270px"
              className="object-contain"
            />
          </motion.div>
        ) : (
          // Sin imagen: ícono (pisadas: calzado cómodo) + el porqué.
          <div className="flex flex-col items-center gap-1.5 mb-6">
            <Footprints
              size={40}
              strokeWidth={1.2}
              style={{ color: colors.accent }}
            />
            <span
              className="font-display italic text-base md:text-lg leading-tight"
              style={{ color: colors.ink }}
            >
              para bailar toda la noche
            </span>
          </div>
        )}

        {/* Colores RESERVADOS para la quinceañera (los invitados deben
            evitarlos). Sin colores no se dibuja el bloque. */}
        {reserved.length > 0 && (
          <div className="flex flex-col items-center w-full">
            <span
              className="font-mono text-[0.6rem] md:text-[0.65rem] uppercase tracking-[0.3em] mb-4"
              style={{ color: colors.accent }}
            >
              Colores reservados
            </span>
            <div className="flex items-start justify-center gap-4 md:gap-5 mb-4">
              {reserved.map((c, i) => (
                <motion.div
                  key={c.name}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                  className="flex flex-col items-center gap-1.5"
                >
                  {/* Muestra con aro dorado (aire crema + filete). */}
                  <span
                    className="block w-10 h-10 md:w-11 md:h-11 rounded-full"
                    title={c.name}
                    style={{
                      ...(c.imageSrc
                        ? {
                            backgroundImage: `url("${c.imageSrc}")`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : {
                            backgroundColor:
                              c.hex ??
                              (c.tone ? colors[c.tone] : colors.accent),
                          }),
                      boxShadow: `0 0 0 2.5px ${colors.paper}, 0 0 0 4px ${colors.gold}, 0 6px 12px rgba(59,47,32,0.18)`,
                    }}
                  />
                  <span
                    className="mt-1 font-display italic text-sm leading-none"
                    style={{ color: colors.ink, opacity: 0.8 }}
                  >
                    {c.name}
                  </span>
                </motion.div>
              ))}
            </div>
            <p
              className="font-display italic text-base md:text-lg leading-snug max-w-[17rem]"
              style={{ color: colors.ink, opacity: 0.85 }}
            >
              Son exclusivos de la quinceañera; te pedimos evitarlos en tu
              atuendo.
            </p>
          </div>
        )}

        {/* Ornamento inferior: el mismo, espejado en vertical. */}
        <div
          aria-hidden="true"
          className="relative w-[200px] md:w-[240px] aspect-[574/135] mt-6 -scale-y-100 pointer-events-none"
        >
          <Image src={ornament} alt="" fill sizes="240px" className="object-contain" />
        </div>
      </motion.div>
    </section>
  );
}
