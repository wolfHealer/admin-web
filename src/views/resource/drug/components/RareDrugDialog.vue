<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑罕见药品' : '新增罕见药品'"
    width="700px"
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
      <el-form-item label="药品名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入药品名称" />
      </el-form-item>
      <el-form-item label="剂型" prop="dosageForm">
        <el-input v-model="formData.dosageForm" placeholder="请输入剂型" />
      </el-form-item>
      <el-form-item label="规格" prop="spec">
        <el-input v-model="formData.spec" placeholder="请输入规格" />
      </el-form-item>
      <el-form-item label="适应症" prop="indication">
        <el-input v-model="formData.indication" type="textarea" :rows="3" placeholder="请输入适应症" />
      </el-form-item>
      <el-form-item label="药品类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择药品类型" style="width: 100%">
          <el-option label="进口药" value="imported" />
          <el-option label="国产药" value="domestic" />
          <el-option label="特殊药品" value="special" />
        </el-select>
      </el-form-item>
      <el-form-item label="参考价格" prop="refPrice">
        <el-input v-model="formData.refPrice" placeholder="请输入参考价格" />
      </el-form-item>
      <el-form-item label="是否医保" prop="insurance">
        <el-switch v-model="formData.insurance" active-text="是" inactive-text="否" />
      </el-form-item>
      <el-form-item label="是否有救助" prop="hasRelief">
        <el-switch v-model="formData.hasRelief" active-text="是" inactive-text="否" />
      </el-form-item>
      <el-form-item label="是否上市" prop="isLaunched">
        <el-switch v-model="formData.isLaunched" active-text="是" inactive-text="否" />
      </el-form-item>
      <el-form-item label="需处方" prop="needPrescription">
        <el-switch v-model="formData.needPrescription" active-text="是" inactive-text="否" />
      </el-form-item>
      <el-form-item label="说明书链接" prop="manualUrl">
        <el-input v-model="formData.manualUrl" placeholder="请输入说明书链接" />
      </el-form-item>
      <el-form-item label="描述" prop="desc">
        <el-input v-model="formData.desc" type="textarea" :rows="3" placeholder="请输入描述" />
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
import type { RareDrugItem } from '@/api/resource/drug/rareDrug'

interface Props {
  modelValue: boolean
  editData?: RareDrugItem | null
}

const props = withDefaults(defineProps<Props>(), {
  editData: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: RareDrugItem]
}>()

const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)

// 创建初始空数据对象
const getEmptyFormData = (): RareDrugItem => ({
  id: 0,
  name: '',
  indication: '',
  type: '',
  insurance: true,
  desc: '',
  manualUrl: '',
  dosageForm: '',
  spec: '',
  refPrice: '',
  hasRelief: false,
  isLaunched: true,
  needPrescription: true
})

const formData = reactive<RareDrugItem>(getEmptyFormData())

const formRules: FormRules = {
  name: [{ required: true, message: '请输入药品名称', trigger: 'blur' }],
  spec: [{ required: true, message: '请输入规格', trigger: 'blur' }],
  dosageForm: [{ required: true, message: '请输入剂型', trigger: 'blur' }],
  indication: [{ required: true, message: '请输入适应症', trigger: 'blur' }],
  type: [{ required: true, message: '请选择药品类型', trigger: 'change' }],
  refPrice: [{ required: true, message: '请输入参考价格', trigger: 'blur' }]
}

// 弹窗打开时初始化数据
const handleOpen = () => {
  if (props.editData) {
    // 编辑模式：填充数据
    isEdit.value = true
    Object.assign(formData, props.editData)
  } else {
    // 新增模式：重置为空白
    isEdit.value = false
    resetForm()
  }
}

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
  // 弹窗关闭时重置表单
  if (!val) {
    resetForm()
  }
})

const resetForm = () => {
  // 重置为初始空数据
  Object.assign(formData, getEmptyFormData())
  // 清除表单验证状态
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