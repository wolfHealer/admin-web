<!-- src/views/resource/charity/components/PolicyDialog.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑政策解读' : '新增政策解读'"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
    @open="handleOpen"
  >
    <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
      <el-form-item label="政策标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入政策标题" />
      </el-form-item>
      <el-form-item label="政策类型" prop="policyType">
        <el-select v-model="formData.policyType" placeholder="请选择类型" style="width: 100%">
          <el-option label="国家医保" value="national" />
          <el-option label="地方医保" value="local" />
          <el-option label="大病保险" value="critical" />
          <el-option label="医疗救助" value="assistance" />
        </el-select>
      </el-form-item>
      <el-form-item label="适用地区" prop="region">
        <el-input v-model="formData.region" placeholder="请输入适用地区" />
      </el-form-item>
      <el-form-item label="政策内容" prop="content">
        <el-input v-model="formData.content" type="textarea" :rows="6" placeholder="请输入政策内容" />
      </el-form-item>
      <el-form-item label="文件链接" prop="fileUrl">
        <el-input v-model="formData.fileUrl" placeholder="请输入政策文件链接" />
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
import type { CharityPolicy } from '@/api/resource/charity/charity'

interface Props {
  modelValue: boolean
  isEdit: boolean
  data: CharityPolicy | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  isEdit: false,
  data: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: CharityPolicy]
}>()

const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const submitLoading = ref(false)

const getEmptyFormData = (): CharityPolicy => ({
  id: 0,
  title: '',
  policyType: '',
  region: '',
  status: 1,
  uploadTime: '',
  content: '',
  fileUrl: ''
})

const formData = reactive<CharityPolicy>(getEmptyFormData())

const formRules: FormRules = {
  title: [{ required: true, message: '请输入政策标题', trigger: 'blur' }],
  policyType: [{ required: true, message: '请选择政策类型', trigger: 'change' }],
  region: [{ required: true, message: '请输入适用地区', trigger: 'blur' }],
  content: [{ required: true, message: '请输入政策内容', trigger: 'blur' }]
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