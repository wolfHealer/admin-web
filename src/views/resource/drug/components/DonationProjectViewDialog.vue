<template>
  <el-dialog v-model="dialogVisible" title="援助项目详情" width="900px" @close="handleClose">
    <template v-if="viewData">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="项目名称">{{ viewData.name }}</el-descriptions-item>
        <el-descriptions-item label="主办方">{{ viewData.organizer }}</el-descriptions-item>
        
        <!-- 【修改点1】显示药品名称 -->
        <el-descriptions-item label="关联药品">{{ viewData.drugName || '-' }}</el-descriptions-item>
        
        <!-- 【修改点2】显示疾病名称 -->
        <el-descriptions-item label="关联疾病">{{ viewData.diseaseName || '-' }}</el-descriptions-item>
        
        <!-- 适配 period (原 relief_cycle) -->
        <el-descriptions-item label="援助周期">{{ viewData.period || '-' }}</el-descriptions-item>
        
        <!-- 适配 dosage (原 relief_dosage_desc) -->
        <el-descriptions-item label="援助剂量说明">{{ viewData.dosage || '-' }}</el-descriptions-item>
        
        <!-- 适配 condition (原 apply_condition) -->
        <el-descriptions-item label="申请条件" :span="2">{{ viewData.condition || '-' }}</el-descriptions-item>
        
        <el-descriptions-item label="进度查询" :span="2">{{ viewData.progressQuery || '-' }}</el-descriptions-item>
        
        <el-descriptions-item label="申请表">
          <el-link v-if="viewData.applyForm" :href="viewData.applyForm" target="_blank" type="primary">查看</el-link>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="申请指南">
          <el-link v-if="viewData.applyGuide" :href="viewData.applyGuide" target="_blank" type="primary">查看</el-link>
          <span v-else>-</span>
        </el-descriptions-item>
        <el-descriptions-item label="材料清单">
          <el-link v-if="viewData.materialList" :href="viewData.materialList" target="_blank" type="primary">查看</el-link>
          <span v-else>-</span>
        </el-descriptions-item>
        
        <!-- 审核状态 -->
        <el-descriptions-item label="审核状态">
           {{ auditStatusText }}
        </el-descriptions-item>
        <el-descriptions-item label="驳回原因">{{ viewData.rejectReason || '-' }}</el-descriptions-item>
        
        <!-- 更新时间 -->
        <el-descriptions-item label="更新时间">{{ formatDate(viewData.updatedAt) }}</el-descriptions-item>
      </el-descriptions>
    </template>
    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

// 【修改点3】更新类型定义以包含 drugName 和 diseaseName
interface ProjectDetail {
  id?: number;
  name?: string;
  organizer?: string;
  drugId?: number;
  drugName?: string;   // 新增
  diseaseId?: number;
  diseaseName?: string; // 新增
  condition?: string;
  period?: string;
  dosage?: string;
  applyForm?: string;
  applyGuide?: string;
  materialList?: string;
  progressQuery?: string;
  auditStatus?: number;
  rejectReason?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

interface Props {
  modelValue: boolean
  viewData?: ProjectDetail | null
}

const props = withDefaults(defineProps<Props>(), { viewData: null })
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const dialogVisible = ref(false)

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})
watch(dialogVisible, (val) => emit('update:modelValue', val))

const auditStatusText = computed(() => {
  const map: Record<number, string> = { 0: '待审核', 1: '已通过', 2: '已驳回' }
  return map[props.viewData?.auditStatus ?? 0] || '-'
})

const formatDate = (dateStr: string | undefined | null) => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('zh-CN', { 
      year: 'numeric', month: '2-digit', day: '2-digit', 
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
    }).replace(/\//g, '-');
  } catch (e) {
    return dateStr;
  }
}

const handleClose = () => {
  dialogVisible.value = false
}
</script>