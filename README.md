# XV Karen — invitación digital

Temática victoriana / barroca / veneciana (realeza): dorado, beige, crema,
perla, camel. Scaffold clonado de `boda-ronaldo-alejandra-nextjs-supabase`,
siguiendo la skill `invitation-master`.

## Alcance

- Secciones: Hero, Frase (pergamino), Padres, Itinerario, Countdown,
  Agendar, Ubicación, Dress Code, Regalos, Confirmación, Música, Galería,
  Footer. Sin Pase.
- Confirmación (RSVP con Supabase, 1 pase): nombre + "Sí, asistiré" / "No
  podré asistir" -> Server Action `src/actions/rsvp.ts` (zod, honeypot,
  rate limit) -> `invitados_karen`. Tras confirmar, ese navegador ve "ya
  confirmaste" sin opción de editar. Pasada la fecha límite (17 de octubre)
  se cierra: en el cliente, en la Server Action y en la policy de la tabla.
- Música: ambiental (botón play/pause) + sugerencias de canciones de los
  invitados (`src/actions/music.ts` -> `musica_karen`).
- Galería: subida directa a Storage (`invitation_assets/karen/gallery/`),
  compresión en el cliente, Realtime, últimas 30 fotos. Sin moderación.
- RSVP y Música se sincronizan en vivo a una Google Sheet (trigger `pg_net`
  -> Apps Script). Ver `supabase/README.md`.
- Regalos: lista de preferencias + lluvia de sobres, sin QR.
- `/contacto` (footer) registra el toque en la tabla compartida
  `contact_clicks` (id `karen`).

## Diseño

- Fondo único de toda la invitación: `div` fijo detrás de `<main>`
  (`page.tsx`), secciones transparentes. Sin `background-attachment: fixed`
  (roto/caro en iOS Safari).
- Apertura: cortinas + cuerda compartidas con la boda (crema), medallón
  central = máscara veneciana dorada.
- Hero (según referencia de la clienta): escena de fondo
  `fondo_victoriana` (arco + cortinaje + balcón), candelabro colgando, marco
  oval dorado con el nombre adentro, y abajo ornamentos dorados en las
  esquinas, vela, máscara negra, espejo de mano y máscara dorada. En desktop
  el fondo va completo en una columna centrada, difuminado a los costados.
- Assets como fondo de elementos: pergamino = frase, cartela dorada = título
  de Padres, encaje rectangular = confirmación, cartela de encaje = campo
  de Música, marco oval dorado = visor de la Galería, tela = guirnalda del
  Itinerario. Decorativos: ornamento (separador de Padres), máscara negra
  (Countdown), flores doradas (Frase y Agendar), espejo (Ubicación), abanico
  (Dress Code), mano con tarjeta (lluvia de sobres), cisnes (Footer),
  corazón de encaje (Confirmación), máscara dorada (Música), espejo de mano
  (Galería).
- Paleta: #B8963C no alcanza contraste para texto chico sobre crema ->
  `accent` = dorado oscuro #7A5A1E para texto/botones; #B8963C en `gold`
  para ornamentos.
- Todas las URLs de assets viven en `ASSETS` (`src/config/invitation.ts`).

## Puesta en marcha

1. `pnpm install`
2. `.env.local` con las credenciales del proyecto Supabase compartido.
3. Backend (tablas, Sheet, Realtime): pasos en `supabase/README.md`.
4. `pnpm dev`

## Pendiente

- mp3 con "la mejor parte" de https://youtu.be/mz7mIFJoZwM →
  `public/audio/tema.mp3`.
- Dirección exacta del salón Elianne 1 (hoy: "Santa Cruz de la Sierra").
- Confirmar dominio (`xv-karen-invitation.danmr.com` es un supuesto).
- Imagen de preview para compartir el link (< 300 KB).
- Descripciones del itinerario y texto de Padres: propuestas, confirmar.
- "Torta" sin ilustración (ninguna de las 9 la mostraba).
