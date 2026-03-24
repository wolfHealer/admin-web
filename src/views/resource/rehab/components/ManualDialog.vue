<!-- src/views/resource/rehab/components/ManualDialog.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑护理手册' : '新增护理手册'"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
    @open="handleOpen"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-form-item label="手册标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入手册标题" />
      </el-form-item>
      <el-form-item label="分类" prop="category">
        <el-select v-model="formData.category" placeholder="请选择分类" style="width: 100%">
          <el-option label="饮食指导" value="diet" />
          <el-option label="皮肤护理" value="skin" />
          <el-option label="口腔护理" value="oral" />
          <el-option label="康复训练" value="rehab" />
          <el-option label="卧床护理" value="bed" />
          <el-option label="用药指导" value="medication" />
          <el-option label="心理支持" value="psychology" />
        </el-select>
      </el-form-item>
      <el-form-item label="护理内容" prop="content">
        <el-input v-model="formData.content" type="textarea" :rows="6" placeholder="请输入护理内容" />
      </el-form-item>
      <el-form-item label="图标" prop="icon">
        <el-input v-model="formData.icon" placeholder="请输入图标名称，如：food, shield, smile" />
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="1" :max="100" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { ManualItem } from '@/api/resource/rehab/manuals'

interface Props {
  modelValue: boolean
  editData?: ManualItem | null
}

const props = withDefaults(defineProps<Props>(), {
  editData: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: ManualItem]
}>()

const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)

const getEmptyFormData = (): ManualItem => ({
  id: 0,
  title: '',
  category: '',
  content: '',
  icon: '',
  sort: 1,
  updateTime: ''
})

const formData = reactive<ManualItem>(getEmptyFormData())

const formRules: FormRules = {
  title: [{ required: true, message: '请输入手册标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  content: [{ required: true, message: '请输入护理内容', trigger: 'blur' }]
}

const handleOpen = () => {
  if (props.editData) {
    isEdit.value = true
    Object.assign(formData, props.editData)
  } else {
    isEdit.value = false
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