<!-- src/views/resource/charity/components/CaseDialog.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑案例' : '新增案例'"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
    @open="handleOpen"
  >
    <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
      <el-form-item label="案例标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入案例标题" />
      </el-form-item>
      <el-form-item label="患者姓名" prop="patientName">
        <el-input v-model="formData.patientName" placeholder="请输入患者姓名" />
      </el-form-item>
      <el-form-item label="疾病类型" prop="disease">
        <el-input v-model="formData.disease" placeholder="请输入疾病类型" />
      </el-form-item>
      <el-form-item label="案例内容" prop="content">
        <el-input v-model="formData.content" type="textarea" :rows="6" placeholder="请输入案例内容" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitLoading">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { CharityCase } from '@/api/resource/charity/charity'

interface Props {
  modelValue: boolean
  isEdit: boolean
  data: CharityCase | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  isEdit: false,
  data: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: CharityCase]
}>()

const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const submitLoading = ref(false)

const getEmptyFormData = (): CharityCase => ({
  id: 0,
  title: '',
  patientName: '',
  disease: '',
  status: 1,
  uploadTime: '',
  content: '',
  images: []
})

const formData = reactive<CharityCase>(getEmptyFormData())

const formRules: FormRules = {
  title: [{ required: true, message: '请输入案例标题', trigger: 'blur' }],
  patientName: [{ required: true, message: '请输入患者姓名', trigger: 'blur' }],
  disease: [{ required: true, message: '请输入疾病类型', trigger: 'blur' }],
  content: [{ required: true, message: '请输入案例内容', trigger: 'blur' }]
}

const handleOpen = () => {
  if (props.data) {
    Object.assign(formData, props.data)
  } else {
    resetForm()
  }
}

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
  if (!val) {
    resetForm()
  }
})

const resetForm = () => {
  Object.assign(formData, getEmptyFormData())
  formRef.value?.clearValidate()
  formRef.value?.resetFields()
}

const handleClose = () => {
  dialogVisible.value = false
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        emit('submit', { ...formData })
      } finally {
        submitLoading.value = false
      }
    }
  })
}
</script>