import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { defineCollection } from 'astro:content'

const sharedSchema = z.object({
  title: z.string(),
  description: z.string(),
  draft: z.boolean(),
  publicatedAt: z.coerce.date(),
  slug: z.string(),
})

// One entry per topic: the `index.mdx` that describes the topic and lists its
// lessons. Lives at `./src/topics/<slug>/index.mdx`.
const topics = defineCollection({
  loader: glob({ pattern: '*/*.mdx', base: './src/topics' }),
  schema: sharedSchema,
})

// A topic owns its own lessons collection, named after the topic slug. Add one
// block per topic. Lesson files live at `./src/topics/<slug>/lessons/*.mdx`.
const lessons_2d_game_math = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/topics/2d-game-math/lessons' }),
  schema: sharedSchema,
})

export const collections = {
  topics,
  '2d-game-math': lessons_2d_game_math,
}
