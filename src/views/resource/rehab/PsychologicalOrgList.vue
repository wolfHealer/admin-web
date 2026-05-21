<template>
  <div class="psych-org-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button link @click="handleBack" class="back-btn">
              <el-icon><ArrowLeft /></el-icon>
              返回康复支持首页
            </el-button>
            <span class="page-title">心理支持管理</span>
          </div>
        </div>
      </template>

      <el-form :inline="true" :model="query" class="filter-bar">
        <el-form-item label="关键词">
          <el-input
            v-model="query.keyword"
            placeholder="机构名称/简介"
            clearable
            style="width: 240px"
            @keyup.enter="handleSearch"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
        </el-form-item>
        <el-form-item label="咨询方式">
          <el-select v-model="query.consultWay" clearable placeholder="全部" style="width: 140px">
            <el-option label="线上" value="online" />
            <el-option label="线下" value="offline" />
            <el-option label="线上+线下" value="both" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否免费">
          <el-select v-model="query.isFree" clearable placeholder="全部" style="width: 120px">
            <el-option label="是" :value="1" />
            <el-option label="否" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="query.auditStatus" clearable placeholder="全部" style="width: 140px">
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已驳回" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" plain @click="openAdd">
            <el-icon><Plus /></el-icon>
            新增机构
          </el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="tableData">
        <el-table-column prop="name" label="机构名称" min-width="180" show-overflow-tooltip />
        <el-table-column label="区域" min-width="180">
          <template #default="{ row }">{{ formatRegion(row) }}</template>
        </el-table-column>
        <el-table-column prop="consultWay" label="咨询方式" width="120" />
        <el-table-column label="是否免费" width="100">
          <template #default="{ row }">
            {{ row.isFree === 1 ? '是' : row.isFree === 0 ? '否' : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="contactPhone" label="联系电话" width="140" />
        <el-table-column label="关联疾病数" width="110">
          <template #default="{ row }">
            {{ Array.isArray(row.diseaseIds) ? row.diseaseIds.length : 0 }}
          </template>
        </el-table-column>
        <el-table-column label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag :type="auditTagType(row.auditStatus)">{{ auditText(row.auditStatus) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" width="170" />
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

    <PsychOrgDialog ref="orgDialogRef" @success="refresh" />
    <PsychOrgViewDialog ref="orgViewRef" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Plus, Search } from '@element-plus/icons-vue'
import { useTable, useCrudDialog } from '@/composables'
import {
  deletePsychOrg,
  getPsychOrgList,
  type PsychOrgItem,
  type PsychOrgListParams,
} from '@/api/resource/rehab/psychologicalOrg'
import PsychOrgDialog from './components/PsychologicalOrgDialog.vue'
import PsychOrgViewDialog from './components/PsychologicalOrgViewDialog.vue'

const router = useRouter()
const orgDialogRef = ref<InstanceType<typeof PsychOrgDialog>>()
const orgViewRef = ref<InstanceType<typeof PsychOrgViewDialog>>()

const auditText = (v: number) => (v === 1 ? '已通过' : v === 2 ? '已驳回' : '待审核')
const auditTagType = (v: number) => (v === 1 ? 'success' : v === 2 ? 'danger' : 'warning')

const formatRegion = (row: PsychOrgItem) =>
  [row.provinceName, row.cityName, row.districtName].filter(Boolean).join(' / ') || '-'

const { loading, tableData, total, query, loadData, handleSearch, handleReset, refresh } = useTable<
  PsychOrgItem,
  PsychOrgListParams
>({
  initialQuery: () => ({
    page: 1,
    pageSize: 10,
    keyword: '',
    consultWay: '',
    isFree: '',
    auditStatus: '',
  }),
  fetchApi: async (params) => (await getPsychOrgList(params)).data,
  errorMessage: '加载机构列表失败',
})

const { handleDelete } = useCrudDialog<PsychOrgItem>({
  getRowId: (row) => row.id,
  deleteItem: (row) => deletePsychOrg(row.id),
  deleteMessage: (row) => `确认删除机构「${row.name}」吗？`,
  onSuccess: refresh,
})

const handleBack = () => router.push('/resource/rehab')

const openAdd = () => orgDialogRef.value?.open('create')
const openEdit = (row: PsychOrgItem) => orgDialogRef.value?.open('update', row.id)
const openView = (row: PsychOrgItem) => orgViewRef.value?.open(row.id)
</script>

<style scoped>
.psych-org-page {
  padding: 16px;
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
.page-title {
  font-size: 18px;
  font-weight: 600;
}
.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
