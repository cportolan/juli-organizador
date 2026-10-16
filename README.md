# Organizador Juli

Organizador personal: calendario, pendientes, teléfonos internos y fichas de personas con notas y adjuntos.

- **Especificación:** `Proyecto.md`
- **Reglas para agentes (stack, diseño, código):** `AGENTS.md` (`CLAUDE.md` solo lo importa)
- **Tareas, reparto y contrato front/back:** `TASKS.md`

Stack: Next.js 16 (App Router) + React 19, JavaScript, CSS Modules, Supabase (Postgres, Auth y Storage), `lucide-react`, `date-fns`, `rrule`.

---

## Instalar en una computadora nueva

### 1. Requisitos

- **Node.js 22** o más nuevo (`node -v`)
- **Git**
- Acceso al proyecto de Supabase (las credenciales no están en el repo)

### 2. Clonar e instalar

```bash
git clone https://github.com/cportolan/juli-organizador.git
cd juli-organizador
git checkout master
npm install
```

### 3. Variables de entorno

```bash
cp .env.example .env.local
```

Completá `.env.local` con los datos del proyecto de Supabase (**Project Settings → API** en supabase.com, o copiá el `.env.local` de la otra computadora por un medio seguro). Nunca se sube a git.

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

La base de datos está en la nube, así que una computadora nueva usa los mismos datos y el mismo usuario.

### 4. Levantar la app

```bash
npm run dev
```

Abrí http://localhost:3000 e ingresá con el usuario de Juli.

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run lint` | ESLint (correrlo antes de commitear) |
| `npm run build` | Build de producción |
| `node --test features/calendar/recurrence.test.mjs` | Tests de recurrencias del calendario |

---

## Base de datos (Supabase)

Las migraciones están en `supabase/migrations/` y se aplican en orden. Ver `supabase/README.md`.

| Migración | Estado |
| --- | --- |
| `20261016000000_initial_schema.sql` | Aplicada |
| `20261016144539_secure_updated_at_search_path.sql` | Aplicada |
| `20261016145525_add_event_recurrence_id.sql` | **Pendiente**: aplicarla antes de usar el calendario |

Para aplicar una pendiente sin la CLI: Supabase → **SQL Editor** → pegar el archivo → **Run**.

Regla: una migración ya aplicada no se edita; cada cambio va en una migración nueva.

---

## Trabajo con agentes

Dos agentes en paralelo, coordinados por `TASKS.md`:

- **Codex:** backend e infraestructura (`supabase/`, `lib/supabase/`, `lib/server/`, `proxy.js`, `features/*/api.js` y `actions.js`).
- **Claude:** frontend y diseño (`app/`, `components/`, `features/*/components` y `hooks`, `lib/theme`, `lib/hooks`, `lib/utils`).

Flujo:

1. Cada agente trabaja en su propia branch y worktree (por ejemplo, con Orca), creada desde `master` actualizado.
2. Al empezar, cada agente lee `AGENTS.md` y `TASKS.md`; al terminar, marca sus tareas y anota decisiones y pedidos ahí.
3. Se mergea a `master` de a una branch por vez (backend primero), con lint y build pasando.
4. La branch principal es **`master`** (no `main`).

## Estado actual

- **Hecho:**
  - Sistema de diseño, layout, login y Configuración de tema (conectados a Supabase).
  - Backend de Teléfonos, Pendientes y Calendario.
- **Siguiente (Fase 2):**
  - Interfaz de Teléfonos, Pendientes y Calendario (Claude).
  - Corrección de zona horaria en recurrencias (Codex).
  - Sección Usuarios (Codex y Claude).
