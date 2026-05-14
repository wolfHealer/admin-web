<template>
  <el-dialog
    :model-value="modelValue"
    :title="form.id ? '编辑区域' : '新增区域'"
    width="620px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="父级区域">
        <el-input :model-value="parentDisplay" disabled />
      </el-form-item>

      <el-form-item label="区域编码" prop="code">
        <el-input v-model="form.code" :disabled="!!form.id" placeholder="如：110000" />
      </el-form-item>

      <el-form-item label="简称" prop="name">
        <el-input v-model="form.name" placeholder="如：北京" />
      </el-form-item>

      <el-form-item label="全称" prop="fullName">
        <el-input v-model="form.fullName" placeholder="如：北京市" />
      </el-form-item>

      <el-form-item label="层级">
        <el-input :model-value="levelText(form.level || 1)" disabled />
      </el-form-item>

      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="form.sort" :min="0" :max="9999" style="width: 180px" />
      </el-form-item>

      <el-form-item label="状态" prop="isEnabled">
        <el-radio-group v-model="form.isEnabled">
          <el-radio :label="1">启用</el-radio>
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
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  addRegion,
  getRegionDetail,
  updateRegion,
  type RegionItem,
} from '@/api/region/region'

const props = defineProps<{
  modelValue: boolean
  id: number | null
  parentRegion?: RegionItem | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'success'): void
}>()

const formRef = ref<FormInstance>()
const saving = ref(false)

const getDefaultForm = (): Partial<RegionItem> => ({
  id: undefined,
  code: '',
  name: '',
  fullName: '',
  parentCode: '',
  level: 1,
  sort: 0,
  isEnabled: 1,
})

const form = reactive<Partial<RegionItem>>(getDefaultForm())

const rules: FormRules = {
  code: [
    { required: true, message: '请输入区域编码', trigger: 'blur' },
    { pattern: /^\d+$/, message: '区域编码必须是数字', trigger: 'blur' },
  ],
  name: [{ required: true, message: '请输入简称', trigger: 'blur' }],
  fullName: [{ required: true, message: '请输入全称', trigger: 'blur' }], // 改为 fullName
}

const levelText = (level: number) => {
  if (level === 1) return '省级'
  if (level === 2) return '市级'
  if (level === 3) return '区县'
  return '-'
}

const parentDisplay = computed(() => {
  if (form.level === 1) return '无（顶级区域）'
  return props.parentRegion?.fullName || form.parentCode || '-'
})

const resetForm = () => {
  Object.assign(form, getDefaultForm())
  formRef.value?.clearValidate()
}

const initCreateForm = () => {
  resetForm()

  const parent = props.parentRegion
  if (!parent || !parent.code) {
    form.parentCode = ''
    form.level = 1
  } else {
    form.parentCode = parent.code
    form.level = Math.min((parent.level || 1) + 1, 3) as 1 | 2 | 3
  }
}

const loadDetail = async () => {
  if (!props.id) return
  const res = await getRegionDetail(props.id)
  Object.assign(form, res.data || {})
}

watch(
  () => props.modelValue,
  async (val) => {
    if (!val) return
    if (props.id) {
      resetForm()
      await loadDetail()
    } else {
      initCreateForm()
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
      await updateRegion(props.id, payload)
      ElMessage.success('更新成功')
    } else {
      await addRegion(payload)
      ElMessage.success('新增成功')
    }
    emit('update:modelValue', false)
    emit('success')
  } finally {
    saving.value = false
  }
}
</script>