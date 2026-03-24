<!-- src/views/community/components/PostDetailDialog.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '修改帖子' : '帖子详情与评论管理'"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 帖子信息 -->
    <el-card class="post-info-card" v-if="postData">
      <template #header>
        <div class="post-header">
          <span>帖子信息</span>
          <el-tag :type="postData.isLiked ? 'danger' : 'info'">
            {{ postData.isLiked ? '已点赞' : '未点赞' }}
          </el-tag>
        </div>
      </template>
      
      <!-- 编辑模式 -->
      <el-form v-if="isEdit" :model="editForm" label-width="100px">
        <el-form-item label="内容">
          <el-input
            v-model="editForm.content"
            type="textarea"
            :rows="6"
            placeholder="请输入帖子内容"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmitEdit">保存修改</el-button>
          <el-button @click="cancelEdit">取消</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 查看模式 -->
      <el-descriptions v-else :column="2" border>
        <el-descriptions-item label="ID">{{ postData.id }}</el-descriptions-item>
        <el-descriptions-item label="用户 ID">{{ postData.userId }}</el-descriptions-item>
        <el-descriptions-item label="作者">{{ postData.displayName }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ formatDateTime(postData.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="点赞数">{{ postData.likeCount }}</el-descriptions-item>
        <el-descriptions-item label="评论数">{{ postData.commentCount }}</el-descriptions-item>
        <el-descriptions-item label="内容" :span="2">
          <div class="post-content">{{ postData.content }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="图片" :span="2" v-if="postData.images && postData.images.length > 0">
          <div class="image-list">
            <el-image
              v-for="(img, index) in postData.images"
              :key="index"
              :src="img"
              :preview-src-list="postData.images"
              fit="cover"
              style="width: 100px; height: 100px; margin-right: 10px; cursor: pointer"
            />
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 评论列表 -->
     <CommentList
      v-if="!isEdit && postData"
      :post-id="postData.id"
      :show-pagination="false"
      @refresh="emit('refresh')"
    />
   
    <template #footer>
      <el-button type="primary" @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getCommentList,
  deleteComment,
  updatePost,
  updateComment
} from '@/api/community/post'

import CommentList from './CommentList.vue'

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

interface CommentItem {
  id: number
  postId: number
  userId: number
  displayName: string
  content: string
  likeCount: number
  createdAt: string
}

interface Props {
  modelValue: boolean
  postData: PostItem | null
  isEdit: boolean
}

const props = withDefaults(defineProps<Props>(), {
  postData: null,
  isEdit: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  refresh: []
}>()

const dialogVisible = ref(false)
const commentLoading = ref(false)
const commentData = ref<CommentItem[]>([])
const editForm = reactive({
  content: ''
})

const commentPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const commentFilters = reactive({
  keyword: '',
  postId: 0
})

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
  if (val && props.postData) {
    commentFilters.postId = props.postData.id
    if (!props.isEdit) {
      loadComments()
    } else {
      editForm.content = props.postData.content
    }
  }
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

// 监听 isEdit 变化
watch(() => props.isEdit, (val) => {
  if (val && props.postData) {
    editForm.content = props.postData.content
  } else if (props.postData) {
    loadComments()
  }
})

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
  if (!props.postData) return
  commentLoading.value = true
  try {
    const res = await getCommentList({
      postId: props.postData.id,
      page: commentPagination.currentPage,
      pageSize: commentPagination.pageSize,
      ...commentFilters
    })
    console.log('评论 API 返回:', res)
    if ((res as any).code === 200 && (res as any).data) {
      commentData.value = (res as any).data.records || (res as any).data.list || []
      commentPagination.total = (res as any).data.total || 0
    }
  } catch (error) {
    console.error('加载评论失败:', error)
    ElMessage.error('加载评论失败')
  } finally {
    commentLoading.value = false
  }
}

// 提交帖子修改
const handleSubmitEdit = async () => {
  if (!props.postData) return
  try {
    await updatePost(props.postData.id, { content: editForm.content })
    ElMessage.success('修改成功')
    emit('refresh')
    handleClose()
  } catch (error) {
    ElMessage.error('修改失败')
  }
}

// 取消修改
const cancelEdit = () => {
  emit('close')
}

// 修改评论
const handleEditComment = async (row: CommentItem) => {
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
const handleDeleteComment = async (row: CommentItem) => {
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

const handleClose = () => {
  dialogVisible.value = false
  emit('close')
}
</script>

<style lang="scss" scoped>
.post-info-card {
  margin-bottom: 20px;

  .post-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .post-content {
    line-height: 1.8;
    white-space: pre-wrap;
    max-height: 300px;
    overflow-y: auto;
  }

  .image-list {
    display: flex;
    flex-wrap: wrap;
  }
}

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