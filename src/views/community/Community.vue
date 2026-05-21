<!-- src/views/community/Community.vue -->
<template>
  <div class="community-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>病友交流管理</span>
          <div class="header-actions">
            <el-input
              v-model="query.keyword"
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

      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="displayName" label="作者" width="120" />
        <el-table-column label="内容预览" min-width="300" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="content-preview">
              <div><strong>{{ row.title }}</strong></div>
              <div>{{ truncateContent(row.content) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="图片" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.images && row.images.length > 0"
              :src="row.images[0]?.trim()"
              :preview-src-list="row.images.map((img: string) => img.trim())"
              fit="cover"
              style="width: 60px; height: 60px; cursor: pointer"
            />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="浏览量" width="80" />
        <el-table-column prop="likeCount" label="点赞数" width="80" />
        <el-table-column prop="commentCount" label="评论数" width="80" />
        <el-table-column prop="favoriteCount" label="收藏数" width="80" />
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

    <PostDetailDialog
      v-model="detailDialog.visible"
      :post-data="detailDialog.postData"
      :is-edit="detailDialog.isEdit"
      @close="handleDetailClose"
      @refresh="refresh"
    />
    <PostCreateDialog
      v-model="createDialog.visible"
      @success="refresh"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { useTable } from '@/composables/useTable'
import { getPostList, deletePost, type PostItem } from '@/api/community/post'
import PostDetailDialog from './components/PostDetailDialog.vue'
import PostCreateDialog from './components/PostCreateDialog.vue'

const createDialog = reactive({ visible: false })

const detailDialog = reactive({
  visible: false,
  postData: null as PostItem | null,
  isEdit: false,
})

const { loading, tableData, total, query, loadData, handleSearch, handleReset, refresh } = useTable<
  PostItem,
  { page: number; pageSize: number; keyword: string }
>({
  initialQuery: () => ({
    page: 1,
    pageSize: 10,
    keyword: '',
  }),
  fetchApi: async (params) => {
    const res = await getPostList({
      ...params,
      keyword: params.keyword || undefined,
      sort: 'latest',
    })
    return res.data
  },
  errorMessage: '加载列表失败',
})

const truncateContent = (content: string, length = 100) => {
  if (!content) return ''
  return content.length > length ? `${content.substring(0, length)}...` : content
}

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const handleCreate = () => {
  createDialog.visible = true
}

const handleView = (row: PostItem) => {
  detailDialog.postData = row
  detailDialog.isEdit = false
  detailDialog.visible = true
}

const handleEdit = (row: PostItem) => {
  detailDialog.postData = row
  detailDialog.isEdit = true
  detailDialog.visible = true
}

const handleDetailClose = () => {
  detailDialog.visible = false
  detailDialog.postData = null
  detailDialog.isEdit = false
}

const handleDelete = async (row: PostItem) => {
  await ElMessageBox.confirm('确定要删除该帖子吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
  try {
    await deletePost(row.id)
    ElMessage.success('删除成功')
    refresh()
  } catch {
    ElMessage.error('删除失败')
  }
}
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
