/**
 * Config tipada del evento — XV Karen (victoriana / barroca / veneciana).
 * Scaffold clonado de boda-ronaldo-alejandra-nextjs-supabase; ver README.
 * Todo lo que hay aquí está diseñado para ser público (skill
 * invitation-master, sección 7). Nada de esto va a variables de entorno.
 */

export interface ItineraryItem {
  time: string;
  title: string;
  description?: string;
  image?: string;
}

/**
 * Motivos decorativos posicionados (ver DecorationField). `position` es un
 * union cerrado; `src: ""` = no dibujar nada; sin `src`, ícono de respaldo.
 */
export type DecorationPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface DecorationSpec {
  motif: "flower" | "sparkle" | "leaf";
  position: DecorationPosition;
  tone: "accent" | "leaf" | "gold";
  size?: number;
  delay?: string;
  src?: string;
  alt?: string;
  /** Desplazamiento en px sobre la posición nombrada (sangrar fuera del borde). */
  offset?: { x?: number; y?: number };
  /** Inclinación ESTÁTICA en grados (positivo = horario). */
  rotate?: number;
  /** Sin `loop` = float suave; "sway" = oscila; "none" = fijo. */
  loop?: "sway" | "none";
  /** Espeja el motivo en X (reusar un asset del lado opuesto). */
  flipX?: boolean;
  blend?: "normal" | "multiply";
  opacity?: number;
  width?: number;
  height?: number;
}

export interface GiftPreference {
  label: string;
  detail?: string;
  image?: string;
}

export interface InvitationConfig {
  /**
   * Slug único de esta invitación: amarra el rastreo de contactos
   * (`contact_clicks.invitation`, ver src/app/contacto/route.ts) en el
   * proyecto Supabase compartido entre invitaciones.
   */
  id: string;
  client: {
    name: string;
    eventType: string;
    dedication: string;
  };
  /**
   * Familias (ParentsSection): uno o más grupos de dos nombres. Un grupo
   * con `label` vacío no muestra etiqueta (XV: una sola pareja de padres).
   */
  families?: {
    topLabel: string;
    groups: { label: string; names: [string, string] }[];
    invitationText: string;
  };
  event: {
    // Inicio del evento (el primer lugar de `venues`): countdown, .ics.
    date: Date;
    startTime: string;
    // Uno o más lugares en orden cronológico. `url` opcional: sin link de
    // Maps no se dibuja el botón de mapa.
    venues: {
      label: string;
      time: string;
      name: string;
      address: string;
      url?: string;
    }[];
  };
  itinerary: ItineraryItem[];
  dressCode: {
    description: string;
    // Cada color: `imageSrc` > `hex` > `tone` (referencia a theme.colors).
    colors: {
      name: string;
      tone?: "accent" | "leaf" | "gold";
      hex?: string;
      imageSrc?: string;
    }[];
    image?: string; // imagen central del círculo
  };
  /** Regalos: lluvia de sobres + lista de preferencias (sin QR). */
  giftRegistry: {
    message: string;
    preferences: GiftPreference[];
    qrImage?: string;
  };
  music: {
    // Solo ambiental (botón play/pause, AudioController).
    ambientTrack: string;
  };
  theme: {
    colors: {
      primary: string; // fondo base (debajo de la textura global)
      accent: string; // dorado oscuro -- texto y botones (legible)
      accentSoft: string;
      leaf: string;
      leafSoft: string;
      gold: string; // dorado de la paleta -- ornamentos, líneas, acentos grandes
      ink: string;
      paper: string;
    };
  };
  visuals: {
    // Textura de fondo de TODA la invitación (pedido explícito): un solo
    // `div` fijo detrás de <main>, ver page.tsx.
    pageBackground?: string;
    heroDecorations: DecorationSpec[];
    envelope?: {
      complete?: string;
      left?: string; // cortina izquierda
      right?: string; // cortina derecha
      seal?: string; // medallón central, clickeable
      pullCord?: string; // cuerda que abre las cortinas
    };
    heroCrest?: string;
    locationSideImage?: string;
    footerImage?: string;
    // Fondos de elementos (en vez de tarjetas planas).
    rsvpFrame?: string; // encaje rectangular detrás de la confirmación
    dressCodeDoily?: string;
    giftEnvelope?: string; // ilustración de "lluvia de sobres"
    countdownCar?: string;
  };
  /** Confirmación por WhatsApp (sin RSVP automático). */
  rsvp: {
    deadline: Date;
    whatsappNumber: string; // formato internacional sin "+", para wa.me
  };
}

