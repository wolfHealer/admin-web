<!-- src/views/resource/components/DoctorDialog.vue -->
<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑医生' : '新增医生'"
    width="600px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="所属医院" prop="hospitalId">
        <el-select 
          v-model="formData.hospitalId" 
          placeholder="选择所属医院" 
          style="width: 100%"
          filterable
          @focus="loadHospitalOptions"
        >
          <el-option 
            v-for="hospital in hospitalOptions" 
            :key="hospital.id" 
            :label="hospital.name" 
            :value="hospital.id" 
          />
        </el-select>
      </el-form-item>
      <el-form-item label="医生姓名" prop="name">
        <el-input v-model="formData.name" placeholder="请输入医生姓名" />
      </el-form-item>
      <el-form-item label="所属科室" prop="department">
        <el-input v-model="formData.department" placeholder="请输入所属科室" />
      </el-form-item>
      <el-form-item label="职称" prop="title">
        <el-select v-model="formData.title" placeholder="选择职称" style="width: 100%">
          <el-option label="主任医师" value="主任医师" />
          <el-option label="副主任医师" value="副主任医师" />
          <el-option label="主治医师" value="主治医师" />
          <el-option label="住院医师" value="住院医师" />
        </el-select>
      </el-form-item>
      <el-form-item label="擅长领域" prop="specialty">
        <el-input
          v-model="formData.specialty"
          type="textarea"
          :rows="3"
          placeholder="请输入擅长领域"
        />
      </el-form-item>
      <el-form-item label="简介" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入医生简介"
        />
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
import { getHospitalOptions } from '@/api/resource/medical/doctor'

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
const hospitalOptionsLoaded = ref(false)
const hospitalOptions = ref<{ id: number; name: string }[]>([])

const formData = reactive({
  id: null as number | null,
  hospitalId: null as number | null,
  hospitalName: '',
  name: '',
  department: '',
  title: '',
  specialty: '',
  description: '',
  status: 1 as 0 | 1
})

const rules: FormRules = {
  hospitalId: [{ required: true, message: '请选择所属医院', trigger: 'change' }],
  name: [{ required: true, message: '请输入医生姓名', trigger: 'blur' }],
  department: [{ required: true, message: '请输入所属科室', trigger: 'blur' }],
  title: [{ required: true, message: '请选择职称', trigger: 'change' }]
}

const loadHospitalOptions = async () => {
  if (hospitalOptionsLoaded.value) return
  try {
    const res = await getHospitalOptions()
    if ((res as any).code === 200) {
      hospitalOptions.value = (res as any).data || []
      hospitalOptionsLoaded.value = true
    }
  } catch (error) {
    console.error('加载医院列表失败', error)
  }
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
  formData.hospitalId = null
  formData.hospitalName = ''
  formData.name = ''
  formData.department = ''
  formData.title = ''
  formData.specialty = ''
  formData.description = ''
  formData.status = 1
}

watch(() => props.data, (newData) => {
  if (newData && props.isEdit) {
    formData.id = newData.id || null
    formData.hospitalId = newData.hospitalId || null
    formData.hospitalName = newData.hospitalName || ''
    formData.name = newData.name || ''
    formData.department = newData.department || ''
    formData.title = newData.title || ''
    formData.specialty = newData.specialty || ''
    formData.description = newData.description || ''
    formData.status = newData.status ?? 1
  }
}, { immediate: true })
</script>