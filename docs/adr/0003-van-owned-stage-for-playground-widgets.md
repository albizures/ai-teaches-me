# Playground widgets build their whole stage in `connectedCallback`

Context: the post-grilling refactor of
`src/components/VectorOpsPlayground.astro` (see `handoff.md`). ADR-0001
established the house pattern — `.astro` shell + van-state controller +
presentational leaves + `src/lib/` substrate — but explicitly had the SSR'd
shell own the static SVG chrome (grid, axes, `<defs>`) for "First Paint",
while a van tree mounted only into the state-driven layers. ADR-0002 then
made interactive widgets custom elements and *grandfathered* VOP with dated
migration debt (random-id + `data-vop` + `initAll()` + `astro:page-load` +
`dataset.ready`), to be paid down "when it is next touched for other reasons."
This is that next touch.

We decided: **interactive playground widgets build their entire stage in the
custom element's `connectedCallback` with `van.tags(NS)`** — the `<svg>` and
its `viewBox`/`width`/`height`, the arrowhead `<defs>`, the grid, the axes,
the reactive result/handles layers, and the controls + numeric read-out. The
`.astro` template contributes only the bare outer custom-element tag
(`&lt;vector-ops-playground class=… data-size=… data-units=…&gt;&lt;/…&gt;`);
there is no SSR'd SVG block at all. The atom granularity (one `van.state&lt;Vec&gt;`
per vector, plus `op` and `k`), the fresh-Vec assignment invariant, the
controller-owns-inputs / leaves-read-state split, and the `vec.ts` /
`svg-stage.ts` substrate are all **unchanged**.

This **supersedes two ADR-0001 statements**:

1. The carried decision "the SSR'd shell owns static geometry (grid, axes,
   `&lt;defs&gt;`); a van tree owns only the state-driven layers."
2. The rejected option "Full van-owned DOM with no SSR shell — rejected"
   (which was rejected for regressing First Paint, making static geometry
   reactive "for no reason," and fighting the "browsable offline for years"
   ethos).

ADR-0002's forward rule (custom-element mount envelope) now **fully applies**
to VOP: no random-id, no `data-vop`, no `initAll()`, no module-level
`astro:page-load` listener, no `dataset.ready` guard. The playground becomes
the reference new-style widget instead of the one admitted violator.

## Considered Options (this ADR's specific scope)

The grilling session's Q1–Q15 produced the full decision set; this ADR
records only the spans that amend or reverse ADR-0001/0002.

- **Q6/Q7 — input wiring fully van-built (overrules ADR-0001's SSR'd shell).**
  The whole stage is built in `connectedCallback` via `van.tags(NS)`, and the
  `.astro` frontmatter's SSR'd `<svg>` block (grid `range.map`, axes,
  `&lt;defs&gt;`, `viewBox`/`width`/`height`) is deleted. Inline `on*` is
  cosmetic-only for the never-re-rendered `<svg>`; we use `addEventListener`
  for the four-event drag machine for clarity. — **Adopted.** The SSR/client
  geometry seam is the actual pain (see Q14); retiring it is worth the
  negligible First-Paint cost on a static site whose widget mounts
  synchronously in `connectedCallback`.
- **Q2 — reactivity boundary.** The component builds its own reactive SVG
  subtree with `van.tags(NS)`. `svg-stage.ts` is **not touched and not
  imported** by the playground — it stays eager/pure for the static-diagram
  consumer (`VectorGrid.astro`) that ADR-0001 anticipated. — **Adopted.**
  No `clear()`/`makeStage`/`mk` / imperative redraw in the playground; the
  result/handles/readout bind declaratively to state.
- **Q4 — flavor (i) per-op composition + reactive coordinates.** `op`/`k`
  drive structural recomposition (cheap, rare — the dispatcher is an op-keyed
  van function-child that swaps the whole `Result*` subtree); `A`/`B`
  endpoints bind reactively so drag slides them in place without tearing down
  the subtree. — **Adopted.** This is the *native* vanjs reactivity (verified
  against `vanjs-core` v1.6.0: in `tag`, a function-typed attribute value
  becomes `derive(v)` then `bind(() => setter(v.val, …))` — point update, no
  rebuild; in `add`, a function-typed child runs via `bind(c)` and
  `update(b._dom, bind(b.f, b._dom))` → `dom.replaceWith(newDom)` on dep
  change — native subtree recomposition, no manual `clear()`).
- **Q5 — file split (b.1).** Extract the presentational leaves into a
  co-located client module `src/components/vector-ops/views.ts` exporting the
  five per-op `Result*` components + `Readout`. The `.astro` `<script>` keeps
  the custom-element class, the `op` dispatcher, the drag machine, the
  grid/axes/defs builders, and the atom declarations. — **Adopted** (this
  supersedes the grilling session's earlier Q15 "single inline" answer, which
  the user changed).
- **Q8 — grid/axes/defs builders inline in `connectedCallback`.** `svg-stage.ts`
  stays untouched; no new `buildGrid`/`buildAxes`/`buildDefs` added to the lib
  (YAGNI; a third consumer would be the extraction trigger). — **Adopted.**
- **Q9 — module-level monotonic counter `vop-ah-${vopSeq++}`** for the
  arrowhead `<marker>` id, matching `VectorGrid`'s `vg-ah-${instanceSeq++}`
  precedent. Replaces the deleted random-string id. — **Adopted.**
- **Q11 — `Readout` rendering.** Outer function-child keyed on `op` builds
  the line set; each line is a function-child returning the full string as a
  Text node, reading `A`/`B`/`k`. Per-op line lists differ in count and
  content; no fixed slots, no `innerHTML` rebuild. — **Adopted.**
