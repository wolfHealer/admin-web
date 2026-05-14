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

          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增医生
          </el-button>
        </div>
      </template>

      <div class="filter-bar">
        <el-input
          v-model="filters.keyword"
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
          v-model="filters.department"
          placeholder="科室"
          clearable
          style="width: 140px"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        />

        <el-select
          v-model="filters.title"
          placeholder="职称"
          clearable
          style="width: 140px"
          @change="handleSearch"
        >
          <el-option v-for="item in titleOptions" :key="item" :label="item" :value="item" />
        </el-select>

        <!-- 注意：如果后端列表接口不支持按审核状态筛选，或者字段名不同，请调整此处 -->
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
        <el-table-column prop="name" label="医生姓名" min-width="120" fixed="left" />
        
        <el-table-column label="所属医院" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.hospital || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="department" label="科室" width="120" />
        <el-table-column prop="title" label="职称" width="120" />
        
        <!-- 映射 goodAt -->
        <el-table-column prop="goodAt" label="擅长领域" min-width="220" show-overflow-tooltip />
        
        <!-- 映射 clinicTime -->
        <el-table-column prop="clinicTime" label="门诊时间" min-width="180" show-overflow-tooltip />
        
        <el-table-column prop="contact" label="联系方式" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            {{ row.contact || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column label="评分/评价" width="120">
          <template #default="{ row }">
            <span>{{ row.rating ?? 0 }}</span>
            <span class="sub-text"> / {{ row.reviewCount ?? 0 }}</span>
          </template>
        </el-table-column>

        <!-- 映射 diseaseIds 长度 -->
        <el-table-column label="关联疾病" width="110">
          <template #default="{ row }">
            <el-tag size="small" type="info">{{ row.diseaseIds?.length || 0 }} 个</el-tag>
          </template>
        </el-table-column>

        <!-- 后端列表未返回 auditStatus，暂隐藏或显示默认。若需显示请确保后端返回该字段 -->
        <!-- 
        <el-table-column prop="auditStatus" label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getAuditTagType(row.auditStatus)">
              {{ getAuditText(row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column> 
        -->

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
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <DoctorDialog
      v-model="dialog.visible"
      :is-edit="dialog.isEdit"
      :data="dialog.data"
      @submit="submitData"
    />

    <DoctorViewDialog
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
  addDoctor,
  deleteDoctor,
  getDoctorDetail,
  getDoctorList,
  updateDoctor,
  type DoctorItem,
  type DoctorSubmitPayload
} from '@/api/resource/medical/doctor'
import DoctorDialog from './components/DoctorDialog.vue'
import DoctorViewDialog from './components/DoctorViewDialog.vue'

const router = useRouter()
const loading = ref(false)
const tableData = ref<any[]>([])

const titleOptions = ['主任医师', '副主任医师', '主治医师', '住院医师', '教授', '副教授']

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const filters = reactive({
  keyword: '',
  department: '',
  title: '',
  auditStatus: '' as '' | number
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

// 辅助函数保留，以备详情页或编辑页使用
const getAuditText = (status: number) => {
  if (status === undefined || status === null) return '-'
  const map: Record<number, string> = {
    0: '待审核',
    1: '已通过',
    2: '已驳回'
  }
  return map[status] || '未知'
}

const getAuditTagType = (status: number) => {
  if (status === undefined || status === null) return 'info'
  const map: Record<number, 'warning' | 'success' | 'danger' | 'info'> = {
    0: 'warning',
    1: 'success',
    2: 'danger'
  }
  return map[status] || 'info'
}

const handleBack = () => {
  router.push('/resource/medical')
}

const handleAdd = () => {
  dialog.isEdit = false
  // 初始化数据匹配后端提交字段 (通常为驼峰或蛇形，视 API 定义而定，此处假设与返回结构类似或需转换)
  // 注意：提交时通常使用 camelCase 或 snake_case，请根据 addDoctor 接口要求调整
  dialog.data = {
    id: 0,
    hospitalId: 0,
    name: '',
    title: '',
    department: '',
    goodAt: '', 
    clinicTime: '',
    contact: '',
    rating: 0,
    reviewCount: 0,
    auditStatus: 0,
    rejectReason: '',
    diseaseIds: []
  }
  dialog.visible = true
}

const handleEdit = async (row: any) => {
  try {
    const res = await getDoctorDetail(row.id)
    dialog.isEdit = true
    dialog.data = res.data
    dialog.visible = true
  } catch {
    ElMessage.error('获取医生详情失败')
  }
}

const handleView = async (row: any) => {
  try {
    const res = await getDoctorDetail(row.id)
    viewDialog.data = res.data
    viewDialog.visible = true
  } catch {
    ElMessage.error('获取医生详情失败')
  }
}

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(`确定要删除医生“${row.name}”吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })

  try {
    await deleteDoctor(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch {
    ElMessage.error('删除失败')
  }
}

const submitData = async (formData: any) => {
  try {
    if (dialog.isEdit && formData.id) {
      await updateDoctor(formData.id, formData)
    } else {
      await addDoctor(formData)
    }
    ElMessage.success(dialog.isEdit ? '编辑成功' : '新增成功')
    dialog.visible = false
    loadData()
  } catch {
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
  filters.title = ''
  filters.auditStatus = ''
  handleSearch()
}

const handleSizeChange = () => {
  pagination.currentPage = 1
  loadData()
}

const handleCurrentChange = () => {
  loadData()
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getDoctorList({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      keyword: filters.keyword || undefined,
      department: filters.department || undefined,
      title: filters.title || undefined,
      auditStatus: filters.auditStatus === '' ? undefined : filters.auditStatus
    })
    tableData.value = res.data?.list || []
    pagination.total = res.data?.total || 0
  } catch {
    ElMessage.error('加载医生列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
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