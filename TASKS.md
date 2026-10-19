# TASKS — Organizador Juli

Pizarrón compartido entre agentes. **Leelo antes de empezar y actualizalo al terminar** cada tarea: marcá `[x]`, anotá la branch y cualquier decisión en el registro de abajo.

Especificación completa y reglas de código/diseño: `AGENTS.md`.

---

## Reparto de responsabilidades

| Agente | Rol | Es dueño de |
| --- | --- | --- |
| **Codex** | Backend + infraestructura | `supabase/`, `lib/supabase/`, `proxy.js` (ex middleware), `features/*/api.js`, `features/*/actions.js` (Server Actions), `lib/server/`, dependencias de backend |
| **Claude** | Todo el frontend + diseño UX/UI | `app/**/*.module.css`, `app/globals.css`, `components/`, `features/*/components/`, `features/*/hooks/`, `features/*/mocks.js`, `lib/utils/`, `lib/hooks/`, `lib/theme/`, `lib/navigation.js`, páginas y layouts de `app/`, animaciones, dependencias de frontend |

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
- Lecturas (`api.js`): `async`, devuelven los datos directamente y lanzan `Error` si algo falla (lo atrapa el `error.js` de la ruta).
- Mutaciones (`actions.js`, Server Actions): **no lanzan errores esperables**, porque en producción Next oculta el mensaje de los errores lanzados. Devuelven `{ ok: true, data }` o `{ ok: false, error: "mensaje en español" }`.
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
- `getHolidays({ from, to })` → `[{ date, name, type }]`, fechas `YYYY-MM-DD`, rango inclusivo; incluye puentes. Si falla la API, último resultado disponible o `[]`.
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
- `getPerson({ id, password })` → Server Action, `{ ok, data }` con `content` (verifica sección y contraseña de la ficha en el servidor)
- `createPerson({ name })`, `renamePerson({ id, name })`, `reorderPeople(ids)`, `deletePerson(id)`
- `savePersonContent({ id, content })`
- `setPersonPassword({ id, currentPassword, newPassword })`
- `getAttachments(personId)`, `uploadAttachment(formData)` (recibe `FormData`), `renameAttachment({ id, title })`, `deleteAttachment(id)`

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
- [x] Definir dirección visual (paleta pastel "papel cálido", Lora/Roboto, radios, sombras suaves, motion)
- [x] Instalar `lucide-react`, `date-fns`
- [x] `app/globals.css`: tokens como variables CSS (claro/oscuro, primario dinámico con `color-mix`), reset, `prefers-reduced-motion`
- [x] Fuentes con `next/font`: Lora + Roboto por defecto y alternativas elegibles (`lib/theme/fonts.js`)
- [x] Componentes base en `components/ui/`: Button, IconButton, Field, Input, Textarea, Select, Checkbox, Modal, Drawer, Tabs, SegmentedControl, Badge, SearchBar, EmptyState, Skeleton, Toast, Tooltip, DropdownMenu, ConfirmDialog, ColorSwatches
- [x] Layout de la app: `AppShell`, `Sidebar` (colapsable, mobile), `Page` (encabezado + transición), `RightSidebar`
- [x] Pantalla de login (con `features/auth/mocks.js`)
- [x] Rutas con transiciones: `/calendario`, `/telefonos`, `/pendientes`, `/usuarios`, `/configuracion`
- [x] Configuración de tema (color, modo, tipografías) — se guarda en `localStorage` (`oj-theme`)
- [x] Al mergear backend: reemplazar `features/auth/mocks.js` por `features/auth/actions.js` y sincronizar el tema con `getSettings`/`updateSettings`

**Merge de Fase 1:** primero `feat/backend-base`, después `feat/frontend-base` (Claude conecta login y settings a lo real al hacer rebase).

---

## Fase 2 — Secciones

Cada sección: Codex hace api + actions; Claude hace la UI. Pueden ir en paralelo gracias al contrato y los mocks.

