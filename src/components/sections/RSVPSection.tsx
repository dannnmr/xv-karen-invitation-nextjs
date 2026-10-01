"use client";

import {
  useActionState,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Check, Heart, RotateCw } from "lucide-react";
import { submitRsvp, type RsvpFormState } from "@/actions/rsvp";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LaceFrame, trimmedAsset } from "@/components/ui/LaceFrame";
import { Ornament } from "@/components/ui/Ornament";
import { ASSETS, type InvitationConfig } from "@/config/invitation";

type Asistencia = "si" | "no";
type StoredRsvp = { nombre: string; asistencia: Asistencia };
type FormState = RsvpFormState & Partial<StoredRsvp>;

const initialState: FormState = { status: "idle" };

/** Respuesta ya enviada desde este navegador (ver `rsvp:<id>` abajo). */
function readStoredRsvp(key: string): StoredRsvp | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? "null");
    if (parsed?.asistencia === "si" || parsed?.asistencia === "no") {
      return { nombre: String(parsed.nombre ?? ""), asistencia: parsed.asistencia };
    }
  } catch {
    // localStorage no disponible / JSON corrupto -> se muestra el form.
  }
  return null;
}

/**
 * RSVP con Supabase (reemplaza la confirmación por WhatsApp). 1 pase por
 * confirmación: nombre + "Sí, asistiré" / "No podré asistir" -> Server
 * Action `submitRsvp` (validación, honeypot, rate limit) -> tabla
 * `invitados_karen` -> Google Sheet (trigger, ver supabase/schema.sql).
 *
 * Tres vistas sobre el mismo encaje (`LaceFrame`) + corazón de encaje:
 * - formulario;
 * - "ya confirmaste": tras enviar, y al volver a abrir la invitación en el
 *   mismo navegador (marca en `localStorage`). SIN opción de editar (pedido
 *   de la clienta). No frena otro dispositivo ni modo incógnito;
 * - "confirmaciones cerradas": pasado `config.rsvp.deadline`.
 *
 * Las lecturas de `localStorage`/fecha van en inicializadores de estado:
 * la sección solo se monta en el cliente (LazyMount), sin desfase de SSR.
 */
