<!-- src/views/knowledge/components/CategoryDialog.vue -->
<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑分类' : '新增分类'"
    width="500px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="80px"
    >
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入分类名称" />
      </el-form-item>
      <el-form-item label="分类图标" prop="iconUrl">
        <el-input v-model="formData.iconUrl" placeholder="请输入图标 URL" />
      </el-form-item>
      <el-form-item label="排序" prop="sortOrder">
        <el-input-number v-model="formData.sortOrder" :min="0" :max="999" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="0">停用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入分类描述"
        />
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
import type { Category } from '@/api/knowledge/knowledge'

interface Props {
  modelValue: boolean
  isEdit: boolean
  data?: Category | null
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
  iconUrl: '',
  sortOrder: 0,
  status: 1 as 0 | 1,
  description: ''
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        // 提交驼峰格式数据，由父组件转换为下划线
        emit('submit', {
          id: formData.id,
          name: formData.name,
          iconUrl: formData.iconUrl,
          sortOrder: formData.sortOrder,
          status: formData.status,
          description: formData.description
        })
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
  formData.iconUrl = ''
  formData.sortOrder = 0
  formData.status = 1
  formData.description = ''
}

// 监听数据变化，填充表单
watch(() => props.data, (newData) => {
  if (newData && props.isEdit) {
    formData.id = newData.id
    formData.name = newData.name
    formData.iconUrl = newData.iconUrl || ''
    formData.sortOrder = newData.sortOrder
    formData.status = newData.status
    formData.description = newData.description || ''
  }
}, { immediate: true })
</script>