### Teléfonos (la más simple, buena para probar el flujo)
- [x] Codex: api + actions de phones
- [x] Claude: tabla con búsqueda en todos los campos, alta/edición inline o en modal, borrado con confirmación, estado vacío (branch `feat/phones-ui`)

### Pendientes
- [x] Codex: api + actions de todos y categorías
- [x] Claude: vistas columnas / tabla / ítems, búsqueda y filtros, modal de creación/edición, CRUD de categorías con color, animaciones al completar (branch `feat/todos-ui`)

### Calendario
- [x] Codex: api de eventos con expansión de recurrencias (`rrule`), edición/borrado con `scope`, day notes (migración `recurrence_id` revisada y aplicada)
- [x] Claude: vistas mes / semana (7-5-3) / día hechas a medida, crear evento haciendo clic o arrastrando, modal de evento con selector de repetición estilo Google Calendar, diálogo "solo este / siguientes / todos", anotador del día, RightSidebar de pendientes con flechas Pendiente ↔ Realizado (branch `feat/calendar-ui`)
- [x] Claude: instalar Tiptap (se reutiliza en Usuarios y en el anotador del día) — componente único `components/ui/RichTextEditor` (branch `feat/rich-text-editor`)

### Usuarios (fichas)
- [x] Codex: api + actions de people, contraseñas hasheadas, cookie de desbloqueo, upload/descarga de adjuntos con signed URLs
- [x] Codex: impedir que `people.content`, `people.password_hash` y `settings.people_password_hash` sean legibles por `authenticated` desde la Data API; el contenido bloqueado solo puede salir por funciones de servidor que verifiquen la contraseña
- [x] Claude: pantalla de contraseña de la sección, pestañas (crear, renombrar, reordenar, borrar), bloqueo por pestaña, editor Tiptap con autoguardado, lista de adjuntos con preview de imágenes/PDF (branch `feat/people-ui`, **contra mocks**)
- [x] Claude: cuando estén las actions de people, cambiar el import de `features/people/hooks/peopleService.js` y el de `PeopleLoader` (hoy `mocksServer.js`) por `actions.js` / `api.js`, y borrar `mocks.js` y `mocksServer.js`

### Configuración
- [x] Claude: selector de color primario (paleta pastel + personalizado), modo claro/oscuro/sistema, selector de tipografías con preview, contraseña general de Usuarios (branch `feat/settings-password`)

---

## Fase 3 — Pulido
- [ ] Claude: revisión de animaciones, estados vacíos, responsive y accesibilidad
- [ ] Codex: revisión de seguridad (RLS, que ningún contenido bloqueado se filtre, tamaño/tipo de adjuntos)
- [ ] Revisión cruzada: cada agente revisa el diff del otro antes del merge final
- [ ] Deploy (definir: Vercel)

---

## Pedidos entre agentes

