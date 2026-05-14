<template>
  <el-dialog
    v-model="dialogVisible"
    title="康复训练指南详情"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-descriptions v-if="viewData" :column="1" border>
      <!-- 修改点：viewData.rehabStage -->
      <el-descriptions-item label="康复阶段">{{ getRehabStageLabel(viewData.rehabStage) }}</el-descriptions-item>
      <el-descriptions-item label="指南标题">{{ viewData.title || '-' }}</el-descriptions-item>
      <!-- 修改点：viewData.trainPurpose -->
      <el-descriptions-item label="训练目的">{{ viewData.trainPurpose || '-' }}</el-descriptions-item>
      <!-- 修改点：viewData.trainContent -->
      <el-descriptions-item label="训练内容">
        <div class="multiline">{{ viewData.trainContent || '-' }}</div>
      </el-descriptions-item>
      <!-- 修改点：viewData.forbiddenAction -->
      <el-descriptions-item label="禁忌动作">
        <div class="multiline">{{ viewData.forbiddenAction || '-' }}</div>
      </el-descriptions-item>
      <el-descriptions-item label="适用疾病">
        <div v-if="viewData.diseases?.length" class="tag-wrap">
          <el-tag v-for="item in viewData.diseases" :key="item.id">{{ item.name }}</el-tag>
        </div>
        <span v-else>-</span>
      </el-descriptions-item>
      <!-- 修改点：viewData.picUrls -->
      <el-descriptions-item label="图片链接">
        <div v-if="viewData.picUrls?.length" class="file-list">
          <div v-for="(item, index) in viewData.picUrls" :key="index">
            <el-link :href="item" target="_blank" type="primary">图片 {{ index + 1 }}</el-link>
          </div>
        </div>
        <span v-else>-</span>
      </el-descriptions-item>
      <!-- 修改点：viewData.guidePdf -->
      <el-descriptions-item label="PDF 下载">
        <el-link v-if="viewData.guidePdf" :href="viewData.guidePdf" target="_blank" type="primary">下载 PDF</el-link>
        <span v-else>-</span>
      </el-descriptions-item>
      <!-- 修改点：viewData.guideWord -->
      <el-descriptions-item label="Word 下载">
        <el-link v-if="viewData.guideWord" :href="viewData.guideWord" target="_blank" type="primary">下载 Word</el-link>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="排序">{{ viewData.sort ?? 0 }}</el-descriptions-item>
      <!-- 修改点：viewData.auditStatus -->
      <el-descriptions-item label="审核状态">
        <el-tag :type="getAuditStatusType(viewData.auditStatus)">{{ getAuditStatusLabel(viewData.auditStatus) }}</el-tag>
      </el-descriptions-item>
      <!-- 修改点：viewData.auditStatus === 2, viewData.rejectReason -->
      <el-descriptions-item v-if="viewData.auditStatus === 2" label="驳回原因">{{ viewData.rejectReason || '-' }}</el-descriptions-item>
      <!-- 修改点：viewData.createdAt -->
      <el-descriptions-item label="创建时间">{{ viewData.createdAt || '-' }}</el-descriptions-item>
      <!-- 修改点：viewData.updatedAt -->
      <el-descriptions-item label="更新时间">{{ viewData.updatedAt || '-' }}</el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button type="primary" @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { RehabTrainGuideItem } from '@/api/resource/rehab/rehabGuide'

interface Props {
  modelValue: boolean
  viewData?: RehabTrainGuideItem | null
}

const props = withDefaults(defineProps<Props>(), {
  viewData: null,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const dialogVisible = ref(false)

const rehabStageOptions = [
  { label: '早期', value: 'early' },
  { label: '中期', value: 'middle' },
  { label: '晚期', value: 'late' },
  { label: '稳定期', value: 'stable' },
  { label: '进展期', value: 'progressive' },
]

const getRehabStageLabel = (value: string) => {
  return rehabStageOptions.find((item) => item.value === value)?.label || value || '-'
}

const getAuditStatusLabel = (value: number) => {
  return value === 1 ? '已通过' : value === 2 ? '已驳回' : '待审核'
}

const getAuditStatusType = (value: number) => {
  return value === 1 ? 'success' : value === 2 ? 'danger' : 'warning'
}

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

const handleClose = () => {
  dialogVisible.value = false
}
</script>

<style scoped>
.multiline {
  white-space: pre-wrap;
  line-height: 1.7;
}

.tag-wrap {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
</style>