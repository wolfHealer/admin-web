<!-- src/views/community/Community.vue -->
<template>
  <div class="community-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>病友交流管理</span>
          <div class="header-actions">
            <el-input
              v-model="filters.keyword"
              placeholder="搜索用户或内容"
              clearable
              style="width: 200px"
              @clear="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="handleReset">重置</el-button>
            <el-button type="success" @click="handleCreate">
              <el-icon><Plus /></el-icon>
              发布帖子
            </el-button>
          </div>
        </div>
      </template>

      <!-- 帖子列表 -->
      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="displayName" label="作者" width="120" />
        <el-table-column label="内容预览" min-width="300" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="content-preview">
              {{ truncateContent(row.content) }}
            </div>
          </template>
        </el-table-column>
        <el-table-column label="图片" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.images && row.images.length > 0"
              :src="row.images[0]"
              :preview-src-list="row.images"
              fit="cover"
              style="width: 60px; height: 60px; cursor: pointer"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="likeCount" label="点赞数" width="80" />
        <el-table-column prop="commentCount" label="评论数" width="80" />
        <el-table-column prop="createdAt" label="发布时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleView(row)">查看</el-button>
            <el-button link type="warning" @click="handleEdit(row)">修改</el-button>
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

    <!-- 帖子详情/评论管理弹窗 -->
    <PostDetailDialog
      v-model="detailDialog.visible"
      :post-data="detailDialog.postData"
      :is-edit="detailDialog.isEdit"
      @close="handleDetailClose"
      @refresh="loadData"
    />
    <!-- 发布帖子弹窗（新增） -->
    <PostCreateDialog
      v-model="createDialog.visible"
      @success="loadData"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { 
  getPostList,
  deletePost
} from '@/api/community/post'
import PostDetailDialog from './components/PostDetailDialog.vue'
import PostCreateDialog from './components/PostCreateDialog.vue'  // 新增


const createDialog = reactive({
  visible: false
})

// 发布帖子
const handleCreate = () => {
  createDialog.visible = true
}

interface PostItem {
  id: number
  userId: number
  displayName: string
  content: string
  images: string[]
  likeCount: number
  commentCount: number
  isLiked: boolean
  createdAt: string
}

const loading = ref(false)
const tableData = ref<PostItem[]>([])

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const filters = reactive({
  keyword: ''
})

const detailDialog = reactive({
  visible: false,
  postData: null as PostItem | null,
  isEdit: false
})

// 截断内容显示
const truncateContent = (content: string, length: number = 100) => {
  if (!content) return ''
  return content.length > length ? content.substring(0, length) + '...' : content
}

// 格式化时间
const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  loadData()
}

// 重置
const handleReset = () => {
  filters.keyword = ''
  handleSearch()
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getPostList({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      ...filters
    })
    if ((res as any).code === 200 && (res as any).data) {
      tableData.value = (res as any).data.records || []
      pagination.total = (res as any).data.total || 0
    }
  } catch (error) {
    ElMessage.error('加载列表失败')
  } finally {
    loading.value = false
  }
}

// 查看详情
const handleView = (row: PostItem) => {
  detailDialog.postData = row
  detailDialog.isEdit = false
  detailDialog.visible = true
}

// 修改帖子
const handleEdit = (row: PostItem) => {
  detailDialog.postData = row
  detailDialog.isEdit = true
  detailDialog.visible = true
}

// 关闭详情弹窗
const handleDetailClose = () => {
  detailDialog.visible = false
  detailDialog.postData = null
  detailDialog.isEdit = false
}

// 删除
const handleDelete = async (row: PostItem) => {
  await ElMessageBox.confirm(`确定要删除该帖子吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await deletePost(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

onMounted(() => {
  loadData()
})
</script>

<style lang="scss" scoped>
.community-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }

  .content-preview {
    line-height: 1.5;
    color: #606266;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
}
</style>