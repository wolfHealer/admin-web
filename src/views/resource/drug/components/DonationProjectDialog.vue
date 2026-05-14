<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑援助项目' : '新增援助项目'"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
      <el-row :gutter="16">
        <el-col :span="12">
          <!-- 注意：如果编辑时需要显示药品名称，需要额外处理，因为接口只返回 drugId -->
          <el-form-item label="关联药品" prop="drugId">
  <el-input 
    :model-value="formData.drugName || `ID: ${formData.drugId}`" 
    placeholder="药品信息" 
    disabled 
  />
</el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="关联疾病" prop="diseaseId">
  <el-input 
    :model-value="formData.diseaseName || `ID: ${formData.diseaseId}`" 
    placeholder="疾病信息" 
    disabled 
  />
</el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="项目名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入项目名称" />
      </el-form-item>
      <el-form-item label="主办方" prop="organizer">
        <el-input v-model="formData.organizer" placeholder="请输入主办方 / 组织方" />
      </el-form-item>
      
      <!-- 修改点: condition -->
      <el-form-item label="申请条件" prop="condition">
        <el-input v-model="formData.condition" type="textarea" :rows="4" placeholder="请输入申请条件" />
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <!-- 修改点: period -->
          <el-form-item label="援助周期" prop="period">
            <el-input v-model="formData.period" placeholder="如：3个月 / 6个月" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <!-- 修改点: dosage -->
          <el-form-item label="援助剂量说明" prop="dosage">
            <el-input v-model="formData.dosage" placeholder="如：买6赠6 / 首针援助" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="8">
          <!-- 修改点: applyForm -->
          <el-form-item label="申请表" prop="applyForm">
            <el-input v-model="formData.applyForm" placeholder="申请表链接" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <!-- 修改点: applyGuide -->
          <el-form-item label="申请指南" prop="applyGuide">
            <el-input v-model="formData.applyGuide" placeholder="申请指南链接" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <!-- 修改点: materialList -->
          <el-form-item label="材料清单" prop="materialList">
            <el-input v-model="formData.materialList" placeholder="材料清单链接" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 修改点: progressQuery -->
      <el-form-item label="进度查询" prop="progressQuery">
        <el-input v-model="formData.progressQuery" type="textarea" :rows="3" placeholder="请输入进度查询方式或查询地址" />
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <!-- 修改点: auditStatus -->
          <el-form-item label="审核状态" prop="auditStatus">
            <el-select v-model="formData.auditStatus" style="width: 100%">
              <el-option label="待审核" :value="0" />
              <el-option label="已通过" :value="1" />
              <el-option label="已驳回" :value="2" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <!-- 修改点: rejectReason -->
          <el-form-item label="驳回原因" prop="rejectReason">
            <el-input v-model="formData.rejectReason" placeholder="审核驳回时填写" :disabled="formData.auditStatus !== 2" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

// 定义符合新接口结构的类型
interface ProjectForm {
  id?: number;
  drugId?: number | null;
  drugName?: string;
  diseaseId?: number | null;
  diseaseName?: string;
  name: string;
  organizer: string;
  condition: string;
  period: string;
  dosage: string;
  applyForm: string;
  applyGuide: string;
  materialList: string;
  progressQuery: string;
  auditStatus: number;
  rejectReason: string;
  updatedAt?: string;
}

interface Props {
  modelValue: boolean
  editData?: ProjectForm | null
}

const props = withDefaults(defineProps<Props>(), { editData: null })
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: ProjectForm]
}>()

const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)

// 创建空表单，字段名与接口一致
const createEmptyForm = (): ProjectForm => ({
  drugId: null,
  diseaseId: null,
  name: '',
  organizer: '',
  condition: '',
  period: '',
  dosage: '',
  applyForm: '',
  applyGuide: '',
  materialList: '',
  progressQuery: '',
  auditStatus: 0,
  rejectReason: ''
})

const formData = reactive<ProjectForm>(createEmptyForm())

const formRules: FormRules = {
  drugId: [{ required: true, message: '请选择关联药品', trigger: 'change' }],
  diseaseId: [{ required: true, message: '请选择关联疾病', trigger: 'change' }],
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  organizer: [{ required: true, message: '请输入主办方', trigger: 'blur' }],
  condition: [{ required: true, message: '请输入申请条件', trigger: 'blur' }],
  period: [{ required: true, message: '请输入援助周期', trigger: 'blur' }],
  dosage: [{ required: true, message: '请输入援助剂量说明', trigger: 'blur' }],
  progressQuery: [{ required: true, message: '请输入进度查询信息', trigger: 'blur' }]
}

watch(() => props.modelValue, async (val) => {
  dialogVisible.value = val
  if (val) {
    if (props.editData) {
      isEdit.value = true
      // 直接赋值，因为字段名已经统一
      Object.assign(formData, createEmptyForm(), props.editData)
    } else {
      isEdit.value = false
      resetForm()
    }
  }
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
  if (!val) resetForm()
})

const resetForm = () => {
  Object.assign(formData, createEmptyForm())
  formRef.value?.clearValidate()
}

const handleClose = () => {
  dialogVisible.value = false
}

const handleSubmit = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitLoading.value = true
  try {
    // 提交时直接发送 formData，字段名已与后端匹配
    emit('submit', { ...formData })
  } finally {
    submitLoading.value = false
  }
}
</script>