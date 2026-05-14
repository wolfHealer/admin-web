<template>
  <el-dialog
    :model-value="modelValue"
    title="区域详情"
    width="560px"
    @close="handleClose"
  >
    <el-descriptions v-loading="loading" :column="1" border>
      <el-descriptions-item label="ID">{{ detail.id || '-' }}</el-descriptions-item>
      <el-descriptions-item label="编码">{{ detail.code || '-' }}</el-descriptions-item>
      <el-descriptions-item label="简称">{{ detail.name || '-' }}</el-descriptions-item>
      <el-descriptions-item label="全称">{{ detail.fullName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="父级编码">{{ detail.parentCode || '-' }}</el-descriptions-item>
      <el-descriptions-item label="层级">{{ levelText(detail.level) }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="detail.isEnabled === 1 ? 'success' : 'danger'">
          {{ detail.isEnabled === 1 ? '启用' : '禁用' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="排序">{{ detail.sort ?? '-' }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ detail.createdAt || '-' }}</el-descriptions-item>
      <el-descriptions-item label="更新时间">{{ detail.updatedAt || '-' }}</el-descriptions-item>
    </el-descriptions>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { getRegionDetail, type RegionItem } from '@/api/region/region'

const props = defineProps<{
  modelValue: boolean
  id: number | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
}>()

const loading = ref(false)
const detail = reactive<Partial<RegionItem>>({})

const levelText = (level?: number) => {
  if (level === 1) return '省级'
  if (level === 2) return '市级'
  if (level === 3) return '区县'
  return '-'
}

const loadDetail = async () => {
  if (!props.id) return
  loading.value = true
  try {
    const res = await getRegionDetail(props.id)
    Object.assign(detail, res.data || {})
  } finally {
    loading.value = false
  }
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) loadDetail()
  }
)

const handleClose = () => {
  emit('update:modelValue', false)
}
</script>