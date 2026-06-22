# 2D Game Math — Resources

## Knowledge

- [Video series: _Math for Game Devs_ — Freya Holmer (YouTube)](https://www.youtube.com/playlist?list=PLImQqTpkuLuaI3lvMR6eg3xQm5MBl5zQb)
  Excellent, visual grounding for vectors, dot/cross product, and their game-dev uses. Use for: lessons 1, 2, 7 (vectors, operations, dot product). Her "why" intuition is the best free resource available.
- [Site: Red Blob Games — Amit Patel](https://www.redblobgames.com/)
  Especially the _Grids_ pages and vector/position math. Use for: coordinate spaces, grid math, and later steering/pathfinding context. Highest-trust game-math writing on the web.
- [Book: _Essential Mathematics for Games and Interactive Applications_ — Van Verth & Bishop](https://www.routledge.com/Essential-Mathematics-for-Games-and-Interactive-Applications-3rd-Edition/Van-Verth-Bishop/p/book/9781466565349)
  Authoritative reference frame-rate integration, transforms, vectors. Use for: deeper reference on lessons 2, 3, 5 when a textbook treatment is needed.
- [Book: _3D Math Primer for Graphics and Game Development_ — Dunn & Parberry](https://www.routledge.com/3D-Math-Primer-for-Graphics-and-Game-Development-Second-Edition/Dunn-Parberry/p/book/9781568817186)
  Vectors and angles chapters are 2D-applicable despite the title. Use for: alternative explanations of vector ops and trig.
- [Docs: raylib API — `Vector2`, `raymath.h`, `rlgl.h`](https://www.raylib.com/)
  The `Vector2` struct and helper functions (`Vector2Add`, `Vector2Normalize`, `Vector2Distance`, `Lerp`, etc.). Use for: mapping every concept to actual Odin/raylib calls in lessons.
- [Repo: raylib-odin bindings](https://github.com/raylib-o/raylib-odin)
  The Odin binding the user is on. Use for: confirming exact symbol names (`rl.Vector2`, `rl.Vector2Add`, etc.) before writing example code.
- [Article set: BetterExplained — "Intuitive Trigonometry"](https://betterexplained.com/articles/intuitive-trigonometry/)
  Builds intuition for sin/cos withoutrote memorization. Use for: lesson 3 trig refresher for a rusty learner.
- [Khan Academy: Trigonometry basics](https://www.khanacademy.org/math/trigonometry)
  Interactive practice for a learner whose trig is rusty. Use for: optional drill behind lesson 3 if they want to rebuild fluency.

## Wisdom (Communities)

- [r/raylib](https://www.reddit.com/r/raylib/)
  Active community around raylib specifically. Use for: raylib-odin API questions, example hunting, debugging raylib behavior.
- [raylib Discord](https://discord.gg/raylib)
  Real-time help; raylib maintainers present. Use for: quick API confirmations and raylib-odin binding specifics.
- [Odin Discord / #game_dev channel](https://discord.gg/oz9B3Rq2)
  Odin-language community. Use for: Odin-side idioms (arrays, `#soa`, math in Odin) and binding usage questions.
- [r/gamedev](https://www.reddit.com/r/gamedev/)
  Broad game-dev community. Use for: general 2D math and movement-feel critique.

## Gaps
- No single canonical "2D top-down shooter math in raylib-odin" tutorial exists; we build lessons from the above sources plus raylib examples rather than following one text.