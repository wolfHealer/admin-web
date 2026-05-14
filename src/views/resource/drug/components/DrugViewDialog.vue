<template>
  <el-dialog
    v-model="dialogVisible"
    title="药品详情"
    width="760px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-descriptions :column="1" border>
      <el-descriptions-item label="通用名">{{ viewData?.genericName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="商品名">{{ viewData?.brandName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="适应症">{{ viewData?.indication || '-' }}</el-descriptions-item>
      <el-descriptions-item label="剂型">{{ viewData?.dosageForm || '-' }}</el-descriptions-item>
      <el-descriptions-item label="规格">{{ viewData?.spec || '-' }}</el-descriptions-item>
      <el-descriptions-item label="参考价格">¥{{ viewData?.refPrice ?? '-' }}</el-descriptions-item>
      
      <el-descriptions-item label="药品类型">
        <el-tag :type="getDrugTypeTag(viewData?.drugType || '')">
          {{ getDrugTypeLabel(viewData?.drugType || '') }}
        </el-tag>
      </el-descriptions-item>

      <el-descriptions-item label="医保 / 援助 / 上市 / 处方">
        <div class="tag-group">
          <el-tag :type="viewData?.isInsurance ? 'success' : 'info'">
            医保{{ viewData?.isInsurance ? '是' : '否' }}
          </el-tag>
          <el-tag :type="viewData?.hasRelief ? 'warning' : 'info'">
            援助{{ viewData?.hasRelief ? '有' : '无' }}
          </el-tag>
          <el-tag :type="viewData?.isLaunched ? 'success' : 'info'">
            上市{{ viewData?.isLaunched ? '是' : '否' }}
          </el-tag>
          <el-tag :type="viewData?.needPrescription ? 'danger' : 'info'">
            处方{{ viewData?.needPrescription ? '需要' : '不需要' }}
          </el-tag>
        </div>
      </el-descriptions-item>

      <el-descriptions-item label="原版说明书">
        <el-link v-if="viewData?.manualOriginal" :href="viewData.manualOriginal" target="_blank" type="primary">
          查看链接
        </el-link>
        <span v-else>-</span>
      </el-descriptions-item>

      <el-descriptions-item label="通俗说明书">
        <el-link v-if="viewData?.manualPopular" :href="viewData.manualPopular" target="_blank" type="primary">
          查看链接
        </el-link>
        <span v-else>-</span>
      </el-descriptions-item>

      <el-descriptions-item label="关联疾病">
        <div v-if="viewData?.diseases?.length" class="tag-group">
          <el-tag v-for="item in viewData.diseases" :key="item.id">
            {{ item.name }}
          </el-tag>
        </div>
        <span v-else>-</span>
      </el-descriptions-item>

      <el-descriptions-item label="审核状态">
        <el-tag :type="getAuditStatusTag(viewData?.auditStatus ?? 0)">
          {{ getAuditStatusLabel(viewData?.auditStatus ?? 0) }}
        </el-tag>
      </el-descriptions-item>
      
      <!-- 注意：接口示例中未包含 reject_reason，如果后端返回则显示，否则隐藏或显示默认值 -->
      <el-descriptions-item label="驳回原因" v-if="viewData?.rejectReason">
        {{ viewData.rejectReason }}
      </el-descriptions-item>

      <el-descriptions-item label="创建时间">{{ viewData?.createdAt || '-' }}</el-descriptions-item>
      <el-descriptions-item label="更新时间">{{ viewData?.updatedAt || '-' }}</el-descriptions-item>
    </el-descriptions>

    <template #footer>
      <el-button type="primary" @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// 定义与后端返回结构一致的接口类型
interface DiseaseItem {
  id: number
  name: string
  alias?: string
}

interface RareDrugItem {
  id: number
  genericName: string
  brandName?: string
  indication?: string
  dosageForm?: string
  spec?: string
  refPrice?: string | number
  drugType?: string
  isInsurance?: boolean
  hasRelief?: boolean
  isLaunched?: boolean
  needPrescription?: boolean
  manualOriginal?: string
  manualPopular?: string
  diseases?: DiseaseItem[]
  auditStatus?: number
  rejectReason?: string
  createdAt?: string
  updatedAt?: string
}

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

// 药品类型标签映射
const getDrugTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    origin_import: '原研进口',
    origin_domestic: '原研国产',
    generic: '仿制药',
    other: '其他',
  }
  return map[type] || type || '-'
}

const getDrugTypeTag = (type: string) => {
  const map: Record<string, string> = {
    origin_import: 'warning',
    origin_domestic: 'success',
    generic: 'primary',
    other: 'info',
  }
  return map[type] || 'info'
}

// 审核状态标签映射
const getAuditStatusLabel = (status: number) => {
  const labels = ['待审核', '已通过', '已驳回']
  return labels[status] || '-'
}

const getAuditStatusTag = (status: number) => {
  const tags = ['warning', 'success', 'danger']
  return tags[status] || 'info'
}
</script>

<style scoped>
.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>