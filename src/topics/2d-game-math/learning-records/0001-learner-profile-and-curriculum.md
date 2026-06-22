# Learner profile & curriculum agreed

Established via a grill-interview before topic creation. This sets the floor for what to teach and the order.

## Prior knowledge (as stated by the learner)
- Math comfort is **rusty basics**: arithmetic solid; trigonometry and algebra shaky since school. Treat fundmentals as not-known; re-introduce gently.
- Building a **2D top-down action/shooter** in **Odin + raylib**. All examples must map to `rl.Vector2` and raylib-odin APIs.

## Curriculum decisions
- Scope narrowed to **2D only** (3D split off into a future separate topic).
- Coordinate depth: medium 2D — vectors, trig, rotation, movement, interpolation, dot product, circle collision + resolution, light steering capstone. ~10 lessons.
- Collision depth: **medium** — detection + resolution (push-out, wall sliding); no rigid-body physics.
- Steering/AI: **light** — single capstone lesson on seek/flee + line-of-sight, not a steering library.

## Implications
- Lessons 1–2 must include gentle refreshers (coordinate spaces, vector ops) — do not assume fluency.
- Code in every lesson should be copy-pasteable raylib-odin. Verify `rl.*` symbol names against the raylib-odin binding before writing examples.
- Avoid 3D concepts (matrices beyond 2x2, quaternions, perspective) entirely; if a lesson tempts, split into a future 3D topic.

## Evidence
Stated directly by the learner during the topic-scoping interview (this session).