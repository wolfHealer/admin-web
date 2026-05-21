<template>
  <div class="purchase-channel-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button link @click="handleBack" class="back-btn">
              <el-icon><ArrowLeft /></el-icon>
              返回用药信息平台
            </el-button>
            <span class="page-title">正规购药渠道</span>
          </div>
          <el-button type="primary" @click="openAdd">
            <el-icon><Plus /></el-icon>
            新增渠道
          </el-button>
        </div>
      </template>

      <div class="filter-bar">
        <el-input v-model="query.keyword" placeholder="搜索渠道名称/联系方式" clearable style="width: 220px" @keyup.enter="handleSearch" @clear="handleSearch">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>

        <el-select v-model="query.channelType" placeholder="渠道类型" clearable style="width: 150px" @change="handleSearch">
          <el-option label="医院药房" value="hospital_pharmacy" />
          <el-option label="连锁药店" value="retail_pharmacy" /> 
          <el-option label="互联网医院" value="internet_hospital" />
          <el-option label="DTP药房" value="dtp_pharmacy" />
          <el-option label="医药电商" value="e_pharmacy" />
          <el-option label="合规代购/协助渠道" value="compliant_agent" />
          <el-option label="其他" value="other" />
        </el-select>

        <el-select v-model="query.isInsuranceSettle" placeholder="医保结算" clearable style="width: 120px" @change="handleSearch">
          <el-option label="是" :value="1" />
          <el-option label="否" :value="0" />
        </el-select>

        <el-select v-model="query.auditStatus" placeholder="审核状态" clearable style="width: 120px" @change="handleSearch">
          <el-option label="待审核" :value="0" />
          <el-option label="已通过" :value="1" />
          <el-option label="已驳回" :value="2" />
        </el-select>

        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="name" label="渠道名称" min-width="200" show-overflow-tooltip />
        
        <!-- 修改点1: 列表接口未返回药品信息，暂时移除或显示占位符 -->
        <!-- 如果必须显示，需要后端在列表接口补充 drugName 字段 -->
        <el-table-column label="关联药品" min-width="180" show-overflow-tooltip>
          <template #default>
            <span style="color: #999;">详情中查看</span>
          </template>
        </el-table-column>

        <el-table-column prop="channelType" label="渠道类型" width="130">
          <template #default="{ row }">
            <el-tag>{{ getChannelTypeText(row.channelType) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="区域" min-width="180">
          <template #default="{ row }">
            {{ formatRegion(row) }}
          </template>
        </el-table-column>

        <el-table-column prop="contactPhone" label="联系电话" width="140" show-overflow-tooltip />
        <el-table-column prop="deliveryCycle" label="配送周期" width="120" />

        <!-- 修改点2: 适配 boolean 类型的 isInsuranceSettle -->
        <el-table-column prop="isInsuranceSettle" label="医保结算" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isInsuranceSettle ? 'success' : 'info'">
              {{ row.isInsuranceSettle ? '支持' : '不支持' }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 修改点3: 适配 auditStatus (如果接口返回了的话，示例JSON中未包含，假设存在) -->
        <el-table-column prop="auditStatus" label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getAuditTag(row.auditStatus)">
              {{ getAuditText(row.auditStatus) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="updatedAt" label="更新时间" width="170">
           <template #default="{ row }">{{ formatDate(row.updatedAt) }}</template>
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

    <ChannelDialog v-model="editDialog.visible" :edit-data="editDialog.data" @submit="submitData" />
    <ChannelViewDialog v-model="viewDialog.visible" :view-data="viewDialog.data" />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Plus, Search } from '@element-plus/icons-vue'
import { useTable, useCrudDialog } from '@/composables'
import ChannelDialog from './components/ChannelDialog.vue'
import ChannelViewDialog from './components/ChannelViewDialog.vue'
import {
  addPurchaseChannel,
  deletePurchaseChannel,
  getPurchaseChannelDetail,
  getPurchaseChannelList,
  updatePurchaseChannel,
  type DrugChannelItem,
  type DrugChannelListParams,
  type DrugChannelSubmitPayload,
} from '@/api/resource/drug/channel'

type ChannelQuery = DrugChannelListParams

const router = useRouter()

const { loading, tableData, total, query, loadData, handleSearch, handleReset, refresh } = useTable<
  DrugChannelItem,
  ChannelQuery
>({
  initialQuery: () => ({
    page: 1,
    pageSize: 10,
    keyword: '',
    channelType: '',
    isInsuranceSettle: '',
    auditStatus: '',
  }),
  fetchApi: async (params) => (await getPurchaseChannelList(params)).data,
  errorMessage: '加载列表失败',
})

const { editDialog, viewDialog, openAdd, openEdit, openView, handleDelete } = useCrudDialog<DrugChannelItem>({
  strategy: 'byData',
  getRowId: (row) => row.id,
  fetchDetail: async (id) => (await getPurchaseChannelDetail(id)).data,
  deleteItem: (row) => deletePurchaseChannel(row.id),
  deleteMessage: (row) => `确定要删除「${row.name}」吗？`,
  onSuccess: refresh,
})

const handleBack = () => router.push('/resource/drug')

const getChannelTypeText = (value: string) => {
  const map: Record<string, string> = {
    hospital_pharmacy: '医院药房',
    retail_pharmacy: '连锁药店',
    chain_pharmacy: '连锁药店', // 兼容
    internet_hospital: '互联网医院',
    dtp_pharmacy: 'DTP药房',
    e_pharmacy: '医药电商',
    ecommerce: '医药电商',      // 兼容
    compliant_agent: '合规代购/协助渠道',
    other: '其他'
  }
  return map[value] || value || '-'
}

const getAuditTag = (status: number) => ({ 0: 'warning', 1: 'success', 2: 'danger' } as Record<number, string>)[status] || 'info'
const getAuditText = (status: number) => ({ 0: '待审核', 1: '已通过', 2: '已驳回' } as Record<number, string>)[status] || '-'

const formatRegion = (row: DrugChannelItem) =>
  [row.provinceName, row.cityName, row.districtName].filter(Boolean).join(' / ') || '-'

const formatDate = (dateStr: string) => {
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

const submitData = async (payload: DrugChannelSubmitPayload & { id?: number }) => {
  try {
    if (payload.id) {
      const { id, ...rest } = payload
      await updatePurchaseChannel(id, rest)
    } else {
      await addPurchaseChannel(payload)
    }
    ElMessage.success(payload.id ? '编辑成功' : '新增成功')
    editDialog.value.visible = false
    editDialog.value.data = null
    await refresh()
  } catch {
    ElMessage.error('操作失败')
  }
}
</script>

<style scoped>
.purchase-channel-page { display: flex; flex-direction: column; gap: 16px; }
.card-header { display: flex; align-items: center; justify-content: space-between; }
.header-left { display: flex; align-items: center; gap: 8px; }
.page-title { font-size: 16px; font-weight: 600; }
.filter-bar { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
.pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>