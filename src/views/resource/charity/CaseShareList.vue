<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeft, Plus } from '@element-plus/icons-vue'
import { useTable, useCrudDialog } from '@/composables'
import CaseShareDialog from './components/CaseShareDialog.vue'
import CaseShareViewDialog from './components/CaseShareViewDialog.vue'
import {
  deleteReliefCase,
  getReliefCaseList,
  type ReliefCaseItem,
  type ReliefCaseListParams,
} from '@/api/resource/charity/case'

const router = useRouter()

const auditText = (status: number) => (status === 1 ? '已通过' : status === 2 ? '已驳回' : '待审核')
const auditTagType = (status: number) => (status === 1 ? 'success' : status === 2 ? 'danger' : 'warning')

const { loading, tableData, total, query, handleSearch, handleReset, refresh } = useTable<
  ReliefCaseItem,
  ReliefCaseListParams
>({
  initialQuery: () => ({
    page: 1,
    pageSize: 10,
    keyword: '',
    diseaseId: '',
    projectId: '',
    auditStatus: '',
  }),
  fetchApi: async (params) => {
    const res = await getReliefCaseList(params)
    return res.data
  },
  errorMessage: '加载案例列表失败',
})

const {
  currentId,
  dialogVisible,
  viewVisible,
  openAdd,
  openEdit,
  openView,
  handleDelete,
} = useCrudDialog<ReliefCaseItem>({
  strategy: 'byId',
  getRowId: (row) => row.id,
  deleteItem: (row) => deleteReliefCase(row.id),
  deleteMessage: (row) => `确认删除「${row.caseTitle}」吗？`,
  onSuccess: refresh,
})

const handleBack = () => router.push('/resource/charity')
</script>

<template>
  <div class="page-container">
    <el-card shadow="never" class="search-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button link @click="handleBack" class="back-btn">
              <el-icon><ArrowLeft /></el-icon>
              返回公益救助中心
            </el-button>
            <span class="page-title">案例分享库</span>
          </div>
          <el-button type="primary" @click="openAdd">
            <el-icon><Plus /></el-icon>
            新增案例
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="query">
        <el-form-item label="关键词">
          <el-input
            v-model="query.keyword"
            placeholder="请输入案例标题"
            clearable
            @keyup.enter="handleSearch"
          />
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
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="caseTitle" label="案例标题" min-width="240" show-overflow-tooltip />
        <el-table-column prop="diseaseName" label="关联疾病" min-width="160" show-overflow-tooltip />
        <el-table-column prop="projectName" label="关联项目" min-width="220" show-overflow-tooltip />
        <el-table-column prop="applyCycle" label="申请周期" width="120" />
        <el-table-column prop="actualRelief" label="实际救助" min-width="160" show-overflow-tooltip />
        <el-table-column label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag :type="auditTagType(row.auditStatus)">
              {{ auditText(row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
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
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="refresh"
          @current-change="refresh"
        />
      </div>
    </el-card>

    <CaseShareDialog
      v-model="dialogVisible"
      :id="currentId ?? null"
      @success="refresh"
    />

    <CaseShareViewDialog
      v-model="viewVisible"
      :id="currentId ?? null"
    />
  </div>
</template>

<style scoped>
.page-container {
  padding: 16px;
}
.search-card {
  margin-bottom: 16px;
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
  font-size: 14px;
  color: #606266;
  padding: 0;
}

.back-btn:hover {
  color: var(--el-color-primary);
}

.page-title {
  font-weight: bold;
  font-size: 16px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
