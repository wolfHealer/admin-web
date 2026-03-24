<template>
  <el-dialog
    v-model="dialogVisible"
    title="罕见药品详情"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-descriptions :column="1" border>
      <el-descriptions-item label="药品名称">
        {{ viewData.name }}
      </el-descriptions-item>
      <el-descriptions-item label="剂型">
        {{ viewData.dosageForm }}
      </el-descriptions-item>
      <el-descriptions-item label="规格">
        {{ viewData.spec }}
      </el-descriptions-item>
      <el-descriptions-item label="适应症">
        {{ viewData.indication }}
      </el-descriptions-item>
      <el-descriptions-item label="药品类型">
        <el-tag :type="getDrugTypeTag(viewData.type)">
          {{ getDrugTypeLabel(viewData.type) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="参考价格">
        ¥{{ viewData.refPrice }}
      </el-descriptions-item>
      <el-descriptions-item label="是否医保">
        <el-tag :type="viewData.insurance ? 'success' : 'info'">
          {{ viewData.insurance ? '是' : '否' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="是否有救助">
        <el-tag :type="viewData.hasRelief ? 'success' : 'info'">
          {{ viewData.hasRelief ? '是' : '否' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="是否上市">
        <el-tag :type="viewData.isLaunched ? 'success' : 'info'">
          {{ viewData.isLaunched ? '是' : '否' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="需处方">
        <el-tag :type="viewData.needPrescription ? 'warning' : 'info'">
          {{ viewData.needPrescription ? '是' : '否' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="说明书链接">
        <el-link v-if="viewData.manualUrl" :href="viewData.manualUrl" target="_blank" type="primary">
          查看说明书
        </el-link>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="描述">
        {{ viewData.desc || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ viewData.createdAt || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="更新时间">
        {{ viewData.updatedAt || '-' }}
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button type="primary" @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { RareDrugItem } from '@/api/resource/drug/rareDrug'

interface Props {
  modelValue: boolean
  viewData?: RareDrugItem | null
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

const getDrugTypeLabel = (type: string): string => {
  const map: Record<string, string> = {
    imported: '进口药',
    domestic: '国产药',
    special: '特殊药品'
  }
  return map[type] || type
}

const getDrugTypeTag = (type: string): string => {
  const map: Record<string, string> = {
    imported: 'warning',
    domestic: 'success',
    special: 'danger'
  }
  return map[type] || 'info'
}
</script>