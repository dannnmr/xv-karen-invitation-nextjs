import Image from "next/image";
import { trimmedAsset } from "@/components/ui/LaceFrame";

/**
 * Divisor dorado bajo un título (ornamento 574x135 recortado) -- mismo
 * recurso que separa Dress Code y Countdown, para que Música / Regalos /
 * Galería hablen el mismo idioma visual que el resto.
 */
export function OrnamentDivider({
  src,
  className = "",
  flipY = false,
}: {
  src: string;
  className?: string;
  flipY?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={`relative w-44 md:w-52 aspect-574/135 pointer-events-none ${flipY ? "-scale-y-100" : ""} ${className}`}
    >
      <Image
        src={trimmedAsset(src, 600)}
        alt=""
        fill
        sizes="208px"
        className="object-contain"
      />
    </div>
  );
}

const ANIMATION = {
  float: "animate-float-slow",
  "float-medium": "animate-float-medium",
  sway: "animate-sway",
  none: "",
} as const;

/**
 * Asset decorativo ANCLADO a un elemento (marco, tarjeta, título): se
 * posiciona con `className` (absolute + tamaño + rotación, relativo al
 * contenedor `relative` que lo rodea) en vez de suelto por la sección --
 * pedido de la clienta: las flores repartidas al azar se veían mal.
 *
 * Tres capas para que los `transform` no se pisen: el wrapper lleva la
 * posición/rotación estática, el hijo la animación CSS (float/sway,
 * compositor-only) y la imagen el espejado.
 */
export function Ornament({
  src,
  className,
  sizes,
  motion = "float",
  delay,
  flipX = false,
  width = 400,
}: {
  src: string;
  /** Posición y tamaño (ej. "-left-8 bottom-0 w-20 h-44 -rotate-12"). */
  className: string;
  /** Ancho real renderizado, para el `srcset` (ej. "80px"). */
  sizes: string;
  motion?: keyof typeof ANIMATION;
  /** Desfase de la animación (ej. "-2s"), para que pares no vayan al unísono. */
  delay?: string;
  flipX?: boolean;
  /** Ancho pedido a Cloudinary para el recorte (`e_trim`). */
  width?: number;
}) {
  return (
    <div
      aria-hidden="true"
      className={`absolute pointer-events-none ${className}`}
    >
      <div
        className={`absolute inset-0 ${ANIMATION[motion]}`}
        style={{ animationDelay: delay }}
      >
        <Image
          src={trimmedAsset(src, width)}
          alt=""
          fill
          sizes={sizes}
          className={`object-contain ${flipX ? "-scale-x-100" : ""}`}
        />
      </div>
    </div>
  );
}
