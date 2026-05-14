<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑购药渠道' : '新增购药渠道'"
    width="860px"
    :close-on-click-modal="false"
    @open="handleOpen"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="关联药品" prop="drug_id">
            <el-select
              v-model="formData.drugId"
              filterable remote reserve-keyword
              :remote-method="loadDrugOptions"
              :loading="drugLoading"
              placeholder="请输入药品通用名搜索"
              style="width: 100%"
            >
              <el-option v-for="item in drugOptions" :key="item.id" :label="formatDrugLabel(item)" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="渠道类型" prop="channel_type">
            <el-select v-model="formData.channelType" placeholder="请选择渠道类型" style="width: 100%">
              <el-option label="医院药房" value="hospital_pharmacy" />
              <el-option label="连锁药店" value="chain_pharmacy" />
              <el-option label="互联网医院" value="internet_hospital" />
              <el-option label="DTP药房" value="dtp_pharmacy" />
              <el-option label="医药电商" value="ecommerce" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="渠道名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入渠道名称" />
      </el-form-item>

      <el-form-item label="资质说明">
        <el-input v-model="formData.qualification" type="textarea" :rows="2" placeholder="如互联网药品信息服务资格证、经营许可证等" />
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="省份">
            <el-select v-model="formData.provinceCode" placeholder="请选择省份" clearable style="width: 100%" @change="handleProvinceChange">
              <el-option v-for="item in provinceOptions" :key="item.code" :label="item.name" :value="item.code" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="城市">
            <el-select v-model="formData.cityCode" placeholder="请选择城市" clearable style="width: 100%" @change="handleCityChange">
              <el-option v-for="item in cityOptions" :key="item.code" :label="item.name" :value="item.code" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="区县">
            <el-select v-model="formData.districtCode" placeholder="请选择区县" clearable style="width: 100%">
              <el-option v-for="item in districtOptions" :key="item.code" :label="item.name" :value="item.code" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="详细地址">
        <el-input v-model="formData.address" type="textarea" :rows="2" placeholder="请输入详细地址" />
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="联系电话">
            <el-input v-model="formData.contactPhone" placeholder="请输入联系电话" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系网址">
            <el-input v-model="formData.contactUrl" placeholder="请输入联系网址" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="配送范围" prop="delivery_scope">
        <el-input v-model="formData.deliveryScope" type="textarea" :rows="2" placeholder="请输入配送范围，例如全国/限省内/限本市等" />
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="配送周期" prop="delivery_cycle">
            <el-input v-model="formData.deliveryCycle" placeholder="例如：1-3个工作日" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="医保结算">
            <el-switch v-model="insuranceSettleSwitch" active-text="支持" inactive-text="不支持" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="审核状态" prop="audit_status">
            <el-select v-model="formData.auditStatus" style="width: 100%">
              <el-option label="待审核" :value="0" />
              <el-option label="已通过" :value="1" />
              <el-option label="已驳回" :value="2" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="驳回原因" v-if="formData.auditStatus === 2">
            <el-input v-model="formData.rejectReason" placeholder="请输入驳回原因" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getPurchaseChannelDetail,
  getRareDrugOptions,
  getRegionTree,
  type DrugChannelItem,
  type DrugChannelSubmitPayload,
  type RareDrugOption,
  type RegionNode
} from '@/api/resource/drug/channel'

interface Props {
  modelValue: boolean
  editData?: DrugChannelItem | null
}

const props = withDefaults(defineProps<Props>(), { editData: null })
const emit = defineEmits<{ 'update:modelValue': [boolean], submit: [DrugChannelSubmitPayload & { id?: number }] }>()

const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const submitLoading = ref(false)
const isEdit = ref(false)
const drugLoading = ref(false)
const regionTree = ref<RegionNode[]>([])
const drugOptions = ref<RareDrugOption[]>([])

const getEmptyFormData = (): DrugChannelItem => ({
  id: 0,
  drugId: 0,
  channelType: '',
  name: '',
  qualification: '',
  provinceCode: '',
  cityCode: '',
  districtCode: '',
  isLaunched: 0,
  address: '',
  contactPhone: '',
  contactUrl: '',
  deliveryScope: '',
  deliveryCycle: '',
  isInsuranceSettle: 0,
  auditStatus: 0,
  rejectReason: ''
})

const formData = reactive<DrugChannelItem>(getEmptyFormData())

