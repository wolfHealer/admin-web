<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑药品' : '新增药品'"
    width="760px"
    :close-on-click-modal="false"
    @open="handleOpen"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
      <el-form-item label="通用名" prop="genericName">
        <el-input v-model="formData.genericName" placeholder="请输入通用名" />
      </el-form-item>

      <el-form-item label="商品名">
        <el-input v-model="formData.brandName" placeholder="请输入商品名" />
      </el-form-item>

      <el-form-item label="适应症" prop="indication">
        <el-input v-model="formData.indication" type="textarea" :rows="3" placeholder="请输入适应症" />
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="剂型" prop="dosageForm">
            <el-input v-model="formData.dosageForm" placeholder="请输入剂型" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="规格" prop="spec">
            <el-input v-model="formData.spec" placeholder="请输入规格" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="参考价格" prop="refPrice">
            <!-- 注意：如果后端返回字符串，可能需要 Number() 转换，或者使用 el-input -->
            <el-input-number 
              v-model="formData.refPrice" 
              :min="0" 
              :precision="2" 
              controls-position="right" 
              style="width: 100%" 
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="药品类型" prop="drugType">
            <el-select v-model="formData.drugType" placeholder="请选择药品类型" style="width: 100%">
              <el-option label="原研进口" value="origin_import" />
              <el-option label="原研国产" value="origin_domestic" />
              <el-option label="仿制药" value="generic" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="是否医保">
            <el-switch v-model="formData.isInsurance" active-text="是" inactive-text="否" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否援助">
            <el-switch v-model="formData.hasRelief" active-text="是" inactive-text="否" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="是否上市">
            <el-switch v-model="formData.isLaunched" active-text="是" inactive-text="否" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="需要处方">
            <el-switch v-model="formData.needPrescription" active-text="是" inactive-text="否" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="原版说明书">
        <el-input v-model="formData.manualOriginal" placeholder="请输入原版说明书链接" />
      </el-form-item>

      <el-form-item label="通俗说明书">
        <el-input v-model="formData.manualPopular" placeholder="请输入通俗说明书链接" />
      </el-form-item>

      <el-form-item label="关联疾病">
        <el-select
          v-model="selectedDiseaseIds"
          multiple
          filterable
          remote
          reserve-keyword
          collapse-tags
          collapse-tags-tooltip
          style="width: 100%"
          placeholder="请输入疾病名称搜索"
          :remote-method="searchDiseaseOptions"
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

      <el-form-item label="审核状态" prop="auditStatus">
        <el-radio-group v-model="formData.auditStatus">
          <el-radio :label="0">待审核</el-radio>
          <el-radio :label="1">已通过</el-radio>
          <el-radio :label="2">已驳回</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="formData.auditStatus === 2" label="驳回原因" prop="rejectReason">
        <el-input v-model="formData.rejectReason" type="textarea" :rows="3" placeholder="请输入驳回原因" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Disease, DiseaseListParams } from '@/api/knowledge/knowledge'
import { getDiseaseList } from '@/api/knowledge/knowledge'
// 假设这里引入了正确的类型定义，如果类型定义也是 snake_case，建议在此处做局部类型覆盖或修改源类型
import type { RareDrugItem, RareDrugSubmitPayload } from '@/api/resource/drug/drug'

interface Props {
  modelValue: boolean
  editData?: any | null // 使用 any 暂时规避类型不匹配问题，实际应使用适配后的类型
}

const props = withDefaults(defineProps<Props>(), { 
  editData: null 
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: RareDrugSubmitPayload & { id?: number }]
}>()

const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const submitLoading = ref(false)
const diseaseLoading = ref(false)
const diseaseOptions = ref<Disease[]>([])
const selectedDiseaseIds = ref<number[]>([])
const isEdit = ref(false)

// 定义与后端交互一致的表单数据结构 (Camel Case)
const getEmptyFormData = () => ({
  id: 0,
  genericName: '',
  brandName: '',
  indication: '',
  dosageForm: '',
  spec: '',
  refPrice: 0,
  drugType: '',
  isInsurance: false,
  hasRelief: false,
  isLaunched: false,
  needPrescription: true,
  manualOriginal: '',
  manualPopular: '',
  auditStatus: 0,
  rejectReason: '',
})

