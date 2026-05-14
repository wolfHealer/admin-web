<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑援助申请' : '新增援助申请'"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="援助项目" prop="project_id">
            <el-select
              v-model="formData.project_id"
              filterable
              remote
              reserve-keyword
              placeholder="请输入项目名搜索"
              :remote-method="searchProjects"
              :loading="projectLoading"
              style="width: 100%"
            >
              <el-option v-for="item in projectOptions" :key="item.id" :label="item.name" :value="item.id!" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="用户ID" prop="user_id">
            <el-input-number v-model="formData.user_id" :min="1" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12"><el-form-item label="患者姓名" prop="patient_name"><el-input v-model="formData.patient_name" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="联系电话" prop="contact_phone"><el-input v-model="formData.contact_phone" /></el-form-item></el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12"><el-form-item label="证件密文" prop="patient_id_card_enc"><el-input v-model="formData.patient_id_card_enc" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="证件脱敏" prop="patient_id_card_mask"><el-input v-model="formData.patient_id_card_mask" placeholder="如 1101********1234" /></el-form-item></el-col>
      </el-row>

      <el-form-item label="诊断证明" prop="diagnosis_proof"><el-input v-model="formData.diagnosis_proof" placeholder="文件链接" /></el-form-item>
      <el-form-item label="收入证明" prop="income_proof"><el-input v-model="formData.income_proof" placeholder="文件链接" /></el-form-item>

      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="申请状态" prop="status">
            <el-select v-model="formData.status" style="width: 100%">
              <el-option label="待审核" value="pending" />
              <el-option label="已通过" value="approved" />
              <el-option label="已驳回" value="rejected" />
              <el-option label="已完成" value="completed" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="提交时间" prop="submit_time">
            <el-date-picker v-model="formData.submit_time" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="审核人ID" prop="reviewer_id">
            <el-input-number v-model="formData.reviewer_id" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="审核备注 / 驳回原因" prop="reject_reason">
        <el-input v-model="formData.reject_reason" type="textarea" :rows="3" />
      </el-form-item>
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
import type { ReliefApplicationItem, ReliefProjectItem } from '@/api/resource/drug/donationProject'
import { getReliefProjectList } from '@/api/resource/drug/donationProject'

interface Props {
  modelValue: boolean
  editData?: ReliefApplicationItem | null
}

const props = withDefaults(defineProps<Props>(), { editData: null })
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: ReliefApplicationItem]
}>()

const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const projectLoading = ref(false)
const projectOptions = ref<ReliefProjectItem[]>([])

const createEmptyForm = (): ReliefApplicationItem => ({
  project_id: null,
  user_id: null,
  patient_name: '',
  patient_id_card_enc: '',
  patient_id_card_mask: '',
  diagnosis_proof: '',
  income_proof: '',
  contact_phone: '',
  status: 'pending',
  submit_time: '',
  reviewer_id: null,
  reject_reason: ''
})

const formData = reactive<ReliefApplicationItem>(createEmptyForm())

const formRules: FormRules = {
  project_id: [{ required: true, message: '请选择援助项目', trigger: 'change' }],
  user_id: [{ required: true, message: '请输入用户ID', trigger: 'change' }],
  patient_name: [{ required: true, message: '请输入患者姓名', trigger: 'blur' }],
  patient_id_card_mask: [{ required: true, message: '请输入脱敏证件号', trigger: 'blur' }],
  diagnosis_proof: [{ required: true, message: '请输入诊断证明链接', trigger: 'blur' }],
  income_proof: [{ required: true, message: '请输入收入证明链接', trigger: 'blur' }],
  contact_phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  submit_time: [{ required: true, message: '请选择提交时间', trigger: 'change' }]
}

watch(() => props.modelValue, async (val) => {
  dialogVisible.value = val
  if (val) {
    if (props.editData) {
      isEdit.value = true
      Object.assign(formData, createEmptyForm(), props.editData)
    } else {
      isEdit.value = false
      resetForm()
    }
    await searchProjects('')
  }
})
watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
  if (!val) resetForm()
})

const searchProjects = async (keyword: string) => {
  projectLoading.value = true
  try {
    const res = await getReliefProjectList({ page: 1, page_size: 20, keyword, audit_status: 1 })
    projectOptions.value = ((res as any).data?.list || []) as ReliefProjectItem[]
  } finally {
    projectLoading.value = false
  }
}

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
    emit('submit', { ...formData })
  } finally {
    submitLoading.value = false
  }
}
</script>
