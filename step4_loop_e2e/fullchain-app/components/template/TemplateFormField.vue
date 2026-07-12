<!--
  TemplateFormField — 表單欄位外框（label + 必填星號 + slot + 欄位級錯誤訊息）

  這個元件在範本中的角色：
    以「新增元件擴充」而非「修改共用 FormRow」的方式，補上 FormRow 沒有的
    欄位級錯誤顯示與錯誤定位能力（開放封閉原則）。

  設計要點：
    - 根元素渲染 :data-field="name"，供儲存失敗時 document.querySelector 聚焦第一個
      錯誤欄位使用（審查修訂 C-5 / FR-T-303）。
    - 錯誤訊息帶 :id，供輸入元件以 aria-describedby 關聯（NFR-T-02）。
-->
<template>
  <div :data-field="name">
    <!-- 用 span 而非 label：無 for 綁定的 label 是假語意，反而誤導輔助科技（NFR-T-02） -->
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
