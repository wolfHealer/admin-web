<template>
  <el-dialog
    v-model="dialogVisible"
    title="举报审核"
    width="860px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="loading">
      <el-descriptions v-if="report" :column="2" border class="section-block">
        <el-descriptions-item label="举报 ID">{{ report.id }}</el-descriptions-item>
        <el-descriptions-item label="举报时间">{{ formatDateTime(report.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="举报人">
          {{ report.reporterName || `用户 #${report.reporterId}` }}
        </el-descriptions-item>
        <el-descriptions-item label="举报人手机">{{ report.reporterPhone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="举报类型">
          <el-tag type="danger">{{ getReportReasonLabel(report.reasonType) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="当前状态">
          <el-tag :type="getReportStatusMeta(report.status).tag">
            {{ getReportStatusMeta(report.status).label }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="补充说明" :span="2">
          {{ report.description || '无' }}
        </el-descriptions-item>
      </el-descriptions>

      <el-card shadow="never" class="section-block">
        <template #header>
          <span>被举报帖子</span>
        </template>
        <el-descriptions v-if="postDetail" :column="2" border>
          <el-descriptions-item label="帖子 ID">{{ postDetail.id }}</el-descriptions-item>
          <el-descriptions-item label="作者">{{ postDetail.displayName }}</el-descriptions-item>
          <el-descriptions-item label="标题" :span="2">{{ postDetail.title || '-' }}</el-descriptions-item>
          <el-descriptions-item label="内容" :span="2">
            <div class="post-content">{{ postDetail.content }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="图片" :span="2" v-if="postDetail.images?.length">
            <div class="image-list">
              <el-image
                v-for="(img, index) in postDetail.images"
                :key="index"
                :src="img"
                :preview-src-list="postDetail.images"
                fit="cover"
                style="width: 80px; height: 80px; margin-right: 8px; cursor: pointer"
              />
            </div>
          </el-descriptions-item>
        </el-descriptions>
        <el-empty v-else description="帖子不存在或已被删除" />
      </el-card>

      <el-form v-if="report?.status === 0" :model="form" label-width="100px" class="section-block">
        <el-form-item label="审核结果" required>
          <el-radio-group v-model="form.status">
            <el-radio :value="1">确认违规</el-radio>
            <el-radio :value="2">驳回举报</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.status === 1" label="帖子处理">
          <el-checkbox v-model="form.removePost">同时下架/删除该帖子</el-checkbox>
        </el-form-item>
        <el-form-item label="处理备注">
          <el-input
            v-model="form.handleNote"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="可选，记录审核说明"
          />
        </el-form-item>
      </el-form>

      <el-descriptions v-else-if="report" :column="1" border class="section-block">
        <el-descriptions-item label="处理人">{{ report.handlerName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="处理时间">{{ formatDateTime(report.handledAt) }}</el-descriptions-item>
        <el-descriptions-item label="处理备注">{{ report.handleNote || '-' }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
      <el-button
        v-if="report?.status === 0"
        type="primary"
        :loading="submitting"
        @click="handleSubmit"
      >
        提交审核
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { PostItem } from '@/api/community/post'
import {
  getPostReportDetail,
  handlePostReport,
  loadReportPostDetail,
  getReportReasonLabel,
  getReportStatusMeta,
  type PostReportItem,
} from '@/api/community/postReport'

interface Props {
  modelValue: boolean
  reportId: number | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const loading = ref(false)
const submitting = ref(false)
const report = ref<PostReportItem | null>(null)
const postDetail = ref<PostItem | null>(null)

const form = reactive({
  status: 1 as 1 | 2,
  removePost: true,
  handleNote: '',
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

const resetForm = () => {
  form.status = 1
  form.removePost = true
  form.handleNote = ''
}

const loadDetail = async () => {
  if (!props.reportId) return
  loading.value = true
  report.value = null
  postDetail.value = null
  try {
    const res = await getPostReportDetail(props.reportId)
    report.value = res.data
    postDetail.value = await loadReportPostDetail(res.data.postId)
  } catch {
    ElMessage.error('加载举报详情失败')
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!report.value) return

  const actionText =
    form.status === 1
      ? form.removePost
        ? '确认违规并下架该帖子'
        : '确认违规（保留帖子）'
      : '驳回该举报'

  await ElMessageBox.confirm(`确定要${actionText}吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })

  submitting.value = true
  try {
    await handlePostReport(report.value.id, {
      status: form.status,
      handleNote: form.handleNote || undefined,
      removePost: form.status === 1 ? form.removePost : undefined,
    })
    ElMessage.success('审核提交成功')
    emit('success')
    handleClose()
  } catch {
    ElMessage.error('审核提交失败')
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  dialogVisible.value = false
  report.value = null
  postDetail.value = null
  resetForm()
}

watch(
  () => [props.modelValue, props.reportId] as const,
  ([visible, reportId]) => {
    if (visible && reportId) {
      resetForm()
      loadDetail()
    }
  }
)
</script>

<style lang="scss" scoped>
.section-block {
  margin-bottom: 16px;
}

.post-content {
  white-space: pre-wrap;
  line-height: 1.6;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
