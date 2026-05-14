<template>
  <el-dialog
    :model-value="modelValue"
    :title="form.id ? '编辑救助案例' : '新增救助案例'"
    width="920px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <!-- 修改：disease_id -> diseaseId -->
      <el-form-item label="关联疾病" prop="diseaseId">
        <el-select
          v-model="form.diseaseId"
          filterable
          remote
          reserve-keyword
          placeholder="请输入疾病名称搜索"
          :remote-method="handleDiseaseSearch"
          :loading="diseaseLoading"
          style="width: 100%"
        >
          <el-option
            v-for="item in diseaseOptions"
            :key="item.id"
            :label="item.alias ? `${item.name}（${item.alias}）` : item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <!-- 修改：project_id -> projectId -->
      <el-form-item label="关联项目" prop="projectId">
        <el-select
          v-model="form.projectId"
          filterable
          remote
          reserve-keyword
          placeholder="请输入救助项目名称搜索"
          :remote-method="handleProjectSearch"
          :loading="projectLoading"
          style="width: 100%"
        >
          <el-option
            v-for="item in projectOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

      <!-- 修改：case_title -> caseTitle -->
      <el-form-item label="案例标题" prop="caseTitle">
        <el-input v-model="form.caseTitle" maxlength="500" show-word-limit />
      </el-form-item>

      <!-- 修改：patient_desc -> patientDesc -->
      <el-form-item label="患者简介" prop="patientDesc">
        <el-input v-model="form.patientDesc" type="textarea" :rows="4" />
      </el-form-item>

      <!-- 修改：apply_cycle -> applyCycle -->
      <el-form-item label="申请周期" prop="applyCycle">
        <el-input v-model="form.applyCycle" placeholder="如：2周 / 1个月" />
      </el-form-item>

      <!-- 修改：actual_relief -> actualRelief -->
      <el-form-item label="实际救助" prop="actualRelief">
        <el-input v-model="form.actualRelief" placeholder="如：2万元 / 药品援助6个月" />
      </el-form-item>

      <!-- 修改：experience (保持不变，但确保TS定义一致) -->
      <el-form-item label="经验分享" prop="experience">
        <el-input v-model="form.experience" type="textarea" :rows="4" />
      </el-form-item>

      <!-- 修改：pitfall_guide -> pitfallGuide -->
      <el-form-item label="避坑要点" prop="pitfallGuide">
        <el-input v-model="form.pitfallGuide" type="textarea" :rows="4" />
      </el-form-item>

      <!-- 修改：case_pdf -> casePdf -->
      <el-form-item label="案例 PDF">
        <el-input v-model="form.casePdf" />
      </el-form-item>

      <!-- 修改：material_template -> materialTemplate -->
      <el-form-item label="材料模板">
        <el-input v-model="form.materialTemplate" />
      </el-form-item>

      <!-- 修改：audit_status -> auditStatus -->
      <el-form-item label="审核状态" prop="auditStatus">
        <el-radio-group v-model="form.auditStatus">
          <el-radio :label="0">待审核</el-radio>
          <el-radio :label="1">已通过</el-radio>
          <el-radio :label="2">已驳回</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 修改：reject_reason -> rejectReason -->
      <el-form-item v-if="form.auditStatus === 2" label="驳回原因" prop="rejectReason">
        <el-input v-model="form.rejectReason" type="textarea" :rows="3" maxlength="255" show-word-limit />
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
  addReliefCase,
  getReliefCaseDetail,
  searchDiseaseOptions,
  searchReliefProjectOptions,
  updateReliefCase,
  type DiseaseOption,
  type ReliefCaseItem,
  type ReliefProjectOption,
} from '@/api/resource/charity/case'

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

const diseaseLoading = ref(false)
const projectLoading = ref(false)
const diseaseOptions = ref<DiseaseOption[]>([])
const projectOptions = ref<ReliefProjectOption[]>([])

// 修改：默认值使用 camelCase
const getDefaultForm = (): Partial<ReliefCaseItem> => ({
  id: undefined,
  diseaseId: undefined,
  projectId: undefined,
  caseTitle: '',
  patientDesc: '',
  applyCycle: '',
  actualRelief: '',
  experience: '',
  pitfallGuide: '',
  casePdf: '',
  materialTemplate: '',
  auditStatus: 0,
  rejectReason: '',
})

const form = reactive<Partial<ReliefCaseItem>>(getDefaultForm())

// 修改：校验规则 prop 使用 camelCase
const rules: FormRules = {
  diseaseId: [{ required: true, message: '请选择疾病', trigger: 'change' }],
  projectId: [{ required: true, message: '请选择救助项目', trigger: 'change' }],
  caseTitle: [{ required: true, message: '请输入案例标题', trigger: 'blur' }],
  patientDesc: [{ required: true, message: '请输入患者简介', trigger: 'blur' }],
  applyCycle: [{ required: true, message: '请输入申请周期', trigger: 'blur' }],
  actualRelief: [{ required: true, message: '请输入实际救助', trigger: 'blur' }],
  experience: [{ required: true, message: '请输入经验分享', trigger: 'blur' }],
  pitfallGuide: [{ required: true, message: '请输入避坑要点', trigger: 'blur' }],
}

const resetForm = () => {
  Object.assign(form, getDefaultForm())
  diseaseOptions.value = []
  projectOptions.value = []
  formRef.value?.clearValidate()
}

const normalizeList = <T>(data: { list?: T[] } | T[] | undefined): T[] => {
  if (Array.isArray(data)) return data
  return data?.list || []
}

const handleDiseaseSearch = async (keyword: string) => {
  diseaseLoading.value = true
  try {
    const res = await searchDiseaseOptions(keyword)
    diseaseOptions.value = normalizeList<DiseaseOption>(res.data)
  } finally {
    diseaseLoading.value = false
  }
}

const handleProjectSearch = async (keyword: string) => {
  projectLoading.value = true
  try {
    const res = await searchReliefProjectOptions(keyword)
    projectOptions.value = normalizeList<ReliefProjectOption>(res.data)
  } finally {
    projectLoading.value = false
  }
}

const loadDetail = async () => {
  if (!props.id) return
  const res = await getReliefCaseDetail(props.id)
  // 直接赋值，因为后端返回已经是 camelCase，与 form 结构一致
  Object.assign(form, res.data || {})

  // 初始化下拉框选项，确保编辑时能显示名称
  if (res.data?.diseaseId && res.data?.diseaseName) {
    diseaseOptions.value = [
      { id: res.data.diseaseId, name: res.data.diseaseName, alias: '' },
    ]
  }

  if (res.data?.projectId && res.data?.projectName) {
    projectOptions.value = [
      { id: res.data.projectId, name: res.data.projectName },
    ]
  }
}

watch(
  () => props.modelValue,
  async (val) => {
    if (!val) return
    resetForm()
    // 预加载一些选项，防止编辑时下拉框为空
    await handleDiseaseSearch('')
    await handleProjectSearch('')
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
    // payload 已经是 camelCase，直接发送即可
    const payload = { ...form }
    if (props.id) {
      await updateReliefCase(props.id, payload)
      ElMessage.success('更新成功')
    } else {
      await addReliefCase(payload)
      ElMessage.success('新增成功')
    }
    emit('update:modelValue', false)
    emit('success')
  } finally {
    saving.value = false
  }
}
</script>