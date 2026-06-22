---
name: vanjs
description: VanJS is an ultra-lightweight, zero-dependency, and unopinionated Reactive UI framework
---

VanJS (abbreviated Vanilla JavaScript) is an ultra-lightweight, zero-dependency, and unopinionated Reactive UI framework based on pure vanilla JavaScript and DOM. Programming with VanJS feels like building React apps in a scripting language, without JSX. Check-out the Hello World code below:

```ts
const {div, p, ul, li, a} = van.tags

// Reusable components can be just pure vanilla JavaScript functions.
// Here we capitalize the first letter to follow React conventions.
function Hello() {
  return div(
    p("👋Hello"),
    ul(
      li("🗺️World"),
      li(a({href: "https://vanjs.org/"}, "🍦VanJS")),
    ),
  )
}

van.add(document.body, Hello())
// Alternatively, you can write:
// document.body.appendChild(Hello())
```

VanJS helps you manage states and UI bindings as well, with a more natural API:

```ts
function Counter () {
  const counter = van.state(0)
  return span(
    "❤️ ", counter, " ",
    button({onclick: () => ++counter.val}, "👍"),
    button({onclick: () => --counter.val}, "👎"),
  )
}

van.add(document.body, Counter())

```

## DOM Composition and Manipulation
Even without state and state binding, you can build interactive web pages thanks to VanJS's flexible API for DOM composition and manipulation: tag functions and van.add. Check out the example below:

```ts
function StaticDom () {
  const dom = div(
    div(
      button("Dummy Button"),
      button(
        {onclick: () =>
          van.add(dom,
            div(button("New Button")),
            div(a({href: "https://www.example.com/"}, "This is a link")),
          )
        },
        "Button to Add More Elements"),
      button({onclick: () => alert("Hello from 🍦VanJS")}, "Hello"),
    ),
  )
  return dom
}

```