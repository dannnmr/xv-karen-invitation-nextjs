"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import Image from "next/image";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { trimmedAsset } from "@/components/ui/LaceFrame";
import { ASSETS, type InvitationConfig } from "@/config/invitation";

/**
 * Itinerario estilo vania-tania-invitation (pedido explícito): camino en
 * zigzag punteado (SVG en píxeles reales del contenedor) y una flor dorada
 * (el corazón del original, cambiado a pedido) que lo RECORRE con el scroll.
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

const PAD_PCT = 0.06; // aire arriba/abajo del primer y último momento
const TURN_X = 0.2; // vueltas del camino: 20% y 80% del ancho
// Separación vertical por momento: acuarela (64-80px) + aire. Con 86 la
// descripción de un momento casi tocaba el título del siguiente; 100 deja
// respirar y sigue siendo más compacto que el original (116). La hora va
// en la misma línea que el título para que cada fila sea más baja.
const ROW_HEIGHT = 100;

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
  // Resorte sobre el progreso: en móvil los eventos de scroll llegan a
  // saltos y la flor se "teletransportaba" de un punto al otro; con el
  // resorte se desliza entre ellos (inercia leve, sin retraso notorio).
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 26,
    mass: 0.35,
    restDelta: 0.0005,
  });

  // Tabla de puntos del camino, muestreada UNA vez por ancho: antes cada
  // evento de scroll llamaba a `getTotalLength()` + `getPointAtLength()`,
  // que recorren todo el <path> (caro, y más en iOS). Ahora cada cuadro es
  // una interpolación entre dos puntos ya calculados.
  const pointsRef = useRef<{ x: number; y: number }[]>([]);
  const rotorRef = useRef<HTMLDivElement>(null);

  const placeHeart = (progress: number) => {
    const pts = pointsRef.current;
    const heart = heartRef.current;
    const rotor = rotorRef.current;
    if (pts.length < 2 || !heart || !rotor) return;
    const t = Math.min(1, Math.max(0, progress)) * (pts.length - 1);
    const i = Math.min(pts.length - 2, Math.floor(t));
    const f = t - i;
    const x = pts[i].x + (pts[i + 1].x - pts[i].x) * f;
    const y = pts[i].y + (pts[i + 1].y - pts[i].y) * f;
    // Traslación en la capa externa y giro en la interna (la flor "rueda":
    // vuelta y media en todo el recorrido). La sombra vive en la capa más
    // interna, así se rasteriza una sola vez y el navegador solo compone
    // capas ya pintadas en cada cuadro.
    heart.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    rotor.style.transform = `rotate(${progress * 540}deg)`;
  };
  useMotionValueEvent(smoothProgress, "change", placeHeart);
  // Re-muestrea el camino cuando cambia el ancho (se redibuja el path) y
  // ubica la flor en su posición actual.
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const total = path.getTotalLength();
    const SAMPLES = 400;
    pointsRef.current = Array.from({ length: SAMPLES + 1 }, (_, k) => {
      const p = path.getPointAtLength((total * k) / SAMPLES);
      return { x: p.x, y: p.y };
    });
    placeHeart(smoothProgress.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width]);

  const d = width > 0 ? snakePath(count, width, height) : "";

  return (
    <section className="relative pt-32 md:pt-40 pb-10 px-4 overflow-hidden">
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
                // gap-8/12: el texto necesita aire respecto de la acuarela
                // (con menos quedaba pegado a la imagen y al punteado).
                className={`absolute inset-x-0 flex items-center gap-8 md:gap-12 ${
                  isLeft ? "flex-row" : "flex-row-reverse"
                }`}
                style={{ top: `${pct}%`, transform: "translateY(-50%)" }}
              >
                {/* Acuarela centrada en la vuelta del camino: margen =
                    20% del ancho - la mitad de la acuarela. El halo crema
                    tapa el punteado detrás (las acuarelas son
                    transparentes). */}
                <div
                  className={`relative shrink-0 w-16 h-16 md:w-20 md:h-20 z-10 ${
                    isLeft
                      ? "ml-[calc(20%-2rem)] md:ml-[calc(20%-2.5rem)]"
                      : "mr-[calc(20%-2rem)] md:mr-[calc(20%-2.5rem)]"
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
                      sizes="(max-width: 768px) 64px, 80px"
                      className="object-contain"
                    />
                  )}
                </div>
                <div
                  className={`flex flex-col min-w-0 ${
                    isLeft ? "items-start text-left" : "items-end text-right"
                  }`}
                >
                  {/* Hora y título en una línea; la hora siempre del lado de
                      la acuarela (en las filas derechas, `flex-row-reverse`). */}
                  <div
                    className={`flex items-baseline gap-2 ${
                      isLeft ? "flex-row" : "flex-row-reverse"
                    }`}
                  >
                    <span
                      className="font-display italic text-[1.35rem] md:text-2xl leading-none shrink-0"
                      style={{ color: colors.accent }}
                    >
                      {item.time}
                    </span>
                    <h3
                      className="font-sans font-semibold text-[0.62rem] md:text-xs uppercase tracking-[0.16em] leading-tight"
                      style={{ color: colors.ink }}
                    >
                      {item.title}
                    </h3>
                  </div>
                  {item.description && (
                    <p
                      // `text-balance`: reparte las líneas parejas en vez de
                      // dejar una palabra sola abajo ("noche").
                      className="font-sans text-[0.65rem] md:text-[0.72rem] leading-snug mt-1 max-w-48 md:max-w-56 text-balance"
                      style={{ color: colors.ink, opacity: 0.6 }}
                    >
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Flor dorada que recorre el camino (encima de las acuarelas). */}
          {width > 0 && (
            // Tres capas: traslación (externa) > giro > flor con sombra.
            <div
              ref={heartRef}
              aria-hidden="true"
              className="absolute top-0 left-0 z-20 w-11 h-11 md:w-12 md:h-12 will-change-transform"
            >
              <div ref={rotorRef} className="absolute inset-0 will-change-transform">
                <div
                  className="absolute inset-0"
                  style={{ filter: "drop-shadow(0 3px 5px rgba(59,47,32,0.3))" }}
                >
                  <Image
                    src={trimmedAsset(ASSETS.florDorada, 150)}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
