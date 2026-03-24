<!-- src/views/knowledge/Knowledge.vue -->
<template>
  <div class="knowledge-page">
    <el-row :gutter="20">
      <!-- 左侧分类树 -->
      <el-col :span="6">
        <CategoryTree
          :category-tree="categoryTree"
          @add="handleAddCategory"
          @edit="handleEditCategory"
          @delete="handleDeleteCategory"
          @select="handleSelectCategory"
        />
      </el-col>

      <!-- 右侧疾病列表 -->
      <el-col :span="18">
        <DiseaseTable
          :title="currentCategory ? currentCategory.name : '全部疾病'"
          :category-tree="categoryTree"
          :table-data="tableData"
          :loading="loading"
          :pagination="pagination"
          @add="handleAddDisease"
          @edit="handleEditDisease"
          @delete="handleDeleteDisease"
          @view="handleView"
          @search="handleSearch"
          @reset="handleReset"
        />
      </el-col>
    </el-row>

    <!-- 弹窗组件 -->
    <CategoryDialog
      v-model="categoryDialog.visible"
      :is-edit="categoryDialog.isEdit"
      :data="categoryDialog.data"
      @submit="submitCategory"
    />

    <DiseaseDialog
      v-model="diseaseDialog.visible"
      :is-edit="diseaseDialog.isEdit"
      :category-tree="categoryTree"
      :data="diseaseDialog.data"
      @submit="submitDisease"
    />

    <DiseaseViewDialog
      v-model="viewDialog.visible"
      :data="viewDialog.data"
    />
  </div>
</template>


<!-- src/views/knowledge/Knowledge.vue -->
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Category, Disease } from '@/api/knowledge/knowledge'
import { 
  getCategoryList, 
  getDiseaseListByCategory,  // 修改：使用新接口
  addCategory, 
  updateCategory,
  deleteCategory,
  getDiseaseList,
  addDisease, updateDisease, deleteDisease, getDiseaseDetail 
} from '@/api/knowledge/knowledge'

// 子组件
import CategoryTree from './components/CategoryTree.vue'
import DiseaseTable from './components/DiseaseTable.vue'
import CategoryDialog from './components/CategoryDialog.vue'
import DiseaseDialog from './components/DiseaseDialog.vue'
import DiseaseViewDialog from './components/DiseaseViewDialog.vue'

