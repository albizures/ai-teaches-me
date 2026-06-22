# vanjs-core for interactive playgrounds

Context: refactoring `src/components/VectorOpsPlayground.astro` to be
reactive, while also establishing the house pattern for future interactive
widgets in this workspace (the "static diagram" vs "interactive playground"
distinction defined in `CONTEXT.md`).

We decided: interactive playgrounds use `vanjs-core` as a **runtime
dependency**, delivered as a bundled client `<script type="module">` inside an
`.astro` shell — **not** via an Astro renderer and **not** with a `client:*`
directive on the MDX call site. The SSR'd shell owns static geometry (grid,
axes, `<defs>`); a van tree owns only the state-driven layers (result, handles,
readout). Structure: one stateful `Playground` controller owning all
`van.state` atoms (one `van.state<Vec>` per vector, plus atoms for `op` and
`k`) and all input handlers; two presentational leaves (`ResultView`,
`Readout`) computing shapes/text purely from derived state. A `src/lib/`
substrate (`vec.ts`, `svg-stage.ts`) holds the domain math and the y-down
SVG mapping so future widgets and `VectorGrid.astro` can share them.

## Considered Options

- **Astro renderer + `client:load`** (rejected) — proper "Astro way," sets a
  stronger precedent, but requires a custom renderer or `@vanjs/astro`,
  forces an SSR/hydration decision (vanjs-core is DOM-centric; server needs a
  mini-van shim), and changes the one MDX call site that today is directive-
  free. Too heavy for a sample-size-of-one refactor.
- **van as event bus + imperative redraw** (rejected) — smallest diff, but
  uses van only as a glorified pub/sub and sets a weak precedent; doesn't earn
  the new dep.
- **Full van-owned DOM with no SSR shell** (rejected) — most "idiomatic," but
  regresses First Paint on a static site, makes static geometry reactive for
  no reason, and fights the "browsable offline for years" ethos.
- **Container `sScene` atom holding `{A,B,op,k}`** (rejected) — fans every
  change out to every derive (e.g. `Readout` re-rendering when `k` changes on
  a non-scale op); worse than today's imperative version and reintroduces a
  god object the presentational leaves shouldn't know about.

## Consequences

- MDX call sites stay directive-free: `<VectorOpsPlayground size={340} units={5} />` unchanged.
- Precedent for future interactive widgets: **`.astro` shell + van-state
  controller + presentational leaves + `src/lib/` substrate**.
- `Vec` state must be assigned **fresh objects** on every update. vanjs-core
  dedups notifications by reference inequality (`rawVal !== _oldVal`), so
  mutating `sA.val.x = ...` in place will **silently skip the redraw**.
  Enforced today by convention (a comment at the assignment site), not by the
  type system — `Vec` is plain `{x:number; y:number}`.
- All per-instance listeners (drag, slider, op tabs) are attached to elements
  **inside the `.astro` shell**, never to `document` or `window`, so the
  module-level `astro:page-load` listener is the only document-level listener
  and the per-instance closures stay scoped to the shell.
- Lifecycle mirrors the original imperative script: `initVOP(root)` gated by
  a `dataset.ready` guard, called by `initAll()` on script run and on
  `astro:page-load`. No explicit per-instance disposal; vanjs's lazy GC
  (`statesToGc`) handles disconnected bindings. This preserves a latent
  cross-navigation listener leak that already existed pre-refactor — kept
  deliberately to minimize behavioral change.
- **Mount mechanism:** the random per-instance id + `data-vop` + `initAll()`
  scoping used here is **not** the house style for _new_ widgets.
  ADR-0002 sets the forward rule — mount interactive widgets as custom
  elements so per-instance logic is scoped by the DOM boundary instead of
  by author-minted unique ids. This component is grandfathered by ADR-0002
  with explicit migration debt; see ADR-0002 before adding or touching an
  interactive widget.
