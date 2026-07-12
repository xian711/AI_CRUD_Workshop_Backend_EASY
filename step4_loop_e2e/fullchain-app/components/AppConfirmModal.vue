<template>
  <Teleport to="body">
    <Transition name="confirm-overlay">
      <div
        v-if="modelValue"
        class="fixed inset-0 bg-[var(--ui-comp-drawer-overlay)]"
        :style="{ zIndex: 'var(--ui-comp-drawer-z-index)' }"
        @click="onOverlayClick"
      />
    </Transition>

    <Transition name="confirm-dialog">
      <div
        v-if="modelValue"
        class="fixed inset-0 flex items-center justify-center p-[var(--ui-sys-spacing-medium)] pointer-events-none"
        :style="{ zIndex: 'calc(var(--ui-comp-drawer-z-index) + 1)' }"
      >
        <div
          role="alertdialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="descId"
          class="pointer-events-auto bg-[var(--ui-comp-drawer-bg)] rounded-[var(--ui-sys-shape-corner-large)] shadow-[0_20px_60px_rgba(0,0,0,0.18)] w-full flex flex-col max-h-[85vh]"
          :style="{ maxWidth: maxWidthCss }"
          tabindex="-1"
          ref="dialogEl"
          @keydown.esc="onEsc"
        >
          <header class="flex items-start gap-[var(--ui-sys-spacing-medium)] px-[var(--ui-sys-spacing-large)] pt-[var(--ui-sys-spacing-large)]">
            <div
              v-if="iconName"
              class="shrink-0 flex items-center justify-center rounded-full w-10 h-10"
              :class="iconWrapClass"
            >
              <UIcon :name="iconName" class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <h2
                :id="titleId"
                class="text-[length:var(--ui-sys-font-size-headline-medium)] font-[var(--ui-sys-font-weight-heavy)] text-on-surface"
              >
                {{ title }}
              </h2>
            </div>
          </header>

          <div
            :id="descId"
            class="px-[var(--ui-sys-spacing-large)] py-[var(--ui-sys-spacing-medium)] text-[length:var(--ui-sys-font-size-body-medium)] text-on-surface-variant"
          >
            <slot>{{ message }}</slot>
          </div>

          <footer class="flex items-center justify-end gap-[var(--ui-sys-spacing-small)] px-[var(--ui-sys-spacing-large)] pb-[var(--ui-sys-spacing-large)] pt-[var(--ui-sys-spacing-small)]">
            <UButton
              v-if="cancelText"
              color="secondary"
              variant="solid"
              size="md"
              :disabled="loading"
              @click="onCancel"
            >
              {{ cancelText }}
            </UButton>
            <UButton
              :color="confirmColor"
              variant="solid"
              size="md"
              :loading="loading"
              :disabled="confirmDisabled"
              @click="onConfirm"
            >
              {{ confirmText }}
            </UButton>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, useId, watch } from 'vue'

type Variant = 'danger' | 'warning' | 'info'
type UColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'

interface Props {
  modelValue: boolean
  title: string
  message?: string
  variant?: Variant
  confirmText?: string
  cancelText?: string
  loading?: boolean
  /** 確認按鈕是否 disabled（例如必填欄位未填） */
  confirmDisabled?: boolean
  closeOnOverlay?: boolean
  closeOnEsc?: boolean
  /** 對話框最大寬度，預設 480px；複雜表單可提升至 560/640 */
  maxWidth?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  message: '',
  variant: 'danger',
  confirmText: '確認',
  cancelText: '取消',
  loading: false,
  confirmDisabled: false,
  closeOnOverlay: true,
  closeOnEsc: true,
  maxWidth: 480,
})

const maxWidthCss = computed(() =>
  typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth,
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const titleId = `app-confirm-title-${useId()}`
const descId = `app-confirm-desc-${useId()}`
const dialogEl = ref<HTMLElement | null>(null)

const variantMap: Record<Variant, { icon: string; color: UColor; wrap: string }> = {
  danger: {
    icon: 'i-heroicons-exclamation-triangle-20-solid',
    color: 'error',
    wrap: 'bg-[var(--ui-sys-color-error-container,rgba(239,68,68,0.12))] text-[var(--ui-sys-color-error)]',
  },
  warning: {
    icon: 'i-heroicons-exclamation-circle-20-solid',
    color: 'warning',
    wrap: 'bg-[var(--ui-sys-color-warning-container,rgba(251,191,36,0.18))] text-[var(--ui-sys-color-warning)]',
  },
  info: {
    icon: 'i-heroicons-information-circle-20-solid',
    color: 'primary',
    wrap: 'bg-primary-container text-[var(--ui-sys-color-primary)]',
  },
}

const iconName = computed(() => variantMap[props.variant].icon)
const iconWrapClass = computed(() => variantMap[props.variant].wrap)
const confirmColor = computed<UColor>(() => variantMap[props.variant].color)

function close() {
  emit('update:modelValue', false)
}
function onCancel() {
  if (props.loading) return
  emit('cancel')
  close()
}
function onConfirm() {
  if (props.loading) return
  emit('confirm')
}
function onOverlayClick() {
  if (props.closeOnOverlay && !props.loading) onCancel()
}
function onEsc() {
  if (props.closeOnEsc && !props.loading) onCancel()
}

watch(
  () => props.modelValue,
  (open) => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = open ? 'hidden' : ''
    if (open) nextTick(() => dialogEl.value?.focus())
  },
  { immediate: true },
)
</script>

<style scoped>
.confirm-overlay-enter-active,
.confirm-overlay-leave-active { transition: opacity 180ms ease; }
.confirm-overlay-enter-from,
.confirm-overlay-leave-to     { opacity: 0; }

.confirm-dialog-enter-active,
.confirm-dialog-leave-active { transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1), opacity 200ms ease; }
.confirm-dialog-enter-from,
.confirm-dialog-leave-to     { opacity: 0; transform: translateY(8px) scale(0.98); }
</style>
