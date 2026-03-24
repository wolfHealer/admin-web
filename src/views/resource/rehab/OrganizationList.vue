<!-- src/views/resource/rehab/organization/OrganizationList.vue -->
<template>
  <div class="organization-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>康复机构管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增机构
          </el-button>
        </div>
      </template>

      <div class="filter-bar">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索机构名称"
          clearable
          style="width: 200px"
          @clear="handleSearch"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        
        <el-select
          v-model="filters.region"
          placeholder="服务区域"
          clearable
          style="width: 150px"
          @change="handleSearch"
        >
          <el-option label="全国" value="全国" />
          <el-option label="北京" value="北京" />
          <el-option label="上海" value="上海" />
          <el-option label="广州" value="广州" />
          <el-option label="深圳" value="深圳" />
        </el-select>

        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="title" label="机构名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="organization" label="机构类型" width="150" />
        <el-table-column prop="region" label="服务区域" width="100" />
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

    <OrganizationDialog
      v-model="dialog.visible"
      :edit-data="dialog.data"
      @submit="submitData"
    />

    <OrganizationViewDialog
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
  getOrganizationList,
  getOrganizationDetail,
  addOrganization,
  updateOrganization,
  deleteOrganization,
  mapToOrganizationItem,
  mapToOrganizationResponse
} from '@/api/resource/rehab/organization'
import type { OrganizationItem, OrganizationResponse } from '@/api/resource/rehab/organization'
import OrganizationDialog from './components/OrganizationDialog.vue'
import OrganizationViewDialog from './components/OrganizationViewDialog.vue'

const loading = ref(false)
const tableData = ref<OrganizationItem[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const filters = reactive({
  keyword: '',
  region: ''
})

const dialog = reactive({
  visible: false,
  data: null as OrganizationItem | null
})

const viewDialog = reactive({
  visible: false,
  data: null as OrganizationItem | null
})

// 新增机构
const handleAdd = () => {
  // 确保数据为 null，触发新增模式
  dialog.data = null
  dialog.visible = true
}

// 编辑机构
const handleEdit = async (row: OrganizationItem) => {
  try {
    const res = await getOrganizationDetail(row.id)
    if (res.code === 200 && res.data) {
      dialog.data = mapToOrganizationItem(res.data)
      dialog.visible = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

// 查看详情
const handleView = async (row: OrganizationItem) => {
  try {
    const res = await getOrganizationDetail(row.id)
    if (res.code === 200 && res.data) {
      viewDialog.data = mapToOrganizationItem(res.data)
      viewDialog.visible = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

// 删除机构
const handleDelete = async (row: OrganizationItem) => {
  await ElMessageBox.confirm(`确定要删除"${row.title}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await deleteOrganization(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 提交数据（新增/编辑）
const submitData = async (formData: OrganizationItem) => {
  try {
    // 将前端格式转换为后端格式
    const submitData = mapToOrganizationResponse(formData)
    if (formData.id) {
      await updateOrganization(formData.id, submitData)
      ElMessage.success('编辑成功')
    } else {
      await addOrganization(submitData)
      ElMessage.success('新增成功')
    }
    loadData()
    dialog.visible = false
    dialog.data = null
  } catch (error) {
    ElMessage.error('操作失败')
  }
}
// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

// 重置搜索
const handleReset = () => {
  filters.keyword = ''
  filters.region = ''
  handleSearch()
}

// 加载列表数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getOrganizationList({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      ...filters
    })
    if (res.code === 200 && res.data) {
      // 使用映射函数转换数据
      tableData.value = res.data.list.map(item => mapToOrganizationItem(item))
      pagination.total = res.data.total || 0
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
.organization-page {
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