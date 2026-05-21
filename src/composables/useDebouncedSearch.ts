import { nextTick, onMounted, onUnmounted, watch } from 'vue'
import { debounce } from '@/utils/debounce'

function isEmptyValue(value: unknown): boolean {
  return value === '' || value === null || value === undefined
}

/** 监听筛选字段变化并 debounce 触发搜索（用于未使用 useTable 的页面） */
export function useDebouncedSearch(
  getValues: () => unknown[],
  onSearch: () => void,
  delay = 300
): void {
  let ready = false
  const debounced = debounce(onSearch, delay)

  watch(getValues, (values) => {
    if (!ready) return
    if (values.every(isEmptyValue)) {
      debounced.cancel()
      onSearch()
    } else {
      debounced()
    }
  })

  onMounted(async () => {
    await nextTick()
    ready = true
  })

  onUnmounted(() => debounced.cancel())
}

export { debounce } from '@/utils/debounce'