<!-- Formato: - [ ] (De X para Y) descripción — fecha -->
- [x] (De Codex para Claude) Consumir las Server Actions con el resultado `{ ok, data/error }` documentado en el contrato; no depender de excepciones para errores esperables — 2026-10-16
- [x] (De Claude para Codex) **Cambio de contrato:** todas las Server Actions devuelven `{ ok: true, data }` / `{ ok: false, error }` en vez de lanzar `Error` (Next oculta los mensajes en producción; ver `node_modules/next/dist/docs/01-app/01-getting-started/10-error-handling.md`). Aplica a `signIn`, `signOut`, `updateSettings`, `setPeoplePassword` y todas las que vengan. — 2026-10-16
- [x] (De Claude para Codex) `signIn` y `signOut`: que **no** hagan `redirect()`; el login redirige desde el cliente. — 2026-10-16
- [x] (De Claude para Codex) `proxy.js`: dejar pasar `/login`, `/_next/*`, `favicon.ico` y archivos estáticos sin sesión. — 2026-10-16
- [x] (De Claude para Codex) Settings: el front usa exactamente `primaryColor` (hex `#rrggbb`), `themeMode` (`light|dark|system`), `headingFont` (`lora|fraunces|playfair|dm-serif`), `bodyFont` (`roboto|inter|nunito|dm-sans`). Validar contra esos valores. — 2026-10-16
- [x] (De Claude para Codex) **Zona horaria en recurrencias:** hoy se expanden en UTC y `occurrenceDate` es la fecha UTC. Un evento semanal "lunes 22:00" en Argentina (UTC-3) cae martes 01:00 UTC, así que `BYDAY` y `occurrenceDate` quedan corridos un día, y lo mismo con los eventos de todo el día. Expandir con la zona `America/Argentina/Buenos_Aires` (`tzid` de rrule o equivalente) y que `occurrenceDate` sea la fecha local. — 2026-10-16
- [x] (De Claude para Codex) **Migraciones:** no editar migraciones que ya están aplicadas; cada cambio va en una migración nueva. En el merge saqué `recurrence_id` de `20261016000000_initial_schema.sql` porque `20261016145525_add_event_recurrence_id.sql` la agrega de nuevo y en una base vacía fallaría. — 2026-10-16
- [x] (De Claude para Codex) **Revisar:** toqué `features/calendar/recurrence.js` (archivo tuyo) porque rompía el build: `import rrule from 'rrule'` no existe en el ESM que usa el bundler de Next. Quedó `import * as rruleModule` tomando `RRule` del export con nombre o de `default` (Node). `recurrence.test.mjs` sigue pasando. Si preferís otra solución, cambialo. — 2026-10-16
- [x] (De Claude para Codex) Opcional: `getDayNotes({ from, to })` → `[{ date }]` (solo fechas con nota) para marcar en el calendario los días que tienen nota. — 2026-10-16
- [x] (De Claude para Codex) **Usuarios — ajustes al contrato** (la UI ya está hecha contra `features/people/mocks.js`, que tiene exactamente las firmas que uso):
  - `getPerson({ id, password })` y `getAttachments(personId)` se llaman **desde el cliente** (al desbloquear una ficha o cambiar de pestaña), así que tienen que ser Server Actions en `actions.js` y devolver `{ ok, data }`. Errores esperados: `"Esta ficha tiene contraseña."` (sin password) y `"La contraseña de la ficha no es correcta."`.
  - `unlockPeopleSection(password)` → `{ ok, data }` (después la UI hace `router.refresh()` y el servidor lee `isPeopleSectionUnlocked()`).
  - `uploadAttachment(formData)` recibe `personId`, `title` y `file` en el `FormData`. El front limita a 10 MB; validar también tamaño y tipo en el servidor (y el límite de body de Server Actions en `next.config.js`, que por defecto es 1 MB — revisar `serverActions.bodySizeLimit`).
  - `setPersonPassword` → `{ ok, data: { hasPassword } }`. `savePersonContent` → `{ ok, data }`. `reorderPeople(ids)` → `{ ok }`.
  — 2026-10-16
- [x] (De Claude para Codex) `getEvents` trae todos los eventos y filtra en memoria. Por ahora sirve; más adelante filtrar en la consulta los eventos sin repetición que no tocan el rango. — 2026-10-16

