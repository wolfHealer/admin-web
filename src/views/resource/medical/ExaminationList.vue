<template>
  <div class="examination-list-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button link @click="handleBack" class="back-btn">
              <el-icon><ArrowLeft /></el-icon>
              返回医疗资源首页
            </el-button>
            <span class="page-title">检查手册</span>
          </div>

          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增手册
          </el-button>
        </div>
      </template>

      <div class="filter-bar">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索检查名称/检查目的"
          clearable
          style="width: 240px"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <!-- 修改 value 为后端接受的枚举值 (如 lab, genetic 等) -->
        <el-select
          v-model="filters.examType"
          placeholder="检查类型"
          clearable
          style="width: 160px"
          @change="handleSearch"
        >
          <el-option label="实验室检查" value="lab" />
          <el-option label="代谢筛查" value="metabolic" />
          <el-option label="影像学检查" value="imaging" />
          <el-option label="基因检测" value="genetic" />
          <el-option label="病理检查" value="pathology" />
          <el-option label="功能检查" value="functional" />
          <el-option label="量表评估" value="scale" />
          <el-option label="专科专项检查" value="special" />
          <el-option label="其他" value="other" />
        </el-select>

        <!-- 修改 v-model 为 auditStatus 以保持一致性 -->
        <el-select
          v-model="filters.auditStatus"
          placeholder="审核状态"
          clearable
          style="width: 140px"
          @change="handleSearch"
        >
          <el-option label="待审核" :value="0" />
          <el-option label="已通过" :value="1" />
          <el-option label="已驳回" :value="2" />
        </el-select>

        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="examName" label="检查名称" min-width="220" show-overflow-tooltip />
        <el-table-column prop="examType" label="检查类型" width="120">
           <template #default="{ row }">
             <!-- 可选：如果需要将英文枚举转回中文显示，可在此处添加映射逻辑 -->
             {{ getExamTypeLabel(row.examType) }}
           </template>
        </el-table-column>
        <el-table-column prop="examPurpose" label="检查目的" min-width="260" show-overflow-tooltip />
        <el-table-column prop="institution" label="出具机构" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.institution || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="适用疾病数" width="110">
          <template #default="{ row }">
            {{ Array.isArray(row.diseaseIds) ? row.diseaseIds.length : 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="90">
          <template #default="{ row }">
            {{ row.sort ?? '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="auditStatus" label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getAuditTagType(row.auditStatus)">
              {{ getAuditText(row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
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
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <ExaminationDialog
      v-model="dialog.visible"
      :is-edit="dialog.isEdit"
      :data="dialog.data"
      @submit="submitData"
    />

    <ExaminationViewDialog
      v-model="viewDialog.visible"
      :data="viewDialog.data"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Plus, Search } from '@element-plus/icons-vue'
import {
  addExamination,
  deleteExamination,
  getExaminationDetail,
  getExaminationList,
  type ExaminationManualItem,
  updateExamination
} from '@/api/resource/medical/examination'
import ExaminationDialog from './components/ExaminationDialog.vue'
import ExaminationViewDialog from './components/ExaminationViewDialog.vue'

const router = useRouter()
const loading = ref(false)
const tableData = ref<any[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 修改 filters 的 key 为小驼峰，与后端参数保持一致，方便直接传递或映射
const filters = reactive({
  keyword: '',
  examType: '',      // 对应后端 examType
  auditStatus: null as number | null // 对应后端 auditStatus
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

// 辅助函数：将英文枚举转回中文显示（可选，根据需求决定是否需要）
const getExamTypeLabel = (type?: string) => {
  const map: Record<string, string> = {
    'lab': '实验室检查',
    'metabolic': '代谢筛查',
    'imaging': '影像学检查',
    'genetic': '基因检测',
    'pathology': '病理检查',
    'functional': '功能检查',
    'scale': '量表评估',
    'special': '专科专项检查',
    'other': '其他'
  }
  return type ? (map[type] || type) : '-'
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

const getAuditText = (status?: number) => {
  if (status === 1) return '已通过'
  if (status === 2) return '已驳回'
  return '待审核'
}

const getAuditTagType = (status?: number) => {
  if (status === 1) return 'success'
  if (status === 2) return 'danger'
  return 'warning'
}

const handleBack = () => {
  router.push('/resource/medical')
}

const handleAdd = () => {
  dialog.isEdit = false
  // 初始化数据，注意这里要符合 ExaminationDialog 期望的小驼峰结构
  dialog.data = {
    id: 0,
    examType: '',
    examName: '',
    examPurpose: '',
    referenceValue: '',
    abnormalInterpret: '',
    sampleNotes: '',
    institution: '',
    templates: {
      excel: '',
      word: '',
      compare: ''
    },
    auditStatus: 0,
    rejectReason: '',
    sort: 0,
    diseaseIds: []
  }
  dialog.visible = true
}

const handleEdit = async (row: any) => {
  try {
    const res = await getExaminationDetail(row.id)
    if ((res as any).code === 200) {
      dialog.isEdit = true
      dialog.data = (res as any).data
      dialog.visible = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

const handleView = async (row: any) => {
  try {
    const res = await getExaminationDetail(row.id)
    if ((res as any).code === 200) {
      viewDialog.data = (res as any).data
      viewDialog.visible = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

const handleDelete = async (row: any) => {
  const name = row.examName || '该项'
  await ElMessageBox.confirm(`确定要删除“${name}”吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })

  try {
    await deleteExamination(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const submitData = async (formData: any) => {
  try {
    if (formData.id && formData.id !== 0) {
      await updateExamination(formData.id, formData)
    } else {
      const payload = { ...formData }
      delete payload.id
      await addExamination(payload)
    }
    ElMessage.success(dialog.isEdit ? '编辑成功' : '新增成功')
    dialog.visible = false
    loadData()
  } catch (error) {
    console.error(error)
    ElMessage.error('操作失败')
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

const handleReset = () => {
  filters.keyword = ''
  filters.examType = ''
  filters.auditStatus = null
  handleSearch()
}

const loadData = async () => {
  loading.value = true
  try {
    // 构造符合后端要求的参数：小驼峰命名
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize, // 注意这里是 pageSize 而不是 page_size
      keyword: filters.keyword || undefined,
      examType: filters.examType || undefined, // 注意这里是 examType
      auditStatus: filters.auditStatus // 注意这里是 auditStatus
    }

    const res = await getExaminationList(params as any)
    
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

<style scoped>
.examination-list-page {
  padding: 0;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.back-btn {
  padding-left: 0;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>