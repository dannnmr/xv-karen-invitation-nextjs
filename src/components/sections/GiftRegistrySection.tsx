"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Heart, QrCode, Download, X } from "lucide-react";
import Image from "next/image";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { InvitationConfig } from "@/config/invitation";

/**
 * Portado de xv-antonella-nextjs-supabase (P5) -- único módulo del paquete
 * VIP de esta clienta que xv-andrea-carolina no tenía (esa clienta decidió
 * no incluir Mesa de Regalos). Layout de dos columnas: izquierda = acordeón
 * de preferencias, derecha = "sobre" interactivo que abre el QR bancario en
 * un modal. Adaptado a las convenciones de esta base (colores desde
 * `theme.colors`, `FlowBackground`/`getSectionFlow`, `SectionHeader`) en
 * vez de los estilos propios del original.
 */
export function GiftRegistrySection({ config }: { config: InvitationConfig }) {
  const [showOptions, setShowOptions] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  // Momento en que se abrió el modal. En móvil, el `touchend` que abre el
  // modal genera además un `click` "fantasma" ~300 ms después, que para
  // entonces cae sobre el backdrop recién montado (el que cierra al tocar
  // fuera) -> el modal se abría y se cerraba solo. Ignoramos cualquier
  // cierre-por-fuera dentro de una ventana corta tras abrir.
  const openedAtRef = useRef(0);
  const openQr = () => {
    openedAtRef.current = Date.now();
    setIsQrOpen(true);
  };
  const closeQrFromBackdrop = () => {
    if (Date.now() - openedAtRef.current < 400) return;
    setIsQrOpen(false);
  };

  // Con el modal abierto: bloquear el scroll del fondo y cerrar con Escape.
  useEffect(() => {
    if (!isQrOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsQrOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [isQrOpen]);

  const { colors } = config.theme;
  const { giftRegistry } = config;
  const hasPreferences = giftRegistry.preferences.length > 0;

  return (
    <section className="relative py-12 px-6 flex flex-col items-center overflow-hidden">
      <div
        className="absolute bottom-0 left-0 w-[400px] h-[400px] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, ${colors.gold}18 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 max-w-3xl w-full flex flex-col items-center">
        <div className="text-center mb-10">
          <SectionHeader
            eyebrow="Sugerencias"
            title="Regalos"
            colors={colors}
            className="mb-4"
          />
          <p
            className="font-sans text-xs tracking-[0.15em] uppercase leading-relaxed"
            style={{ color: colors.ink, opacity: 0.8 }}
          >
            {giftRegistry.message}
          </p>
        </div>

        {/* Sin lista de preferencias (boda: solo sobres + QR), la columna
            izquierda no se monta y la tarjeta de sobres/QR queda sola y
            centrada, en vez de una grilla de dos con un hueco. */}
        <div
          className={`grid grid-cols-1 gap-5 w-full ${hasPreferences ? "md:grid-cols-2" : "max-w-md"}`}
        >
          {hasPreferences && (
            <div
              className="flex flex-col items-center text-center p-6 rounded-[2rem] border relative overflow-hidden"
              style={{
                backgroundColor: "rgba(255,255,255,0.9)",
                borderColor: `${colors.accent}20`,
              }}
            >
              <h4
                className="font-sans text-lg uppercase tracking-[0.25em] font-light mb-1"
                style={{ color: colors.accent }}
              >
                Opciones
              </h4>
              <p
                className="font-sans text-[0.65rem] tracking-[0.15em] uppercase mb-4"
                style={{ color: colors.ink, opacity: 0.6 }}
              >
                Algunas ideas que me encantarían
              </p>

              <button
                onClick={() => setShowOptions((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-3 rounded-2xl border shadow-sm transition-colors"
                style={{
                  backgroundColor: `${colors.accentSoft}22`,
                  borderColor: `${colors.accent}30`,
                }}
              >
                <span
                  className="font-sans text-[0.6rem] md:text-[0.65rem] uppercase tracking-[0.2em] font-medium"
                  style={{ color: colors.accent }}
                >
                  {showOptions ? "Ocultar opciones" : "Ver lista de regalos"}
                </span>
                <motion.div
                  animate={{ rotate: showOptions ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown size={16} style={{ color: colors.accent }} />
                </motion.div>
              </button>

              <AnimatePresence>
                {showOptions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4 }}
                    className="overflow-hidden w-full"
                  >
                    <ul className="grid grid-cols-2 gap-y-5 gap-x-2 pt-5">
                      {giftRegistry.preferences.map((pref) => (
                        <li
                          key={pref.label}
                          className="flex flex-col items-center group"
                        >
                          <div className="w-14 h-14 relative mb-2 transition-transform duration-500 group-hover:-translate-y-1">
                            {pref.image ? (
                              <Image
                                src={pref.image}
                                alt={pref.label}
                                fill
                                sizes="56px"
                                className="object-contain"
                                style={{
                                  mixBlendMode: "multiply",
                                  opacity: 0.85,
                                }}
                              />
                            ) : (
                              <span
                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: `${colors.gold}25` }}
                              >
                                <Heart
                                  size={16}
                                  style={{ color: colors.gold }}
                                />
                              </span>
                            )}
                          </div>
                          <h5
                            className="font-sans text-xs font-medium tracking-[0.15em] uppercase"
                            style={{ color: colors.accent }}
                          >
                            {pref.label}
                          </h5>
                          {pref.detail && (
                            <p
                              className="font-sans text-[0.6rem] tracking-[0.15em] uppercase mt-0.5 text-center"
                              style={{ color: colors.ink, opacity: 0.6 }}
                            >
                              {pref.detail}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Columna derecha: lluvia de sobres + QR bancario */}
          <div
            className="flex flex-col items-center text-center p-6 rounded-[2rem] border relative overflow-hidden"
            style={{
              background: `linear-gradient(to bottom, ${colors.accent}8, ${colors.accentSoft}18)`,
              borderColor: `${colors.accentSoft}30`,
            }}
          >
            <p
              className="font-sans text-[0.65rem] tracking-[0.15em] uppercase mb-4"
              style={{ color: colors.ink, opacity: 0.8 }}
            >
              Si deseas tener un detalle diferente
            </p>

            {/* Sobre y QR al mismo tamaño visual (~144px) y sus captions
                alineados -- `items-end` en la fila para que ambos textos
                ("Lluvia de sobres" / "Toca para ver el QR") queden a la
                misma altura aunque las imágenes no midan exactamente lo
                mismo por dentro. */}
            <div className="flex items-end justify-center gap-5">
              {/* Sobre decorativo + caption "Lluvia de sobres" debajo. */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div
                  className={`relative flex items-center justify-center ${giftRegistry.qrImage ? "w-32 h-32 md:w-36 md:h-36" : "w-44 h-44 md:w-52 md:h-52"}`}
                >
                  <Image
                    // Sobre de la pareja; respaldo: el sobre genérico compartido.
                    src={
                      config.visuals.giftEnvelope ??
                      "https://res.cloudinary.com/dvaswskle/image/upload/v1788729151/sobre_rosa_fyrtbu.webp"
                    }
                    alt="Lluvia de sobres"
                    fill
                    sizes="208px"
                    className="object-contain"
                  />
                </div>
                <p
                  className="font-bold text-[0.6rem] uppercase tracking-widest text-center max-w-28"
                  style={{ color: colors.accent, opacity: 0.9 }}
                >
                  Lluvia de sobres
                </p>
              </div>

              {/* Sin QR (Karen: solo lluvia de sobres + preferencias), la
                  tarjeta del QR no se dibuja -- un "QR pendiente" permanente
                  se leería como un error. QR: tarjeta cuadrada simple con
                  el corazón como sello pequeño en la esquina. */}
              {giftRegistry.qrImage && (
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => giftRegistry.qrImage && openQr()}
                    aria-haspopup="dialog"
                    aria-label="Abrir código QR"
                    className="relative w-32 h-32 md:w-36 md:h-36 bg-white p-2 rounded-2xl shadow-md flex flex-col items-center justify-center gap-1"
                  >
                    <div
                      className="w-full aspect-square relative rounded-lg overflow-hidden flex items-center justify-center"
                      // El QR real (`giftRegistry.qrImage`) ya trae su propio
                      // fondo blanco -- un color de fondo distinto acá se veía
                      // como un marco/halo que no calzaba con esa imagen. Solo
                      // se usa `accentSoft` cuando NO hay imagen (ícono de
                      // respaldo), para que el ícono siga teniendo un fondo
                      // con algo de color.
                      style={{
                        backgroundColor: giftRegistry.qrImage
                          ? "#fff"
                          : colors.accentSoft,
                      }}
                    >
                      {giftRegistry.qrImage ? (
                        <Image
                          src={giftRegistry.qrImage}
                          alt="Código QR"
                          fill
                          sizes="144px"
                          // QR local: el loader de Cloudinary no aplica; se sirve
                          // tal cual (es chico, no necesita redimensionado).
                          unoptimized
                          className="object-contain"
                        />
                      ) : (
                        <QrCode size={32} style={{ color: colors.gold }} />
                      )}
                    </div>
                    <p
                      className="font-mono text-[0.5rem] tracking-[0.25em] uppercase font-bold"
                      style={{ color: colors.accent }}
                    >
                      {config.client.name}
                    </p>
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center absolute -top-2.5 -right-2.5 shadow-md"
                      style={{ backgroundColor: colors.accent }}
                    >
                      <Heart size={12} className="text-white fill-white" />
                    </div>
                  </button>
                  <p
                    className="font-bold text-[0.6rem] uppercase tracking-widest text-center"
                    style={{ color: colors.accent, opacity: 0.9 }}
                  >
                    {giftRegistry.qrImage
                      ? "Toca para ver el QR"
                      : "QR pendiente"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal del QR: portaleado a <body>, mismo patrón que la lightbox de
          GallerySection.tsx -- relativo al viewport, no a la sección (ver
          gotcha de `content-visibility`/`contain` documentado en el
          reference.md de la skill). Cierra con el botón, con Escape o
          tocando fuera (el cierre-por-fuera se ignora los primeros 400 ms
          -> openedAtRef; el contenido detiene la propagación). */}
      {giftRegistry.qrImage &&
        typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isQrOpen && (
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-label="Código QR para regalo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-6"
                style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
                onClick={closeQrFromBackdrop}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ type: "spring", damping: 22, stiffness: 300 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-xs rounded-3xl p-6 flex flex-col items-center shadow-2xl"
                  style={{ backgroundColor: "#fff" }}
                >
                  <button
                    type="button"
                    onClick={() => setIsQrOpen(false)}
                    aria-label="Cerrar"
                    className="absolute -top-3 -right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-md"
                    style={{ backgroundColor: colors.accent, color: "#fff" }}
                  >
                    <X size={16} />
                  </button>

                  <div
                    className="w-full aspect-square relative rounded-2xl overflow-hidden"
                    style={{ backgroundColor: colors.accentSoft }}
                  >
                    <Image
                      src={giftRegistry.qrImage}
                      alt="Código QR"
                      fill
                      sizes="288px"
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                  <p
                    className="font-mono text-xs tracking-[0.3em] uppercase font-bold mt-3"
                    style={{ color: colors.accent }}
                  >
                    {config.client.name}
                  </p>

                  <a
                    href={giftRegistry.qrImage}
                    download={`qr-${config.client.name.toLowerCase()}.jpg`}
                    className="inline-flex items-center gap-1.5 mt-4 px-5 py-2.5 rounded-full font-mono text-[0.65rem] uppercase tracking-widest font-semibold shadow-sm"
                    style={{ backgroundColor: colors.accent, color: "#fff" }}
                  >
                    <Download size={14} /> Descargar QR
                  </a>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </section>
  );
}
