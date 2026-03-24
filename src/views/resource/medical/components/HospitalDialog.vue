<!-- src/views/resource/components/HospitalDialog.vue -->
<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑医院' : '新增医院'"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="医院名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入医院名称" />
      </el-form-item>
      <el-form-item label="医院等级" prop="level">
        <el-select v-model="formData.level" placeholder="选择医院等级" style="width: 100%">
          <el-option label="三甲" value="三甲" />
          <el-option label="三乙" value="三乙" />
          <el-option label="二甲" value="二甲" />
          <el-option label="二乙" value="二乙" />
        </el-select>
      </el-form-item>
      <el-form-item label="医院类型" prop="type">
        <el-select v-model="formData.type" placeholder="选择医院类型" style="width: 100%">
          <el-option label="综合医院" value="综合医院" />
          <el-option label="专科医院" value="专科医院" />
          <el-option label="中医医院" value="中医医院" />
        </el-select>
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入联系电话" />
      </el-form-item>
      <el-form-item label="地址" prop="address">
        <el-input v-model="formData.address" placeholder="请输入医院地址" />
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
  level: '',
  type: '',
  phone: '',
  address: '',
  status: 1 as 0 | 1
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入医院名称', trigger: 'blur' }],
  level: [{ required: true, message: '请选择医院等级', trigger: 'change' }],
  type: [{ required: true, message: '请选择医院类型', trigger: 'change' }]
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
  formData.level = ''
  formData.type = ''
  formData.phone = ''
  formData.address = ''
  formData.status = 1
}

watch(() => props.data, (newData) => {
  if (newData && props.isEdit) {
    formData.id = newData.id || null
    formData.name = newData.name || ''
    formData.level = newData.level || ''
    formData.type = newData.type || ''
    formData.phone = newData.phone || ''
    formData.address = newData.address || ''
    formData.status = newData.status ?? 1
  }
}, { immediate: true })
</script>