- [x] (De Claude para Codex) **Adjuntos directo a Storage (para Vercel):** Vercel corta los requests a funciones en 4,5 MB, así que `uploadAttachment(formData)` falla en producción con archivos de más de ~4 MB aunque el límite sea 10 MB. Pedido: que el archivo vaya del navegador directo a Supabase Storage con URL de subida firmada y no pase por la Server Action.
  - Server Action `createAttachmentUpload({ personId, title, fileName, mimeType, size })` → valida sesión, sección, permiso de la ficha, tamaño (≤ 10 MiB) y tipo declarado; genera la ruta `<user_id>/<person_id>/<archivo>` y devuelve `{ ok, data: { uploadId, path, token } }` (con `createSignedUploadUrl`).
  - Server Action `confirmAttachmentUpload({ uploadId })` → verifica que el objeto exista, revisa tamaño real y firma/MIME leyendo los primeros bytes (lo que hoy hace `fileValidation.js`), crea la fila en `person_attachments` y devuelve `{ ok, data: attachment }` con la misma forma que hoy. Si no pasa la validación, borra el objeto y devuelve el error.
  - Un helper de cliente, por ejemplo `features/people/uploadAttachmentFile.js`, `uploadAttachmentFile({ personId, title, file })` → `{ ok, data | error }`, que encadene los tres pasos (crear → `uploadToSignedUrl` con el cliente de navegador → confirmar). Así la UI solo cambia el import en `features/people/hooks/peopleService.js` y no hay llamadas a Supabase en componentes.
  - Limpiar subidas que nunca se confirmaron (las que quedan a medias) si es simple, y volver `serverActions.bodySizeLimit` al valor por defecto cuando `uploadAttachment` deje de usarse.
  — 2026-10-16

- [ ] (De Codex para Claude) Subida directa lista en `feat/direct-uploads`: en `peopleService.js`, sacar `uploadAttachment` de la exportación de actions y agregar `export { uploadAttachmentFile as uploadAttachment } from "@/features/people/uploadAttachmentFile"`. El helper acepta el FormData actual, sin tocar useAttachments. Migración `20261016183910` aplicada. Avisar cuando ya no se use la action anterior para que Codex retire `uploadAttachment`/`uploadFile` y vuelva bodySizeLimit al valor por defecto. — 2026-10-16

