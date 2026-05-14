<template>
  <el-dialog
    v-model="visible"
    :title="dialogTitle"
    width="800px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <el-form-item label="机构名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入机构名称" />
      </el-form-item>

      <!-- 【核心修改】使用 el-cascader 替代原有的地区选择逻辑 -->
      <el-form-item label="所在地区" prop="regionCodes">
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

      <el-form-item label="机构地址" prop="address">
        <el-input v-model="formData.address" placeholder="请输入详细地址" />
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="联系电话" prop="contactPhone">
            <el-input v-model="formData.contactPhone" placeholder="请输入联系电话" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="官网/预约入口" prop="contactUrl">
            <el-input v-model="formData.contactUrl" placeholder="请输入链接" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="是否免费" prop="isFree">
            <el-select v-model="formData.isFree" style="width: 100%">
              <el-option label="是" :value="true" />
              <el-option label="否" :value="false" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="咨询方式" prop="consultWay">
            <el-select v-model="formData.consultWay" style="width: 100%">
              <el-option label="线上" value="online" />
              <el-option label="线下" value="offline" />
              <el-option label="两者兼有" value="both" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="机构简介" prop="contentIntro">
        <el-input v-model="formData.contentIntro" type="textarea" :rows="4" placeholder="请输入机构简介" />
      </el-form-item>

      <el-form-item label="关联疾病" prop="diseaseIds">
        <el-select
          v-model="formData.diseaseIds"
          multiple
          filterable
          remote
          reserve-keyword
          clearable
          style="width: 100%"
          placeholder="请输入疾病名称搜索"
          :remote-method="searchDiseases"
          :loading="diseaseLoading"
        >
          <el-option
            v-for="item in diseaseOptions"
            :key="item.id"
            :label="item.alias ? `${item.name}（${item.alias}）` : item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>

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
      <el-button type="primary" :loading="loading" @click="submit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { 
  addPsychOrg, 
  getPsychOrgDetail, 
  getRegionTree, 
  searchDiseaseOptions, 
  updatePsychOrg,
  type RegionTreeNode,
  type DiseaseOption
} from '@/api/resource/rehab/psychologicalOrg'

const emit = defineEmits(['success'])
const visible = ref(false)
const loading = ref(false)
const dialogTitle = ref('新增机构')
const mode = ref<'create' | 'update'>('create')
const currentId = ref<number>()
const formRef = ref<FormInstance>()

// 地区与疾病数据
const regionOptions = ref<RegionTreeNode[]>([])
const diseaseOptions = ref<DiseaseOption[]>([])
const diseaseLoading = ref(false)

// 级联选择器配置
const cascaderProps = {
  value: 'code',
  label: 'name',
  children: 'children',
  emitPath: true, // 关键：返回完整路径数组 [provCode, cityCode, distCode]
  checkStrictly: false,
}

// 【核心修改】表单结构仿照 RehabInstitutionDialog
const defaultForm = () => ({
  id: undefined as number | undefined,
  name: '',
  // 独立字段，用于提交给后端
  provinceCode: '',
  cityCode: '',
  districtCode: '',
  provinceName: '',
  cityName: '',
  districtName: '',
  address: '',
  contactPhone: '',
  contactUrl: '',
  isFree: false,
  consultWay: 'both',
  contentIntro: '',
  auditStatus: 0 as 0 | 1 | 2,
  rejectReason: '',
  diseaseIds: [] as number[],
  // 级联绑定字段
  regionCodes: [] as string[],
})

const formData = reactive(defaultForm())

// 【核心修改】校验规则更新
const rules: FormRules = {
  name: [{ required: true, message: '请输入机构名称', trigger: 'blur' }],
  regionCodes: [{ required: true, type: 'array', min: 2, message: '请选择省市区', trigger: 'change' }],
  address: [{ required: true, message: '请输入机构地址', trigger: 'blur' }],
  contentIntro: [{ required: true, message: '请输入机构简介', trigger: 'blur' }],
  diseaseIds: [{ required: true, type: 'array', min: 1, message: '请至少关联一个疾病', trigger: 'change' }],
  auditStatus: [{ required: true, message: '请选择审核状态', trigger: 'change' }],
  rejectReason: [{
    validator: (_rule, value, callback) => {
      if (formData.auditStatus === 2 && !value) callback(new Error('请输入驳回原因'))
      else callback()
    },
    trigger: 'blur',
  }],
}

const resetForm = () => Object.assign(formData, defaultForm())

// 加载地区树
const loadRegions = async () => {
  const res = await getRegionTree()
  regionOptions.value = res.data || []
}

// 【核心修改】处理级联选择变化，同步更新独立字段
const handleRegionChange = (codes: string[]) => {
  if (!codes || codes.length === 0) {
    formData.provinceCode = ''
    formData.cityCode = ''
    formData.districtCode = ''
    formData.provinceName = ''
    formData.cityName = ''
    formData.districtName = ''
    return
  }

  const [pCode, cCode, dCode] = codes
  
  // 查找省份
  const province = regionOptions.value.find(item => item.code === pCode)
  formData.provinceCode = province?.code || ''
  formData.provinceName = province?.name || ''

  // 查找城市
  const city = province?.children?.find(item => item.code === cCode)
  formData.cityCode = city?.code || ''
  formData.cityName = city?.name || ''

  // 查找区县
  const district = city?.children?.find(item => item.code === dCode)
  formData.districtCode = district?.code || ''
  formData.districtName = district?.name || ''
}

