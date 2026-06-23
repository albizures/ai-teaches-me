import type { TagFunc, State as VanState } from 'vanjs-core'
import type { Vec } from '../../lib/vec'
import van from 'vanjs-core'
import { add, distance, fmt, length, normalize, scale, sub } from '../../lib/vec'

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
  /** Map a grid-unit Vec to screen-pixel coordinates. */
  pt: (v: Vec) => Vec
  /** Arrowhead `<marker>` id, unique per instance via the module counter. */
  markerId: string
  COL: ColMap
}

const NS = 'http://www.w3.org/2000/svg'

const { g, line, circle, text } = van.tags(NS) as unknown as {
  g: TagFunc<SVGGElement>
  line: TagFunc<SVGLineElement>
  circle: TagFunc<SVGCircleElement>
  text: TagFunc<SVGTextElement>
}

const ORIGIN = () => ({ x: 0, y: 0 })

type ArrowOpts = {
  width?: number
  dashed?: boolean
  /** Label text. May be a plain string or a reactive `() => string`. */
  label?: string | (() => string)
}

type LabelProps = {
  label?: (() => string) | undefined
  color: string
  x: (() => number) | number
  y: (() => number) | number
}

function Label(p: LabelProps) {
  if (p.label === undefined) {
    return undefined
  }

  return text({
    'x': typeof p.x === 'function' ? p.x : p.x,
    'y': typeof p.y === 'function' ? p.y : p.y,
    'font-size': 12,
    'font-family': 'monospace',
    'style': `fill: ${p.color}; pointer-events: none`,
  }, p.label)
}

type GetVec = () => Vec

function Arrow(ctx: ViewCtx, from: GetVec, to: GetVec, color: string, opts: ArrowOpts = {}): SVGGElement {
  const { pt, markerId } = ctx
  const a = () => pt(from())
  const b = () => pt(to())
  const labelFn = opts.label === undefined
    ? undefined
    : typeof opts.label === 'function'
      ? opts.label
      : () => opts.label as string
  return g({},
    line({
      'x1': () => a().x,
      'y1': () => a().y,
      'x2': () => b().x,
      'y2': () => b().y,
      'stroke': color,
      'stroke-width': opts.width ?? 2,
      'stroke-linecap': 'round',
      'style': `stroke: ${color};`,
      'stroke-dasharray': opts.dashed ? '5 4' : null,
      'marker-end': `url(#${markerId})`,
    }),
    Label({
      label: labelFn,
      color,
      x: () => (a().x + b().x) / 2,
      y: () => (a().y + b().y) / 2 - 6,
    }),
  )
}

export function ResultAdd(ctx: ViewCtx): SVGGElement {
  const { A, B, COL } = ctx
  const sum = () => add(A.val, B.val)
  return g({},
    Arrow(ctx, ORIGIN, () => A.val, COL.a, { label: 'A' }),
    Arrow(ctx, () => A.val, sum, COL.b, { label: 'B' }),
    Arrow(ctx, ORIGIN, sum, COL.result, { width: 2, dashed: true, label: 'A+B' }),
  )
}

export function ResultSubtract(ctx: ViewCtx): SVGGElement {
  const { A, B, COL } = ctx
  return g({},
    Arrow(ctx, ORIGIN, () => A.val, COL.a, { label: 'A' }),
    Arrow(ctx, ORIGIN, () => B.val, COL.b, { label: 'B' }),
    Arrow(ctx,
      () => A.val,
      () => B.val,
      COL.result, { width: 2, dashed: true, label: 'B\u2212A' },
    ),
  )
}

export function ResultScale(ctx: ViewCtx): SVGGElement {
  const { A, k, COL } = ctx
  const scaled = () => scale(A.val, k.val)
  return g({},
    Arrow(ctx, ORIGIN, () => A.val, COL.a, { dashed: true, label: 'A' }),
    Arrow(ctx, ORIGIN, scaled, COL.result, {
      width: 2,
      label: () => `A\u00D7${fmt(k.val)}`,
    }),
  )
}

export function ResultNormalize(ctx: ViewCtx): SVGGElement {
  const { A, COL, pt } = ctx
  const n = () => normalize(A.val)
  const l = () => length(A.val)
  // Unit circle: radius = 1 grid unit. `pt` maps grid units to pixels, so
  // `pt(vec(1,0)).x - pt(vec(0,0)).x` is px-per-unit (signed +x).
  const o = () => pt({ x: 0, y: 0 })
  const rPx = () => pt({ x: 1, y: 0 }).x - o().x
  return g({},
    Arrow(ctx, ORIGIN, () => A.val, COL.a, {
      dashed: true,
      label: () => `A |A|=${fmt(l())}`,
    }),
    Arrow(ctx, ORIGIN, n, COL.result, { width: 2, label: '\u00C2 (unit)' }),
    circle({
      cx: () => o().x,
      cy: () => o().y,
      r: () => rPx(),
      class: 'fill-none stroke-1 opacity-50',
      style: `stroke: ${COL.result}; stroke-dasharray: 3 3`,
    }),
  )
}

export function ResultDistance(ctx: ViewCtx): SVGGElement {
  const { A, B, COL, pt, markerId } = ctx
  return g({},
    Arrow(ctx, ORIGIN, () => A.val, COL.a, { label: 'A' }),
    Arrow(ctx, ORIGIN, () => B.val, COL.b, { label: 'B' }),
    line({
      'x1': () => pt(A.val).x,
      'y1': () => pt(A.val).y,
      'x2': () => pt(B.val).x,
      'y2': () => pt(B.val).y,
      'stroke-dasharray': '5 4',
      'stroke-width': 4,
      'style': `stroke: ${COL.result};`,
      'marker-end': `url(#${markerId})`,
    }),
  )
}

function linesFor(op: Op, ctx: ViewCtx): (() => string)[] {
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

export function Readout(ctx: ViewCtx): HTMLElement {
  const { div } = van.tags
  return div({
    class: 'font-mono text-sm bg-base-100 rounded-box p-3 border border-base-content/10 space-y-1',
  }, () => {
    // Reading `op.val` here registers the dep that swaps the line set on
    // op change. A/B/k are *not* read at this level — each line reads them
    // itself, so dragging/slding point-updates a single Text node.
    const op = ctx.op.val
    const lines = linesFor(op, ctx)
    return div({}, ...lines.map(l => div({}, l)))
  })
}
