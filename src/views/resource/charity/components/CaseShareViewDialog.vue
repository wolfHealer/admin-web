<template>
  <el-dialog
    :model-value="modelValue"
    title="救助案例详情"
    width="860px"
    @close="handleClose"
  >
    <el-descriptions v-loading="loading" :column="1" border>
      <!-- 修改：所有字段改为 camelCase -->
      <el-descriptions-item label="案例标题">{{ detail.caseTitle || '-' }}</el-descriptions-item>
      <el-descriptions-item label="关联疾病">{{ detail.diseaseName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="关联项目">{{ detail.projectName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="患者简介">{{ detail.patientDesc || '-' }}</el-descriptions-item>
      <el-descriptions-item label="申请周期">{{ detail.applyCycle || '-' }}</el-descriptions-item>
      <el-descriptions-item label="实际救助">{{ detail.actualRelief || '-' }}</el-descriptions-item>
      <el-descriptions-item label="经验分享">{{ detail.experience || '-' }}</el-descriptions-item>
      <el-descriptions-item label="避坑要点">{{ detail.pitfallGuide || '-' }}</el-descriptions-item>
      <el-descriptions-item label="案例 PDF">
        <a v-if="detail.casePdf" :href="detail.casePdf" target="_blank">{{ detail.casePdf }}</a>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="材料模板">
        <a v-if="detail.materialTemplate" :href="detail.materialTemplate" target="_blank">
          {{ detail.materialTemplate }}
        </a>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="审核状态">{{ auditText(detail.auditStatus) }}</el-descriptions-item>
      <el-descriptions-item label="驳回原因">{{ detail.rejectReason || '-' }}</el-descriptions-item>
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
import { getReliefCaseDetail, type ReliefCaseItem } from '@/api/resource/charity/case'

const props = defineProps<{
  modelValue: boolean
  id: number | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
}>()

const loading = ref(false)
// 使用 reactive 对象，初始化为空对象
const detail = reactive<Partial<ReliefCaseItem>>({})

const auditText = (status?: number) => {
  return status === 1 ? '已通过' : status === 2 ? '已驳回' : '待审核'
}

const loadDetail = async () => {
  if (!props.id) return
  loading.value = true
  try {
    const res = await getReliefCaseDetail(props.id)
    // 重置 detail 并赋新值
    // 注意：reactive 对象不能直接整体替换，需要清空后赋值，或者使用 ref
    // 这里为了简单，先清空 key，再 assign
    Object.keys(detail).forEach(key => delete detail[key as keyof ReliefCaseItem])
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