<template>
  <div class="policy-list-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button link @click="handleBack" class="back-btn">
              <el-icon><ArrowLeft /></el-icon>
              返回医保政策中心
            </el-button>
            <span class="page-title">医保政策解读</span>
          </div>

          <el-button type="primary" @click="openAdd">
            <el-icon><Plus /></el-icon>
            新增解读
          </el-button>
        </div>
      </template>

      <div class="filter-bar">
        <el-input
          v-model="query.keyword"
          placeholder="搜索政策标题"
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="query.status"
          placeholder="状态筛选"
          clearable
          style="width: 120px"
          @change="handleSearch"
        >
          <el-option label="启用" :value="1" />
          <el-option label="停用" :value="0" />
        </el-select>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="title" label="政策标题" min-width="250" />
        <el-table-column prop="policyType" label="政策类型" width="120" />
        <el-table-column prop="region" label="适用地区" width="120" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="uploadTime" label="发布时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.uploadTime) }}
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

    <PolicyDialog
      v-model="editDialog.visible"
      :is-edit="editDialog.isEdit"
      :data="editDialog.data"
      @submit="submitData"
    />

    <PolicyViewDialog
      v-model="viewDialog.visible"
      :data="viewDialog.data"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Search, ArrowLeft } from '@element-plus/icons-vue'
import { useTable, useCrudDialog } from '@/composables'
import {
  addPolicy,
  deletePolicy,
  getPolicyDetail,
  getPolicyList,
  updatePolicy,
  type MedicarePolicy,
} from '@/api/resource/medicare/policy'
import PolicyDialog from './components/PolicyDialog.vue'
import PolicyViewDialog from './components/PolicyViewDialog.vue'

type PolicyQuery = {
  page: number
  pageSize: number
  keyword: string
  status: number | ''
}

const router = useRouter()

const { loading, tableData, total, query, loadData, handleSearch, handleReset, refresh } = useTable<
  MedicarePolicy,
  PolicyQuery
>({
  initialQuery: () => ({
    page: 1,
    pageSize: 10,
    keyword: '',
    status: '',
  }),
  fetchApi: async (params) => {
    const res = await getPolicyList({
      page: params.page,
      pageSize: params.pageSize,
      keyword: params.keyword || undefined,
      status: params.status === '' ? undefined : String(params.status),
    })
    return res.data
  },
  errorMessage: '加载列表失败',
})

const { editDialog, viewDialog, openAdd, openEdit, openView, handleDelete } = useCrudDialog<MedicarePolicy>({
  strategy: 'byData',
  getRowId: (row) => row.id,
  fetchDetail: async (id) => (await getPolicyDetail(id)).data,
  deleteItem: (row) => deletePolicy(row.id),
  deleteMessage: (row) => `确定要删除「${row.title}」吗？`,
  onSuccess: refresh,
})

const handleBack = () => router.push('/resource/medicare')

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

const submitData = async (formData: MedicarePolicy) => {
  try {
    if (editDialog.value.isEdit && formData.id) {
      await updatePolicy(formData.id, formData)
      ElMessage.success('编辑成功')
    } else {
      await addPolicy(formData)
      ElMessage.success('新增成功')
    }
    editDialog.value.visible = false
    await refresh()
  } catch {
    ElMessage.error('操作失败')
  }
}
</script>

<style lang="scss" scoped>
.policy-list-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .header-left {
      display: flex;
      align-items: center;
      gap: 15px;

      .back-btn {
        font-size: 14px;
        color: #606266;
        padding: 0;

        &:hover {
          color: var(--el-color-primary);
        }

        .el-icon {
          margin-right: 4px;
        }
      }

      .page-title {
        font-weight: bold;
        font-size: 16px;
      }
    }
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
