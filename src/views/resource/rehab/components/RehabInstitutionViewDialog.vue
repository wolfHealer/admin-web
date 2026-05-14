<template>
  <el-dialog v-model="visible" title="康复机构详情" width="860px">
    <template v-if="data">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="机构名称">{{ data.name }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ data.contactPhone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="所在地区">{{ regionText }}</el-descriptions-item>
        <el-descriptions-item label="官网/预约链接">
          <el-link v-if="data.contactUrl" :href="data.contactUrl" target="_blank" type="primary">打开链接</el-link>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="机构地址" :span="2">{{ data.address || '-' }}</el-descriptions-item>
        <el-descriptions-item label="资质证明" :span="2">
          <el-link v-if="data.qualification" :href="data.qualification" target="_blank" type="primary">查看资质证明</el-link>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="康复项目范围" :span="2">{{ data.rehabProjects || '-' }}</el-descriptions-item>
        <el-descriptions-item label="收费标准" :span="2">{{ data.feeStandard || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">
          <el-tag :type="auditTagType(data.auditStatus)">{{ auditText(data.auditStatus) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="驳回原因">{{ data.rejectReason || '-' }}</el-descriptions-item>
        <el-descriptions-item label="关联疾病" :span="2">
          <el-space wrap>
            <el-tag v-for="item in data.diseases || []" :key="item.id">{{ item.alias ? `${item.name}（${item.alias}）` : item.name }}</el-tag>
            <span v-if="!(data.diseases || []).length">-</span>
          </el-space>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ data.createdAt || '-' }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ data.updatedAt || '-' }}</el-descriptions-item>
      </el-descriptions>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RehabInstitutionItem } from '@/api/resource/rehab/rehabInstitution'

interface Props {
  modelValue: boolean
  data?: RehabInstitutionItem | null
}

const props = withDefaults(defineProps<Props>(), {
  data: null,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const regionText = computed(() => [props.data?.provinceName, props.data?.cityName, props.data?.districtName].filter(Boolean).join(' / ') || '-')
const auditText = (status: number) => ({ 0: '待审核', 1: '已通过', 2: '已驳回' }[status as 0 | 1 | 2] || '-')
const auditTagType = (status: number) => ({ 0: 'warning', 1: 'success', 2: 'danger' }[status as 0 | 1 | 2] || 'info')
</script>
