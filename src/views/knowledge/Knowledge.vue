<template>
  <div class="knowledge-page">
    <el-tabs v-model="activeTab" class="knowledge-tabs">
      <el-tab-pane label="分类管理" name="category">
        <el-row :gutter="20">
          <el-col :span="8">
            <CategoryTree
              :category-tree="categoryTree"
              @add-root="handleAddRootCategory"
              @add-child="handleAddChildCategory"
              @edit="handleEditCategory"
              @delete="handleDeleteCategory"
              @select="handleSelectCategory"
            />
          </el-col>
          <el-col :span="16">
            <el-card>
              <template #header>
                <div class="panel-header">
                  <span>{{ currentCategory ? '分类详情' : '分类说明' }}</span>
                </div>
              </template>
              <template v-if="currentCategory">
                <el-descriptions :column="2" border>
                  <el-descriptions-item label="分类名称">{{ currentCategory.name }}</el-descriptions-item>
                  <el-descriptions-item label="分类编码">{{ currentCategory.code }}</el-descriptions-item>
                  <el-descriptions-item label="层级">{{ currentCategory.level }}</el-descriptions-item>
                  <el-descriptions-item label="父级分类">{{ getCategoryName(currentCategory.parentId) || '一级分类' }}</el-descriptions-item>
                  <el-descriptions-item label="排序">{{ currentCategory.sortOrder }}</el-descriptions-item>
                  <el-descriptions-item label="状态">
                    <el-tag :type="currentCategory.status === 1 ? 'success' : 'info'">
                      {{ currentCategory.status === 1 ? '启用' : '停用' }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="描述" :span="2">
                    {{ currentCategory.description || '暂无描述' }}
                  </el-descriptions-item>
                </el-descriptions>
              </template>
              <el-empty v-else description="请选择左侧分类查看详情" />
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <el-tab-pane label="标签管理" name="tag">
        <TagTable
          :table-data="tagTableData"
          :loading="tagLoading"
          @add="handleAddTag"
          @edit="handleEditTag"
          @delete="handleDeleteTag"
          @search="handleTagSearch"
          @reset="handleTagReset"
        />
      </el-tab-pane>

      <el-tab-pane label="疾病管理" name="disease">
        <DiseaseTable
          :title="currentCategory ? `${currentCategory.name} · 疾病列表` : '全部疾病'"
          :category-tree="categoryTree"
          :tag-list="tagOptions"
          :table-data="diseaseTableData"
          :loading="diseaseLoading"
          :pagination="pagination"
          @add="handleAddDisease"
          @edit="handleEditDisease"
          @delete="handleDeleteDisease"
          @view="handleViewDisease"
          @search="handleDiseaseSearch"
          @reset="handleDiseaseReset"
        />
      </el-tab-pane>
    </el-tabs>

    <CategoryDialog
      v-model="categoryDialog.visible"
      :is-edit="categoryDialog.isEdit"
      :data="categoryDialog.data"
      :category-tree="categoryTree"
      :default-parent-id="categoryDialog.defaultParentId"
      @submit="submitCategory"
    />

    <TagDialog
      v-model="tagDialog.visible"
      :is-edit="tagDialog.isEdit"
      :data="tagDialog.data"
      @submit="submitTag"
    />

    <DiseaseDialog
      v-model="diseaseDialog.visible"
      :is-edit="diseaseDialog.isEdit"
      :category-tree="categoryTree"
      :tag-list="tagOptions"
      :data="diseaseDialog.data"
      @submit="submitDisease"
    />

    <DiseaseViewDialog v-model="viewDialog.visible" :data="viewDialog.data" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  addCategory,
  addDisease,
  addTag,
  deleteCategory,
  deleteDisease,
  deleteTag,
  getCategoryTree,
  getDiseaseDetail,
  getDiseaseList,
  getTagList,
  updateCategory,
  updateDisease,
  updateTag,
  type CategoryTreeNode,
  type Disease,
  type TagItem,
} from '@/api/knowledge/knowledge'
import CategoryTree from './components/CategoryTree.vue'
import CategoryDialog from './components/CategoryDialog.vue'
import TagTable from './components/TagTable.vue'
import TagDialog from './components/TagDialog.vue'
import DiseaseTable from './components/DiseaseTable.vue'
import DiseaseDialog from './components/DiseaseDialog.vue'
import DiseaseViewDialog from './components/DiseaseViewDialog.vue'

const activeTab = ref('category')