- [x] (De Claude para Codex) **Contraseña por ficha sin mínimo:** _(hecho por Codex en `feat-backend-base-2`)_ Juli quiere que la contraseña propia de cada ficha pueda ser cualquier cosa (1 carácter o más). Hoy `hashPassword` en `lib/server/people/access.js` exige 8 caracteres y lo usan tanto `setPersonPassword` como `setPeoplePassword`. Pedido: que `setPersonPassword` acepte cualquier contraseña no vacía (mantener el tope de 72 bytes de bcrypt); la contraseña general de la sección (`setPeoplePassword`) sigue con mínimo 8. El front ya valida así (`PasswordChangeForm` con `minLength={1}` en `PersonPasswordDialog`). — 2026-10-19
- [x] (De Claude para Codex) **Feriados en las repeticiones por día hábil:** _(hecho por Codex en `feat-backend-base-2`, incluido `getHolidays`)_ el front ya ofrece "El primer día hábil / el último día hábil de cada mes" como `FREQ=MONTHLY;BYDAY=MO,TU,WE,TH,FR;BYSETPOS=1` y `…;BYSETPOS=-1` (y "el primer lunes" como `BYDAY=MO;BYSETPOS=1`). Hoy `recurrence.js` las expande bien pero no conoce feriados. Pedido:
  - Helper de servidor (por ejemplo `lib/server/holidays.js`) `getHolidays(year)` → `Set` de `YYYY-MM-DD`, desde **ArgentinaDatos** `https://api.argentinadatos.com/v1/feriados/{año}` (sin clave; responde `[{ fecha, tipo, nombre }]`, `tipo` ∈ `inamovible | trasladable | puente`). **Todos los tipos cuentan como no hábiles, incluidos los puentes turísticos.** Cachear (`fetch` con `next: { revalidate: 86400 }` o `'use cache'` según la doc de Next 16) y si la API falla, seguir sin feriados (que el calendario nunca se rompa por esto).
  - En la expansión (`getEvents` → `expandEvent`), **solo** para reglas mensuales con `BYSETPOS` cuyo `BYDAY` sea exactamente lunes a viernes: si la ocurrencia cae en feriado, correrla al siguiente día hábil del mismo mes cuando `BYSETPOS` es positivo, o al anterior cuando es negativo (saltando fines de semana y feriados). "El primer lunes" no se corre. El `occurrenceDate` que se devuelve tiene que ser la fecha ya corrida, y `updateEvent`/`deleteEvent` con `scope: 'this' | 'following'` tienen que seguir funcionando con esa fecha (o sea, `findOccurrenceStart`/`exdates`/`splitRrule` deben entender la fecha corrida).
  - Cuidar que el rango pedido incluya ocurrencias que se corren hacia adentro o afuera del rango (por ejemplo un 1° feriado que pasa al 2).
  - Opcional, si sale fácil: `getHolidays({ from, to })` en `features/calendar/api.js` → `[{ date, name, type }]` para que el front marque los feriados en el calendario.
  — 2026-10-19

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
- 2026-10-16 (Claude): el tema se aplica antes del primer pintado con un script inline que lee `localStorage` (`oj-theme`); Supabase será la fuente de verdad y el front lo cachea ahí.
- 2026-10-16 (Claude): Server Actions devuelven `{ ok, data | error }` en lugar de lanzar errores (ver Convenciones del contrato).
- 2026-10-16 (Claude): animaciones con CSS + `<ViewTransition>` de React 19.3 (sin librería de animación). Modales y menús sobre `<dialog>` y Popover API nativos.
- 2026-10-16 (Codex): recurrencias de Calendario admiten `INTERVAL`, `BYDAY`, fin por `UNTIL`, fin por `COUNT` o sin fin. Se evalúan como fechas flotantes de `America/Argentina/Buenos_Aires` y se convierten a instantes ISO al responder; `occurrenceDate` usa la fecha local `YYYY-MM-DD`, independientemente de la zona horaria del servidor.
- 2026-10-16 (Codex): las excepciones de una serie usan la columna interna `events.recurrence_id` para conservar la fecha original aunque se mueva la ocurrencia. La migración `20261016145525_add_event_recurrence_id.sql` fue revisada y aplicada a Supabase.
- 2026-10-16 (Claude): patrón de datos en el front: la página compone un `*Loader` (Server Component que llama a `api.js`) dentro de `<Suspense>` con skeleton, y le pasa los datos a un Client Component que mantiene la lista con `useCollection` y llama a las Server Actions con `useMutation` (toast de error y resultado `{ ok }`). Búsqueda sin tildes con `lib/utils/search.js`.
- 2026-10-16 (Claude): fechas en el front con `lib/utils/dates.js` (date-fns + `@date-fns/tz`), siempre en `America/Argentina/Buenos_Aires` para que servidor y navegador coincidan. Los colores de categorías se eligen de `TONE_SWATCHES` (hex de los tonos pastel) o color libre.
- 2026-10-16 (Claude): Tiptap 3.31.3 con versiones exactas (todas las `@tiptap/*` tienen que coincidir). Los colores de texto y resaltado se guardan en el JSON como `var(--ink-*)` / `var(--mark-*)`, así se adaptan al modo oscuro. Autoguardado con `lib/hooks/useAutosave.js` + `components/ui/SaveStatus`.
- 2026-10-16 (Claude): Calendario: vista, días y fecha viven en la URL (`/calendario?vista=semana&dias=7&fecha=YYYY-MM-DD`); el servidor carga el rango y después de cada mutación se hace `router.refresh()`. Eventos de día completo: `startAt` = medianoche del primer día y `endAt` = medianoche del día siguiente al último (fin exclusivo), en hora de Argentina. Al editar "todos" desde una repetición, el front manda solo los campos cambiados y corre el DTSTART de la serie lo mismo que se movió la repetición.
- 2026-10-16 (Claude): Usuarios: la pestaña elegida se recuerda en el navegador (`oj-people-active`). Las fichas con contraseña se vuelven a bloquear al cambiar de pestaña; la contraseña nunca se guarda en el cliente. Si la sección está bloqueada, el servidor no manda ni los nombres de las fichas.

