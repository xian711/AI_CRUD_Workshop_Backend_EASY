<!--
  AppAddressPicker — 台灣結構化地址選擇器（縣市 → 鄉鎮市區 → 路名/街道 → 門牌巷弄）

  - 縣市 / 鄉鎮市區：USelectMenu 可搜尋下拉，鄉鎮市區依縣市 lazy-load。
  - 路名 / 街道：可搜尋 combobox，輸入即篩選；查無相符仍可直接沿用輸入內容。
  - 門牌 / 段巷弄號：純文字輸入。
  - 四個欄位各自 v-model（v-model:county / :township / :road / :detail），
    方便綁到扁平表單欄位或編輯暫存，不需重構既有資料結構。

  使用：
    <AppAddressPicker
      v-model:county="form.county"
      v-model:township="form.township"
      v-model:road="form.road"
      v-model:detail="form.detail"
    />
-->
<template>
  <!-- inline：四欄並排成一列（可換行），用於篩選列；預設 stacked：縣市/鄉鎮兩欄一排、路名與門牌各自整列 -->
  <div :class="inline ? 'flex flex-wrap items-end gap-sm' : ''">
    <!-- 縣市 + 鄉鎮市區：stacked 為 2 欄 grid；inline 用 display:contents 讓兩欄直接成為外層 flex 子項 -->
    <div :class="inline ? 'contents' : 'grid grid-cols-2 gap-sm'">
      <USelectMenu
        :model-value="county"
        :options="countyOptions"
        placeholder="縣市"
        searchable
        searchable-placeholder="搜尋縣市"
        :class="inline ? 'w-36' : 'w-full'"
        @update:model-value="onCounty"
      />
      <USelectMenu
        :model-value="township"
        :options="townshipOptions"
        placeholder="鄉鎮市區"
        searchable
        searchable-placeholder="搜尋鄉鎮市區"
        :disabled="!canSelectTownship"
        :class="inline ? 'w-36' : 'w-full'"
        @update:model-value="onTownship"
      />
    </div>

    <!-- 路名/街道：可搜尋下拉，輸入即篩選；查無相符仍可直接沿用輸入內容 -->
    <div class="relative" :class="inline ? 'w-56' : 'w-full mt-sm'">
      <UInput
        :model-value="road"
        :placeholder="inline ? '路名 / 街道' : '路名 / 街道（輸入可篩選，查無可直接填）'"
        :disabled="!canSelectRoad"
        icon="i-heroicons-magnifying-glass"
        autocomplete="off"
        class="w-full"
        @update:model-value="(v: string) => emit('update:road', v)"
        @focus="roadMenuOpen = true"
        @blur="roadMenuOpen = false"
      />
      <div
        v-if="roadMenuOpen && canSelectRoad && roadOptions.length"
        class="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto rounded-lg border border-outline-variant bg-surface shadow-lg py-1"
      >
        <template v-if="filteredRoadOptions.length">
          <button
            v-for="r in filteredRoadOptions"
            :key="r"
            type="button"
            class="block w-full text-left px-sm py-1.5 text-body-medium text-on-surface hover:bg-surface-variant transition-colors"
            :class="r === road ? 'bg-surface-variant font-emphasis' : ''"
            @mousedown.prevent="selectRoad(r)"
          >{{ r }}</button>
        </template>
        <div v-else class="px-sm py-2 text-label-small text-on-surface-variant">
          查無「{{ road }}」，將直接沿用此輸入
        </div>
      </div>
    </div>

    <!-- 門牌列：右側 detail-suffix slot 可放「存為常用地點」等行動按鈕，與輸入框同排 -->
    <div class="flex items-center gap-xs" :class="inline ? 'w-44' : 'mt-sm'">
      <UInput
        :model-value="detail"
        :placeholder="inline ? '門牌 / 段巷弄號' : '門牌 / 段巷弄號（例：439號 B1）'"
        :class="inline ? 'w-full' : 'flex-1'"
        @update:model-value="(v: string) => emit('update:detail', v)"
      />
      <slot name="detail-suffix" />
    </div>

    <p v-if="showHint && hint" class="text-label-small text-on-surface-variant" :class="inline ? 'basis-full' : 'mt-xs'">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { COUNTY_NAMES, loadTownships, loadRoads } from '~/utils/taiwanAddress'

const props = withDefaults(defineProps<{
  county: string
  township: string
  road: string
  detail: string
  /** 是否顯示「請先選縣市…」提示文字 */
  showHint?: boolean
  /** inline：四欄並排成單列（篩選列用）；預設 false 為堆疊式（表單用） */
  inline?: boolean
}>(), {
  showHint: true,
  inline: false,
})

const emit = defineEmits<{
  'update:county': [value: string]
  'update:township': [value: string]
  'update:road': [value: string]
  'update:detail': [value: string]
}>()

const countyOptions = COUNTY_NAMES
const townshipOptions = ref<string[]>([])
const roadOptions = ref<string[]>([])

const canSelectTownship = computed(() => !!props.county)
const canSelectRoad = computed(() => canSelectTownship.value && !!props.township)

const hint = computed(() => {
  if (!props.county) return '請先選縣市，再選鄉鎮市區與路名。'
  if (!props.township) return '請先選鄉鎮市區，再選路名。'
  return ''
})

// 縣市改變才清下層；程式化載入既有值（編輯）時不會觸發，避免清掉已填欄位
function onCounty(value: string) {
  emit('update:county', value)
  emit('update:township', '')
  emit('update:road', '')
}
function onTownship(value: string) {
  emit('update:township', value)
  emit('update:road', '')
}

// 路名 combobox
const roadMenuOpen = ref(false)
const filteredRoadOptions = computed(() => {
  const kw = (props.road || '').trim()
  return kw ? roadOptions.value.filter(r => r.includes(kw)) : roadOptions.value
})
function selectRoad(r: string) {
  emit('update:road', r)
  roadMenuOpen.value = false
}

// 縣市 / 鄉鎮市區改變 → 重載下層清單（loadTownships/loadRoads 內部有快取）
// 路名資料未產出前 loadRoads 回傳空陣列，路名欄位仍可自填，不會壞畫面
watch(
  [() => props.county, () => props.township],
  async ([county, township]) => {
    townshipOptions.value = county ? (await loadTownships(county)).map(t => t.name) : []
    roadOptions.value = county && township ? await loadRoads(county, township) : []
  },
  { immediate: true },
)
</script>
