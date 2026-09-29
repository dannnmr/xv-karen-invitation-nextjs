import type { CSSProperties, ReactNode } from "react";
import type { InvitationConfig } from "@/config/invitation";

/**
 * Tratamiento de título replicado de SectionHeader.tsx (abril/P3): eyebrow
 * corto sobre un título en fuente SCRIPT (no serif display) con leve
 * sombra. Se extrae como componente porque ya se repite en 7 secciones
 * (Itinerario, Ubicación, Dress Code, Regalos, RSVP, Música, Pases) --
 * antes cada una definía su propio título con estilos ligeramente
 * distintos, que fue justo la inconsistencia reportada.
 *
 * `titleClassName` (opcional) reemplaza solo el tamaño/interlineado del
 * título -- abril hace lo mismo en su propio SectionHeader (ej. "RSVP",
 * que como sigla de 4 letras en script queda mejor más chico que un
 * título normal).
 */
export function SectionHeader({
  eyebrow,
  eyebrowColor,
  title,
  colors,
  className = "",
  titleClassName,
  titleStyle,
  variant = "solid",
}: {
  eyebrow?: ReactNode;
  /** Override del color del eyebrow (default `colors.leaf`, oscuro).
   * `colors.leaf` solo funciona sobre una superficie clara (ej. RSVP, que
   * envuelve este header en su `GlassCard` blanca) -- una sección que
   * muestra el header directo sobre el fondo oscuro de página debe pasar
   * un color claro acá (ej. `colors.paper`), si no el eyebrow queda
   * invisible (oscuro sobre oscuro). */
  eyebrowColor?: string;
  title: ReactNode;
  colors: InvitationConfig["theme"]["colors"];
  className?: string;
  titleClassName?: string;
  /** Override puntual (ej. `fontFamily`) para una sección que necesita
   * calcar una tipografía distinta a la `font-script` global -- no cambia
   * el default de las demás secciones que usan este componente. */
  titleStyle?: CSSProperties;
  /**
   * "outline": título en trazo hueco (`WebkitTextStroke`, relleno
   * transparente) en vez de sólido -- análisis de gredmarie/invitation_test_idea
   * (ver invitation-master/reference.md, "Candidatos reutilizables"), 1er
   * uso real acá. Puramente CSS, sin costo de rendimiento.
   */
  variant?: "solid" | "outline";
}) {
  return (
    <div className={`text-center mb-8 ${className}`}>
      {eyebrow && (
        <p
          className="font-mono text-[0.65rem] md:text-xs uppercase tracking-[0.4em] mb-2 font-medium"
          style={{ color: eyebrowColor ?? colors.leaf }}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={`font-script leading-tight ${titleClassName ?? "text-5xl md:text-6xl lg:text-7xl"}`}
        style={
          variant === "outline"
            ? {
                color: "transparent",
                WebkitTextStroke: `1px ${colors.accent}`,
                ...titleStyle,
              }
            : {
                color: colors.accent,
                textShadow: "0 2px 10px rgba(0,0,0,0.08)",
                ...titleStyle,
              }
        }
      >
        {title}
      </h2>
    </div>
  );
}
