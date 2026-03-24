<!-- src/views/resource/medical/DoctorList.vue -->
<template>
  <div class="doctor-list-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>医生名录</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增医生
          </el-button>
        </div>
      </template>

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索医生姓名"
          clearable
          style="width: 200px"
          @clear="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select
          v-model="filters.department"
          placeholder="科室"
          clearable
          style="width: 150px"
          @change="handleSearch"
        >
          <el-option label="内科" value="内科" />
          <el-option label="外科" value="外科" />
          <el-option label="儿科" value="儿科" />
          <el-option label="妇产科" value="妇产科" />
        </el-select>

        <el-select
          v-model="filters.title"
          placeholder="职称"
          clearable
          style="width: 120px"
          @change="handleSearch"
        >
          <el-option label="主任医师" value="主任医师" />
          <el-option label="副主任医师" value="副主任医师" />
          <el-option label="主治医师" value="主治医师" />
        </el-select>

        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <!-- 表格 -->
      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="name" label="医生姓名" min-width="120" />
        <el-table-column prop="department" label="科室" width="100" />
        <el-table-column prop="title" label="职称" width="120" />
        <el-table-column prop="hospitalName" label="所属医院" min-width="150" />
        <el-table-column prop="specialty" label="擅长领域" min-width="180" show-overflow-tooltip />
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
    <DoctorDialog
      v-model="dialog.visible"
      :is-edit="dialog.isEdit"
      :data="dialog.data"
      @submit="submitData"
    />

    <!-- 详情查看弹窗 -->
    <DoctorViewDialog
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
  getDoctorList,
  getDoctorDetail,
  addDoctor,
  updateDoctor,
  deleteDoctor
} from '@/api/resource/medical/doctor'
import DoctorDialog from './components/DoctorDialog.vue'
import DoctorViewDialog from './components/DoctorViewDialog.vue'

const loading = ref(false)
const tableData = ref<any[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const filters = reactive({
  keyword: '',
  department: '',
  title: ''
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
    const res = await getDoctorDetail(row.id)
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
    const res = await getDoctorDetail(row.id)
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
    await deleteDoctor(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const submitData = async (formData: any) => {
  try {
    if (dialog.isEdit && formData.id) {
      await updateDoctor(formData.id, formData)
    } else {
      await addDoctor(formData)
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
  filters.department = ''
  filters.title = ''
  handleSearch()
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getDoctorList({
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
.doctor-list-page {
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