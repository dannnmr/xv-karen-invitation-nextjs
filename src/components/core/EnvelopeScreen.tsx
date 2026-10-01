"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flower2, MailOpen } from "lucide-react";
import Image from "next/image";
import { trimmedAsset } from "@/components/ui/LaceFrame";
import { ASSETS, type InvitationConfig } from "@/config/invitation";

interface EnvelopeScreenProps {
  isOpen: boolean;
  onOpen: () => void;
  onStartOpen?: () => void;
  config: InvitationConfig;
}

/**
 * Con assets reales: dos solapas o cortinas (`left`/`right`, cada imagen
 * cubre la pantalla con su mitad dibujada) sobre un fondo (`complete`) +
 * broche central que abre al tocarlo, o una cuerda opcional (`pullCord`)
 * en su lugar. Sin ellos, degrada al fallback de texto + botón (nunca una
 * ruta rota).
 *
 * El contenedor raíz es `transparent` a propósito (como el original de
 * vania-tania-invitation): al abrirse las cortinas se tiene que ver el Hero
 * real ya montado detrás. La capa opaca de abajo es un HIJO que se
 * desmonta al abrir -- tapa el Hero solo mientras las imágenes cargan.
 *
 * `onOpen` se dispara con `onAnimationComplete` de la cortina /
 * `onExitComplete` del fallback, no con un `setTimeout` copiado a mano de la
 * duración de la animación (que se desincroniza si alguien la cambia).
 */
