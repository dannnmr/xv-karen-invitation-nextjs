"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Heart, QrCode, Download, X } from "lucide-react";
import Image from "next/image";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { trimmedAsset } from "@/components/ui/LaceFrame";
import { Ornament, OrnamentDivider } from "@/components/ui/Ornament";
import { ASSETS, type InvitationConfig } from "@/config/invitation";

// "Lluvia de sobres": sobrecitos cayendo dentro de la tarjeta, cada uno con
// su columna, tamaño, duración y desfase (delays negativos -> ya están a
// media caída al montar, sin un arranque "vacío").
const RAIN = [
  { left: "4%", size: 42, duration: 7, delay: -1 },
  { left: "20%", size: 32, duration: 5.5, delay: -4 },
  { left: "38%", size: 36, duration: 6.5, delay: -2.5 },
  { left: "58%", size: 30, duration: 5, delay: -0.5 },
  { left: "72%", size: 40, duration: 7.5, delay: -5 },
  { left: "86%", size: 32, duration: 6, delay: -3 },
];

/**
 * Regalos en el idioma visual de Karen (pedido de la clienta: las tarjetas
 * blancas se veían "plantilla"): título + ornamento dorado + mensaje en
 * cursiva; las ideas de regalo en un desplegable, como ilustraciones
 * flotando; y la
 * lluvia de sobres como escena (sobre + paraguas + sobrecitos cayendo).
 * El QR (y su modal portaleado) se conserva para clientas que lo den.
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
  const rainEnvelope = config.visuals.giftEnvelope
    ? trimmedAsset(config.visuals.giftEnvelope, 120)
    : null;

  return (
    <section className="relative py-14 px-6 flex flex-col items-center overflow-hidden">
      <div className="relative z-10 max-w-3xl w-full flex flex-col items-center text-center">
        <SectionHeader
          eyebrow="Sugerencias"
          title="Regalos"
          colors={colors}
          className="mb-3"
        />
        <OrnamentDivider src={ASSETS.ornamento} className="mb-5" />
        <p
          className="font-display italic text-lg md:text-xl leading-snug max-w-sm mb-10"
          style={{ color: colors.ink, opacity: 0.85 }}
        >
          {giftRegistry.message}
        </p>

        {/* Lista de ideas en un DESPLEGABLE (pedido de la clienta: como
            estaba antes), con el botón en el estilo de Karen (filete
            dorado, como las opciones del RSVP) y, adentro, las
            ilustraciones grandes flotando. */}
        {hasPreferences && (
          <div className="w-full max-w-sm md:max-w-2xl flex flex-col items-center mb-14">
            <button
              type="button"
              onClick={() => setShowOptions((v) => !v)}
              aria-expanded={showOptions}
              aria-controls="giftOptions"
              className="w-full max-w-xs flex items-center justify-between gap-3 px-5 py-3 rounded-full border-[1.5px] shadow-sm transition-colors"
              style={{
                borderColor: colors.gold,
                backgroundColor: showOptions
                  ? `${colors.gold}22`
                  : "rgba(255,255,255,0.6)",
              }}
            >
              <span
                className="font-sans text-[0.65rem] md:text-[0.7rem] uppercase tracking-[0.22em] font-semibold"
                style={{ color: colors.accent }}
              >
                {showOptions ? "Ocultar lista" : "Ver lista de regalos"}
              </span>
              <motion.span
                animate={{ rotate: showOptions ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="flex"
              >
                <ChevronDown size={16} color={colors.accent} />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {showOptions && (
                <motion.div
                  id="giftOptions"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden w-full"
                >
                  <ul className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 w-full pt-8">
                    {giftRegistry.preferences.map((pref, i) => (
                      <motion.li
                        key={pref.label}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
                        className="flex flex-col items-center"
                      >
                        <div
                          className="relative w-28 h-28 md:w-32 md:h-32 mb-3"
                          style={{
                            filter: "drop-shadow(0 8px 12px rgba(59,47,32,0.16))",
                          }}
                        >
                          <div
                            className="absolute inset-0 animate-float-slow"
                            style={{ animationDelay: `${-i * 1.6}s` }}
                          >
                            {pref.image ? (
                              <Image
                                src={trimmedAsset(pref.image, 300)}
                                alt={pref.label}
                                fill
                                sizes="128px"
                                className="object-contain"
                              />
                            ) : (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <Heart size={32} style={{ color: colors.gold }} />
                              </span>
                            )}
                          </div>
                        </div>
                        <span
                          className="font-display italic text-lg leading-tight"
                          style={{ color: colors.accent }}
                        >
                          {pref.label}
                        </span>
                        {pref.detail && (
                          <span
                            className="font-sans text-[0.6rem] tracking-[0.15em] uppercase mt-1"
                            style={{ color: colors.ink, opacity: 0.6 }}
                          >
                            {pref.detail}
                          </span>
                        )}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Lluvia de sobres como escena (sin tarjeta): el sobre al centro,
            el paraguas de encaje sobre él meciéndose y los sobrecitos
            cayendo alrededor, desvanecidos arriba y abajo con una máscara
            (estática: no cuesta nada por frame). */}
        <span
          className="font-mono text-[0.6rem] md:text-[0.65rem] uppercase tracking-[0.3em] mb-2"
          style={{ color: colors.accent }}
        >
          Si deseas tener un detalle diferente
        </span>
        <div className="relative w-[min(86vw,340px)] h-72 md:h-80 flex items-end justify-center">
          {rainEnvelope && (
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={
                {
                  "--fall": "320px",
                  maskImage:
                    "linear-gradient(to bottom, transparent, #000 18%, #000 78%, transparent)",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, transparent, #000 18%, #000 78%, transparent)",
                } as CSSProperties
              }
            >
              {RAIN.map((drop, i) => (
                <div
                  key={i}
                  className="absolute top-0 animate-fall"
                  style={{
                    left: drop.left,
                    width: drop.size,
                    height: drop.size,
                    animationDuration: `${drop.duration}s`,
                    animationDelay: `${drop.delay}s`,
                  }}
                >
                  <Image
                    src={rainEnvelope}
                    alt=""
                    fill
                    sizes="42px"
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          )}
          <Ornament
            src={ASSETS.paraguas}
            className="top-0 left-[22%] md:left-[24%] w-36 h-37 md:w-40 md:h-41 -rotate-10 z-10"
            sizes="144px"
            motion="sway"
          />
          <div
            className="relative z-10 w-40 h-52 md:w-44 md:h-58 animate-float-slow"
            style={{ filter: "drop-shadow(0 10px 16px rgba(59,47,32,0.18))" }}
          >
            <Image
              // Sobre de la pareja; respaldo: el sobre genérico compartido.
              src={
                config.visuals.giftEnvelope ??
                "https://res.cloudinary.com/dvaswskle/image/upload/v1788729151/sobre_rosa_fyrtbu.webp"
              }
              alt="Lluvia de sobres"
              fill
              sizes="176px"
              className="object-contain"
            />
          </div>
        </div>
        <span
          className="font-display italic text-2xl md:text-3xl mt-3"
          style={{ color: colors.accent }}
        >
          Lluvia de sobres
        </span>

        {/* QR bancario solo si la clienta lo da (Karen: no). */}
        {giftRegistry.qrImage && (
          <button
            type="button"
            onClick={openQr}
            aria-haspopup="dialog"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full font-sans text-[0.7rem] uppercase tracking-[0.25em] font-semibold shadow-md"
            style={{ backgroundColor: colors.accent, color: colors.paper }}
          >
            <QrCode size={15} /> Ver QR
          </button>
        )}
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
