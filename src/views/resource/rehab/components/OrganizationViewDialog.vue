<!-- src/views/resource/rehab/organization/components/OrganizationViewDialog.vue -->
<!-- src/views/resource/rehab/components/OrganizationViewDialog.vue -->
<template>
  <el-dialog v-model="dialogVisible" title="康复机构详情" width="800px">
    <el-descriptions :column="1" border v-if="viewData">
      <el-descriptions-item label="机构名称">{{ viewData.title }}</el-descriptions-item>
      <el-descriptions-item label="机构类型">{{ viewData.organization }}</el-descriptions-item>
      <el-descriptions-item label="资质评级">
        <el-tag type="warning">{{ viewData.qualification || '未评级' }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="联系方式">{{ viewData.contactInfo }}</el-descriptions-item>
      <el-descriptions-item label="服务区域">{{ viewData.region }}</el-descriptions-item>
      <el-descriptions-item label="服务范围">{{ viewData.serviceScope || '-' }}</el-descriptions-item>
      <el-descriptions-item label="机构描述">{{ viewData.description }}</el-descriptions-item>
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
import type { OrganizationItem } from '@/api/resource/rehab/organization'

interface Props {
  modelValue: boolean
  viewData?: OrganizationItem | null
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