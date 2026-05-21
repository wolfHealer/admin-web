<!-- src/views/community/components/PostDetailDialog.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '修改帖子' : '帖子详情与评论管理'"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-card class="post-info-card" v-if="postData">
      <template #header>
        <div class="post-header">
          <span>帖子信息</span>
          <el-tag :type="postData.isLiked ? 'danger' : 'info'">
            {{ postData.isLiked ? '已点赞' : '未点赞' }}
          </el-tag>
        </div>
      </template>

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
        <el-descriptions-item label="图片" :span="2" v-if="postData.images?.length">
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
import { ElMessage } from 'element-plus'
import { updatePost, type PostItem } from '@/api/community/post'
import CommentList from './CommentList.vue'

interface Props {
  modelValue: boolean
  postData: PostItem | null
  isEdit: boolean
}

const props = withDefaults(defineProps<Props>(), {
  postData: null,
  isEdit: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  close: []
  refresh: []
}>()

const dialogVisible = ref(false)
const editForm = reactive({ content: '' })

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
  if (val && props.postData) {
    editForm.content = props.postData.content
  }
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

watch(() => props.isEdit, (val) => {
  if (val && props.postData) {
    editForm.content = props.postData.content
  }
})

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

const handleSubmitEdit = async () => {
  if (!props.postData) return
  try {
    await updatePost(props.postData.id, { content: editForm.content })
    ElMessage.success('修改成功')
    emit('refresh')
    handleClose()
  } catch {
    ElMessage.error('修改失败')
  }
}

const cancelEdit = () => {
  emit('close')
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
</style>
