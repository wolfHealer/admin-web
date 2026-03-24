<!-- src/views/resource/charity/components/ChannelDialog.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑通道' : '新增通道'"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
    @open="handleOpen"
  >
    <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
      <el-form-item label="通道名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入通道名称" />
      </el-form-item>
      
      <el-form-item label="通道类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择类型" style="width: 100%">
          <el-option label="众筹通道" value="crowdfunding" />
          <el-option label="紧急救助" value="urgent" />
          <el-option label="其他" value="other" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="联系方式" prop="contactValue">
        <el-input 
          v-model="formData.contactValue" 
          type="textarea" 
          :rows="3"
          placeholder="请输入联系方式（支持多行）" 
        />
      </el-form-item>
      
      <el-form-item label="通道描述" prop="desc">
        <el-input 
          v-model="formData.desc" 
          type="textarea" 
          :rows="4" 
          placeholder="请输入通道描述" 
        />
      </el-form-item>
      
      <el-form-item label="服务时间" prop="serviceTime">
        <el-input 
          v-model="formData.serviceTime" 
          type="textarea" 
          :rows="3"
          placeholder="请输入服务时间说明" 
        />
      </el-form-item>
      
      <el-form-item label="状态" prop="available">
        <el-switch v-model="formData.available" active-text="启用" inactive-text="停用" />
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
  isEdit: boolean
  data: ChannelData | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  isEdit: false,
  data: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: ChannelData]
}>()

const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const submitLoading = ref(false)

const getEmptyFormData = (): ChannelData => ({
  name: '',
  desc: '',
  type: '',
  contactValue: '',
  serviceTime: '',
  available: true
})

const formData = reactive<ChannelData>(getEmptyFormData())

const formRules: FormRules = {
  name: [{ required: true, message: '请输入通道名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择通道类型', trigger: 'change' }],
  contactValue: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
  desc: [{ required: true, message: '请输入通道描述', trigger: 'blur' }]
}

const handleOpen = () => {
  if (props.data) {
    // 复制数据到表单
    formData.name = props.data.name || ''
    formData.desc = props.data.desc || ''
    formData.type = props.data.type || ''
    formData.contactValue = props.data.contactValue || ''
    formData.serviceTime = props.data.serviceTime || ''
    formData.available = props.data.available ?? true
    if (props.data.id) {
      formData.id = props.data.id
    }
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