# TASKS — Organizador Juli

Pizarrón compartido entre agentes. **Leelo antes de empezar y actualizalo al terminar** cada tarea: marcá `[x]`, anotá la branch y cualquier decisión en el registro de abajo.

Especificación completa y reglas de código/diseño: `AGENTS.md`.

---

## Reparto de responsabilidades

| Agente | Rol | Es dueño de |
| --- | --- | --- |
| **Codex** | Backend + infraestructura | `supabase/`, `lib/supabase/`, `proxy.js` (ex middleware), `features/*/api.js`, `features/*/actions.js` (Server Actions), `lib/server/`, dependencias de backend |
| **Claude** | Todo el frontend + diseño UX/UI | `app/**/*.module.css`, `app/globals.css`, `components/`, `features/*/components/`, `features/*/hooks/`, `lib/utils/` (helpers de UI), páginas y layouts de `app/`, animaciones, dependencias de frontend |

Reglas para no pisarse:

- **No editar archivos del otro agente.** Si necesitás un cambio ahí, anotalo en "Pedidos entre agentes" y seguí con otra cosa.
- Cada agente trabaja en **su propia branch/worktree**. Nunca los dos en la misma carpeta.
- Las páginas de `app/` las arma Claude; si una página necesita cargar datos en el servidor, llama a funciones de `features/*/api.js` (de Codex), nunca a Supabase directo.
- `package.json`: cada uno instala solo sus dependencias. Si hay conflicto en `package-lock.json`, se resuelve con `npm install` después del merge.
- Merge a `master` de a una branch por vez; el otro agente hace `git pull`/rebase antes de seguir.

---

## Contrato entre frontend y backend

Este contrato es lo que permite trabajar en paralelo. Claude construye la UI contra estas firmas (con datos mock mientras tanto); Codex las implementa. **Si hay que cambiar una firma, se anota en el registro de decisiones.**

### Convenciones
- Cada sección tiene `features/<seccion>/api.js` (lecturas, usable desde Server Components) y `features/<seccion>/actions.js` (`"use server"`, mutaciones).
- Las funciones son `async`. Las lecturas de `api.js` devuelven datos directamente y pueden lanzar `Error` con mensaje en español. Las Server Actions devuelven `{ ok: true, data }` o `{ ok: false, error: "mensaje" }` para errores esperables; las excepciones quedan reservadas para fallas inesperadas.
- Fechas: strings ISO 8601. Fechas sin hora (`date`): `YYYY-MM-DD`.
- Nombres de campos en `camelCase` en JS (la capa de api convierte desde `snake_case` de Postgres).
- Mientras no exista la implementación real, Claude usa mocks en `features/<seccion>/mocks.js` con la misma forma de datos. Se borran cuando el backend está listo.

### Modelo de datos (todas las tablas con `user_id` + RLS por `auth.uid()`, `createdAt`, `updatedAt`)

**settings** (una fila por usuario)
`primaryColor` (hex), `themeMode` (`'light' | 'dark' | 'system'`), `headingFont`, `bodyFont`, `peopleLockEnabled` (bool). El hash de la contraseña general nunca sale del servidor.

**events**
`id`, `title`, `description`, `type` (`'event' | 'birthday' | 'meeting'`), `startAt`, `endAt`, `allDay` (bool), `color` (nullable), `location` (nullable), `rrule` (string RFC 5545 o null), `exdates` (array de fechas excluidas), `seriesId` (nullable: excepciones/cortes de una serie).

**dayNotes**
`date` (único por usuario), `content` (JSON de Tiptap).

**phones**
`id`, `office`, `agent`, `phone`, todos nullable.

**todoCategories**
`id`, `name`, `color`.

**todos**
`id`, `title`, `description` (nullable), `priority` (`'low' | 'medium' | 'high' | null`), `status` (`'pending' | 'done'`), `categoryId` (nullable), `doneAt` (nullable), `createdAt`.

**people**
`id`, `name`, `position` (orden de las pestañas), `hasPassword` (bool), `content` (JSON de Tiptap; **no se devuelve si la ficha está bloqueada**).

**personAttachments**
`id`, `personId`, `title`, `fileName`, `mimeType`, `size`, `url` (signed URL temporal), `createdAt`. Bucket privado `attachments`.

### Funciones

**Auth** — `features/auth/actions.js`
- `signIn({ email, password })`, `signOut()`
- `getCurrentUser()` en `features/auth/api.js`

