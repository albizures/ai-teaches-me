import type { State } from 'vanjs-core'
import type { Vec } from '../lib/vec'
import van from 'vanjs-core'
import { g, line } from './elements'
import { VectorLabel } from './VectorLabel'

type VectorArrowProps = {
  markerId: string
  from: State<Vec>
  to: State<Vec>
  mapVec: (vec: Vec) => Vec
  width?: number | undefined
  color: string
  dashed?: boolean | undefined
  label?: State<string> | string | undefined
}

export function VectorArrow(props: VectorArrowProps): SVGGElement {
  const { markerId, from, to, color, width = 2, dashed = false, label, mapVec } = props
  const a = van.derive(() => mapVec(from.val))
  const b = van.derive(() => mapVec(to.val))
  const labelPos = van.derive(() => {
    return {
      x: (from.val.x + to.val.x) / 2 + 0.1,
      y: (from.val.y + to.val.y) / 2 - 0.1,
    }
  })
  return g({},
    line({
      'x1': () => a.val.x,
      'y1': () => a.val.y,
      'x2': () => b.val.x,
      'y2': () => b.val.y,
      'stroke': color,
      'stroke-width': width,
      'stroke-linecap': 'round',
      'style': `stroke: ${color};`,
      'stroke-dasharray': dashed ? '5 4' : null,
      'marker-end': `url(#${markerId})`,
    }),
    VectorLabel({
      label,
      color,
      pos: labelPos,
      mapVec,
    }),
  )
}