- **Q12 — lifecycle (a) pure `connectedCallback`.** No
  `disconnectedCallback`, no `astro:page-load`, no `initAll`, no
  `dataset.ready`. vanjs's `statesToGc` idle-GC handles disconnect; the
  element's inner listeners die with the element subtree. — **Adopted.**
- **Q13 — drag machine (a) verbatim carry-over** into `connectedCallback`.
  Per-instance `dragging` closure, `setPointerCapture`/`releasePointerCapture`,
  `pointercancel` reset, `e.target.getAttribute('data-handle')` dispatch.
  Handles are van-built with a static `data-handle` attr; labels
  `pointer-events:none`. — **Adopted.**
- **Q14 — geometry derivation (c).** Frontmatter emits raw `data-size` and
  `data-units` only; the client computes `px`/`cx`/`cy`/`pxPerUnit`. The one
  magic margin (`pxScale = (px/2 - 18)/units` today) becomes a named
  `STAGE_MARGIN_PX = 18` const with a comment, living in the client
  `<script>`. No pre-computed `data-px`/`data-scale`/`data-cx`/`data-cy` —
  removing the last SSR/client geometry seam. — **Adopted.**

The remaining decisions (Q1 scope, Q3 custom-element form, Q10 atom
granularity, Q15-as-superseded) are restatements of ADR-0001/0002 decisions
that this refactor merely applies, not amends; they are not re-listed here.

## Preserved from ADR-0001 / ADR-0002 (unchanged by this ADR)

- **vanjs-core runtime dependency choice** — still delivered as a bundled
  client `<script type="module">` inside the `.astro` shell; **not** an Astro
  renderer, **not** a `client:*` directive on the MDX call site.
  `<VectorOpsPlayground size={340} units={5} />` stays directive-free.
- **Controller + presentational leaves structure** — the custom element is
  the stateful controller owning the atoms and all input handlers; the views
  in `./vector-ops/views.ts` are pure functions of state.
- **Fresh-Vec assignment invariant** — `Vec` atoms are assigned fresh
  objects on every change (drag writes `A.val = vec(…)`, never
  `A.val.x = …`); vanjs dedups notifications by reference inequality.
- **`vec.ts`/`svg-stage.ts` substrate** — `svg-stage.ts` is untouched and
  continues to serve `VectorGrid.astro`, the static-diagram consumer
  ADR-0001 anticipated.
- **"Never split atoms" (`A.x`/`A.y`) and "no container `sScene` atom"**
  rejections still stand.
- **Shadow DOM is opt-in per widget** — VOP stays light-DOM, inheriting
  Tailwind theme classes; no shadow here.

## Consequences

- **Playground widgets build their whole stage in `connectedCallback`** via
  `van.tags(NS)`. The `.astro` shell contributes only the outer
  custom-element tag plus `data-*` props; no SSR'd SVG chrome, no SSR/client
  geometry seam.
- **ADR-0002's custom-element lifecycle now fully applies to VOP.** The
  random-id / `data-vop` / `initAll()` / `astro:page-load` / `dataset.ready`
  machinery is deleted. VOP is no longer the grandfathered violator; it is a
  reference new-style widget.
- **The ADR-0001 "document-level listener" invariant now holds trivially.**
  VOP attaches **zero** `document`/`window` hooks — the module-level
  `astro:page-load` listener is gone. Per-instance listeners attach only to
  elements inside the custom element's own subtree, so they die with it.
  (ADR-0001's separate latent cross-navigation listener leak was already
  handled by vanjs's `statesToGc` idle-GC; that posture is preserved — there
  is no `disconnectedCallback`.)
- **One client-side magic number**, `STAGE_MARGIN_PX = 18`, named with a
  comment in the playground's `<script>`. It replaces the inline
  `(px/2 - 18)` in the old frontmatter. No `src/lib/`-level geometry helper
  is added.
- **Markers are instance-unique via a module-level counter**
  (`vop-ah-${vopSeq++}`), matching `VectorGrid`'s precedent; embedding more
  than one playground per page (ADR-0002's forward rule requirement) works by
  construction.
- **Reactivity is native, not hand-rolled.** No `clear()` / imperative redraw
  in the playground: op change swaps the `Result*` subtree via a van
  function-child; A/B/k change point-updates attributes or replaces a single
  Text node. (`svg-stage.ts` keeps its imperative shape for `VectorGrid`.)
- **Watch-out preserved:** the op-tab styling and the scale-slider visibility
  derive purely from `op` (van function-typed `class` bindings on the
  van-built `<a role="tab">` and the `.scale-only` div); today's tabs were
  SSR'd `<a>` hand-toggled via `van.derive` + `classList.toggle`, now they are
  van-built with reactive `class()` binding. Default states, colors, op
  labels, and readout copy are preserved verbatim to minimize behavioral
  change; the `ResultDistance` distinct marker-less dashed line shape is
  preserved. The MDX call site is unchanged.
- **Precedent for future interactive playgrounds.** New playgrounds should
  mirror this shape: `.astro` shell = bare custom element + `data-*`; the
  `connectedCallback` builds the full stage with `van.tags(NS)`; per-op
  presentational leaves live in a co-located `./&lt;widget-name&gt;/views.ts`
  module. A future widget that genuinely benefits from SSR'd static chrome
  (e.g. a large diagram where First Paint is measurable) may reintroduce an
  SSR shell — that is now a *deliberate per-widget choice*, not the default;
  justify it in that widget's ADR. (Shadow DOM remains opt-in per ADR-0002.)