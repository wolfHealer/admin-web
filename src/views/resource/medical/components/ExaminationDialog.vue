<!-- src/views/resource/components/ExaminationDialog.vue -->
<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑项目' : '新增项目'"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="项目名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入项目名称" />
      </el-form-item>
      <el-form-item label="项目类型" prop="type">
        <el-select v-model="formData.type" placeholder="选择项目类型" style="width: 100%">
          <el-option label="血液检查" value="血液检查" />
          <el-option label="影像检查" value="影像检查" />
          <el-option label="心电图" value="心电图" />
          <el-option label="超声检查" value="超声检查" />
          <el-option label="内镜检查" value="内镜检查" />
        </el-select>
      </el-form-item>
      <el-form-item label="价格（元）" prop="price">
        <el-input-number 
          v-model="formData.price" 
          :min="0" 
          :precision="2" 
          :step="0.1"
          style="width: 100%"
          placeholder="请输入价格"
        />
      </el-form-item>
      <el-form-item label="说明" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="4"
          placeholder="请输入项目说明"
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
  type: '',
  price: 0 as number,
  description: '',
  status: 1 as 0 | 1
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择项目类型', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }]
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
  formData.type = ''
  formData.price = 0
  formData.description = ''
  formData.status = 1
}

watch(() => props.data, (newData) => {
  if (newData && props.isEdit) {
    formData.id = newData.id || null
    formData.name = newData.name || ''
    formData.type = newData.type || ''
    formData.price = newData.price || 0
    formData.description = newData.description || ''
    formData.status = newData.status ?? 1
  }
}, { immediate: true })
</script>