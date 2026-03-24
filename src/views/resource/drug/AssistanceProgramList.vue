<!-- src/views/resource/drug/AssistanceProgramList.vue -->
<template>
  <div class="assistance-program-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>赠药/援助项目</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增项目
          </el-button>
        </div>
      </template>

      <!-- 筛选栏 -->
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
        
        <el-input
          v-model="filters.organizer"
          placeholder="组织机构"
          clearable
          style="width: 150px"
          @change="handleSearch"
        />

        <el-select
          v-model="filters.diseaseValue"
          placeholder="疾病类型"
          clearable
          style="width: 150px"
          @change="handleSearch"
        >
          <el-option label="非小细胞肺癌" :value="1" />
          <el-option label="血友病" :value="2" />
          <el-option label="戈谢病" :value="3" />
          <el-option label="乳腺癌" :value="4" />
        </el-select>

        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <!-- 表格 -->
      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="name" label="项目名称" min-width="250" show-overflow-tooltip />
        <el-table-column prop="organizer" label="组织机构" min-width="180" show-overflow-tooltip />
        <el-table-column prop="dosage" label="赠药剂量" min-width="180" show-overflow-tooltip />
        <el-table-column prop="period" label="援助周期" width="120" />
        <el-table-column label="申请资料" width="180">
          <template #default="{ row }">
            <el-link v-if="row.applyForm" :href="row.applyForm" target="_blank" type="primary" style="margin-right: 10px">
              申请表
            </el-link>
            <el-link v-if="row.applyGuide" :href="row.applyGuide" target="_blank" type="primary">
              指南
            </el-link>
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
    <AssistanceProgramDialog
      v-model="dialog.visible"
      :edit-data="dialog.data"
      @submit="submitData"
    />

    <!-- 详情查看弹窗 -->
    <AssistanceProgramViewDialog
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
  getAssistanceProgramList,
  getAssistanceProgramDetail,
  addAssistanceProgram,
  updateAssistanceProgram,
  deleteAssistanceProgram
} from '@/api/resource/drug/assistanceProgram'
import type { AssistanceProgramItem } from '@/api/resource/drug/assistanceProgram'
import AssistanceProgramDialog from './components/AssistanceProgramDialog.vue'
import AssistanceProgramViewDialog from './components/AssistanceProgramViewDialog.vue'

const loading = ref(false)
const tableData = ref<AssistanceProgramItem[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const filters = reactive({
  keyword: '',
  organizer: '',
  diseaseValue: null as number | null
})

const dialog = reactive({
  visible: false,
  data: null as AssistanceProgramItem | null
})

const viewDialog = reactive({
  visible: false,
  data: null as AssistanceProgramItem | null
})

// 新增
const handleAdd = () => {
  dialog.data = null
  dialog.visible = true
}

// 编辑
const handleEdit = async (row: AssistanceProgramItem) => {
  try {
    const res = await getAssistanceProgramDetail(row.id)
    if ((res as any).code === 200) {
      dialog.data = (res as any).data
      dialog.visible = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

// 查看
const handleView = async (row: AssistanceProgramItem) => {
  try {
    const res = await getAssistanceProgramDetail(row.id)
    if ((res as any).code === 200) {
      viewDialog.data = (res as any).data
      viewDialog.visible = true
    } else {
      ElMessage.error('获取详情失败')
    }
  } catch (error) {
    console.error('查看详情错误:', error)
    ElMessage.error('获取详情失败')
  }
}

// 删除
const handleDelete = async (row: AssistanceProgramItem) => {
  await ElMessageBox.confirm(`确定要删除"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await deleteAssistanceProgram(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 提交数据
const submitData = async (formData: AssistanceProgramItem) => {
  try {
    if (formData.id) {
      await updateAssistanceProgram(formData.id, formData)
    } else {
      await addAssistanceProgram(formData)
    }
    ElMessage.success(formData.id ? '编辑成功' : '新增成功')
    loadData()
    // 提交成功后关闭弹窗并清空数据
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
  filters.organizer = ''
  filters.diseaseValue = null
  handleSearch()
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getAssistanceProgramList({
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
.assistance-program-page {
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