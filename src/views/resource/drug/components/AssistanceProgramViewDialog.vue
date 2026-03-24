<template>
  <el-dialog
    v-model="dialogVisible"
    title="援助项目详情"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-descriptions :column="1" border v-if="viewData">
      <el-descriptions-item label="项目名称">
        {{ viewData.name }}
      </el-descriptions-item>
      <el-descriptions-item label="组织机构">
        {{ viewData.organizer }}
      </el-descriptions-item>
      <el-descriptions-item label="疾病类型">
        {{ getDiseaseLabel(viewData.diseaseValue) }}
      </el-descriptions-item>
      <el-descriptions-item label="赠药剂量">
        {{ viewData.dosage }}
      </el-descriptions-item>
      <el-descriptions-item label="援助周期">
        {{ viewData.period }}
      </el-descriptions-item>
      <el-descriptions-item label="申请条件">
        {{ viewData.condition }}
      </el-descriptions-item>
      <el-descriptions-item label="进度查询">
        {{ viewData.progressQuery }}
      </el-descriptions-item>
      <el-descriptions-item label="申请表">
        <el-link v-if="viewData.applyForm" :href="viewData.applyForm" target="_blank" type="primary">
          下载申请表
        </el-link>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="申请指南">
        <el-link v-if="viewData.applyGuide" :href="viewData.applyGuide" target="_blank" type="primary">
          下载申请指南
        </el-link>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="材料清单">
        <el-link v-if="viewData.materialList" :href="viewData.materialList" target="_blank" type="primary">
          下载材料清单
        </el-link>
        <span v-else>-</span>
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
import type { AssistanceProgramItem } from '@/api/resource/drug/assistanceProgram'

interface Props {
  modelValue: boolean
  viewData?: AssistanceProgramItem | null
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

const getDiseaseLabel = (value: number): string => {
  const map: Record<number, string> = {
    1: '非小细胞肺癌',
    2: '血友病',
    3: '戈谢病',
    4: '乳腺癌'
  }
  return map[value] || '未知'
}
</script>