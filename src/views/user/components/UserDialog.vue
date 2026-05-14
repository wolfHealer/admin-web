<template>
  <el-dialog
    :model-value="modelValue"
    :title="form.id ? '编辑用户' : '新增用户'"
    width="620px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="手机号" prop="phone">
        <el-input v-model="form.phone" :disabled="!!form.id" />
      </el-form-item>

      <el-form-item v-if="!form.id" label="初始密码" prop="password">
        <el-input v-model="form.password" type="password" show-password />
      </el-form-item>

      <el-form-item label="展示名">
        <el-input v-model="form.displayName" maxlength="50" show-word-limit />
      </el-form-item>

      <el-form-item label="头像 URL">
        <el-input v-model="form.avatar" />
      </el-form-item>

      <el-form-item label="角色" prop="role">
        <el-radio-group v-model="form.role">
          <el-radio :label="1">普通用户</el-radio>
          <el-radio :label="2">专家</el-radio>
          <el-radio :label="9">管理员</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :label="1">正常</el-radio>
          <el-radio :label="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  addUser,
  getUserDetail,
  updateUser,
  type UserForm,
} from '@/api/user/user'

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

const getDefaultForm = (): Partial<UserForm> => ({
  id: undefined,
  phone: '',
  password: '',
  displayName: '',
  avatar: '',
  role: 1,
  status: 1,
})

const form = reactive<Partial<UserForm>>(getDefaultForm())

const rules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  password: [{ required: true, message: '请输入初始密码', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
}

const resetForm = () => {
  Object.assign(form, getDefaultForm())
  formRef.value?.clearValidate()
}

const loadDetail = async () => {
  if (!props.id) return
  const res = await getUserDetail(props.id)
  Object.assign(form, res.data || {})
  form.password = ''
}

watch(
  () => props.modelValue,
  async (val) => {
    if (!val) return
    resetForm()
    if (props.id) {
      await loadDetail()
    }
  }
)

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleSubmit = async () => {
  await formRef.value?.validate()
  saving.value = true
  try {
    const payload = { ...form }
    if (props.id) {
      delete payload.password
      await updateUser(props.id, payload)
      ElMessage.success('更新成功')
    } else {
      await addUser(payload)
      ElMessage.success('新增成功')
    }
    emit('update:modelValue', false)
    emit('success')
  } finally {
    saving.value = false
  }
}
</script>