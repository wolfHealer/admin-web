<template>
  <div class="page-container">
    <el-card shadow="never" class="search-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button link @click="handleBack" class="back-btn">
              <el-icon><ArrowLeft /></el-icon>
              返回公益救助中心
            </el-button>
            <span class="page-title">求助通道管理</span>
          </div>
          <el-button type="primary" @click="handleAdd">
             <el-icon><Plus /></el-icon>
             新增求助通道
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="queryParams">
        <el-form-item label="关键词">
          <el-input
            v-model="queryParams.keyword"
            placeholder="请输入名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item label="通道类型">
          <el-select v-model="queryParams.channelType" placeholder="全部" clearable style="width: 180px">
            <el-option label="紧急求助" value="emergency_help" />
            <el-option label="众筹支持" value="crowdfunding" />
            <el-option label="慈善咨询" value="charity_consulting" />
            <el-option label="基金会支持" value="foundation_support" />
          </el-select>
        </el-form-item>

        <el-form-item label="审核状态">
          <el-select v-model="queryParams.auditStatus" placeholder="全部" clearable style="width: 140px">
            <el-option label="待审核" :value="0" />
            <el-option label="已通过" :value="1" />
            <el-option label="已驳回" :value="2" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never">
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="name" label="通道名称" min-width="220" show-overflow-tooltip />
        <el-table-column label="通道类型" width="140">
          <template #default="{ row }">
            <!-- 修改点：row.channelType -->
            {{ formatChannelType(row.channelType) }}
          </template>
        </el-table-column>
        <!-- 修改点：prop="applyCondition" -->
        <el-table-column prop="applyCondition" label="求助条件" min-width="220" show-overflow-tooltip />
        <!-- 修改点：prop="responseTime" -->
        <el-table-column prop="responseTime" label="响应时间" width="120" />
        <!-- 修改点：prop="contactPhone" -->
        <el-table-column prop="contactPhone" label="联系电话" width="140" />
        <el-table-column label="审核状态" width="100">
          <template #default="{ row }">
            <!-- 修改点：row.auditStatus -->
            <el-tag :type="auditTagType(row.auditStatus)">
              {{ auditText(row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="80" />
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

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="getList"
          @current-change="getList"
        />
      </div>
    </el-card>

    <HelpChannelDialog
      v-model="dialogVisible"
      :id="currentId"
      @success="getList"
    />

    <HelpChannelViewDialog
      v-model="viewVisible"
      :id="currentId"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Plus } from '@element-plus/icons-vue'
import HelpChannelDialog from './components/HelpChannelDialog.vue'
import HelpChannelViewDialog from './components/HelpChannelViewDialog.vue'
import {
  deleteHelpChannel,
  getHelpChannelList,
  type HelpChannelItem,
  type HelpChannelListParams,
} from '@/api/resource/charity/helpChannel'

const router = useRouter()

const loading = ref(false)
const tableData = ref<HelpChannelItem[]>([])
const total = ref(0)

const dialogVisible = ref(false)
const viewVisible = ref(false)
const currentId = ref<number | null>(null)

const queryParams = reactive<HelpChannelListParams>({
  page: 1,
  pageSize: 10,
  keyword: '',
  channelType: '',
  auditStatus: '',
})

const formatChannelType = (val: string) => {
  const map: Record<string, string> = {
    emergency_help: '紧急求助',
    crowdfunding: '众筹支持',
    charity_consulting: '慈善咨询',
    foundation_support: '基金会支持',
  }
  return map[val] || '-'
}

// 修改点：参数名为 status，内部逻辑不变，但调用时传入的是 number 类型的 auditStatus
const auditText = (status: number) => {
  return status === 1 ? '已通过' : status === 2 ? '已驳回' : '待审核'
}

const auditTagType = (status: number) => {
  return status === 1 ? 'success' : status === 2 ? 'danger' : 'warning'
}

const getList = async () => {
  loading.value = true
  try {
    const res = await getHelpChannelList(queryParams)
    tableData.value = res.data?.list || []
    total.value = res.data?.total || 0
  } finally {
    loading.value = false
  }
}

const handleBack = () => {
  router.push('/resource/charity')
}

const handleSearch = () => {
  queryParams.page = 1
  getList()
}

const handleReset = () => {
  queryParams.page = 1
  queryParams.pageSize = 10
  queryParams.keyword = ''
  queryParams.channelType = ''
  queryParams.auditStatus = ''
  getList()
}

const handleAdd = () => {
  currentId.value = null
  dialogVisible.value = true
}

const handleEdit = (row: HelpChannelItem) => {
  currentId.value = row.id
  dialogVisible.value = true
}

const handleView = (row: HelpChannelItem) => {
  currentId.value = row.id
  viewVisible.value = true
}

const handleDelete = async (row: HelpChannelItem) => {
  await ElMessageBox.confirm(`确认删除“${row.name}”吗？`, '提示', {
    type: 'warning',
  })
  await deleteHelpChannel(row.id)
  ElMessage.success('删除成功')
  getList()
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
/* 样式保持不变 */
.page-container {
  padding: 16px;
}
.search-card {
  margin-bottom: 16px;
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
.back-btn {
  font-size: 14px;
  color: #606266;
  padding: 0;
}
.back-btn:hover {
  color: var(--el-color-primary);
}
.page-title {
  font-weight: bold;
  font-size: 16px;
}
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>