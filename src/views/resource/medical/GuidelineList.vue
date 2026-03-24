<!-- src/views/resource/medical/TreatmentGuideline.vue -->
<template>
  <div class="guideline-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>诊疗指南</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增指南
          </el-button>
        </div>
      </template>

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索指南名称"
          clearable
          style="width: 200px"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select
          v-model="filters.year"
          placeholder="版本年份"
          clearable
          style="width: 120px"
          @change="handleSearch"
        >
          <el-option label="2025" value="2025" />
          <el-option label="2024" value="2024" />
          <el-option label="2023" value="2023" />
          <el-option label="2022" value="2022" />
        </el-select>

        <el-select
          v-model="filters.org"
          placeholder="发布机构"
          clearable
          style="width: 150px"
          @change="handleSearch"
        >
          <el-option label="中华医学会" value="中华医学会" />
          <el-option label="中国医师协会" value="中国医师协会" />
          <el-option label="国家卫健委" value="国家卫健委" />
        </el-select>

        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <!-- 表格 -->
      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="title" label="指南名称" min-width="250" show-overflow-tooltip />
        <el-table-column prop="org" label="发布机构" min-width="180" show-overflow-tooltip />
        <el-table-column prop="year" label="版本" width="100" />
        <el-table-column prop="summary" label="摘要" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="发布时间" width="160">
          <template #default="{ row }">
            {{ row.createdAt ? formatDate(row.createdAt) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '停用' }}
            </el-tag>
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

      <!-- 分页 -->
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

    <!-- 编辑/新增弹窗 -->
    <GuidelineDialog
      v-model="dialog.visible"
      :is-edit="dialog.isEdit"
      :data="dialog.data"
      @submit="submitData"
    />

    <!-- 详情查看弹窗 -->
    <GuidelineViewDialog
      v-model="viewDialog.visible"
      :data="viewDialog.data"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { 
  getGuidelineList,
  getGuidelineDetail,
  addGuideline,
  updateGuideline,
  deleteGuideline
} from '@/api/resource/medical/guideline'
import GuidelineDialog from './components/GuidelineDialog.vue'
import GuidelineViewDialog from './components/GuidelineViewDialog.vue'

const loading = ref(false)
const tableData = ref<any[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const filters = reactive({
  keyword: '',
  year: '',
  org: ''
})

const dialog = reactive({
  visible: false,
  isEdit: false,
  data: null as any
})

const viewDialog = reactive({
  visible: false,
  data: {} as any
})

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const handleAdd = () => {
  dialog.isEdit = false
  dialog.data = { status: 1 }
  dialog.visible = true
}

const handleEdit = async (row: any) => {
  try {
    const res = await getGuidelineDetail(row.id)
    if ((res as any).code === 200) {
      dialog.isEdit = true
      dialog.data = { id: row.id, status: row.status, ...(res as any).data }
      dialog.visible = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

const handleView = async (row: any) => {
  try {
    const res = await getGuidelineDetail(row.id)
    if ((res as any).code === 200) {
      viewDialog.data = (res as any).data
      viewDialog.visible = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(`确定要删除"${row.title}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await deleteGuideline(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const submitData = async (formData: any) => {
  try {
    if (dialog.isEdit && formData.id) {
      await updateGuideline(formData.id, formData)
    } else {
      await addGuideline(formData)
    }
    ElMessage.success(dialog.isEdit ? '编辑成功' : '新增成功')
    loadData()
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
  filters.year = ''
  filters.org = ''
  handleSearch()
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getGuidelineList({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      keyword: filters.keyword,
      year: filters.year,
      org: filters.org
    })
    if ((res as any).code === 200 && (res as any).data) {
      tableData.value = (res as any).data.list || []
      pagination.total = (res as any).data.total || 0
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
.guideline-page {
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