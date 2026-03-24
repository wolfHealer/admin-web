<!-- src/views/resource/rehab/components/PsychologicalSupportDialog.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑心理咨询机构' : '新增心理咨询机构'"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-form-item label="机构名称" prop="title">
        <el-input v-model="formData.title" placeholder="请输入机构名称" />
      </el-form-item>
      <el-form-item label="机构类型" prop="resourceType">
        <el-select v-model="formData.resourceType" placeholder="请选择机构类型" style="width: 100%">
          <el-option label="心理中心" value="心理中心" />
          <el-option label="心理咨询室" value="心理咨询室" />
          <el-option label="心理热线" value="心理热线" />
        </el-select>
      </el-form-item>
      <el-form-item label="服务区域" prop="region">
        <el-select v-model="formData.region" placeholder="请选择服务区域" style="width: 100%">
          <el-option label="全国" value="全国" />
          <el-option label="北京" value="北京" />
          <el-option label="上海" value="上海" />
          <el-option label="广州" value="广州" />
        </el-select>
      </el-form-item>
      <el-form-item label="联系方式" prop="contactInfo">
        <el-input v-model="formData.contactInfo" placeholder="请输入电话或微信" type="textarea" :rows="2" />
      </el-form-item>
      <el-form-item label="服务时间" prop="serviceHours">
        <el-input v-model="formData.serviceHours" placeholder="如：周一至周日 08:00-17:00" />
      </el-form-item>
      <el-form-item label="服务描述" prop="description">
        <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入服务描述" />
      </el-form-item>
      <el-form-item label="是否免费" prop="isFree">
        <el-switch v-model="formData.isFree" active-text="免费" inactive-text="收费" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { PsychologicalSupportItem } from '@/api/resource/rehab/psychologicalSupport'

interface Props {
  modelValue: boolean
  editData?: PsychologicalSupportItem | null
}

const props = withDefaults(defineProps<Props>(), {
  editData: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: PsychologicalSupportItem]
}>()

const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)

const getEmptyFormData = (): PsychologicalSupportItem => ({
  id: 0,
  title: '',
  resourceType: '',
  provider: '',
  contactInfo: '',
  serviceHours: '',
  description: '',
  region: '',
  isFree: true,
  status: 1
})

// 使用 ref 而不是 reactive，便于完全替换
const formData = ref<PsychologicalSupportItem>(getEmptyFormData())

const formRules: FormRules = {
  title: [{ required: true, message: '请输入机构名称', trigger: 'blur' }],
  resourceType: [{ required: true, message: '请选择机构类型', trigger: 'change' }],
  region: [{ required: true, message: '请选择服务区域', trigger: 'change' }],
  contactInfo: [{ required: true, message: '请输入联系方式', trigger: 'blur' }]
}

// 初始化表单
const initForm = () => {
  if (props.editData) {
    isEdit.value = true
    formData.value = { ...props.editData }
  } else {
    isEdit.value = false
    formData.value = getEmptyFormData()
  }
  formRef.value?.clearValidate()
}

// 监听对话框打开
watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
  if (val) {
    initForm()
  }
})

// 监听对话框关闭
watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

const handleClose = () => {
  dialogVisible.value = false
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        emit('submit', { ...formData.value })
      } finally {
        submitLoading.value = false
      }
    }
  })
}
</script>