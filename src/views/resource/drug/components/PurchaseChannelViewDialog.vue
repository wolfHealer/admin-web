<template>
  <el-dialog
    v-model="dialogVisible"
    title="购药渠道详情"
    width="750px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-descriptions :column="1" border v-if="viewData">
      <el-descriptions-item label="渠道名称">
        {{ viewData.name }}
      </el-descriptions-item>
      <el-descriptions-item label="渠道类型">
        <el-tag :type="getChannelTypeTag(viewData.type)">
          {{ viewData.type }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="所在区域">
        {{ viewData.region }}
      </el-descriptions-item>
      <el-descriptions-item label="详细地址">
        {{ viewData.address }}
      </el-descriptions-item>
      <el-descriptions-item label="联系方式">
        <span v-if="viewData.contact && viewData.contact.startsWith('http')">
          <el-link :href="viewData.contact" target="_blank" type="primary">
            {{ viewData.contact }}
          </el-link>
        </span>
        <span v-else>{{ viewData.contact || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="是否医保">
        <el-tag :type="viewData.isInsurance ? 'success' : 'info'">
          {{ viewData.isInsurance ? '是' : '否' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="配送范围">
        {{ viewData.deliveryScope }}
      </el-descriptions-item>
      <el-descriptions-item label="配送周期">
        {{ viewData.deliveryCycle }}
      </el-descriptions-item>
      <el-descriptions-item label="描述">
        {{ viewData.desc || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ viewData.createdAt || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="更新时间">
        {{ viewData.updatedAt || '-' }}
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button type="primary" @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PurchaseChannelItem } from '@/api/resource/drug/purchaseChannel'

interface Props {
  modelValue: boolean
  viewData?: PurchaseChannelItem | null
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

const getChannelTypeTag = (type: string): string => {
  const map: Record<string, string> = {
    '医院药房': 'warning',
    '连锁药店': 'success',
    '医药电商': 'primary',
    '合规代购': 'info'
  }
  return map[type] || 'info'
}
</script>