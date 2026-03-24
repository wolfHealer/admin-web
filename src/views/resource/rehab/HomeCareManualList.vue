<!-- src/views/resource/rehab/HomeCareManualList.vue -->
<template>
  <div class="home-care-manual-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>护理手册</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增手册
          </el-button>
        </div>
      </template>

      <div class="filter-bar">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索手册标题"
          clearable
          style="width: 200px"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select
          v-model="filters.category"
          placeholder="手册分类"
          clearable
          style="width: 150px"
          @change="handleSearch"
        >
          <el-option label="饮食指导" value="diet" />
          <el-option label="皮肤护理" value="skin" />
          <el-option label="口腔护理" value="oral" />
          <el-option label="康复训练" value="rehab" />
          <el-option label="卧床护理" value="bed" />
          <el-option label="用药指导" value="medication" />
          <el-option label="心理支持" value="psychology" />
        </el-select>

        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="title" label="手册标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="120">
          <template #default="{ row }">
            {{ getCategoryLabel(row.category) }}
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容摘要" min-width="300" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.content?.substring(0, 50) }}...
          </template>
        </el-table-column>
        <el-table-column prop="icon" label="图标" width="100" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="updateTime" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </el-card>

    <ManualDialog
      v-model="dialog.visible"
      :edit-data="dialog.data"
      @submit="submitData"
    />

    <ManualViewDialog
      v-model="viewDialog.visible"
      :view-data="viewDialog.data"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { 
  getManualList,
  getManualDetail,
  addManual,
  updateManual,
  deleteManual,
  ManualItem
} from '@/api/resource/rehab/manual'
import ManualDialog from './components/ManualDialog.vue'
import ManualViewDialog from './components/ManualViewDialog.vue'

const loading = ref(false)
const tableData = ref<ManualItem[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const filters = reactive({
  keyword: '',
  category: ''
})

const dialog = reactive({
  visible: false,
  data: null as ManualItem | null
})

const viewDialog = reactive({
  visible: false,
  data: null as ManualItem | null
})

// 分类标签映射
const getCategoryLabel = (category: string) => {
  const map: Record<string, string> = {
    diet: '饮食指导',
    skin: '皮肤护理',
    oral: '口腔护理',
    rehab: '康复训练',
    bed: '卧床护理',
    medication: '用药指导',
    psychology: '心理支持'
  }
  return map[category] || category
}

// 时间格式化
const formatTime = (timeStr: string) => {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN')
}

const handleAdd = () => {
  dialog.data = null
  dialog.visible = true
}

const handleEdit = async (row: ManualItem) => {
  try {
    const res = await getManualDetail(row.id)
    if ((res as any).code === 200) {
      dialog.data = (res as any).data
      dialog.visible = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

const handleView = async (row: ManualItem) => {
  try {
    const res = await getManualDetail(row.id)
    if ((res as any).code === 200) {
      viewDialog.data = (res as any).data
      viewDialog.visible = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

const handleDelete = async (row: ManualItem) => {
  await ElMessageBox.confirm(`确定要删除"${row.title}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await deleteManual(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const submitData = async (formData: ManualItem) => {
  try {
    if (formData.id) {
      await updateManual(formData.id, formData)
    } else {
      await addManual(formData)
    }
    ElMessage.success(formData.id ? '编辑成功' : '新增成功')
    loadData()
    dialog.visible = false
    dialog.data = null
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

const handleReset = () => {
  filters.keyword = ''
  filters.category = ''
  handleSearch()
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getManualList({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      ...filters
    })
    if ((res as any).code === 200 && (res as any).data) {
      tableData.value = (res as any).data.manuals || []
      pagination.total = (res as any).data.manuals?.length || 0
    }
  } catch (error) {
    ElMessage.error('加载列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.home-care-manual-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .filter-bar {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
}
</style>