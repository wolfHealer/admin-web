<!-- src/views/resource/medical/CaseTemplate.vue -->
<template>
  <div class="case-template-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>病例模版</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增模版
          </el-button>
        </div>
      </template>

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索模版名称"
          clearable
          style="width: 200px"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select
          v-model="filters.department"
          placeholder="科室"
          clearable
          style="width: 150px"
          @change="handleSearch"
        >
          <el-option label="内科" value="内科" />
          <el-option label="外科" value="外科" />
          <el-option label="儿科" value="儿科" />
          <el-option label="妇产科" value="妇产科" />
          <el-option label="急诊科" value="急诊科" />
        </el-select>

        <el-select
          v-model="filters.disease"
          placeholder="适用病症"
          clearable
          style="width: 150px"
          @change="handleSearch"
        >
          <el-option label="高血压" value="高血压" />
          <el-option label="糖尿病" value="糖尿病" />
          <el-option label="冠心病" value="冠心病" />
          <el-option label="肺炎" value="肺炎" />
          <el-option label="骨折" value="骨折" />
        </el-select>

        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <!-- 表格 -->
      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="name" label="模版名称" min-width="180" />
        <el-table-column prop="code" label="模版编码" width="120" />
        <el-table-column prop="department" label="科室" width="100" />
        <el-table-column prop="disease" label="适用病症" min-width="120" />
        <el-table-column prop="version" label="版本" width="80" />
        <el-table-column prop="createTime" label="创建时间" width="140" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="warning" @click="handleCopy(row)">复制</el-button>
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

    <!-- 弹窗 -->
    <CaseTemplateDialog
      v-model="dialog.visible"
      :is-edit="dialog.isEdit"
      :data="dialog.data"
      @submit="submitData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, DocumentCopy } from '@element-plus/icons-vue'
import { 
  getCaseTemplateList,
  getCaseTemplateDetail,
  addCaseTemplate,
  updateCaseTemplate,
  deleteCaseTemplate,
  copyCaseTemplate
} from '@/api/resource/medical/caseTemplate'
import CaseTemplateDialog from './components/CaseTemplateDialog.vue'

const loading = ref(false)
const tableData = ref<any[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const filters = reactive({
  keyword: '',
  department: '',
  disease: ''
})

const dialog = reactive({
  visible: false,
  isEdit: false,
  data: null as any
})

const handleAdd = () => {
  dialog.isEdit = false
  dialog.data = { status: 1, version: '1.0' }
  dialog.visible = true
}

const handleEdit = async (row: any) => {
  try {
    const res = await getCaseTemplateDetail(row.id)
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
    const res = await getCaseTemplateDetail(row.id)
    if ((res as any).code === 200) {
      ElMessage.success('查看模版详情')
      // 可在此处打开详情弹窗
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

const handleCopy = async (row: any) => {
  await ElMessageBox.confirm(`确定要复制"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await copyCaseTemplate(row.id)
    ElMessage.success('复制成功')
    loadData()
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(`确定要删除"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await deleteCaseTemplate(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const submitData = async (formData: any) => {
  try {
    if (dialog.isEdit && formData.id) {
      await updateCaseTemplate(formData.id, formData)
    } else {
      await addCaseTemplate(formData)
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
  filters.department = ''
  filters.disease = ''
  handleSearch()
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getCaseTemplateList({
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
.case-template-page {
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