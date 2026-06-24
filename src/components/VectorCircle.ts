import type { State } from 'vanjs-core'
import type { Vec } from '../lib/vec'
import van from 'vanjs-core'
import { style } from '../lib/vanjs'
import { circle } from './elements'

type VectorCircleProps = {
  radius: number
  color: string
  origin: State<Vec>
  handle?: string | undefined
  tabindex?: number | undefined
  mapVec: (vec: Vec) => Vec
}

export function Circle(props: VectorCircleProps) {
  const { color, origin, radius, handle, tabindex, mapVec } = props
  const o = van.derive(() => mapVec(origin.val))
  return circle({
    'cx': () => o.val.x,
    'cy': () => o.val.y,
    'data-handle': handle || null,
    'tabIndex': tabindex || null,
    'r': radius,
    'style': style([
      ['fill', color],
      ['stroke', 'var(--color-base-100, #fff)'],
      ['stroke-width', '2px'],
    ]),
  })
}

// type CircleGroupProps = {
//   label?: State<string> | string | undefined
//   color: string
//   origin: State<Vec>
// }

// export function CircleGroup(props: CircleGroupProps) {
//   const { label, origin, color } = props

//   const labelPos = van.derive(() => {
//     return {
//       x: origin.val.x + 11,
//       y: origin.val.y + 4,
//     }
//   })

//   return g({
//     //

//   },
//   VectorLabel({
//     label,
//     pos: labelPos,
//     color,
//   }),
//   )
// }
