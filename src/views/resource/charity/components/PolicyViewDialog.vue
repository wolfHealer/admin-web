<!-- src/views/resource/charity/components/PolicyViewDialog.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="政策解读详情"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-descriptions :column="1" border v-if="data">
      <el-descriptions-item label="政策标题">{{ data.title }}</el-descriptions-item>
      <el-descriptions-item label="政策类型">{{ data.policyType }}</el-descriptions-item>
      <el-descriptions-item label="适用地区">{{ data.region }}</el-descriptions-item>
      <el-descriptions-item label="政策内容">{{ data.content || '-' }}</el-descriptions-item>
      <el-descriptions-item label="文件链接">
        <el-link v-if="data.fileUrl" :href="data.fileUrl" target="_blank" type="primary">
          查看文件
        </el-link>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="data.status === 1 ? 'success' : 'danger'">
          {{ data.status === 1 ? '启用' : '停用' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="发布时间">{{ formatDateTime(data.uploadTime) }}</el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button type="primary" @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { CharityPolicy } from '@/api/resource/charity/charity'

interface Props {
  modelValue: boolean
  data: CharityPolicy | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  data: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const dialogVisible = ref(false)

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
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