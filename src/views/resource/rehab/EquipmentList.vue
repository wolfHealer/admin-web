<!-- src/views/resource/rehab/equipment/EquipmentList.vue -->
<template>
  <div class="equipment-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>康复设备管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增设备
          </el-button>
        </div>
      </template>

      <div class="filter-bar">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索设备名称"
          clearable
          style="width: 200px"
          @clear="handleSearch"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        
        <el-select
          v-model="filters.category"
          placeholder="设备分类"
          clearable
          style="width: 150px"
          @change="handleSearch"
        >
          <el-option label="站立训练类" value="站立训练类" />
          <el-option label="其他器械" value="其他器械" />
        </el-select>

        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="title" label="设备名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="equipmentModel" label="设备分类" width="150" />
        <el-table-column prop="priceRange" label="价格范围" width="150" />
        <el-table-column prop="insuranceCovered" label="医保" width="80">
          <template #default="{ row }">
            <el-tag :type="row.insuranceCovered ? 'success' : 'info'">
              {{ row.insuranceCovered ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '停用' }}
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

    <EquipmentDialog
      v-model="dialog.visible"
      :edit-data="dialog.data"
      @submit="submitData"
    />

    <EquipmentViewDialog
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
  getEquipmentList,
  getEquipmentDetail,
  addEquipment,
  updateEquipment,
  deleteEquipment,
  mapToEquipmentItem,
  mapToEquipmentResponse
} from '@/api/resource/rehab/equipment'
import type { EquipmentItem } from '@/api/resource/rehab/equipment'
import EquipmentDialog from './components/EquipmentDialog.vue'
import EquipmentViewDialog from './components/EquipmentViewDialog.vue'

const loading = ref(false)
const tableData = ref<EquipmentItem[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const filters = reactive({
  keyword: '',
  category: ''
})

const dialog = reactive({
  visible: false,
  data: null as EquipmentItem | null
})

const viewDialog = reactive({
  visible: false,
  data: null as EquipmentItem | null
})

// 新增设备
const handleAdd = () => {
  dialog.data = null
  dialog.visible = true
}

// 编辑设备
const handleEdit = async (row: EquipmentItem) => {
  try {
    const res = await getEquipmentDetail(row.id)
    if (res.code === 200 && res.data) {
      dialog.data = mapToEquipmentItem(res.data)
      dialog.visible = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

// 查看详情
const handleView = async (row: EquipmentItem) => {
  try {
    const res = await getEquipmentDetail(row.id)
    if (res.code === 200 && res.data) {
      viewDialog.data = mapToEquipmentItem(res.data)
      viewDialog.visible = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

// 删除设备
const handleDelete = async (row: EquipmentItem) => {
  await ElMessageBox.confirm(`确定要删除"${row.title}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await deleteEquipment(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 提交数据（新增/编辑）
const submitData = async (formData: EquipmentItem) => {
  try {
    const submitData = mapToEquipmentResponse(formData)
    if (formData.id) {
      await updateEquipment(formData.id, submitData)
      ElMessage.success('编辑成功')
    } else {
      await addEquipment(submitData)
      ElMessage.success('新增成功')
    }
    loadData()
    dialog.visible = false
    dialog.data = null
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

// 重置搜索
const handleReset = () => {
  filters.keyword = ''
  filters.category = ''
  handleSearch()
}

// 加载列表数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getEquipmentList({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      ...filters
    })
    if (res.code === 200 && res.data) {
      tableData.value = res.data.list.map(item => mapToEquipmentItem(item))
      pagination.total = res.data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.equipment-page {
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