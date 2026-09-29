"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { trimmedAsset } from "@/components/ui/LaceFrame";
import { ASSETS, type InvitationConfig } from "@/config/invitation";

/**
 * Familias -- estilo de abril/P3 (`Parents.tsx`): eyebrow arriba, nombres en
 * script con "&" entre ellos, dedicatoria abajo con separador. Para boda,
 * VARIOS grupos (padres del novio, padres de la novia, padrinos), cada uno
 * con su etiqueta en versalita. Nombres completos (con dos apellidos) son
 * largos -> script más chico que el de P3 y siempre apilados (nombre, "&",
 * nombre) para que no se corten en mobile. Opcional: sin
 * `config.families`, no se monta.
 */
export function ParentsSection({ config }: { config: InvitationConfig }) {
  const { colors } = config.theme;
  const { families } = config;
  if (!families) return null;

  return (
    <section className="relative py-16 md:py-20 px-6 flex flex-col items-center overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[150px] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse, ${colors.accentSoft}30 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center">
        {/* Cartela dorada (cuadro_1) con el eyebrow ESCRITO adentro, en vez
            de un eyebrow suelto: la placa barroca hace de título. */}
        <div
          className="relative w-[280px] h-[110px] md:w-[360px] md:h-[141px] mb-6 md:mb-8 flex items-center justify-center"
          style={{
            backgroundImage: `url("${trimmedAsset(ASSETS.cartela, 800)}")`,
            backgroundSize: "100% 100%",
          }}
        >
          <span
            className="font-display italic text-lg md:text-xl"
            style={{ color: colors.accent }}
          >
            {families.topLabel}
          </span>
        </div>

        <div
          className={`w-full grid grid-cols-1 gap-10 md:gap-6 mb-8 ${families.groups.length > 1 ? "md:grid-cols-3" : ""}`}
        >
          {families.groups.map((group, i) => (
            <motion.div
              key={group.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15 * i }}
              className="flex flex-col items-center text-center"
            >
              {group.label && (
                <span
                  className="font-sans text-[0.6rem] md:text-[0.65rem] tracking-[0.3em] uppercase font-bold mb-3"
                  style={{ color: colors.gold }}
                >
                  {group.label}
                </span>
              )}
              <h3
                className="font-script text-[1.9rem] md:text-[1.8rem] lg:text-[2rem] leading-tight"
                style={{ color: colors.accent }}
              >
                {group.names[0]}
              </h3>
              <span
                className="font-script text-2xl leading-none my-0.5"
                style={{ color: colors.gold }}
              >
                &amp;
              </span>
              <h3
                className="font-script text-[1.9rem] md:text-[1.8rem] lg:text-[2rem] leading-tight"
                style={{ color: colors.accent }}
              >
                {group.names[1]}
              </h3>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="flex flex-col items-center"
        >
          {/* Ornamento dorado como separador (en vez de una línea). */}
          <div className="relative w-[180px] h-[42px] md:w-[230px] md:h-[54px] mb-3">
            <Image
              src={trimmedAsset(ASSETS.ornamento, 500)}
              alt=""
              fill
              sizes="230px"
              className="object-contain"
            />
          </div>
          <p
            className="font-sans text-[0.65rem] md:text-sm tracking-[0.25em] uppercase leading-relaxed max-w-md text-center"
            style={{ color: colors.ink, opacity: 0.75 }}
          >
            {families.invitationText}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
