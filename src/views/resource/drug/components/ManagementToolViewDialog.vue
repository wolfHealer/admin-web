<!-- src/views/resource/components/ManagementToolViewDialog.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="用药管理工具详情"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-descriptions :column="1" border v-if="props.data">
      <el-descriptions-item label="工具名称">
        {{ props.data.title }}
      </el-descriptions-item>
      <el-descriptions-item label="工具类型">
        {{ props.data.toolType }}
      </el-descriptions-item>
      <el-descriptions-item label="疾病类型">
        {{ getDiseaseLabel(props.data.diseaseValue) }}
      </el-descriptions-item>
      <el-descriptions-item label="描述">
        {{ props.data.description }}
      </el-descriptions-item>
      <el-descriptions-item label="文件下载">
        <div v-if="props.data.files && props.data.files.length > 0">
          <el-link
            v-for="file in props.data.files"
            :key="file.downloadUrl"
            :href="file.downloadUrl"
            target="_blank"
            type="primary"
            style="margin-right: 15px; margin-bottom: 10px; display: inline-block"
          >
            <el-icon><Document /></el-icon>
            {{ file.title }} ({{ file.fileType }})
          </el-link>
        </div>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="更新时间">
        {{ props.data.updatedAt || '-' }}
      </el-descriptions-item>
    </el-descriptions>

    <template #footer>
      <el-button type="primary" @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Document } from '@element-plus/icons-vue'
import type { ManagementToolItem } from '@/api/resource/drug/managementTool'

interface Props {
  modelValue: boolean
  data: ManagementToolItem | null
}

const props = withDefaults(defineProps<Props>(), {
  data: null
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

const getDiseaseLabel = (value: number): string => {
  const map: Record<number, string> = {
    1: '糖尿病',
    2: '高血压',
    3: '戈谢病',
    4: '哮喘'
  }
  return map[value] || '未知'
}
</script>