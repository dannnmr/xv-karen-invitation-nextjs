import Image from "next/image";
import type { CSSProperties } from "react";
import { Flower2, Sparkles, Leaf } from "lucide-react";
import type { DecorationSpec, InvitationConfig } from "@/config/invitation";

/**
 * Patrón adaptado de la referencia (P3/abril: `visuals.hero.decorations`,
 * un arreglo de motivos posicionados alrededor del Hero), generalizado
 * para admitir la densidad/dispersión de esa referencia sin repetir su
 * antipatrón (~17 `motion.div` con estilos ad-hoc por instancia):
 *  1. `position` es un union type cerrado — el mapeo posición -> CSS vive
 *     en un solo lugar (POSITION_CLASS).
 *  2. `offset` permite "sangrar" fuera del borde (el efecto que en abril
 *     se lograba a mano con `-top-12 -left-12`) sin volverse un string libre.
 *  3. El posicionamiento (posición + offset, estático) vive en un wrapper
 *     separado de la animación (float/sway, en el ícono/imagen interior)
 *     -- si compartieran el mismo elemento, la animación de CSS
 *     sobreescribiría el `transform` del offset en cada frame.
 *  4. Sin `src`, dibuja un ícono + color de la paleta en vez de referenciar
 *     una imagen que podría no existir (evita el defecto de rutas rotas
 *     encontrado en Proyecto 4).
 * Server Component: no tiene estado ni interactividad propia.
 */

const POSITION_CLASS: Record<DecorationSpec["position"], string> = {
  "top-left": "top-4 left-4 md:top-8 md:left-10",
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "top-right": "top-4 right-4 md:top-8 md:right-10",
  "middle-left": "top-1/2 -translate-y-1/2 left-2 md:left-6",
  "middle-right": "top-1/2 -translate-y-1/2 right-2 md:right-6",
  "bottom-left": "bottom-6 left-4 md:bottom-12 md:left-10",
  "bottom-center": "bottom-6 left-1/2 -translate-x-1/2",
  "bottom-right": "bottom-6 right-4 md:bottom-12 md:right-10",
};

const MOTIF_ICON = { flower: Flower2, sparkle: Sparkles, leaf: Leaf } as const;

export function DecorationField({
  decorations,
  colors,
  wrapperClassName = "absolute inset-0 pointer-events-none z-20",
  eager = false,
}: {
  decorations: DecorationSpec[];
  colors: InvitationConfig["theme"]["colors"];
  /** El Hero necesita las decoraciones por ENCIMA de su fondo (z-20). En
   * otras secciones interesa lo contrario: detrás del contenido (z-0),
   * como relleno visual. */
  wrapperClassName?: string;
  /** `true` en el Hero: sus decoraciones están above-the-fold y una puede
   * quedar como LCP -> se cargan sin diferir. En el resto (montadas por
   * LazyMount al scrollear) se deja el lazy por defecto. */
  eager?: boolean;
}) {
  return (
    <div className={wrapperClassName} aria-hidden="true">
      {decorations.map((d, idx) => {
        // `src: ""` = asset pendiente (scaffold clonado de otra invitación):
        // no se dibuja nada, ni siquiera el ícono de respaldo -- distinto de
        // `src` ausente, que sí dibuja el ícono a propósito.
        if (d.src === "") return null;
        const size = d.size ?? 32;
        const positionClass = POSITION_CLASS[d.position];
        const mixBlend = d.blend === "multiply" ? "multiply" : "normal";
        // Rendimiento: un motivo con `blend: "multiply"` ya le pide al
        // navegador recalcular la mezcla de color contra todo lo que tiene
        // debajo en cada repintado -- sumarle además una animación infinita
        // (float/sway) es la combinación más cara de sostener en scroll en
        // equipos de gama baja. Estos quedan quietos; el resto sigue como
        // antes (float por defecto, sway si se pide).
        const floatAnimation =
          idx % 2 === 0 ? "animate-float-slow" : "animate-float-medium";
        const animationClass =
          mixBlend === "multiply" || d.loop === "none"
            ? ""
            : d.loop === "sway"
              ? "animate-sway"
              : floatAnimation;
        // Los íconos de respaldo (planos, sin sombreado) se ven mejor algo
        // translúcidos; las ilustraciones reales quedan a opacidad plena
        // salvo que se pida lo contrario.
        const opacity = d.opacity ?? (d.src ? 1 : 0.8);

        // Wrapper: posición + offset + espejado, SIN animación (transform
        // estático -- la animación de float/sway vive en el hijo).
        const wrapperStyle: CSSProperties = {
          animationDelay: d.delay,
        };
        const parts: string[] = [];
        if (d.offset?.x || d.offset?.y) {
          parts.push(`translate(${d.offset.x ?? 0}px, ${d.offset.y ?? 0}px)`);
        }
        if (d.flipX) parts.push("scaleX(-1)");
        // Va después del scaleX para que un `rotate` positivo se lea igual
        // (horario) esté espejado o no.
        if (d.rotate)
          parts.push(`rotate(${d.flipX ? -d.rotate : d.rotate}deg)`);
        if (parts.length) wrapperStyle.transform = parts.join(" ");

        if (d.src) {
          return (
            <div
              key={idx}
              className={`absolute ${positionClass}`}
              style={wrapperStyle}
            >
              <Image
                src={d.src}
                alt={d.alt ?? ""}
                width={d.width ?? size}
                height={d.height ?? size}
                loading={eager ? "eager" : undefined}
                // `max-w-none`: el preflight de Tailwind pone `max-width: 100%`
                // en todo <img> y, en viewports más angostos que la decoración,
                // recortaba solo el ancho mientras el `height` fijo de abajo
                // mantenía la altura -> next/image lo leía como "una dimensión
                // modificada por CSS y la otra no" (warning de aspect-ratio).
                // El desborde lo recorta el `overflow-hidden` de la sección.
                className={`object-contain max-w-none ${animationClass}`}
                style={{
                  mixBlendMode: mixBlend,
                  opacity,
                  width: d.width ?? size,
                  height: d.height ?? size,
                }}
              />
            </div>
          );
        }

        const Icon = MOTIF_ICON[d.motif];
        return (
          <div
            key={idx}
            className={`absolute ${positionClass}`}
            style={wrapperStyle}
          >
            <Icon
              size={size}
              className={animationClass}
              style={{
                color: colors[d.tone],
                mixBlendMode: mixBlend,
                opacity,
                animationDelay: d.delay,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
