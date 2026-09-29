# Backend de XV Andrea Carolina — pendientes manuales

Estos dos archivos (`schema.sql`, `apps-script/sync-to-sheets.gs`) están
listos, pero requieren pasos manuales fuera del repo antes de quedar
operativos. En orden:

1. **Google Sheet + Apps Script**
   - Crear una Google Sheet nueva para esta invitación.
   - Extensiones > Apps Script, pegar el contenido de `apps-script/sync-to-sheets.gs`.
   - `EVENT_TIMEZONE` confirmado: `America/La_Paz` (Bolivia).
   - Configuración del proyecto (⚙️) > Propiedades del script > agregar
     `SYNC_SECRET` con un valor largo y aleatorio (generarlo, no reusar el
     de otra invitación).
   - Implementar > Nueva implementación > Aplicación web (ejecutar como
     "yo", acceso "cualquiera"). Copiar la URL `/exec`.
   - **Si ya habías desplegado antes de fijar `America/La_Paz`**: guardar
     (💾) en el editor no alcanza — hay que ir a Implementar > Gestionar
     implementaciones > editar (✏️) la implementación activa > Versión:
     "Nueva versión" > Implementar, para que el `/exec` ya publicado tome
     el cambio (si no, sigue corriendo el código viejo con la zona horaria
     placeholder).

2. **Supabase SQL Editor**
   - Pegar `schema.sql` completo.
   - Antes de ejecutar: reemplazar los dos placeholders de la URL en
     `PARTE C` (`PEGAR_ID_DEL_DEPLOYMENT`, `PEGAR_EL_SECRETO`) con la URL
     real del paso 1 y el mismo `SYNC_SECRET`.
   - Ejecutar el script completo.
   - Correr las consultas de VERIFICACIÓN al final del archivo (columnas +
     policies realmente aplicadas) — no asumir que lo desplegado coincide
     con el archivo si algún nombre ya existía.

3. **Supabase Dashboard > Database > Replication**
   - Agregar `fotos_galeria_andrea_carolina` a la publication
     `supabase_realtime` (paso aparte, necesario para que la Galería
     actualice en vivo a otros invitados — se olvida fácil).

4. **Prueba real end-to-end**
   - Insert de prueba en `invitados_andrea_carolina` (nombre
     `ZZZ_TEST_BORRAR_...`) y confirmar que llega a la pestaña "RSVP" de
     la Sheet. Borrar el registro de prueba de la tabla después.

5. **Variables de entorno** (cuando se cree el proyecto Next.js)
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`: mismas
     del proyecto Supabase compartido (no son nuevas si ya las tenés de
     otra invitación en este mismo proyecto).
   - La URL del Apps Script y su secreto NO van en `.env.local` del
     frontend — viven solo en el trigger de Postgres (Supabase), nunca en
     el cliente.

## Convención de nombres usada acá
- `id` de la invitación (para `config.ts`, rate limiting, prefijo de Storage): `andrea-carolina`
- Tablas: `invitados_andrea_carolina`, `musica_andrea_carolina`, `fotos_galeria_andrea_carolina`
- Bucket de Storage compartido `invitation_assets`, prefijo `andrea-carolina/gallery/`
