<!-- src/views/resource/charity/components/RehabilitationGuideViewDialog.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="康复指南详情"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-descriptions :column="1" border v-if="viewData">
      <el-descriptions-item label="指南标题">{{ viewData.title }}</el-descriptions-item>
      <el-descriptions-item label="分类">{{ viewData.category }}</el-descriptions-item>
      <el-descriptions-item label="难度等级">{{ viewData.difficulty }}</el-descriptions-item>
      <el-descriptions-item label="训练时长">{{ viewData.duration }}</el-descriptions-item>
      <el-descriptions-item label="详细描述">{{ viewData.description }}</el-descriptions-item>
      <el-descriptions-item label="视频链接">
        <el-link v-if="viewData.videoUrl" :href="viewData.videoUrl" target="_blank" type="primary">查看视频</el-link>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="文件链接">
        <el-link v-if="viewData.fileUrl" :href="viewData.fileUrl" target="_blank" type="primary">下载文件</el-link>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="viewData.status === 1 ? 'success' : 'danger'">
          {{ viewData.status === 1 ? '启用' : '停用' }}
        </el-tag>
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button type="primary" @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { RehabilitationGuideItem } from '@/api/resource/charity/rehabilitationGuide'

interface Props {
  modelValue: boolean
  viewData?: RehabilitationGuideItem | null
}

const props = withDefaults(defineProps<Props>(), {
  viewData: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const dialogVisible = ref(false)

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