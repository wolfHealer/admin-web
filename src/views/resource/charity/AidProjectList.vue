<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useTable, useCrudDialog } from '@/composables'
import AidProjectDialog from './components/AidProjectDialog.vue'
import AidProjectViewDialog from './components/AidProjectViewDialog.vue'
import {
  deleteReliefProject,
  getReliefProjectList,
  type ReliefProjectItem,
  type ReliefProjectListParams,
} from '@/api/resource/charity/project'

const router = useRouter()

const reliefTypeOptions = [
  { label: '医疗费用', value: 'medical_cost' },
  { label: '生活支持', value: 'living_support' },
  { label: '康复补贴', value: 'rehab_subsidy' },
  { label: '药品援助', value: 'drug_relief' },
  { label: '其他', value: 'other' },
]

const getReliefTypeText = (type?: string) => {
  const map: Record<string, string> = {
    medical_cost: '医疗费用',
    living_support: '生活支持',
    rehab_subsidy: '康复补贴',
    drug_relief: '药品援助',
    other: '其他',
  }
  return map[type || ''] || type || '-'
}

const getDifficultyText = (difficulty?: string) => {
  const map: Record<string, string> = {
    easy: '容易',
    medium: '中等',
    hard: '较难',
  }
  return map[difficulty || ''] || difficulty || '-'
}

const auditText = (status: number) => (status === 1 ? '已通过' : status === 2 ? '已驳回' : '待审核')
const auditTagType = (status: number) => (status === 1 ? 'success' : status === 2 ? 'danger' : 'warning')

const { loading, tableData, total, query, handleSearch, handleReset, refresh } = useTable<
  ReliefProjectItem,
  ReliefProjectListParams
>({
  initialQuery: () => ({
    page: 1,
    pageSize: 10,
    keyword: '',
    reliefType: '',
    applyDifficulty: '',
    auditStatus: '',
    diseaseId: '',
  }),
  fetchApi: async (params) => {
    const res = await getReliefProjectList(params)
    return res.data
  },
})

const {
  currentId,
  dialogVisible,
  viewVisible,
  openAdd,
  openEdit,
  openView,
  handleDelete,
} = useCrudDialog<ReliefProjectItem>({
  strategy: 'byId',
  getRowId: (row) => row.id,
  deleteItem: (row) => deleteReliefProject(row.id!),
  deleteMessage: (row) => `确认删除项目「${row.name}」吗？`,
  onSuccess: refresh,
})

const handleBack = () => router.push('/resource/charity')
</script>

<template>
  <div class="page-container">
    <el-card shadow="never" class="mb-16">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button link @click="handleBack" class="back-btn">
              <el-icon><ArrowLeft /></el-icon>
              返回公益救助中心
            </el-button>
            <span class="page-title">救助项目库</span>
          </div>
        </div>
      </template>

      <el-form :inline="true" :model="query">
        <el-form-item label="关键词">
          <el-input v-model="query.keyword" placeholder="项目名称/主办机构" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="救助类型">
          <el-select v-model="query.reliefType" placeholder="全部" clearable style="width: 180px">
            <el-option v-for="item in reliefTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="申请难度">
          <el-select v-model="query.applyDifficulty" placeholder="全部" clearable style="width: 140px">
            <el-option label="容易" value="easy" />
            <el-option label="中等" value="medium" />
            <el-option label="较难" value="hard" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="query.auditStatus" placeholder="全部" clearable style="width: 140px">
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已驳回" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <div class="flex-between">
          <span>列表数据</span>
          <el-button type="primary" @click="openAdd">新增项目</el-button>
        </div>
      </template>

      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="name" label="项目名称" min-width="220" show-overflow-tooltip />
        <el-table-column prop="organizer" label="主办机构" min-width="180" show-overflow-tooltip />
        <el-table-column label="救助类型" width="120">
          <template #default="{ row }">
            {{ getReliefTypeText(row.reliefType) }}
          </template>
        </el-table-column>
        <el-table-column label="申请难度" width="100">
          <template #default="{ row }">
            {{ getDifficultyText(row.applyDifficulty) }}
          </template>
        </el-table-column>
        <el-table-column label="截止日期" width="120">
          <template #default="{ row }">
            {{ row.applyDeadline || '长期有效' }}
          </template>
        </el-table-column>
        <el-table-column label="关联疾病" width="90">
          <template #default="{ row }">{{ row.diseaseIds?.length ?? 0 }}</template>
        </el-table-column>
        <el-table-column label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag :type="auditTagType(row.auditStatus ?? 1)">
              {{ auditText(row.auditStatus ?? 1) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80">
          <template #default="{ row }">{{ row.sort ?? 0 }}</template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180">
          <template #default="{ row }">{{ row.updatedAt || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openView(row)">查看</el-button>
            <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.pageSize"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="refresh"
          @current-change="refresh"
        />
      </div>
    </el-card>

    <AidProjectDialog v-model="dialogVisible" :project-id="currentId" @success="refresh" />
    <AidProjectViewDialog v-model="viewVisible" :project-id="currentId" />
  </div>
</template>

<style scoped>
.page-container { padding: 20px; }
.card-header { display: flex; align-items: center; justify-content: space-between; }
.header-left { display: flex; align-items: center; gap: 12px; }
.back-btn { font-size: 14px; color: #606266; padding: 0; }
.back-btn:hover { color: var(--el-color-primary); }
.page-title { font-weight: bold; font-size: 16px; }
.mb-16 { margin-bottom: 16px; }
.flex-between { display: flex; align-items: center; justify-content: space-between; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