export function RSVPSection({ config }: { config: InvitationConfig }) {
  const { colors } = config.theme;
  const storageKey = `rsvp:${config.id}`;
  const [stored] = useState(() => readStoredRsvp(storageKey));
  const [isClosed] = useState(
    () => Date.now() > config.rsvp.deadline.getTime(),
  );
  const [attending, setAttending] = useState<Asistencia>("si");
  const [guestName, setGuestName] = useState("");
  // El aviso aparece solo después de intentar confirmar sin nombre.
  const [showNameError, setShowNameError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Envoltorio de la Server Action: recuerda la respuesta en este
  // navegador solo si el servidor la guardó.
  const [state, formAction, isPending] = useActionState(
    async (prev: FormState, formData: FormData): Promise<FormState> => {
      const result = await submitRsvp(prev, formData);
      if (result.status !== "success") return result;
      const answer: StoredRsvp = {
        nombre: String(formData.get("nombre") ?? "").trim(),
        asistencia: formData.get("asistencia") === "no" ? "no" : "si",
      };
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ ...answer, ts: Date.now() }),
        );
      } catch {
        // Sin persistencia: la respuesta ya quedó guardada en el servidor.
      }
      return { ...result, ...answer };
    },
    initialState,
  );

  const confirmed: StoredRsvp | null =
    state.status === "success" && state.asistencia
      ? { nombre: state.nombre ?? "", asistencia: state.asistencia }
      : stored;
  const closed = !confirmed && (isClosed || state.status === "closed");
  const missingName = guestName.trim().length < 2;

  let content: ReactNode;
  if (confirmed) {
    content = <ConfirmedView answer={confirmed} colors={colors} />;
  } else if (closed) {
    content = (
      <div className="flex flex-col items-center text-center">
        <SectionHeader
          eyebrow="Reserva tu lugar"
          title="Confirmaciones cerradas"
          colors={colors}
          className="mb-4"
          titleClassName="text-[2rem] md:text-[2.8rem] leading-[0.95]"
        />
        <p
          className="font-display italic text-base md:text-lg leading-snug"
          style={{ color: colors.ink, opacity: 0.8 }}
        >
          El plazo para confirmar terminó el{" "}
          {config.rsvp.deadline.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
          })}
          . ¡Gracias por tu cariño!
        </p>
      </div>
    );
  } else {
    content = (
      <>
        <SectionHeader
          eyebrow="Reserva tu lugar"
          title="Confirma tu asistencia"
          colors={colors}
          className="mb-4"
          titleClassName="text-[2.2rem] md:text-[3rem] leading-[0.95]"
        />
        <p
          className="font-sans text-[0.65rem] md:text-xs tracking-[0.12em] uppercase mb-5 text-center"
          style={{ color: colors.ink, opacity: 0.75 }}
        >
          Confirmar antes del{" "}
          {config.rsvp.deadline.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
          })}
        </p>

        <form
          action={formAction}
          onSubmit={(e) => {
            if (missingName) {
              e.preventDefault();
              setShowNameError(true);
              inputRef.current?.focus();
            }
          }}
          noValidate
        >
          <label
            htmlFor="nombre"
            className="block font-sans text-[0.7rem] md:text-xs uppercase tracking-[0.2em] font-semibold mb-2 text-center"
            style={{ color: colors.accent }}
          >
            Escribe tu nombre completo
          </label>
          {/* Campo en caja (no una línea fina): que se note que hay que
              llenarlo antes de confirmar. */}
          <input
            ref={inputRef}
            id="nombre"
            name="nombre"
            value={guestName}
            onChange={(e) => {
              setGuestName(e.target.value);
              if (showNameError) setShowNameError(false);
            }}
            placeholder="Ej. María Pérez"
            autoComplete="name"
            maxLength={120}
            required
            aria-invalid={showNameError}
            aria-describedby={showNameError ? "nombreError" : undefined}
            // `text-base` (16px): con menos, iOS Safari hace zoom al enfocar.
            className="w-full rounded-xl border-[1.5px] px-4 py-3 text-center font-display italic text-base shadow-inner focus:outline-none focus:ring-2 placeholder-black/35"
            style={
              {
                color: colors.ink,
                backgroundColor: "rgba(255,255,255,0.85)",
                borderColor: showNameError ? "#B3261E" : colors.gold,
                "--tw-ring-color": `${colors.gold}55`,
              } as CSSProperties
            }
          />
          <p
            id="nombreError"
            role="alert"
            className="min-h-5 mt-1.5 mb-1 font-sans text-[0.65rem] text-center"
            style={{ color: "#B3261E" }}
          >
            {showNameError && "Por favor, escribe tu nombre para confirmar."}
          </p>

          {/* Dos opciones explícitas (no un checkbox), una debajo de la
              otra (pedido de la clienta). */}
          <input type="hidden" name="asistencia" value={attending} />
          <div
            className="flex flex-col gap-2 mb-4"
            role="radiogroup"
            aria-label="¿Asistirás?"
          >
            {(
              [
                { value: "si", label: "Sí, asistiré" },
                { value: "no", label: "No podré asistir" },
              ] as const
            ).map((option) => {
              const isSelected = attending === option.value;
              return (
                <button
                  type="button"
                  key={option.value}
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setAttending(option.value)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl border-[1.5px] font-sans text-[0.65rem] md:text-[0.7rem] uppercase tracking-[0.18em] font-semibold text-left transition-colors"
                  style={{
                    borderColor: colors.gold,
                    backgroundColor: isSelected
                      ? `${colors.gold}30`
                      : "rgba(255,255,255,0.6)",
                    color: colors.accent,
                  }}
                >
                  <span
                    className="w-4 h-4 rounded-full border flex items-center justify-center shrink-0"
                    style={{
                      borderColor: colors.accent,
                      backgroundColor: isSelected ? colors.accent : "#fff",
                    }}
                  >
                    {isSelected && (
                      <Check size={10} strokeWidth={3} color={colors.paper} />
                    )}
                  </span>
                  {option.label}
                </button>
              );
            })}
          </div>

          {/* Honeypot: oculto visualmente, presente en el DOM para bots. */}
          <input
            type="text"
            name="sitioWeb"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute -left-[9999px] w-px h-px opacity-0"
          />

          {state.status === "error" && (
            <p
              role="alert"
              className="font-sans text-[0.65rem] text-center mb-3"
              style={{ color: "#B3261E" }}
            >
              {state.message}
            </p>
          )}

          <motion.button
            type="submit"
            disabled={isPending}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-sans text-[0.7rem] uppercase tracking-[0.25em] font-semibold shadow-md transition-opacity"
            style={{
              backgroundColor: colors.accent,
              color: colors.paper,
              boxShadow: `0 10px 22px ${colors.accent}40`,
              // Atenuado (no deshabilitado) sin nombre: sigue tocable para
              // mostrar el aviso de por qué no avanza.
              opacity: isPending ? 0.7 : missingName ? 0.6 : 1,
            }}
          >
            {isPending ? (
              <>
                <RotateCw size={15} className="animate-spin" /> Enviando...
              </>
            ) : (
              "Confirmar"
            )}
          </motion.button>
        </form>
      </>
    );
  }

  return (
    <section className="relative py-20 px-6 flex flex-col items-center overflow-hidden">
      {/* En móvil el encaje es más ancho que la pantalla (el overflow de la
          sección recorta los bordes de encaje) para que la zona lisa tenga
          espacio para el formulario. */}
      <div className="relative w-[92vw] max-w-[560px] shrink-0">
        {/* Corazón de encaje asomando por detrás del marco (arriba a la
            derecha), inclinado. */}
        <div
          aria-hidden="true"
          className="absolute -top-14 right-[6%] md:-right-16 w-[130px] h-[118px] md:w-[170px] md:h-[154px] rotate-12 pointer-events-none"
        >
          {/* Flota (hijo propio: el wrapper ya tiene su `rotate`). */}
          <div className="absolute inset-0 animate-float-slow">
            <Image
              src={trimmedAsset(ASSETS.corazonEncaje, 400)}
              alt=""
              fill
              sizes="170px"
              className="object-contain"
            />
          </div>
        </div>

        {/* Enredadera trepando por el borde izquierdo del encaje (delante:
            detrás la tapaba el encaje), con una flor dorada en su base:
            contrapeso diagonal del corazón. */}
        <Ornament
          src={ASSETS.floresDoradas}
          className="-left-5 md:-left-12 bottom-[6%] w-16 h-35 md:w-22 md:h-48 z-10"
          sizes="88px"
          motion="float-medium"
        />
        <Ornament
          src={ASSETS.florDorada}
          className="-left-4 md:-left-10 -bottom-3 w-16 h-16 md:w-20 md:h-20 -rotate-12 z-10"
          sizes="80px"
          width={300}
          delay="-2s"
        />

        <LaceFrame
          src={config.visuals.rsvpFrame}
          // Zona lisa del asset (500x613): 16-82% del ancho, 16.6-83.3% del
          // alto. El form (con sí/no) no entra en el aspect ratio, así que
          // el marco crece y su borde (~16.6% del ALTO) engorda; el padding
          // vertical (% del ANCHO) tiene que cubrirlo: p >= 0.25 * alto del
          // contenido -> 30% alcanza en móvil (~450px con las opciones en
          // vertical).
          padding="30% 20% 30% 18%"
          className="aspect-[500/613] flex flex-col justify-center"
          fallbackColor={colors.paper}
        >
          {content}
        </LaceFrame>
      </div>
    </section>
  );
}

