<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑康复机构' : '新增康复机构'"
    width="920px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <el-divider content-position="left">基础信息</el-divider>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="机构名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入康复机构名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="咨询电话" prop="contact_phone">
            <el-input v-model="formData.contactPhone" placeholder="请输入联系电话" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="所属地区" prop="regionCodes">
            <el-cascader
              v-model="formData.regionCodes"
              :options="regionOptions"
              :props="cascaderProps"
              clearable
              style="width: 100%"
              placeholder="请选择省 / 市 / 区"
              @change="handleRegionChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="官网/预约链接" prop="contactUrl">
            <el-input v-model="formData.contactUrl" placeholder="请输入官网或预约链接" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="机构地址" prop="address">
        <el-input v-model="formData.address" placeholder="请输入详细地址" />
      </el-form-item>

      <el-form-item label="资质证明" prop="qualification">
        <el-input v-model="formData.qualification" placeholder="请输入资质证明地址，可为空" />
      </el-form-item>

      <el-form-item label="康复项目范围" prop="rehabProjects">
        <el-input v-model="formData.rehabProjects" type="textarea" :rows="4" placeholder="请输入康复项目范围" />
      </el-form-item>

      <el-form-item label="收费标准" prop="feeStandard">
        <el-input v-model="formData.feeStandard" type="textarea" :rows="4" placeholder="请输入收费标准" />
      </el-form-item>

      <el-divider content-position="left">关联疾病</el-divider>
      <el-form-item label="关联疾病" prop="diseaseIds">
        <el-select
          v-model="formData.diseaseIds"
          multiple
          filterable
          remote
          reserve-keyword
          clearable
          style="width: 100%"
          placeholder="请输入疾病名称进行搜索后多选"
          :remote-method="handleDiseaseSearch"
          :loading="diseaseLoading"
        >
          <el-option
            v-for="item in diseaseOptions"
            :key="item.id"
            :label="item.alias ? `${item.name}（${item.alias}）` : item.name"
            :value="item.id"
          />
        </el-select>
        <div class="field-tip">保存时系统会自动覆盖 rehab_institution_disease_rel 关联表。</div>
      </el-form-item>

      <el-divider content-position="left">审核信息</el-divider>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="审核状态" prop="auditStatus">
            <el-select v-model="formData.auditStatus" style="width: 100%">
              <el-option label="待审核" :value="0" />
              <el-option label="已通过" :value="1" />
              <el-option label="已驳回" :value="2" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item v-if="formData.auditStatus === 2" label="驳回原因" prop="rejectReason">
        <el-input v-model="formData.rejectReason" type="textarea" :rows="2" placeholder="请输入驳回原因" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import {
  addRehabInstitution,
  getRegionTree,
  searchDiseaseOptions,
  updateRehabInstitution,
  type DiseaseOption,
  type RehabInstitutionItem,
  type RegionNode,
} from '@/api/resource/rehab/rehabInstitution'

interface Props {
  modelValue: boolean
  isEdit: boolean
  data?: RehabInstitutionItem | null
}

