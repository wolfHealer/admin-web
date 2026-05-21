<template>
  <el-dialog v-model="dialogVisible" title="援助申请详情" width="960px" @close="handleClose">
    <template v-if="viewData">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="项目名称">{{ viewData.projectName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="申请状态">
          <el-tag :type="statusTagType">{{ statusText }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="患者姓名">{{ viewData.patientName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ viewData.contactPhone }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ viewData.userId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="证件号">{{ viewData.patientIdCardMask || '-' }}</el-descriptions-item>
        <el-descriptions-item label="诊断证明">
          <el-link v-if="viewData.diagnosisProof" :href="viewData.diagnosisProof" target="_blank" type="primary">
            查看
          </el-link>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="收入证明">
          <el-link v-if="viewData.incomeProof" :href="viewData.incomeProof" target="_blank" type="primary">
            查看
          </el-link>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ viewData.submitTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审核时间">{{ viewData.reviewTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="驳回原因" :span="2">{{ viewData.rejectReason || '-' }}</el-descriptions-item>
      </el-descriptions>

      <div class="log-block">
        <div class="log-title">援助日志</div>
        <el-timeline v-if="viewData.logs?.length">
          <el-timeline-item
            v-for="item in viewData.logs"
            :key="item.id"
            :timestamp="item.createdAt"
            placement="top"
          >
            <div class="log-status">状态：{{ item.status }}</div>
            <div>{{ item.actionDesc }}</div>
            <div class="log-operator">操作人：{{ item.operatorName || '-' }}</div>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="暂无日志" :image-size="80" />
      </div>
    </template>
    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ReliefApplicationItem } from '@/api/resource/drug/donationProject'

interface Props {
  modelValue: boolean
  viewData?: ReliefApplicationItem | null
}

const props = withDefaults(defineProps<Props>(), { viewData: null })
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const dialogVisible = ref(false)

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => emit('update:modelValue', val))

const statusText = computed(() => {
  const map: Record<string, string> = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已驳回',
    completed: '已完成',
  }
  return map[props.viewData?.status || 'pending'] || props.viewData?.status || '-'
})

const statusTagType = computed(() => {
  const map: Record<string, 'warning' | 'success' | 'danger' | 'info'> = {
    pending: 'warning',
    approved: 'success',
    rejected: 'danger',
    completed: 'info',
  }
  return map[props.viewData?.status || 'pending'] || 'info'
})

const handleClose = () => {
  dialogVisible.value = false
}
</script>

<style scoped>
.log-block {
  margin-top: 20px;
}
.log-title {
  margin-bottom: 12px;
  font-weight: 600;
}
.log-status {
  font-weight: 600;
  margin-bottom: 6px;
}
.log-operator {
  margin-top: 6px;
  color: #909399;
  font-size: 12px;
}
</style>
