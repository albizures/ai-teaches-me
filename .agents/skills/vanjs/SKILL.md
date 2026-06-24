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
  function onIncrease() { ++counter.val }
  function onDescrease() { --counter.val }
  return span(
    "❤️ ", counter, " ",
    button({onclick: onIncrease}, "👍"),
    button({onclick: onDescrease}, "👎"),
  )
}

van.add(document.body, Counter())

```

## API reference: van.tags

van.tags is a top-level dynamic object in VanJS implemented with Proxy. van.tags.<name> gets you a function that creates an HTML element with tag name <name>. A common way of using van.tags is like the line below:

```ts
const {a, div, p} = van.tags
const {circle, path, svg} = van.tags("http://www.w3.org/2000/svg")\
const {math, mi, mn, mo, mrow, msup} = van.tags("http://www.w3.org/1998/Math/MathML")
```

With the line, a, div, p are functions that create <a>, <div>, <p> HTML elements respectively.


## DOM Composition and Manipulation
Even without state and state binding, you can build interactive web pages thanks to VanJS's flexible API for DOM composition and manipulation: tag functions and van.add. Check out the example below:

```ts
function StaticDom () {
  function onAddElements() {
    van.add(dom,
      div(button("New Button")),
      div(a({href: "https://www.example.com/"}, "This is a link")),
    )
  }

  function onHello() {
    alert("Hello from 🍦VanJS")
  }


  const dom = div(
    div(
      button("Dummy Button"),
      button({ onclick: onAddElements }, "Button to Add More Elements"),
      button({ onclick: onHello }, "Hello"),
    ),
  )
  return dom
}

```


## DOM Attributes vs. Properties

In "tag functions", while assigning values from props parameter to the created HTML element, there are 2 ways of doing it: via HTML attributes (`dom.setAttribute(<key>, <value>)`), or via the properties of the created HTML element (`dom[<key>] = <value>`). VanJS follows a consistent rule that makes sense for most use cases regarding which option to choose: when a settable property exists in a given `<key>` for the specific element type, we will assign the value via property, otherwise we will assign the value via attribute.

For instance, `input({type: "text", value: "Hello 🍦VanJS"})` will create an input box with `Hello 🍦VanJS` as the `value` of the value property, while `div({"data-index": 1})` will create the tag: `<div data-index="1"></div>`.

Note that, for readonly properties of HTML elements, we will still assign props values via setAttribute. For instance, in the code snippet below, the list of the `<input>` element is set via setAttribute:

```ts
function Datalist() {
  return div(
    label({for: "ice-cream-choice"}, "Choose a flavor: "),
    input({
      list: "ice-cream-flavors",
      id: "ice-cream-choice",
      name: "ice-cream-choice",
    }),
    datalist(
      {id: "ice-cream-flavors"},
      option({value: "Chocolate"}),
      option({value: "Coconut"}),
      option({value: "Mint"}),
      option({value: "Strawberry"}),
      option({value: "Vanilla"}),
    )
  )
}
```

## State and State Binding

### State granularity

Whenever possible, it's encouraged to define states at a more granular level. That is, it's recommended to define states like this:

```ts
const appState = {
  a: van.state(1),
  b: van.state(2),
}
```

instead of this:
```ts
const appState = van.state({
  a: 1,
  b: 2,
})
```