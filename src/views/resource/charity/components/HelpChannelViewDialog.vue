<template>
  <el-dialog
    :model-value="modelValue"
    title="求助通道详情"
    width="760px"
    @close="handleClose"
  >
    <el-descriptions v-loading="loading" :column="1" border>
      <el-descriptions-item label="通道名称">{{ detail.name || '-' }}</el-descriptions-item>
      <!-- 修改点：detail.channelType -->
      <el-descriptions-item label="通道类型">{{ formatChannelType(detail.channelType) }}</el-descriptions-item>
      <!-- 修改点：detail.applyCondition -->
      <el-descriptions-item label="求助条件">{{ detail.applyCondition || '-' }}</el-descriptions-item>
      <!-- 修改点：detail.responseTime -->
      <el-descriptions-item label="响应时间">{{ detail.responseTime || '-' }}</el-descriptions-item>
      <!-- 修改点：detail.contactPhone -->
      <el-descriptions-item label="联系电话">{{ detail.contactPhone || '-' }}</el-descriptions-item>
      <el-descriptions-item label="官网/入口">
        <!-- 修改点：detail.contactUrl -->
        <a v-if="detail.contactUrl" :href="detail.contactUrl" target="_blank">{{ detail.contactUrl }}</a>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="求助信模板">
        <!-- 修改点：detail.helpLetterTemplate -->
        <a v-if="detail.helpLetterTemplate" :href="detail.helpLetterTemplate" target="_blank">
          {{ detail.helpLetterTemplate }}
        </a>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="众筹模板">
        <!-- 修改点：detail.crowdfundingTemplate -->
        <a v-if="detail.crowdfundingTemplate" :href="detail.crowdfundingTemplate" target="_blank">
          {{ detail.crowdfundingTemplate }}
        </a>
        <span v-else>-</span>
      </el-descriptions-item>
      <!-- 修改点：detail.auditStatus -->
      <el-descriptions-item label="审核状态">{{ auditText(detail.auditStatus) }}</el-descriptions-item>
      <!-- 修改点：detail.rejectReason -->
      <el-descriptions-item label="驳回原因">{{ detail.rejectReason || '-' }}</el-descriptions-item>
      <el-descriptions-item label="排序">{{ detail.sort ?? '-' }}</el-descriptions-item>
      <!-- 修改点：detail.createdAt -->
      <el-descriptions-item label="创建时间">{{ detail.createdAt || '-' }}</el-descriptions-item>
      <!-- 修改点：detail.updatedAt -->
      <el-descriptions-item label="更新时间">{{ detail.updatedAt || '-' }}</el-descriptions-item>
    </el-descriptions>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { getHelpChannelDetail, type HelpChannelItem } from '@/api/resource/charity/helpChannel'

const props = defineProps<{
  modelValue: boolean
  id: number | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
}>()

const loading = ref(false)
const detail = reactive<Partial<HelpChannelItem>>({})

const formatChannelType = (val?: string) => {
  const map: Record<string, string> = {
    emergency_help: '紧急求助',
    crowdfunding: '众筹支持',
    charity_consulting: '慈善咨询',
    foundation_support: '基金会支持',
  }
  return val ? map[val] || val : '-'
}

const auditText = (status?: number) => {
  return status === 1 ? '已通过' : status === 2 ? '已驳回' : '待审核'
}

const loadDetail = async () => {
  if (!props.id) return
  loading.value = true
  try {
    const res = await getHelpChannelDetail(props.id)
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