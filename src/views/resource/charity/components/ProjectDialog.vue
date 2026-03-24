<!-- src/views/resource/charity/components/ProjectDialog.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑项目' : '新增项目'"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
    @open="handleOpen"
  >
    <el-form :model="formData" :rules="formRules" ref="formRef" label-width="120px">
      <el-form-item label="项目名称" prop="title">
        <el-input v-model="formData.title" placeholder="请输入项目名称" />
      </el-form-item>
      
      <el-form-item label="项目内容/流程" prop="content">
        <el-input 
          v-model="formData.content" 
          type="textarea" 
          :rows="4"
          placeholder="请输入项目内容或申请流程说明" 
        />
      </el-form-item>
      
      <el-form-item label="申请条件" prop="requirements">
        <el-input 
          v-model="formData.requirements" 
          type="textarea" 
          :rows="4" 
          placeholder="请输入申请条件说明" 
        />
      </el-form-item>
      
      <el-form-item label="截止日期" prop="deadline">
        <el-date-picker
          v-model="formData.deadline"
          type="datetime"
          placeholder="请选择截止日期"
          style="width: 100%"
          value-format="YYYY-MM-DDTHH:mm:ss[Z]"
        />
      </el-form-item>
      
      <el-form-item label="联系方式" prop="contact">
        <el-input 
          v-model="formData.contact" 
          type="textarea" 
          :rows="3"
          placeholder="请输入联系方式（电话、地址等）" 
        />
      </el-form-item>
      
      <el-form-item label="申请表链接" prop="applyForm">
        <el-input v-model="formData.applyForm" placeholder="请输入申请表下载链接" />
      </el-form-item>
      
      <el-form-item label="申请指南链接" prop="applyGuide">
        <el-input v-model="formData.applyGuide" placeholder="请输入申请指南下载链接" />
      </el-form-item>
      
      <el-form-item label="材料清单链接" prop="materialList">
        <el-input v-model="formData.materialList" placeholder="请输入材料清单下载链接" />
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

// 定义项目数据类型（与新接口匹配）
interface ProjectData {
  id?: number
  title: string
  content: string
  requirements: string
  deadline: string
  contact: string
  applyForm: string
  applyGuide: string
  materialList: string
}

interface Props {
  modelValue: boolean
  isEdit: boolean
  data: ProjectData | null
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  isEdit: false,
  data: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: ProjectData]
}>()

const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const submitLoading = ref(false)

const getEmptyFormData = (): ProjectData => ({
  title: '',
  content: '',
  requirements: '',
  deadline: '',
  contact: '',
  applyForm: '',
  applyGuide: '',
  materialList: ''
})

const formData = reactive<ProjectData>(getEmptyFormData())

const formRules: FormRules = {
  title: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  content: [{ required: true, message: '请输入项目内容', trigger: 'blur' }],
  requirements: [{ required: true, message: '请输入申请条件', trigger: 'blur' }],
  contact: [{ required: true, message: '请输入联系方式', trigger: 'blur' }]
}

const handleOpen = () => {
  if (props.data) {
    // 复制数据到表单
    formData.title = props.data.title || ''
    formData.content = props.data.content || ''
    formData.requirements = props.data.requirements || ''
    formData.deadline = props.data.deadline || ''
    formData.contact = props.data.contact || ''
    formData.applyForm = props.data.applyForm || ''
    formData.applyGuide = props.data.applyGuide || ''
    formData.materialList = props.data.materialList || ''
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