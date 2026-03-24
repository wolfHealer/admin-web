<!-- src/views/resource/components/ManagementToolDialog.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑用药管理工具' : '新增用药管理工具'"
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
      <el-form-item label="工具名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入工具名称" />
      </el-form-item>

      <el-form-item label="工具类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择工具类型" style="width: 100%">
          <el-option label="用药提醒" value="用药提醒" />
          <el-option label="药品查询" value="药品查询" />
          <el-option label="健康记录" value="健康记录" />
        </el-select>
      </el-form-item>

      <el-form-item label="平台" prop="platform">
        <el-select v-model="formData.platform" placeholder="请选择平台" style="width: 100%">
          <el-option label="Web" value="Web" />
          <el-option label="iOS" value="iOS" />
          <el-option label="Android" value="Android" />
          <el-option label="小程序" value="小程序" />
        </el-select>
      </el-form-item>

      <el-form-item label="访问地址" prop="url">
        <el-input v-model="formData.url" placeholder="请输入访问地址" />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-select v-model="formData.status" placeholder="请选择状态" style="width: 100%">
          <el-option label="启用" :value="1" />
          <el-option label="停用" :value="0" />
        </el-select>
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="3"
          placeholder="请输入备注信息"
        />
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
import { ElMessage } from 'element-plus'

interface ManagementToolItem {
  id?: number
  name: string
  type: string
  platform: string
  url: string
  status: number
  remark?: string
  createdAt?: string
  updatedAt?: string
}

interface Props {
  modelValue: boolean
  isEdit: boolean
  data: ManagementToolItem | null
}

const props = withDefaults(defineProps<Props>(), {
  data: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: ManagementToolItem]
}>()

const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const submitLoading = ref(false)

// 创建初始空数据对象
const getEmptyFormData = (): ManagementToolItem => ({
  name: '',
  type: '',
  platform: '',
  url: '',
  status: 1,
  remark: ''
})

const formData = reactive<ManagementToolItem>(getEmptyFormData())

const formRules: FormRules = {
  name: [{ required: true, message: '请输入工具名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择工具类型', trigger: 'change' }],
  platform: [{ required: true, message: '请选择平台', trigger: 'change' }],
  url: [
    { required: true, message: '请输入访问地址', trigger: 'blur' },
    { type: 'url', message: '请输入有效的 URL 地址', trigger: 'blur' }
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 弹窗打开时初始化数据
const handleOpen = () => {
  if (props.data) {
    Object.assign(formData, props.data)
  } else {
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