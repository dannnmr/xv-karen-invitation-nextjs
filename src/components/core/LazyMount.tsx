"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Monta `children` recién cuando el sentinel entra (o está por entrar) al
 * viewport. Antes de eso reserva `minHeight` para que el scroll no salte.
 *
 * Motivo: `page.tsx` renderiza las 13 secciones de una -> todas las
 * `<Image>` se piden al cargar y la Galería abre su websocket de Supabase
 * detrás del sobre cerrado. Con esto, de Itinerario para abajo cada sección
 * (y su red) recién arranca al acercarse.
 *
 * `rootMargin` de 800px -> monta ~1 pantalla antes de llegar, sin flash.
 * El `setState` va en el callback del observer, no en el cuerpo del effect.
 */
export function LazyMount({
  children,
  minHeight = 700,
}: {
  children: ReactNode;
  minHeight?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show || !ref.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true);
          io.disconnect();
        }
      },
      { rootMargin: "800px 0px" },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [show]);

  return (
    <div ref={ref} style={show ? undefined : { minHeight }}>
      {show ? children : null}
    </div>
  );
}
