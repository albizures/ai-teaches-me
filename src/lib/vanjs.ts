type StyleItem = [string, string | undefined | number]

export function style(items: Array<StyleItem>) {
  let result = ''

  for (const [name, value] of items) {
    if (value === undefined) {
      continue
    }

    result = `${result};${name}: ${value}`
  }

  return result
}