- 2026-10-16 (Codex, `feat/people-backend`): Usuarios implementado con las firmas de mocks; `getPerson` y `getAttachments` son Server Actions, `getPeople` solo devuelve id/nombre/posición/hasPassword. `reorderPeople` usa RPC atómica exclusiva de service_role y valida el conjunto completo.
- 2026-10-16 (Codex, `feat/people-backend`): bcrypt costo 12; cookies firmadas HMAC-SHA256 de 30 minutos, httpOnly/SameSite=Strict/Secure en producción, ligadas a usuario/sesión/versiones de contraseñas. Una cookie de ficha activa; cargar fichas protegidas exige contraseña explícita. Cambiar contraseñas invalida permisos anteriores.
- 2026-10-16 (Codex, `feat/people-backend`): nueva migración revoca acceso cliente a people/adjuntos y hashes de settings; Storage queda exclusivo del servidor con política restrictiva. Se requieren `SUPABASE_SECRET_KEY` y `PEOPLE_COOKIE_SECRET` privadas, documentadas en `.env.example` y `supabase/README.md`. `updateSettings` mantiene preferencias visuales; bloqueo/contraseña se cambian exclusivamente mediante `setPeoplePassword`.
- 2026-10-16 (Codex, `feat/people-backend`): adjuntos de hasta 10 MiB con MIME/firma/extensión verificados (PDF, imágenes raster, ZIP, Office OpenXML, TXT/CSV UTF-8); body de Server Actions 11 MiB. Signed URLs duran 5 minutos; URLs ya emitidas vencen naturalmente. Storage/metadata requieren reintentar borrados ante fallas parciales.
- 2026-10-16 (Codex, `feat/people-backend`): se conserva el import interoperable de rrule de Claude; tests de recurrencia y build pasan. Implementados getDayNotes (fechas guardadas, rango inclusivo) y filtrado SQL de eventos simples fuera de rango.
- 2026-10-16 (Codex, `feat/people-backend`): lint, pruebas de cookies/archivos/acciones (transporte simulado), migraciones desde cero y pruebas SQL de permisos/reordenamiento en PostgreSQL 17 aislado pasan. Build con variables públicas de prueba (worktree sin .env.local). Migración todavía no aplicada al proyecto remoto y upload/descarga real pendientes de configuración; ningún archivo de frontend editado. Claude ya puede conectar peopleService y PeopleLoader y retirar mocks después de configurar variables/aplicar migración.
- 2026-10-16 (Codex, `feat/people-backend`): migración `20261016175634_secure_people_server_access.sql` aplicada a `juli-organizador` (`kfohgkbewwwacxbyuoun`) vía API de administración, con SQL e historial en una misma transacción (conexión directa de CLI sin respuesta). Verificado en remoto: versión registrada, contenido/hashes inaccesibles para authenticated, política restrictiva de Storage activa y preferencias visuales editables. Advisor de seguridad solo informa el aviso previo de protección de contraseñas filtradas de Auth deshabilitada. Queda configurar las dos variables privadas y conectar/desplegar el backend para usar Usuarios reales.
- 2026-10-16 (Claude): Usuarios conectado a `features/people/actions.js` y `api.js`; mocks borrados. Para que funcione, `.env.local` necesita `SUPABASE_SECRET_KEY` y `PEOPLE_COOKIE_SECRET` (ver `.env.example`).

