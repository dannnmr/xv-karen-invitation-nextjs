-- =====================================================================
-- XV Karen — esquema Supabase (RSVP 1 pase + Música + Galería)
-- =====================================================================
-- Proyecto Supabase COMPARTIDO con otras invitaciones (Antonella, Sofía
-- Salomé, Andrea Carolina...). Reglas (lección de la prueba en vivo del
-- 2026-09-03, ver ~/.claude/skills/invitation-master/reference.md):
--
--   * Nombres namespaceados por invitación: `invitados_karen`,
--     `musica_karen`, `fotos_galeria_karen`.
--   * ANTES de correr esto, comprobar que esos nombres NO existan ya:
--       select table_name from information_schema.tables
--       where table_name like '%karen%';
--     `create table if not exists` no corrige una tabla vieja con otra forma.
--   * Después, VERIFICAR el esquema realmente aplicado con las consultas
--     del final -- no confiar en que este archivo == lo desplegado.
--
-- Este archivo NO contiene datos ni credenciales. La URL del Apps Script
-- (con su secreto) se pega directo en el SQL Editor al correr la PARTE C
-- -- nunca se commitea a Git.
-- =====================================================================

-- ---------------------------------------------------------------------
-- PARTE A · Ya existe en el proyecto compartido (no hace falta recrear)
-- ---------------------------------------------------------------------
-- Ledger de rate limiting (src/lib/rateLimit.ts). Tabla ÚNICA y compartida:
-- el aislamiento vive en `scope` ('karen:rsvp', 'karen:music').
create table if not exists write_attempts (
  id bigint generated always as identity primary key,
  scope text not null,
  ip_hash text not null,
  created_at timestamptz not null default now()
);
create index if not exists write_attempts_scope_ip_idx on write_attempts (scope, ip_hash, created_at);
alter table write_attempts enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'write_attempts' and policyname = 'insert_write_attempts') then
    create policy "insert_write_attempts" on write_attempts for insert to anon with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename = 'write_attempts' and policyname = 'select_write_attempts') then
    create policy "select_write_attempts" on write_attempts for select to anon using (true);
  end if;
end $$;

create extension if not exists pg_net;

-- ---------------------------------------------------------------------
-- PARTE B · NUEVO para esta invitación
-- ---------------------------------------------------------------------

-- RSVP. 1 pase por confirmación: solo nombre + sí/no (sin columna de
-- pases). Sin unique(nombre) a propósito: bloquearía a dos invitados
-- DISTINTOS con el mismo nombre. La protección contra reenvíos vive en el
-- rate limiting + el botón deshabilitado + la marca "ya confirmaste" del
-- navegador (RSVPSection.tsx).
create table if not exists invitados_karen (
  id uuid primary key default gen_random_uuid(),
  nombre text not null check (char_length(nombre) between 2 and 120),
  asistencia text not null check (asistencia in ('si', 'no')),
  created_at timestamptz not null default now()
);
alter table invitados_karen enable row level security;

-- Insert público SOLO hasta la fecha límite (17/10/2026 23:59 Bolivia):
-- última capa del cierre, por si alguien llama a la API directo con la
-- anon key. Misma fecha que `rsvp.deadline` en src/config/invitation.ts
-- -- si cambia, cambiar ambas y volver a correr este bloque.
drop policy if exists "insert_invitados_karen_publico" on invitados_karen;
create policy "insert_invitados_karen_publico"
  on invitados_karen for insert to anon
  with check (now() <= timestamptz '2026-10-17 23:59:59-04');
-- Sin policy de select: las respuestas se consultan desde el dashboard /
-- la Sheet, no desde el sitio.

-- Música: invitados sugieren canciones para la fiesta.
create table if not exists musica_karen (
  id uuid primary key default gen_random_uuid(),
  cancion text not null check (char_length(cancion) between 2 and 150),
  created_at timestamptz not null default now()
);
alter table musica_karen enable row level security;

drop policy if exists "insert_musica_karen_publico" on musica_karen;
create policy "insert_musica_karen_publico"
  on musica_karen for insert to anon with check (true);

