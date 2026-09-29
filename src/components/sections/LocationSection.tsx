"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { Navigation } from "lucide-react";
import type { InvitationConfig } from "@/config/invitation";

/**
 * Mezcla final entre gredmarie y Luciana (invitation_test_idea), a pedido
 * explícito:
 *  - Tipografía/tamaño del texto: calcado de gredmarie ("Recepción &" en
 *    italic + "Evento" en outline cursivo + subtítulo/dirección/mapa con
 *    línea izquierda), tamaño IDÉNTICO en todas las pantallas (`Evento` a
 *    13rem en desktop, no reducido en móvil -- el texto se monta sobre la
 *    imagen de fondo si no alcanza el espacio, no se encoge).
 *  - Imagen y botón: calcados de Luciana (LocationSection.tsx). La imagen
 *    (`visuals.locationSideImage`) entra con scale 1.1->1 + x 50->0 (ease
 *    tipo "expo-out"), sangra fuera del borde derecho, `mix-blend-mode:
 *    lighten` + grayscale+contraste. Más grande y a más opacidad
 *    (`opacity-40`, no el `opacity-15` casi imperceptible de Luciana) --
 *    ese nivel de sutileza no se notaba en esta invitación, pedido
 *    explícito subirlo. El botón de mapa es un círculo de vidrio casi
 *    transparente con un pin de trazo fino (sin el disco blanco sólido que
 *    tenía antes) -- el texto rotando en SVG es el mismo que ya tenía esta
 *    sección, con datos reales de este evento.
 * Se quitan las "estrellas de mar" (rosas reetiquetadas) que tenía la
 * versión anterior de esta sección -- igual que el resto de floral
 * heredado del scaffold, no era de esta invitación.
 * Fondo claro (`colors.primary`, blanco cálido) -- paleta estilo
 * xv-antonella, texto en `colors.ink`/`colors.accent` en vez del `colors.paper`
 * (blanco) que asumía un fondo oscuro.
 */
export function LocationSection({ config }: { config: InvitationConfig }) {
  const { colors } = config.theme;
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { margin: "200px 0px" });

  return (
    <section
      ref={sectionRef}
      className="relative py-20 px-6 flex flex-col items-center overflow-hidden"
    >
      <div className="relative z-10 max-w-5xl w-full">
        {/* Ramo de flores a la derecha -- misma entrada que Luciana
            (invitation_test_idea/LocationSection.tsx): scale 1.1->1 + x
            50->0 (ease tipo "expo-out"), sangrando fuera del borde derecho.
            A COLOR y sin `mix-blend-mode: lighten`/grayscale (heredados de
            una base de fondo oscuro): sobre este fondo casi blanco,
            `lighten` borraba cualquier tono más oscuro que el fondo -> el
            ramo rojo no se veía. En móvil va anclado ABAJO a la derecha
            (junto al botón de mapa): arriba quedaba detrás del "Evento" de
            trazo fino y lo volvía ilegible. */}
        {config.visuals.locationSideImage && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1, x: 50 }}
            whileInView={{ opacity: 0.9, scale: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-[-8%] right-[-40%] w-[90%] aspect-square md:bottom-auto md:top-[5%] md:right-[-25%] md:w-[90%] md:max-w-175 md:h-[90%] md:aspect-auto pointer-events-none z-0"
          >
            <Image
              src={config.visuals.locationSideImage}
              alt=""
              fill
              sizes="(max-width: 768px) 90vw, 700px"
              className="object-contain"
            />
          </motion.div>
        )}

        {/* Texto a tamaño completo, idéntico a gredmarie en todas las
            pantallas -- `relative z-10` para quedar por encima de la
            imagen donde se superponga. */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex flex-col items-start text-left"
        >
          <h3
            className="font-display italic text-[3rem] md:text-[5rem] leading-none"
            style={{ color: colors.ink }}
          >
            Recepción &amp;
          </h3>
          <div className="relative flex items-start -mt-4 md:-mt-8">
            {/* `font-script` (Great Vibes), no `font-display` (Cormorant):
                en el proyecto de gredmarie `font-display` está mapeado a su
                fuente cursiva -- al revés que acá, donde `font-display` es
                Cormorant. Por eso su "Evento" es cursivo y necesita este
                token, no el que usa "Recepción &" arriba. Única excepción
                del proyecto que sigue en trazo hueco (el resto de títulos
                cursivos ahora es color sólido, a pedido explícito). */}
            <span
              className="font-script text-[6.5rem] md:text-[13rem] leading-none tracking-wider"
              style={{
                color: "transparent",
                WebkitTextStroke: `0.8px ${colors.accent}`,
              }}
            >
              Evento
            </span>
          </div>
          {/* Un bloque por lugar (boda: iglesia -> salón), cada uno con la
              línea izquierda de gredmarie y su propio botón de mapa. En
              desktop van lado a lado. `id` del <textPath> único por lugar:
              dos SVG con el mismo id harían que ambos usen el mismo path. */}
          <div className="flex flex-col md:flex-row gap-10 md:gap-16 mt-4 w-full">
            {config.event.venues.map((venue, i) => (
              <div
                key={venue.name}
                className="flex border-l pl-6 flex-col items-start max-w-70 md:max-w-xs w-full"
                style={{ borderColor: `${colors.accent}40` }}
              >
                <span
                  className="font-mono text-[0.65rem] md:text-xs uppercase tracking-[0.25em] mb-2"
                  style={{ color: colors.gold }}
                >
                  {venue.label} · {venue.time}
                </span>
                <h4
                  className="font-sans text-base md:text-lg font-light tracking-widest uppercase mb-2"
                  style={{ color: colors.ink }}
                >
                  {venue.name}
                </h4>
                <p
                  className="font-sans text-sm md:text-[0.95rem] leading-relaxed tracking-wide mb-6"
                  style={{ color: colors.ink, opacity: 0.65 }}
                >
                  {venue.address}
                </p>
                {/* Sin link de Maps (pendiente), no se dibuja el botón. */}
                {venue.url && (
                  <a
                    href={venue.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative flex items-center justify-center w-24 h-24 md:w-28 md:h-28 group shrink-0"
                  >
                    <div
                      className="absolute inset-0 rounded-full border"
                      style={{
                        borderColor: `${colors.accent}30`,
                        backgroundColor: "rgba(255,255,255,0.7)",
                      }}
                    />
                    <motion.svg
                      animate={inView ? { rotate: 360 } : { rotate: 0 }}
                      transition={
                        inView
                          ? { duration: 15, repeat: Infinity, ease: "linear" }
                          : { duration: 0 }
                      }
                      className="absolute inset-0 w-full h-full opacity-70 group-hover:opacity-100 transition-opacity"
                      viewBox="0 0 100 100"
                      style={{ color: colors.accent }}
                    >
                      <path
                        id={`locationMapPath-${i}`}
                        d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
                        fill="transparent"
                      />
                      <text
                        fontSize="8.5"
                        letterSpacing="2.5"
                        className="font-sans uppercase font-bold tracking-widest fill-current"
                      >
                        <textPath
                          href={`#locationMapPath-${i}`}
                          startOffset="0%"
                        >
                          MAPA • RUTA AL EVENTO • GPS UBICACIÓN •
                        </textPath>
                      </text>
                    </motion.svg>
                    <Navigation
                      size={28}
                      strokeWidth={1}
                      style={{ color: colors.accent }}
                      className="relative z-10 group-hover:-rotate-45 transition-transform duration-500"
                    />
                  </a>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
