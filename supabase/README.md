# Backend de XV Karen — pendientes manuales

`schema.sql` y `apps-script/sync-to-sheets.gs` están listos, pero requieren
pasos manuales fuera del repo antes de quedar operativos. En orden:

1. **Google Sheet + Apps Script**
   - Crear una Google Sheet nueva para esta invitación.
   - Extensiones > Apps Script, pegar el contenido de `apps-script/sync-to-sheets.gs`.
   - Configuración del proyecto (⚙️) > Propiedades del script > agregar
     `SYNC_SECRET` con un valor largo y aleatorio (nuevo, no reusar el de
     otra invitación).
   - Implementar > Nueva implementación > Aplicación web (ejecutar como
     "yo", acceso "cualquiera"). Copiar la URL `/exec`.

2. **Supabase SQL Editor**
   - Primero, comprobar que no existan tablas con estos nombres:
     `select table_name from information_schema.tables where table_name like '%karen%';`
     Debe devolver 0 filas.
   - Pegar `schema.sql` completo, reemplazar los dos placeholders de la URL
     en la PARTE C (`PEGAR_ID_DEL_DEPLOYMENT`, `PEGAR_EL_SECRETO`) y ejecutar.
   - Correr las consultas de VERIFICACIÓN del final (columnas + policies
     realmente aplicadas).

3. **Realtime de la Galería**
   - Database > Replication: agregar `fotos_galeria_karen` a
     `supabase_realtime` (o `alter publication supabase_realtime add table fotos_galeria_karen;`).

4. **Prueba real end-to-end**
   - Confirmar desde la invitación con el nombre `ZZZ_TEST_BORRAR`, sugerir
     una canción de prueba y subir una foto de prueba.
   - Revisar que lleguen a las pestañas RSVP / Musica / Galeria de la Sheet.
   - Borrar los registros de prueba (tabla + archivo en Storage para la foto,
     y la fila de la Sheet).
   - Ojo: el navegador donde se probó queda marcado como "ya confirmaste".
     Para volver a ver el formulario, borrar la clave `rsvp:karen` de
     localStorage (DevTools > Application) o usar otro navegador.

5. **Variables de entorno**
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`: las del
     proyecto compartido (ya en `.env.local`).
   - La URL del Apps Script y su secreto NO van en `.env.local` — viven solo
     en el trigger de Postgres.

## Fecha límite

El RSVP se cierra el 17/10/2026 23:59 (Bolivia) en tres lugares: la vista
(`RSVPSection.tsx`), la Server Action (`src/actions/rsvp.ts`) — ambas leen
`rsvp.deadline` de `src/config/invitation.ts` — y la policy de insert de
`invitados_karen` (fecha escrita en `schema.sql`). Si la clienta la cambia,
actualizar el config Y volver a correr el bloque de esa policy.

## Moderación de la Galería

No hay moderación: una foto se publica al instante. Para quitar una foto
indebida, borrar la fila en `fotos_galeria_karen` y el archivo en Storage
(`invitation_assets/karen/gallery/...`).

## Convención de nombres

- `id` de la invitación: `karen` (rate limiting `karen:rsvp` / `karen:music`,
  prefijo de Storage `karen/gallery/`, `contact_clicks.invitation`).
- Tablas: `invitados_karen`, `musica_karen`, `fotos_galeria_karen`.
- `contact-clicks.sql`: tabla compartida del footer, ya existe; no se toca.
