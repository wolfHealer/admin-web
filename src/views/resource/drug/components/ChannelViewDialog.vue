<template>
  <el-dialog v-model="dialogVisible" title="购药渠道详情" width="820px" :close-on-click-modal="false" @close="handleClose">
    <el-descriptions :column="1" border v-if="viewData">
      <!-- 【修改点1】正确显示关联药品列表 -->
      <el-descriptions-item label="关联药品">
        <div v-if="viewData.drugs && viewData.drugs.length > 0">
          <div v-for="(drug, index) in viewData.drugs" :key="drug.id" style="margin-bottom: 4px;">
            {{ drug.genericName }}
            <span v-if="drug.brandName">（{{ drug.brandName }}）</span>
          </div>
        </div>
        <span v-else>-</span>
      </el-descriptions-item>
      
      <el-descriptions-item label="渠道名称">{{ viewData.name }}</el-descriptions-item>
      
      <el-descriptions-item label="渠道类型">
        <el-tag>{{ getChannelTypeText(viewData.channelType) }}</el-tag>
      </el-descriptions-item>
      
      <el-descriptions-item label="资质说明">{{ viewData.qualification || '-' }}</el-descriptions-item>
      
      <!-- 【修改点2】直接使用接口返回的 Name 字段 -->
      <el-descriptions-item label="区域">
        {{ formatRegion(viewData) }}
      </el-descriptions-item>
      
      <el-descriptions-item label="详细地址">{{ viewData.address || '-' }}</el-descriptions-item>
      
      <el-descriptions-item label="联系电话">{{ viewData.contactPhone || '-' }}</el-descriptions-item>
      
      <el-descriptions-item label="联系网址">
        <el-link v-if="viewData.contactUrl" :href="viewData.contactUrl" target="_blank" type="primary">
          {{ viewData.contactUrl }}
        </el-link>
        <span v-else>-</span>
      </el-descriptions-item>
      
      <el-descriptions-item label="配送范围">{{ viewData.deliveryScope || '-' }}</el-descriptions-item>
      
      <!-- 接口未返回 deliveryCycle, isInsuranceSettle 等，若有需要可取消注释并确认字段 -->
      <!-- <el-descriptions-item label="配送周期">{{ viewData.deliveryCycle || '-' }}</el-descriptions-item> -->
      
    </el-descriptions>
    <template #footer>
      <el-button type="primary" @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: boolean
  viewData?: any | null
}

const props = withDefaults(defineProps<Props>(), { viewData: null })
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()
const dialogVisible = ref(false)

watch(() => props.modelValue, val => { dialogVisible.value = val })
watch(dialogVisible, val => emit('update:modelValue', val))

const handleClose = () => { dialogVisible.value = false }

// 【修改点3】简化区域格式化，直接使用 Name
const formatRegion = (row: any) => {
  if (!row) return '-'
  // 优先使用 Name，如果 Name 缺失再 fallback 到 Code (防止后端偶尔不传 Name)
  const province = row.provinceName || row.provinceCode
  const city = row.cityName || row.cityCode
  const district = row.districtName || row.districtCode
  
  return [province, city, district].filter(Boolean).join(' / ') || '-'
}

const getChannelTypeText = (value: string) => {
  const map: Record<string, string> = {
    hospital_pharmacy: '医院药房',
    retail_pharmacy: '连锁药店',
    chain_pharmacy: '连锁药店',
    internet_hospital: '互联网医院',
    dtp_pharmacy: 'DTP药房',
    e_pharmacy: '医药电商',
    ecommerce: '医药电商',
    compliant_agent: '合规代购/协助渠道',
    other: '其他'
  }
  return map[value] || value || '-'
}
</script>