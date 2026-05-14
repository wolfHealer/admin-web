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
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增机构
          </el-button>
        </div>
      </template>

      <div class="filter-bar">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索机构名称 / 康复项目"
          clearable
          style="width: 240px"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>

        <el-select v-model="filters.auditStatus" placeholder="审核状态" clearable style="width: 140px" @change="handleSearch">
          <el-option label="待审核" :value="0" />
          <el-option label="已通过" :value="1" />
          <el-option label="已驳回" :value="2" />
        </el-select>

        <el-select
          v-model="filters.diseaseId"
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
        
        <!-- 修改点：使用 diseaseIds 的长度作为关联疾病数，因为后端列表返回的是数组 -->
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
        
        <!-- 可选：显示评分或状态，如果后端返回了的话 -->
        <!-- <el-table-column prop="rating" label="评分" width="80" /> -->

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
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="loadData"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <RehabInstitutionDialog
      v-model="dialog.visible"
      :is-edit="dialog.isEdit"
      :data="dialog.data"
      @submit="submitData"
    />

    <RehabInstitutionViewDialog
      v-model="viewDialog.visible"
      :data="viewDialog.data"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import RehabInstitutionDialog from './components/RehabInstitutionDialog.vue'
import RehabInstitutionViewDialog from './components/RehabInstitutionViewDialog.vue'
import {
  deleteRehabInstitution,
  getRehabInstitutionDetail,
  getRehabInstitutionList,
  type DiseaseOption,
  type RehabInstitutionItem,
  searchDiseaseOptions,
} from '@/api/resource/rehab/rehabInstitution'

const router = useRouter()
const loading = ref(false)
const diseaseLoading = ref(false)
const tableData = ref<RehabInstitutionItem[]>([])
const diseaseOptions = ref<DiseaseOption[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

const filters = reactive({
  keyword: '',
  auditStatus: null as number | null,
  diseaseId: null as number | null,
})

const dialog = reactive({
  visible: false,
  isEdit: false,
  data: null as RehabInstitutionItem | null,
})

const viewDialog = reactive({
  visible: false,
  data: null as RehabInstitutionItem | null,
})

const handleBack = () => router.push('/resource/rehab')

const auditText = (status: number) => ({ 0: '待审核', 1: '已通过', 2: '已驳回' }[status as 0 | 1 | 2] || '-')
const auditTagType = (status: number) => ({ 0: 'warning', 1: 'success', 2: 'danger' }[status as 0 | 1 | 2] || 'info')

// 修改点：更健壮的地区格式化逻辑
const formatRegion = (row: RehabInstitutionItem) => {
  const parts = [row.provinceName, row.cityName, row.districtName].filter(Boolean)
  return parts.length > 0 ? parts.join(' / ') : '-'
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getRehabInstitutionList({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      keyword: filters.keyword || undefined,
      auditStatus: filters.auditStatus,
      diseaseId: filters.diseaseId,
    })
    // 确保数据结构正确
    tableData.value = res.data?.list || []
    pagination.total = res.data?.total || 0
  } catch (error) {
    console.error('加载数据失败', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const handleDiseaseSearch = async (keyword: string) => {
  if (!keyword) {
    diseaseOptions.value = []
    return
  }
  diseaseLoading.value = true
  try {
    diseaseOptions.value = await searchDiseaseOptions(keyword)
  } catch (error) {
    console.error('搜索疾病失败', error)
  } finally {
    diseaseLoading.value = false
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

const handleReset = () => {
  filters.keyword = ''
  filters.auditStatus = null
  filters.diseaseId = null
  pagination.currentPage = 1
  loadData()
}

const handleAdd = () => {
  dialog.isEdit = false
  dialog.data = null
  dialog.visible = true
}

const handleEdit = async (row: RehabInstitutionItem) => {
  try {
    const res = await getRehabInstitutionDetail(row.id)
    dialog.isEdit = true
    dialog.data = res.data
    dialog.visible = true
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

const handleView = async (row: RehabInstitutionItem) => {
  try {
    const res = await getRehabInstitutionDetail(row.id)
    viewDialog.data = res.data
    viewDialog.visible = true
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

const submitData = async () => {
  // 注意：这里只是关闭弹窗，实际成功消息应该在 Dialog 内部 emit 之前或者由 List 监听后统一处理
  // 如果 Dialog 内部已经发了 ElMessage，这里可以省略，或者保留作为双重保险
  // ElMessage.success(dialog.isEdit ? '保存成功' : '新增成功') 
  dialog.visible = false
  dialog.data = null
  loadData()
}

const handleDelete = async (row: RehabInstitutionItem) => {
  await ElMessageBox.confirm(`确定删除机构“${row.name}”吗？`, '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  })
  try {
    await deleteRehabInstitution(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    console.error('删除失败', error)
  }
}

onMounted(() => {
  loadData()
})
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