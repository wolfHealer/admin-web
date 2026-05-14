<template>
  <Dialog v-model="visible" title="资源详情" width="860px">
    <Descriptions :schema="schema" :data="detail" />
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getPsychResourceDetail } from '@/api/resource/rehab/psychologicalOrg'

const visible = ref(false)
const detail = ref<any>({})
const schema = [
  { field: 'disease_name', label: '关联疾病' },
  { field: 'resource_type', label: '资源类型' },
  { field: 'name', label: '资源名称' },
  { field: 'content_intro', label: '内容简介' },
  { field: 'guide_pdf', label: '指南PDF' },
  { field: 'manual_patient', label: '患者手册' },
  { field: 'manual_family', label: '家属手册' },
  { field: 'contact_phone', label: '联系电话/热线' },
  { field: 'contact_url', label: '官网/入口' },
  { field: 'audit_status', label: '审核状态' },
  { field: 'reject_reason', label: '驳回原因' },
  { field: 'created_at', label: '创建时间' },
  { field: 'updated_at', label: '更新时间' }
]
const open = async (id: number) => {
  visible.value = true
  const res = await getPsychResourceDetail(id)
  detail.value = res.data
}

defineExpose({ open })
</script>
