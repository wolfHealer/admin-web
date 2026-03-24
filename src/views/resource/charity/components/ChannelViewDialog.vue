<!-- src/views/resource/charity/components/ChannelViewDialog.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="通道详情"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-descriptions :column="1" border v-if="data">
      <el-descriptions-item label="通道名称">{{ data.name }}</el-descriptions-item>
      
      <el-descriptions-item label="通道类型">
        <el-tag :type="data.type === 'urgent' ? 'warning' : 'info'">
          {{ data.type === 'urgent' ? '紧急救助' : '众筹通道' }}
        </el-tag>
      </el-descriptions-item>
      
      <el-descriptions-item label="联系方式">
        <div style="white-space: pre-wrap">{{ data.contactValue || '-' }}</div>
      </el-descriptions-item>
      
      <el-descriptions-item label="通道描述">
        {{ data.desc || '-' }}
      </el-descriptions-item>
      
      <el-descriptions-item label="服务时间">
        {{ data.serviceTime || '-' }}
      </el-descriptions-item>
      
      <el-descriptions-item label="状态">
        <el-tag :type="data.available ? 'success' : 'danger'">
          {{ data.available ? '启用' : '停用' }}
        </el-tag>
      </el-descriptions-item>
    </el-descriptions>
    
    <template #footer>
      <el-button type="primary" @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

// 定义通道数据类型（与新接口匹配）
interface ChannelData {
  id?: number
  name: string
  desc: string
  type: string
  contactValue: string
  serviceTime: string
  available: boolean
}

interface Props {
  modelValue: boolean
  data: ChannelData | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  data: null
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
</script>