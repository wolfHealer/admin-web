<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑医院' : '新增医院'"
    width="840px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="110px">
      <el-divider content-position="left">基础信息</el-divider>
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="医院名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入医院名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="医院等级" prop="level">
            <el-select v-model="formData.level" placeholder="请选择医院等级" style="width: 100%">
              <!-- 遍历数字字符串数组，显示对应的中文标签 -->
              <el-option 
                v-for="item in levelOptions" 
                :key="item" 
                :label="getLevelText(item)" 
                :value="item" 
              />
            </el-select>
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
              placeholder="请选择省 / 市 / 区"
              clearable
              style="width: 100%"
              @change="handleRegionChange"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系电话" prop="phone">
            <el-input v-model="formData.phone" placeholder="请输入联系电话" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="详细地址" prop="address">
        <el-input v-model="formData.address" placeholder="请输入详细地址" />
      </el-form-item>

      <el-form-item label="官网地址" prop="hospitalUrl">
        <el-input v-model="formData.hospitalUrl" placeholder="请输入官网地址，可为空" />
      </el-form-item>

      <el-form-item label="诊疗范围" prop="treatScope">
        <el-input
          v-model="formData.treatScope"
          type="textarea"
          :rows="3"
          placeholder="请输入医院可覆盖的罕见病/专科方向"
        />
      </el-form-item>

      <el-form-item label="罕见病协作网" prop="isRareNetwork">
        <el-radio-group v-model="formData.isRareNetwork">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
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
          placeholder="搜索疾病名称后多选"
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
        <div class="field-tip">保存时系统会自动覆盖 hospital_disease_rel 关联表。</div>
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
import type { DiseaseOption, HospitalForm, HospitalItem } from '@/api/resource/medical/hospital'
import { searchDiseaseOptions } from '@/api/resource/medical/hospital'
import { getRegionTree } from '@/api/resource/medical/region'

interface RegionNode {
  code: string
  name: string
  children?: RegionNode[]
}

interface Props {
  modelValue: boolean
  isEdit: boolean
  data?: HospitalItem | null
}

