<template>
  <el-dialog
    :model-value="modelValue"
    :title="form.id ? '编辑求助通道' : '新增求助通道'"
    width="820px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <!-- 修改点：v-model="form.channelType" -->
      <el-form-item label="通道类型" prop="channelType">
        <el-select v-model="form.channelType" placeholder="请选择" style="width: 100%">
          <el-option label="紧急求助" value="emergency_help" />
          <el-option label="众筹支持" value="crowdfunding" />
          <el-option label="慈善咨询" value="charity_consulting" />
          <el-option label="基金会支持" value="foundation_support" />
        </el-select>
      </el-form-item>

      <el-form-item label="通道名称" prop="name">
        <el-input v-model="form.name" maxlength="200" show-word-limit />
      </el-form-item>

      <!-- 修改点：v-model="form.applyCondition", prop="applyCondition" -->
      <el-form-item label="求助条件" prop="applyCondition">
        <el-input
          v-model="form.applyCondition"
          type="textarea"
          :rows="3"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <!-- 修改点：v-model="form.responseTime", prop="responseTime" -->
      <el-form-item label="响应时间" prop="responseTime">
        <el-input v-model="form.responseTime" placeholder="如：24小时内 / 3个工作日内" />
      </el-form-item>

      <!-- 修改点：v-model="form.contactPhone" -->
      <el-form-item label="联系电话">
        <el-input v-model="form.contactPhone" />
      </el-form-item>

      <!-- 修改点：v-model="form.contactUrl" -->
      <el-form-item label="求助入口/官网">
        <el-input v-model="form.contactUrl" />
      </el-form-item>

      <!-- 修改点：v-model="form.helpLetterTemplate" -->
      <el-form-item label="求助信模板">
        <el-input v-model="form.helpLetterTemplate" />
      </el-form-item>

      <!-- 修改点：v-model="form.crowdfundingTemplate" -->
      <el-form-item label="众筹模板">
        <el-input v-model="form.crowdfundingTemplate" />
      </el-form-item>

      <!-- 修改点：v-model="form.auditStatus", prop="auditStatus" -->
      <el-form-item label="审核状态" prop="auditStatus">
        <el-radio-group v-model="form.auditStatus">
          <el-radio :label="0">待审核</el-radio>
          <el-radio :label="1">已通过</el-radio>
          <el-radio :label="2">已驳回</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 修改点：v-if="form.auditStatus === 2", v-model="form.rejectReason", prop="rejectReason" -->
      <el-form-item v-if="form.auditStatus === 2" label="驳回原因" prop="rejectReason">
        <el-input
          v-model="form.rejectReason"
          type="textarea"
          :rows="3"
          maxlength="255"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="排序权重" prop="sort">
        <el-input-number v-model="form.sort" :min="0" :max="9999" style="width: 180px" />
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
  addHelpChannel,
  getHelpChannelDetail,
  updateHelpChannel,
  type HelpChannelItem,
} from '@/api/resource/charity/helpChannel'

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

// 修改点：默认值对象中的键名改为小驼峰
const getDefaultForm = (): Partial<HelpChannelItem> => ({
  id: undefined,
  channelType: '',
  name: '',
  applyCondition: '',
  responseTime: '',
  contactPhone: '',
  contactUrl: '',
  helpLetterTemplate: '',
  crowdfundingTemplate: '',
  auditStatus: 0,
  rejectReason: '',
  sort: 0,
})

const form = reactive<Partial<HelpChannelItem>>(getDefaultForm())

// 修改点：校验规则中的 prop 改为小驼峰
const rules: FormRules = {
  channelType: [{ required: true, message: '请选择通道类型', trigger: 'change' }],
  name: [{ required: true, message: '请输入通道名称', trigger: 'blur' }],
  applyCondition: [{ required: true, message: '请输入求助条件', trigger: 'blur' }],
  responseTime: [{ required: true, message: '请输入响应时间', trigger: 'blur' }],
  auditStatus: [{ required: true, message: '请选择审核状态', trigger: 'change' }],
}

const resetForm = () => {
  Object.assign(form, getDefaultForm())
  formRef.value?.clearValidate()
}

const loadDetail = async () => {
  if (!props.id) return
  const res = await getHelpChannelDetail(props.id)
  Object.assign(form, res.data || {})
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
    // 注意：如果后端新增/更新接口严格依赖下划线，这里需要手动转换 key。
    // 但通常 RESTful API 会保持风格一致。如果后端报错，请检查后端是否期望 snake_case。
    // 目前假设后端接收小驼峰。
    if (props.id) {
      await updateHelpChannel(props.id, payload)
      ElMessage.success('更新成功')
    } else {
      await addHelpChannel(payload)
      ElMessage.success('新增成功')
    }
    emit('update:modelValue', false)
    emit('success')
  } finally {
    saving.value = false
  }
}
</script>