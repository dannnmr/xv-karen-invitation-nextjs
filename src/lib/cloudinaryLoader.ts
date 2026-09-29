/**
 * Loader custom de `next/image` (ver next.config.ts -> images.loaderFile).
 *
 * Motivo: los assets de esta invitación viven en Cloudinary, que YA es un
 * CDN global con transformación on-the-fly (`f_auto,q_auto,w_`). Pasarlos
 * además por el optimizador de Next (`/_next/image`) es meter un CDN detrás
 * de otro: el server de Next descargaba el original de Cloudinary, lo
 * transcodeaba y lo reenviaba -> ~50 round-trips lentos en la primera carga.
 * Con este loader, `next/image` pide directo a Cloudinary (edge, cacheado)
 * y sigue generando el `srcset` responsivo -> Cloudinary sirve cada ancho.
 */

const CLOUD_BASE = "https://res.cloudinary.com/dvaswskle/image/upload/";

type LoaderArgs = { src: string; width: number; quality?: number };

export default function cloudinaryLoader({
  src,
  width,
  quality,
}: LoaderArgs): string {
  // Imágenes locales (/public) u otros hosts: se sirven tal cual, sin tocar.
  if (!src.includes("res.cloudinary.com") || !src.includes("/upload/")) {
    return src;
  }

  const afterUpload = src.split("/upload/")[1];
  const segments = afterUpload.split("/");
  // Segmentos de transformación que ya trae la URL (todo lo anterior a la
  // versión "v1788467003" o al nombre del archivo). Los de tamaño/formato
  // ("w_500,f_auto,q_auto") se descartan para no apilarlos con los de acá;
  // los EFECTOS (`e_trim`, `a_-14`, ...) se conservan en orden: cambian la
  // imagen en sí (recorte, rotación) y perderlos rompía el encaje en cajas
  // angostas (ej. la cuerda de la pantalla de cortinas).
  const isTransform = (seg: string) =>
    /[_,]/.test(seg) && !/^v\d+$/.test(seg) && !seg.includes(".");
  const effects: string[] = [];
  let i = 0;
  while (i < segments.length - 1 && isTransform(segments[i])) {
    const kept = segments[i]
      .split(",")
      .filter((p) => /^(e|a)_/.test(p))
      .join(",");
    if (kept) effects.push(kept);
    i++;
  }
  const rest = segments.slice(i).join("/");

  const transform = `f_auto,q_${quality ?? "auto"},w_${width},c_limit`;
  return `${CLOUD_BASE}${[...effects, transform].join("/")}/${rest}`;
}
