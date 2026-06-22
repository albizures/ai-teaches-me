// SVG drawing primitives for a 2D "stage" (a square `<svg>` with the origin at
// its center, +x right, +y DOWN — see CONTEXT.md: "coordinate convention —
// y-down").
//
// Pure DOM helpers, no van. The interactive playgrounds mount these calls
// inside `van.derive` so the redraw is reactive; a future static diagram can
// call them imperatively at SSR/build time instead. Either way, this file
// is the single home for the grid-units → screen-pixels mapping and for the
// "arrow / dot / circle" atoms shared across playgrounds and diagrams.
//
// Under ADR-0001: stage chrome that *never changes* (grid lines, axes) lives
// in the `.astro` template, not here; only the atoms that get repeated into
// dynamic layers belong in this lib.

import type { Vec } from "./vec";

const NS = "http://www.w3.org/2000/svg";

type Pt = { x: number; y: number };

/** Create an SVG element with attributes set. */
export function mk<K extends keyof SVGElementTagNameMap>(
  name: K,
  attrs: Record<string, string> = {},
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

const styleApply = (el: SVGElement, s: Record<string, string>) => {
  for (const [k, v] of Object.entries(s)) (el.style as unknown as Record<string, string>)[k] = v;
};

/** Remove every child of `layer`. */
export function clear(layer: Node & ParentNode): void {
  while (layer.firstChild) layer.removeChild(layer.firstChild);
}

export interface ArrowOpts {
  width?: number;
  dashed?: boolean;
  label?: string;
}

export interface Stage {
  /** Map a grid-unit Vec to screen-pixel coordinates. */
  pt(v: Vec): Pt;
  arrow(
    layer: SVGGElement,
    from: Vec,
    to: Vec,
    color: string,
    opts?: ArrowOpts,
  ): void;
  dot(
    layer: SVGGElement,
    p: Vec,
    color: string,
    handle: string,
    label: string,
  ): void;
  /** Draw a plain (unfilled, dashed, low-opacity) circle centered at the
   * origin, with radius given in *grid units* (multiplied by the stage's
   * px-per-unit to draw). */
  circlePlain(layer: SVGGElement, radiusUnits: number, color: string): void;
}

/**
 * Build a stage bound to a particular `<svg>` geometry. `markerId` is the
 * `<defs>` marker id used for arrowheads (passed in so a page with multiple
 * playgrounds doesn't collide).
 */
export function makeStage(
  cx: number,
  cy: number,
  pxPerUnit: number,
  markerId: string,
): Stage {
  const pt = (v: Vec): Pt => ({ x: cx + v.x * pxPerUnit, y: cy + v.y * pxPerUnit });
  return {
    pt,
    arrow(layer, from, to, color, opts = {}) {
      const a = pt(from), b = pt(to);
      const line = mk("line", {
        x1: String(a.x), y1: String(a.y),
        x2: String(b.x), y2: String(b.y),
        stroke: color,
        "stroke-width": String(opts.width ?? 3),
        "stroke-linecap": "round",
        "marker-end": `url(#${markerId})`,
      });
      // Style stroke too, so the context-stroke arrowhead fill tracks the arrow color.
      styleApply(line, { stroke: color });
      if (opts.dashed) line.setAttribute("stroke-dasharray", "5 4");
      layer.appendChild(line);
      if (opts.label) {
        const t = mk("text", {
          x: String(b.x + 6), y: String(b.y - 4),
          "font-size": "12", "font-family": "monospace",
        });
        t.textContent = opts.label;
        styleApply(t, { fill: color });
        layer.appendChild(t);
      }
    },
    dot(layer, p, color, handle, label) {
      const sp = pt(p);
      const c = mk("circle", {
        cx: String(sp.x), cy: String(sp.y), r: "9",
        "data-handle": handle, tabindex: "0",
      });
      styleApply(c, {
        fill: color,
        stroke: "var(--color-base-100, #fff)",
        strokeWidth: "2px",
        cursor: "grab",
      });
      layer.appendChild(c);
      const t = mk("text", {
        x: String(sp.x + 11), y: String(sp.y + 4),
        "font-size": "12", "font-family": "monospace",
      });
      t.textContent = label;
      styleApply(t, { fill: color, pointerEvents: "none" });
      layer.appendChild(t);
    },
    circlePlain(layer, radiusUnits, color) {
      const radiusPx = radiusUnits * pxPerUnit;
      const c = mk("circle", {
        cx: String(cx), cy: String(cy), r: String(radiusPx),
      });
      styleApply(c, {
        fill: "none",
        stroke: color,
        strokeWidth: "1px",
        strokeDasharray: "3 3",
        opacity: "0.5",
      });
      layer.appendChild(c);
    },
  };
}