// ==================== 数据定义 ====================
const categoryTree = ref<Category[]>([])
const currentCategory = ref<Category | null>(null)
const loading = ref(false)
const tableData = ref<Disease[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const filters = reactive({
  keyword: '',
  status: null as number | null,
  categoryId: null as number | null,
  dateRange: [] as Date[]
})

// 弹窗状态
const categoryDialog = reactive({
  visible: false,
  isEdit: false,
  data: null as Category | null
})

const diseaseDialog = reactive({
  visible: false,
  isEdit: false,
  data: null as any
})

const viewDialog = reactive({
  visible: false,
  data: {} as any
})

// ==================== 分类操作 ====================
const handleAddCategory = () => {
  categoryDialog.isEdit = false
  categoryDialog.data = null
  categoryDialog.visible = true
}

const handleEditCategory = (data: Category) => {
  categoryDialog.isEdit = true
  categoryDialog.data = data
  categoryDialog.visible = true
}

const handleDeleteCategory = async (data: Category) => {
  await ElMessageBox.confirm(`确定要删除分类"${data.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await deleteCategory(data.id)
    ElMessage.success('删除成功')
    loadCategoryTree()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const handleSelectCategory = (data: Category) => {
  currentCategory.value = data
  filters.categoryId = data.id
  handleSearch()
}

const submitCategory = async (formData: any) => {
  try {
    const params = {
      name: formData.name,
      description: formData.description,
      icon_url: formData.iconUrl,
      sort_order: formData.sortOrder,
      status: formData.status
    }
    
    if (categoryDialog.isEdit && categoryDialog.data?.id) {
      await updateCategory(categoryDialog.data.id, params)
    } else {
      await addCategory(params)
    }
    ElMessage.success(categoryDialog.isEdit ? '编辑成功' : '新增成功')
    loadCategoryTree()
  } catch (error) {
    console.error('分类操作失败:', error)
    ElMessage.error('操作失败')
  }
}

// ==================== 疾病操作 ====================
const handleAddDisease = () => {
  diseaseDialog.isEdit = false
  diseaseDialog.data = null
  if (currentCategory.value) {
    diseaseDialog.data = { categoryId: currentCategory.value.id, status: 1 }
  }
  diseaseDialog.visible = true
}

// 修改：查看疾病详情
const handleView = async (row: Disease) => {
  try {
    const res = await getDiseaseDetail(row.id)
    console.log('=== 疾病详情返回 ===', res)
    
    if (res.code === 200 || res.code === 0) {
      viewDialog.data = res.data
      viewDialog.visible = true
    }
  } catch (error) {
    console.error('获取疾病详情失败:', error)
    ElMessage.error('获取详情失败')
  }
}

// 修改：编辑疾病
const handleEditDisease = async (row: Disease) => {
  try {
    const res = await getDiseaseDetail(row.id)
    console.log('=== 编辑疾病详情返回 ===', res)
    
    if (res.code === 200 || res.code === 0) {
      diseaseDialog.isEdit = true
      // 合并列表中的数据和详情数据
      diseaseDialog.data = {
        id: row.id,
        categoryId: row.categoryId,
        status: row.status,
        ...res.data
      }
      diseaseDialog.visible = true
    }
  } catch (error) {
    console.error('获取疾病详情失败:', error)
    ElMessage.error('获取详情失败')
  }
}

const handleDeleteDisease = async (row: Disease) => {
  await ElMessageBox.confirm(`确定要删除疾病"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await deleteDisease(row.id)
    ElMessage.success('删除成功')
    loadDiseaseList()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const submitDisease = async (formData: any) => {
  try {
    if (diseaseDialog.isEdit && formData.id) {
      await updateDisease(formData.id, formData)
    } else {
      await addDisease(formData)
    }
    ElMessage.success(diseaseDialog.isEdit ? '编辑成功' : '新增成功')
    loadDiseaseList()
  } catch (error) {
    console.error('疾病操作失败:', error)
    ElMessage.error('操作失败')
  }
}

// ==================== 搜索与加载 ====================
const handleSearch = (params?: any) => {
  pagination.currentPage = 1
  loadDiseaseList(params)
}

const handleReset = () => {
  filters.keyword = ''
  filters.status = null
  filters.categoryId = null
  filters.dateRange = []
  currentCategory.value = null
  handleSearch()
}

const loadCategoryTree = async () => {
  try {
    const res = await getCategoryList()
    console.log('=== 分类接口返回 ===', res)
    
    if (res.code === 200 || res.code === 0) {
      const categories = res.data?.categories || res.data || res.categories || []
      
      if (Array.isArray(categories)) {
        categoryTree.value = categories.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          iconUrl: item.icon_url,
          sortOrder: item.sort_order,
          status: item.status,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }))
      }
    }
  } catch (error) {
    console.error('加载分类错误:', error)
    ElMessage.error('加载分类失败')
  }
}


const loadDiseaseList = async (params?: any) => {
  loading.value = true
  try {
    // 修改：根据是否有 categoryId 选择不同接口
    if (filters.categoryId) {
      // 使用分类 ID 接口
      const queryParams = {
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        keyword: filters.keyword,
        status: filters.status,
        ...params
      }
      const res = await getDiseaseListByCategory(filters.categoryId, queryParams)
      
      if (res.code === 200 && res.data) {
        tableData.value = res.data.list || res.data || []
        pagination.total = res.data.total || 0
      }
    } else {
      // 使用通用查询接口（全部疾病）
      const queryParams = {
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        keyword: filters.keyword,
        status: filters.status,
        startDate: filters.dateRange[0] ? formatDate(filters.dateRange[0]) : '',
        endDate: filters.dateRange[1] ? formatDate(filters.dateRange[1]) : '',
        ...params
      }
      const res = await getDiseaseList(queryParams)
      
      if (res.code === 200 && res.data) {
        tableData.value = res.data.list || []
        pagination.total = res.data.total || 0
      }
    }
  } catch (error) {
    console.error('加载疾病列表失败:', error)
    ElMessage.error('加载疾病列表失败')
  } finally {
    loading.value = false
  }
}

const formatDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// ==================== 生命周期 ====================
onMounted(() => {
  loadCategoryTree()
  loadDiseaseList()
})
</script>

<style lang="scss" scoped>
.knowledge-page {
  padding: 20px;
}
</style>