const props = withDefaults(defineProps<Props>(), {
  data: null,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: HospitalForm]
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

// 【修改】定义为数字字符串数组，作为标准枚举值
const levelOptions = ['1', '2', '3', '4', '5', '6', '7']

// 【修改】映射关系常量
const levelLabelMap: Record<string, string> = {
  '1': '三甲',
  '2': '三乙',
  '3': '三丙',
  '4': '二甲',
  '5': '二乙',
  '6': '二丙',
  '7': '其他'
}

// 【新增】辅助函数：获取中文显示文本
const getLevelText = (level: string | number) => {
  return levelLabelMap[String(level)] || '-'
}


const cascaderProps = {
  value: 'code',
  label: 'name',
  children: 'children',
  checkStrictly: false,
  emitPath: true,
}

const defaultForm = (): HospitalForm & { regionCodes: string[] } => ({
  id: undefined,
  name: '',
  provinceCode: '',
  provinceName: '',
  cityCode: '',
  cityName: '',
  districtCode: '',
  districtName: '',
  level: '1', // 【修改 5】默认值设为字符串 '1'
  isRareNetwork: 0,
  treatScope: '',
  address: '',
  phone: '',
  hospitalUrl: '',
  auditStatus: 0,
  rejectReason: '',
  diseaseIds: [],
  regionCodes: [],
})

const formData = reactive(defaultForm())

const rules: FormRules = {
  name: [{ required: true, message: '请输入医院名称', trigger: 'blur' }],
  regionCodes: [{ required: true, type: 'array', min: 2, message: '请选择省市区', trigger: 'change' }],
  level: [{ required: true, message: '请选择医院等级', trigger: 'change' }],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入联系电话', trigger: 'blur' }],
  auditStatus: [{ required: true, message: '请选择审核状态', trigger: 'change' }],
  diseaseIds: [{ required: true, type: 'array', min: 1, message: '请至少关联一个疾病', trigger: 'change' }],
  rejectReason: [
    {
      validator: (_rule, value, callback) => {
        if (formData.auditStatus === 2 && !value) callback(new Error('请输入驳回原因'))
        else callback()
      },
      trigger: 'blur',
    },
  ],
}

const resetForm = () => {
  Object.assign(formData, defaultForm())
}

const setRegionFromCodes = (provinceCode: string, cityName: string, districtName?: string) => {
  if (!provinceCode) {
    formData.regionCodes = []
    return
  }
  const province = regionOptions.value.find((item) => item.code === provinceCode)
  if (!province) return
  const city = province.children?.find((item) => item.name === cityName || item.code === cityName)
  const district = city?.children?.find((item) => item.name === districtName || item.code === districtName)
  formData.regionCodes = [province.code]
  if (city) formData.regionCodes.push(city.code)
  if (district) formData.regionCodes.push(district.code)
}

const fillSelectedNames = (codes: string[]) => {
  const [provinceCode, cityCode, districtCode] = codes
  const province = regionOptions.value.find((item) => item.code === provinceCode)
  const city = province?.children?.find((item) => item.code === cityCode)
  const district = city?.children?.find((item) => item.code === districtCode)

  formData.provinceCode = province?.code || ''
  formData.provinceName = province?.name || ''
  formData.cityCode = city?.code || ''
  formData.cityName = city?.name || ''
  formData.districtCode = district?.code || ''  
  formData.districtName = district?.name || ''
}

const handleRegionChange = (codes: string[]) => {
  if (!codes?.length) {
    formData.provinceCode = ''
    formData.provinceName = ''
    formData.cityCode = ''
    formData.cityName = ''
    formData.districtCode = ''
    formData.districtName = ''
    return
  }
  fillSelectedNames(codes)
}

const handleDiseaseSearch = async (keyword: string) => {
  diseaseLoading.value = true
  try {
    const list = await searchDiseaseOptions(keyword)
    // 关键逻辑：合并已选中的疾病和新搜索到的疾病，避免已选疾病因不在搜索结果中而消失
    const selectedIds = formData.diseaseIds
    const selectedItems = diseaseOptions.value.filter(item => selectedIds.includes(item.id))
    
    // 去重合并
    const map = new Map<number, DiseaseOption>()
    selectedItems.forEach(item => map.set(item.id, item))
    list.forEach(item => map.set(item.id, item))
    
    diseaseOptions.value = Array.from(map.values())
  } finally {
    diseaseLoading.value = false
  }
}
const loadRegionData = async () => {
  try {
    const res: any = await getRegionTree()
    regionOptions.value = res.data || []
  } catch {
    regionOptions.value = []
  }
}



// 【修改重点】优化疾病数据初始化逻辑
const initDiseaseData = async (diseases: DiseaseOption[] = []) => {
  // 1. 先将传入的疾病对象放入选项列表，确保 el-select 能渲染出标签
  const map = new Map<number, DiseaseOption>()
  diseases.forEach(item => map.set(item.id, item))
  
  // 2. 如果之前已经有选项（比如搜索过的），也保留
  diseaseOptions.value.forEach(item => map.set(item.id, item))
  
  diseaseOptions.value = Array.from(map.values())

  // 3. 提取 ID 赋值给表单
  if (diseases.length > 0) {
    formData.diseaseIds = diseases.map(item => item.id)
  } else {
    // 如果是新增模式，且没有预设疾病，可以主动加载一些默认数据以便用户选择
    if (!props.isEdit && formData.diseaseIds.length === 0) {
       await handleDiseaseSearch('')
    }
  }
}

watch(
  () => props.data,
  async (value) => {
    resetForm()
    if (!value) {
      await handleDiseaseSearch('')
      return
    }

    Object.assign(formData, {
      id: value.id,
      name: value.name,
      provinceCode: value.provinceCode,
      provinceName: value.provinceName,
      cityCode: value.cityCode,
      cityName: value.cityName || '',
      districtCode: value.districtCode,
      districtName: value.districtName || '',
      // 【修改 6】确保 level 转为字符串，以匹配 el-select 的 value
      level: String(value.level || '1'), 
      isRareNetwork: value.isRareNetwork,
      treatScope: value.treatScope || '',
      address: value.address || '',
      phone: value.phone || '',
      hospitalUrl: value.hospitalUrl || '',
      auditStatus: value.auditStatus,
      rejectReason: value.rejectReason || '',
      diseaseIds: value.diseaseIds || value.diseases?.map((item) => item.id) || [],
    })

    if (regionOptions.value.length) {
      setRegionFromCodes(value.provinceCode, value.cityCode || '', value.districtCode || '')
    }
    // 【关键】处理关联疾病：传入完整的疾病对象列表
    // 接口返回的 value.diseases 结构应匹配 DiseaseOption { id, name, alias }
    await initDiseaseData(value.diseases || [])
  },
  { immediate: true }
)

watch(
  () => regionOptions.value,
  () => {
    if (props.data?.provinceCode && props.data?.cityCode && props.data?.districtCode) {
      setRegionFromCodes(props.data.provinceCode, props.data.cityName, props.data.districtName)
    }
  }
)

const handleSubmit = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  loading.value = true
  try {
    emit('submit', {
      id: formData.id,
      name: formData.name,
      provinceCode: formData.provinceCode,
      provinceName: formData.provinceName,
      cityCode: formData.cityCode,
      cityName: formData.cityName || '',
      districtCode: formData.districtCode,
      districtName: formData.districtName || '',
      level: formData.level,
      isRareNetwork: formData.isRareNetwork,
      treatScope: formData.treatScope,
      address: formData.address,
      phone: formData.phone,
      hospitalUrl: formData.hospitalUrl,
      auditStatus: formData.auditStatus,
      rejectReason: formData.rejectReason,
      diseaseIds: [...formData.diseaseIds],
    })
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  formRef.value?.resetFields()
  resetForm()
}

onMounted(async () => {
  await loadRegionData()
  await handleDiseaseSearch('')
})
</script>

<style scoped lang="scss">
.field-tip {
  margin-top: 6px;
  color: #909399;
  font-size: 12px;
  line-height: 1.5;
}
</style>
