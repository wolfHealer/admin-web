<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑购药渠道' : '新增购药渠道'"
    width="750px"
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
      <el-form-item label="渠道名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入渠道名称" />
      </el-form-item>
      <el-form-item label="渠道类型" prop="type">
        <el-select v-model="formData.type" placeholder="请选择渠道类型" style="width: 100%">
          <el-option label="医院药房" value="医院药房" />
          <el-option label="连锁药店" value="连锁药店" />
          <el-option label="医药电商" value="医药电商" />
          <el-option label="合规代购" value="合规代购" />
        </el-select>
      </el-form-item>
      <el-form-item label="所在区域" prop="region">
        <el-input v-model="formData.region" placeholder="请输入所在区域" />
      </el-form-item>
      <el-form-item label="详细地址" prop="address">
        <el-input v-model="formData.address" type="textarea" :rows="2" placeholder="请输入详细地址" />
      </el-form-item>
      <el-form-item label="联系方式" prop="contact">
        <el-input v-model="formData.contact" placeholder="请输入电话或网址" />
      </el-form-item>
      <el-form-item label="是否医保" prop="isInsurance">
        <el-switch v-model="formData.isInsurance" active-text="是" inactive-text="否" />
      </el-form-item>
      <el-form-item label="配送范围" prop="deliveryScope">
        <el-input v-model="formData.deliveryScope" type="textarea" :rows="2" placeholder="请输入配送范围" />
      </el-form-item>
      <el-form-item label="配送周期" prop="deliveryCycle">
        <el-input v-model="formData.deliveryCycle" placeholder="请输入配送周期" />
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
import { ElMessage } from 'element-plus'
import type { PurchaseChannelItem } from '@/api/resource/drug/purchaseChannel'

interface Props {
  modelValue: boolean
  editData?: PurchaseChannelItem | null
}

const props = withDefaults(defineProps<Props>(), {
  editData: null
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: PurchaseChannelItem]
}>()

const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)

// 创建初始空数据对象
const getEmptyFormData = (): PurchaseChannelItem => ({
  id: 0,
  name: '',
  type: '',
  address: '',
  desc: '',
  region: '',
  contact: '',
  isInsurance: true,
  deliveryScope: '',
  deliveryCycle: ''
})

const formData = reactive<PurchaseChannelItem>(getEmptyFormData())

const formRules: FormRules = {
  name: [{ required: true, message: '请输入渠道名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择渠道类型', trigger: 'change' }],
  region: [{ required: true, message: '请输入所在区域', trigger: 'blur' }],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
  contact: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
  deliveryScope: [{ required: true, message: '请输入配送范围', trigger: 'blur' }],
  deliveryCycle: [{ required: true, message: '请输入配送周期', trigger: 'blur' }]
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