const rules: FormRules = {
  drug_id: [{ required: true, message: '请选择关联药品', trigger: 'change' }],
  channel_type: [{ required: true, message: '请选择渠道类型', trigger: 'change' }],
  name: [{ required: true, message: '请输入渠道名称', trigger: 'blur' }],
  delivery_scope: [{ required: true, message: '请输入配送范围', trigger: 'blur' }],
  delivery_cycle: [{ required: true, message: '请输入配送周期', trigger: 'blur' }],
  audit_status: [{ required: true, message: '请选择审核状态', trigger: 'change' }],
}

const insuranceSettleSwitch = computed({
  get: () => formData.isInsuranceSettle === 1,
  set: (val: boolean) => { formData.isInsuranceSettle = val ? 1 : 0 }
})

const provinceOptions = computed(() => regionTree.value || [])
const cityOptions = computed(() => provinceOptions.value.find(item => item.code === formData.provinceCode)?.children || [])
const districtOptions = computed(() => cityOptions.value.find(item => item.code === formData.cityCode)?.children || [])

const formatDrugLabel = (item: RareDrugOption) => item.brandName ? `${item.genericName}（${item.brandName}）` : item.genericName

const loadRegionTree = async () => {
  if (regionTree.value.length) return
  const res = await getRegionTree()
  regionTree.value = res.data || []
}

const loadDrugOptions = async (keyword = '') => {
  drugLoading.value = true
  try {
    const res = await getRareDrugOptions(keyword)
    drugOptions.value = res.data?.list || []
  } finally {
    drugLoading.value = false
  }
}

const handleProvinceChange = () => {
  formData.cityCode = ''
  formData.districtCode = ''
}

const handleCityChange = () => {
  formData.districtCode = ''
}

const resetForm = () => {
  Object.assign(formData, getEmptyFormData())
  formRef.value?.clearValidate()
  formRef.value?.resetFields()
}


const handleOpen = async () => {
  await Promise.all([loadRegionTree(), loadDrugOptions('')])
  if (props.editData) {
    isEdit.value = true
    const res = await getPurchaseChannelDetail(props.editData.id)
    const data = res.data || {}
    
    // 1. 基础数据赋值
    Object.assign(formData, getEmptyFormData(), data)
    
    // 2. 【关键修改】处理药品回显
    // 接口返回的是 drugs 数组，而表单绑定的是单个 drugId
    if (data.drugs && Array.isArray(data.drugs) && data.drugs.length > 0) {
      // 取第一个药品作为主药品进行回显
      const firstDrug = data.drugs[0]
      formData.drugId = firstDrug.id
      
      // 确保该药品在下拉选项中存在，如果不存在则手动添加
      if (!drugOptions.value.find(item => item.id === firstDrug.id)) {
        drugOptions.value.unshift({ 
          id: firstDrug.id, 
          genericName: firstDrug.genericName || '', 
          brandName: firstDrug.brandName || '' 
        })
      }
    } else {
      // 如果没有关联药品，重置为 undefined 或 0
      formData.drugId = undefined
    }

  } else {
    isEdit.value = false
    resetForm()
  }
}




watch(() => props.modelValue, val => { dialogVisible.value = val })
watch(dialogVisible, val => {
  emit('update:modelValue', val)
  if (!val) resetForm()
})

const handleClose = () => {
  dialogVisible.value = false
}

const buildSubmitPayload = (): DrugChannelSubmitPayload & { id?: number } => ({
  id: formData.id || undefined,
  drugId: Number(formData.drugId),
  channelType: formData.channelType,
  name: formData.name,
  qualification: formData.qualification || '',
  provinceCode: formData.provinceCode || '',
  cityCode: formData.cityCode || '',
  districtCode: formData.districtCode || '',
  address: formData.address || '',
  contactPhone: formData.contactPhone || '',
  contactUrl: formData.contactUrl || '',
  deliveryScope: formData.deliveryScope,
  deliveryCycle: formData.deliveryCycle,
  isInsuranceSettle: formData.isInsuranceSettle || 0,
  auditStatus: formData.auditStatus,
  rejectReason: formData.auditStatus === 2 ? (formData.rejectReason || '') : ''
})

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async valid => {
    if (!valid) return
    submitLoading.value = true
    try {
      emit('submit', buildSubmitPayload())
    } finally {
      submitLoading.value = false
    }
  })
}
</script>
