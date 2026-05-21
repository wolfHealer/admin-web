<template>
  <div class="doctor-list-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button link @click="handleBack" class="back-btn">
              <el-icon><ArrowLeft /></el-icon>
              返回医疗资源首页
            </el-button>
            <span class="page-title">医生名录</span>
          </div>

          <el-button type="primary" @click="openAdd">
            <el-icon><Plus /></el-icon>
            新增医生
          </el-button>
        </div>
      </template>

      <div class="filter-bar">
        <el-input
          v-model="query.keyword"
          placeholder="搜索医生姓名/擅长领域"
          clearable
          style="width: 220px"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-input
          v-model="query.department"
          placeholder="科室"
          clearable
          style="width: 140px"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />

        <el-select
          v-model="query.title"
          placeholder="职称"
          clearable
          style="width: 140px"
          @change="handleSearch"
        >
          <el-option v-for="item in titleOptions" :key="item" :label="item" :value="item" />
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
        <el-table-column prop="name" label="医生姓名" min-width="120" fixed="left" />

        <el-table-column label="所属医院" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.hospital || row.hospitalName || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="department" label="科室" width="120" />
        <el-table-column prop="title" label="职称" width="120" />
        <el-table-column prop="goodAt" label="擅长领域" min-width="220" show-overflow-tooltip />
        <el-table-column prop="clinicTime" label="门诊时间" min-width="180" show-overflow-tooltip />

        <el-table-column prop="contact" label="联系方式" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.contact || '-' }}
          </template>
        </el-table-column>

        <el-table-column label="评分/评价" width="120">
          <template #default="{ row }">
            <span>{{ row.rating ?? row.score ?? 0 }}</span>
            <span class="sub-text"> / {{ row.reviewCount ?? row.commentNum ?? 0 }}</span>
          </template>
        </el-table-column>

        <el-table-column label="关联疾病" width="110">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.diseaseIds?.length || 0 }} 个</el-tag>
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

    <DoctorDialog
      v-model="editDialog.visible"
      :is-edit="editDialog.isEdit"
      :data="editDialog.data"
      @submit="submitData"
    />

    <DoctorViewDialog
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
  addDoctor,
  deleteDoctor,
  getDoctorDetail,
  getDoctorList,
  updateDoctor,
  type DoctorItem,
  type DoctorListParams,
} from '@/api/resource/medical/doctor'
import DoctorDialog from './components/DoctorDialog.vue'
import DoctorViewDialog from './components/DoctorViewDialog.vue'

type DoctorQuery = DoctorListParams & {
  auditStatus?: number | ''
}

const router = useRouter()
const titleOptions = ['主任医师', '副主任医师', '主治医师', '住院医师', '教授', '副教授']

const { loading, tableData, total, query, loadData, handleSearch, handleReset, refresh } = useTable<
  DoctorItem,
  DoctorQuery
>({
  initialQuery: () => ({
    page: 1,
    pageSize: 10,
    keyword: '',
    department: '',
    title: '',
    auditStatus: '',
  }),
  fetchApi: async (params) => {
    const res = await getDoctorList({
      page: params.page,
      pageSize: params.pageSize,
      keyword: params.keyword || undefined,
      department: params.department || undefined,
      title: params.title || undefined,
      auditStatus: params.auditStatus === '' ? undefined : params.auditStatus,
    })
    return res.data
  },
  errorMessage: '加载医生列表失败',
  debounceSearchKeys: ['keyword', 'department'],
})

const { editDialog, viewDialog, openAdd, openEdit, openView, handleDelete } = useCrudDialog<DoctorItem>({
  strategy: 'byData',
  getRowId: (row) => row.id,
  fetchDetail: async (id) => (await getDoctorDetail(id)).data,
  deleteItem: (row) => deleteDoctor(row.id),
  deleteMessage: (row) => `确定要删除医生「${row.name}」吗？`,
  onSuccess: refresh,
})

const handleBack = () => router.push('/resource/medical')

const submitData = async (formData: {
  id?: number
  hospitalId: number | null
  name: string
  title: string
  department: string
  goodAt: string
  clinicTime: string
  contact?: string
  diseaseIds: number[]
  auditStatus: number
  rejectReason?: string
}) => {
  try {
    if (editDialog.value.isEdit && formData.id) {
      await updateDoctor(formData.id, formData)
    } else {
      await addDoctor(formData)
    }
    ElMessage.success(editDialog.value.isEdit ? '编辑成功' : '新增成功')
    editDialog.value.visible = false
    await refresh()
  } catch {
    ElMessage.error('操作失败')
  }
}
</script>

<style lang="scss" scoped>
.doctor-list-page {
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
        padding: 0;
        color: #606266;

        &:hover {
          color: var(--el-color-primary);
        }
      }

      .page-title {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }
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

  .sub-text {
    color: #909399;
    font-size: 12px;
  }
}
</style>
