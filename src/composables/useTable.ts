import { onMounted, onUnmounted, reactive, ref, watch, nextTick, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { PageParams, PageResult } from '@/types/api'
import { debounce } from '@/utils/debounce'

export interface UseTableOptions<T, Q extends PageParams> {
  /** 列表请求，返回 { list, total } */
  fetchApi: (params: Q) => Promise<PageResult<T>>
  /** 初始查询参数（必须包含 page、pageSize） */
  initialQuery: () => Q
  /** 是否在 onMounted 时自动加载，默认 true */
  immediate?: boolean
  /** 加载失败时的提示文案 */
  errorMessage?: string
  /**
   * 输入类筛选字段，变更后自动 debounce 搜索，默认 ['keyword']
   * 传 [] 可关闭；下拉框等仍用 @change="handleSearch" 即时触发
   */
  debounceSearchKeys?: Array<keyof Q>
  /** debounce 毫秒，默认 300 */
  debounceMs?: number
}

export function useTable<T, Q extends PageParams>(options: UseTableOptions<T, Q>) {
  const loading = ref(false)
  const tableData = ref<T[]>([]) as Ref<T[]>
  const total = ref(0)
  const query = reactive(options.initialQuery()) as Q

  const debounceKeys =
    options.debounceSearchKeys !== undefined
      ? options.debounceSearchKeys
      : (['keyword' as keyof Q])
  const debounceMs = options.debounceMs ?? 300

  let debounceWatchReady = false

  const loadData = async () => {
    loading.value = true
    try {
      const result = await options.fetchApi(query as Q)
      tableData.value = result.list ?? []
      total.value = result.total ?? 0
    } catch {
      if (options.errorMessage) {
        ElMessage.error(options.errorMessage)
      }
    } finally {
      loading.value = false
    }
  }

  const runSearch = () => {
    query.page = 1
    return loadData()
  }

  const debouncedSearch =
    debounceKeys.length > 0 ? debounce(() => runSearch(), debounceMs) : null

  /** 查询：重置到第一页并加载（按钮、下拉框、Enter、Clear 等即时触发） */
  const handleSearch = () => {
    debouncedSearch?.cancel()
    return runSearch()
  }

  /** 重置筛选条件并加载 */
  const handleReset = () => {
    debouncedSearch?.cancel()
    const initial = options.initialQuery()
    ;(Object.keys(initial) as Array<keyof Q>).forEach((key) => {
      query[key] = initial[key]
    })
    return loadData()
  }

  const refresh = () => loadData()

  if (debounceKeys.length > 0 && debouncedSearch) {
    watch(
      () => debounceKeys.map((key) => query[key]),
      (values) => {
        if (!debounceWatchReady) return
        const isEmpty = values.every(
          (v) => v === '' || v === null || v === undefined
        )
        if (isEmpty) {
          debouncedSearch.cancel()
          runSearch()
        } else {
          debouncedSearch()
        }
      }
    )
    onUnmounted(() => debouncedSearch.cancel())
  }

  onMounted(async () => {
    if (options.immediate !== false) {
      await loadData()
    }
    await nextTick()
    debounceWatchReady = true
  })

  return {
    loading,
    tableData,
    total,
    query,
    loadData,
    handleSearch,
    handleReset,
    refresh,
  }
}