// Assets de Karen en Cloudinary (cloud compartido entre invitaciones). Una
// sola fuente de URLs: las secciones las importan de acá en vez de
// hardcodearlas.
const A = (path: string) =>
  `https://res.cloudinary.com/dvaswskle/image/upload/${path}`;
export const ASSETS = {
  // Hero (las 7 pedidas por la clienta)
  cortina: A("v1790662292/cortina_agyo2o.webp"),
  escaleras: A("v1790662255/escaleras_rj6v8l.webp"),
  borde: A("v1790552787/borde_dmpchc.webp"),
  paraguas: A("v1790549941/paraguas_zocump.webp"),
  vela: A("v1790552764/vela_furyih.webp"),
  candelabro: A("v1790549941/candeladro_qxsrmb.webp"),
  cuadroDorado: A("v1790552256/cuadro_dorado_fjgxpj.webp"),
  // Resto de secciones
  mascaraNegra: A("v1790549941/mascara2_vvsash.webp"),
  mascaraDorada: A("v1790549942/mascara_1_dtsuwy.webp"),
  cartela: A("v1790549941/cuadro_1_bkb8fp.webp"),
  manoTarjeta: A("v1790549941/mano_tarjeta_ixtelh.webp"),
  floresDoradas: A("v1790549941/flores_doradas_tlqia5.webp"),
  pergamino: A("v1790552764/papel_pergamino_txy3mp.webp"),
  ornamento: A("v1790552255/dorado_fayo6v.webp"),
  espejo: A("v1790550202/espejo_dlk3hj.webp"),
  abanico: A("v1790549942/abanico_1_d4of6i.webp"),
  tela: A("v1790549942/tela_qv4tga.webp"),
  cisnes: A("v1790662221/gansos_efo8g9.webp"),
  corazonEncaje: A("v1790660166/corazon_encaje_g1ywwm.webp"),
  rectanguloEncaje: A("v1790660165/rectangulo_encaje_i5e6br.webp"),
} as const;

