<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑文章标签' : '新增文章标签'"
    width="520px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="90px">
      <el-form-item label="标签名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入标签名称" />
      </el-form-item>
      <el-form-item label="标签类型" prop="type">
        <el-input v-model="formData.type" placeholder="如 medical、science" />
      </el-form-item>
      <el-form-item label="排序" prop="sortOrder">
        <el-input-number v-model="formData.sortOrder" :min="0" :max="999" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :value="1">启用</el-radio>
          <el-radio :value="0">停用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { ArticleTagItem } from '@/api/knowledge/articleTag'

interface Props {
  modelValue: boolean
  isEdit: boolean
  data?: ArticleTagItem | null
}

const props = withDefaults(defineProps<Props>(), {
  data: null,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: {
    id: number | null
    name: string
    type: string
    sortOrder: number
    status: 0 | 1
  }]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const formRef = ref<FormInstance>()
const loading = ref(false)

const formData = reactive({
  id: null as number | null,
  name: '',
  type: '',
  sortOrder: 0,
  status: 1 as 0 | 1,
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入标签名称', trigger: 'blur' }],
  type: [{ required: true, message: '请输入标签类型', trigger: 'blur' }],
}

const resetForm = () => {
  formData.id = null
  formData.name = ''
  formData.type = ''
  formData.sortOrder = 0
  formData.status = 1
}

watch(
  () => ({ data: props.data, isEdit: props.isEdit }),
  ({ data, isEdit }) => {
    if (data && isEdit) {
      formData.id = data.id
      formData.name = data.name
      formData.type = data.type || data.code || ''
      formData.sortOrder = data.sortOrder || 0
      formData.status = data.status ?? 1
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

const handleSubmit = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    emit('submit', { ...formData })
    visible.value = false
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  formRef.value?.resetFields()
  resetForm()
}
</script>
