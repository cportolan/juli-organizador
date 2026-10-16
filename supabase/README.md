# Supabase

La migración inicial crea el esquema, índices, triggers de `updated_at`, RLS de todas las tablas y el bucket privado `attachments`.

## Aplicar las migraciones

1. Instalá la Supabase CLI y autenticá el proyecto (`supabase login`).
2. Vinculá el proyecto desde la raíz del repositorio: `supabase link --project-ref <project-ref>`.
3. Aplicá las migraciones con `supabase db push`.

Para desarrollo local, iniciá Supabase con `supabase start` y aplicá el mismo flujo con `supabase db reset`.

El bucket de adjuntos espera rutas con el formato `<user_id>/<person_id>/<archivo>`. Es privado y sus políticas validan que el primer segmento coincida con el usuario autenticado.
