import Image from "next/image";
import { DecorationField } from "@/components/ui/DecorationField";
import {
  invitationConfig,
  type DecorationSpec,
  type InvitationConfig,
} from "@/config/invitation";

// "Jardín" a los pies de la quinceañera: dos ramos en espejo que suben
// desde el ruedo del vestido, POR DETRÁS de la foto (ella queda delante de
// las flores). Dos capas para dar profundidad: lirios (flores7) más afuera
// y atrás, tulipanes (flores_1, la flor de la temática) más adentro y
// adelante. Plantas con tallo -> ancladas abajo y SIN animación. Los tallos
// de ambos assets vienen recortados abajo: el `mask-image` del wrapper los
// desvanece en vez de mostrar el corte seco.
// Capa delantera vacía a propósito: con los lirios de atrás alcanza, dos
// capas del mismo lirio recargaban los pies de la pareja.
const TULIPS = "";
const LILIES = invitationConfig.visuals.heroDecorations[0]?.src ?? ""; // lirios de la pareja
const plant = (
  src: string,
  position: "bottom-left" | "bottom-right",
  width: number,
  offset: { x: number; y: number },
): DecorationSpec => ({
  motif: "flower",
  tone: "accent",
  position,
  src,
  width,
  height: Math.round((width * 536) / 400), // ambos assets son 400x536
  loop: "none",
  flipX: position === "bottom-right",
  offset: {
    x: position === "bottom-right" ? -offset.x : offset.x,
    y: offset.y,
  },
});
// Orden = orden de pintado: lirios primero (atrás), tulipanes encima.
// El lado derecho es a propósito un poco más chico y más bajo: con el
// espejo exacto, las dos mariposas del asset de tulipanes quedaban gemelas
// (misma altura, misma pose) y delataban que es la misma imagen reflejada.
const GARDEN_MOBILE = [
  plant(LILIES, "bottom-left", 112, { x: -8, y: 24 }),
  plant(LILIES, "bottom-right", 104, { x: -4, y: 30 }),
  plant(TULIPS, "bottom-left", 128, { x: 40, y: 24 }),
  plant(TULIPS, "bottom-right", 114, { x: 44, y: 36 }),
];
const GARDEN_DESKTOP = [
  plant(LILIES, "bottom-left", 150, { x: -30, y: 48 }),
  plant(LILIES, "bottom-right", 140, { x: -24, y: 56 }),
  plant(TULIPS, "bottom-left", 170, { x: 20, y: 48 }),
  plant(TULIPS, "bottom-right", 152, { x: 26, y: 64 }),
];
// Desvanece el último ~30% (donde vienen los tallos recortados).
const STEM_FADE = "linear-gradient(to bottom, #000 68%, transparent 100%)";

/**
 * Contenido/composición: divisor-eyebrow-divisor, nombre gigante en
 * script, subtítulo de despedida. La tarjeta de contacto del pie es un
 * card blanca con hover-lift. Fondo plano (`colors.primary`) -- sin la
 * imagen de fondo NY de la base clonada, ajena a esta temática.
 * Sin estado ni hooks -> Server Component (el hover es solo CSS).
 */
export function FooterSection({ config }: { config: InvitationConfig }) {
  const { colors } = config.theme;

  return (
    <footer className="relative pt-10 pb-5 px-6 flex flex-col items-center overflow-hidden">
      <div className="relative z-10 flex flex-col items-center text-center w-full px-4">
        <div className="flex items-center gap-4 mb-1.5">
          <div
            className="w-10 h-px"
            style={{ backgroundColor: `${colors.accent}30` }}
          />
          <p
            className="font-sans text-[0.6rem] md:text-xs tracking-[0.4em] uppercase font-bold"
            style={{ color: colors.accent }}
          >
            ¡Listos para celebrar!
          </p>
          <div
            className="w-10 h-px"
            style={{ backgroundColor: `${colors.accent}30` }}
          />
        </div>

        <h2
          className="font-pinyon-script text-[3rem] sm:text-[5rem] md:text-[6rem] leading-[0.85]"
          style={{
            color: colors.accent,
            textShadow: `0 10px 20px ${colors.accent}25`,
          }}
        >
          {config.client.name}
        </h2>
      </div>

      {/* Imagen de cierre (`visuals.footerImage`), antes de la tarjeta de
          contacto. Opcional: sin ella, el footer queda como antes. */}
      {config.visuals.footerImage && (
        <div className="relative z-10 w-48 h-64 md:w-60 md:h-80 mt-6">
          {/* Capa del jardín: el DOBLE de ancho que la foto (centrada), así
              los ramos tienen lugar a los costados -- el `mask-image` recorta
              todo lo que queda fuera de la caja del wrapper, por eso no puede
              ser del mismo ancho que la foto. Va antes que la foto en el DOM
              y en z-0 -> queda detrás del vestido. */}
          <div
            aria-hidden="true"
            className="absolute -left-1/2 -right-1/2 top-0 bottom-0 z-0 pointer-events-none"
            style={{ maskImage: STEM_FADE, WebkitMaskImage: STEM_FADE }}
          >
            <DecorationField
              decorations={GARDEN_MOBILE}
              colors={colors}
              wrapperClassName="absolute inset-0 md:hidden"
            />
            <DecorationField
              decorations={GARDEN_DESKTOP}
              colors={colors}
              wrapperClassName="absolute inset-0 hidden md:block"
            />
          </div>
          <Image
            src={config.visuals.footerImage}
            alt={`${config.client.name} - ${config.client.eventType}`}
            fill
            sizes="(max-width: 768px) 192px, 240px"
            className="object-contain drop-shadow-md z-10"
          />
        </div>
      )}
      <p
        className="font-sans text-xs tracking-[0.3em] font-light mt-4 mb-4 uppercase max-w-sm"
        style={{ color: colors.ink, opacity: 0.7 }}
      >
        Vive la experiencia por ti mismo.
      </p>

      {/* Firma / tarjeta de contacto */}
      <div
        className="relative z-10 flex flex-col items-center pt-4 mt-3 border-t w-full max-w-sm"
        style={{ borderColor: `${colors.accent}15` }}
      >
        <a
          // Pasa por /contacto (registra de qué invitación vino el toque y
          // redirige a WhatsApp con el mensaje de siempre) -- ver
          // src/app/contacto/route.ts. <a> plano, NO <Link>: el prefetch de
          // Next haría un GET y contaría toques que nadie hizo. `nofollow`
          // para que los buscadores no lo sigan.
          href="/contacto"
          target="_blank"
          rel="nofollow noopener noreferrer"
          className="group flex items-center justify-between gap-6 w-full px-6 py-3 rounded-2xl border shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
          style={{ backgroundColor: "#fff", borderColor: "rgba(0,0,0,0.05)" }}
        >
          <div className="flex flex-col text-left min-w-0">
            <span
              className="font-mono text-[0.5rem] font-extrabold uppercase tracking-[0.2em]"
              style={{ color: colors.accent }}
            >
              Digital Invitation Design
            </span>
            <span
              className="font-sans text-sm font-extrabold uppercase tracking-wide mt-1"
              style={{ color: colors.ink }}
            >
              Daniela Miranda
            </span>
            <span
              className="font-sans text-xs mt-1"
              style={{ color: colors.ink, opacity: 0.6 }}
            >
              ¿Quieres una invitación como esta?
            </span>
          </div>

          <div
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide shrink-0 transition-colors duration-300"
            style={{ backgroundColor: colors.ink, color: "#fff" }}
          >
            <span>Escribir</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </div>
        </a>
      </div>
    </footer>
  );
}
