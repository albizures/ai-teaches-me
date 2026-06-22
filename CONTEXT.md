# CONTEXT — Glossary

A plain glossary for the `ai-teach` workspace. Domains terms only — no
implementation details, no specs, no scratch. Add a row the moment a term is
resolved; update a row the moment its meaning shifts.

## Domain terms

### Static diagram

An SVG figure rendered **server-side** from declarative props (vector list,
units, caption, …), with **no client script and no runtime state**. It _shows_
a vector relationship once, the way a figure in a textbook does. It does not
react to the learner.

- Canonical component: `src/components/VectorGrid.astro`.
- Lifecycle: SSR-only; the markup is final at build time.
- Does **not** use vanjs. (See [Interactive playground](#interactive-playground).)

### Interactive playground

An SVG figure that **runs client-side** and whose geometry is driven by
**runtime state** the learner manipulates (dragging handles, switching an
operation, moving a slider). It exists to be poked at; the figure changes in
response. The static _shell_ (grid, axes, `<defs>`) may still be SSR'd, but
everything that changes with state is owned by a reactive client tree.

- Canonical component: `src/components/VectorOpsPlayground.astro`.
- Lifecycle: `.astro` shell SSR's; a bundled client script mounts a reactive
  tree (`vanjs-core`) into the shell on load and on
  `astro:page-load` (View Transitions).
- **Does** use `vanjs-core` as a runtime dependency.

The distinction is _intentional and load-bearing_: a concept that needs only
to be **seen** is a static diagram; a concept that needs to be **felt** by
manipulation is an interactive playground. `NOTES.md` (both the workspace and
the `2d-game-math` topic) already rely on this split ("visual examples by
default" vs "interactive widget"); this glossary fixes the names.

### Coordinate convention — y-down

All vector math and drawing in this workspace uses the **raylib/screen
convention**: the origin sits at the **center** of the stage, **+x points
right**, and **+y points DOWN**. This is the opposite of the standard
math-textbook y-up axis and was settled deliberately in lesson 0001 of the
`2d-game-math` topic — learners are expected to internalize it because the
target engine (raylib) uses it.

Consequences:

- A vector written `(2, 1)` visually points **right and slightly downward** on
  the stage, not right-and-up.
- "Subtract" / "distance" computations are unaffected (deltas are
  coordinate-agnostic) but the drawn result obeys y-down.
- Any reactive redraw or drag math must map between **grid units** (y-down,
  the domain) and **screen pixels** (also y-down, but pixel-space) through the
  single `scale` + `cx`/`cy` mapping — never silently flip `y`.
