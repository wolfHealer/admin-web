<!-- src/views/resource/drug/PurchaseChannelList.vue -->
<template>
  <div class="purchase-channel-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>正规购药渠道</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增渠道
          </el-button>
        </div>
      </template>

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索渠道名称"
          clearable
          style="width: 200px"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select
          v-model="filters.type"
          placeholder="渠道类型"
          clearable
          style="width: 150px"
          @change="handleSearch"
        >
          <el-option label="医院药房" value="医院药房" />
          <el-option label="连锁药店" value="连锁药店" />
          <el-option label="医药电商" value="医药电商" />
          <el-option label="合规代购" value="合规代购" />
        </el-select>

        <el-select
          v-model="filters.isInsurance"
          placeholder="医保定点"
          clearable
          style="width: 120px"
          @change="handleSearch"
        >
          <el-option label="是" :value="true" />
          <el-option label="否" :value="false" />
        </el-select>

        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <!-- 表格 -->
      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="name" label="渠道名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="type" label="渠道类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getChannelTypeTag(row.type)">
              {{ row.type }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="region" label="所在区域" width="150" />
        <el-table-column prop="contact" label="联系方式" width="180" show-overflow-tooltip />
        <el-table-column prop="isInsurance" label="医保定点" width="80">
          <template #default="{ row }">
            <el-tag :type="row.isInsurance ? 'success' : 'info'">
              {{ row.isInsurance ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deliveryCycle" label="配送周期" width="120" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSearch"
          @current-change="handleSearch"
        />
      </div>
    </el-card>

    <!-- 编辑/新增弹窗 -->
    <PurchaseChannelDialog
      v-model="dialog.visible"
      :edit-data="dialog.data"
      @submit="submitData"
    />

    <!-- 详情查看弹窗 -->
    <PurchaseChannelViewDialog
      v-model="viewDialog.visible"
      :view-data="viewDialog.data"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { 
  getPurchaseChannelList,
  getPurchaseChannelDetail,
  addPurchaseChannel,
  updatePurchaseChannel,
  deletePurchaseChannel
} from '@/api/resource/drug/purchaseChannel'
import type { PurchaseChannelItem } from '@/api/resource/drug/purchaseChannel'
import PurchaseChannelDialog from './components/PurchaseChannelDialog.vue'
import PurchaseChannelViewDialog from './components/PurchaseChannelViewDialog.vue'

const loading = ref(false)
const tableData = ref<PurchaseChannelItem[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const filters = reactive({
  keyword: '',
  type: '',
  isInsurance: null as boolean | null
})

const dialog = reactive({
  visible: false,
  data: null as PurchaseChannelItem | null
})

const viewDialog = reactive({
  visible: false,
  data: null as PurchaseChannelItem | null
})

// 新增
const handleAdd = () => {
  dialog.data = null
  dialog.visible = true
}

// 编辑
const handleEdit = async (row: PurchaseChannelItem) => {
  try {
    const res = await getPurchaseChannelDetail(row.id)
    if ((res as any).code === 200) {
      dialog.data = (res as any).data
      dialog.visible = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

// 查看
const handleView = async (row: PurchaseChannelItem) => {
  try {
    const res = await getPurchaseChannelDetail(row.id)
    if ((res as any).code === 200) {
      viewDialog.data = (res as any).data
      viewDialog.visible = true
    } else {
      ElMessage.error('获取详情失败')
    }
  } catch (error) {
    console.error('查看详情错误:', error)
    ElMessage.error('获取详情失败')
  }
}

// 删除
const handleDelete = async (row: PurchaseChannelItem) => {
  await ElMessageBox.confirm(`确定要删除"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await deletePurchaseChannel(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 提交数据
const submitData = async (formData: PurchaseChannelItem) => {
  try {
    if (formData.id) {
      await updatePurchaseChannel(formData.id, formData)
    } else {
      await addPurchaseChannel(formData)
    }
    ElMessage.success(formData.id ? '编辑成功' : '新增成功')
    loadData()
    // 提交成功后关闭弹窗并清空数据
    dialog.visible = false
    dialog.data = null
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

const handleReset = () => {
  filters.keyword = ''
  filters.type = ''
  filters.isInsurance = null
  handleSearch()
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getPurchaseChannelList({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      ...filters
    })
    if ((res as any).code === 200 && (res as any).data) {
      tableData.value = (res as any).data.list || []
      pagination.total = (res as any).data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载列表失败')
  } finally {
    loading.value = false
  }
}

// 渠道类型标签映射
const getChannelTypeTag = (type: string): string => {
  const map: Record<string, string> = {
    '医院药房': 'warning',
    '连锁药店': 'success',
    '医药电商': 'primary',
    '合规代购': 'info'
  }
  return map[type] || 'info'
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.purchase-channel-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .filter-bar {
    display: flex;
    gap: 15px;
    margin-bottom: 20px;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
}
</style>