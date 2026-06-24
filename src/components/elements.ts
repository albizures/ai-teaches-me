import type { TagFunc } from 'vanjs-core'
import van from 'vanjs-core'

const NS = 'http://www.w3.org/2000/svg'

export const { div, a, label, input, p, span, button } = van.tags
export const { svg, defs, marker, path, g, line, text, circle } = van.tags(NS) as unknown as {
  svg: TagFunc<SVGSVGElement>
  defs: TagFunc<SVGDefsElement>
  marker: TagFunc<SVGMarkerElement>
  path: TagFunc<SVGPathElement>
  g: TagFunc<SVGGElement>
  line: TagFunc<SVGLineElement>
  text: TagFunc<SVGTextElement>
  circle: TagFunc<SVGCircleElement>
}
