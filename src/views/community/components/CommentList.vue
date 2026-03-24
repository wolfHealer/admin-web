<!-- src/views/community/components/CommentList.vue -->
<template>
  <div class="comment-section">
    <div class="comment-header">
      <span>评论管理 ({{ total }}条)</span>
      <el-input
        v-model="keyword"
        placeholder="搜索评论内容"
        clearable
        style="width: 200px"
        @clear="handleSearch"
      />
      <el-button type="primary" @click="handleSearch">查询</el-button>
    </div>

    <el-table
      :data="commentData"
      v-loading="loading"
      style="margin-top: 15px"
      row-key="id"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="displayName" label="评论者" width="120" />
      <el-table-column prop="content" label="评论内容" min-width="250" show-overflow-tooltip />
      <el-table-column prop="likeCount" label="点赞数" width="80" />
      <el-table-column prop="createdAt" label="评论时间" width="180">
        <template #default="{ row }">
          {{ formatDateTime(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button link type="warning" @click="handleEdit(row)">修改</el-button>
          <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 评论分页 -->
    <div class="pagination-wrapper" v-if="showPagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCommentList, deleteComment, updateComment } from '@/api/community/post'

export interface CommentItem {
  id: number
  postId: number
  userId: number
  displayName: string
  content: string
  likeCount: number
  createdAt: string
  parentId?: number
  children?: CommentItem[]
}

interface Props {
  postId: number
  showPagination?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showPagination: true
})

const emit = defineEmits<{
  refresh: []
}>()

const loading = ref(false)
const commentData = ref<CommentItem[]>([])
const keyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

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

// 加载评论列表
const loadComments = async () => {
  if (!props.postId) return
  loading.value = true
  try {
    const res = await getCommentList({
      postId: props.postId,
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: keyword.value
    })
    if ((res as any).code === 200 && (res as any).data) {
      commentData.value = (res as any).data || []
      total.value = (res as any).data?.length || 0
    }
  } catch (error) {
    console.error('加载评论失败:', error)
    ElMessage.error('加载评论失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  loadComments()
}

const handlePageChange = () => {
  loadComments()
}

// 修改评论
const handleEdit = async (row: CommentItem) => {
  const newContent = prompt('请输入新的评论内容:', row.content)
  if (!newContent || newContent === row.content) return
  try {
    await updateComment(row.id, { content: newContent })
    ElMessage.success('修改成功')
    loadComments()
    emit('refresh')
  } catch (error) {
    ElMessage.error('修改失败')
  }
}

// 删除评论
const handleDelete = async (row: CommentItem) => {
  await ElMessageBox.confirm(`确定要删除该评论吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  try {
    await deleteComment(row.id)
    ElMessage.success('删除成功')
    loadComments()
    emit('refresh')
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 监听 postId 变化，自动加载评论
watch(() => props.postId, (val) => {
  if (val) {
    loadComments()
  }
}, { immediate: true })

// 暴露刷新方法给父组件
defineExpose({
  refresh: loadComments
})
</script>

<style lang="scss" scoped>
.comment-section {
  .comment-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 15px;
  }
}
</style>