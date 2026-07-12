// https://nuxt.com/docs/api/configuration/nuxt-config
//
// 本檔為主專案 frontend/nuxt.config.ts 的精簡版（CRUD 標準範本獨立包）：
//   - devServer.port 改 3100（避免與主專案 3000 埠衝突）
//   - css 只保留 design-token.css → comp-tokens.css（移除 map-icons.css）
//   - 移除 build.transpile（echarts / vue-leaflet）與 nitro publicDir（Cloudflare 部署）等無關設定
//   - 保留 tailwindcss theme.extend 完整片段、head 字型設定、ssr:false、colorMode light
// 後端接軌：devProxy 目標於「設定期」讀環境變數（runtimeConfig 是執行期，devProxy 用不到），
// 預設打本機 .NET 後端 5080；可用 NUXT_PUBLIC_API_BASE 覆蓋來源（例如換 port / 換主機）。
const apiOrigin = process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:5080'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },

  devServer: {
    port: 3100,
  },

  // 雙模式資料層開關（composables/useTemplateMembers.ts 讀取）：
  //   - useApi 預設 false＝記憶體 mock（前端課離線可跑）；NUXT_PUBLIC_USE_API=true 走真後端（後端課用）
  //   - apiBase 僅供顯示 / 除錯；實際轉發位址由下方 nitro.devProxy 決定
  runtimeConfig: {
    public: {
      useApi: false,
      apiBase: apiOrigin,
    },
  },

  // 後端接軌：dev 期把 /api/template、/api/equipment 轉發到 .NET 後端，避開瀏覽器 CORS（不改後端 CORS 設定）。
  // mock 模式下沒有任何請求走這條，代理閒置無害。
  nitro: {
    devProxy: {
      '/api/template': {
        target: `${apiOrigin}/api/template`,
        changeOrigin: true,
      },
      '/api/equipment': {
        target: `${apiOrigin}/api/equipment`,
        changeOrigin: true,
      },
    },
  },

  experimental: {
    appManifest: false,
  },

  // 靜態輸出（SPA）：與主專案一致
  ssr: false,

  modules: [
    '@nuxt/ui'
  ],

  colorMode: {
    classSuffix: '',
    preference: 'light',
    fallback: 'light',
    storageKey: 'disaster-color-mode-disabled',
  },

  tailwindcss: {
    config: {
      theme: {
        extend: {
          spacing: {
            'none': 'var(--ui-sys-spacing-none)',
            'xxs':  'var(--ui-sys-spacing-xxs)',
            'xs':   'var(--ui-sys-spacing-extra-small)',
            'sm':   'var(--ui-sys-spacing-small)',
            'md':   'var(--ui-sys-spacing-medium)',
            'lg':   'var(--ui-sys-spacing-large)',
            'xl':   'var(--ui-sys-spacing-extra-large)',
          },
          fontSize: {
            'display-large':   ['var(--ui-sys-font-size-display-large)', { lineHeight: '1' }],
            'display-medium':  ['var(--ui-sys-font-size-display-medium)', { lineHeight: '1' }],
            'headline-large':  ['var(--ui-sys-font-size-headline-large)', { lineHeight: '1.3' }],
            'headline-medium': ['var(--ui-sys-font-size-headline-medium)', { lineHeight: '1.3' }],
            'body-large':      ['var(--ui-sys-font-size-body-large)', { lineHeight: '1.5' }],
            'body-medium':     ['var(--ui-sys-font-size-body-medium)', { lineHeight: '1.5' }],
            'body-small':      ['var(--ui-sys-font-size-body-small)', { lineHeight: '1.5' }],
            'label-large':     ['var(--ui-sys-font-size-label-large)', { lineHeight: '1.4' }],
            'label-medium':    ['var(--ui-sys-font-size-label-medium)', { lineHeight: '1.4' }],
            'label-small':     ['var(--ui-sys-font-size-label-small)', { lineHeight: '1.4' }],
          },
          fontWeight: {
            'default':  'var(--ui-sys-font-weight-default)',
            'emphasis': 'var(--ui-sys-font-weight-emphasis)',
            'strong':   'var(--ui-sys-font-weight-strong)',
            'heavy':    'var(--ui-sys-font-weight-heavy)',
          },
          borderRadius: {
            'none': 'var(--ui-sys-shape-corner-none)',         // 0px
            'sm':   'var(--ui-sys-shape-corner-extra-small)',  // 2px
            DEFAULT: 'var(--ui-sys-shape-corner-small)',       // 4px
            'md':   'var(--ui-sys-shape-corner-medium)',       // 8px
            'lg':   'var(--ui-sys-shape-corner-large)',        // 16px
            'full': 'var(--ui-sys-shape-corner-full)',         // 999px
          },
          colors: {
            // primary：定義完整 50–900 色階，滿足 @nuxt/ui generateSafelist 要求
            // （避免每次 HMR 產生大量 WARN → OOM）
            // 所有階數均指向同一 RGB 通道變數，實際視覺不變；
            // DEFAULT 保留 bg-primary / text-primary 等無階數用法。
            'primary': {
              DEFAULT: 'rgb(var(--ui-sys-color-primary-rgb) / <alpha-value>)',
              50:  'rgb(var(--ui-sys-color-primary-rgb) / <alpha-value>)',
              100: 'rgb(var(--ui-sys-color-primary-rgb) / <alpha-value>)',
              200: 'rgb(var(--ui-sys-color-primary-rgb) / <alpha-value>)',
              300: 'rgb(var(--ui-sys-color-primary-rgb) / <alpha-value>)',
              400: 'rgb(var(--ui-sys-color-primary-rgb) / <alpha-value>)',
              500: 'rgb(var(--ui-sys-color-primary-rgb) / <alpha-value>)',
              600: 'rgb(var(--ui-sys-color-primary-rgb) / <alpha-value>)',
              700: 'rgb(var(--ui-sys-color-primary-rgb) / <alpha-value>)',
              800: 'rgb(var(--ui-sys-color-primary-rgb) / <alpha-value>)',
              900: 'rgb(var(--ui-sys-color-primary-rgb) / <alpha-value>)',
              950: 'rgb(var(--ui-sys-color-primary-rgb) / <alpha-value>)',
            },
            // 其餘 5 個基礎色：flat CSS variable（Nuxt UI 不對它們使用 opacity modifier）
            'secondary': 'var(--ui-sys-color-secondary)',
            'error':     'var(--ui-sys-color-error)',
            'success':   'var(--ui-sys-color-success)',
            'warning':   'var(--ui-sys-color-warning)',
            'info':      'var(--ui-sys-color-info)',
            'primary-hover':        'var(--ui-sys-color-primary-hover)',
            'primary-container':    'var(--ui-sys-color-primary-container)',
            'on-primary':           'var(--ui-sys-color-on-primary)',
            'on-primary-container': 'var(--ui-sys-color-on-primary-container)',
            'secondary-container':  'var(--ui-sys-color-secondary-container)',
            'surface':              'var(--ui-sys-color-surface)',
            'surface-variant':      'var(--ui-sys-color-surface-variant)',
            'on-surface':           'var(--ui-sys-color-on-surface)',
            'on-surface-variant':   'var(--ui-sys-color-on-surface-variant)',
            'outline':              'var(--ui-sys-color-outline)',
            'outline-variant':      'var(--ui-sys-color-outline-variant)',
            'error-container':      'var(--ui-sys-color-error-container)',
            'on-error':             'var(--ui-sys-color-on-error)',
            'success-container':    'var(--ui-sys-color-success-container)',
            'on-success':           'var(--ui-sys-color-on-success)',
            'on-success-container': 'var(--ui-sys-color-on-success-container)',
            'warning-container':    'var(--ui-sys-color-warning-container)',
            'on-warning':           'var(--ui-sys-color-on-warning)',
            'info-container':       'var(--ui-sys-color-info-container)',
            'on-info':              'var(--ui-sys-color-on-info)',
            'disabled':             'var(--ui-sys-color-disabled)',
            'on-disabled':          'var(--ui-sys-color-on-disabled)',
            // 防災系統專用色彩別名
            'surface-page':         'var(--ui-sys-color-surface-page)',
            'disaster-bg':          'var(--ui-sys-color-disaster-bg)',
            'disaster-banner':      'var(--ui-sys-color-disaster-banner)',
            'on-disaster-banner':   'var(--ui-sys-color-on-disaster-banner)',
            'sidebar-township':     'var(--ui-sys-color-sidebar-township)',
            'sidebar-county':       'var(--ui-sys-color-sidebar-county)',
            'sidebar-nfa':          'var(--ui-sys-color-sidebar-nfa)',
            'sidebar-text':         'var(--ui-sys-color-sidebar-text)',
          },
        },
      },
    },
  },

  css: [
    '~/assets/css/design-token.css',
    '~/assets/css/comp-tokens.css'
  ],

  app: {
    head: {
      link: [
        // Google Fonts: Noto Sans TC + Inter
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: 'anonymous'
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap'
        }
        // 粉圓體 jf-openhuninn-2.0 透過 design-token.css 內的 @font-face 載入（jsDelivr CDN 直接抓 TTF）
      ],
      script: [
        // Adobe Fonts (Typekit) 非同步載入器 — 系統標題字體
        {
          innerHTML: `(function(d) {
  var config = {
    kitId: 'ujo3ysu',
    scriptTimeout: 3000,
    async: true
  },
  h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\\bwf-loading\\b/g,"")+" wf-inactive";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;h.className+=" wf-loading";tk.src='https://use.typekit.net/'+config.kitId+'.js';tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config)}catch(e){}};s.parentNode.insertBefore(tk,s)
})(document);`,
          type: 'text/javascript',
          tagPosition: 'head'
        }
      ]
    }
  },

  typescript: {
    strict: true,
    typeCheck: false
  }
})
