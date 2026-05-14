<template>
  <el-dialog v-model="visible" title="医生详情" width="760px">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="医生姓名">{{ data.name || '-' }}</el-descriptions-item>
      <el-descriptions-item label="所属医院">{{ data.hospitalName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="科室">{{ data.department || '-' }}</el-descriptions-item>
      <el-descriptions-item label="职称">{{ data.title || '-' }}</el-descriptions-item>
      
      <!-- 新增：显示联系方式 -->
      <el-descriptions-item label="联系方式" :span="2">{{ data.contact || '-' }}</el-descriptions-item>
      
      <!-- 修改：clinic_time -> clinicTime -->
      <el-descriptions-item label="门诊时间" :span="2">
        <div class="detail-text">{{ data.clinicTime || '-' }}</div>
      </el-descriptions-item>
      
      <!-- 修改：good_at -> goodAt -->
      <el-descriptions-item label="擅长领域" :span="2">
        <div class="detail-text">{{ data.goodAt || '-' }}</div>
      </el-descriptions-item>
      
      <!-- 修改：score, comment_num -> score, commentNum -->
      <el-descriptions-item label="评分">{{ data.score ?? 0 }}</el-descriptions-item>
      <el-descriptions-item label="评价数">{{ data.commentNum ?? 0 }}</el-descriptions-item>
      
      <!-- 修改：audit_status -> auditStatus -->
      <el-descriptions-item label="审核状态">
        <el-tag :type="getAuditTagType(Number(data.auditStatus ?? 0))">
          {{ getAuditText(Number(data.auditStatus ?? 0)) }}
        </el-tag>
      </el-descriptions-item>
      
      <!-- 修改：reject_reason -> rejectReason -->
      <el-descriptions-item label="驳回原因">
        {{ data.auditStatus === 2 ? data.rejectReason || '-' : '-' }}
      </el-descriptions-item>
      
      <!-- 关联疾病：后端返回的是 diseaseIds (ID数组)，如果需要显示名称，需要额外处理或依赖后端返回 diseases 对象数组。
           如果后端只返回 ID，这里暂时显示 ID 数量或 ID 列表。根据之前的列表接口，这里假设可能需要映射名称，但详情接口未返回 diseases 对象。
           暂按显示 ID 数量或简单提示处理，或者如果后端返回了 diseases 对象数组则遍历显示。
           根据提供的 JSON，详情接口只返回了 diseaseIds: [1, 2]。
      -->
      <!-- 修改模板，优先使用 diseases 对象数组 -->
<el-descriptions-item label="关联疾病" :span="2">
  <template v-if="data.diseases?.length">
     <el-tag v-for="item in data.diseases" :key="item.id" size="small" class="tag-item">
       {{ item.name }} <!-- 直接显示名称 -->
     </el-tag>
  </template>
  <!-- 兼容旧数据：如果没有 diseases 对象，但有 diseaseIds -->
  <template v-else-if="data.diseaseIds?.length">
     <el-tag v-for="id in data.diseaseIds" :key="id" size="small" class="tag-item">
       ID: {{ id }}
     </el-tag>
  </template>
  <span v-else>-</span>
</el-descriptions-item>
      <!-- 注意：详情接口未返回 created_at/updated_at，如有需要请确认后端是否支持 -->
      <!-- <el-descriptions-item label="创建时间">{{ data.createdAt || '-' }}</el-descriptions-item> -->
      <!-- <el-descriptions-item label="更新时间">{{ data.updatedAt || '-' }}</el-descriptions-item> -->
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

const getAuditText = (status: number) => {
  const map: Record<number, string> = {
    0: '待审核',
    1: '已通过',
    2: '已驳回'
  }
  return map[status] || '未知'
}

const getAuditTagType = (status: number) => {
  const map: Record<number, 'warning' | 'success' | 'danger' | 'info'> = {
    0: 'warning',
    1: 'success',
    2: 'danger'
  }
  return map[status] || 'info'
}
</script>

<style scoped>
.detail-text {
  white-space: pre-wrap;
  line-height: 1.7;
}

.tag-item {
  margin-right: 8px;
  margin-bottom: 8px;
}
</style>