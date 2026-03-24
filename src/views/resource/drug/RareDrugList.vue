<!-- src/views/resource/drug/RareDrugList.vue -->
<template>
  <div class="rare-drug-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>罕见病药品名录</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增药品
          </el-button>
        </div>
      </template>

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索药品名称"
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
          placeholder="药品类型"
          clearable
          style="width: 120px"
          @change="handleSearch"
        >
          <el-option label="进口药" value="imported" />
          <el-option label="国产药" value="domestic" />
        </el-select>

        <el-select
          v-model="filters.insurance"
          placeholder="医保"
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
        <el-table-column prop="name" label="药品名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="spec" label="规格" width="150" show-overflow-tooltip />
        <el-table-column prop="dosageForm" label="剂型" width="120" />
        <el-table-column prop="indication" label="适应症" min-width="200" show-overflow-tooltip />
        <el-table-column prop="refPrice" label="参考价格" width="120">
          <template #default="{ row }">
            ¥{{ row.refPrice }}
          </template>
        </el-table-column>
        <el-table-column prop="insurance" label="医保" width="80">
          <template #default="{ row }">
            <el-tag :type="row.insurance ? 'success' : 'info'">
              {{ row.insurance ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="药品类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getDrugTypeTag(row.type)">
              {{ getDrugTypeLabel(row.type) }}
            </el-tag>
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
    <RareDrugDialog
      v-model="dialog.visible"
      :edit-data="dialog.data"
      @submit="submitData"
    />

    <!-- 详情查看弹窗 -->
    <RareDrugViewDialog
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
  getRareDrugList,
  getRareDrugDetail,
  addRareDrug,
  updateRareDrug,
  deleteRareDrug
} from '@/api/resource/drug/rareDrug'
import type { RareDrugItem } from '@/api/resource/drug/rareDrug'
import RareDrugDialog from './components/RareDrugDialog.vue'
import RareDrugViewDialog from './components/RareDrugViewDialog.vue'

const loading = ref(false)
const tableData = ref<RareDrugItem[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const filters = reactive({
  keyword: '',
  type: '',
  insurance: null as boolean | null
})

const dialog = reactive({
  visible: false,
  data: null as RareDrugItem | null
})

const viewDialog = reactive({
  visible: false,
  data: null as RareDrugItem | null
})

// 新增
const handleAdd = () => {
  dialog.data = null  // 确保为 null，表示新增模式
  dialog.visible = true
}

// 编辑
const handleEdit = async (row: RareDrugItem) => {
  try {
    const res = await getRareDrugDetail(row.id)
    if ((res as any).code === 200) {
      dialog.data = (res as any).data
      dialog.visible = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

// 查看
const handleView = async (row: RareDrugItem) => {
  try {
    const res = await getRareDrugDetail(row.id)
    if ((res as any).code === 200) {
      viewDialog.data = (res as any).data
      viewDialog.visible = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

// 删除
const handleDelete = async (row: RareDrugItem) => {
  await ElMessageBox.confirm(`确定要删除"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await deleteRareDrug(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 提交数据
const submitData = async (formData: RareDrugItem) => {
  try {
    if (formData.id) {
      await updateRareDrug(formData.id, formData)
    } else {
      await addRareDrug(formData)
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
  filters.insurance = null
  handleSearch()
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getRareDrugList({
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

// 药品类型标签映射
const getDrugTypeLabel = (type: string): string => {
  const map: Record<string, string> = {
    imported: '进口药',
    domestic: '国产药',
    special: '特殊药品'
  }
  return map[type] || type
}

const getDrugTypeTag = (type: string): string => {
  const map: Record<string, string> = {
    imported: 'warning',
    domestic: 'success',
    special: 'danger'
  }
  return map[type] || 'info'
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.rare-drug-page {
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