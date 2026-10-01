"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Music as MusicIcon, Music2, RotateCw } from "lucide-react";
import { suggestSong, type MusicFormState } from "@/actions/music";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LaceFrame } from "@/components/ui/LaceFrame";
import { Ornament, OrnamentDivider } from "@/components/ui/Ornament";
import { ASSETS, type InvitationConfig } from "@/config/invitation";

const initialState: MusicFormState = { status: "idle" };

// Notas subiendo desde la cartela (columna, ícono, tamaño, desfase).
const NOTES = [
  { left: "12%", Icon: MusicIcon, size: 24, delay: 0 },
  { left: "32%", Icon: Music2, size: 19, delay: -1.6 },
  { left: "62%", Icon: MusicIcon, size: 21, delay: -3.1 },
  { left: "82%", Icon: Music2, size: 25, delay: -0.8 },
];

/**
 * Sugerencias de canciones -- misma lógica que xv-andrea-carolina (Server
 * Action `suggestSong`, honeypot, rate limit, tabla `musica_karen`); solo
 * cambia el diseño, en el idioma de Karen: cortinaje de tela arriba, par
 * de máscaras venecianas
 * meciéndose, título + ornamento dorado y el campo dentro de la cartela de
 * encaje, con notas musicales subiendo.
 */
export function MusicSection({ config }: { config: InvitationConfig }) {
  const [state, formAction, isPending] = useActionState(
    suggestSong,
    initialState,
  );
  const { colors } = config.theme;
  const formRef = useRef<HTMLFormElement>(null);
  const [justSent, setJustSent] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  // El formulario se queda siempre visible -- un invitado puede sugerir
  // varias canciones. `useActionState` devuelve un objeto nuevo en cada
  // envío: se detecta comparando contra el último visto (ajuste de estado
  // durante el render, patrón oficial de React).
  const [prevState, setPrevState] = useState(state);
  if (state !== prevState) {
    setPrevState(state);
    if (state.status === "success") {
      setSentCount((c) => c + 1);
      setJustSent(true);
    }
  }

  useEffect(() => {
    if (!justSent) return;
    formRef.current?.reset();
    const t = setTimeout(() => setJustSent(false), 2800);
    return () => clearTimeout(t);
  }, [justSent]);

  return (
    <section className="relative py-5 px-6 flex flex-col items-center overflow-hidden">
      {/* Cortinaje de tela colgando arriba, como el lazo de un escenario,
          detrás de las máscaras. */}
      <Ornament
        src={ASSETS.tela}
        className="-top-3 left-[4%] right-[4%] md:left-[32%] md:right-[32%] aspect-400/236 z-0"
        sizes="(max-width: 768px) 92vw, 36vw"
        motion="none"
      />
      {/* Enredaderas doradas meciéndose a los dos lados (simétricas). */}
      <Ornament
        src={ASSETS.floresDoradas}
        className="top-[30%] -left-8 md:left-[12%] w-20 h-40 md:w-24 md:h-52 z-0"
        sizes="96px"
        motion="float-medium"
      />
      <Ornament
        src={ASSETS.floresDoradas}
        className="top-[30%] -right-8 md:right-[12%] w-20 h-40 md:w-24 md:h-52 z-0"
        sizes="96px"
        motion="float-medium"
        delay="-2.5s"
        flipX
      />
      <div className="relative z-10 max-w-lg w-full flex flex-col items-center">
        {/* Par de máscaras venecianas (baile de máscaras): dorada y negra
            cruzadas, meciéndose a destiempo como colgantes. */}
        <div className="relative w-52 h-28 md:w-60 md:h-32 mb-1">
          <Ornament
            src={ASSETS.mascaraDorada}
            className="left-2 top-1 w-28 h-20 md:w-32 md:h-23 -rotate-12 z-10"
            sizes="128px"
            motion="sway"
          />
          <Ornament
            src={ASSETS.mascaraNegra}
            className="right-2 top-0 w-24 h-25 md:w-28 md:h-29 rotate-12"
            sizes="112px"
            motion="sway"
            delay="-2s"
          />
        </div>

        <SectionHeader
          eyebrow="Playlist"
          title="Música"
          colors={colors}
          className="mb-3"
        />
        <OrnamentDivider src={ASSETS.ornamento} className="mb-5" />
        <p
          className="font-display italic text-lg md:text-xl text-center mb-4"
          style={{ color: colors.ink, opacity: 0.85 }}
        >
          ¿Qué canción no puede faltar en la fiesta?
        </p>

        <AnimatePresence>
          {justSent && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.5 }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full mb-3 border shadow-sm"
              style={{
                backgroundColor: colors.paper,
                borderColor: `${colors.gold}80`,
              }}
            >
              <MusicIcon size={15} color={colors.accent} />
              <span
                className="font-sans text-xs font-medium"
                style={{ color: colors.ink }}
              >
                ¡Añadida a la playlist!{" "}
                {sentCount > 1 ? `(van ${sentCount} tuyas)` : ""}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cartela de encaje (1000x390 recortada): zona lisa ~12-88% del
            ancho y ~20-80% del alto -> padding en % del ANCHO. Notas
            musicales subiendo desde su borde superior (más grande: es la
            pieza central de la sección). */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-[12%] h-0 pointer-events-none"
          >
            {NOTES.map(({ left, Icon, size, delay }, i) => (
              <Icon
                key={i}
                size={size}
                color={colors.accent}
                strokeWidth={1.6}
                className="absolute bottom-0 animate-rise"
                style={{ left, animationDelay: `${delay}s` }}
              />
            ))}
          </div>
          <LaceFrame
            src={config.visuals.musicFrame}
            padding="8.5% 15%"
            className="w-[min(96vw,520px)] aspect-[1000/390] flex items-center"
            fallbackColor={colors.paper}
          >
            <form
              ref={formRef}
              action={formAction}
              className="w-full flex items-center gap-2"
            >
              <input
                name="cancion"
                required
                maxLength={150}
                aria-label="Canción que no puede faltar"
                placeholder="Canción - artista"
                // `text-base` (16px): con menos, iOS Safari hace zoom al enfocar.
                className="flex-1 min-w-0 h-10 md:h-11 rounded-full border px-4 font-display italic text-base focus:outline-none placeholder-black/35"
                style={{
                  color: colors.ink,
                  backgroundColor: "rgba(255,255,255,0.8)",
                  borderColor: `${colors.gold}90`,
                }}
              />
              <button
                type="submit"
                disabled={isPending}
                aria-label="Enviar canción"
                className="shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center shadow-md disabled:opacity-60"
                style={{ backgroundColor: colors.accent }}
              >
                {isPending ? (
                  <RotateCw
                    size={16}
                    className="animate-spin"
                    color={colors.paper}
                  />
                ) : (
                  <Send size={16} color={colors.paper} />
                )}
              </button>
              <input
                type="text"
                name="sitioWeb"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] w-px h-px opacity-0"
              />
            </form>
          </LaceFrame>
        </div>

        <p
          className="font-display italic text-sm md:text-base mt-2"
          style={{ color: colors.ink, opacity: 0.65 }}
        >
          Puedes sugerir todas las que quieras
        </p>

        <AnimatePresence>
          {state.status === "error" && (
            <motion.p
              role="alert"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center font-sans text-xs mt-3"
              style={{ color: "#B3261E" }}
            >
              {state.message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
