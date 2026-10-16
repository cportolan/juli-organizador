<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Organizador Juli

Organizador personal para Juli: agenda, teléfonos internos, pendientes y fichas de personas con notas y adjuntos. Toda la interfaz está en **español rioplatense** ("vos", "guardá", "elegí").

> `CLAUDE.md` solo importa este archivo (`@AGENTS.md`). Las instrucciones se editan únicamente acá.

## Trabajo entre agentes

Este proyecto lo trabajan dos agentes en paralelo: **Codex** (backend, infraestructura, migraciones, todo lo server side) y **Claude** (todo el frontend y el diseño UX/UI). **Antes de empezar leé `TASKS.md`**: ahí están el reparto de archivos, el contrato de la API entre front y back, las tareas por fase y el registro de decisiones. No edites archivos que pertenecen al otro agente; dejá el pedido en `TASKS.md`.

---

## Stack y decisiones tomadas

No volver a discutir estas decisiones salvo que el usuario lo pida.

| Tema | Decisión |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 |
| Lenguaje | **JavaScript** (no TypeScript) |
| Estilos | **CSS Modules** + variables CSS globales para el tema (no Tailwind) |
| Íconos | `lucide-react` |
| Datos | Supabase (Postgres + Storage para adjuntos) |
| Auth | Un solo usuario (Juli) con email y contraseña de Supabase Auth; sin registro público |
| Calendario | Hecho a medida (no FullCalendar ni librerías similares) |
| Editor de texto | Tiptap |
| Git | Branch **`master`** (nunca `main`), remoto `origin` → `github.com/cportolan/juli-organizador` |

Variables de entorno (ver `.env.example`, valores reales en `.env.local`, que nunca se commitea):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Nunca usar ni pedir la secret key de Supabase en el frontend. Toda tabla lleva **Row Level Security** con políticas por `auth.uid()`.

---

## Especificación funcional (de `Proyecto.md`)

### Navegación (sidebar izquierdo)

#### Calendario / Agenda
- Cambio de vista: mensual, semanal (7, 5 o 3 días) y diaria.
- Vista moderna estilo Google Calendar.
- To-do flotante a la derecha (sidebar derecho) con **los mismos datos que Pendientes**; con flechas debajo de cada ítem se cambia el estado (**Pendiente ↔ Realizado**).
- Anotar eventos, cumpleaños y reuniones. Los eventos pueden repetirse o no, **estilo Google Calendar**: no se repite, diario, semanal (eligiendo días), mensual, anual y personalizado (cada N días/semanas/meses/años, con fin: nunca, en una fecha o después de N repeticiones). Al editar o borrar uno que se repite, preguntar: "solo este", "este y los siguientes" o "todos".
- Anotador general por día (una nota libre por día, aparte de los eventos): lo que se hizo en el día o notas libres.

#### Teléfonos / Internos
- Barra de búsqueda que busca en todos los campos.
- Tabla con oficina, agente y número de teléfono. **Ningún campo es obligatorio.**

#### Pendientes / To-do List
- Título, descripción, prioridad opcional (Baja / Media / Alta) y categoría.
- Dos estados: **Pendiente** y **Realizado**.
- CRUD de categorías desde la misma pantalla, personalizables por el usuario.
- Tres vistas intercambiables: columnas (kanban: Pendiente / Realizado), tabla e ítems (lista).
- Búsqueda general y filtros básicos (fecha de creación, prioridad, categoría, estado).

#### Usuarios (fichas de personas)
- Cada pestaña es una ficha sobre una persona, con un editor de texto completo (Tiptap: títulos, negrita, listas, checklists, colores, tablas, links).
- **Contraseña general** para entrar a la sección, y cada pestaña puede tener **su propia contraseña opcional**. Las contraseñas se guardan hasheadas, nunca en texto plano.
- Adjuntos por ficha con título: nombre del archivo y archivo (PDF, imagen, etc.), guardados en Supabase Storage.

### Configuración visual
- Colores personalizables: principalmente el color primario y el fondo (modo claro y oscuro).
- Estética soft / pastel, moderna y suave.
- Animaciones que hagan agradable la navegación.
- Varias tipografías a elegir; por defecto **Lora** (títulos) y **Roboto** (textos), cargadas con `next/font`.
- Íconos de Lucide React.

---