const categoryTree = ref<CategoryTreeNode[]>([])
const currentCategory = ref<CategoryTreeNode | null>(null)
const tagTableData = ref<TagItem[]>([])
const diseaseTableData = ref<Disease[]>([])

const categoryLoading = ref(false)
const tagLoading = ref(false)
const diseaseLoading = ref(false)

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
})

const diseaseFilters = reactive({
  keyword: '',
  status: null as number | null,
  categoryId: null as number | null,
  tagId: null as number | null,
})

const tagFilters = reactive({
  keyword: '',
  status: null as number | null,
})

const categoryDialog = reactive({
  visible: false,
  isEdit: false,
  data: null as CategoryTreeNode | null,
  defaultParentId: 0,
})

const tagDialog = reactive({
  visible: false,
  isEdit: false,
  data: null as TagItem | null,
})

const diseaseDialog = reactive({
  visible: false,
  isEdit: false,
  data: null as any,
})

const viewDialog = reactive({
  visible: false,
  data: {} as any,
})

const tagOptions = computed(() => tagTableData.value.filter((item) => item.status === 1))

const flattenCategories = (nodes: CategoryTreeNode[], result: CategoryTreeNode[] = []) => {
  nodes.forEach((node) => {
    result.push(node)
    if (node.children?.length) flattenCategories(node.children, result)
  })
  return result
}

const getCategoryName = (id?: number) => {
  if (!id) return ''
  return flattenCategories(categoryTree.value).find((item) => item.id === id)?.name || ''
}

const loadCategoryTree = async () => {
  try {
    categoryLoading.value = true
    const res = await getCategoryTree()
    categoryTree.value = res.data?.categories || res.data || []
  } catch (error) {
    ElMessage.error('获取分类树失败')
  } finally {
    categoryLoading.value = false
  }
}

const loadTagList = async () => {
  try {
    tagLoading.value = true
    const res = await getTagList({ ...tagFilters })
    tagTableData.value = res.data?.list || res.data?.tags || res.data || []
  } catch (error) {
    ElMessage.error('获取标签列表失败')
  } finally {
    tagLoading.value = false
  }
}

const loadDiseaseList = async () => {
  try {
    diseaseLoading.value = true
    const res = await getDiseaseList({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      ...diseaseFilters,
    })
    const data = res.data || {}
    diseaseTableData.value = data.list || []
    pagination.total = data.total || 0
  } catch (error) {
    ElMessage.error('获取疾病列表失败')
  } finally {
    diseaseLoading.value = false
  }
}

const handleAddRootCategory = () => {
  categoryDialog.isEdit = false
  categoryDialog.data = null
  categoryDialog.defaultParentId = 0
  categoryDialog.visible = true
}

const handleAddChildCategory = (row: CategoryTreeNode) => {
  categoryDialog.isEdit = false
  categoryDialog.data = null
  categoryDialog.defaultParentId = row.id
  categoryDialog.visible = true
}

const handleEditCategory = (row: CategoryTreeNode) => {
  categoryDialog.isEdit = true
  categoryDialog.data = row
  categoryDialog.defaultParentId = row.parentId || 0
  categoryDialog.visible = true
}

const handleDeleteCategory = async (row: CategoryTreeNode) => {
  await ElMessageBox.confirm(`确定删除分类“${row.name}”吗？`, '提示', { type: 'warning' })
  await deleteCategory(row.id)
  ElMessage.success('删除成功')
  if (currentCategory.value?.id === row.id) currentCategory.value = null
  await loadCategoryTree()
}

const handleSelectCategory = (row: CategoryTreeNode) => {
  currentCategory.value = row
  diseaseFilters.categoryId = row.id
  activeTab.value = 'disease'
  pagination.currentPage = 1
  loadDiseaseList()
}

// Knowledge.vue 中的 submitCategory 方法
const submitCategory = async (formData: any) => {
  const payload = {
    name: formData.name,
    code: formData.code,
    parentId: formData.parentId,
    iconUrl: formData.iconUrl,
    sortOrder: formData.sortOrder,
    status: formData.status,
    description: formData.description,
    level: formData.level, // <--- 确保添加这一行
  }

  if (categoryDialog.isEdit && categoryDialog.data?.id) {
    await updateCategory(categoryDialog.data.id, payload)
    ElMessage.success('分类编辑成功')
  } else {
    await addCategory(payload)
    ElMessage.success('分类新增成功')
  }
  await loadCategoryTree()
}

const handleAddTag = () => {
  tagDialog.isEdit = false
  tagDialog.data = null
  tagDialog.visible = true
}

