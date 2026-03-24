<!-- src/views/resource/drug/ManagementToolList.vue -->
<template>
  <div class="management-tool-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用药管理工具</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增工具
          </el-button>
        </div>
      </template>

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索工具名称"
          clearable
          style="width: 200px"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select
          v-model="filters.toolType"
          placeholder="工具类型"
          clearable
          style="width: 150px"
          @change="handleSearch"
        >
          <el-option label="用药记录" value="用药记录" />
          <el-option label="储存指南" value="储存指南" />
          <el-option label="用药提醒" value="用药提醒" />
        </el-select>

        <el-select
          v-model="filters.diseaseValue"
          placeholder="疾病类型"
          clearable
          style="width: 150px"
          @change="handleSearch"
        >
          <el-option label="糖尿病" :value="1" />
          <el-option label="高血压" :value="2" />
          <el-option label="哮喘" :value="4" />
        </el-select>

        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <!-- 表格 -->
      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="title" label="工具名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="toolType" label="工具类型" width="120" />
        <el-table-column prop="description" label="描述" min-width="300" show-overflow-tooltip />
        <el-table-column label="文件" min-width="200">
          <template #default="{ row }">
            <el-link
              v-for="file in row.files"
              :key="file.downloadUrl"
              :href="file.downloadUrl"
              target="_blank"
              type="primary"
              style="margin-right: 10px"
            >
              <el-icon><Document /></el-icon>
              {{ file.fileType }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="120" />
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
    <ManagementToolDialog
      v-model="dialog.visible"
      :is-edit="dialog.isEdit"
      :data="dialog.data"
      @submit="submitData"
    />

    <!-- 详情查看弹窗 -->
    <ManagementToolViewDialog
      v-model="viewDialog.visible"
      :data="viewDialog.data"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Document } from '@element-plus/icons-vue'
import { 
  getManagementToolList,
  getManagementToolDetail,
  addManagementTool,
  updateManagementTool,
  deleteManagementTool,
  type ManagementToolItem
} from '@/api/resource/drug/managementTool'
import ManagementToolDialog from './components/ManagementToolDialog.vue'
import ManagementToolViewDialog from './components/ManagementToolViewDialog.vue'

const loading = ref(false)
const tableData = ref<ManagementToolItem[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const filters = reactive({
  keyword: '',
  toolType: '',
  diseaseValue: null as number | null
})

const dialog = reactive({
  visible: false,
  isEdit: false,
  data: null as ManagementToolItem | null
})

const viewDialog = reactive({
  visible: false,
  data: null as ManagementToolItem | null
})

// 新增
const handleAdd = () => {
  dialog.isEdit = false
  dialog.data = null
  dialog.visible = true
}

// 编辑
const handleEdit = async (row: ManagementToolItem) => {
  try {
    const res = await getManagementToolDetail(row.id)
    if ((res as any).code === 200) {
      dialog.isEdit = true
      dialog.data = (res as any).data
      dialog.visible = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

// 查看
const handleView = async (row: ManagementToolItem) => {
  try {
    const res = await getManagementToolDetail(row.id)
    if ((res as any).code === 200) {
      viewDialog.data = (res as any).data
      viewDialog.visible = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

// 删除
const handleDelete = async (row: ManagementToolItem) => {
  await ElMessageBox.confirm(`确定要删除"${row.title}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await deleteManagementTool(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 提交数据
const submitData = async (formData: ManagementToolItem) => {
  try {
    if (dialog.isEdit && formData.id) {
      await updateManagementTool(formData.id, formData)
    } else {
      await addManagementTool(formData)
    }
    ElMessage.success(dialog.isEdit ? '编辑成功' : '新增成功')
    dialog.visible = false
    dialog.data = null
    loadData()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

// 重置
const handleReset = () => {
  filters.keyword = ''
  filters.toolType = ''
  filters.diseaseValue = null
  handleSearch()
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getManagementToolList({
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
.management-tool-page {
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