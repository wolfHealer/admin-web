<!-- src/views/resource/charity/components/RehabilitationGuideDialog.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑康复指南' : '新增康复指南'"
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
      <el-form-item label="指南标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入指南标题" />
      </el-form-item>
      <el-form-item label="分类" prop="category">
        <el-select v-model="formData.category" placeholder="请选择分类" style="width: 100%">
          <el-option label="肢体康复" value="肢体康复" />
          <el-option label="认知康复" value="认知康复" />
          <el-option label="言语康复" value="言语康复" />
        </el-select>
      </el-form-item>
      <el-form-item label="难度等级" prop="difficulty">
        <el-select v-model="formData.difficulty" placeholder="请选择难度" style="width: 100%">
          <el-option label="初级" value="初级" />
          <el-option label="中级" value="中级" />
          <el-option label="高级" value="高级" />
        </el-select>
      </el-form-item>
      <el-form-item label="训练时长" prop="duration">
        <el-input v-model="formData.duration" placeholder="如：30 分钟/次" />
      </el-form-item>
      <el-form-item label="详细描述" prop="description">
        <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入详细描述" />
      </el-form-item>
      <el-form-item label="视频链接" prop="videoUrl">
        <el-input v-model="formData.videoUrl" placeholder="请输入视频链接" />
      </el-form-item>
      <el-form-item label="文件链接" prop="fileUrl">
        <el-input v-model="formData.fileUrl" placeholder="请输入文件链接" />
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
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { RehabilitationGuideItem } from '@/api/resource/charity/rehabilitationGuide'

interface Props {
  modelValue: boolean
  editData?: RehabilitationGuideItem | null
}

const props = withDefaults(defineProps<Props>(), {
  editData: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: RehabilitationGuideItem]
}>()

const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)

const getEmptyFormData = (): RehabilitationGuideItem => ({
  id: 0,
  title: '',
  category: '',
  difficulty: '',
  duration: '',
  description: '',
  videoUrl: '',
  fileUrl: '',
  status: 1
})

const formData = reactive<RehabilitationGuideItem>(getEmptyFormData())

const formRules: FormRules = {
  title: [{ required: true, message: '请输入指南标题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  difficulty: [{ required: true, message: '请选择难度等级', trigger: 'change' }],
  duration: [{ required: true, message: '请输入训练时长', trigger: 'blur' }],
  description: [{ required: true, message: '请输入详细描述', trigger: 'blur' }]
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