const props = withDefaults(defineProps<Props>(), {
  data: null,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: []
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const formRef = ref<FormInstance>()
const loading = ref(false)
const diseaseLoading = ref(false)
const regionOptions = ref<RegionNode[]>([])
const diseaseOptions = ref<DiseaseOption[]>([])

const cascaderProps = {
  value: 'code',
  label: 'name',
  children: 'children',
  emitPath: true,
  checkStrictly: false,
}

const defaultForm = () => ({
  id: undefined as number | undefined,
  name: '',
  provinceCode: '',
  cityCode: '',
  districtCode: '',
  provinceName: '',
  cityName: '',
  districtName: '',
  qualification: '',
  rehabProjects: '',
  feeStandard: '',
  contactPhone: '',
  contactUrl: '',
  address: '',
  auditStatus: 0 as 0 | 1 | 2,
  rejectReason: '',
  diseaseIds: [] as number[],
  regionCodes: [] as string[],
})

const formData = reactive(defaultForm())

const rules: FormRules = {
  name: [{ required: true, message: '请输入机构名称', trigger: 'blur' }],
  regionCodes: [{ required: true, type: 'array', min: 2, message: '请选择省市区', trigger: 'change' }],
  rehabProjects: [{ required: true, message: '请输入康复项目范围', trigger: 'blur' }],
  feeStandard: [{ required: true, message: '请输入收费标准', trigger: 'blur' }],
  address: [{ required: true, message: '请输入机构地址', trigger: 'blur' }],
  audit_status: [{ required: true, message: '请选择审核状态', trigger: 'change' }],
  disease_ids: [{ required: true, type: 'array', min: 1, message: '请至少关联一个疾病', trigger: 'change' }],
  reject_reason: [{
    validator: (_rule, value, callback) => {
      if (formData.auditStatus === 2 && !value) callback(new Error('请输入驳回原因'))
      else callback()
    },
    trigger: 'blur',
  }],
}

const resetForm = () => Object.assign(formData, defaultForm())

const fillSelectedNames = (codes: string[]) => {
  const [provinceCode, cityCode, districtCode] = codes
  const province = regionOptions.value.find(item => item.code === provinceCode)
  const city = province?.children?.find(item => item.code === cityCode)
  const district = city?.children?.find(item => item.code === districtCode)

  formData.provinceCode = province?.code || ''
  formData.cityCode = city?.code || ''
  formData.districtCode = district?.code || ''
  formData.provinceName = province?.name || ''
  formData.cityName = city?.name || ''
  formData.districtName = district?.name || ''
}

const handleRegionChange = (codes: string[]) => {
  if (!codes?.length) {
    formData.provinceCode = ''
    formData.cityCode = ''
    formData.districtCode = ''
    formData.provinceName = ''
    formData.cityName = ''
    formData.districtName = ''
    return
  }
  fillSelectedNames(codes)
}

const resolveRegionCodesFromNames = () => {
  if (!formData.provinceCode) {
    formData.regionCodes = []
    return
  }
  const province = regionOptions.value.find(item => item.code === formData.provinceCode)
  const city = province?.children?.find(item => item.code === formData.cityCode || item.name === formData.cityName)
  const district = city?.children?.find(item => item.code === formData.districtCode || item.name === formData.districtName)
  formData.regionCodes = [province?.code, city?.code, district?.code].filter(Boolean) as string[]
}

const handleDiseaseSearch = async (keyword: string) => {
  diseaseLoading.value = true
  try {
    const list = await searchDiseaseOptions(keyword)
    const selected = diseaseOptions.value.filter(item => formData.diseaseIds.includes(item.id))
    diseaseOptions.value = [...selected, ...list].reduce<DiseaseOption[]>((acc, cur) => {
      if (!acc.find(item => item.id === cur.id)) acc.push(cur)
      return acc
    }, [])
  } finally {
    diseaseLoading.value = false
  }
}

const loadRegions = async () => {
  const res = await getRegionTree()
  regionOptions.value = res.data || []
}

const loadSelectedDiseases = async () => {
  if (!formData.diseaseIds.length) return
  const list = await searchDiseaseOptions('')
  const selected = (props.data?.diseases || []).map(item => ({ id: item.id, name: item.name, alias: item.alias }))
  diseaseOptions.value = [...selected, ...list].reduce<DiseaseOption[]>((acc, cur) => {
    if (!acc.find(item => item.id === cur.id)) acc.push(cur)
    return acc
  }, [])
}

watch(
  () => props.data,
  async (val) => {
    resetForm()
    if (val) {
      Object.assign(formData, {
        ...defaultForm(),
        ...val,
        diseaseIds: val.diseaseIds || val.diseases?.map(item => item.id) || [],
      })
      if (!regionOptions.value.length) await loadRegions()
      resolveRegionCodesFromNames()
      await loadSelectedDiseases()
    }
    formRef.value?.clearValidate()
  },
  { immediate: true }
)

const handleClose = () => {
  resetForm()
  diseaseOptions.value = []
  formRef.value?.clearValidate()
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    const payload = {
      id: formData.id,
      name: formData.name,
      provinceCode: formData.provinceCode,
      cityCode: formData.cityCode,
      districtCode: formData.districtCode,
      provinceName: formData.provinceName,
      cityName: formData.cityName,
      districtName: formData.districtName,
      qualification: formData.qualification,
      rehabProjects: formData.rehabProjects,
      feeStandard: formData.feeStandard,
      contactPhone: formData.contactPhone,
      contactUrl: formData.contactUrl,
      address: formData.address,
      auditStatus: formData.auditStatus,
      rejectReason: formData.rejectReason,
      diseaseIds: formData.diseaseIds,
    }
    if (props.isEdit && formData.id) await updateRehabInstitution(formData.id, payload)
    else await addRehabInstitution(payload)
    emit('submit')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadRegions()
})
</script>

<style scoped>
.field-tip {
  color: #909399;
  font-size: 12px;
  margin-top: 6px;
}
</style>
