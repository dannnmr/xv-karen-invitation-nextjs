"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { trimmedAsset } from "@/components/ui/LaceFrame";
import { ASSETS, type InvitationConfig } from "@/config/invitation";

/**
 * La frase de la quinceañera escrita SOBRE el pergamino (en vez de la
 * tarjeta translúcida que tenía el Hero de la base: acá el Hero es un
 * escenario con escalera y no hay lugar para una caja de texto abajo).
 * Flores doradas trepando por el costado del pergamino.
 * Padding en px, no %: el % de padding se calcula sobre el ancho del PADRE.
 */
export function QuoteSection({ config }: { config: InvitationConfig }) {
  const { colors } = config.theme;

  return (
    <section className="relative py-12 px-6 flex justify-center overflow-hidden">
      <div className="relative">
        {/* Flores doradas trepando por el borde izquierdo, DETRÁS del
            pergamino: van afuera de él porque su `filter` crea un contexto
            de apilamiento (un -z-10 adentro quedaría encima de su fondo). */}
        <div
          aria-hidden="true"
          className="absolute -left-14 md:-left-20 bottom-2 z-0 w-[92px] h-[200px] md:w-[120px] md:h-[262px]"
        >
          <Image
            src={trimmedAsset(ASSETS.floresDoradas, 400)}
            alt=""
            fill
            sizes="120px"
            className="object-contain object-bottom"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 24, rotate: -1 }}
          whileInView={{ opacity: 1, y: 0, rotate: -1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="relative z-10 w-[310px] md:w-[380px] aspect-[431/563] flex flex-col items-center justify-center text-center px-[46px] pt-[64px] pb-[70px] md:px-[58px] md:pt-[80px] md:pb-[86px]"
          style={{
            backgroundImage: `url("${trimmedAsset(ASSETS.pergamino, 800)}")`,
            backgroundSize: "100% 100%",
            filter: "drop-shadow(0 14px 24px rgba(59,47,32,0.22))",
          }}
        >
          <span
            className="font-script text-5xl leading-none mb-2"
            style={{ color: colors.gold }}
          >
            &ldquo;
          </span>
          <p
            className="font-display italic text-[1.05rem] md:text-[1.2rem] leading-snug"
            style={{ color: colors.ink }}
          >
            {config.client.dedication}
          </p>
          <span
            className="font-pinyon-script text-3xl md:text-4xl mt-4"
            style={{ color: colors.accent }}
          >
            {config.client.name}
          </span>
        </motion.div>
      </div>
    </section>
  );
}
