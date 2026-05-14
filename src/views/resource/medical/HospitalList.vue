
<template>
  <div class="hospital-list-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button link @click="handleBack" class="back-btn">
              <el-icon><ArrowLeft /></el-icon>
              返回医疗资源首页
            </el-button>
            <span class="page-title">医院管理</span>
          </div>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增医院
          </el-button>
        </div>
      </template>

      <div class="filter-bar">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索医院名称/诊疗范围"
          clearable
          style="width: 220px"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select v-model="filters.level" placeholder="医院等级" clearable style="width: 140px">
          <el-option v-for="item in levelOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>

        <el-select v-model="filters.isRareNetwork" placeholder="协作网" clearable style="width: 140px">
          <el-option label="罕见病协作网" :value="1" />
          <el-option label="非协作网" :value="0" />
        </el-select>

        <el-select v-model="filters.auditStatus" placeholder="审核状态" clearable style="width: 140px">
          <el-option label="待审核" :value="0" />
          <el-option label="已通过" :value="1" />
          <el-option label="已驳回" :value="2" />
        </el-select>

        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="name" label="医院名称" min-width="220" fixed="left" />

        <el-table-column label="地区" min-width="180">
          <template #default="{ row }">
            {{ formatRegion(row) }}
          </template>
        </el-table-column>

        <el-table-column prop="level" label="等级" width="100">
          <template #default="{ row }">
            <el-tag size="small">{{ getLevelText(row.level) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="isRareNetwork" label="协作网" width="110">
          <template #default="{ row }">
            <el-tag :type="row.isRareNetwork === 1 ? 'success' : 'info'" size="small">
              {{ row.isRareNetwork === 1 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="treatScope" label="诊疗范围" min-width="240" show-overflow-tooltip />
        <el-table-column prop="phone" label="联系电话" width="150" />

        <el-table-column label="关联疾病" width="120">
          <template #default="{ row }">
            {{ row.diseaseCount || row.diseases?.length || 0 }} 个
          </template>
        </el-table-column>

        <el-table-column prop="auditStatus" label="审核状态" width="110">
          <template #default="{ row }">
            <el-tag :type="getAuditTagType(row.auditStatus)" size="small">
              {{ getAuditText(row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="updatedAt" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.updatedAt) }}
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

    <HospitalDialog
      v-model="dialog.visible"
      :is-edit="dialog.isEdit"
      :data="dialog.data"
      @submit="submitData"
    />

    <HospitalViewDialog v-model="viewDialog.visible" :data="viewDialog.data" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Plus, Search } from '@element-plus/icons-vue'
import type { HospitalForm, HospitalItem } from '@/api/resource/medical/hospital'
import {
  addHospital,
  deleteHospital,
  getHospitalDetail,
  getHospitalList,
  updateHospital,
} from '@/api/resource/medical/hospital'
import HospitalDialog from './components/HospitalDialog.vue'
import HospitalViewDialog from './components/HospitalViewDialog.vue'

const router = useRouter()
const loading = ref(false)
const tableData = ref<HospitalItem[]>([])

const levelOptions = [
  { label: '三甲', value: '1' },
  { label: '三乙', value: '2' },
  { label: '三丙', value: '3' },
  { label: '二甲', value: '4' },
  { label: '二乙', value: '5' },
  { label: '二丙', value: '6' },
  { label: '其他', value: '7' }
]

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

const filters = reactive({
  keyword: '',
  level: '',
  isRareNetwork: '' as '' | number,
  auditStatus: '' as '' | number,
})

const dialog = reactive({
  visible: false,
  isEdit: false,
  data: null as HospitalItem | null,
})

const viewDialog = reactive({
  visible: false,
  data: null as HospitalItem | null,
})

// 【修改 2】根据 value (字符串) 获取 label (汉字)
const getLevelText = (level: string | number) => {
  // 确保比较时转为字符串，兼容可能的数字类型
  const option = levelOptions.find(item => item.value === String(level))
  return option ? option.label : '-'
}

const getAuditText = (status: number) => {
  const map: Record<number, string> = { 0: '待审核', 1: '已通过', 2: '已驳回' }
  return map[status] || '未知'
}

const getAuditTagType = (status: number) => {
  const map: Record<number, 'warning' | 'success' | 'danger' | 'info'> = {
    0: 'warning',
    1: 'success',
    2: 'danger',
  }
  return map[status] || 'info'
}

const formatRegion = (row: HospitalItem) => [row.provinceName, row.cityName, row.districtName].filter(Boolean).join(' / ') || '-'

const formatDateTime = (value?: string) => {
  if (!value) return '-'
  return new Date(value).toLocaleString('zh-CN', { hour12: false })
}

const handleBack = () => router.push('/resource/medical')

const handleAdd = () => {
  dialog.isEdit = false
  dialog.data = null
  dialog.visible = true
}

const handleEdit = async (row: HospitalItem) => {
  try {
    const res = await getHospitalDetail(row.id)
    dialog.isEdit = true
    dialog.data = res.data
    dialog.visible = true
  } catch {
    ElMessage.error('获取医院详情失败')
  }
}

const handleView = async (row: HospitalItem) => {
  try {
    const res = await getHospitalDetail(row.id)
    viewDialog.data = res.data
    viewDialog.visible = true
  } catch {
    ElMessage.error('获取医院详情失败')
  }
}

const handleDelete = async (row: HospitalItem) => {
  await ElMessageBox.confirm(`确定删除医院“${row.name}”吗？`, '删除确认', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  })
  try {
    await deleteHospital(row.id)
    ElMessage.success('删除成功')
    await loadData()
  } catch {
    ElMessage.error('删除失败')
  }
}

const submitData = async (formData: HospitalForm) => {
  try {
    if (dialog.isEdit && formData.id) {
      await updateHospital(formData.id, formData)
      ElMessage.success('编辑成功')
    } else {
      await addHospital(formData)
      ElMessage.success('新增成功')
    }
    dialog.visible = false
    await loadData()
  } catch {
    ElMessage.error('保存失败')
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

const handleReset = () => {
  filters.keyword = ''
  filters.level = ''
  filters.isRareNetwork = ''
  filters.auditStatus = ''
  pagination.currentPage = 1
  loadData()
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getHospitalList({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      keyword: filters.keyword || undefined,
      level: filters.level || undefined,
      isRareNetwork: filters.isRareNetwork,
      auditStatus: filters.auditStatus,
    })
    tableData.value = res.data.list || []
    pagination.total = res.data.total || 0
  } catch {
    ElMessage.error('加载医院列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.hospital-list-page {
  padding: 20px;

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
    padding: 0;
  }

  .page-title {
    font-size: 16px;
    font-weight: 700;
  }

  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 20px;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
}
</style>
