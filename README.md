# ai-teach

**A self-directed learning workspace, taught by an AI agent, rendered as a beautiful static site.**

`ai-teach` turns your AI agent into a patient, stateful tutor. You tell it what you want to _be able to do_ — "read and write raylib `Vector2` math for my 2D shooter", "hold a handstand", "understand pharmacokinetics" — and it builds you an entire course from scratch: a mission, a curated reading list, interactive lessons, reference cheat-sheets, and a log of what you've actually mastered. Everything is plain Markdown/MDX in this repo and renders to a clean, browsable Astro site you can read offline and revisit for years.

It is _not_ a chat tutor that forgets you tomorrow. The teaching is grounded in files: a mission that stays in view, high-trust resources that back every claim, lesson artifacts designed like Tufte pages, and learning records that act like ADRs for your own understanding.

---

## Why this exists

Most "learn X with AI" interactions die in one session: the agent answers a question, you forget the answer, and nothing compounds. This project flips that. Every teaching decision the agent makes — what to teach next, which sources to trust, how hard to push — is grounded in a small set of files that persist across sessions and that you can edit.

The agent has three jobs, mirroring a real educator:

- **Knowledge** — gathered from high-quality, high-trust sources (books, primary docs, expert communities), recorded in each topic's `RESOURCES.md`. The agent is explicitly told _never to trust its parametric memory_ when a resource can be cited.
- **Skills** — acquired through short, interactive lessons with tight feedback loops (in-browser quizzes, guided real-world tasks). Difficulty is the tool here; effortful retrieval is what builds long-term retention.
- **Wisdom** — the agent can only take you so far. When a question needs real-world feedback, it delegates you to a high-reputation community (a forum, a class, a local group) listed in `RESOURCES.md`.

Every lesson is tied back to a **mission** — the concrete, real-world outcome you are chasing. If your mission is vague, the agent interviews you before writing anything, because a bad mission steers every future session wrong.

### Learning philosophy baked in

- **Fluency vs. storage strength.** Fluency (in-the-moment recall) gives an illusory sense of mastery; storage strength (long-term retention) is the real goal. Lessons use desirable difficulty: retrieval practice, spacing, and interleaving.
- **Zone of proximal development.** Each lesson is sized to challenge you "just enough." The agent reads your prior `learning-records/` to find your edge rather than re-teaching what you know.
- **Working memory is tiny.** Lessons are short and completable quickly, each delivering one tangible win that builds on the last.

---

## Project layout

```text
ai-teach/
├── .agents/skills/
│   ├── teach/                     # The teaching skill (this repo's "brain")
│   │   └── SKILL.md               # The agent's full operating manual
│   └── grill-my-topic/            # Stress-test a topic before building it
│       └── SKILL.md
├── src/
│   ├── components/                # Shared, reusable lesson widgets (Quiz, Insight, …)
│   ├── layouts/                   # Page shell (Tailwind + DaisyUI)
│   ├── pages/
│   │   ├── index.astro            # Topic directory
│   │   └── topics/
│   │       ├── [topic].astro      # Topic overview page
│   │       └── [topic]/[lesson].astro
│   ├── topics/                    # All topics, one folder each
│   │   ├── .active                # Marker: which topic is currently being taught
│   │   └── <slug>/                # Example topic
│   │       ├── index.mdx          # Topic landing page + lesson list
│   │       ├── MISSION.md         # Why you're learning this
│   │       ├── RESOURCES.md       # Curated, annotated sources
│   │       ├── NOTES.md           # Topic-specific scratchpad
│   │       ├── reference/         # Cheat-sheets, glossaries (the things you re-read)
│   │       ├── lessons/           # One self-contained MDX lesson per file
│   │       └── learning-records/  # ADR-style log of what you've actually mastered
│   ├── content.config.ts          # Astro content collections (one per topic)
│   └── styles/global.css
├── astro.config.mjs               # Astro + Tailwind + MDX
├── package.json
└── README.md                      # ← you are here
```

Each topic is a self-contained **sub-workspace** under `src/topics/<slug>/`. The agent numbers lessons and learning records **per topic** (`0001-…`, `0002-…`), and each topic gets its own Astro content collection so it renders independently on the site.

