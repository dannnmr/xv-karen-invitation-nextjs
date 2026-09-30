import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  DM_Mono,
  Poppins,
  Great_Vibes,
  Pinyon_Script,
} from "next/font/google";
import { invitationConfig } from "@/config/invitation";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

// Mismo sistema tipográfico que xv-andrea-carolina, a pedido explícito: es
// la `font-script` global que usan las demás secciones.
const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-great-vibes",
  display: "swap",
});

// Pinyon Script puntual (no reemplaza a Great Vibes arriba): solo Hero,
// Footer y Pase usan esta cursiva distinta al resto -- ver
// `--font-pinyon-script` en globals.css, mismo criterio que Andrea Carolina.
const pinyonScript = Pinyon_Script({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pinyon",
  display: "swap",
});

// Dominio SUPUESTO por la convención de las demás invitaciones
// (xv-luciana-invitation) -- PENDIENTE confirmar con Daniela antes de
// publicar: un dominio equivocado deja el preview de WhatsApp sin imagen.
const siteUrl = "https://karen-xv-invitation.danmr.com";
const title = "Karen — Mis XV Años";
const description =
  "Entre el encanto de una época dorada y la magia de un sueño hecho realidad: te invito a celebrar mis quince años el 24 de octubre.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  // Ícono de la pestaña del navegador: reutiliza el broche del sobre. Sin
  // ese asset todavía, degrada sin ícono custom en vez de romper el build.
  ...(invitationConfig.visuals.envelope?.seal
    ? { icons: { icon: invitationConfig.visuals.envelope.seal } }
    : {}),
  // Vista previa al compartir el link (WhatsApp, etc.): 1600x900, 236 KB
  // (WhatsApp no muestra miniaturas de más de ~300 KB). Ruta relativa ->
  // se resuelve contra `metadataBase`.
  openGraph: {
    title,
    description,
    url: siteUrl,
    type: "website",
    locale: "es_BO",
    images: [
      {
        url: "/images/metadata_karen.png",
        width: 1600,
        height: 900,
        alt: "Karen Rodriguez — Mis XV Años",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/metadata_karen.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${cormorant.variable} ${poppins.variable} ${dmMono.variable} ${greatVibes.variable} ${pinyonScript.variable} h-full antialiased`}
    >
      {/* Adelanta la conexión al cloud de Cloudinary (DNS+TLS) desde el
          primer byte de HTML, antes de que React siquiera hidrate --
          ayuda a que la foto del Hero llegue antes de que el sobre
          termine de abrirse. */}
      <link rel="preconnect" href="https://res.cloudinary.com" />
      <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
