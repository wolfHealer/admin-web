<!-- src/views/resource/charity/RehabilitationGuideList.vue -->
<template>
  <div class="rehabilitation-guide-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>康复训练指南</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增指南
          </el-button>
        </div>
      </template>

      <div class="filter-bar">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索指南标题"
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
          placeholder="分类筛选"
          clearable
          style="width: 150px"
          @change="handleSearch"
        >
          <el-option label="肢体康复" value="肢体康复" />
          <el-option label="认知康复" value="认知康复" />
          <el-option label="言语康复" value="言语康复" />
        </el-select>

        <el-select
          v-model="filters.difficulty"
          placeholder="难度等级"
          clearable
          style="width: 120px"
          @change="handleSearch"
        >
          <el-option label="初级" value="初级" />
          <el-option label="中级" value="中级" />
          <el-option label="高级" value="高级" />
        </el-select>

        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="title" label="指南标题" min-width="250" show-overflow-tooltip />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="difficulty" label="难度" width="80" />
        <el-table-column prop="duration" label="训练时长" width="100" />
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

    <RehabilitationGuideDialog
      v-model="dialog.visible"
      :edit-data="dialog.data"
      @submit="submitData"
    />

    <RehabilitationGuideViewDialog
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
  getRehabilitationGuideList,
  getRehabilitationGuideDetail,
  addRehabilitationGuide,
  updateRehabilitationGuide,
  deleteRehabilitationGuide
} from '@/api/resource/rehab/rehabilitationGuide'
import type { RehabilitationGuideItem } from '@/api/resource/rehab/rehabilitationGuide'
import RehabilitationGuideDialog from './components/RehabilitationGuideDialog.vue'
import RehabilitationGuideViewDialog from './components/RehabilitationGuideViewDialog.vue'

const loading = ref(false)
const tableData = ref<RehabilitationGuideItem[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const filters = reactive({
  keyword: '',
  category: '',
  difficulty: ''
})

const dialog = reactive({
  visible: false,
  data: null as RehabilitationGuideItem | null
})

const viewDialog = reactive({
  visible: false,
  data: null as RehabilitationGuideItem | null
})

const handleAdd = () => {
  dialog.data = null
  dialog.visible = true
}

const handleEdit = async (row: RehabilitationGuideItem) => {
  try {
    const res = await getRehabilitationGuideDetail(row.id)
    if ((res as any).code === 200) {
      dialog.data = (res as any).data
      dialog.visible = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

const handleView = async (row: RehabilitationGuideItem) => {
  try {
    const res = await getRehabilitationGuideDetail(row.id)
    if ((res as any).code === 200) {
      viewDialog.data = (res as any).data
      viewDialog.visible = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

const handleDelete = async (row: RehabilitationGuideItem) => {
  await ElMessageBox.confirm(`确定要删除"${row.title}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await deleteRehabilitationGuide(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const submitData = async (formData: RehabilitationGuideItem) => {
  try {
    if (formData.id) {
      await updateRehabilitationGuide(formData.id, formData)
    } else {
      await addRehabilitationGuide(formData)
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
  filters.difficulty = ''
  handleSearch()
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getRehabilitationGuideList({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      ...filters
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
.rehabilitation-guide-page {
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