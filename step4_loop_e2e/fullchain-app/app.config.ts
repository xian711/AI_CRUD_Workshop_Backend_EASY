// @ts-nocheck
// Nuxt UI v2 已知限制：defineAppConfig 的 AppConfigInput 型別與 AppConfig 之間存在循環參照
// （ButtonColor/BadgeColor ↔ AppConfig），導致 TS7022/TS2615。
// 自訂色彩的型別擴充已透過 types/nuxt-ui.d.ts 的 AppConfig 擴充處理。
export default defineAppConfig({
  ui: {
    // ============================================================
    // Button 元件配置 - 對應設計系統 COMP token
    // ============================================================
    button: {
      base: 'font-medium transition-colors focus-visible:outline-none',
      rounded: 'rounded-[var(--ui-comp-button-radius)]',
      font: 'font-[var(--ui-sys-font-family-default)]',

      size: {
        sm: [
          'text-[length:var(--ui-comp-button-font-size-sm)]',
          'px-[var(--ui-comp-button-padding-x-sm)]',
          'py-[var(--ui-comp-button-padding-y-sm)]',
          'gap-[var(--ui-comp-button-icon-gap-sm)]'
        ].join(' '),
        md: [
          'text-[length:var(--ui-comp-button-font-size-md)]',
          'px-[var(--ui-comp-button-padding-x-md)]',
          'py-[var(--ui-comp-button-padding-y-md)]',
          'gap-[var(--ui-comp-button-icon-gap-md)]'
        ].join(' '),
        lg: [
          'text-[length:var(--ui-comp-button-font-size-lg)]',
          'px-[var(--ui-comp-button-padding-x-lg)]',
          'py-[var(--ui-comp-button-padding-y-lg)]',
          'gap-[var(--ui-comp-button-icon-gap-lg)]'
        ].join(' ')
      },

      // Icon 配置 - 使用 COMP 層 button icon size token
      icon: {
        size: {
          sm: 'w-[var(--ui-comp-button-icon-size-sm)] h-[var(--ui-comp-button-icon-size-sm)]',
          md: 'w-[var(--ui-comp-button-icon-size-md)] h-[var(--ui-comp-button-icon-size-md)]',
          lg: 'w-[var(--ui-comp-button-icon-size-lg)] h-[var(--ui-comp-button-icon-size-lg)]'
        }
      },

      // Leading icon 配置
      leadingIcon: {
        size: {
          sm: 'w-[var(--ui-comp-button-icon-size-sm)] h-[var(--ui-comp-button-icon-size-sm)]',
          md: 'w-[var(--ui-comp-button-icon-size-md)] h-[var(--ui-comp-button-icon-size-md)]',
          lg: 'w-[var(--ui-comp-button-icon-size-lg)] h-[var(--ui-comp-button-icon-size-lg)]'
        }
      },

      // Trailing icon 配置
      trailingIcon: {
        size: {
          sm: 'w-[var(--ui-comp-button-icon-size-sm)] h-[var(--ui-comp-button-icon-size-sm)]',
          md: 'w-[var(--ui-comp-button-icon-size-md)] h-[var(--ui-comp-button-icon-size-md)]',
          lg: 'w-[var(--ui-comp-button-icon-size-lg)] h-[var(--ui-comp-button-icon-size-lg)]'
        }
      },

      // 定義預設值
      default: {
        size: 'md',
        variant: 'solid',
        color: 'primary' as string
      },

      // 顏色配置 - 每個顏色支援 solid, outline, ghost 三種變體
      color: {
        primary: {
          solid: [
            'border-0',
            'bg-[var(--ui-comp-button-bg-primary-default)]',
            'text-[var(--ui-comp-button-text-primary-default)]',
            'hover:bg-[var(--ui-comp-button-bg-primary-hover)]',
            'disabled:bg-[var(--ui-comp-button-bg-primary-disabled)]',
            'disabled:text-[var(--ui-comp-button-text-primary-disabled)]',
            'focus-visible:shadow-[var(--ui-comp-button-shadow-focus-primary)]'
          ].join(' '),
          outline: [
            'border',
            'border-[var(--ui-comp-button-border-primary-default)]',
            'bg-primary-container',
            'text-[var(--ui-comp-button-bg-primary-default)]',
            'hover:bg-[var(--ui-comp-button-bg-primary-hover)]',
            'hover:text-[var(--ui-comp-button-text-primary-default)]',
            'disabled:border-[var(--ui-comp-button-border-primary-disabled)]',
            'disabled:bg-transparent',
            'disabled:text-[var(--ui-comp-button-text-primary-disabled)]'
          ].join(' '),
          ghost: [
            'border-0',
            'bg-transparent',
            'text-[var(--ui-comp-button-bg-primary-default)]',
            'hover:bg-primary-container',
            'disabled:bg-transparent',
            'disabled:text-on-disabled',
            'focus-visible:shadow-[var(--ui-comp-button-shadow-focus-primary)]'
          ].join(' ')
        },

        secondary: {
          solid: [
            'border-0',
            'bg-[var(--ui-comp-button-bg-secondary-default)]',
            'text-[var(--ui-comp-button-text-secondary-default)]',
            'hover:bg-[var(--ui-comp-button-bg-secondary-hover)]',
            'disabled:bg-[var(--ui-comp-button-bg-secondary-disabled)]',
            'disabled:text-[var(--ui-comp-button-text-secondary-disabled)]',
            'focus-visible:shadow-[var(--ui-comp-button-shadow-focus-secondary)]'
          ].join(' '),
          outline: [
            'border',
            'border-secondary',
            'bg-secondary-container',
            'text-[var(--ui-comp-button-text-secondary-default)]',
            'hover:bg-secondary',
            'hover:border-outline',
            'disabled:border-disabled',
            'disabled:bg-transparent',
            'disabled:text-on-disabled'
          ].join(' '),
          ghost: [
            'border-0',
            'bg-transparent',
            'text-[var(--ui-comp-button-text-secondary-default)]',
            'hover:bg-secondary-container',
            'disabled:bg-transparent',
            'disabled:text-on-disabled'
          ].join(' ')
        },

        success: {
          solid: [
            'border-0',
            'bg-[var(--ui-comp-button-bg-success-default)]',
            'text-[var(--ui-comp-button-text-success-default)]',
            'hover:bg-[var(--ui-comp-button-bg-success-hover)]',
            'disabled:bg-[var(--ui-comp-button-bg-success-disabled)]',
            'disabled:text-[var(--ui-comp-button-text-success-disabled)]',
            'focus-visible:shadow-[var(--ui-comp-button-shadow-focus-success)]'
          ].join(' '),
          outline: [
            'border',
            'border-success',
            'bg-success-container',
            'text-success',
            'hover:bg-success',
            'hover:text-on-success',
            'disabled:border-disabled',
            'disabled:bg-transparent',
            'disabled:text-on-disabled'
          ].join(' '),
          ghost: [
            'border-0',
            'bg-transparent',
            'text-success',
            'hover:bg-success-container',
            'disabled:bg-transparent',
            'disabled:text-on-disabled'
          ].join(' ')
        },

        warning: {
          solid: [
            'border-0',
            'bg-[var(--ui-comp-button-bg-warning-default)]',
            'text-[var(--ui-comp-button-text-warning-default)]',
            'hover:bg-[var(--ui-comp-button-bg-warning-hover)]',
            'disabled:bg-[var(--ui-comp-button-bg-warning-disabled)]',
            'disabled:text-[var(--ui-comp-button-text-warning-disabled)]',
            'focus-visible:shadow-[var(--ui-comp-button-shadow-focus-warning)]'
          ].join(' '),
          outline: [
            'border',
            'border-warning',
            'bg-warning-container',
            'text-warning',
            'hover:bg-warning',
            'hover:text-on-warning',
            'disabled:border-disabled',
            'disabled:bg-transparent',
            'disabled:text-on-disabled'
          ].join(' '),
          ghost: [
            'border-0',
            'bg-transparent',
            'text-warning',
            'hover:bg-warning-container',
            'disabled:bg-transparent',
            'disabled:text-on-disabled'
          ].join(' ')
        },

        info: {
          solid: [
            'border-0',
            'bg-[var(--ui-comp-button-bg-info-default)]',
            'text-[var(--ui-comp-button-text-info-default)]',
            'hover:bg-[var(--ui-comp-button-bg-info-hover)]',
            'disabled:bg-[var(--ui-comp-button-bg-info-disabled)]',
            'disabled:text-[var(--ui-comp-button-text-info-disabled)]',
            'focus-visible:shadow-[var(--ui-comp-button-shadow-focus-info)]'
          ].join(' '),
          outline: [
            'border',
            'border-info',
            'bg-info-container',
            'text-info',
            'hover:bg-info',
            'hover:text-on-info',
            'disabled:border-disabled',
            'disabled:bg-transparent',
            'disabled:text-on-disabled'
          ].join(' '),
          ghost: [
            'border-0',
            'bg-transparent',
            'text-info',
            'hover:bg-info-container',
            'disabled:bg-transparent',
            'disabled:text-on-disabled'
          ].join(' ')
        },

        error: {
          solid: [
            'border-0',
            'bg-[var(--ui-comp-button-bg-error-default)]',
            'text-[var(--ui-comp-button-text-error-default)]',
            'hover:bg-[var(--ui-comp-button-bg-error-hover)]',
            'disabled:bg-[var(--ui-comp-button-bg-error-disabled)]',
            'disabled:text-[var(--ui-comp-button-text-error-disabled)]',
            'focus-visible:shadow-[var(--ui-comp-button-shadow-focus-error)]'
          ].join(' '),
          outline: [
            'border',
            'border-error',
            'bg-error-container',
            'text-error',
            'hover:bg-error',
            'hover:text-on-error',
            'disabled:border-disabled',
            'disabled:bg-transparent',
            'disabled:text-on-disabled'
          ].join(' '),
          ghost: [
            'border-0',
            'bg-transparent',
            'text-error',
            'hover:bg-error-container',
            'disabled:bg-transparent',
            'disabled:text-on-disabled'
          ].join(' ')
        },

        // white color：清除 Nuxt UI 預設 hover 樣式，讓 pagination 等元件可以自行控制
        white: {
          solid: 'ring-0 shadow-none',
          ghost: 'ring-0 shadow-none',
          outline: 'ring-0 shadow-none',
        }
      }
    },

    // ============================================================
    // Input 元件配置
    // ============================================================
    input: {
      base: [
        'font-[var(--ui-sys-font-family-default)]',
        'font-[var(--ui-comp-input-font-weight)]',
        'transition-colors',
        'focus-visible:outline-none',
        'ring-0',
      ].join(' '),
      rounded: 'rounded-[var(--ui-comp-input-radius)]',
      shadow: 'shadow-none',
      // placeholder 顏色 + 字級（縮小一級到 label-medium = 16px，避免比 input 實際字 20px 還搶眼，也減少長提示被截斷）
      placeholder: 'placeholder:text-[var(--ui-comp-input-placeholder-default)] placeholder:text-[length:var(--ui-sys-font-size-label-medium)]',

      // 尺寸配置 - 使用 COMP 層 input size token
      size: {
        sm: [
          'text-[length:var(--ui-comp-input-font-size-sm)]',
          'px-[var(--ui-comp-input-padding-x-sm)]',
          'py-[var(--ui-comp-input-padding-y-sm)]',
          'leading-[var(--ui-comp-input-line-height-sm)]',
          'tracking-[var(--ui-comp-input-letter-spacing-sm)]'
        ].join(' '),
        md: [
          'text-[length:var(--ui-comp-input-font-size-md)]',
          'px-[var(--ui-comp-input-padding-x-md)]',
          'py-[var(--ui-comp-input-padding-y-md)]',
          'leading-[var(--ui-comp-input-line-height-md)]',
          'tracking-[var(--ui-comp-input-letter-spacing-md)]'
        ].join(' '),
        lg: [
          'text-[length:var(--ui-comp-input-font-size-lg)]',
          'px-[var(--ui-comp-input-padding-x-lg)]',
          'py-[var(--ui-comp-input-padding-y-lg)]',
          'leading-[var(--ui-comp-input-line-height-lg)]',
          'tracking-[var(--ui-comp-input-letter-spacing-lg)]'
        ].join(' ')
      },

      // 定義預設值
      default: {
        size: 'md',
        color: 'white' as string,
        variant: 'outline'
      },

      color: {
        white: {
          outline: [
            'shadow-none',
            'ring-0',
            'bg-[var(--ui-comp-input-bg-default)]',
            'border',
            'border-[var(--ui-comp-input-border-default)]',
            'text-[var(--ui-comp-input-text-default)]',
            'focus:ring-2',
            'focus:ring-primary-container',
            'focus:border-[var(--ui-comp-input-border-focus)]',
            'focus:bg-[var(--ui-comp-input-bg-focus)]',
            'disabled:bg-[var(--ui-comp-input-bg-disabled)]',
            'disabled:text-[var(--ui-comp-input-text-disabled)]',
            'disabled:border-[var(--ui-comp-input-border-disabled)]',
            'disabled:cursor-not-allowed'
          ].join(' ')
        }
      }
    },

    // ============================================================
    // FormGroup 元件配置 - 用於 Input label 和 helper text
    // ============================================================
    formGroup: {
      label: {
        base: [
          'block',
          'mb-[var(--ui-sys-spacing-extra-small)]',
          'font-[var(--ui-sys-font-family-default)]',
          'text-[length:var(--ui-comp-input-label-font-size-md)]',
          'font-[var(--ui-comp-input-label-font-weight)]',
          'text-[var(--ui-comp-input-label-default)]'
        ].join(' ')
      },
      description: [
        'mt-[var(--ui-sys-spacing-extra-small)]',
        'font-[var(--ui-sys-font-family-default)]',
        'text-[length:var(--ui-comp-input-helper-font-size)]',
        'font-[var(--ui-comp-input-helper-font-weight)]',
        'text-[var(--ui-comp-input-helper-text-default)]'
      ].join(' '),
      error: [
        'mt-[var(--ui-sys-spacing-extra-small)]',
        'font-[var(--ui-sys-font-family-default)]',
        'text-[length:var(--ui-comp-input-helper-font-size)]',
        'font-[var(--ui-comp-input-helper-font-weight)]',
        'text-[var(--ui-comp-input-helper-text-error)]'
      ].join(' ')
    },

    // ============================================================
    // Card 元件配置 - 使用 COMP 層 card token
    // ============================================================
    card: {
      base: 'bg-[var(--ui-comp-card-bg-default)] font-[var(--ui-sys-font-family-default)]',
      rounded: 'rounded-[var(--ui-comp-card-radius)]',
      shadow: 'shadow-none',

      body: {
        base: '',
        padding: 'p-[var(--ui-comp-card-padding)]'
      },

      header: {
        base: '',
        padding: 'px-[var(--ui-comp-card-padding)] py-[var(--ui-sys-spacing-medium)]'
      },

      footer: {
        base: '',
        padding: 'px-[var(--ui-comp-card-padding)] py-[var(--ui-sys-spacing-medium)]'
      },

      // Card variants
      ring: '',  // 移除 Nuxt UI 預設的 ring
      divide: 'divide-y divide-outline-variant'
    },

    // ============================================================
    // Badge 元件配置
    // ============================================================
    badge: {
      base: 'font-[var(--ui-sys-font-family-default)]',
      rounded: 'rounded-full',

      // 尺寸配置 - 使用 COMP 層 badge size token
      size: {
        sm: [
          'text-[length:var(--ui-comp-badge-font-size-sm)]',
          'px-[var(--ui-comp-badge-padding-x-sm)]',
          'py-[var(--ui-comp-badge-padding-y-sm)]',
          'font-[var(--ui-comp-badge-font-weight-sm)]'
        ].join(' '),
        md: [
          'text-[length:var(--ui-comp-badge-font-size-md)]',
          'px-[var(--ui-comp-badge-padding-x-md)]',
          'py-[var(--ui-comp-badge-padding-y-md)]',
          'font-[var(--ui-comp-badge-font-weight-md)]'
        ].join(' '),
        lg: [
          'text-[length:var(--ui-comp-badge-font-size-lg)]',
          'px-[var(--ui-comp-badge-padding-x-lg)]',
          'py-[var(--ui-comp-badge-padding-y-lg)]',
          'font-[var(--ui-comp-badge-font-weight-lg)]'
        ].join(' ')
      },

      // 預設值
      default: {
        size: 'md',
        variant: 'solid',
        color: 'primary' as string
      },

      variant: {
        solid: 'bg-[var(--ui-comp-badge-bg-primary)] text-[var(--ui-comp-badge-text-primary)]',
        soft: 'bg-[var(--ui-comp-badge-bg-neutral)] text-[var(--ui-comp-badge-text-neutral)]'
      },

      color: {
        primary: {
          solid: 'bg-[var(--ui-comp-badge-bg-primary)] text-[var(--ui-comp-badge-text-primary)]'
        },
        secondary: {
          solid: 'bg-[var(--ui-comp-badge-bg-secondary)] text-[var(--ui-comp-badge-text-secondary)]'
        },
        success: {
          solid: 'bg-[var(--ui-comp-badge-bg-success)] text-[var(--ui-comp-badge-text-success)]'
        },
        warning: {
          solid: 'bg-[var(--ui-comp-badge-bg-warning)] text-[var(--ui-comp-badge-text-warning)]'
        },
        error: {
          solid: 'bg-[var(--ui-comp-badge-bg-error)] text-[var(--ui-comp-badge-text-error)]'
        }
      }
    },

    // ============================================================
    // Modal 元件配置
    // ============================================================
    modal: {
      base: 'bg-[var(--ui-comp-modal-bg)]',
      rounded: 'rounded-[var(--ui-comp-modal-radius)]',
      shadow: 'shadow-[var(--ui-comp-modal-shadow)]',
      padding: 'p-[var(--ui-comp-modal-padding)]',
      overlay: {
        base: 'bg-[var(--ui-comp-modal-overlay)]'
      }
    },

    // ============================================================
    // Dropdown / Select 元件配置
    // ============================================================
    dropdown: {
      item: {
        base: 'font-[var(--ui-sys-font-family-default)]',
        size: 'text-body-medium',
      },
    },

    selectMenu: {
      rounded: 'rounded-[var(--ui-comp-dropdown-trigger-radius)]',
      // 下拉選單尺寸
      // - 高度：使用 viewport 比例（Nuxt UI 預設 max-h-60 只 240px ~5 行），1080p 約 650px 可顯示 ~15+ 行
      // - 寬度：完全跟著觸發按鈕寬度（w-full），由 trigger 的 class（w-44/w-60/w-80 等）決定。
      //         不再用 w-max 自動延展，避免短選項（如「主任」「男」）的下拉浮層比觸發按鈕還寬
      height: 'max-h-[60vh]',
      width: 'w-full',
      // 搜尋框（展開後最上方的 input）—— 字體與 lg 觸發按鈕對齊（body-large = 20px），會跟字級縮放同步
      // 使用 [length:var(...)] 語法（與 select.size.lg 一致），避免 Tailwind JIT 漏掃 app.config.ts
      input: 'block w-[calc(100%+0.5rem)] focus:ring-transparent text-[length:var(--ui-sys-font-size-body-large)] px-3 py-2 text-on-surface bg-surface border-0 border-b border-outline-variant sticky -top-1 -mt-1 mb-1 -mx-1 z-10 invalid:ring-transparent',
      // 空狀態
      empty: 'text-[length:var(--ui-sys-font-size-body-medium)] text-on-surface-variant px-3 py-2',
      // 選項清單
      option: {
        // 與 lg 觸發按鈕字級對齊（body-large = 20px），會跟字級縮放（font-size-small/medium/large）同步
        size: 'text-[length:var(--ui-sys-font-size-body-large)]',
        padding: 'px-3 py-2',
      },
    },

    select: {
      base: 'font-[var(--ui-sys-font-family-default)] font-[var(--ui-comp-dropdown-font-weight)]',
      rounded: 'rounded-[var(--ui-comp-dropdown-trigger-radius)]',
      shadow: 'shadow-none',

      // 對齊 Input 三段尺寸
      size: {
        sm: [
          'text-[length:var(--ui-comp-dropdown-trigger-font-size-sm)]',
          'px-[var(--ui-comp-dropdown-trigger-padding-x-sm)]',
          'py-[var(--ui-comp-dropdown-trigger-padding-y-sm)]',
          'leading-[var(--ui-comp-dropdown-trigger-line-height-sm)]'
        ].join(' '),
        md: [
          'text-[length:var(--ui-comp-dropdown-trigger-font-size-md)]',
          'px-[var(--ui-comp-dropdown-trigger-padding-x-md)]',
          'py-[var(--ui-comp-dropdown-trigger-padding-y-md)]',
          'leading-[var(--ui-comp-dropdown-trigger-line-height-md)]'
        ].join(' '),
        lg: [
          'text-[length:var(--ui-comp-dropdown-trigger-font-size-lg)]',
          'px-[var(--ui-comp-dropdown-trigger-padding-x-lg)]',
          'py-[var(--ui-comp-dropdown-trigger-padding-y-lg)]',
          'leading-[var(--ui-comp-dropdown-trigger-line-height-lg)]'
        ].join(' ')
      },

      default: {
        size: 'md',
        color: 'white' as string,
        variant: 'outline'
      },

      color: {
        white: {
          outline: [
            'shadow-none',
            'ring-0',
            'bg-[var(--ui-comp-dropdown-trigger-bg-default)]',
            'border',
            'border-[var(--ui-comp-dropdown-trigger-border-default)]',
            'text-[var(--ui-comp-dropdown-trigger-text-default)]',
            'hover:border-[var(--ui-comp-dropdown-trigger-border-hover)]',
            'focus:ring-2',
            'focus:ring-primary-container',
            'focus:border-[var(--ui-comp-dropdown-trigger-border-focus)]',
            'focus:bg-[var(--ui-comp-dropdown-trigger-bg-focus)]',
            'disabled:bg-[var(--ui-comp-dropdown-trigger-bg-disabled)]',
            'disabled:text-[var(--ui-comp-dropdown-trigger-text-disabled)]',
            'disabled:border-[var(--ui-comp-dropdown-trigger-border-disabled)]',
            'disabled:cursor-not-allowed'
          ].join(' ')
        }
      }
    },

    // ============================================================
    // Table 元件配置
    // ============================================================
    table: {
      base: 'rounded-[var(--ui-comp-table-radius)] overflow-hidden',
      thead: 'bg-[var(--ui-comp-table-header-bg)]',
      th: {
        base: 'text-[var(--ui-comp-table-header-text)] font-strong',
        padding: 'px-[var(--ui-comp-table-header-cell-padding-x)] py-[var(--ui-comp-table-header-cell-padding-y)]'
      },
      tbody: 'bg-surface',
      td: {
        base: 'text-[var(--ui-comp-table-cell-text)]',
        padding: 'px-[var(--ui-comp-table-cell-padding-x)] py-[var(--ui-comp-table-cell-padding-y)]'
      },
      tr: {
        base: 'hover:bg-[var(--ui-comp-table-row-bg-hover)]'
      }
    },

    // ============================================================
    // Dashboard 元件配置
    // ============================================================
    dashboard: {
      panel: {
        base: 'bg-primary'
      },
      sidebar: {
        base: 'bg-primary text-on-primary'
      }
    },

    // ============================================================
    // Dashboard Sidebar Links 元件配置
    // ============================================================
    dashboardSidebarLinks: {
      wrapper: 'p-4 space-y-1',
      base: [
        'group',
        'flex',
        'items-center',
        'gap-3',
        'px-4',
        'py-3',
        'rounded-md',
        'transition-colors',
        'text-body-medium',
        'font-emphasis',
        'font-[var(--ui-sys-font-family-default)]'
      ].join(' '),
      inactive: [
        'text-on-primary',
        'hover:bg-primary-hover'
      ].join(' '),
      active: [
        'bg-primary-container',
        'text-on-primary-container',
        'font-heavy'
      ].join(' '),
      icon: {
        base: 'w-5 h-5 flex-shrink-0',
        active: 'text-on-primary-container',
        inactive: 'text-on-primary'
      },
      label: 'truncate',
      badge: {
        base: 'ml-auto',
        size: 'sm',
        color: 'primary' as string,
        variant: 'solid'
      }
    },

    // ============================================================
    // Checkbox 元件配置
    // ============================================================
    checkbox: {
      wrapper: 'relative flex items-start',
      container: 'flex items-start pt-[var(--ui-comp-checkbox-padding-top)]',
      base: [
        'h-[var(--ui-comp-checkbox-size)]',
        'w-[var(--ui-comp-checkbox-size)]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:ring-0 focus:ring-transparent focus:ring-offset-transparent',
      ].join(' '),
      form: 'form-checkbox',
      rounded: 'rounded-[var(--ui-comp-checkbox-radius)]',
      color: 'text-primary',
      background: 'bg-[var(--ui-comp-checkbox-bg-default)]',
      border: 'border border-[var(--ui-comp-checkbox-border-default)]',
      ring: 'focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-2',
      inner: 'ms-[var(--ui-comp-checkbox-label-gap)] flex flex-col',
      label: 'text-[length:var(--ui-comp-checkbox-label-font-size)] font-[var(--ui-comp-checkbox-label-font-weight)] text-[var(--ui-comp-checkbox-label-color)]',
      required: 'text-label-small text-error',
      help: 'text-label-small text-on-surface-variant',
      default: { color: 'primary' as string }
    },

    // ============================================================
    // Radio 元件配置
    // ============================================================
    radio: {
      wrapper: 'relative flex items-start',
      container: 'flex items-start pt-[var(--ui-comp-radio-padding-top)]',
      base: [
        'h-[var(--ui-comp-radio-size)]',
        'w-[var(--ui-comp-radio-size)]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:ring-0 focus:ring-transparent focus:ring-offset-transparent',
      ].join(' '),
      form: 'form-radio',
      color: 'text-primary',
      background: 'bg-[var(--ui-comp-radio-bg-default)]',
      border: 'border border-[var(--ui-comp-radio-border-default)]',
      ring: 'focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-2',
      inner: 'ms-[var(--ui-comp-radio-label-gap)] flex flex-col',
      label: 'text-[length:var(--ui-comp-radio-label-font-size)] font-[var(--ui-comp-radio-label-font-weight)] text-[var(--ui-comp-radio-label-color)]',
      required: 'text-label-small text-error',
      help: 'text-label-small text-on-surface-variant',
      default: { color: 'primary' as string }
    },

    // ============================================================
    // Textarea 元件配置
    // ============================================================
    textarea: {
      base: 'relative block w-full disabled:cursor-not-allowed disabled:opacity-75 focus:outline-none border-0',
      form: 'form-textarea',
      rounded: 'rounded-[var(--ui-comp-textarea-radius)]',
      placeholder: 'placeholder:text-[var(--ui-comp-textarea-placeholder-default)]',
      size: {
        sm: 'text-[length:var(--ui-comp-input-font-size-sm)]',
        md: 'text-[length:var(--ui-comp-textarea-font-size)]',
        lg: 'text-[length:var(--ui-comp-input-font-size-lg)]',
      },
      padding: {
        sm: 'px-[var(--ui-comp-input-padding-x-sm)] py-[var(--ui-comp-input-padding-y-sm)]',
        md: 'px-[var(--ui-comp-textarea-padding-x)] py-[var(--ui-comp-textarea-padding-y)]',
        lg: 'px-[var(--ui-comp-input-padding-x-lg)] py-[var(--ui-comp-input-padding-y-lg)]',
      },
      color: {
        white: {
          outline: [
            'shadow-none',
            'ring-0',
            'bg-[var(--ui-comp-textarea-bg-default)]',
            'border border-[var(--ui-comp-textarea-border-default)]',
            'text-[var(--ui-comp-textarea-text-default)]',
            'placeholder:text-[var(--ui-comp-textarea-placeholder-default)]',
            'focus:ring-2 focus:ring-primary-container',
            'focus:border-[var(--ui-comp-textarea-border-focus)]',
            'disabled:bg-[var(--ui-comp-textarea-bg-disabled)]',
            'disabled:border-[var(--ui-comp-textarea-border-disabled)]',
            'disabled:text-[var(--ui-comp-textarea-text-disabled)]',
          ].join(' ')
        }
      },
      default: { size: 'md', color: 'white' as string, variant: 'outline' }
    },

    // ============================================================
    // Pagination 元件配置
    // ============================================================
    pagination: {
      wrapper: 'flex items-center -space-x-px',
      base: 'min-w-[var(--ui-comp-pagination-btn-size)] h-[var(--ui-comp-pagination-btn-size)] flex items-center justify-center text-label-small font-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:z-10',
      rounded: 'first:rounded-s-[var(--ui-comp-pagination-btn-radius)] last:rounded-e-[var(--ui-comp-pagination-btn-radius)]',
      default: {
        activeButton: {
          color: 'white' as string,
          class: 'ring-0 shadow-none z-10 bg-[var(--ui-comp-pagination-btn-bg-active)] text-[var(--ui-comp-pagination-btn-text-active)] border border-[var(--ui-comp-pagination-btn-border-active)] hover:bg-[var(--ui-comp-pagination-btn-bg-active-hover)]',
        },
        inactiveButton: {
          color: 'white' as string,
          class: 'ring-0 shadow-none bg-[var(--ui-comp-pagination-btn-bg-default)] text-[var(--ui-comp-pagination-btn-text-default)] border border-[var(--ui-comp-pagination-btn-border-default)] hover:bg-[var(--ui-comp-pagination-btn-bg-hover)] hover:text-[var(--ui-comp-pagination-btn-text-hover)] hover:border-[var(--ui-comp-pagination-btn-border-hover)]',
        },
        prevButton: {
          icon: 'i-heroicons-chevron-left',
          color: 'white' as string,
          class: 'ring-0 shadow-none bg-[var(--ui-comp-pagination-btn-bg-default)] text-[var(--ui-comp-pagination-btn-text-default)] border border-[var(--ui-comp-pagination-btn-border-default)] hover:bg-[var(--ui-comp-pagination-btn-bg-hover)] hover:text-[var(--ui-comp-pagination-btn-text-hover)] hover:border-[var(--ui-comp-pagination-btn-border-hover)] disabled:text-[var(--ui-comp-pagination-btn-text-disabled)] disabled:cursor-not-allowed',
        },
        nextButton: {
          icon: 'i-heroicons-chevron-right',
          color: 'white' as string,
          class: 'ring-0 shadow-none bg-[var(--ui-comp-pagination-btn-bg-default)] text-[var(--ui-comp-pagination-btn-text-default)] border border-[var(--ui-comp-pagination-btn-border-default)] hover:bg-[var(--ui-comp-pagination-btn-bg-hover)] hover:text-[var(--ui-comp-pagination-btn-text-hover)] hover:border-[var(--ui-comp-pagination-btn-border-hover)] disabled:text-[var(--ui-comp-pagination-btn-text-disabled)] disabled:cursor-not-allowed',
        },
      }
    },

    // ============================================================
    // Tabs 元件配置（UTabs 底層）
    // 對應 AppTabBar 元件，使用 underline 樣式
    // ============================================================
    tabs: {
      wrapper: 'relative',
      container: 'relative w-full',
      base: 'focus:outline-none',
      list: {
        base: 'relative border-b border-[var(--ui-comp-tab-bar-border-color)] bg-[var(--ui-comp-tab-bar-bg)]',
        background: '',
        rounded: '',
        shadow: '',
        padding: '',
        height: '',
        width: 'w-full',
        marker: {
          wrapper: 'hidden',
          base: '',
          background: '',
          rounded: '',
          shadow: '',
        },
        tab: {
          base: 'relative inline-flex items-center justify-center gap-xs flex-shrink-0 ui-focus-visible:outline-0 ui-focus-visible:ring-2 ui-focus-visible:ring-inset ui-focus-visible:ring-primary-container ui-not-focus-visible:outline-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
          background: '',
          active: 'text-[var(--ui-comp-tab-text-active)]',
          inactive: 'text-[var(--ui-comp-tab-text-default)] hover:text-on-surface',
          height: '',
          padding: 'px-[var(--ui-comp-tab-padding-x)] py-[var(--ui-comp-tab-padding-y)]',
          size: 'text-[length:var(--ui-comp-tab-font-size)]',
          font: 'font-[var(--ui-comp-tab-font-weight)]',
          rounded: '',
          shadow: '',
          icon: 'w-4 h-4 flex-shrink-0',
        },
      },
    },

    // ============================================================
    // Vertical Navigation 元件配置（為相容性保留）
    // ============================================================
    verticalNavigation: {
      wrapper: 'p-4 space-y-2',
      base: [
        'group',
        'flex',
        'items-center',
        'gap-3',
        'px-4',
        'py-3',
        'rounded-lg',
        'transition-colors',
        'text-body-medium',
        'font-emphasis'
      ].join(' '),
      inactive: [
        'text-on-primary',
        'hover:bg-primary-hover'
      ].join(' '),
      active: [
        'bg-primary-container',
        'text-on-primary-container',
        'font-heavy'
      ].join(' '),
      icon: {
        base: 'w-5 h-5 flex-shrink-0'
      }
    },

    // ============================================================
    // Breadcrumb 元件配置 - 使用 SYS token
    // ============================================================
    breadcrumb: {
      wrapper: 'relative min-w-0',
      ol: 'flex items-center gap-x-xs',
      li: 'flex items-center gap-x-xs text-body-medium leading-6 min-w-0',
      base: 'flex items-center gap-x-xs group font-emphasis min-w-0',
      label: 'block truncate',
      icon: {
        base: 'flex-shrink-0 w-4 h-4',
        active: '',
        inactive: ''
      },
      divider: {
        base: 'flex-shrink-0 w-4 h-4 text-on-surface-variant'
      },
      active: 'text-on-surface font-heavy',
      inactive: 'text-primary hover:text-primary-hover hover:underline',
      default: {
        divider: 'i-heroicons-chevron-right-20-solid'
      }
    },

    // ============================================================
    // Slideover 元件配置 - 手機版 drawer
    // ============================================================
    slideover: {
      overlay: {
        base: 'fixed inset-0 transition-opacity',
        background: 'bg-gray-200/75'
      },
      base: 'relative flex-1 flex flex-col w-full focus:outline-none',
      background: 'bg-primary',
      width: 'w-64',
      padding: 'p-0',
    },

    // ============================================================
    // Accordion 元件配置 - 對應設計系統 COMP token
    // ============================================================
    accordion: {
      wrapper: 'w-full',
      item: {
        base: 'border border-[var(--ui-comp-accordion-border)] rounded-[var(--ui-comp-accordion-radius)] overflow-hidden',
        size: 'text-[length:var(--ui-comp-accordion-header-font-size)]',
        color: 'text-[var(--ui-comp-accordion-header-text)]',
        padding: 'px-[var(--ui-comp-accordion-header-padding-x)] py-[var(--ui-comp-accordion-header-padding-y)]',
        icon: 'w-5 h-5 text-on-surface-variant flex-shrink-0'
      },
      default: {
        openIcon: 'i-heroicons-chevron-down-20-solid',
        closeIcon: 'i-heroicons-chevron-up-20-solid',
        class: 'w-full bg-[var(--ui-comp-accordion-header-bg-default)] hover:bg-[var(--ui-comp-accordion-header-bg-hover)] font-[var(--ui-comp-accordion-header-font-weight)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container transition-colors'
      }
    }
  }
})
