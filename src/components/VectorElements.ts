import type { State as VanState } from 'vanjs-core'
import type { Vec } from '../lib/vec'
import van from 'vanjs-core'
import { add, distance, fmt, length, normalize, scale, sub } from '../lib/vec'
import { circle, g, line } from './elements'
import { VectorArrow } from './VectorArrow'

export type Op = 'add' | 'subtract' | 'scale' | 'normalize' | 'distance'

export type ColMap = {
  a: string
  b: string
  result: string
  muted: string
}

/** Shared plumbing handed to every leaf by the controller (`connectedCallback`). */
export type ViewCtx = {
  A: VanState<Vec>
  B: VanState<Vec>
  op: VanState<Op>
  k: VanState<number>
  unit: number
  origin: VanState<Vec>
  mapVec: (vec: Vec) => Vec
  /** Arrowhead `<marker>` id, unique per instance via the module counter. */
  markerId: string
  COL: ColMap
}

const ORIGIN = van.derive(() => ({ x: 0, y: 0 }))

export function ResultAdd(ctx: ViewCtx): SVGGElement {
  const { A, B, COL } = ctx
  const sum = van.derive(() => add(A.val, B.val))

  return g({},
    VectorArrow({ ...ctx, from: ORIGIN, to: A, color: COL.a, label: 'A' }),
    VectorArrow({ ...ctx, from: A, to: sum, color: COL.b, label: 'B' }),
    VectorArrow({ ...ctx, from: ORIGIN, to: sum, color: COL.result, dashed: true, label: 'A+B' }),
  )
}

export function ResultSubtract(ctx: ViewCtx): SVGGElement {
  const { A, B, COL } = ctx
  return g({},
    VectorArrow({ ...ctx, from: ORIGIN, to: A, color: COL.a, label: 'A' }),
    VectorArrow({ ...ctx, from: ORIGIN, to: B, color: COL.b, label: 'B' }),
    VectorArrow({ ...ctx, from: A, to: B, color: COL.result, dashed: true, label: 'B\u2212A' },
    ),
  )
}

export function ResultScale(ctx: ViewCtx): SVGGElement {
  const { A, k, COL } = ctx
  const scaled = van.derive(() => scale(A.val, k.val))
  return g({},
    VectorArrow({ ...ctx, from: ORIGIN, to: A, color: COL.a, dashed: true, label: 'A' }),
    VectorArrow({ ...ctx, from: ORIGIN, to: scaled, color: COL.result, label: van.derive(() => `A\u00D7${fmt(k.val)}`),
    }),
  )
}

export function ResultNormalize(ctx: ViewCtx): SVGGElement {
  const { A, COL, origin, mapVec } = ctx
  const n = van.derive(() => normalize(A.val))
  const l = () => length(A.val)

  const o = van.derive(() => mapVec(origin.val))
  const r = van.derive(() => mapVec({ x: 1, y: 0 }).x - o.val.x)

  return g({},
    VectorArrow({ ...ctx, from: ORIGIN, to: A, color: COL.a, dashed: true, label: van.derive(() => `A |A|=${fmt(l())}`) }),
    VectorArrow({ ...ctx, from: ORIGIN, to: n, color: COL.result, label: '\u00C2 (unit)' }),
    circle({
      cx: () => o.val.x,
      cy: () => o.val.y,
      r,
      class: 'fill-none stroke-1 opacity-50',
      style: `stroke: ${COL.result}; stroke-dasharray: 3 3`,
    }),
  )
}

export function ResultDistance(ctx: ViewCtx): SVGGElement {
  const { A, B, COL, markerId } = ctx

  return g({},
    VectorArrow({ ...ctx, from: ORIGIN, to: A, color: COL.a, label: 'A' }),
    VectorArrow({ ...ctx, from: ORIGIN, to: B, color: COL.b, label: 'B' }),
    line({
      'x1': () => A.val.x,
      'y1': () => A.val.y,
      'x2': () => B.val.x,
      'y2': () => B.val.y,
      'stroke-dasharray': '5 4',
      'stroke-width': 2,
      'style': `stroke: ${COL.result};`,
      'marker-end': `url(#${markerId})`,
    }),
  )
}

export function linesFor(op: Op, ctx: ViewCtx): (() => string)[] {
  const { A, B, k } = ctx
  if (op === 'add') {
    const sum = () => add(A.val, B.val)
    return [
      () => `A   = (${fmt(A.val.x)}, ${fmt(A.val.y)})   |A|=${fmt(length(A.val))}`,
      () => `B   = (${fmt(B.val.x)}, ${fmt(B.val.y)})   |B|=${fmt(length(B.val))}`,
      () => `A+B = (${fmt(sum().x)}, ${fmt(sum().y)})   |A+B|=${fmt(length(sum()))}`,
    ]
  }
  if (op === 'subtract') {
    const diff = () => sub(B.val, A.val)
    return [
      () => `A   = (${fmt(A.val.x)}, ${fmt(A.val.y)})`,
      () => `B   = (${fmt(B.val.x)}, ${fmt(B.val.y)})`,
      () => `B\u2212A = (${fmt(diff().x)}, ${fmt(diff().y)})   |B\u2212A|=${fmt(length(diff()))}`,
      () => `B\u2212A points from A's tip to B's tip`,
    ]
  }
  if (op === 'scale') {
    const scaled = () => scale(A.val, k.val)
    return [
      () => `A      = (${fmt(A.val.x)}, ${fmt(A.val.y)})`,
      () => `k      = ${fmt(k.val)}`,
      () => `A\u00D7k    = (${fmt(scaled().x)}, ${fmt(scaled().y)})`,
      () => `|A\u00D7k|  = ${fmt(length(scaled()))} (= |A|\u00B7|k| = ${fmt(length(A.val) * Math.abs(k.val))})`,
    ]
  }
  if (op === 'normalize') {
    const l = () => length(A.val)
    const n = () => normalize(A.val)
    return [
      () => `A   = (${fmt(A.val.x)}, ${fmt(A.val.y)})   |A|=${fmt(l())}`,
      () => `\u00C2 = A / |A| = (${fmt(n().x)}, ${fmt(n().y)})`,
      () => `|\u00C2| = ${fmt(length(n()))}  (always 1)`,
      () => `Dashed circle = radius 1 (the unit circle)`,
    ]
  }
  // distance
  const d = () => distance(A.val, B.val)
  return [
    () => `A = (${fmt(A.val.x)}, ${fmt(A.val.y)})`,
    () => `B = (${fmt(B.val.x)}, ${fmt(B.val.y)})`,
    () => `distance = |B \u2212 A| = ${fmt(d())}`,
    () => `(= sqrt(dx\u00B2 + dy\u00B2), Pythagoras)`,
  ]
}

export function Readout(op: Op, ctx: ViewCtx): HTMLElement {
  const { div } = van.tags
  return div({
    class: 'font-mono text-sm space-y-1',
  }, () => {
    const lines = linesFor(op ?? ctx.op.val, ctx)
    return div({}, ...lines.map(l => div({}, l)))
  })
}
