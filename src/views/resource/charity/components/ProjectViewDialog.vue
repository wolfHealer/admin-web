<!-- src/views/resource/charity/components/ProjectViewDialog.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="项目详情"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-descriptions :column="1" border v-if="data">
      <el-descriptions-item label="项目名称">{{ data.title }}</el-descriptions-item>
      
      <el-descriptions-item label="项目内容/流程">
        <div style="white-space: pre-wrap">{{ data.content || '-' }}</div>
      </el-descriptions-item>
      
      <el-descriptions-item label="申请条件">
        <div style="white-space: pre-wrap">{{ data.requirements || '-' }}</div>
      </el-descriptions-item>
      
      <el-descriptions-item label="截止日期">
        {{ formatDateTime(data.deadline) }}
      </el-descriptions-item>
      
      <el-descriptions-item label="联系方式">
        <div style="white-space: pre-wrap">{{ data.contact || '-' }}</div>
      </el-descriptions-item>
      
      <el-descriptions-item label="申请表">
        <el-link v-if="data.applyForm" :href="data.applyForm" target="_blank" type="primary">
          下载申请表
        </el-link>
        <span v-else>-</span>
      </el-descriptions-item>
      
      <el-descriptions-item label="申请指南">
        <el-link v-if="data.applyGuide" :href="data.applyGuide" target="_blank" type="primary">
          查看指南
        </el-link>
        <span v-else>-</span>
      </el-descriptions-item>
      
      <el-descriptions-item label="材料清单">
        <el-link v-if="data.materialList" :href="data.materialList" target="_blank" type="primary">
          查看清单
        </el-link>
        <span v-else>-</span>
      </el-descriptions-item>
    </el-descriptions>
    
    <template #footer>
      <el-button type="primary" @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// 定义项目数据类型（与新接口匹配）
interface ProjectData {
  id?: number
  title: string
  content: string
  requirements: string
  deadline: string
  contact: string
  applyForm: string
  applyGuide: string
  materialList: string
}

interface Props {
  modelValue: boolean
  data: ProjectData | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  data: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const dialogVisible = ref(false)

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

const handleClose = () => {
  dialogVisible.value = false
}
</script>