export default defineNuxtPlugin(() => {
  const colorMode = useColorMode()

  colorMode.preference = 'light'
  colorMode.value = 'light'

  document.documentElement.classList.remove('dark')
  document.documentElement.classList.add('light')
  localStorage.removeItem('nuxt-color-mode')
  localStorage.removeItem('disaster-color-mode-disabled')
})
