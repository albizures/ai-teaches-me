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

const referenceSchema = z.object({
  title: z.string(),
  slug: z.string(),
  draft: z.boolean(),
  description: z.string().optional(),
})

// One entry per topic: the `index.mdx` that describes the topic and lists its
// lessons. Lives at `./src/topics/<slug>/index.mdx`.
const topics = defineCollection({
  loader: glob({ pattern: '*/*.mdx', base: './src/topics' }),
  schema: sharedSchema,
})

// -- 2d-game-math --
const lessons_2d_game_math = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/topics/2d-game-math/lessons' }),
  schema: sharedSchema,
})

const reference_2d_game_math = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/topics/2d-game-math/reference' }),
  schema: referenceSchema,
})

export const collections = {
  topics,
  '2d-game-math': lessons_2d_game_math,
  '2d-game-math-reference': reference_2d_game_math,
}
