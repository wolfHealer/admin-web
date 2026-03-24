<!-- src/views/resource/components/GuidelineDialog.vue -->
<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑指南' : '新增指南'"
    width="700px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="指南名称" prop="title">
        <el-input v-model="formData.title" placeholder="请输入指南名称" />
      </el-form-item>
      <el-form-item label="发布机构" prop="org">
        <el-input v-model="formData.org" placeholder="请输入发布机构" />
      </el-form-item>
      <el-form-item label="版本年份" prop="year">
        <el-input v-model="formData.year" placeholder="请输入版本年份" style="width: 150px" />
      </el-form-item>
      <el-form-item label="摘要" prop="summary">
        <el-input
          v-model="formData.summary"
          type="textarea"
          :rows="4"
          placeholder="请输入指南摘要"
        />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="0">停用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">
        确定
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

interface Props {
  modelValue: boolean
  isEdit: boolean
  data?: any | null
}

const props = withDefaults(defineProps<Props>(), {
  data: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: any]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formRef = ref<FormInstance>()
const loading = ref(false)

const formData = reactive({
  id: null as number | null,
  title: '',
  org: '',
  year: '',
  summary: '',
  status: 1 as 0 | 1
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入指南名称', trigger: 'blur' }],
  org: [{ required: true, message: '请输入发布机构', trigger: 'blur' }],
  year: [{ required: true, message: '请输入版本年份', trigger: 'blur' }]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        emit('submit', { ...formData })
        visible.value = false
      } finally {
        loading.value = false
      }
    }
  })
}

const handleClose = () => {
  formRef.value?.resetFields()
  resetForm()
}

const resetForm = () => {
  formData.id = null
  formData.title = ''
  formData.org = ''
  formData.year = ''
  formData.summary = ''
  formData.status = 1
}

watch(() => props.data, (newData) => {
  if (newData && props.isEdit) {
    formData.id = newData.id || null
    formData.title = newData.title || ''
    formData.org = newData.org || ''
    formData.year = newData.year || ''
    formData.summary = newData.summary || ''
    formData.status = newData.status ?? 1
  }
}, { immediate: true })
</script>