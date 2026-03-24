<!-- src/views/resource/rehab/components/ManualViewDialog.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="护理手册详情"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-descriptions :column="1" border v-if="viewData">
      <el-descriptions-item label="手册标题">{{ viewData.title }}</el-descriptions-item>
      <el-descriptions-item label="分类">{{ getCategoryLabel(viewData.category) }}</el-descriptions-item>
      <el-descriptions-item label="护理内容" :span="3">
        <div style="white-space: pre-wrap">{{ viewData.content }}</div>
      </el-descriptions-item>
      <el-descriptions-item label="图标">{{ viewData.icon }}</el-descriptions-item>
      <el-descriptions-item label="排序">{{ viewData.sort }}</el-descriptions-item>
      <el-descriptions-item label="更新时间">{{ formatTime(viewData.updateTime) }}</el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button type="primary" @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ManualItem } from '@/api/resource/rehab/manuals'

interface Props {
  modelValue: boolean
  viewData?: ManualItem | null
}

const props = withDefaults(defineProps<Props>(), {
  viewData: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const dialogVisible = ref(false)

// 分类标签映射
const getCategoryLabel = (category: string) => {
  const map: Record<string, string> = {
    diet: '饮食指导',
    skin: '皮肤护理',
    oral: '口腔护理',
    rehab: '康复训练',
    bed: '卧床护理',
    medication: '用药指导',
    psychology: '心理支持'
  }
  return map[category] || category
}

// 时间格式化
const formatTime = (timeStr: string) => {
  if (!timeStr) return '-'
  const date = new Date(timeStr)
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