**Settings** — `features/settings/`
- `getSettings()`
- `updateSettings(partialSettings)`
- `setPeoplePassword({ currentPassword, newPassword })` (newPassword `null` = quitar)

**Calendario** — `features/calendar/`
- `getEvents({ from, to })` → ocurrencias ya expandidas en el rango (cada una con `id`, `occurrenceDate` y los datos del evento base)
- `createEvent(data)`, `updateEvent({ id, occurrenceDate, scope, data })`, `deleteEvent({ id, occurrenceDate, scope })` — `scope`: `'this' | 'following' | 'all'`
- `getDayNote(date)`, `saveDayNote({ date, content })`

**Teléfonos** — `features/phones/`
- `getPhones()` (la búsqueda se hace en el cliente)
- `createPhone(data)`, `updatePhone({ id, data })`, `deletePhone(id)`

**Pendientes** — `features/todos/`
- `getTodos()` (filtros y búsqueda en el cliente)
- `createTodo(data)`, `updateTodo({ id, data })`, `deleteTodo(id)`, `setTodoStatus({ id, status })`
- `getCategories()`, `createCategory(data)`, `updateCategory({ id, data })`, `deleteCategory(id)` (los todos de esa categoría quedan sin categoría)

**Usuarios / fichas** — `features/people/`
- `getPeople()` → lista sin `content`
- `unlockPeopleSection(password)` → setea cookie httpOnly firmada de corta duración
- `isPeopleSectionUnlocked()`
- `getPerson(id, { password })` → con `content` (verifica sección y contraseña de la ficha en el servidor)
- `createPerson({ name })`, `renamePerson({ id, name })`, `reorderPeople(ids)`, `deletePerson(id)`
- `savePersonContent({ id, content })`
- `setPersonPassword({ id, currentPassword, newPassword })`
- `getAttachments(personId)`, `uploadAttachment({ personId, title, file })` (recibe `FormData`), `renameAttachment({ id, title })`, `deleteAttachment(id)`

---

## Fase 1 — Base (en paralelo)

