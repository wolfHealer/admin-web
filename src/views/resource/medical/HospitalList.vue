<!-- src/views/resource/medical/HospitalList.vue -->
<template>
  <div class="hospital-list-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>医院名录</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增医院
          </el-button>
        </div>
      </template>

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索医院名称"
          clearable
          style="width: 200px"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select
          v-model="filters.level"
          placeholder="医院等级"
          clearable
          style="width: 150px"
          @change="handleSearch"
        >
          <el-option label="三甲" value="三甲" />
          <el-option label="三乙" value="三乙" />
          <el-option label="二甲" value="二甲" />
          <el-option label="二乙" value="二乙" />
        </el-select>

        <el-select
          v-model="filters.type"
          placeholder="医院类型"
          clearable
          style="width: 150px"
          @change="handleSearch"
        >
          <el-option label="综合医院" value="综合医院" />
          <el-option label="专科医院" value="专科医院" />
          <el-option label="中医医院" value="中医医院" />
        </el-select>

        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <!-- 表格 -->
      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="name" label="医院名称" min-width="200" />
        <el-table-column prop="level" label="医院等级" width="100" />
        <el-table-column prop="type" label="医院类型" width="120" />
        <el-table-column prop="address" label="地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="phone" label="联系电话" width="150" />
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
    <HospitalDialog
      v-model="dialog.visible"
      :is-edit="dialog.isEdit"
      :data="dialog.data"
      @submit="submitData"
    />

    <!-- 详情查看弹窗 -->
    <HospitalViewDialog
      v-model="viewDialog.visible"
      :data="viewDialog.data"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import { 
  getHospitalList,
  getHospitalDetail,
  addHospital,
  updateHospital,
  deleteHospital
} from '@/api/resource/medical/hospital'
import HospitalDialog from './components/HospitalDialog.vue'
import HospitalViewDialog from './components/HospitalViewDialog.vue'

const loading = ref(false)
const tableData = ref<any[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const filters = reactive({
  keyword: '',
  level: '',
  type: ''
})

const dialog = reactive({
  visible: false,
  isEdit: false,
  data: null as any
})

const viewDialog = reactive({
  visible: false,
  data: {} as any
})

const handleAdd = () => {
  dialog.isEdit = false
  dialog.data = { status: 1 }
  dialog.visible = true
}

const handleEdit = async (row: any) => {
  try {
    const res = await getHospitalDetail(row.id)
    if ((res as any).code === 200) {
      dialog.isEdit = true
      dialog.data = { id: row.id, status: row.status, ...(res as any).data }
      dialog.visible = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

const handleView = async (row: any) => {
  try {
    const res = await getHospitalDetail(row.id)
    if ((res as any).code === 200) {
      viewDialog.data = (res as any).data
      viewDialog.visible = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

const handleDelete = async (row: any) => {
  await ElMessageBox.confirm(`确定要删除"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await deleteHospital(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const submitData = async (formData: any) => {
  try {
    if (dialog.isEdit && formData.id) {
      await updateHospital(formData.id, formData)
    } else {
      await addHospital(formData)
    }
    ElMessage.success(dialog.isEdit ? '编辑成功' : '新增成功')
    loadData()
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
  filters.level = ''
  filters.type = ''
  handleSearch()
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getHospitalList({
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

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.hospital-list-page {
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