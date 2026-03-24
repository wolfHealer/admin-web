<!-- src/views/resource/rehab/components/OrganizationDialog.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑康复机构' : '新增康复机构'"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <el-form-item label="机构名称" prop="title">
        <el-input v-model="formData.title" placeholder="请输入机构名称" />
      </el-form-item>
      <el-form-item label="机构类型" prop="organization">
        <el-select v-model="formData.organization" placeholder="请选择机构类型" style="width: 100%">
          <el-option label="康复医院" value="康复医院" />
          <el-option label="康复中心" value="康复中心" />
          <el-option label="其他机构" value="其他机构" />
        </el-select>
      </el-form-item>
      <el-form-item label="资质评级" prop="qualification">
        <el-input-number v-model="formData.qualification" :min="0" :max="5" :step="0.1" style="width: 100%" />
      </el-form-item>
      <el-form-item label="联系方式" prop="contactInfo">
        <el-input v-model="formData.contactInfo" placeholder="请输入电话或邮箱" />
      </el-form-item>
      <el-form-item label="服务区域" prop="region">
        <el-select v-model="formData.region" placeholder="请选择服务区域" style="width: 100%">
          <el-option label="全国" value="全国" />
          <el-option label="北京" value="北京" />
          <el-option label="上海" value="上海" />
          <el-option label="广州" value="广州" />
          <el-option label="深圳" value="深圳" />
        </el-select>
      </el-form-item>
      <el-form-item label="服务范围" prop="serviceScope">
        <el-input v-model="formData.serviceScope" type="textarea" :rows="3" placeholder="请输入服务范围" />
      </el-form-item>
      <el-form-item label="机构描述" prop="description">
        <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入机构描述" />
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
import type { OrganizationItem } from '@/api/resource/rehab/organization'

interface Props {
  modelValue: boolean
  editData?: OrganizationItem | null
}

const props = withDefaults(defineProps<Props>(), {
  editData: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: OrganizationItem]
}>()

const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)

// 获取空表单数据
const getEmptyFormData = (): OrganizationItem => ({
  id: 0,
  title: '',
  organization: '',
  qualification: '',
  contactPerson: '',
  contactInfo: '',
  region: '',
  serviceScope: '',
  description: '',
  status: 1
})

// 使用 ref 而不是 reactive，便于完全替换
const formData = ref<OrganizationItem>(getEmptyFormData())

const formRules: FormRules = {
  title: [{ required: true, message: '请输入机构名称', trigger: 'blur' }],
  organization: [{ required: true, message: '请选择机构类型', trigger: 'change' }],
  contactInfo: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
  region: [{ required: true, message: '请选择服务区域', trigger: 'change' }],
  description: [{ required: true, message: '请输入机构描述', trigger: 'blur' }]
}

// 初始化表单
const initForm = () => {
  if (props.editData) {
    // 编辑模式：填充数据
    isEdit.value = true
    formData.value = { ...props.editData }
  } else {
    // 新增模式：重置为空
    isEdit.value = false
    formData.value = getEmptyFormData()
  }
  // 清空表单验证
  formRef.value?.clearValidate()
}

// 监听对话框打开
watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
  if (val) {
    // 对话框打开时初始化表单
    initForm()
  }
})

// 监听对话框关闭
watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

const handleClose = () => {
  dialogVisible.value = false
}

// 提交数据
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        emit('submit', { ...formData.value })
      } finally {
        submitLoading.value = false
      }
    }
  })
}
</script>