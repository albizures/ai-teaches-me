import antfu from '@antfu/eslint-config'

export default antfu({
  astro: true,
  markdown: true,
  rules: {
    'ts/consistent-type-definitions': ['error', 'type'],
  },
})
