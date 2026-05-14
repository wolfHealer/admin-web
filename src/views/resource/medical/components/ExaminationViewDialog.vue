<template>
  <el-dialog v-model="visible" title="检查手册详情" width="820px">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="检查名称">{{ data.examName || '-' }}</el-descriptions-item>
      
      <!-- 修改：使用映射函数显示中文 -->
      <el-descriptions-item label="检查类型">{{ getExamTypeLabel(data.examType) }}</el-descriptions-item>
      
      <el-descriptions-item label="出具机构">{{ data.institution || '-' }}</el-descriptions-item>
      <el-descriptions-item label="排序">{{ data.sort ?? 0 }}</el-descriptions-item>
      <el-descriptions-item label="审核状态">
        <el-tag :type="getAuditTagType(data.auditStatus)">
          {{ getAuditText(data.auditStatus) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="驳回原因">{{ data.rejectReason || '-' }}</el-descriptions-item>
      <el-descriptions-item label="检查目的" :span="2">
        <span class="detail-value">{{ data.examPurpose || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="参考值" :span="2">
        <span class="detail-value">{{ data.referenceValue || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="异常解读" :span="2">
        <span class="detail-value">{{ data.abnormalInterpret || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="采样注意事项" :span="2">
        <span class="detail-value">{{ data.sampleNotes || data.preparation || '-' }}</span>
      </el-descriptions-item>
      
      <el-descriptions-item label="Excel模板">
        <a v-if="data.templates?.excel" :href="data.templates.excel" target="_blank">查看链接</a>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="Word模板">
        <a v-if="data.templates?.word" :href="data.templates.word" target="_blank">查看链接</a>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="对比模板" :span="2">
        <a v-if="data.templates?.compare" :href="data.templates.compare" target="_blank">查看链接</a>
        <span v-else>-</span>
      </el-descriptions-item>
      
      <el-descriptions-item label="适用疾病" :span="2">
        <div v-if="data.diseases?.length" class="tag-list">
          <el-tag v-for="item in data.diseases" :key="item.id" class="tag-item">
            {{ item.alias ? `${item.name}（${item.alias}）` : item.name }}
          </el-tag>
        </div>
        <span v-else-if="data.diseaseIds?.length">
           ID: {{ data.diseaseIds.join(', ') }}
        </span>
        <span v-else>-</span>
      </el-descriptions-item>
      
      <el-descriptions-item label="创建时间">{{ formatDate(data.createdAt) }}</el-descriptions-item>
      <el-descriptions-item label="更新时间">{{ formatDate(data.updatedAt || data.createdAt) }}</el-descriptions-item>
    </el-descriptions>

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: boolean
  data: any
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 添加映射函数
const getExamTypeLabel = (type?: string) => {
  const map: Record<string, string> = {
    'lab': '实验室检查',
    'metabolic': '代谢筛查',
    'imaging': '影像学检查',
    'genetic': '基因检测',
    'pathology': '病理检查',
    'functional': '功能检查',
    'scale': '量表评估',
    'special': '专科专项检查',
    'other': '其他'
  }
  return type ? (map[type] || type) : '-'
}

const getAuditText = (status?: number) => {
  if (status === 1) return '已通过'
  if (status === 2) return '已驳回'
  return '待审核'
}

const getAuditTagType = (status?: number) => {
  if (status === 1) return 'success'
  if (status === 2) return 'danger'
  return 'warning'
}

const formatDate = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.detail-value {
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  margin-right: 0;
}
</style>