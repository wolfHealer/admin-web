<!-- src/views/resource/components/CaseDialog.vue -->
<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑病例模版' : '新增病例模版'"
    width="700px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="模版名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入模版名称" />
      </el-form-item>
      <el-form-item label="疾病类型" prop="diseaseType">
        <el-select v-model="formData.diseaseType" placeholder="选择疾病类型" style="width: 100%">
          <el-option label="心血管疾病" value="心血管疾病" />
          <el-option label="呼吸系统" value="呼吸系统" />
          <el-option label="消化系统" value="消化系统" />
          <el-option label="神经系统" value="神经系统" />
          <el-option label="内分泌系统" value="内分泌系统" />
          <el-option label="骨科" value="骨科" />
        </el-select>
      </el-form-item>
      <el-form-item label="模版类型" prop="templateType">
        <el-select v-model="formData.templateType" placeholder="选择模版类型" style="width: 100%">
          <el-option label="门诊病历" value="门诊病历" />
          <el-option label="住院病历" value="住院病历" />
          <el-option label="手术记录" value="手术记录" />
          <el-option label="出院小结" value="出院小结" />
        </el-select>
      </el-form-item>
      <el-form-item label="适用科室" prop="department">
        <el-input v-model="formData.department" placeholder="请输入适用科室" />
      </el-form-item>
      <el-form-item label="模版内容" prop="content">
        <el-input
          v-model="formData.content"
          type="textarea"
          :rows="8"
          placeholder="请输入病例模版内容"
        />
      </el-form-item>
      <el-form-item label="备注说明" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注说明"
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
  name: '',
  diseaseType: '',
  templateType: '',
  department: '',
  content: '',
  remark: '',
  status: 1 as 0 | 1
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入模版名称', trigger: 'blur' }],
  diseaseType: [{ required: true, message: '请选择疾病类型', trigger: 'change' }],
  templateType: [{ required: true, message: '请选择模版类型', trigger: 'change' }],
  content: [{ required: true, message: '请输入模版内容', trigger: 'blur' }]
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
  formData.name = ''
  formData.diseaseType = ''
  formData.templateType = ''
  formData.department = ''
  formData.content = ''
  formData.remark = ''
  formData.status = 1
}

watch(() => props.data, (newData) => {
  if (newData && props.isEdit) {
    formData.id = newData.id || null
    formData.name = newData.name || ''
    formData.diseaseType = newData.diseaseType || ''
    formData.templateType = newData.templateType || ''
    formData.department = newData.department || ''
    formData.content = newData.content || ''
    formData.remark = newData.remark || ''
    formData.status = newData.status ?? 1
  }
}, { immediate: true })
</script>