"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Footprints } from "lucide-react";
import { trimmedAsset } from "@/components/ui/LaceFrame";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DecorationField } from "@/components/ui/DecorationField";
import type { DecorationSpec, InvitationConfig } from "@/config/invitation";

// Lirios blancos y calas (flores, 400x641): la ilustración viene RECORTADA
// por su borde derecho y por abajo -> el recorte tiene que quedar oculto.
// Solo en desktop: a la izquierda del arco, con el borde recortado
// ESCONDIDO detrás de la tarjeta (parece que el ramo sale de atrás) y el
// recorte inferior tapado por el borde de la sección. En móvil la tarjeta
// ocupa todo el ancho: quedaban casi enteros detrás de ella, turbios -> ahí
// alcanza con la flor del hombro del arco. Sin animación (tiene tallos).
const LILIES = ""; // sin decoración lateral (vacío = no se dibuja)

// Flor suelta (flor2) en la esquina superior derecha de la tarjeta: la
// curva del arco (`150px 150px 0 0`) deja ese rincón vacío, y la flor
// asoma por detrás del hombro del arco -- ligada a la tarjeta, no a la
// esquina de la sección (que en desktop queda lejísimos de todo).
const CARD_DECOR: DecorationSpec[] = [
  {
    motif: "flower",
    tone: "accent",
    position: "top-right",
    src: "", // sin flor en el hombro del arco
    width: 104,
    height: 110,
    rotate: 18,
    offset: { x: 34, y: -26 },
  },
];
// Solo desktop: lirios a la izquierda del arco, recorte escondido detrás.
const CARD_DECOR_DESKTOP: DecorationSpec[] = [
  {
    motif: "flower",
    tone: "accent",
    position: "bottom-left",
    src: LILIES,
    width: 180,
    height: 288,
    loop: "none",
    offset: { x: -150, y: 110 },
  },
];

/**
 * Layout general adaptado de DressCode.tsx (abril/P3): título + círculo
 * destacado con borde punteado + regla de colores reservados debajo de un
 * divisor. Los círculos de color son el patrón de Luciana (P2,
 * DressCodeSection.tsx): cada uno puede ser un tono del tema O una imagen
 * real (`imageSrc`), no solo color plano como en abril.
 * "Marco" tipo arco calcado de gredmarie (tarjeta glassmorphism con
 * `border-radius: 150px 150px 0 0`), a pedido explícito -- pero se
 * conserva el círculo blanco con borde punteado que ya tenía esta
 * sección (gredmarie en cambio deja la imagen flotando sin círculo), solo
 * que ahora muestra la imagen real de dress code dada por la clienta.
 * Sin `backdrop-blur` (gredmarie sí lo usa): mismo criterio ya aplicado en
 * el resto del proyecto (GlassCard, cápsulas de Countdown) -- costoso en
 * iOS Safari, fondo casi sólido en su lugar, prácticamente el mismo look.
 */
