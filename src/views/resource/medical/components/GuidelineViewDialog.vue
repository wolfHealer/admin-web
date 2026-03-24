<!-- src/views/resource/components/GuidelineViewDialog.vue -->
<template>
  <el-dialog v-model="visible" title="指南详情" width="800px">
    <el-descriptions :column="1" border>
      <el-descriptions-item label="指南名称">
        <span class="detail-value">{{ data.title }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="发布机构">
        <el-tag type="info">{{ data.org }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="版本年份">
        <el-tag>{{ data.year }}版</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="摘要">
        <span class="detail-value">{{ data.summary || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="data.status === 1 ? 'success' : 'danger'">
          {{ data.status === 1 ? '启用' : '停用' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ data.createdAt ? formatDate(data.createdAt) : '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="更新时间">
        {{ data.updatedAt ? formatDate(data.updatedAt) : '-' }}
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: boolean
  data: any
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style lang="scss" scoped>
.detail-value {
  line-height: 1.6;
  word-break: break-all;
}
</style>