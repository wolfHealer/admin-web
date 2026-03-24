<!-- src/views/resource/charity/ProjectList.vue -->
<template>
  <div class="charity-list-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>救助项目库</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增项目
          </el-button>
        </div>
      </template>

      <div class="filter-bar">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索项目名称"
          clearable
          style="width: 200px"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="filters.status"
          placeholder="状态筛选"
          clearable
          style="width: 120px"
          @change="handleSearch"
        >
          <el-option label="进行中" value="open" />
          <el-option label="已结束" value="closed" />
        </el-select>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="title" label="项目名称" min-width="250" />
        <el-table-column prop="org" label="发布机构" min-width="180" />
        <el-table-column prop="type" label="项目类型" width="120" />
        <el-table-column prop="amount" label="救助标准" width="200" show-overflow-tooltip />
        <el-table-column prop="difficulty" label="申请难度" width="100">
          <template #default="{ row }">
            <el-tag :type="getDifficultyType(row.difficulty)">
              {{ row.difficulty }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 'open' ? 'success' : 'info'">
              {{ row.status === 'open' ? '进行中' : '已结束' }}
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

    <ProjectDialog
      v-model="dialog.visible"
      :is-edit="dialog.isEdit"
      :data="dialog.data"
      @submit="submitData"
    />

    <ProjectViewDialog
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
  getProjectList,
  getProjectDetail,
  addProject,
  updateProject,
  deleteProject
} from '@/api/resource/charity/project'
import ProjectDialog from './components/ProjectDialog.vue'
import ProjectViewDialog from './components/ProjectViewDialog.vue'

// 定义项目数据类型（与新接口匹配）
interface ProjectData {
  id?: number
  title: string
  org: string
  desc: string
  status: 'open' | 'closed' | string
  type: string
  disease?: number
  amount: string
  difficulty: string
}

const loading = ref(false)
const tableData = ref<ProjectData[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const filters = reactive({
  keyword: '',
  status: null as string | null
})

const dialog = reactive({
  visible: false,
  isEdit: false,
  data: null as ProjectData | null
})

const viewDialog = reactive({
  visible: false,
  data: null as ProjectData | null
})

// 获取难度标签类型
const getDifficultyType = (difficulty: string) => {
  const typeMap: Record<string, string> = {
    '简单': 'success',
    '中等': 'warning',
    '复杂': 'danger'
  }
  return typeMap[difficulty] || 'info'
}

const handleAdd = () => {
  dialog.isEdit = false
  dialog.data = null
  dialog.visible = true
}

const handleEdit = async (row: ProjectData) => {
  try {
    const res = await getProjectDetail(row.id!)
    if ((res as any).code === 200 || (res as any).code === 0) {
      dialog.isEdit = true
      dialog.data = (res as any).data
      dialog.visible = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

const handleView = async (row: ProjectData) => {
  try {
    const res = await getProjectDetail(row.id!)
    if ((res as any).code === 200 || (res as any).code === 0) {
      viewDialog.data = (res as any).data
      viewDialog.visible = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

const handleDelete = async (row: ProjectData) => {
  await ElMessageBox.confirm(`确定要删除"${row.title}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await deleteProject(row.id!)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const submitData = async (formData: ProjectData) => {
  try {
    if (dialog.isEdit && formData.id) {
      await updateProject(formData.id, formData)
    } else {
      await addProject(formData)
    }
    ElMessage.success(dialog.isEdit ? '编辑成功' : '新增成功')
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
  filters.status = null
  handleSearch()
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getProjectList({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      keyword: filters.keyword,
      status: filters.status ?? undefined
    })
    // 适配新接口返回结构：data.list
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
.charity-list-page {
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