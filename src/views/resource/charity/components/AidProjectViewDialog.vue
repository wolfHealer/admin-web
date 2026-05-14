<template>
  <el-dialog :model-value="modelValue" title="救助项目详情" width="820px" @close="emit('update:modelValue', false)">
    <el-descriptions v-loading="loading" :column="2" border>
      <el-descriptions-item label="项目名称">{{ detail?.name || '-' }}</el-descriptions-item>
      <el-descriptions-item label="主办机构">{{ detail?.organizer || '-' }}</el-descriptions-item>
      <el-descriptions-item label="救助类型">{{ reliefTypeMap[detail?.reliefType || ''] || detail?.reliefType || '-' }}</el-descriptions-item>
      <el-descriptions-item label="申请难度">{{ difficultyMap[detail?.applyDifficulty || ''] || detail?.applyDifficulty || '-' }}</el-descriptions-item>
      <el-descriptions-item label="截止日期">{{ detail?.applyDeadline || '长期有效' }}</el-descriptions-item>
      <el-descriptions-item label="排序">{{ detail?.sort ?? '-' }}</el-descriptions-item>
      <el-descriptions-item label="关联疾病" :span="2">
        <el-tag v-for="item in detail?.diseases || []" :key="item.id" class="mr-8 mb-8">{{ item.name }}</el-tag>
        <span v-if="!(detail?.diseases || []).length">-</span>
      </el-descriptions-item>
      <el-descriptions-item label="申请条件" :span="2">{{ detail?.applyCondition || '-' }}</el-descriptions-item>
      <el-descriptions-item label="救助标准" :span="2">{{ detail?.reliefStandard || '-' }}</el-descriptions-item>
      <el-descriptions-item label="申请流程" :span="2">{{ detail?.applyProcess || '-' }}</el-descriptions-item>
      <el-descriptions-item label="申请表">{{ detail?.applyForm || '-' }}</el-descriptions-item>
      <el-descriptions-item label="申请指南">{{ detail?.applyGuide || '-' }}</el-descriptions-item>
      <el-descriptions-item label="材料清单">{{ detail?.materialList || '-' }}</el-descriptions-item>
      <el-descriptions-item label="咨询电话">{{ detail?.contactPhone || '-' }}</el-descriptions-item>
      <el-descriptions-item label="咨询链接" :span="2">{{ detail?.contactUrl || '-' }}</el-descriptions-item>
      <el-descriptions-item label="审核状态">{{ auditText(detail?.auditStatus) }}</el-descriptions-item>
      <el-descriptions-item label="驳回原因">{{ detail?.rejectReason || '-' }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ detail?.createdAt || '-' }}</el-descriptions-item>
      <el-descriptions-item label="更新时间">{{ detail?.updatedAt || '-' }}</el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { getReliefProjectDetail, type ReliefProjectItem } from '@/api/resource/charity/project'

const props = defineProps<{ modelValue: boolean; projectId?: number }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()

const detail = ref<ReliefProjectItem>()
const loading = ref(false)

const reliefTypeMap: Record<string, string> = {
  medical_cost: '医疗费用',
  living_support: '生活支持',
  rehab_subsidy: '康复补贴',
  drug_relief: '药品援助',
  other: '其他',
}

const difficultyMap: Record<string, string> = { easy: '容易', medium: '中等', hard: '较难' }
const auditText = (status?: number) => (status === 1 ? '已通过' : status === 2 ? '已驳回' : '待审核')

watch(
  () => props.modelValue,
  async (visible) => {
    if (!visible || !props.projectId) return
    loading.value = true
    try {
      const { data } = await getReliefProjectDetail(props.projectId)
      detail.value = data
    } finally {
      loading.value = false
    }
  },
)
</script>

<style scoped>
.mr-8 { margin-right: 8px; }
.mb-8 { margin-bottom: 8px; }
</style>