const formData = reactive(getEmptyFormData())

const formRules: FormRules = {
  genericName: [{ required: true, message: '请输入通用名', trigger: 'blur' }],
  indication: [{ required: true, message: '请输入适应症', trigger: 'blur' }],
  dosageForm: [{ required: true, message: '请输入剂型', trigger: 'blur' }],
  spec: [{ required: true, message: '请输入规格', trigger: 'blur' }],
  refPrice: [{ required: true, message: '请输入参考价格', trigger: 'change' }],
  drugType: [{ required: true, message: '请选择药品类型', trigger: 'change' }],
}

const mergeDiseaseOptions = (items: Disease[] = []) => {
  const map = new Map<number, Disease>()
  // 保留已有选项并合并新选项，避免重复
  ;[...diseaseOptions.value, ...items].forEach((item) => {
    if (item?.id) map.set(item.id, item)
  })
  diseaseOptions.value = Array.from(map.values())
}

const searchDiseaseOptions = async (keyword = '') => {
  diseaseLoading.value = true
  try {
    const params: DiseaseListParams = {
      page: 1,
      pageSize: 20,
      keyword,
      status: 1,
    }
    const res = await getDiseaseList(params)
    const list = (res as any)?.data?.list || []
    mergeDiseaseOptions(list)
  } finally {
    diseaseLoading.value = false
  }
}

const resetForm = () => {
  Object.assign(formData, getEmptyFormData())
  selectedDiseaseIds.value = []
  diseaseOptions.value = []
  formRef.value?.clearValidate()
}

const handleOpen = async () => {
  // 先重置，防止上次数据残留
  resetForm()
  
  if (props.editData) {
    isEdit.value = true
    // 核心修改：直接将后端返回的驼峰数据赋值给 formData
    // 注意：如果后端返回的 refPrice 是字符串，这里可能需要 parseFloat
    Object.assign(formData, {
      ...getEmptyFormData(), // 先填充默认值，防止某些字段缺失导致 undefined
      ...props.editData
    })

    // 处理关联疾病的回显
    // 后端返回结构可能是 diseases: [{id:1, name:'...'}] 或者 disease_ids: [1, 2]
    if (props.editData.diseases && Array.isArray(props.editData.diseases)) {
      selectedDiseaseIds.value = props.editData.diseases.map((d: any) => d.id)
      // 将已有的疾病加入选项列表，以便显示名称
      mergeDiseaseOptions(props.editData.diseases)
    } else if (props.editData.disease_ids) {
      selectedDiseaseIds.value = props.editData.disease_ids
    }
  } else {
    isEdit.value = false
  }

  // 初始化疾病列表，确保下拉框有数据
  await searchDiseaseOptions('')
}

const handleClose = () => {
  dialogVisible.value = false
  // 关闭时重置，清理数据
  setTimeout(() => resetForm(), 300) 
}

const handleSubmit = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    // 构造提交数据，保持驼峰命名，通常后端接收也期望驼峰，或者由 API 层转换
    const payload = {
      ...(formData.id ? { id: formData.id } : {}),
      genericName: formData.genericName,
      brandName: formData.brandName,
      indication: formData.indication,
      dosageForm: formData.dosageForm,
      spec: formData.spec,
      refPrice: formData.refPrice,
      drugType: formData.drugType,
      isInsurance: formData.isInsurance,
      hasRelief: formData.hasRelief,
      isLaunched: formData.isLaunched,
      needPrescription: formData.needPrescription,
      manualOriginal: formData.manualOriginal,
      manualPopular: formData.manualPopular,
      auditStatus: formData.auditStatus,
      rejectReason: formData.rejectReason,
      diseaseIds: selectedDiseaseIds.value, // 提交疾病ID列表
    }
    
    emit('submit', payload as any)
  } finally {
    submitLoading.value = false
  }
}

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})
</script>