"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import Image from "next/image";
import { Heart } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ASSETS, type InvitationConfig } from "@/config/invitation";

/**
 * Itinerario estilo vania-tania-invitation (pedido explícito): camino en
 * zigzag punteado (SVG en píxeles reales del contenedor) y un corazón que
 * lo RECORRE con el scroll.
 *
 * Composición "cuentas en un hilo": la acuarela de cada momento va justo en
 * la vuelta del camino (20% / 80% del ancho, donde la curva es vertical) y
 * el texto al lado, hacia el centro -- así la línea nunca cruza el texto
 * al bajar hacia el siguiente momento.
 *
 * Diferencia con el original: allá el corazón usaba GSAP MotionPathPlugin.
 * Acá no se suma GSAP como 2da librería de animación (el proyecto ya usa
 * Framer Motion): el progreso de scroll de Framer se traduce a un punto del
 * MISMO <path> con `getPointAtLength`, y el corazón se mueve por
 * `transform` (compositor-only, sin reflow).
 */

const PAD_PCT = 0.08; // aire arriba/abajo del primer y último momento
const TURN_X = 0.2; // vueltas del camino: 20% y 80% del ancho
// Separación vertical por momento: acuarela (80-96px) + un poco de aire.
const ROW_HEIGHT = 116;

// Mismo algoritmo que vania-tania: curvas cúbicas entre puntos alternados,
// entrando y saliendo por el centro.
function snakePath(count: number, w: number, h: number) {
  if (count <= 1) return `M ${w / 2},0 L ${w / 2},${h}`;
  const pad = h * PAD_PCT;
  const step = (h - 2 * pad) / (count - 1);
  const left = w * TURN_X;
  const right = w * (1 - TURN_X);
  let d = `M ${w / 2},0 C ${w / 2},${pad / 2} ${left},${pad / 2} ${left},${pad} `;
  for (let i = 0; i < count - 1; i++) {
    const sx = i % 2 === 0 ? left : right;
    const ex = (i + 1) % 2 === 0 ? left : right;
    const sy = pad + i * step;
    const ey = pad + (i + 1) * step;
    d += `C ${sx},${sy + step / 2} ${ex},${ey - step / 2} ${ex},${ey} `;
  }
  const lx = (count - 1) % 2 === 0 ? left : right;
  d += `C ${lx},${h - pad / 2} ${w / 2},${h - pad / 2} ${w / 2},${h}`;
  return d;
}

export function ItinerarySection({ config }: { config: InvitationConfig }) {
  const { colors } = config.theme;
  const items = config.itinerary;
  const count = items.length;
  const height = Math.max(360, count * ROW_HEIGHT);

  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const heartRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  // Solo el ANCHO dispara re-render: en móvil la barra de direcciones
  // cambia el alto de la ventana al scrollear y haría parpadear el SVG.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () =>
      setWidth((prev) => (prev === el.clientWidth ? prev : el.clientWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 75%", "end 35%"],
  });

  const placeHeart = (progress: number) => {
    const path = pathRef.current;
    const heart = heartRef.current;
    if (!path || !heart) return;
    const p = path.getPointAtLength(
      path.getTotalLength() * Math.min(1, Math.max(0, progress)),
    );
    heart.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%)`;
  };
  useMotionValueEvent(scrollYProgress, "change", placeHeart);
  // Posición inicial, y de nuevo cuando cambia el ancho (redibuja el path).
  useEffect(() => {
    placeHeart(scrollYProgress.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width]);

  const d = width > 0 ? snakePath(count, width, height) : "";

  return (
    <section className="relative pt-32 md:pt-40 pb-20 px-4 overflow-hidden">
      {/* Tela drapeada como guirnalda de ancho completo arriba (el asset es
          una caída de tela en U, 500x296): abre la sección como un telón. */}
      <div
        aria-hidden="true"
        className="absolute top-0 inset-x-0 h-[120px] md:h-[170px] pointer-events-none"
      >
        <Image
          src={ASSETS.tela}
          alt=""
          fill
          sizes="100vw"
          className="object-fill"
        />
      </div>

      <div className="relative z-10 max-w-xl mx-auto w-full flex flex-col items-center">
        <SectionHeader
          eyebrow="Mi gran noche"
          title="Itinerario"
          colors={colors}
          className="mb-6"
        />

        <div ref={containerRef} className="relative w-full" style={{ height }}>
          {width > 0 && (
            <svg
              aria-hidden="true"
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
              className="absolute inset-0 overflow-visible pointer-events-none"
            >
              <path
                ref={pathRef}
                d={d}
                fill="none"
                stroke={colors.accent}
                strokeOpacity={0.35}
                strokeWidth={2}
                strokeDasharray="7 8"
                strokeLinecap="round"
              />
            </svg>
          )}

          {items.map((item, idx) => {
            const isLeft = idx % 2 === 0;
            const pct =
              count > 1
                ? PAD_PCT * 100 +
                  (idx / (count - 1)) * (100 - 2 * PAD_PCT * 100)
                : 50;
            return (
              <div
                key={item.title}
                className={`absolute inset-x-0 flex items-center gap-3 ${
                  isLeft ? "flex-row" : "flex-row-reverse"
                }`}
                style={{ top: `${pct}%`, transform: "translateY(-50%)" }}
              >
                {/* Acuarela centrada en la vuelta del camino: margen =
                    20% del ancho - la mitad de la acuarela. El halo crema
                    tapa el punteado detrás (las acuarelas son
                    transparentes). */}
                <div
                  className={`relative shrink-0 w-20 h-20 md:w-24 md:h-24 z-10 ${
                    isLeft
                      ? "ml-[calc(20%-2.5rem)] md:ml-[calc(20%-3rem)]"
                      : "mr-[calc(20%-2.5rem)] md:mr-[calc(20%-3rem)]"
                  }`}
                >
                  <div
                    aria-hidden="true"
                    className="absolute -inset-2 rounded-full"
                    style={{
                      background: `radial-gradient(circle, ${colors.primary} 55%, transparent 72%)`,
                    }}
                  />
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 80px, 96px"
                      className="object-contain"
                    />
                  )}
                </div>
                <div
                  className={`flex flex-col min-w-0 ${
                    isLeft ? "items-start text-left" : "items-end text-right"
                  }`}
                >
                  <span
                    className="font-display italic text-[1.7rem] md:text-3xl leading-none"
                    style={{ color: colors.accent }}
                  >
                    {item.time}
                  </span>
                  <h3
                    className="font-sans font-semibold text-[0.62rem] md:text-xs uppercase tracking-[0.18em] mt-1"
                    style={{ color: colors.ink }}
                  >
                    {item.title}
                  </h3>
                  {item.description && (
                    <p
                      className="font-sans text-[0.65rem] md:text-[0.72rem] leading-snug mt-0.5 max-w-44 md:max-w-52"
                      style={{ color: colors.ink, opacity: 0.6 }}
                    >
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Corazón que recorre el camino (encima de las acuarelas). */}
          {width > 0 && (
            <div
              ref={heartRef}
              aria-hidden="true"
              className="absolute top-0 left-0 z-20 w-8 h-8 rounded-full flex items-center justify-center shadow-md will-change-transform"
              style={{ backgroundColor: colors.paper }}
            >
              <Heart size={15} fill={colors.accent} stroke={colors.accent} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
