import type { TagFunc } from 'vanjs-core'
import type { Vec } from './vec'
import van from 'vanjs-core'

const NS = 'http://www.w3.org/2000/svg'

// `van.tags(NS)` returns one tag function per element name, each creating an
// SVG element in the right namespace. Destructured once so every atom below
// reads as `line({...})`, `circle({...})`, etc. The namespaced overload of
// `van.tags` is typed only as `TagFunc<Element>` (no SVGElementTagNameMap
// narrowing), so we cast to per-tag result types for decent call-site types.
const { line, text, circle, g } = van.tags(NS) as unknown as {
  line: TagFunc<SVGLineElement>
  text: TagFunc<SVGTextElement>
  circle: TagFunc<SVGCircleElement>
  g: TagFunc<SVGGElement>
}

/**
 * Create an SVG element with attributes set. Pure-DOM escape hatch used by
 * playgrounds for the occasional ad-hoc element outside the stage API (kept
 * generic/typed, unlike the loosely-typed van namespace record).
 */
export function mk<K extends keyof SVGElementTagNameMap>(
  name: K,
  attrs: Record<string, string> = {},
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(NS, name)
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
  return el
}

/** Remove every child of `layer`. */
export function clear(layer: Node & ParentNode): void {
  while (layer.firstChild) layer.removeChild(layer.firstChild)
}

export type ArrowOpts = {
  width?: number
  dashed?: boolean | undefined
  label?: string | undefined
}

export type PointOpts = {
  /** Stroke/fill radius in pixels. Defaults to 5. */
  radius?: number | undefined
  /** Optional text label drawn next to the dot. */
  label?: string | undefined
}

export type Stage = {
  /** Map a grid-unit Vec to screen-pixel coordinates. */
  pt: (v: Vec) => Vec
  arrow: (
    layer: SVGGElement,
    from: Vec,
    to: Vec,
    color: string,
    opts?: ArrowOpts,
  ) => void
  /**
   * Draw a non-interactive filled dot at a point with an optional label.
   * Unlike `dot`, this is a static marker — no `data-handle`, no tabindex,
   * no grab cursor — meant for diagrams that *show* a position rather than
   * invite dragging.
   */
  point: (
    layer: SVGGElement,
    p: Vec,
    color: string,
    opts?: PointOpts,
  ) => void
  dot: (
    layer: SVGGElement,
    p: Vec,
    color: string,
    handle: string,
    label?: string,
  ) => void
  /**
   * Draw a plain (unfilled, dashed, low-opacity) circle centered at the
   * origin, with radius given in *grid units* (multiplied by the stage's
   * px-per-unit to draw).
   */
  circlePlain: (layer: SVGGElement, radiusUnits: number, color: string) => void
}

export function makeStage(
  cx: number,
  cy: number,
  pxPerUnit: number,
  markerId: string,
): Stage {
  const pt = (v: Vec): Vec => ({ x: cx + v.x * pxPerUnit, y: cy + v.y * pxPerUnit })
  return {
    pt,
    arrow(layer, from, to, color, opts = {}) {
      const a = pt(from)
      const b = pt(to)

      van.add(layer, g({}, line({
        'x1': a.x,
        'y1': a.y,
        'x2': b.x,
        'y2': b.y,
        'stroke': color,
        'stroke-width': opts.width ?? 3,
        'stroke-linecap': 'round',
        'style': `stroke: ${color};`,
        'stroke-dasharray': opts.dashed ? '5 4' : null,
        'marker-end': `url(#${markerId})`,
      }), Label({
        label: opts.label,
        color,
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2 - 6,
      })))
    },
    point(layer, p, color, opts = {}) {
      const sp = pt(p)
      const r = opts.radius ?? 5

      van.add(layer, g({}, circle({
        cx: sp.x,
        cy: sp.y,
        r,
        style: style([
          ['fill', color],
          ['stroke', 'var(--color-base-100, #fff)'],
          ['stroke-width', '2px'],
        ]),
      }), Label({
        label: opts.label,
        color,
        x: sp.x + r + 4,
        y: sp.y + 4,
      })))
    },
    dot(layer, p, color, handle, label) {
      const sp = pt(p)

      van.add(layer, g({}, circle({
        'cx': sp.x,
        'cy': sp.y,
        'r': 9,
        'data-handle': handle,
        'tabindex': 0,
        'style': style([
          ['fill', color],
          ['stroke', 'var(--color-base-100, #fff)'],
          ['stroke-width', '2px'],
          ['cursor', 'grab'],
        ]),
      }), Label({
        label,
        color,
        x: sp.x + 11,
        y: sp.y + 4,
      })))
    },
    circlePlain(layer, radiusUnits, color) {
      const radiusPx = radiusUnits * pxPerUnit

      van.add(layer, circle({
        cx,
        cy,
        r: radiusPx,
        class: 'fill-none stroke-1 opacity-50',
        style: style([
          ['stroke', color],
          [' stroke-dasharray', '3 3'],
        ]),
      }))
    },
  }
}

type LabelProps = {
  label?: string | undefined
  x: number
  y: number
  color: string
}

function Label(props: LabelProps) {
  const { label, x, y, color } = props

  if (!label) {
    return undefined
  }

  return text({ x, y, 'font-size': 12, 'font-family': 'monospace', 'style': style([
    ['fill', color],
    ['pointer-events', 'none'],
  ]) }, label)
}

type StyleItem = [string, string | undefined | number]

function style(items: Array<StyleItem>) {
  let result = ''

  for (const [name, value] of items) {
    if (value === undefined) {
      continue
    }

    result = `${result};${name}: ${value}`
  }

  return result
}