export const invitationConfig: InvitationConfig = {
  id: "karen",
  client: {
    name: "Karen",
    eventType: "XV Años",
    dedication:
      "Entre el encanto y elegancia de una época dorada y la magia de un sueño hecho realidad, celebro mis quince años. Que esta noche sea un recuerdo eterno, digno de ser guardado en el corazón.",
  },
  families: {
    topLabel: "Junto a mis padres",
    groups: [
      {
        label: "",
        names: ["Laly Rosario Jaldin Crespo", "Victor Rodriguez Jaldin"],
      },
    ],
    // PROPUESTA (la clienta no envió texto) -- confirmar.
    invitationText:
      "Tenemos el honor de invitarte a celebrar los quince años de nuestra hija.",
  },
  event: {
    // Offset -04:00 (Bolivia) EXPLÍCITO -- sin él, countdown y .ics salen
    // corridos en Vercel (UTC).
    date: new Date("2026-10-24T18:00:00-04:00"),
    startTime: "06:00 PM",
    venues: [
      {
        label: "Recepción",
        time: "18:00",
        name: "Elianne 1",
        // PENDIENTE: dirección exacta (solo llegó el link de Maps).
        address: "Santa Cruz de la Sierra, Bolivia",
        url: "https://maps.app.goo.gl/SLqwMvS22qDS97E59",
      },
    ],
  },
  // Horarios y títulos de la clienta (ortografía corregida). Descripciones:
  // PROPUESTA, confirmar. "Torta" sin imagen: ninguna de las 9 la muestra.
  itinerary: [
    {
      time: "18:00",
      title: "Bienvenida",
      description: "Recibimos a cada invitado",
      image: A("v1790662221/flor_u6t6vy.webp"),
    },
    {
      time: "19:00",
      title: "Recepción social",
      description: "Un brindis para empezar la noche",
      image: A("v1790662222/brindis_cfaoti.webp"),
    },
    {
      time: "20:00",
      title: "Ceremonia",
      description: "El momento más especial",
      image: A("v1790662221/candeladros_ronqzj.webp"),
    },
    {
      time: "21:00",
      title: "Música en vivo",
      description: "Una serenata para la quinceañera",
      image: A("v1790662223/cupid0_kdiffh.webp"),
    },
    {
      time: "21:30",
      title: "Sesión de fotos",
      description: "Guardemos este recuerdo",
      image: A("v1790662221/fotos_ovsn6e.webp"),
    },
    {
      time: "22:00",
      title: "Cena",
      description: "Una cena de gala",
      image: A("v1790662223/cena_ueydr4.webp"),
    },
    {
      time: "22:30",
      title: "Apertura de la pista",
      description: "¡Todos a bailar!",
      image: A("v1790662281/disco_dcznps.webp"),
    },
    {
      time: "23:00",
      title: "Hora loca",
      description: "Locos por Cristo",
      image: A("v1790662221/copa_gmgpm8.webp"),
    },
    {
      time: "00:00",
      title: "Torta",
      description: "Partimos la torta juntos",
      image: A("v1790705058/torta_jnrngc.webp"),
    },
    {
      time: "01:00",
      title: "Bye bye",
      description: "Gracias por acompañarme",
      image: A("v1790662223/auto_vxbcz7.webp"),
    },
  ],
  dressCode: {
    description: "Formal",
    // Colores RESERVADOS para la quinceañera -- los invitados deben
    // evitarlos (pedido de la clienta).
    colors: [
      { name: "Blanco", hex: "#FFFFFF" },
      { name: "Dorado", hex: "#B8963C" },
      { name: "Beige", hex: "#E3D5BE" },
      { name: "Camel", hex: "#C19A6B" },
    ],
    image: ASSETS.abanico,
  },
  giftRegistry: {
    message:
      "Tu presencia es mi mejor regalo. Si deseas tener un detalle conmigo, aquí te dejo algunas ideas",
    preferences: [
      { label: "Ropa talla S", image: A("v1790707330/ropa_scs9fr.webp") },
      { label: "Carteras", image: A("v1790707065/cartera_oowwfr.webp") },
      {
        label: "Bijutería dorada",
        image: A("v1790707065/bijuteria_dqrknu.webp"),
      },
      {
        label: "Perfumes dulces",
        image: A("v1790707064/perfume_qvzb96.webp"),
      },
    ],
  },
  music: {
    // PENDIENTE: mp3 con "la mejor parte" de https://youtu.be/mz7mIFJoZwM
    // (no se puede extraer de YouTube) -> public/audio/tema.mp3
    ambientTrack: "/audio/tema.mp3",
  },
  theme: {
    // Paleta de la clienta: #B8963C (dorado protagonista), #E3D5BE,
    // #C19A6B, #F7F1E3, #C3B091. El dorado #B8963C no alcanza contraste
    // para texto chico sobre crema (~2.6:1) -> `accent` es un dorado oscuro
    // derivado para texto/botones, y #B8963C queda en `gold` para
    // ornamentos, líneas y acentos grandes.
    colors: {
      primary: "#F7F1E3", // crema perla
      accent: "#7A5A1E", // dorado oscuro -- texto, títulos, botones
      accentSoft: "#E3D5BE", // beige -- fondos suaves
      leaf: "#3B2F20", // = ink
      leafSoft: "#C19A6B", // camel
      gold: "#B8963C", // dorado protagonista -- ornamentos
      ink: "#3B2F20",
      paper: "#FFFBF2",
    },
  },
  visuals: {
    pageBackground: A("v1790662669/FONDO_kghqyc.webp"),
    // El Hero de Karen compone sus 7 assets propios (HeroSection.tsx); no
    // usa decoraciones sueltas.
    heroDecorations: [],
    // Cortinas y cuerda compartidas con la boda de Ronaldo & Alejandra
    // (crema, van con esta paleta); medallón = máscara veneciana dorada.
    envelope: {
      left: A("v1790660537/lado_izquierdo_cfobtr.webp"),
      right: A("v1790660537/lado_derecho_nptyof.webp"),
      pullCord: A("v1790661204/cuerda_fno3vh.webp"),
      seal: ASSETS.mascaraDorada,
    },
    locationSideImage: ASSETS.espejo,
    footerImage: ASSETS.cisnes,
    rsvpFrame: ASSETS.rectanguloEncaje,
    giftEnvelope: ASSETS.manoTarjeta,
  },
  rsvp: {
    // PENDIENTE: fecha límite -- default 1 semana antes del evento.
    deadline: new Date("2026-10-17T23:59:59-04:00"),
    whatsappNumber: "59173645140",
  },
};
