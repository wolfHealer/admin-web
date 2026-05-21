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

          <el-button type="primary" @click="openAdd">
            <el-icon><Plus /></el-icon>
            新增手册
          </el-button>
        </div>
      </template>

      <div class="filter-bar">
        <el-input
          v-model="query.keyword"
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

        <el-select
          v-model="query.examType"
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

        <el-select
          v-model="query.auditStatus"
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
            {{ getExamTypeLabel(row.examType) }}
          </template>
        </el-table-column>
        <el-table-column prop="examPurpose" label="检查目的" min-width="260" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.examPurpose || row.exam_purpose || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="institution" label="出具机构" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.institution || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="适用疾病数" width="110">
          <template #default="{ row }">
            {{ Array.isArray(row.diseaseIds || row.disease_ids) ? (row.diseaseIds || row.disease_ids).length : 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="90">
          <template #default="{ row }">
            {{ row.sort ?? '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="auditStatus" label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getAuditTagType(row.auditStatus ?? row.audit_status)">
              {{ getAuditText(row.auditStatus ?? row.audit_status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt || row.created_at || row.updatedAt || row.updated_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openView(row)">查看</el-button>
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <ExaminationDialog
      v-model="editDialog.visible"
      :is-edit="editDialog.isEdit"
      :data="editDialog.data"
      @submit="submitData"
    />

    <ExaminationViewDialog
      v-model="viewDialog.visible"
      :data="viewDialog.data"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Plus, Search } from '@element-plus/icons-vue'
import { useTable, useCrudDialog } from '@/composables'
import {
  addExamination,
  deleteExamination,
  getExaminationDetail,
  getExaminationList,
  type ExaminationManualItem,
  type ExaminationManualListParams,
  updateExamination,
} from '@/api/resource/medical/examination'
import ExaminationDialog from './components/ExaminationDialog.vue'
import ExaminationViewDialog from './components/ExaminationViewDialog.vue'

type ExamRow = ExaminationManualItem

const router = useRouter()

const { loading, tableData, total, query, loadData, handleSearch, handleReset, refresh } = useTable<
  ExamRow,
  ExaminationManualListParams
>({
  initialQuery: () => ({
    page: 1,
    pageSize: 10,
    keyword: '',
    examType: '',
    auditStatus: null,
  }),
  fetchApi: async (params) => (await getExaminationList(params)).data,
  errorMessage: '加载列表失败',
})

const { editDialog, viewDialog, openAdd, openEdit, openView, handleDelete } = useCrudDialog<ExamRow>({
  strategy: 'byData',
  getRowId: (row) => row.id,
  fetchDetail: async (id) => (await getExaminationDetail(id)).data,
  deleteItem: (row) => deleteExamination(row.id),
  deleteMessage: (row) => `确定要删除「${row.examName || '该项'}」吗？`,
  onSuccess: refresh,
})

const getExamTypeLabel = (type?: string) => {
  const map: Record<string, string> = {
    lab: '实验室检查',
    metabolic: '代谢筛查',
    imaging: '影像学检查',
    genetic: '基因检测',
    pathology: '病理检查',
    functional: '功能检查',
    scale: '量表评估',
    special: '专科专项检查',
    other: '其他',
  }
  return type ? map[type] || type : '-'
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

const handleBack = () => router.push('/resource/medical')

const submitData = async (formData: any) => {
  try {
    if (formData.id && formData.id !== 0) {
      await updateExamination(formData.id, formData)
    } else {
      const payload = { ...formData }
      delete payload.id
      await addExamination(payload)
    }
    ElMessage.success(editDialog.value.isEdit ? '编辑成功' : '新增成功')
    editDialog.value.visible = false
    await refresh()
  } catch {
    ElMessage.error('操作失败')
  }
}
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
