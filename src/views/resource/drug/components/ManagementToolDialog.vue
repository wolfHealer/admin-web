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
      <el-form-item label="工具名称" prop="title">
        <el-input v-model="formData.title" placeholder="请输入工具名称" />
      </el-form-item>

      <el-form-item label="工具类型" prop="toolType">
        <el-select v-model="formData.toolType" placeholder="请选择工具类型" style="width: 100%">
          <el-option label="用药记录" value="用药记录" />
          <el-option label="储存指南" value="储存指南" />
          <el-option label="用药提醒" value="用药提醒" />
        </el-select>
      </el-form-item>

      <el-form-item label="疾病类型" prop="diseaseValue">
        <el-select v-model="formData.diseaseValue" placeholder="请选择疾病类型" style="width: 100%">
          <el-option label="糖尿病" :value="1" />
          <el-option label="高血压" :value="2" />
          <el-option label="戈谢病" :value="3" />
          <el-option label="哮喘" :value="4" />
        </el-select>
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="4"
          placeholder="请输入工具描述"
        />
      </el-form-item>

      <el-form-item label="文件" prop="files">
        <el-alert
          type="info"
          :closable="false"
          show-icon
        >
          文件上传功能需后端支持，当前仅展示已有文件
        </el-alert>
        <div v-if="formData.files && formData.files.length > 0" style="margin-top: 10px">
          <div
            v-for="file in formData.files"
            :key="file.downloadUrl"
            style="margin-bottom: 8px"
          >
            <el-link :href="file.downloadUrl" target="_blank" type="primary">
              <el-icon><Document /></el-icon>
              {{ file.title }} ({{ file.fileType }})
            </el-link>
          </div>
        </div>
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
import { Document } from '@element-plus/icons-vue'
import type { ManagementToolItem, ManagementToolFile } from '@/api/resource/drug/managementTool'

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
  title: '',
  toolType: '',
  diseaseValue: 0,
  description: '',
  files: [],
  id: 0
})

const formData = reactive<ManagementToolItem>(getEmptyFormData())

const formRules: FormRules = {
  title: [{ required: true, message: '请输入工具名称', trigger: 'blur' }],
  toolType: [{ required: true, message: '请选择工具类型', trigger: 'change' }],
  diseaseValue: [{ required: true, message: '请选择疾病类型', trigger: 'change' }],
  description: [{ required: true, message: '请输入工具描述', trigger: 'blur' }]
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