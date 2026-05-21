<template>
  <div class="rehab-institution-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button link @click="handleBack" class="back-btn">
              <el-icon><ArrowLeft /></el-icon>
              返回康复支持首页
            </el-button>
            <span class="page-title">康复支持机构管理</span>
          </div>
          <el-button type="primary" @click="openAdd">
            <el-icon><Plus /></el-icon>
            新增机构
          </el-button>
        </div>
      </template>

      <div class="filter-bar">
        <el-input
          v-model="query.keyword"
          placeholder="搜索机构名称 / 康复项目"
          clearable
          style="width: 240px"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>

        <el-select v-model="query.auditStatus" placeholder="审核状态" clearable style="width: 140px" @change="handleSearch">
          <el-option label="待审核" :value="0" />
          <el-option label="已通过" :value="1" />
          <el-option label="已驳回" :value="2" />
        </el-select>

        <el-select
          v-model="query.diseaseId"
          filterable
          remote
          reserve-keyword
          clearable
          style="width: 240px"
          placeholder="按疾病筛选"
          :remote-method="handleDiseaseSearch"
          :loading="diseaseLoading"
          @change="handleSearch"
        >
          <el-option
            v-for="item in diseaseOptions"
            :key="item.id"
            :label="item.alias ? `${item.name}（${item.alias}）` : item.name"
            :value="item.id"
          />
        </el-select>

        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="name" label="机构名称" min-width="220" show-overflow-tooltip />
        <el-table-column label="所在地区" min-width="180">
          <template #default="{ row }">
            {{ formatRegion(row) }}
          </template>
        </el-table-column>
        <el-table-column prop="contactPhone" label="联系电话" width="140" />
        <el-table-column label="关联疾病数" width="110">
          <template #default="{ row }">
            {{ row.diseaseIds ? row.diseaseIds.length : (row.diseaseCount || '-') }}
          </template>
        </el-table-column>
        <el-table-column prop="auditStatus" label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag :type="auditTagType(row.auditStatus)">{{ auditText(row.auditStatus) }}</el-tag>
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

    <RehabInstitutionDialog
      v-model="editDialog.visible"
      :is-edit="editDialog.isEdit"
      :data="editDialog.data"
      @submit="submitData"
    />

    <RehabInstitutionViewDialog
      v-model="viewDialog.visible"
      :data="viewDialog.data"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Plus, Search } from '@element-plus/icons-vue'
import { useTable, useCrudDialog } from '@/composables'
import RehabInstitutionDialog from './components/RehabInstitutionDialog.vue'
import RehabInstitutionViewDialog from './components/RehabInstitutionViewDialog.vue'
import {
  deleteRehabInstitution,
  getRehabInstitutionDetail,
  getRehabInstitutionList,
  type DiseaseOption,
  type RehabInstitutionItem,
  type RehabInstitutionListParams,
  searchDiseaseOptions,
} from '@/api/resource/rehab/rehabInstitution'

type InstitutionQuery = RehabInstitutionListParams & {
  auditStatus?: number | null
  diseaseId?: number | null
}

const router = useRouter()
const diseaseLoading = ref(false)
const diseaseOptions = ref<DiseaseOption[]>([])

const { loading, tableData, total, query, loadData, handleSearch, handleReset, refresh } = useTable<
  RehabInstitutionItem,
  InstitutionQuery
>({
  initialQuery: () => ({
    page: 1,
    pageSize: 10,
    keyword: '',
    auditStatus: null,
    diseaseId: null,
  }),
  fetchApi: async (params) => {
    const res = await getRehabInstitutionList({
      page: params.page,
      pageSize: params.pageSize,
      keyword: params.keyword || undefined,
      auditStatus: params.auditStatus,
      diseaseId: params.diseaseId,
    })
    return res.data
  },
  errorMessage: '加载数据失败',
})

const { editDialog, viewDialog, openAdd, openEdit, openView, handleDelete } = useCrudDialog<RehabInstitutionItem>({
  strategy: 'byData',
  getRowId: (row) => row.id,
  fetchDetail: async (id) => (await getRehabInstitutionDetail(id)).data,
  deleteItem: (row) => deleteRehabInstitution(row.id),
  deleteMessage: (row) => `确定删除机构「${row.name}」吗？`,
  onSuccess: refresh,
})

const handleBack = () => router.push('/resource/rehab')

const auditText = (status: number) => ({ 0: '待审核', 1: '已通过', 2: '已驳回' }[status as 0 | 1 | 2] || '-')
const auditTagType = (status: number) => ({ 0: 'warning', 1: 'success', 2: 'danger' }[status as 0 | 1 | 2] || 'info')

const formatRegion = (row: RehabInstitutionItem) => {
  const parts = [row.provinceName, row.cityName, row.districtName].filter(Boolean)
  return parts.length > 0 ? parts.join(' / ') : '-'
}

const handleDiseaseSearch = async (keyword: string) => {
  if (!keyword) {
    diseaseOptions.value = []
    return
  }
  diseaseLoading.value = true
  try {
    diseaseOptions.value = await searchDiseaseOptions(keyword)
  } finally {
    diseaseLoading.value = false
  }
}

const submitData = async () => {
  editDialog.value.visible = false
  editDialog.value.data = null
  await refresh()
}
</script>

<style scoped>
.rehab-institution-page {
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
