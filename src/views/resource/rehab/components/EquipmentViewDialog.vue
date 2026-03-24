<!-- src/views/resource/rehab/components/EquipmentViewDialog.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="康复设备详情"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-descriptions :column="1" border v-if="viewData">
      <el-descriptions-item label="设备名称">{{ viewData.title }}</el-descriptions-item>
      <el-descriptions-item label="设备分类">{{ viewData.equipmentModel || '-' }}</el-descriptions-item>
      <el-descriptions-item label="价格范围">{{ viewData.priceRange || '-' }}</el-descriptions-item>
      <el-descriptions-item label="是否医保">
        <el-tag :type="viewData.insuranceCovered ? 'success' : 'info'">
          {{ viewData.insuranceCovered ? '是' : '否' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="适用人群">{{ viewData.suitableFor || '-' }}</el-descriptions-item>
      <el-descriptions-item label="设备描述">{{ viewData.description }}</el-descriptions-item>
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
import type { EquipmentItem } from '@/api/resource/rehab/equipment'

interface Props {
  modelValue: boolean
  viewData?: EquipmentItem | null
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