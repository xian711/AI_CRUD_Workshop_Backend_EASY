<!--
  EquipmentFormField — 表單欄位外框（label + 必填星號 + slot + 欄位級錯誤訊息）

  這個元件的角色（比照 TemplateFormField 範本，命名空間隔離複製）：
    以「新增元件擴充」而非「修改共用 FormRow」補上欄位級錯誤顯示與定位能力（開放封閉）。

  設計要點：
    - 根元素渲染 :data-field="name"，供儲存失敗時 document.querySelector 聚焦第一個錯誤欄位。
    - 錯誤訊息帶 :id，供輸入元件以 aria-describedby 關聯（無障礙）。
-->
<template>
  <div :data-field="name">
    <span class="block text-body-medium font-emphasis text-on-surface mb-xs">
      {{ label }}
      <span v-if="required" class="text-[var(--ui-sys-color-error)]">*</span>
    </span>
    <slot />
    <p
      v-if="error"
      :id="`${name}-error`"
      class="mt-xs text-label-small text-[var(--ui-sys-color-error)]"
    >
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string
  /** 欄位鍵，渲染為 data-field 供錯誤聚焦定位 */
  name: string
  required?: boolean
  error?: string
}

withDefaults(defineProps<Props>(), {
  required: false,
  error: '',
})
</script>
