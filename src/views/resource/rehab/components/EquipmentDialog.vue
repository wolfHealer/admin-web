<!-- src/views/resource/rehab/components/EquipmentDialog.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑康复设备' : '新增康复设备'"
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
      <el-form-item label="设备名称" prop="title">
        <el-input v-model="formData.title" placeholder="请输入设备名称" />
      </el-form-item>
      <el-form-item label="设备分类" prop="equipmentModel">
        <el-select v-model="formData.equipmentModel" placeholder="请选择设备分类" style="width: 100%">
          <el-option label="站立训练类" value="站立训练类" />
          <el-option label="其他器械" value="其他器械" />
        </el-select>
      </el-form-item>
      <el-form-item label="价格范围" prop="priceRange">
        <el-input v-model="formData.priceRange" placeholder="请输入价格范围" />
      </el-form-item>
      <el-form-item label="是否医保" prop="insuranceCovered">
        <el-switch v-model="formData.insuranceCovered" />
      </el-form-item>
      <el-form-item label="适用人群" prop="suitableFor">
        <el-input 
          v-model="formData.suitableFor" 
          type="textarea" 
          :rows="3" 
          placeholder="请输入适用人群，多条用分号分隔" 
        />
      </el-form-item>
      <el-form-item label="设备描述" prop="description">
        <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请输入设备描述" />
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
import { ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { EquipmentItem } from '@/api/resource/rehab/equipment'

interface Props {
  modelValue: boolean
  editData?: EquipmentItem | null
}

const props = withDefaults(defineProps<Props>(), {
  editData: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: EquipmentItem]
}>()

const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)

const getEmptyFormData = (): EquipmentItem => ({
  id: 0,
  title: '',
  equipmentModel: '',
  manufacturer: '',
  contactPerson: '',
  contactInfo: '',
  region: '',
  description: '',
  availableQuantity: 0,
  suitableFor: '',
  priceRange: '',
  insuranceCovered: false,
  status: 1
})

const formData = ref<EquipmentItem>(getEmptyFormData())

const formRules: FormRules = {
  title: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  equipmentModel: [{ required: true, message: '请选择设备分类', trigger: 'change' }],
  description: [{ required: true, message: '请输入设备描述', trigger: 'blur' }]
}

const initForm = () => {
  if (props.editData) {
    isEdit.value = true
    formData.value = { ...props.editData }
  } else {
    isEdit.value = false
    formData.value = getEmptyFormData()
  }
  formRef.value?.clearValidate()
}

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
  if (val) {
    initForm()
  }
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

const handleClose = () => {
  dialogVisible.value = false
}

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