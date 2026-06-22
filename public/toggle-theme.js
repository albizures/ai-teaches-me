const Themes = {
  Light: 'silk',
  Dark: 'dim',
}

// Get theme data from local storage
const currentTheme = localStorage.getItem('theme')

function getPreferTheme() {
  // return theme value in local storage if it is set
  if (currentTheme) {
    return currentTheme
  }

  // return user device's prefer color scheme
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? Themes.Dark
    : Themes.Light
}

let themeValue = getPreferTheme()

function setPreference() {
  localStorage.setItem('theme', themeValue)
  reflectPreference()
}

function reflectPreference() {
  document.firstElementChild.setAttribute('data-theme', themeValue)
  document.firstElementChild.setAttribute(
    'data-theme-mode',
    themeValue === Themes.Light ? 'light' : 'dark',
  )

  document.querySelector('#theme-btn')?.setAttribute('aria-label', themeValue)

  // Get a reference to the body element
  const body = document.body

  // Check if the body element exists before using getComputedStyle
  if (body) {
    // Get the computed styles for the body element
    const computedStyles = window.getComputedStyle(body)

    // Get the background color property
    const bgColor = computedStyles.backgroundColor

    // Set the background color in <meta theme-color ... />
    document
      .querySelector('meta[name=\'theme-color\']')
      ?.setAttribute('content', bgColor)
  }
}

// set early so no page flashes / CSS is made aware
reflectPreference()

window.onload = () => {
  function setThemeFeature() {
    // set on load so screen readers can get the latest value on the button
    reflectPreference()

    // now this script can find and listen for clicks on the control
    document.querySelector('#theme-btn')?.addEventListener('click', () => {
      themeValue = themeValue === Themes.Light ? Themes.Dark : Themes.Light
      setPreference()
    })
  }

  setThemeFeature()

  // Runs on view transitions navigation
  document.addEventListener('astro:after-swap', setThemeFeature)
}

// sync with system changes
window
  .matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', ({ matches: isDark }) => {
    themeValue = isDark ? Themes.Dark : Themes.Light
    setPreference()
  })