## Diseño UX/UI

**Antes de diseñar o maquetar cualquier pantalla o componente, cargá y seguí las skills de diseño UX/UI disponibles** en tu entorno (por ejemplo skills de frontend design, de diseño de interfaces o las de Figma si se trabaja con Figma). La web tiene que ser linda, cuidada y agradable de usar.

### Que no parezca hecho por IA
Evitá los clichés de las interfaces generadas automáticamente:
- Nada de degradados violeta-azul genéricos, glassmorphism por todos lados, emojis como íconos ni sombras enormes.
- No todo tiene que ser una tarjeta con borde redondeado y sombra; usá jerarquía con tipografía, espacio y color.
- Nada de textos de relleno tipo "Bienvenido a tu espacio de productividad ✨". Textos cortos, concretos y en el tono de la app.
- Evitá grillas simétricas y repetitivas sin intención; buscá un layout con personalidad, pensado para una persona real.
- Paleta pastel con criterio: pocos colores, buen contraste (mínimo WCAG AA para texto) y acentos puntuales.
- Detalles que se notan: estados vacíos con ilustración o mensaje útil, estados de carga (skeletons), hover y focus visibles, microinteracciones.

### Animaciones
- Transiciones suaves entre secciones y vistas, apertura y cierre de modales y paneles, y feedback al crear, completar o borrar.
- Duraciones cortas (150–300 ms), easing suave; nada que haga esperar al usuario.
- Respetar `prefers-reduced-motion`.
- Preferir CSS (transitions, keyframes, View Transitions). Si hace falta una librería, usar una sola en todo el proyecto (por ejemplo `motion`) y no mezclar.

### Tema
- Todos los colores, radios, sombras, espaciados y tipografías salen de **variables CSS** definidas en `app/globals.css` (`--color-primary`, `--color-bg`, `--font-heading`, etc.).
- Ningún componente usa colores hardcodeados: siempre `var(--...)`.
- El modo oscuro y el color primario se cambian sobrescribiendo variables, no duplicando estilos.

### Responsive y accesibilidad
- Funciona en desktop y en mobile (el sidebar se colapsa en pantallas chicas).
- HTML semántico, labels en todos los inputs, navegación por teclado, `aria-*` donde corresponda.

---

## Código

### No repetir código
- Antes de crear algo, buscá si ya existe un componente, hook o utilidad que lo resuelva y reutilizalo o extendelo.
- Si un patrón aparece dos veces, extraelo (componente, hook o helper).
- Lógica de datos centralizada: nada de queries de Supabase sueltas dentro de los componentes de UI.

### Estructura y componentes bien seccionados
- Componentes chicos, con una sola responsabilidad. Si un archivo pasa ~200 líneas, probablemente haya que dividirlo.
- Cada componente en su carpeta con su CSS Module:
  ```
  components/ui/Button/Button.jsx
  components/ui/Button/Button.module.css
  ```
- Organización sugerida:
  ```
  app/                    rutas (App Router), layouts y páginas
    (auth)/login/
    (app)/calendario/  telefonos/  pendientes/  usuarios/  configuracion/
  components/
    ui/                   piezas genéricas reutilizables (Button, Input, Modal, Select, Tabs, Badge, SearchBar, EmptyState...)
    layout/               Sidebar, RightSidebar, Header
  features/
    calendar/  phones/  todos/  people/  settings/
      components/         componentes propios de la sección
      hooks/              hooks de la sección
      api.js              acceso a datos de Supabase de la sección
  lib/
    supabase/             clientes de Supabase (browser y server)
    utils/                helpers puros (fechas, formato, búsqueda)
  supabase/
    migrations/           SQL del esquema, RLS y storage
  ```
- Las páginas de `app/` solo componen; la lógica vive en `features/` y `lib/`.
- Server Components por defecto; `"use client"` solo donde hay interactividad.

### Convenciones
- Componentes en `PascalCase`, hooks `useAlgo`, archivos de utilidades en `camelCase`.
- Nombres de código en inglés; textos visibles en español.
- Fechas con una sola librería (por ejemplo `date-fns` con locale `es`), sin mezclar.
- Manejar siempre los estados de carga, error y vacío.
- Correr `npm run lint` antes de dar algo por terminado.
- Cambios de base de datos siempre como migración SQL en `supabase/migrations/`.
