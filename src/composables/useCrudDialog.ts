import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export interface UseCrudDialogOptions<TItem, TId = number> {
  /** 从行数据提取主键 */
  getRowId: (row: TItem) => TId | undefined
  /**
   * byId：弹窗组件通过 id 自行拉详情（如 UserDialog、AidProjectDialog）
   * byData：弹窗通过 data 属性接收完整对象（如 HospitalDialog）
   */
  strategy?: 'byId' | 'byData'
  /** 编辑/查看前拉取详情（byData 模式推荐传入） */
  fetchDetail?: (id: TId) => Promise<TItem>
  /** 删除请求 */
  deleteItem?: (row: TItem) => Promise<unknown>
  /** 删除确认文案 */
  deleteMessage?: (row: TItem) => string
  deleteTitle?: string
  /** 操作成功后的回调（通常传入 table.refresh） */
  onSuccess?: () => void
  messages?: {
    deleteSuccess?: string
    deleteError?: string
    fetchError?: string
  }
}

export function useCrudDialog<TItem, TId = number>(options: UseCrudDialogOptions<TItem, TId>) {
  const strategy = options.strategy ?? 'byId'
  const messages = {
    deleteSuccess: '删除成功',
    deleteError: '删除失败',
    fetchError: '获取详情失败',
    ...options.messages,
  }

  // byId 模式
  const currentId = ref<TId | undefined>()
  const dialogVisible = ref(false)
  const viewVisible = ref(false)

  // byData 模式（ref 包裹，避免 reactive 泛型赋值问题）
  const editDialog = ref({
    visible: false,
    isEdit: false,
    data: null as TItem | null,
  })
  const viewDialog = ref({
    visible: false,
    data: null as TItem | null,
  })

  const openAdd = () => {
    if (strategy === 'byId') {
      currentId.value = undefined
      dialogVisible.value = true
    } else {
      editDialog.value = { visible: true, isEdit: false, data: null }
    }
  }

  const openEdit = async (row: TItem) => {
    const id = options.getRowId(row)
    if (strategy === 'byId') {
      currentId.value = id
      dialogVisible.value = true
      return
    }
    try {
      const data =
        options.fetchDetail && id !== undefined ? await options.fetchDetail(id) : row
      editDialog.value = { visible: true, isEdit: true, data }
    } catch {
      ElMessage.error(messages.fetchError)
    }
  }

  const openView = async (row: TItem) => {
    const id = options.getRowId(row)
    if (strategy === 'byId') {
      currentId.value = id
      viewVisible.value = true
      return
    }
    try {
      const data =
        options.fetchDetail && id !== undefined ? await options.fetchDetail(id) : row
      viewDialog.value = { visible: true, data }
    } catch {
      ElMessage.error(messages.fetchError)
    }
  }

  const closeEdit = () => {
    if (strategy === 'byId') {
      dialogVisible.value = false
      currentId.value = undefined
    } else {
      editDialog.value = { visible: false, isEdit: false, data: null }
    }
  }

  const closeView = () => {
    if (strategy === 'byId') {
      viewVisible.value = false
      currentId.value = undefined
    } else {
      viewDialog.value = { visible: false, data: null }
    }
  }

  const handleDelete = async (row: TItem) => {
    if (!options.deleteItem) return
    const id = options.getRowId(row)
    if (id === undefined) return

    const message = options.deleteMessage?.(row) ?? '确定要删除该记录吗？'
    await ElMessageBox.confirm(message, options.deleteTitle ?? '提示', {
      type: 'warning',
      confirmButtonText: '确定',
      cancelButtonText: '取消',
    })

    try {
      await options.deleteItem(row)
      ElMessage.success(messages.deleteSuccess)
      options.onSuccess?.()
    } catch {
      ElMessage.error(messages.deleteError)
    }
  }

  return {
    strategy,
    currentId,
    dialogVisible,
    viewVisible,
    editDialog,
    viewDialog,
    openAdd,
    openEdit,
    openView,
    closeEdit,
    closeView,
    handleDelete,
  }
}