function ConfirmedView({
  answer,
  colors,
}: {
  answer: StoredRsvp;
  colors: InvitationConfig["theme"]["colors"];
}) {
  const attends = answer.asistencia === "si";
  const firstName = answer.nombre.split(/\s+/)[0];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center text-center"
    >
      <div
        className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mb-4 border-[1.5px]"
        style={{ borderColor: colors.gold, backgroundColor: `${colors.gold}18` }}
      >
        {attends ? (
          <Check size={30} strokeWidth={1.5} color={colors.accent} />
        ) : (
          <Heart size={28} strokeWidth={1.5} color={colors.accent} />
        )}
      </div>
      <p
        className="font-mono text-[0.65rem] md:text-xs uppercase tracking-[0.35em] mb-2"
        style={{ color: colors.ink }}
      >
        {attends ? "¡Te esperamos!" : "Gracias por avisarnos"}
      </p>
      <h3
        className="font-script text-[2.6rem] md:text-[3.4rem] leading-none mb-3"
        style={{ color: colors.accent }}
      >
        {attends ? "Confirmado" : "Te extrañaremos"}
      </h3>
      <p
        className="font-display italic text-base md:text-lg leading-snug"
        style={{ color: colors.ink, opacity: 0.8 }}
      >
        {firstName ? `${firstName}, ` : ""}
        {attends
          ? "tu asistencia ya quedó registrada."
          : "lamentamos que no puedas acompañarnos. Tu respuesta quedó registrada."}
      </p>
    </motion.div>
  );
}
