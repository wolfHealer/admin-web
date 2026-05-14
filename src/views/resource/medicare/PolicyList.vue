<!-- src/views/resource/charity/PolicyList.vue -->
<template>
  <div class="charity-list-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <!-- 新增：返回按钮区域 -->
          <div class="header-left">
            <el-button link @click="handleBack" class="back-btn">
              <el-icon><ArrowLeft /></el-icon>
              返回公益救助中心
            </el-button>
            <span class="page-title">医保政策解读</span>
          </div>
          
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增解读
          </el-button>
        </div>
      </template>

      <div class="filter-bar">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索政策标题"
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
          <el-option label="启用" :value="1" />
          <el-option label="停用" :value="0" />
        </el-select>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="title" label="政策标题" min-width="250" />
        <el-table-column prop="policyType" label="政策类型" width="120" />
        <el-table-column prop="region" label="适用地区" width="120" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="uploadTime" label="发布时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.uploadTime) }}
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

    <PolicyDialog
      v-model="dialog.visible"
      :is-edit="dialog.isEdit"
      :data="dialog.data"
      @submit="submitData"
    />

    <PolicyViewDialog
      v-model="viewDialog.visible"
      :data="viewDialog.data"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router' // 1. 引入 useRouter
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, ArrowLeft } from '@element-plus/icons-vue' // 2. 引入 ArrowLeft 图标
import { 
  getPolicyList,
  getPolicyDetail,
  addPolicy,
  updatePolicy,
  deletePolicy
} from '@/api/resource/medicare/policy'
import type { MedicarePolicy } from '@/api/resource/medicare/policy'
import PolicyDialog from './components/PolicyDialog.vue'
import PolicyViewDialog from './components/PolicyViewDialog.vue'

const router = useRouter() // 3. 初始化 router

const loading = ref(false)
const tableData = ref<MedicarePolicy[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const filters = reactive({
  keyword: '',
  status: null as number | null
})

const dialog = reactive({
  visible: false,
  isEdit: false,
  data: null as MedicarePolicy | null
})

const viewDialog = reactive({
  visible: false,
  data: null as MedicarePolicy | null
})

// 4. 新增返回方法
const handleBack = () => {
  router.push('/resource/medicare')
}

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

const handleAdd = () => {
  dialog.isEdit = false
  dialog.data = null
  dialog.visible = true
}

const handleEdit = async (row: MedicarePolicy) => {
  try {
    const res = await getPolicyDetail(row.id)
    if ((res as any).code === 200 || (res as any).code === 0) {
      dialog.isEdit = true
      dialog.data = (res as any).data
      dialog.visible = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

const handleView = async (row: MedicarePolicy) => {
  try {
    const res = await getPolicyDetail(row.id)
    if ((res as any).code === 200 || (res as any).code === 0) {
      viewDialog.data = (res as any).data
      viewDialog.visible = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

const handleDelete = async (row: MedicarePolicy) => {
  await ElMessageBox.confirm(`确定要删除"${row.title}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await deletePolicy(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const submitData = async (formData: MedicarePolicy) => {
  try {
    if (dialog.isEdit && formData.id) {
      await updatePolicy(formData.id, formData)
    } else {
      await addPolicy(formData)
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
    const res = await getPolicyList({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      keyword: filters.keyword,
      status: filters.status ?? undefined
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
.charity-list-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    // 新增样式：左侧布局
    .header-left {
      display: flex;
      align-items: center;
      gap: 15px;

      .back-btn {
        font-size: 14px;
        color: #606266;
        padding: 0;
        
        &:hover {
          color: var(--el-color-primary);
        }
        
        .el-icon {
          margin-right: 4px;
        }
      }

      .page-title {
        font-weight: bold;
        font-size: 16px;
      }
    }
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