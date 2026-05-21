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
          <el-form-item label="援助项目" prop="projectId">
            <el-select
              v-model="formData.projectId"
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
          <el-form-item label="用户ID" prop="userId">
            <el-input-number v-model="formData.userId" :min="1" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="患者姓名" prop="patientName">
            <el-input v-model="formData.patientName" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话" prop="contactPhone">
            <el-input v-model="formData.contactPhone" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="证件密文" prop="patientIdCardEnc">
            <el-input v-model="formData.patientIdCardEnc" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="证件脱敏" prop="patientIdCardMask">
            <el-input v-model="formData.patientIdCardMask" placeholder="如 1101********1234" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="诊断证明" prop="diagnosisProof">
        <el-input v-model="formData.diagnosisProof" placeholder="文件链接" />
      </el-form-item>
      <el-form-item label="收入证明" prop="incomeProof">
        <el-input v-model="formData.incomeProof" placeholder="文件链接" />
      </el-form-item>

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
          <el-form-item label="提交时间" prop="submitTime">
            <el-date-picker
              v-model="formData.submitTime"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="审核人ID" prop="reviewerId">
            <el-input-number v-model="formData.reviewerId" :min="0" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="审核备注 / 驳回原因" prop="rejectReason">
        <el-input v-model="formData.rejectReason" type="textarea" :rows="3" />
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
  projectId: null,
  userId: null,
  patientName: '',
  patientIdCardEnc: '',
  patientIdCardMask: '',
  diagnosisProof: '',
  incomeProof: '',
  contactPhone: '',
  status: 'pending',
  submitTime: '',
  reviewerId: null,
  rejectReason: '',
})

const formData = reactive<ReliefApplicationItem>(createEmptyForm())

const formRules: FormRules = {
  projectId: [{ required: true, message: '请选择援助项目', trigger: 'change' }],
  userId: [{ required: true, message: '请输入用户ID', trigger: 'change' }],
  patientName: [{ required: true, message: '请输入患者姓名', trigger: 'blur' }],
  patientIdCardMask: [{ required: true, message: '请输入脱敏证件号', trigger: 'blur' }],
  diagnosisProof: [{ required: true, message: '请输入诊断证明链接', trigger: 'blur' }],
  incomeProof: [{ required: true, message: '请输入收入证明链接', trigger: 'blur' }],
  contactPhone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  submitTime: [{ required: true, message: '请选择提交时间', trigger: 'change' }],
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
    const res = await getReliefProjectList({
      page: 1,
      pageSize: 20,
      keyword,
      auditStatus: 1,
    })
    projectOptions.value = res.data?.list ?? []
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
