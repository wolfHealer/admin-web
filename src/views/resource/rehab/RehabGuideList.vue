<template>
  <div class="rehab-guide-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button link @click="handleBack" class="back-btn">
              <el-icon><ArrowLeft /></el-icon>
              返回康复支持首页
            </el-button>
            <span class="page-title">康复训练指南</span>
          </div>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增指南
          </el-button>
        </div>
      </template>

      <div class="filter-bar">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索标题 / 训练目的"
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
          v-model="filters.rehabStage"
          placeholder="康复阶段"
          clearable
          style="width: 160px"
          @change="handleSearch"
        >
          <el-option v-for="item in rehabStageOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>

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

      <el-table :data="tableData" v-loading="loading" border>
        <el-table-column prop="title" label="指南标题" min-width="220" show-overflow-tooltip />
        <el-table-column label="康复阶段" width="120">
          <template #default="{ row }">
            <!-- 修改点：row.rehabStage -->
            {{ getRehabStageLabel(row.rehabStage) }}
          </template>
        </el-table-column>
        <!-- 修改点：prop="trainPurpose" -->
        <el-table-column prop="trainPurpose" label="训练目的" min-width="220" show-overflow-tooltip />
        <el-table-column label="适用疾病数" width="100">
          <template #default="{ row }">
            <!-- 修改点：row.diseaseCount 或 row.diseases?.length -->
            {{ row.diseaseCount ?? row.diseases?.length ?? 0 }}
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="审核状态" width="100">
          <template #default="{ row }">
            <!-- 修改点：row.auditStatus -->
            <el-tag :type="getAuditStatusType(row.auditStatus)">{{ getAuditStatusLabel(row.auditStatus) }}</el-tag>
          </template>
        </el-table-column>
        <!-- 修改点：prop="updatedAt" -->
        <el-table-column prop="updatedAt" label="更新时间" width="180" />
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
          :page-sizes="[10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <RehabGuideDialog
      v-model="dialog.visible"
      :edit-data="dialog.data"
      @submit="submitData"
    />

    <RehabGuideViewDialog
      v-model="viewDialog.visible"
      :view-data="viewDialog.data"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Plus, Search } from '@element-plus/icons-vue'
import RehabGuideDialog from './components/RehabGuideDialog.vue'
import RehabGuideViewDialog from './components/RehabGuideViewDialog.vue'
import {
  addRehabTrainGuide,
  deleteRehabTrainGuide,
  getRehabTrainGuideDetail,
  getRehabTrainGuideList,
  updateRehabTrainGuide,
  type RehabTrainGuideItem,
} from '@/api/resource/rehab/rehabGuide'

const router = useRouter()
const loading = ref(false)
const tableData = ref<RehabTrainGuideItem[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

// 修改点：过滤参数字段名改为小驼峰
const filters = reactive({
  keyword: '',
  rehabStage: '',
  auditStatus: '' as number | '',
})

const dialog = reactive({
  visible: false,
  data: null as RehabTrainGuideItem | null,
})

const viewDialog = reactive({
  visible: false,
  data: null as RehabTrainGuideItem | null,
})

const rehabStageOptions = [
  { label: '早期', value: 'early' },
  { label: '中期', value: 'middle' },
  { label: '晚期', value: 'late' },
  { label: '稳定期', value: 'stable' },
  { label: '进展期', value: 'progressive' },
]

const getRehabStageLabel = (value: string) => {
  return rehabStageOptions.find((item) => item.value === value)?.label || value || '-'
}

const getAuditStatusLabel = (value: number) => {
  return value === 1 ? '已通过' : value === 2 ? '已驳回' : '待审核'
}

const getAuditStatusType = (value: number) => {
  return value === 1 ? 'success' : value === 2 ? 'danger' : 'warning'
}

const handleBack = () => {
  router.push('/resource/rehab')
}

const handleAdd = () => {
  dialog.data = null
  dialog.visible = true
}

const handleEdit = async (row: RehabTrainGuideItem) => {
  try {
    const res = await getRehabTrainGuideDetail(row.id)
    dialog.data = res.data
    dialog.visible = true
  } catch {
    ElMessage.error('获取详情失败')
  }
}

const handleView = async (row: RehabTrainGuideItem) => {
  try {
    const res = await getRehabTrainGuideDetail(row.id)
    viewDialog.data = res.data
    viewDialog.visible = true
  } catch {
    ElMessage.error('获取详情失败')
  }
}

const handleDelete = async (row: RehabTrainGuideItem) => {
  await ElMessageBox.confirm(`确定删除“${row.title}”吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })

  try {
    await deleteRehabTrainGuide(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch {
    ElMessage.error('删除失败')
  }
}

const submitData = async (formData: RehabTrainGuideItem) => {
  try {
    if (formData.id) {
      await updateRehabTrainGuide(formData.id, formData)
      ElMessage.success('编辑成功')
    } else {
      await addRehabTrainGuide(formData)
      ElMessage.success('新增成功')
    }
    dialog.visible = false
    dialog.data = null
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
  filters.rehabStage = ''
  filters.auditStatus = ''
  handleSearch()
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getRehabTrainGuideList({
      page: pagination.currentPage,
      pageSize: pagination.pageSize, // 修改点：pageSize
      keyword: filters.keyword || undefined,
      rehabStage: filters.rehabStage || undefined, // 修改点：rehabStage
      auditStatus: filters.auditStatus, // 修改点：auditStatus
    })
    tableData.value = res.data?.list || []
    pagination.total = res.data?.total || 0
  } catch {
    ElMessage.error('加载列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<style lang="scss" scoped>
/* 样式保持不变 */
.rehab-guide-page {
  padding: 20px;
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .header-left {
    display: flex;
    align-items: center;
    gap: 8px;
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
}
</style>