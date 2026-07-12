// 吞掉已知的致命但無實際影響的錯誤，讓 template patch pipeline 繼續
//  - Teleport target null + toString（target 元素尚未 mount）
//  - vue-leaflet emitsOptions null（unmount 時序競態）
export default defineNuxtPlugin((nuxtApp) => {
  const originalHandler = nuxtApp.vueApp.config.errorHandler
  nuxtApp.vueApp.config.errorHandler = (err, instance, info) => {
    const msg = err instanceof Error ? err.message : String(err)
    if (
      msg.includes("'emitsOptions'") ||
      msg.includes("reading 'toString'") ||
      msg.includes('Invalid Teleport target')
    ) {
      // eslint-disable-next-line no-console
      console.debug('[vue-safe] suppressed non-critical error:', msg)
      return
    }
    if (typeof originalHandler === 'function') {
      originalHandler(err, instance, info)
    } else {
      // eslint-disable-next-line no-console
      console.error(err)
    }
  }
})
