<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑援助项目' : '新增援助项目'"
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
      <el-form-item label="项目名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入项目名称" />
      </el-form-item>
      <el-form-item label="组织机构" prop="organizer">
        <el-input v-model="formData.organizer" placeholder="请输入组织机构" />
      </el-form-item>
      <el-form-item label="疾病类型" prop="diseaseValue">
        <el-select v-model="formData.diseaseValue" placeholder="请选择疾病类型" style="width: 100%">
          <el-option label="非小细胞肺癌" :value="1" />
          <el-option label="血友病" :value="2" />
          <el-option label="戈谢病" :value="3" />
          <el-option label="乳腺癌" :value="4" />
        </el-select>
      </el-form-item>
      <el-form-item label="赠药剂量" prop="dosage">
        <el-input v-model="formData.dosage" placeholder="请输入赠药剂量" />
      </el-form-item>
      <el-form-item label="援助周期" prop="period">
        <el-input v-model="formData.period" placeholder="请输入援助周期" />
      </el-form-item>
      <el-form-item label="申请条件" prop="condition">
        <el-input v-model="formData.condition" type="textarea" :rows="4" placeholder="请输入申请条件" />
      </el-form-item>
      <el-form-item label="进度查询" prop="progressQuery">
        <el-input v-model="formData.progressQuery" type="textarea" :rows="3" placeholder="请输入进度查询方式" />
      </el-form-item>
      <el-form-item label="申请表链接" prop="applyForm">
        <el-input v-model="formData.applyForm" placeholder="请输入申请表下载链接" />
      </el-form-item>
      <el-form-item label="申请指南链接" prop="applyGuide">
        <el-input v-model="formData.applyGuide" placeholder="请输入申请指南下载链接" />
      </el-form-item>
      <el-form-item label="材料清单链接" prop="materialList">
        <el-input v-model="formData.materialList" placeholder="请输入材料清单下载链接" />
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
import type { AssistanceProgramItem } from '@/api/resource/drug/assistanceProgram'

interface Props {
  modelValue: boolean
  editData?: AssistanceProgramItem | null
}

const props = withDefaults(defineProps<Props>(), {
  editData: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: AssistanceProgramItem]
}>()

const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)

// 创建初始空数据对象
const getEmptyFormData = (): AssistanceProgramItem => ({
  id: 0,
  name: '',
  organizer: '',
  drugId: 0,
  condition: '',
  dosage: '',
  period: '',
  applyForm: '',
  applyGuide: '',
  materialList: '',
  progressQuery: '',
  diseaseValue: 0
})

const formData = reactive<AssistanceProgramItem>(getEmptyFormData())

const formRules: FormRules = {
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  organizer: [{ required: true, message: '请输入组织机构', trigger: 'blur' }],
  diseaseValue: [{ required: true, message: '请选择疾病类型', trigger: 'change' }],
  dosage: [{ required: true, message: '请输入赠药剂量', trigger: 'blur' }],
  period: [{ required: true, message: '请输入援助周期', trigger: 'blur' }],
  condition: [{ required: true, message: '请输入申请条件', trigger: 'blur' }]
}

// 弹窗打开时初始化数据
const handleOpen = () => {
  if (props.editData) {
    isEdit.value = true
    Object.assign(formData, props.editData)
  } else {
    isEdit.value = false
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