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
              <el-input v-model="projectFilters.keyword" placeholder="搜索项目名称" clearable style="width: 220px" @clear="loadProjects" />
              <el-input v-model="projectFilters.organizer" placeholder="主办方" clearable style="width: 180px" />
              <!-- 注意：如果接口不支持按状态筛选，这里可能需要移除或调整 -->
              <el-select v-model="projectFilters.audit_status" placeholder="审核状态" clearable style="width: 140px">
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
              v-model:current-page="projectPagination.currentPage"
              v-model:page-size="projectPagination.pageSize"
              :total="projectPagination.total"
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
              <el-input v-model="applicationFilters.keyword" placeholder="搜索患者姓名 / 电话" clearable style="width: 220px" @clear="loadApplications" />
              <el-select v-model="applicationFilters.status" placeholder="申请状态" clearable style="width: 140px">
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
              v-model:current-page="applicationPagination.currentPage"
              v-model:page-size="applicationPagination.pageSize"
              :total="applicationPagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="loadApplications"
              @current-change="loadApplications"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- ... Dialogs 保持不变 ... -->
    <DonationProjectDialog v-model="projectDialog.visible" :edit-data="projectDialog.data" @submit="submitProjectData" />
    <DonationProjectViewDialog v-model="projectViewDialog.visible" :view-data="projectViewDialog.data" />
    <ReliefApplicationDialog v-model="applicationDialog.visible" :edit-data="applicationDialog.data" @submit="submitApplicationData" />
    <ReliefApplicationViewDialog v-model="applicationViewDialog.visible" :view-data="applicationViewDialog.data" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Plus } from '@element-plus/icons-vue'
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
  // 注意：这里可能需要更新 ReliefProjectItem 的定义以匹配新接口，或者使用 any 临时规避
  type ReliefProjectItem 
} from '@/api/resource/drug/donationProject'
import DonationProjectDialog from './components/DonationProjectDialog.vue'
import DonationProjectViewDialog from './components/DonationProjectViewDialog.vue'
import ReliefApplicationDialog from './components/ReliefApplicationDialog.vue'
import ReliefApplicationViewDialog from './components/ReliefApplicationViewDialog.vue'

const router = useRouter()
const activeTab = ref<'project' | 'application'>('project')

const projectLoading = ref(false)
const applicationLoading = ref(false)
// 如果类型不匹配，可以先暂时断言为 any[] 调试，或者更新 API 类型定义
const projectTableData = ref<any[]>([]) 
const applicationTableData = ref<ReliefApplicationItem[]>([])

const projectPagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })
const applicationPagination = reactive({ currentPage: 1, pageSize: 10, total: 0 })

const projectFilters = reactive({ keyword: '', organizer: '', audit_status: null as number | null })
const applicationFilters = reactive({ keyword: '', status: null as string | null })

const projectDialog = reactive({ visible: false, data: null as any })
const projectViewDialog = reactive({ visible: false, data: null as any })
const applicationDialog = reactive({ visible: false, data: null as ReliefApplicationItem | null })
const applicationViewDialog = reactive({ visible: false, data: null as ReliefApplicationItem | null })



// ... 其他导入和逻辑保持不变 ...

// 【新增】日期格式化函数
const formatDate = (dateStr: string | undefined | null) => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    // 格式化为 YYYY-MM-DD HH:mm:ss
    return date.toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    }).replace(/\//g, '-');
  } catch (e) {
    return dateStr; // 如果解析失败，返回原字符串
  }
}


// ... 其他函数保持不变 ...

watch(activeTab, (val) => {
  if (val === 'project') loadProjects()
  else loadApplications()
})

onMounted(() => {
  loadProjects()
})

const handleBack = () => router.push('/resource/drug')

const loadProjects = async () => {
  projectLoading.value = true
  try {
    const res = await getReliefProjectList({
      page: projectPagination.currentPage,
      pageSize: projectPagination.pageSize,
      keyword: projectFilters.keyword || undefined,
      organizer: projectFilters.organizer || undefined,
      auditStatus: projectFilters.audit_status
    })
    
    // 关键修改：根据提供的 JSON 结构解析数据
    // 假设 res 的结构是 { code: 200, data: { list: [], total: 2, page: 1 }, message: "success" }
    const responseData = (res as any).data;
    
    if (responseData) {
      projectTableData.value = responseData.list || []
      projectPagination.total = responseData.total || 0
      
      // 如果需要，可以同步当前页码，防止后端返回的页码与前端不一致
      // projectPagination.currentPage = responseData.page || 1
    } else {
      projectTableData.value = []
      projectPagination.total = 0
    }
  } catch (error) {
    console.error("Load projects failed:", error);
    ElMessage.error("加载项目列表失败");
  } finally {
    projectLoading.value = false
  }
}

const loadApplications = async () => {
  applicationLoading.value = true
  try {
    const res = await getReliefApplicationList({
      page: applicationPagination.currentPage,
      pageSize: applicationPagination.pageSize,
      keyword: applicationFilters.keyword || undefined,
      status: applicationFilters.status
    })
    applicationTableData.value = (res as any).data?.list || []
    applicationPagination.total = (res as any).data?.total || 0
  } finally {
    applicationLoading.value = false
  }
}