-- Galería: SÍ necesita lectura pública (se muestra a todos los invitados
-- en vivo), además de inserción pública (cualquiera puede subir una foto).
create table if not exists fotos_galeria_karen (
  id uuid primary key default gen_random_uuid(),
  url_foto text not null,
  created_at timestamptz not null default now()
);
alter table fotos_galeria_karen enable row level security;

drop policy if exists "select_fotos_galeria_karen_publico" on fotos_galeria_karen;
create policy "select_fotos_galeria_karen_publico"
  on fotos_galeria_karen for select to anon using (true);

drop policy if exists "insert_fotos_galeria_karen_publico" on fotos_galeria_karen;
create policy "insert_fotos_galeria_karen_publico"
  on fotos_galeria_karen for insert to anon with check (true);

-- Storage: bucket público ya existente y compartido, "invitation_assets".
-- Las fotos de esta invitación van bajo el prefijo "karen/gallery/" (ver
-- src/components/sections/GallerySection.tsx).

-- Realtime (paso aparte, fácil de olvidar): agregar `fotos_galeria_karen`
-- a la publication `supabase_realtime` desde Database > Replication, o:
--   alter publication supabase_realtime add table fotos_galeria_karen;

-- ---------------------------------------------------------------------
-- PARTE C · Sync en vivo a Google Sheets (trigger + pg_net)
-- ---------------------------------------------------------------------
-- Función PROPIA de esta invitación (NO reutilizar la de otra: un
-- `create or replace` sobre una función compartida le cambiaría la URL a
-- las demás y sus inserts llegarían a la Sheet equivocada). Una sola
-- función sirve para las 3 tablas: el payload manda `TG_TABLE_NAME` y el
-- Apps Script rutea por ese valor. El secreto va como query param.
--
-- >>> Antes de ejecutar: reemplazar los dos placeholders de la URL con
--     el deployment real del Apps Script (ver supabase/apps-script/). <<<
create or replace function public.sync_karen_to_sheets()
returns trigger
language plpgsql
security definer
as $$
begin
  perform net.http_post(
    url := 'https://script.google.com/macros/s/PEGAR_ID_DEL_DEPLOYMENT/exec?secret=PEGAR_EL_SECRETO',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object('table', TG_TABLE_NAME, 'record', row_to_json(NEW))
  );
  return NEW;
end;
$$;

drop trigger if exists trg_sync_invitados_karen on invitados_karen;
create trigger trg_sync_invitados_karen
  after insert on invitados_karen
  for each row execute function public.sync_karen_to_sheets();

drop trigger if exists trg_sync_musica_karen on musica_karen;
create trigger trg_sync_musica_karen
  after insert on musica_karen
  for each row execute function public.sync_karen_to_sheets();

drop trigger if exists trg_sync_fotos_galeria_karen on fotos_galeria_karen;
create trigger trg_sync_fotos_galeria_karen
  after insert on fotos_galeria_karen
  for each row execute function public.sync_karen_to_sheets();

-- ---------------------------------------------------------------------
-- VERIFICACIÓN (correr después, en el SQL Editor)
-- ---------------------------------------------------------------------
-- columnas realmente aplicadas
-- select table_name, column_name, data_type
-- from information_schema.columns
-- where table_name in ('invitados_karen', 'musica_karen', 'fotos_galeria_karen')
-- order by table_name, ordinal_position;
--
-- policies realmente aplicadas
-- select tablename, policyname, cmd, roles, with_check from pg_policies
-- where tablename in ('invitados_karen', 'musica_karen', 'fotos_galeria_karen');
--
-- prueba real: confirmar desde la invitación con el nombre
-- 'ZZZ_TEST_BORRAR', revisar que llegue a la pestaña RSVP de la Sheet y
-- luego borrarlo:
-- delete from invitados_karen where nombre = 'ZZZ_TEST_BORRAR';

-- ---------------------------------------------------------------------
-- CONSULTAS ÚTILES
-- ---------------------------------------------------------------------
-- Total de asistentes confirmados (1 pase = 1 persona por fila "si"):
-- select asistencia, count(*) from invitados_karen group by asistencia;
