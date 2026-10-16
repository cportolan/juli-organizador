# Supabase

La migración inicial crea el esquema, índices, triggers de `updated_at`, RLS de todas las tablas y el bucket privado `attachments`.

## Aplicar las migraciones

1. Instalá la Supabase CLI y autenticá el proyecto (`supabase login`).
2. Vinculá el proyecto desde la raíz del repositorio: `supabase link --project-ref <project-ref>`.
3. Aplicá las migraciones con `supabase db push`.

Para desarrollo local, iniciá Supabase con `supabase start` y aplicá el mismo flujo con `supabase db reset`.

El bucket de adjuntos espera rutas con el formato `<user_id>/<person_id>/<archivo>`. Es privado. La migración de Usuarios reemplaza las políticas iniciales por acceso exclusivo del servidor para respetar las contraseñas de sección y ficha.

## Backend de Usuarios (`feat/people-backend`)

Antes de conectar la UI, aplicá `20261016175634_secure_people_server_access.sql`
con `supabase db push` y configurá estas variables **solo del servidor**:

- `SUPABASE_SECRET_KEY`: clave secreta del proyecto (`sb_secret_...`). Nunca usar
  `NEXT_PUBLIC_` ni pasar este cliente a componentes. El cliente de sesión sigue
  usando la publishable key; cada operación privilegiada verifica sesión y dueño.
- `PEOPLE_COOKIE_SECRET`: secreto aleatorio de al menos 32 bytes, generado con
  `openssl rand -hex 32`. Compartilo entre instancias del mismo despliegue.

La migración mantiene RLS, revoca acceso directo a `people` y
`person_attachments`, y deja en `settings` solo lectura de columnas públicas y
escritura de preferencias visuales. Las contraseñas y el estado de bloqueo solo
se modifican desde Server Actions. Una política restrictiva de Storage impide
el acceso directo al bucket `attachments`, incluso si hay otras políticas
permisivas. El backend firma enlaces de descarga por **5 minutos**; un enlace
ya emitido sigue vigente hasta vencer aunque cambie una contraseña. La UI puede
renovarlo llamando nuevamente a `getAttachments(personId)`.

Los desbloqueos usan cookies HMAC-SHA256, httpOnly, SameSite=Strict y Secure en
producción. Duran 30 minutos y se vinculan al usuario, sesión de Supabase y
versiones de las contraseñas. Solo se conserva el permiso de una ficha activa;
`getPerson` vuelve a exigir su contraseña en cada carga de una ficha protegida.
Las contraseñas usan bcrypt (costo 12, mínimo 8 caracteres, máximo 72 bytes).

Adjuntos: hasta 10 MiB; el servidor comprueba firma binaria, extensión y MIME.
Formatos admitidos: PDF, PNG, JPEG, GIF, WebP, AVIF, ZIP, DOCX, XLSX, PPTX y texto
UTF-8 TXT/CSV. No admite SVG, HTML ni ejecutables. El cuerpo de Server Actions
admite 11 MiB para incluir el multipart. Los archivos se guardan con UUID;
si falla el alta de metadata se elimina el archivo subido. Los borrados eliminan
Storage antes de metadata para permitir reintentar ante errores. Storage y
Postgres no comparten transacción; una falla intermedia puede dejar metadata de
un archivo ya eliminado, que se resuelve reintentando el borrado.

### Verificación

```sh
npm run lint
node --test features/calendar/recurrence.test.mjs lib/server/people/security.test.mjs
node --experimental-loader ./lib/server/people/testing/loader.mjs --test lib/server/people/actions.test.mjs
npx next build
psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/people_security.sql
```

El test SQL usa una base **descartable** con las migraciones aplicadas (revierte
sus datos al terminar). Las pruebas de acciones sustituyen sesión, cookies y
transporte de Supabase; comprueban el contrato y las verificaciones del servidor.
El SQL comprueba permisos reales, RLS de Storage y el reordenamiento atómico.
La prueba completa de upload/descarga contra Supabase requiere las variables y
un usuario de prueba. Usá Node 22 o posterior, requerido por el SDK instalado.

En este worktree sin `.env.local`, el build se verificó con valores públicos de
prueba, sin conectarse a Supabase:

```sh
NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co \
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_build_placeholder npx next build
```

`getDayNotes({ from, to })` usa fechas `YYYY-MM-DD` con ambos extremos incluidos
y devuelve únicamente `{ date }` de las notas guardadas. `getEvents` filtra los
eventos simples en Postgres y conserva series/excepciones para expandirlas sin
perder exclusiones.
