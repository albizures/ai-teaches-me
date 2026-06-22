# Scope interactive widgets via custom elements

Interactive playgrounds (see `CONTEXT.md`) react to per-instance runtime
state. A new widget embedded more than once on the same page must keep each
instance's van state, listeners, and DOM queries scoped to its own tree.
**We mount future interactive widgets as custom elements** (`customElements.define`,
`connectedCallback`) so each instance's logic is scoped to its own element
boundary by construction; the author no longer has to mint random per-instance
ids to avoid collisions. Shadow DOM is **available but not required** — its
style/control encapsulation is a plus, not a precondition.

## Considered Options

- **Random per-instance id + `data-*` selector** (the current `VectorOpsPlayground`
  pattern; rejected for *new* widgets) — works, and is the conventional Astro
  answer, but forces the author to suffix every queryable element
  (`#{id}-svg`, `#{id}-ops`, `#{id}-k`, …) and to run a module-level
  `initAll()` + `astro:page-load` probe over `document.querySelectorAll`. It
  scopes by *convention* against ids the author must invent and keep unique;
  the custom element scopes by *the DOM boundary itself*. We keep this only
  for the pre-existing `VectorOpsPlayground` (see Consequences).
- **Shadow DOM on every custom element** (rejected as a hard rule) — strongest
  encapsulation (no surrounding-prose CSS in, no widget CSS out), but
  `VectorOpsPlayground` mixes SSR'd static SVG chrome with a reactive client
  tree and depends on Tailwind utility classes inheriting from the page
  theme; forcing shadow DOM on every widget would cut that inherited styling
  off and complicate the SSR shell. Adopt shadow DOM per-widget when the
  widget genuinely needs style isolation, not as a blanket mandate.
- **Astro renderer + `client:load`** — already rejected in ADR-0001; this ADR
  inherits that rejection. Custom elements here are **not** an Astro renderer:
  they are a thin client-side mount envelope (one `customElements.define` in
  the bundled `<script type="module">`) wrapping the same van-state
  controller + presentational leaves + `src/lib/` substrate ADR-0001
  establishes.

## Consequences

- **Forward rule:** new interactive widgets are custom elements. The
  vanjs-core / "`.astro` shell + van-state controller + presentational
  leaves + `src/lib/` substrate" shape from ADR-0001 still holds; the custom
  element is the *mount envelope* for that shape, not a replacement for it.
- **`VectorOpsPlayground` is grandfathered, with dated migration debt.** It
  keeps its random-id + `data-vop` + `initAll()` + `astro:page-load` pattern
  today to minimize behavioral change (same posture ADR-0001 takes toward
  its latent listener leak). **Do not "fix" it gratuitously.** When it is next
  touched for other reasons, convert it to a custom element and delete the
  random-id/`data-vop`/`initAll` machinery, paying down this debt. Until then
  it is the one admitted violator of the forward rule; this ADR is the note
  that keeps someone from either "correcting" it prematurely or assuming the
  random-id pattern is the house style.
- **Shadow DOM is opt-in per widget**, decided when a widget needs style
  isolation. The default is light-DOM custom elements inheriting page styles
  (Tailwind), matching how `VectorOpsPlayground` mixes SSR'd chrome and theme
  classes.
- **Per-instance listeners stay scoped to the element's own subtree** —
  ADR-0001's "never attach to `document`/`window`" rule carries over
  unchanged. The module-level `astro:page-load` document listener remains the
  one document-level hook, only for the grandfathered widget; new custom
  elements own their lifecycle via `connectedCallback`/`disconnectedCallback`
  and do not add to the document-level listener set.
- See ADR-0001 for the vanjs-core choice itself and the rejected
  Astro-renderer / event-bus / no-SSR-shell alternatives, all of which still
  stand.