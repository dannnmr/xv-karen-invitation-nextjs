-- =====================================================================
-- Rastreo de contactos (botón "Escribir" del footer) — TODAS las invitaciones
-- =====================================================================
-- Tabla ÚNICA y compartida en el proyecto Supabase común (mismo criterio
-- que `write_attempts`): el aislamiento vive en la columna `invitation`
-- (= `config.id` de cada invitación: 'luciana', 'antonella', ...), no en el
-- nombre de la tabla. Se corre UNA sola vez en el proyecto; las demás
-- invitaciones solo necesitan su propia ruta /contacto (src/app/contacto).
--
-- Registra el TOQUE en el botón (antes de abrir WhatsApp), no el mensaje:
-- así no depende de que la persona edite o borre el texto pre-escrito.
-- Sin IP ni datos personales: solo invitación, tipo de dispositivo y hora.
--
-- Datos del NEGOCIO (de Daniela), no de la clienta: NO se sincronizan a la
-- Google Sheet de la invitación (PARTE C de schema.sql).
-- =====================================================================

create table if not exists contact_clicks (
  id bigint generated always as identity primary key,
  invitation text not null check (char_length(invitation) between 1 and 60),
  device text not null check (device in ('movil', 'escritorio')),
  created_at timestamptz not null default now()
);
create index if not exists contact_clicks_invitation_idx on contact_clicks (invitation, created_at desc);
alter table contact_clicks enable row level security;

-- El sitio solo INSERTA. Sin policy de select para anon: los registros se
-- leen únicamente desde el dashboard de Supabase (rol con acceso total).
drop policy if exists "insert_contact_clicks_publico" on contact_clicks;
create policy "insert_contact_clicks_publico"
  on contact_clicks for insert to anon with check (true);

-- ---------------------------------------------------------------------
-- VERIFICACIÓN (correr después): no confiar en que este archivo == lo
-- desplegado (lección del 2026-09-03, ver invitation-master/reference.md).
-- ---------------------------------------------------------------------
-- select column_name, data_type from information_schema.columns
-- where table_name = 'contact_clicks' order by ordinal_position;
--
-- select policyname, cmd, roles from pg_policies where tablename = 'contact_clicks';

-- ---------------------------------------------------------------------
-- CONSULTAS ÚTILES (SQL Editor)
-- ---------------------------------------------------------------------
-- Últimos toques, en hora de Bolivia -> cruzar con la hora del WhatsApp:
-- select invitation, device,
--        to_char(created_at at time zone 'America/La_Paz', 'DD/MM/YYYY HH24:MI:SS') as hora_bolivia
-- from contact_clicks order by created_at desc limit 50;
--
-- Qué invitación trae más contactos:
-- select invitation, count(*) as toques, max(created_at at time zone 'America/La_Paz') as ultimo
-- from contact_clicks group by invitation order by toques desc;
