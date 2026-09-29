import type { CSSProperties, ReactNode } from "react";

/**
 * Asset de Cloudinary recortado a su contenido (`e_trim` quita los márgenes
 * transparentes del lienzo): así el borde del encaje/papel coincide con el
 * borde de la caja CSS en vez de dejar aire alrededor.
 */
export function trimmedAsset(url: string, width = 1000) {
  return url.includes("/upload/")
    ? url.replace("/upload/", `/upload/e_trim/f_auto,q_auto,w_${width}/`)
    : url;
}

/**
 * Fondo ilustrado (encaje, papel) en lugar de una tarjeta plana: la imagen
 * se estira al tamaño del contenido (`background-size: 100% 100%`) y el
 * `padding` en % deja el contenido dentro de la zona lisa, sin pisar el
 * borde decorativo. Sin `src`, degrada a una tarjeta crema simple.
 * Server-safe (sin estado).
 */
export function LaceFrame({
  src,
  children,
  className = "",
  padding = "13% 14%",
  fallbackColor = "#fff",
  style,
}: {
  src?: string;
  children: ReactNode;
  className?: string;
  /** Zona lisa del asset, como `padding` CSS (los % son sobre el ANCHO). */
  padding?: string;
  fallbackColor?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`relative ${src ? "" : "rounded-[2rem] shadow-lg"} ${className}`}
      style={{
        padding,
        ...(src
          ? {
              backgroundImage: `url("${trimmedAsset(src)}")`,
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
              // Sombra que sigue la silueta del encaje (no un rectángulo).
              filter: "drop-shadow(0 10px 22px rgba(47,42,34,0.12))",
            }
          : { backgroundColor: fallbackColor }),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