export function EnvelopeScreen({
  isOpen,
  onOpen,
  onStartOpen,
  config,
}: EnvelopeScreenProps) {
  const [isOpening, setIsOpening] = useState(false);
  const { colors } = config.theme;
  const envelope = config.visuals.envelope;
  const hasEnvelopeImages = Boolean(envelope?.left && envelope?.right);

  if (isOpen) return null;

  const handleOpen = () => {
    if (isOpening) return;
    setIsOpening(true);
    onStartOpen?.();
  };

  if (!hasEnvelopeImages) {
    return (
      <AnimatePresence onExitComplete={onOpen}>
        {!isOpening && (
          <motion.div
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
            style={{
              background: `radial-gradient(circle at 50% 30%, ${colors.accentSoft}, ${colors.primary})`,
            }}
          >
            <Flower2
              className="mb-6 animate-float-slow"
              size={40}
              style={{ color: colors.accent }}
            />
            <p
              className="font-mono text-xs uppercase tracking-[0.3em] mb-4"
              style={{ color: colors.leaf }}
            >
              {config.client.eventType}
            </p>
            <h1
              className="font-display text-6xl md:text-8xl mb-10"
              style={{ color: colors.ink }}
            >
              {config.client.name}
            </h1>
            <motion.button
              onClick={handleOpen}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 px-8 py-4 rounded-full border shadow-lg backdrop-blur-sm"
              style={{
                borderColor: `${colors.accent}55`,
                backgroundColor: "rgba(255,255,255,0.6)",
                color: colors.ink,
              }}
            >
              <span className="font-mono text-xs uppercase tracking-widest font-semibold">
                Abrir invitación
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // Con cuerda = cortinas: se RECOGEN hacia su borde exterior (scaleX con
  // origen en el borde) y recién al final se desvanecen; `delay` deja ver
  // primero el tirón. Sin cuerda = solapas de un sobre (Karen): cada una se
  // DESLIZA hacia su lado mientras el broche se desvanece.
  const isCurtain = Boolean(envelope?.pullCord);
  // Solapas: fotogramas explícitos del mismo largo que `times` (con un `x`
  // de un solo valor + `times` de 3, Framer daba la animación por
  // terminada al instante y el sobre desaparecía sin deslizarse).
  const openLeft = isCurtain
    ? { scaleX: [1, 0.28, 0.28], opacity: [1, 1, 0] }
    : { x: ["0%", "-85%", "-100%"], opacity: [1, 1, 0] };
  const openRight = isCurtain
    ? openLeft
    : { x: ["0%", "85%", "100%"], opacity: [1, 1, 0] };
  const curtainTransition = {
    duration: isCurtain ? 1.6 : 1.4,
    ease: [0.65, 0, 0.35, 1] as const,
    delay: isCurtain ? 0.35 : 0.25,
    times: [0, 0.8, 1],
  };
  const closed = { scaleX: 1, x: "0%", opacity: 1 };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: "transparent" }}
    >
      {/* Capa base opaca: tapa el Hero desde el primer frame aunque las
          imágenes todavía no carguen. Se desmonta al abrir. */}
      <AnimatePresence>
        {!isOpening && (
          <motion.div
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="absolute inset-0 z-0"
            style={{ backgroundColor: colors.primary }}
          >
            {envelope?.complete && (
              <Image
                src={envelope.complete}
                alt=""
                fill
                priority
                sizes="100vw"
                className="object-cover object-center"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Solapa / cortina izquierda -- dispara onOpen cuando la animación
          de APERTURA termina. Se mira qué animación terminó (la de
          apertura es la única con `opacity` en fotogramas): al tocar,
          Framer también avisa el fin de la animación "cerrada" previa, ya
          con `isOpening` en true, y el sobre se desmontaba al instante. */}
      <motion.div
        initial={closed}
        animate={isOpening ? openLeft : closed}
        transition={curtainTransition}
        onAnimationComplete={(definition) => {
          const opacity = (definition as { opacity?: unknown }).opacity;
          if (isOpening && Array.isArray(opacity)) onOpen();
        }}
        className="absolute inset-0 z-10 w-full"
        style={{ transformOrigin: "left center" }}
      >
        <Image
          src={envelope!.left!}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      {/* Solapa / cortina derecha */}
      <motion.div
        initial={closed}
        animate={isOpening ? openRight : closed}
        transition={curtainTransition}
        className="absolute inset-0 z-10 w-full"
        style={{ transformOrigin: "right center" }}
      >
        <Image
          src={envelope!.right!}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      {/* Cuerda: cuelga del borde superior, a la derecha. Se puede
          arrastrar hacia abajo (drag en Y, con tope) o simplemente tocar;
          en ambos casos hace el "tirón" y abre. `dragSnapToOrigin` la
          devuelve a su lugar como una cuerda con peso. */}
      {envelope?.pullCord && (
        <motion.div
          // `right-[16%]` en móvil: la cartela del texto es más ancha que la
          // cuerda y, más pegada al borde, se salía de la pantalla.
          // Top negativo: la cuerda es enorme (ver alto abajo) y su tramo
          // superior queda fuera de pantalla -> se ve gruesa sin que la
          // borla baje más allá de ~34vh / ~38vh.
          className="absolute -top-[26vh] md:-top-[32vh] right-[16%] md:right-[14%] z-30 flex flex-col items-center"
          initial={{ y: 0, opacity: 1 }}
          animate={
            isOpening
              ? { y: [0, 70, -40], opacity: [1, 1, 0] }
              : { y: 0, opacity: 1 }
          }
          transition={{ duration: 0.9, times: [0, 0.35, 1] }}
        >
          <motion.button
            type="button"
            aria-label="Abrir invitación"
            onClick={handleOpen}
            drag={isOpening ? false : "y"}
            dragConstraints={{ top: 0, bottom: 90 }}
            dragElastic={0.15}
            dragSnapToOrigin
            onDragEnd={(_, info) => {
              if (info.offset.y > 35) handleOpen();
            }}
            // Balanceo suave mientras espera: invita a tocarla.
            animate={isOpening ? { rotate: 0 } : { rotate: [-1.5, 1.5, -1.5] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "top center", touchAction: "none" }}
            // El asset es una cuerda finita (172x2257 recortada): su grosor en
            // pantalla lo manda el alto (`object-contain`). Alto grande para
            // que se vea gruesa; el top negativo del contenedor evita que la
            // punta llegue al medio de la pantalla (ahí el "tirón" se perdía).
            className="relative w-20 h-[60vh] md:h-[70vh] cursor-grab active:cursor-grabbing"
          >
            {/* El asset es un lienzo ancho (500x587) con una cuerda finita en
                el centro: sin recortar, `object-contain` en un botón angosto
                la achicaba a ~75px. `e_trim` deja solo la cuerda -> ocupa
                todo el alto; el botón (w-16) sigue siendo fácil de tocar. */}
            <Image
              src={trimmedAsset(envelope.pullCord, 200)}
              alt=""
              fill
              priority
              sizes="120px"
              className="object-contain object-top pointer-events-none select-none"
              draggable={false}
            />
          </motion.button>
          {/* Carril de 180/220px (el ancho que tenía la cartela): fija el
              ancho de la columna, y por lo tanto la posición de la cuerda.
              La cartela, más grande, sobresale por igual a ambos lados
              (sigue centrada bajo la cuerda y entra en pantalla). */}
          <div className="-mt-1 w-[180px] md:w-[220px] flex justify-center">
            <AnimatePresence>
              {!isOpening && (
                // La cartela también es un botón: tocarla abre igual que
                // la cuerda (hay invitados que no descubren el arrastre).
                // Quieta, sin vaivén (a pedido); solo se desvanece al abrir.
                <motion.button
                  type="button"
                  onClick={handleOpen}
                  aria-label="Abrir invitación"
                  exit={{ opacity: 0 }}
                  // Texto sobre la cartela ornamental (821x320 recortada, la
                  // misma de Padres), centrado en su zona lisa (~64% del
                  // ancho): a 260/300px el texto más grande entra sin pisar
                  // los ornamentos.
                  className="shrink-0 flex items-center justify-center w-[260px] md:w-[300px] aspect-[821/320] font-mono text-[0.8rem] md:text-[0.9rem] font-bold uppercase tracking-[0.14em] whitespace-nowrap drop-shadow-lg cursor-pointer"
                  style={{
                    color: colors.accent,
                    backgroundImage: `url("${trimmedAsset(ASSETS.cartela, 500)}")`,
                    backgroundSize: "100% 100%",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  Abrir invitación
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Broche / sello -- abre al tocarlo. Solo sin cuerda: con cuerda,
          ella y su cartela son la forma de abrir y el centro queda libre.
          `seal` también es el favicon (layout.tsx). */}
      <AnimatePresence>
        {!isOpening && !envelope?.pullCord && (
          <motion.div
            exit={{ opacity: 0, scale: 1.4 }}
            transition={{ duration: 0.4 }}
            className="relative z-20"
          >
            {envelope?.seal ? (
              <motion.button
                onClick={handleOpen}
                whileHover={{ scale: 1.06, rotate: 2 }}
                whileTap={{ scale: 0.94 }}
                className="relative w-[170px] h-[170px] md:w-[260px] md:h-[260px] cursor-pointer drop-shadow-2xl animate-pulse-slow"
                aria-label="Abrir invitación con el sello"
              >
                <Image
                  src={envelope.seal}
                  alt="Sello de invitación"
                  fill
                  priority
                  sizes="(max-width: 768px) 200px, 280px"
                  className="object-contain"
                  // Imágenes locales (/public): el loader custom no genera
                  // variantes de ancho -> `unoptimized`. Cloudinary sí.
                  unoptimized={!envelope.seal.includes("res.cloudinary.com")}
                />
              </motion.button>
            ) : (
              <button
                onClick={handleOpen}
                className="flex items-center gap-3 px-8 py-4 rounded-full border shadow-lg backdrop-blur-sm"
                style={{
                  borderColor: `${colors.accent}55`,
                  backgroundColor: "rgba(255,255,255,0.7)",
                  color: colors.ink,
                }}
              >
                <MailOpen size={18} style={{ color: colors.accent }} />
                <span className="font-mono text-xs uppercase tracking-widest font-semibold">
                  Abrir invitación
                </span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