const handleEditTag = (row: TagItem) => {
  tagDialog.isEdit = true
  tagDialog.data = row
  tagDialog.visible = true
}

const handleDeleteTag = async (row: TagItem) => {
  await ElMessageBox.confirm(`确定删除标签“${row.name}”吗？`, '提示', { type: 'warning' })
  await deleteTag(row.id)
  ElMessage.success('删除成功')
  await loadTagList()
}

const submitTag = async (formData: any) => {
  const payload = {
    name: formData.name,
    code: formData.code,
    sortOrder: formData.sortOrder,
    status: formData.status,
  }

  if (tagDialog.isEdit && tagDialog.data?.id) {
    await updateTag(tagDialog.data.id, payload)
    ElMessage.success('标签编辑成功')
  } else {
    await addTag(payload)
    ElMessage.success('标签新增成功')
  }
  await loadTagList()
}

const handleTagSearch = (params: any) => {
  tagFilters.keyword = params.keyword || ''
  tagFilters.status = params.status ?? null
  loadTagList()
}

const handleTagReset = () => {
  tagFilters.keyword = ''
  tagFilters.status = null
  loadTagList()
}

const handleAddDisease = () => {
  diseaseDialog.isEdit = false
  diseaseDialog.data = currentCategory.value
    ? { primaryCategoryId: currentCategory.value.id, categoryIds: [currentCategory.value.id], tagIds: [], status: 1 }
    : { categoryIds: [], tagIds: [], status: 1 }
  diseaseDialog.visible = true
}

const handleEditDisease = async (row: Disease) => {
  const res = await getDiseaseDetail(row.id)
  const detail = res.data || {}
  diseaseDialog.isEdit = true
  diseaseDialog.data = {
    id: row.id,
    name: detail.name || row.name,
    alias: detail.alias || row.alias,
    introduction: detail.introduction || row.introduction,
    symptoms: detail.symptoms || row.symptoms,
    images: detail.images || row.images || [],
    status: detail.status ?? row.status,
    primaryCategoryId: detail.primaryCategoryId || row.primaryCategoryId,
    categoryIds: detail.categoryIds || row.categoryIds || (detail.categories || row.categories || []).map((item: any) => item.id),
    tagIds: detail.tagIds || row.tagIds || (detail.tags || row.tags || []).map((item: any) => item.id),
  }
  diseaseDialog.visible = true
}

const handleViewDisease = async (row: Disease) => {
  const res = await getDiseaseDetail(row.id)
  viewDialog.data = res.data || {}
  viewDialog.visible = true
}

const handleDeleteDisease = async (row: Disease) => {
  await ElMessageBox.confirm(`确定删除疾病“${row.name}”吗？`, '提示', { type: 'warning' })
  await deleteDisease(row.id)
  ElMessage.success('删除成功')
  await loadDiseaseList()
}

const submitDisease = async (formData: any) => {
  const payload = {
    name: formData.name,
    alias: formData.alias,
    introduction: formData.introduction,
    symptoms: formData.symptoms,
    images: formData.images,
    status: formData.status,
    primaryCategoryId: formData.primaryCategoryId,
    categoryIds: formData.categoryIds,
    tagIds: formData.tagIds,
  }

  if (diseaseDialog.isEdit && diseaseDialog.data?.id) {
    await updateDisease(diseaseDialog.data.id, payload)
    ElMessage.success('疾病编辑成功')
  } else {
    await addDisease(payload)
    ElMessage.success('疾病新增成功')
  }
  await loadDiseaseList()
}

const handleDiseaseSearch = (params: any) => {
  diseaseFilters.keyword = params.keyword || ''
  diseaseFilters.status = params.status ?? null
  diseaseFilters.categoryId = params.categoryId ?? null
  diseaseFilters.tagId = params.tagId ?? null
  pagination.currentPage = params.page || 1
  pagination.pageSize = params.pageSize || 10
  loadDiseaseList()
}

const handleDiseaseReset = () => {
  diseaseFilters.keyword = ''
  diseaseFilters.status = null
  diseaseFilters.categoryId = currentCategory.value?.id || null
  diseaseFilters.tagId = null
  pagination.currentPage = 1
  pagination.pageSize = 10
  loadDiseaseList()
}

onMounted(async () => {
  await Promise.all([loadCategoryTree(), loadTagList()])
  await loadDiseaseList()
})
</script>

<style scoped lang="scss">
.knowledge-page {
  min-height: 100%;
}

.knowledge-tabs :deep(.el-tabs__content) {
  padding-top: 8px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
