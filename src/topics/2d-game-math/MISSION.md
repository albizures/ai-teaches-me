# Mission: Math for 2D Game Development

## Why
The user is building a 2D top-down action/shooter game in **Odin + raylib**. Right now their math is rusty (comfortable with arithmetic, shaky on trig/algebra), and they keep hitting walls when writing movement, aiming, and collision code. They want the vector/trig/interpolation skills needed to ship this specific game — not abstract coursework.

## Success looks like
- Read raylib `Vector2` code and confidently write their own movement, steering, and aiming from scratch.
- Implement a top-down player that moves with acceleration, friction, and frame-rate-independent delta-time integration.
- Give enemies seek/flee steering and line-of-sight using dot products.
- Detect and resolve circle collisions, including push-out and wall sliding that feels good.
- Choose the right math (vector vs. trig vs. interpolation) for a new gameplay problem without freezing.

## Constraints
- Starting math level: rusty basics (arithmetic solid; trig/algebra shaky since school).
- Stack: **Odin** language, **raylib** bindings, 2D only. Examples and code must map to this stack.
- Genre: **top-down action/shooter** (twin-stick / Zelda-lite feel).
- ~10 lessons total; each lesson short, one tangible win.

## Out of scope
- 3D math (matrices/quaternions in 3D, perspective transforms).
- Full rigid-body physics engines (springs, joints, swept collision).
- A broad steering-behaviors library — only seek/flee + line-of-sight as a capstone.
- Pathfinding (A*, nav meshes) — separate topic if needed later.
- Shader math.