const handleProjectSearch = () => {
  projectPagination.currentPage = 1
  loadProjects()
}
const handleProjectReset = () => {
  Object.assign(projectFilters, { keyword: '', organizer: '', audit_status: null })
  handleProjectSearch()
}
const handleProjectAdd = () => {
  projectDialog.data = null
  projectDialog.visible = true
}

const handleProjectEdit = async (row: any) => {
  const res = await getReliefProjectDetail(row.id)
  // 假设 res.data 就是接口返回的那个驼峰对象
  projectDialog.data = (res as any).data 
  projectDialog.visible = true
}

const handleProjectView = async (row: any) => {
  const res = await getReliefProjectDetail(row.id)
  projectViewDialog.data = (res as any).data
  projectViewDialog.visible = true
}
const handleProjectDelete = async (row: any) => {
  await ElMessageBox.confirm(`确定删除项目“${row.name}”吗？`, '提示', { type: 'warning' })
  await deleteReliefProject(row.id)
  ElMessage.success('删除成功')
  loadProjects()
}
const submitProjectData = async (formData: any) => {
  if (formData.id) await updateReliefProject(formData.id, formData)
  else await addReliefProject(formData)
  ElMessage.success(formData.id ? '编辑成功' : '新增成功')
  projectDialog.visible = false
  loadProjects()
}

const handleApplicationSearch = () => {
  applicationPagination.currentPage = 1
  loadApplications()
}
const handleApplicationReset = () => {
  Object.assign(applicationFilters, { keyword: '', status: null })
  handleApplicationSearch()
}
const handleApplicationAdd = () => {
  applicationDialog.data = null
  applicationDialog.visible = true
}
const handleApplicationEdit = async (row: ReliefApplicationItem) => {
  const detailRes = await getReliefApplicationDetail(row.id!)
  applicationDialog.data = (detailRes as any).data
  applicationDialog.visible = true
}
const handleApplicationView = async (row: ReliefApplicationItem) => {
  const [detailRes, logsRes] = await Promise.all([
    getReliefApplicationDetail(row.id!),
    getReliefApplicationLogs(row.id!)
  ])
  applicationViewDialog.data = {
    ...(detailRes as any).data,
    logs: (logsRes as any).data || []
  }
  applicationViewDialog.visible = true
}
const handleApplicationDelete = async (row: ReliefApplicationItem) => {
  await ElMessageBox.confirm(`确定删除申请“${row.patientName}”吗？`, '提示', { type: 'warning' })
  await deleteReliefApplication(row.id!)
  ElMessage.success('删除成功')
  loadApplications()
}



const handleApplicationReview = async (row: ReliefApplicationItem, status: 'approved' | 'rejected') => {
  try {
    // 修改点：显式接收返回值，避免直接解构导致的类型推断问题
    const result = await ElMessageBox.prompt(
      status === 'approved' ? '请输入审核备注' : '请输入驳回原因',
      status === 'approved' ? '审核通过' : '审核驳回',
      { 
        inputType: 'textarea', 
        inputPlaceholder: status === 'approved' ? '如：资料齐全，审核通过' : '请输入驳回原因',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )
    
    // 从 result.value 中获取输入内容
    const value = result.value

    // 关键修改：将参数名改为驼峰命名 (actionDesc, rejectReason) 以匹配后端接口
    await reviewReliefApplication(row.id!, {
      status,
      actionDesc: value || (status === 'approved' ? '审核通过' : '审核驳回'),
      rejectReason: status === 'rejected' ? (value || '') : ''
    })
    
    ElMessage.success(status === 'approved' ? '已通过审核' : '已驳回申请')
    loadApplications()
  } catch (error) {
    // 用户点击取消或关闭弹窗时，ElMessageBox 会抛出 'cancel' 错误，这里忽略它
    if (error !== 'cancel') {
      console.error('审核操作失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

const submitApplicationData = async (formData: ReliefApplicationItem) => {
  if (formData.id) await updateReliefApplication(formData.id, formData)
  else await addReliefApplication(formData)
  ElMessage.success(formData.id ? '编辑成功' : '新增成功')
  applicationDialog.visible = false
  loadApplications()
}

// 修改辅助函数以适配可能的字段缺失或类型变化
const auditStatusText = (status: number | undefined) => {
  if (status === undefined || status === null) return '-';
  return ({ 0: '待审核', 1: '已通过', 2: '已驳回' }[status] || '-')
}
const auditTagType = (status: number | undefined) => {
  if (status === undefined || status === null) return 'info';
  return ({ 0: 'warning', 1: 'success', 2: 'danger' }[status] || 'info')
}
const applicationStatusText = (status: string) => ({ pending: '待审核', approved: '已通过', rejected: '已驳回', completed: '已完成' }[status] || status)
const applicationStatusType = (status: string) => ({ pending: 'warning', approved: 'success', rejected: 'danger', completed: 'info' }[status] || 'info')

// 移除了 formatDrugText，因为模板中直接使用了 row.drugName
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