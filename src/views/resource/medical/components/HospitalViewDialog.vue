<template>
  <el-dialog v-model="visible" title="医院详情" width="760px" @close="handleClose">
    <div v-if="data" class="hospital-detail-container">
      <div class="detail-grid">
        <div class="detail-item">
          <span class="label">医院名称</span>
          <span class="value">{{ data.name }}</span>
        </div>
        <div class="detail-item">
          <span class="label">医院等级</span>
          <span class="value">
            <!-- 使用映射函数显示中文 -->
            <el-tag size="small">{{ getLevelText(data.level) }}</el-tag>
          </span>
        </div>
        <div class="detail-item">
          <span class="label">所属地区</span>
          <span class="value">{{ formatRegion(data) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">罕见病协作网</span>
          <span class="value">
            <el-tag :type="data.isRareNetwork === 1 ? 'success' : 'info'" size="small">
              {{ data.isRareNetwork === 1 ? '是' : '否' }}
            </el-tag>
          </span>
        </div>
        <div class="detail-item full">
          <span class="label">详细地址</span>
          <span class="value">{{ data.address || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">联系电话</span>
          <span class="value">{{ data.phone || '-' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">官网地址</span>
          <span class="value">
            <el-link v-if="data.hospitalUrl" :href="data.hospitalUrl" target="_blank" type="primary">{{ data.hospitalUrl }}</el-link>
            <span v-else>-</span>
          </span>
        </div>
        <div class="detail-item full">
          <span class="label">诊疗范围</span>
          <span class="value">{{ data.treatScope || '-' }}</span>
        </div>
        
        <div class="detail-item full">
          <span class="label">关联疾病</span>
          <span class="value diseases-wrap">
            <!-- 接口返回 data.diseases 是对象数组，直接遍历即可 -->
            <el-tag v-for="item in data.diseases || []" :key="item.id" class="mr8 mb8">{{ item.name }}</el-tag>
            <span v-if="!data.diseases?.length">-</span>
          </span>
        </div>

        <div class="detail-item">
          <span class="label">审核状态</span>
          <span class="value">
            <el-tag :type="getAuditTagType(data.auditStatus)" size="small">{{ getAuditText(data.auditStatus) }}</el-tag>
          </span>
        </div>
        <div class="detail-item">
          <span class="label">更新时间</span>
          <span class="value">{{ formatDateTime(data.updatedAt) }}</span>
        </div>
        <div class="detail-item full" v-if="data.auditStatus === 2">
          <span class="label">驳回原因</span>
          <span class="value">{{ data.rejectReason || '-' }}</span>
        </div>
      </div>
    </div>
    <div v-else class="empty-tip">暂无数据</div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { HospitalItem } from '@/api/resource/medical/hospital'

interface Props {
  modelValue: boolean
  data: HospitalItem | null
}

// 【新增】映射关系常量
const levelLabelMap: Record<string, string> = {
  '1': '三甲',
  '2': '三乙',
  '3': '三丙',
  '4': '二甲',
  '5': '二乙',
  '6': '二丙',
  '7': '其他'
}

// 【新增】辅助函数：获取中文显示文本
const getLevelText = (level: string | number) => {
  return levelLabelMap[String(level)] || '-'
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const visible = ref(props.modelValue)

watch(
  () => props.modelValue,
  (value) => {
    visible.value = value
  }
)

watch(visible, (value) => emit('update:modelValue', value))

const getAuditText = (status: number) => ({ 0: '待审核', 1: '已通过', 2: '已驳回' }[status] || '未知')
const getAuditTagType = (status: number) => ({ 0: 'warning', 1: 'success', 2: 'danger' }[status] || 'info')
const formatRegion = (data: HospitalItem) => [data.provinceName, data.cityName, data.districtName].filter(Boolean).join(' / ') || '-'
const formatDateTime = (value?: string) => (value ? new Date(value).toLocaleString('zh-CN', { hour12: false }) : '-')
const handleClose = () => {
  visible.value = false
}
</script>

<style scoped lang="scss">
.hospital-detail-container {
  .detail-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px 18px;
  }

  .detail-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;

    &.full {
      grid-column: 1 / -1;
    }
  }

  .label {
    width: 88px;
    color: #606266;
    font-weight: 700;
    flex-shrink: 0;
    text-align: right;
  }

  .value {
    flex: 1;
    color: #303133;
    word-break: break-word;
  }

  .diseases-wrap {
    display: flex;
    flex-wrap: wrap;
  }

  .mr8 {
    margin-right: 8px;
  }

  .mb8 {
    margin-bottom: 8px;
  }
}

.empty-tip {
  padding: 24px 0;
  text-align: center;
  color: #909399;
}
</style>