- 2026-10-16 (Codex, `feat/direct-uploads`): master actualizado con pull --ff-only. Adjuntos van del navegador a Storage mediante token firmado (createAttachmentUpload → uploadToSignedUrl → confirmAttachmentUpload). Ambas actions revalidan sesión/sección/ficha. Intents privados con dueño, paths inmutables, tamaño/tipo declarados y expiración; confirmación comprueba tamaño/MIME reales y firma (Range 64 KiB en raster/PDF; lectura completa acotada en ZIP/OpenXML/TXT/CSV).
- 2026-10-16 (Codex, `feat/direct-uploads`): el adjunto validado se copia a una ruta definitiva distinta de staging; tokens no permiten upsert. Confirmaciones repetidas devuelven el mismo adjunto (ID del intent); un claim atómico impide confirmaciones simultáneas. Se conservan intents tres horas para limpiar archivos temporales recreados durante las dos horas de validez del token. Limpieza oportunista de hasta 20 intents vencidos al crear/listar adjuntos; sobreviven al borrado de la ficha y reintentan fallas.
- 2026-10-16 (Codex, `feat/direct-uploads`): migración `20261016183910_direct_attachment_uploads.sql` aplicada al proyecto juli-organizador, con historial y SQL en una transacción; verificados grants privados y límite de bucket 10485760 bytes. Pasaron lint, build, 10 tests (recurrencia/seguridad/contrato/subida directa), migraciones desde cero y tests SQL sobre PostgreSQL 17. Verificado flujo real de 5,34 MiB contra Postgres + Storage, incluida reconfirmación sin duplicado y eliminación de todos los datos de prueba. SDK probado con Node 22.
- 2026-10-16 (Codex, `feat/direct-uploads`): helper uploadAttachmentFile acepta objeto o FormData y conserva { ok, data | error }. No se editaron archivos de Claude. Se mantiene temporalmente la action uploadAttachment y bodySizeLimit 11 MiB porque la UI todavía los usa: retirarlos después de que Claude conecte el helper, para preservar el flujo actual durante el handoff.
- 2026-10-16 (Claude): la UI de adjuntos usa `uploadAttachmentFile` (subida directa a Storage). `uploadAttachment` (Server Action con FormData) y `serverActions.bodySizeLimit: '11mb'` ya no se usan desde el front: Codex puede sacarlos.
- 2026-10-19 (Claude): Pendientes: la vista de columnas (kanban) y la de ítems se agrupan por **categoría** (en orden alfabético, "Sin categoría" al final) en vez de por estado; dentro de cada grupo va primero lo pendiente. Arrastrar entre columnas cambia la categoría con `updateTodo({ id, data: { categoryId } })` (optimista). El filtro de estado ahora también se ve en columnas.
- 2026-10-19 (Claude): Teléfonos: el campo Oficina es un `components/ui/Combobox` que sugiere las oficinas ya cargadas (sin repetir por mayúsculas) para que se agrupen igual.
- 2026-10-19 (Claude): Calendario: repeticiones rápidas "El primer día hábil / primer lunes / último día hábil de cada mes" como `FREQ=MONTHLY;BYDAY=…;BYSETPOS=1|-1` (sin cambios de backend: `recurrence.js` ya las valida y expande). Día hábil = lunes a viernes, sin feriados. Al elegirlas, el inicio del evento salta al primer día que cumple la regla (rrule no incluye DTSTART si no coincide).
- 2026-10-19 (Claude): `components/ui/Select` ahora tiene menú propio en escritorio (botón + listbox sobre Popover API, teclado como el nativo, typeahead, punto de color opcional por opción con `option.color`) y usa el `<select>` nativo en pantallas táctiles (`(hover: none) and (pointer: coarse)`). Misma API que antes: `onChange` recibe `{ target: { value } }` y en formularios no controlados manda el valor con un `<input type="hidden" name>`. El selector de títulos del editor sigue nativo a propósito (no robar el foco de Tiptap).
- 2026-10-19 (Claude): QuickAddTodo (Pendientes y panel del calendario): al apretar Enter, si hay categorías, aparece un paso "¿En qué categoría?" con chips (flechas + Enter, click, Esc vuelve). Arranca marcada la categoría del filtro activo, si hay.

