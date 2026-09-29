# XV Karen — invitación digital

Temática victoriana / barroca / veneciana (realeza): dorado, beige, crema,
perla, camel. Scaffold clonado de `boda-ronaldo-alejandra-nextjs-supabase`,
siguiendo la skill `invitation-master`.

## Alcance

- Secciones: Hero, Frase (pergamino), Padres, Itinerario, Countdown,
  Agendar, Ubicación, Dress Code, Regalos, Confirmación por WhatsApp, Footer.
- SIN RSVP automático, Galería, sugerencias de canciones ni Pase (quitados
  con sus actions, rate limiting, tablas y script de Sheets).
- Confirmación: botones "Sí, asistiré" / "No podré asistir" que abren
  WhatsApp al +59173645140 con el mensaje armado (y el nombre, si lo
  escriben). Nada se guarda en base de datos.
- Regalos: lista de preferencias + lluvia de sobres, sin QR.
- Música: solo ambiental (botón play/pause).
- Supabase queda SOLO para el rastreo de contactos del footer (`/contacto`,
  tabla compartida `contact_clicks`, id `karen`).

## Diseño

- Fondo único de toda la invitación: `div` fijo detrás de `<main>`
  (`page.tsx`), secciones transparentes. Sin `background-attachment: fixed`
  (roto/caro en iOS Safari).
- Apertura: cortinas + cuerda compartidas con la boda (crema), medallón
  central = máscara veneciana dorada.
- Hero: escenario con los 7 assets pedidos — cortinas (esquinas
  superiores), candelabro colgando, marco oval dorado con el nombre adentro,
  escalera de base, ornamentos dorados en las esquinas inferiores, vela y
  paraguas junto a la escalera.
- Assets como fondo de elementos: pergamino = frase, cartela dorada = título
  de Padres, encaje rectangular = confirmación, tela = guirnalda del
  Itinerario. Decorativos: ornamento (separador de Padres), máscara negra
  (Countdown), flores doradas (Frase y Agendar), espejo (Ubicación), abanico
  (Dress Code), mano con tarjeta (lluvia de sobres), cisnes (Footer),
  corazón de encaje (Confirmación).
- Paleta: #B8963C no alcanza contraste para texto chico sobre crema ->
  `accent` = dorado oscuro #7A5A1E para texto/botones; #B8963C en `gold`
  para ornamentos.
- Todas las URLs de assets viven en `ASSETS` (`src/config/invitation.ts`).

## Puesta en marcha

1. `pnpm install`
2. `.env.local` con las credenciales del proyecto Supabase compartido (solo
   para `/contacto`; `contact_clicks` ya existe — ver
   `supabase/contact-clicks.sql`).
3. `pnpm dev`

## Pendiente

- mp3 con "la mejor parte" de https://youtu.be/mz7mIFJoZwM →
  `public/audio/tema.mp3`.
- Dirección exacta del salón Elianne 1 (hoy: "Santa Cruz de la Sierra").
- Confirmar dominio (`xv-karen-invitation.danmr.com` es un supuesto).
- Imagen de preview para compartir el link (< 300 KB).
- Fecha límite de confirmación (default: 17 de octubre).
- Descripciones del itinerario y texto de Padres: propuestas, confirmar.
- "Torta" sin ilustración (ninguna de las 9 la mostraba).
