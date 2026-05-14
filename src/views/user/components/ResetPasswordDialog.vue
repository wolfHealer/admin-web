<template>
  <el-dialog
    :model-value="modelValue"
    title="重置密码"
    width="460px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="新密码" prop="password">
        <el-input v-model="form.password" type="password" show-password />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirm_password">
        <el-input v-model="form.confirm_password" type="password" show-password />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSubmit">确认重置</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { resetUserPassword } from '@/api/user/user'

const props = defineProps<{
  modelValue: boolean
  id: number | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'success'): void
}>()

const formRef = ref<FormInstance>()
const saving = ref(false)

const form = reactive({
  password: '',
  confirm_password: '',
})

const rules: FormRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' },
  ],
  confirm_password: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== form.password) callback(new Error('两次输入密码不一致'))
        else callback()
      },
      trigger: 'blur',
    },
  ],
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      form.password = ''
      form.confirm_password = ''
      formRef.value?.clearValidate()
    }
  }
)

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  if (!props.id) return
  saving.value = true
  try {
    await resetUserPassword(props.id, form.password)
    ElMessage.success('密码重置成功')
    emit('update:modelValue', false)
    emit('success')
  } finally {
    saving.value = false
  }
}
</script>