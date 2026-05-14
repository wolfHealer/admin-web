
<template>
  <div class="rare-drug-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button link @click="handleBack" class="back-btn">
              <el-icon><ArrowLeft /></el-icon>
              返回用药信息平台
            </el-button>
            <span class="page-title">罕见病药品名录</span>
          </div>

          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增药品
          </el-button>
        </div>
      </template>

      <div class="filter-bar">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索通用名 / 商品名"
          clearable
          style="width: 220px"
          @keyup.enter="handleSearch"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select v-model="filters.drugType" placeholder="药品类型" clearable style="width: 160px" @change="handleSearch">
          <el-option label="原研进口" value="origin_import" />
          <el-option label="原研国产" value="origin_domestic" />
          <el-option label="仿制药" value="generic" />
          <el-option label="其他" value="other" />
        </el-select>

        <el-select v-model="filters.isInsurance" placeholder="是否医保" clearable style="width: 130px" @change="handleSearch">
          <el-option label="是" :value="1" />
          <el-option label="否" :value="0" />
        </el-select>

        <el-select v-model="filters.hasRelief" placeholder="是否援助" clearable style="width: 130px" @change="handleSearch">
          <el-option label="是" :value="1" />
          <el-option label="否" :value="0" />
        </el-select>

        <el-select v-model="filters.auditStatus" placeholder="审核状态" clearable style="width: 130px" @change="handleSearch">
          <el-option label="待审核" :value="0" />
          <el-option label="已通过" :value="1" />
          <el-option label="已驳回" :value="2" />
        </el-select>

        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="generic_name" label="通用名" min-width="180" show-overflow-tooltip />
        <el-table-column prop="brand_name" label="商品名" min-width="160" show-overflow-tooltip>
          <template #default="{ row }">{{ row.brand_name || '-' }}</template>
        </el-table-column>
        <el-table-column prop="spec" label="规格" width="160" show-overflow-tooltip />
        <el-table-column prop="dosage_form" label="剂型" width="120" />
        <el-table-column prop="ref_price" label="参考价格" width="120">
          <template #default="{ row }">¥{{ row.ref_price }}</template>
        </el-table-column>
        <el-table-column prop="drug_type" label="药品类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getDrugTypeTag(row.drug_type)">{{ getDrugTypeLabel(row.drug_type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="医保/援助" width="120">
          <template #default="{ row }">
            <div class="flag-group">
              <el-tag size="small" :type="row.is_insurance ? 'success' : 'info'">医保{{ row.is_insurance ? '是' : '否' }}</el-tag>
              <el-tag size="small" :type="row.has_relief ? 'warning' : 'info'">援助{{ row.has_relief ? '有' : '无' }}</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="disease_count" label="关联疾病" width="100">
          <template #default="{ row }">{{ row.disease_count ?? 0 }}</template>
        </el-table-column>
        <el-table-column prop="audit_status" label="审核状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getAuditStatusTag(row.audit_status)">{{ getAuditStatusLabel(row.audit_status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="更新时间" width="180" />
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
          @size-change="handleSearch"
          @current-change="loadData"
        />
      </div>
    </el-card>

    <DrugDialog v-model="dialog.visible" :edit-data="dialog.data" @submit="submitData" />
    <DrugViewDialog v-model="viewDialog.visible" :view-data="viewDialog.data" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import DrugDialog from './components/DrugDialog.vue'
import DrugViewDialog from './components/DrugViewDialog.vue'
import {
  addRareDrug,
  deleteRareDrug,
  getRareDrugDetail,
  getRareDrugList,
  updateRareDrug,
  type RareDrugItem,
  type RareDrugSubmitPayload,
} from '@/api/resource/drug/drug'

const router = useRouter()
const loading = ref(false)
const tableData = ref<RareDrugItem[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

const filters = reactive({
  keyword: '',
  drugType: '',
  isInsurance: '' as '' | number,
  hasRelief: '' as '' | number,
  auditStatus: '' as '' | number,
})

const dialog = reactive({
  visible: false,
  data: null as RareDrugItem | null,
})

const viewDialog = reactive({
  visible: false,
  data: null as RareDrugItem | null,
})

const handleBack = () => {
  router.push('/resource/drug')
}

const getDrugTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    origin_import: '原研进口',
    origin_domestic: '原研国产',
    generic: '仿制药',
    other: '其他',
  }
  return map[type] || type || '-'
}

const getDrugTypeTag = (type: string) => {
  const map: Record<string, string> = {
    origin_import: 'warning',
    origin_domestic: 'success',
    generic: 'primary',
    other: 'info',
  }
  return map[type] || 'info'
}

const getAuditStatusLabel = (status: number) => {
  return ['待审核', '已通过', '已驳回'][status] || '-'
}

const getAuditStatusTag = (status: number) => {
  return ['warning', 'success', 'danger'][status] || 'info'
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getRareDrugList({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      ...filters,
    })
    if ((res as any).code === 200) {
      tableData.value = (res as any).data?.list || []
      pagination.total = (res as any).data?.total || 0
    }
  } catch (error) {
    ElMessage.error('加载药品列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

const handleReset = () => {
  filters.keyword = ''
  filters.drugType = ''
  filters.isInsurance = ''
  filters.hasRelief = ''
  filters.auditStatus = ''
  handleSearch()
}

const handleAdd = () => {
  dialog.data = null
  dialog.visible = true
}

const handleEdit = async (row: RareDrugItem) => {
  try {
    const res = await getRareDrugDetail(row.id)
    if ((res as any).code === 200) {
      dialog.data = (res as any).data
      dialog.visible = true
    }
  } catch (error) {
    ElMessage.error('获取药品详情失败')
  }
}

const handleView = async (row: RareDrugItem) => {
  try {
    const res = await getRareDrugDetail(row.id)
    if ((res as any).code === 200) {
      viewDialog.data = (res as any).data
      viewDialog.visible = true
    }
  } catch (error) {
    ElMessage.error('获取药品详情失败')
  }
}

const handleDelete = async (row: RareDrugItem) => {
  await ElMessageBox.confirm(`确定删除“${row.genericName}”吗？`, '提示', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  })

  try {
    await deleteRareDrug(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const submitData = async (payload: RareDrugSubmitPayload & { id?: number }) => {
  try {
    if (payload.id) {
      const { id, ...data } = payload
      await updateRareDrug(id, data)
    } else {
      await addRareDrug(payload)
    }
    ElMessage.success(payload.id ? '编辑成功' : '新增成功')
    dialog.visible = false
    dialog.data = null
    loadData()
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.rare-drug-page {
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .page-title {
      font-size: 18px;
      font-weight: 600;
    }
  }

  .filter-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 16px;
  }

  .flag-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
