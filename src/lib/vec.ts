// 2D vector math for the `ai-teach` workspace.
//
// Domain primitives only — no DOM, no van. Imported by interactive playgrounds
// (van-driven) and, in future, by static diagrams that share the same
// coordinate convention (see CONTEXT.md: "coordinate convention — y-down").
//
// Under ADR-0001, `Vec` is a plain (untyped-mutably) `{x, y}` pair: the
// invariant that reactive atoms hold *whole, fresh* vectors is enforced by
// convention in the consuming components, not by `readonly` here. Always
// assign a new `Vec` rather than mutate one in place.

export type Vec = { x: number, y: number }

export const vec = (x: number, y: number): Vec => ({ x, y })

// Vector ops. Note these mirror the playground's operation names so the
// visual arrows and the numeric read-out share one source of truth.
export const add = (a: Vec, b: Vec): Vec => ({ x: a.x + b.x, y: a.y + b.y })
export const sub = (a: Vec, b: Vec): Vec => ({ x: a.x - b.x, y: a.y - b.y })
export const scale = (a: Vec, k: number): Vec => ({ x: a.x * k, y: a.y * k })
export const length = (v: Vec): number => Math.hypot(v.x, v.y)
export function normalize(a: Vec): Vec {
  const l = length(a)
  return l > 0 ? { x: a.x / l, y: a.y / l } : { x: 0, y: 0 }
}
export const distance = (a: Vec, b: Vec): number => length(sub(b, a))

// Grid ↔ pixel conversion utilities (no DOM).
export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v))
}

export function fmt(n: number): string {
  return (Math.round(n * 100) / 100).toString()
}