export function DressCodeSection({ config }: { config: InvitationConfig }) {
  const { colors } = config.theme;
  const reserved = config.dressCode.colors;
  const doily = config.visuals.dressCodeDoily;

  return (
    <section className="relative py-10 px-6 flex flex-col items-center overflow-hidden">
      {/* Contenedor del arco: la capa CARD_DECOR se posiciona respecto a la
          tarjeta y queda DETRÁS de ella (va antes en el DOM, z-0). */}
      <div className="relative z-10 max-w-90 w-full">
        <DecorationField
          decorations={CARD_DECOR}
          colors={colors}
          wrapperClassName="absolute inset-0 pointer-events-none z-0"
        />
        <DecorationField
          decorations={CARD_DECOR_DESKTOP}
          colors={colors}
          wrapperClassName="absolute inset-0 pointer-events-none z-0 hidden md:block"
        />
        <div
          className="relative w-full px-6 py-10 flex flex-col items-center text-center"
          style={{
            backgroundColor: "rgba(255,255,255,0.85)",
            border: `1px solid ${colors.accent}20`,
            borderRadius: "150px 150px 0 0",
            boxShadow: `0 10px 30px ${colors.accent}1a`,
          }}
        >
          <SectionHeader
            eyebrow="Sugerencia de estilo"
            title="Dress Code"
            colors={colors}
            className="mb-6"
          />

          <h4
            className="font-sans text-xl uppercase tracking-[0.3em] font-light mb-6"
            style={{ color: colors.accent }}
          >
            {config.dressCode.description}
          </h4>

          {/* Círculo destacado: con `dressCodeDoily`, el encaje redondo de la
              pareja ES el círculo (en vez de uno blanco con borde punteado,
              que queda como respaldo sin el asset). */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className={`relative flex flex-col items-center justify-center gap-1.5 mb-10 ${
              doily
                ? "w-52 h-52 md:w-60 md:h-60"
                : "w-40 h-40 md:w-48 md:h-48 rounded-full"
            }`}
            style={
              doily
                ? {
                    backgroundImage: `url("${trimmedAsset(doily, 600)}")`,
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    filter: `drop-shadow(0 12px 22px ${colors.ink}22)`,
                  }
                : {
                    backgroundColor: "#fff",
                    boxShadow: `0 15px 40px ${colors.accent}25`,
                  }
            }
          >
            {!doily && (
              <div
                className="absolute inset-2 rounded-full border border-dashed"
                style={{ borderColor: `${colors.accent}50` }}
              />
            )}
            {config.dressCode.image ? (
              <div className="relative w-24 h-24 md:w-28 md:h-28">
                <Image
                  src={config.dressCode.image}
                  alt="Referencia de estilo"
                  fill
                  sizes="(max-width: 768px) 96px, 112px"
                  className="object-contain"
                />
              </div>
            ) : (
              // Sin imagen: ícono (pisadas: el pedido es calzado cómodo) +
              // una línea que explica el porqué, en vez de repetir la
              // descripción que ya está escrita arriba del círculo.
              <>
                <Footprints
                  size={40}
                  strokeWidth={1.2}
                  style={{ color: colors.accent }}
                />
                <span
                  className="font-display italic text-base md:text-lg leading-tight max-w-32 text-center"
                  style={{ color: colors.ink }}
                >
                  para bailar toda la noche
                </span>
              </>
            )}
          </motion.div>

          {/* Regla de colores -- círculos estilo Luciana (imagen > hex > tono).
            Colores RESERVADOS que los invitados deben evitar. Sin colores
            no se dibuja el bloque. */}
          {reserved.length > 0 && (
            <div
              className="flex flex-col items-center gap-3 w-full border-t pt-8"
              style={{ borderColor: `${colors.accent}20` }}
            >
              <span
                className="font-mono text-[0.6rem] uppercase tracking-[0.25em]"
                style={{ color: colors.ink }}
              >
                Colores a evitar
              </span>
              <div className="flex items-center justify-center gap-4">
                {reserved.map((c) => (
                  <motion.div
                    key={c.name}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                    className="w-8 h-8 rounded-full shadow-md border"
                    style={
                      c.imageSrc
                        ? {
                            backgroundImage: `url("${c.imageSrc}")`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            borderColor: "rgba(0,0,0,0.08)",
                          }
                        : {
                            backgroundColor:
                              c.hex ??
                              (c.tone ? colors[c.tone] : colors.accent),
                            borderColor: "rgba(0,0,0,0.08)",
                          }
                    }
                    title={c.name}
                  />
                ))}
              </div>
              {reserved.length > 0 && (
                <p
                  className="font-sans text-xs leading-relaxed tracking-[0.1em] max-w-xs"
                  style={{ color: colors.ink, opacity: 0.8 }}
                >
                  {reserved.map((c, i, arr) => (
                    <span key={c.name}>
                      <strong style={{ color: colors.accent }}>
                        {c.name.toUpperCase()}
                      </strong>
                      {i < arr.length - 2
                        ? ", "
                        : i === arr.length - 2
                          ? " Y "
                          : ""}
                    </span>
                  ))}
                  {" ESTÁN RESERVADOS EXCLUSIVAMENTE PARA LA QUINCEAÑERA."}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
