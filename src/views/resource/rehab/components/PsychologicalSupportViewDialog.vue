<!-- src/views/resource/rehab/components/PsychologicalSupportViewDialog.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="心理咨询机构详情"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-descriptions :column="1" border v-if="viewData">
      <el-descriptions-item label="机构名称">{{ viewData.title }}</el-descriptions-item>
      <el-descriptions-item label="机构类型">{{ viewData.resourceType }}</el-descriptions-item>
      <el-descriptions-item label="服务区域">{{ viewData.region }}</el-descriptions-item>
      <el-descriptions-item label="联系方式">
        <div style="white-space: pre-wrap">{{ viewData.contactInfo }}</div>
      </el-descriptions-item>
      <el-descriptions-item label="服务时间">{{ viewData.serviceHours }}</el-descriptions-item>
      <el-descriptions-item label="服务描述">
        <div style="white-space: pre-wrap">{{ viewData.description }}</div>
      </el-descriptions-item>
      <el-descriptions-item label="是否免费">
        <el-tag :type="viewData.isFree ? 'success' : 'warning'">
          {{ viewData.isFree ? '免费' : '收费' }}
        </el-tag>
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
import type { PsychologicalSupportItem } from '@/api/resource/rehab/psychologicalSupport'

interface Props {
  modelValue: boolean
  viewData?: PsychologicalSupportItem | null
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