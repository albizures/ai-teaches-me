# 2D Game Math — Topic Notes

## Learner profile
- Starting level: **rusty basics**. Arithmetic is solid; trig and algebra are shaky (untouched since school). Re-introduce fundamentals gently, don't assume fluency.
- Prefers learning in **Odin + raylib** specifically. Use raylib `Vector2` and the raylib-odin binding API in examples. Code should be copy-pasteable into their project.

## Topic parameters (from grill interview)
- Scope: **2D only** (top-down).
- Genre: **action/shooter** (twin-stick feel). Examples tilt toward bullets, aiming, enemy AI.
- Collision depth: **medium** — detection + resolution (push-out, wall sliding). No rigid-body physics.
- Steering/AI: **light** — one capstone lesson on seek/flee + line-of-sight.

## Agreed curriculum (10 lessons, teaching order)
1. Coordinate spaces & vectors
2. Vector operations (add, subtract, scale, length, normalize, distance)
3. Trig refresher & angles (sin/cos, atan2, radians vs degrees)
4. Rotation & facing
5. Velocity & movement integration (accel, friction, delta-time)
6. Interpolation & easing (lerp, smoothing, camera follow)
7. Dot product applications (facing, line-of-sight, projection)
8. Collision detection (circle-circle, circle-point)
9. Collision resolution (push-out, wall sliding)
10. Capstone: steering & aiming (seek/flee, line-of-sight, targeting)

## Teaching style notes
- **Visual examples by default** (learner preference). Pair every new concept with an SVG diagram or a small interactive widget — e.g. `VectorField.astro` for static diagrams, `VectorOpsPlayground.astro` for draggable interactivity. Don't ship a concept as prose-only if a picture can carry it.
- Keep each lesson to one tight win; stay in working memory.
- Show the concept → show the Odin/raylib code → give a small interactive check → prompt a follow-up question.
- Always cite a high-trust source per lesson.