### Codex — backend base (branch `feat/backend-base`)
- [x] Instalar `@supabase/supabase-js`, `@supabase/ssr`, `bcryptjs`
- [x] `lib/supabase/client.js` (browser) y `lib/supabase/server.js` (server, con cookies) usando `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- [x] `proxy.js` (en Next 16 reemplaza a `middleware.js`; revisar `node_modules/next/dist/docs/`): refrescar sesión y redirigir a `/login` si no hay usuario, y de `/login` a `/calendario` si ya hay
- [x] Migración inicial en `supabase/migrations/`: todas las tablas del modelo, índices, triggers de `updated_at`, RLS en todas las tablas
- [x] Bucket privado `attachments` con políticas por `user_id` (ruta `<user_id>/<person_id>/<archivo>`)
- [x] Auth: `features/auth/api.js` y `actions.js`
- [x] Settings: api + actions (crear fila por defecto si no existe: primario pastel, `themeMode: 'system'`, Lora / Roboto)
- [x] Documentar en `supabase/README.md` cómo aplicar las migraciones

### Claude — sistema de diseño y layout (branch `feat/frontend-base`)
- [ ] Usar las skills de diseño UX/UI; definir dirección visual (paleta pastel, tipografía, espaciado, radios, sombras, motion)
- [ ] Instalar `lucide-react`, `date-fns`
- [ ] `app/globals.css`: tokens como variables CSS (claro/oscuro, primario dinámico), reset, `prefers-reduced-motion`
- [ ] Fuentes con `next/font`: Lora + Roboto por defecto y alternativas elegibles
- [ ] Componentes base en `components/ui/`: Button, IconButton, Input, Textarea, Select, Checkbox, Modal, Drawer, Tabs, SegmentedControl, Badge, SearchBar, EmptyState, Skeleton, Toast, Tooltip, DropdownMenu, ConfirmDialog
- [ ] Layout de la app: `components/layout/Sidebar` (colapsable, mobile), `Header`, contenedor del `RightSidebar`
- [ ] Pantalla de login (con mocks hasta que esté auth)
- [ ] Rutas vacías con transiciones: `/calendario`, `/telefonos`, `/pendientes`, `/usuarios`, `/configuracion`

**Merge de Fase 1:** primero `feat/backend-base`, después `feat/frontend-base` (Claude conecta login y settings a lo real al hacer rebase).

---

## Fase 2 — Secciones

Cada sección: Codex hace api + actions; Claude hace la UI. Pueden ir en paralelo gracias al contrato y los mocks.

### Teléfonos (la más simple, buena para probar el flujo)
- [x] Codex: api + actions de phones
- [ ] Claude: tabla con búsqueda en todos los campos, alta/edición inline o en modal, borrado con confirmación, estado vacío

### Pendientes
- [x] Codex: api + actions de todos y categorías
- [ ] Claude: vistas columnas / tabla / ítems, búsqueda y filtros, modal de creación/edición, CRUD de categorías con color, animaciones al completar

### Calendario
- [ ] Codex: api de eventos con expansión de recurrencias (`rrule`), edición/borrado con `scope`, day notes
- [ ] Claude: vistas mes / semana (7-5-3) / día hechas a medida, crear evento haciendo clic o arrastrando, modal de evento con selector de repetición estilo Google Calendar, diálogo "solo este / siguientes / todos", anotador del día, RightSidebar de pendientes con flechas Pendiente ↔ Realizado
- [ ] Claude: instalar Tiptap (se reutiliza en Usuarios y en el anotador del día) — componente único `components/ui/RichTextEditor`

### Usuarios (fichas)
- [ ] Codex: api + actions de people, contraseñas hasheadas, cookie de desbloqueo, upload/descarga de adjuntos con signed URLs
- [ ] Codex: impedir que `people.content`, `people.password_hash` y `settings.people_password_hash` sean legibles por `authenticated` desde la Data API; el contenido bloqueado solo puede salir por funciones de servidor que verifiquen la contraseña
- [ ] Claude: pantalla de contraseña de la sección, pestañas (crear, renombrar, reordenar, borrar), bloqueo por pestaña, editor Tiptap con autoguardado, lista de adjuntos con preview de imágenes/PDF

### Configuración
- [ ] Claude: selector de color primario (paleta pastel + personalizado), modo claro/oscuro/sistema, selector de tipografías con preview, contraseña general de Usuarios

---

## Fase 3 — Pulido
- [ ] Claude: revisión de animaciones, estados vacíos, responsive y accesibilidad
- [ ] Codex: revisión de seguridad (RLS, que ningún contenido bloqueado se filtre, tamaño/tipo de adjuntos)
- [ ] Revisión cruzada: cada agente revisa el diff del otro antes del merge final
- [ ] Deploy (definir: Vercel)

---

## Pedidos entre agentes

<!-- Formato: - [ ] (De X para Y) descripción — fecha -->
- [ ] (De Codex para Claude) Consumir las Server Actions con el resultado `{ ok, data/error }` documentado en el contrato; no depender de excepciones para errores esperables — 2026-10-16

---

## Registro de decisiones

<!-- Formato: - YYYY-MM-DD (agente): decisión -->
- 2026-10-16 (Claude): reparto backend/infra → Codex, frontend/diseño → Claude. Contrato de api definido arriba.
- 2026-10-16 (Codex): clientes SSR usan `@supabase/ssr` y cookies async de Next 16; `proxy.js` refresca la sesión con `auth.getUser()` y solo hace redirecciones optimistas.
- 2026-10-16 (Codex): la migración usa una columna interna `storage_path` para adjuntos; el contrato público sigue exponiendo URLs firmadas temporales cuando se implemente la sección de Usuarios.
- 2026-10-16 (Codex): se fijaron versiones exactas de las dependencias backend; lint y build pasan. La validación contra una base Supabase real queda para cuando se configure el proyecto/CLI.
- 2026-10-16 (Codex): todas las Server Actions modelan resultados esperables como `{ ok: true, data }` o `{ ok: false, error }`; las lecturas de `api.js` mantienen excepciones. La migración otorga acceso Data API a `authenticated` y RLS conserva el aislamiento por `user_id`.
- 2026-10-16 (Codex): Teléfonos y Pendientes devuelven filas mutadas dentro de `data`; los borrados devuelven `{ id }`. `setTodoStatus` mantiene `doneAt` sincronizado y borrar una categoría deja sus pendientes con `categoryId: null` mediante la FK.
- 2026-10-16 (Codex): Settings usa defaults `#9dc3a5`, `lora` y `roboto`; colores y tipografías se validan tanto en Server Actions como con constraints de Postgres.