---

## Getting started

### Prerequisites

- Node `>=22.12.0`
- [pnpm](https://pnpm.io/) (the lockfile is committed)
- The [pi coding agent](https://github.com/earendil-works/pi-coding-agent) — the skills in `.agents/skills/` are written for it.

### Install & run

```sh
pnpm install
pnpm dev      # http://localhost:4321 — your personal course site, live
pnpm build    # static site → ./dist/
pnpm preview  # preview a production build locally
```

The default project ships with one example topic, **2D Game Math** (vector math for an Odin + raylib top-down shooter), so you can see how a finished topic is structured.

---

## Brainstorming & creating a new topic

The repo ships with two skills that work together. The honest order is: **grill first, then teach.** A topic built on a vague mission produces ten lessons that don't compound.

### 1. Stress-test the idea first — `/grill-my-topic`

Before committing to a topic, run the `grill-my-topic` skill. It interviews you relentlessly about every aspect of the topic — _why_ you want it, what "done" looks like, what's in and out of scope — walking down each branch of the design tree one question at a time. For each question it offers its _recommended_ answer, then waits for your verdict.

Use it to:

- **Narrow a too-broad idea.** "Learn physics" is hopeless; the griller pushes you toward something like "Math for a 2D top-down shooter in Odin + raylib" — a topic that fits in roughly ten lessons.
- **Surface constraints and out-of-scope items** before any lesson is written, so the agent doesn't drift into adjacent territory mid-course.
- **Reach a shared vocabulary** with the agent about what success looks like, which becomes `MISSION.md`.

It deliberately asks one question at a time — multiple at once is bewildering. When a topic is too broad, it will say so and suggest a tighter framing. The goal is a topic scoped to about **10 lessons**.

### 2. Build the topic — `/teach`

Once you and the griller agree, hand off to the `teach` skill to actually create the topic. (The griller invokes this itself at the end — never run both at once.) The teach skill will:

### Adding more lessons later

You don't have to build the whole course up front. In a later session just say _"teach me the next lesson for/<topic>"_ — or name a specific thing — and the agent reads `MISSION.md`, the existing learning records, and `RESOURCES.md` to pick the right next lesson and increments the per-topic numbering. `.active` keeps your place across topics so you don't have to reintroduce yourself every session.

### Switching topics

Many topics can coexist under `src/topics/`. Name a topic in your request to switch to it (the agent updates `.active`), or, if you don't name one, ask and the agent will list the existing topics and ask which to continue or whether to start fresh.

### Evolving a mission

Missions change as you learn more. When your goal shifts, the agent confirms with you, updates `MISSION.md`, and writes a learning record capturing the change — so the history of _why_ you're learning is preserved alongside what you've learned.

---

## Notes & shared preferences

- `NOTES.md` at the workspace root captures _cross-topic_ preferences (teaching style, learning cadence, accessibility needs).
- `src/topics/<slug>/NOTES.md` captures _topic-specific_ working notes.
- Both are scratchpads the agent reads when designing lessons.

---

## Inspiration

This project owes a huge debt to [Matt Pocock's `skills` repo](https://github.com/mattpocock/skills) (_"Skills for Real Engineers"_). Our `grill-my-topic` is his [`grill-me`](https://github.com/mattpocock/skills/tree/main/skills/productivity/grill-me) / [`grill-with-docs`](https://github.com/mattpocock/skills/tree/main/skills/engineering/grill-with-docs) retuned for course design; our `teach` is his [`teach`](https://github.com/mattpocock/skills/tree/main/skills/productivity/teach), grounded harder in files. Go read them.

---

## Tech stack

- [Astro](https://astro.build) — content collections, MDX, static site generation
- [Tailwind CSS v4](https://tailwindcss.com) + [DaisyUI](https://daisyui.com) — styling and the theme system
- [pi coding agent](https://github.com/earendil-works/pi-coding-agent) — the agent that runs the `teach` and `grill-my-topic` skills

## Want to learn more?

- Read the [teach skill](.agents/skills/teach/SKILL.md) — the full operating manual.
- Browse the example topic at [`src/topics/2d-game-math/`](src/topics/2d-game-math/).
- Astro docs: <https://docs.astro.build>