// 【核心修改】根据独立字段反推级联数组（用于编辑回填）
const resolveRegionCodesFromNames = () => {
  if (!formData.provinceCode) {
    formData.regionCodes = []
    return
  }

  const province = regionOptions.value.find(item => item.code === formData.provinceCode)
  if (!province) {
    // 如果找不到省份，可能是数据错误或地区树未加载，暂时只保留省份代码
    formData.regionCodes = [formData.provinceCode]
    return
  }

  const city = province.children?.find(item => item.code === formData.cityCode)
  if (!city) {
    formData.regionCodes = [formData.provinceCode]
    return
  }

  const district = city.children?.find(item => item.code === formData.districtCode)
  
  // 构建完整的 code 数组
  const codes = [province.code, city.code]
  if (district) {
    codes.push(district.code)
  }
  
  formData.regionCodes = codes
}

// 搜索疾病
const searchDiseases = async (keyword: string) => {
  diseaseLoading.value = true
  try {
    const res = await searchDiseaseOptions(keyword)
    const list = (res.data as any)?.list || res.data || []
    
    // 保留已选中的疾病，防止搜索后消失
    const selected = diseaseOptions.value.filter(item => formData.diseaseIds.includes(item.id))
    const newList = [...selected, ...list].reduce<DiseaseOption[]>((acc, cur) => {
      if (!acc.find(i => i.id === cur.id)) acc.push(cur)
      return acc
    }, [])
    
    diseaseOptions.value = newList
  } finally {
    diseaseLoading.value = false
  }
}

// 打开弹窗
const open = async (type: 'create' | 'update', id?: number) => {
  visible.value = true
  mode.value = type
  dialogTitle.value = type === 'create' ? '新增机构' : '编辑机构'
  
  // 1. 确保地区数据已加载 (关键修改：先加载数据，再重置和回填)
  if (regionOptions.value.length === 0) {
    await loadRegions()
  }
  
  // 2. 初始化疾病列表
  await searchDiseases('')

  // 3. 重置表单
  resetForm()

  if (type === 'update' && id) {
    currentId.value = id
    try {
      const res = await getPsychOrgDetail(id)
      const data = res.data
      
      if (!data) {
        ElMessage.error('获取详情失败')
        return
      }

      // 4. 填充基础数据
      // 注意：这里直接 assign 会覆盖 regionCodes，所以需要在 assign 后重新计算 regionCodes
      Object.assign(formData, {
        ...defaultForm(), // 先重置默认值，防止旧数据残留
        ...data,
        // 特殊处理疾病 ID
        diseaseIds: data.diseaseIds || data.diseases?.map((d: any) => d.id) || [],
      })

      // 5. 特殊处理地区回填 (必须在 regionOptions 加载完成后执行)
      resolveRegionCodesFromNames()
      
      // 6. 如果后端返回了 diseases 对象，补充到下拉选项中以便显示名称
      if (data?.diseases?.length) {
         // 合并到现有 options 中
         data.diseases.forEach((d: DiseaseOption) => {
           if (!diseaseOptions.value.find(i => i.id === d.id)) {
             diseaseOptions.value.push(d)
           }
         })
      }
    } catch (error) {
      console.error(error)
      ElMessage.error('获取详情异常')
    }
  }
  
  // 清除校验状态
  setTimeout(() => {
    formRef.value?.clearValidate()
  }, 0)
}

// 提交
const submit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()
  
  loading.value = true
  try {
    // 构造提交 payload，只包含后端需要的字段
    const payload = {
      id: formData.id,
      name: formData.name,
      provinceCode: formData.provinceCode,
      cityCode: formData.cityCode,
      districtCode: formData.districtCode,
      provinceName: formData.provinceName,
      cityName: formData.cityName,
      districtName: formData.districtName,
      address: formData.address,
      contactPhone: formData.contactPhone,
      contactUrl: formData.contactUrl,
      isFree: formData.isFree,
      consultWay: formData.consultWay,
      contentIntro: formData.contentIntro,
      auditStatus: formData.auditStatus,
      rejectReason: formData.rejectReason,
      diseaseIds: formData.diseaseIds,
    }

    if (mode.value === 'create') {
      await addPsychOrg(payload)
    } else {
      await updatePsychOrg(currentId.value!, payload)
    }
    
    ElMessage.success('保存成功')
    visible.value = false
    emit('success')
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  visible.value = false
  resetForm()
  diseaseOptions.value = []
}

// 监听弹窗关闭，重置数据
watch(visible, (val) => {
  if (!val) {
    handleClose()
  }
})

defineExpose({ open })
</script>