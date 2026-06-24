import type { State } from 'vanjs-core'
import type { Vec } from '../lib/vec'
import van from 'vanjs-core'
import { text } from './elements'

type VectorLabelProps = {
  label?: State<string> | string | undefined
  color: string
  pos: State<Vec>
  mapVec: (vec: Vec) => Vec
}

export function VectorLabel(props: VectorLabelProps) {
  const { label, color, pos, mapVec } = props
  if (label === undefined) {
    return undefined
  }

  const p = van.derive(() => mapVec(pos.val))

  return text({
    'x': () => p.val.x,
    'y': () => p.val.y,
    'font-size': 12,
    'font-family': 'monospace',
    'style': `fill: ${color}; pointer-events: none`,
  }, label)
}
