<template>
  <div class="assistance-program-page">
    <el-card>
      <!-- ... header 部分保持不变 ... -->
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button link @click="handleBack" class="back-btn">
              <el-icon><ArrowLeft /></el-icon>
              返回用药信息平台
            </el-button>
            <span class="page-title">赠药 / 援助项目</span>
          </div>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="援助项目管理" name="project">
          <div class="toolbar">
            <!-- ... 筛选栏保持不变 ... -->
            <div class="filter-bar">
              <el-input v-model="projectQuery.keyword" placeholder="搜索项目名称" clearable style="width: 220px" @clear="handleProjectSearch" />
              <el-input v-model="projectQuery.organizer" placeholder="主办方" clearable style="width: 180px" />
              <el-select v-model="projectQuery.auditStatus" placeholder="审核状态" clearable style="width: 140px">
                <el-option label="待审核" :value="0" />
                <el-option label="已通过" :value="1" />
                <el-option label="已驳回" :value="2" />
              </el-select>
              <el-button type="primary" @click="handleProjectSearch">查询</el-button>
              <el-button @click="handleProjectReset">重置</el-button>
            </div>
            <el-button type="primary" @click="handleProjectAdd">
              <el-icon><Plus /></el-icon>
              新增项目
            </el-button>
          </div>

                    <el-table :data="projectTableData" v-loading="projectLoading">
            <el-table-column prop="name" label="项目名称" min-width="240" show-overflow-tooltip />
            
            <!-- 关联药品 -->
            <el-table-column label="关联药品" min-width="180" show-overflow-tooltip>
              <template #default="{ row }">{{ row.drugName || '-' }}</template>
            </el-table-column>
            
            <!-- 关联疾病 -->
            <el-table-column prop="diseaseName" label="关联疾病" min-width="160" show-overflow-tooltip />
            
            <el-table-column prop="organizer" label="主办方" min-width="180" show-overflow-tooltip />
            <el-table-column prop="reliefCycle" label="援助周期" width="120" />
            
            <!-- 援助剂量 -->
            <el-table-column prop="reliefDosageDesc" label="援助剂量" min-width="160" show-overflow-tooltip />
            
            <!-- 【修改点1】审核状态：使用 auditStatus -->
            <el-table-column label="审核状态" width="100">
              <template #default="{ row }">
                <el-tag :type="auditTagType(row.auditStatus)">
                  {{ auditStatusText(row.auditStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <!-- 【修改点2】更新时间：使用 updatedAt 并格式化 -->
            <el-table-column label="更新时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.updatedAt) }}
              </template>
            </el-table-column>
            
            <el-table-column label="操作" width="220" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleProjectView(row)">查看</el-button>
                <el-button link type="primary" @click="handleProjectEdit(row)">编辑</el-button>
                <el-button link type="danger" @click="handleProjectDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="projectQuery.page"
              v-model:page-size="projectQuery.pageSize"
              :total="projectTotal"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="loadProjects"
              @current-change="loadProjects"
            />
          </div>
        </el-tab-pane>

        <!-- ... application tab 保持不变 ... -->
        <el-tab-pane label="援助申请管理" name="application">
           <!-- ... 内容同上，无需修改 ... -->
           <div class="toolbar">
            <div class="filter-bar">
              <el-input v-model="applicationQuery.keyword" placeholder="搜索患者姓名 / 电话" clearable style="width: 220px" @clear="handleApplicationSearch" />
              <el-select v-model="applicationQuery.status" placeholder="申请状态" clearable style="width: 140px">
                <el-option label="待审核" value="pending" />
                <el-option label="已通过" value="approved" />
                <el-option label="已驳回" value="rejected" />
                <el-option label="已完成" value="completed" />
              </el-select>
              <el-button type="primary" @click="handleApplicationSearch">查询</el-button>
              <el-button @click="handleApplicationReset">重置</el-button>
            </div>
            <el-button type="primary" @click="handleApplicationAdd">
              <el-icon><Plus /></el-icon>
              新增申请
            </el-button>
          </div>

          <el-table :data="applicationTableData" v-loading="applicationLoading">
            <el-table-column prop="project_name" label="援助项目" min-width="220" show-overflow-tooltip />
            <el-table-column prop="patient_name" label="患者姓名" width="120" />
            <el-table-column prop="patient_id_card_mask" label="证件号" min-width="160" />
            <el-table-column prop="contact_phone" label="联系电话" width="140" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }"><el-tag :type="applicationStatusType(row.auditStatus)">{{ applicationStatusText(row.auditStatus) }}</el-tag></template>
            </el-table-column>
            <el-table-column prop="submit_time" label="提交时间" width="180" />
            <el-table-column prop="review_time" label="审核时间" width="180" />
            <el-table-column label="操作" width="300" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleApplicationView(row)">查看</el-button>
                <el-button link type="primary" @click="handleApplicationEdit(row)">编辑</el-button>
                <el-button v-if="row.auditStatus === 0" link type="success" @click="handleApplicationReview(row, 'approved')">通过</el-button>
                <el-button v-if="row.auditStatus === 0" link type="warning" @click="handleApplicationReview(row, 'rejected')">驳回</el-button>
                <el-button link type="danger" @click="handleApplicationDelete(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="applicationQuery.page"
              v-model:page-size="applicationQuery.pageSize"
              :total="applicationTotal"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="loadApplications"
              @current-change="loadApplications"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <DonationProjectDialog v-model="projectDialog.visible" :edit-data="projectDialog.data" @submit="submitProjectData" />
    <DonationProjectViewDialog v-model="projectViewDialog.visible" :view-data="projectViewDialog.data" />
    <ReliefApplicationDialog v-model="applicationDialog.visible" :edit-data="applicationDialog.data" @submit="submitApplicationData" />
    <ReliefApplicationViewDialog v-model="applicationViewDialog.visible" :view-data="applicationViewDialog.data" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Plus } from '@element-plus/icons-vue'
import { useTable, useCrudDialog } from '@/composables'
import {
  addReliefApplication,
  addReliefProject,
  deleteReliefApplication,
  deleteReliefProject,
  getReliefApplicationDetail,
  getReliefApplicationList,
  getReliefApplicationLogs,
  getReliefProjectDetail,
  getReliefProjectList,
  reviewReliefApplication,
  updateReliefApplication,
  updateReliefProject,
  type ReliefApplicationItem,
  type DonationProjectForm,
  type ReliefProjectItem,
} from '@/api/resource/drug/donationProject'
import DonationProjectDialog from './components/DonationProjectDialog.vue'
import DonationProjectViewDialog from './components/DonationProjectViewDialog.vue'
import ReliefApplicationDialog from './components/ReliefApplicationDialog.vue'
import ReliefApplicationViewDialog from './components/ReliefApplicationViewDialog.vue'

type ReliefProjectRow = ReliefProjectItem

type ProjectQuery = {
  page: number
  pageSize: number
  keyword: string
  organizer: string
  auditStatus: number | null
}

type ApplicationQuery = {
  page: number
  pageSize: number
  keyword: string
  status: string | null
}

const router = useRouter()
const activeTab = ref<'project' | 'application'>('project')

const {
  loading: projectLoading,
  tableData: projectTableData,
  total: projectTotal,
  query: projectQuery,
  loadData: loadProjects,
  handleSearch: handleProjectSearch,
  handleReset: handleProjectReset,
  refresh: refreshProjects,
} = useTable<ReliefProjectRow, ProjectQuery>({
  initialQuery: () => ({
    page: 1,
    pageSize: 10,
    keyword: '',
    organizer: '',
    auditStatus: null,
  }),
  fetchApi: async (params) => {
    const res = await getReliefProjectList({
      page: params.page,
      pageSize: params.pageSize,
      keyword: params.keyword || undefined,
      organizer: params.organizer || undefined,
      auditStatus: params.auditStatus ?? undefined,
    })
    return res.data
  },
  errorMessage: '加载项目列表失败',
})

const {
  loading: applicationLoading,
  tableData: applicationTableData,
  total: applicationTotal,
  query: applicationQuery,
  loadData: loadApplications,
  handleSearch: handleApplicationSearch,
  handleReset: handleApplicationReset,
  refresh: refreshApplications,
} = useTable<ReliefApplicationItem, ApplicationQuery>({
  immediate: false,
  initialQuery: () => ({
    page: 1,
    pageSize: 10,
    keyword: '',
    status: null,
  }),
  fetchApi: async (params) => {
    const res = await getReliefApplicationList({
      page: params.page,
      pageSize: params.pageSize,
      keyword: params.keyword || undefined,
      status: params.status ?? undefined,
    })
    return res.data
  },
  errorMessage: '加载申请列表失败',
})

const {
  editDialog: projectDialog,
  viewDialog: projectViewDialog,
  openAdd: handleProjectAdd,
  openEdit: handleProjectEdit,
  openView: handleProjectView,
  handleDelete: handleProjectDelete,
} = useCrudDialog<ReliefProjectRow>({
  strategy: 'byData',
  getRowId: (row) => row.id,
  fetchDetail: async (id) => (await getReliefProjectDetail(id)).data,
  deleteItem: (row) => deleteReliefProject(row.id!),
  deleteMessage: (row) => `确定删除项目「${row.name}」吗？`,
  onSuccess: refreshProjects,
})

const {
  editDialog: applicationDialog,
  openAdd: handleApplicationAdd,
  openEdit: handleApplicationEdit,
  handleDelete: handleApplicationDelete,
} = useCrudDialog<ReliefApplicationItem>({
  strategy: 'byData',
  getRowId: (row) => row.id,
  fetchDetail: async (id) => (await getReliefApplicationDetail(id)).data,
  deleteItem: (row) => deleteReliefApplication(row.id!),
  deleteMessage: (row) => `确定删除申请「${row.patientName}」吗？`,
  onSuccess: refreshApplications,
})

const applicationViewDialog = ref<{
  visible: boolean
  data: (ReliefApplicationItem & { logs?: ReliefApplicationItem['logs'] }) | null
}>({
  visible: false,
  data: null,
})

const formatDate = (dateStr: string | undefined | null) => {
  if (!dateStr) return '-'
  try {
    const date = new Date(dateStr)
    return date
      .toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      .replace(/\//g, '-')
  } catch {
    return dateStr
  }
}

watch(activeTab, (val) => {
  if (val === 'project') loadProjects()
  else loadApplications()
})

const handleBack = () => router.push('/resource/drug')

const handleApplicationView = async (row: ReliefApplicationItem) => {
  try {
    const [detailRes, logsRes] = await Promise.all([
      getReliefApplicationDetail(row.id!),
      getReliefApplicationLogs(row.id!),
    ])
    applicationViewDialog.value = {
      visible: true,
      data: {
        ...detailRes.data,
        logs: logsRes.data || [],
      },
    }
  } catch {
    ElMessage.error('获取详情失败')
  }
}

const submitProjectData = async (formData: DonationProjectForm & { id?: number }) => {
  try {
    if (formData.id) await updateReliefProject(formData.id, formData)
    else await addReliefProject(formData)
    ElMessage.success(formData.id ? '编辑成功' : '新增成功')
    projectDialog.value.visible = false
    await refreshProjects()
  } catch {
    ElMessage.error('保存失败')
  }
}

const handleApplicationReview = async (row: ReliefApplicationItem, status: 'approved' | 'rejected') => {
  try {
    const result = await ElMessageBox.prompt(
      status === 'approved' ? '请输入审核备注' : '请输入驳回原因',
      status === 'approved' ? '审核通过' : '审核驳回',
      {
        inputType: 'textarea',
        inputPlaceholder: status === 'approved' ? '如：资料齐全，审核通过' : '请输入驳回原因',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }
    )

    const value = typeof result === 'object' && result !== null && 'value' in result ? result.value : ''

    await reviewReliefApplication(row.id!, {
      status,
      actionDesc: value || (status === 'approved' ? '审核通过' : '审核驳回'),
      rejectReason: status === 'rejected' ? value || '' : '',
    })

    ElMessage.success(status === 'approved' ? '已通过审核' : '已驳回申请')
    await refreshApplications()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const submitApplicationData = async (formData: ReliefApplicationItem) => {
  try {
    if (formData.id) await updateReliefApplication(formData.id, formData)
    else await addReliefApplication(formData)
    ElMessage.success(formData.id ? '编辑成功' : '新增成功')
    applicationDialog.value.visible = false
    await refreshApplications()
  } catch {
    ElMessage.error('保存失败')
  }
}

const auditStatusText = (status: number | undefined) => {
  if (status === undefined || status === null) return '-'
  return ({ 0: '待审核', 1: '已通过', 2: '已驳回' } as Record<number, string>)[status] || '-'
}

const auditTagType = (status: number | undefined) => {
  if (status === undefined || status === null) return 'info'
  return ({ 0: 'warning', 1: 'success', 2: 'danger' } as Record<number, string>)[status] || 'info'
}

const applicationStatusText = (status: string) =>
  ({ pending: '待审核', approved: '已通过', rejected: '已驳回', completed: '已完成' } as Record<string, string>)[status] ||
  status

const applicationStatusType = (status: string) =>
  ({ pending: 'warning', approved: 'success', rejected: 'danger', completed: 'info' } as Record<string, string>)[status] ||
  'info'
</script>

<style scoped>
.assistance-program-page { padding: 20px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.header-left { display: flex; align-items: center; gap: 12px; }
.page-title { font-size: 18px; font-weight: 600; }
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; gap: 12px; }
.filter-bar { display: flex; gap: 12px; flex-wrap: wrap; }
.pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>