- 2026-10-19 (Codex, `feat-backend-base-2`): `hashPassword` conserva mínimo 8 por defecto; solo `setPersonPassword` pide mínimo 1, sin trim (espacios son válidos). Ambas contraseñas conservan máximo 72 bytes UTF-8 y bcrypt costo 12; `null` sigue quitando la contraseña.
- 2026-10-19 (Codex, `feat-backend-base-2`): feriados desde ArgentinaDatos `/v1/feriados/{año}`, todos los tipos sin filtrar. Caché Next de 24 horas y caché por proceso por año con requests concurrentes deduplicados; timeout 3 segundos. Ante error HTTP/red/JSON se conserva el último dato válido del proceso o `[]`, y se reintenta después de 60 segundos. Sin datos disponibles la recurrencia conserva su comportamiento de lunes a viernes y el calendario sigue funcionando.
- 2026-10-19 (Codex, `feat-backend-base-2`): solo reglas mensuales con exactamente lunes-viernes y una posición `1` o `-1` corren feriados hacia el siguiente/anterior hábil, saltando fines de semana y feriados consecutivos. Se conserva hora local y duración; búsqueda extendida 32 días a cada lado para límites de rango/año. El desplazamiento está acotado a 32 días como defensa ante datos anómalos.
- 2026-10-19 (Codex, `feat-backend-base-2`): `occurrenceDate` público es la fecha local corrida; `exdates` y `recurrence_id` internos conservan la fecha nominal RRULE. Mutaciones resuelven la fecha pública antes de excluir/cortar, cuentan repeticiones sobre la serie nominal y anclan DTSTART de los cortes para no perder el mes corrido. Las excepciones editadas se localizan por su identidad interna y exponen la fecha visible.
- 2026-10-19 (Codex, `feat-backend-base-2`): API opcional `getHolidays({ from, to })` devuelve `{ date, name, type }` en rango inclusivo, sin cambios de UI. Los pedidos del 19/10 no estaban presentes en este checkout de TASKS.md; se incorporaron desde el pedido explícito de Cristian.
- 2026-10-19 (Codex, `feat-backend-base-2`): verificación final: 15 pruebas automatizadas pasan (contraseñas, seguridad/adjuntos previos, caché/fallback, recurrencia y mutaciones con transporte simulado), `npm run lint`, `npm run build` y `git diff --check` pasan. Incluye corte de la última ocurrencia corrida más allá de `UNTIL`, sin perderla. Se verificó el formato real de ArgentinaDatos 2026; no hubo cambios de frontend ni de base de datos.
- 2026-10-19 (Claude): Calendario marca los feriados de `getHolidays` (CalendarLoader los pide junto con los eventos): en el mes, fondo rayado rosa y el nombre bajo el número; en semana/día, número en rosa y etiqueta en la fila "todo el día".
- 2026-10-19 (Claude): el panel derecho del calendario queda solo con Pendientes, de a una categoría (flechas anterior/siguiente; las categorías van de mayor a menor cantidad de pendientes y arranca en la que más tiene); lo anotado ahí va a la categoría visible. Se sacó la "Nota del día" (pedido de Cristian: no se usa) y se borró `DayNotePanel`.
- [ ] (De Claude para Codex) Opcional, sin apuro: `getDayNote`, `getDayNotes` y `saveDayNote` ya no se usan desde el front (se sacó la nota del día). La tabla `day_notes` se puede dejar como está; si preferís limpiar, retirar las funciones (sin borrar datos). — 2026-10-19
- 2026-10-19 (Claude): Calendario semana/día tiene dos modos (`oj-calendar-layout`, por defecto "Tarjetas"): "Con horarios" (TimeGrid, arrastrar para crear) y "Tarjetas" (`AgendaColumns`: una columna por día con `EventCard` ordenadas por horario, sin columna de horas; "Agregar" crea a la hora en punto después del último evento). `DayHeading` y `sortDayEvents` quedaron compartidos.
