import { text } from './elements'

type VectorLabelProps = {
  label?: (() => string) | string | undefined
  color: string
  x: (() => number) | number
  y: (() => number) | number
}

export function VectorLabel(props: VectorLabelProps) {
  const { label, color, x, y } = props
  if (label === undefined) {
    return undefined
  }

  return text({
    'x': typeof x === 'function' ? x : x,
    'y': typeof y === 'function' ? y : y,
    'font-size': 12,
    'font-family': 'monospace',
    'style': `fill: ${color}; pointer-events: none`,
  }, label)
}
