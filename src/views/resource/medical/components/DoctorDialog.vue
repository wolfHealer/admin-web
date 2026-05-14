<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑医生' : '新增医生'"
    width="760px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="110px"
    >
      <!-- 注意：如果后端提交需要 hospitalId，请确保此处 value 绑定正确 -->
      <el-form-item label="所属医院" prop="hospitalId">
        <el-select
          v-model="formData.hospitalId"
          placeholder="搜索并选择医院"
          style="width: 100%"
          filterable
          remote
          reserve-keyword
          :remote-method="handleHospitalSearch"
          :loading="hospitalLoading"
        >
          <el-option
            v-for="hospital in hospitalOptions"
            :key="hospital.id"
            :label="hospital.name"
            :value="hospital.id"
          />
        </el-select>
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="医生姓名" prop="name">
            <el-input v-model="formData.name" placeholder="请输入医生姓名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="职称" prop="title">
            <el-select v-model="formData.title" placeholder="请选择职称" style="width: 100%">
              <el-option v-for="item in titleOptions" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="所属科室" prop="department">
            <el-input v-model="formData.department" placeholder="请输入所属科室" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联系方式" prop="contact">
            <el-input v-model="formData.contact" placeholder="可填写电话/公众号/预约方式" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 修改：good_at -> goodAt -->
      <el-form-item label="擅长领域" prop="goodAt">
        <el-input
          v-model="formData.goodAt"
          type="textarea"
          :rows="3"
          placeholder="请输入擅长病种、擅长技术、诊疗方向"
        />
      </el-form-item>

      <!-- 修改：clinic_time -> clinicTime -->
      <el-form-item label="门诊时间" prop="clinicTime">
        <el-input
          v-model="formData.clinicTime"
          type="textarea"
          :rows="2"
          placeholder="如：周二上午 / 周四下午，具体以医院排班为准"
        />
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <!-- 修改：score -> score (保持不变，但确保类型) -->
          <el-form-item label="评分" prop="score">
            <el-input-number v-model="formData.score" :min="0" :max="5" :step="0.1" :precision="1" style="width: 100%" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <!-- 修改：comment_num -> commentNum -->
          <el-form-item label="评价数" prop="commentNum">
            <el-input-number v-model="formData.commentNum" :min="0" :step="1" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 修改：disease_ids -> diseaseIds -->
      <el-form-item label="关联疾病" prop="diseaseIds">
        <el-select
          v-model="formData.diseaseIds"
          placeholder="搜索并选择擅长疾病"
          style="width: 100%"
          filterable
          remote
          multiple
          collapse-tags
          collapse-tags-tooltip
          reserve-keyword
          :remote-method="handleDiseaseSearch"
          :loading="diseaseLoading"
        >
          <el-option
            v-for="disease in diseaseOptions"
            :key="disease.id"
            :label="disease.alias ? `${disease.name}（${disease.alias}）` : disease.name"
            :value="disease.id"
          />
        </el-select>
      </el-form-item>

      <!-- 修改：audit_status -> auditStatus -->
      <el-form-item label="审核状态" prop="auditStatus">
        <el-radio-group v-model="formData.auditStatus">
          <el-radio :label="0">待审核</el-radio>
          <el-radio :label="1">已通过</el-radio>
          <el-radio :label="2">已驳回</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 修改：reject_reason -> rejectReason -->
      <el-form-item v-if="formData.auditStatus === 2" label="驳回原因" prop="rejectReason">
        <el-input
          v-model="formData.rejectReason"
          type="textarea"
          :rows="2"
          maxlength="255"
          show-word-limit
          placeholder="请输入驳回原因"
        />
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
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getDiseaseOptions,
  getHospitalOptions,
  type DoctorDiseaseOption,
  type DoctorSubmitPayload,
  type SimpleOption
} from '@/api/resource/medical/doctor'

// 定义本地表单接口，覆盖 API 接口中的蛇形命名
interface LocalDoctorForm {
  id?: number
  hospitalId: number | null
  name: string
  title: string
  department: string
  goodAt: string
  clinicTime: string
  contact: string
  score: number
  commentNum: number
  auditStatus: number
  rejectReason: string
  diseaseIds: number[]
}

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
  submit: [data: LocalDoctorForm] // 使用本地接口
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formRef = ref<FormInstance>()
const loading = ref(false)
const hospitalLoading = ref(false)
const diseaseLoading = ref(false)
const hospitalOptions = ref<SimpleOption[]>([])
const diseaseOptions = ref<DoctorDiseaseOption[]>([])
const titleOptions = ['主任医师', '副主任医师', '主治医师', '住院医师', '教授', '副教授']

const defaultFormData: LocalDoctorForm = {
  id: undefined,
  hospitalId: null,
  name: '',
  title: '',
  department: '',
  goodAt: '',
  clinicTime: '',
  contact: '',
  score: 0,
  commentNum: 0,
  auditStatus: 0,
  rejectReason: '',
  diseaseIds: []
}

const formData = reactive<LocalDoctorForm>({ ...defaultFormData })

const rules: FormRules = {
  hospitalId: [{ required: true, message: '请选择所属医院', trigger: 'change' }],
  name: [{ required: true, message: '请输入医生姓名', trigger: 'blur' }],
  title: [{ required: true, message: '请选择职称', trigger: 'change' }],
  department: [{ required: true, message: '请输入所属科室', trigger: 'blur' }],
  goodAt: [{ required: true, message: '请输入擅长领域', trigger: 'blur' }],
  clinicTime: [{ required: true, message: '请输入门诊时间', trigger: 'blur' }],
  diseaseIds: [{ required: true, type: 'array', min: 1, message: '请至少选择一个关联疾病', trigger: 'change' }],
  rejectReason: [
    {
      validator: (_rule, value, callback) => {
        if (formData.auditStatus === 2 && !value) {
          callback(new Error('请输入驳回原因'))
          return
        }
        callback()
      },
      trigger: 'blur'
    }
  ]
}

const resetForm = () => {
  Object.assign(formData, { ...defaultFormData, id: undefined })
  hospitalOptions.value = []
  diseaseOptions.value = []
}

const ensureOptionsForEdit = async () => {
  // 1. 处理医院回显
  // 如果后端返回了 hospitalId，el-select 会自动选中。
  // 但为了在下拉框中显示医院名称，我们需要确保 hospitalOptions 里有这个选项
  if (props.data?.hospitalId && props.data?.hospital) {
     // 手动构造一个选项放入列表，防止用户不搜索时看不到已选医院的名称
     hospitalOptions.value = [{
       id: props.data.hospitalId,
       name: props.data.hospitalName
     }]
  }

  // 2. 处理疾病回显
  // 如果后端返回了 diseases 数组，直接用它来填充选项
  if (Array.isArray(props.data?.diseases) && props.data.diseases.length) {
    diseaseOptions.value = props.data.diseases.map((item: any) => ({
      id: item.id,
      name: item.name,
      alias: item.alias || ''
    }))
  }
}

const handleHospitalSearch = async (keyword: string) => {
  hospitalLoading.value = true
  try {
    const res = await getHospitalOptions({ keyword })
    hospitalOptions.value = res.data || []
  } finally {
    hospitalLoading.value = false
  }
}

const handleDiseaseSearch = async (keyword: string) => {
  if (!keyword) {
    // 如果关键词为空，可以选择清空选项，或者加载默认热门疾病
    // 这里选择清空，避免显示无关数据
    diseaseOptions.value = []
    return
  }

  diseaseLoading.value = true
  try {
    const res = await getDiseaseOptions({ keyword })
    console.log('Search Result:', res) // 【调试】检查返回值
    
    // 确保取到的是数组
    const remoteList = Array.isArray(res.data) ? res.data : []
    
    // 创建一个新的数组用于显示
    const displayList = [...remoteList]

    // 【关键优化】仅当处于编辑模式且已有选中项时，才需要合并逻辑
    // 目的是：如果用户之前选了某个病，现在搜索别的词，之前选的病如果不在这次搜索结果里，
    // 它应该仍然保留在下拉列表中（以便用户能看到已选标签对应的文字），或者至少保留在 v-model 中。
    // 但 el-select multiple + remote 的最佳实践是：下拉框只显示当前搜索结果。
    // 已选中的项会通过 tag 显示。
    // 因此，通常不需要合并 props.data.diseases 到下拉选项，除非为了回显名称。
    
    // 如果后端返回的选项中缺少已选中项的名称（例如只返回了 ID），才需要合并。
    // 鉴于你的后端返回了完整对象，我们可以简化逻辑：
    
    // 检查 formData.diseaseIds 中是否有 ID 不在当前 remoteList 中
    // 如果有，且我们想在下拉框中保留它们（防止用户困惑为什么选中的不见了），可以手动添加
    const selectedIds = formData.diseaseIds || []
    selectedIds.forEach(id => {
      if (!displayList.some(item => item.id === id)) {
        // 尝试从 props.data 中找名称，如果找不到，只能显示 ID 或占位符
        const existingDisease = (props.data?.diseases || []).find((d: any) => d.id === id)
        if (existingDisease) {
          displayList.push(existingDisease)
        } else {
          // 如果连名称都没有，至少放一个占位，否则 el-select 可能报错或显示空白
          // 最好还是让后端在列表接口就返回名称，或者在这里发起单个查询
          displayList.push({ id, name: `ID: ${id}`, alias: '' })
        }
      }
    })

    diseaseOptions.value = displayList
  } catch (error) {
    console.error('Search failed:', error)
    diseaseOptions.value = []
  } finally {
    diseaseLoading.value = false
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (!valid) return
    loading.value = true
    try {
      // 构造提交数据，确保字段名符合后端要求 (通常是 camelCase 或 snake_case，需根据 addDoctor/updateDoctor 实现确认)
      // 假设后端接收 camelCase
      emit('submit', {
        ...formData,
        score: Number(formData.score || 0),
        commentNum: Number(formData.commentNum || 0),
        rejectReason: formData.auditStatus === 2 ? formData.rejectReason || '' : ''
      })
      visible.value = false
    } finally {
      loading.value = false
    }
  })
}

const handleClose = () => {
  formRef.value?.resetFields()
  resetForm()
}

watch(
  () => props.data,
  async (newData) => {
    if (newData) {
      resetForm()
      // 映射后端 PascalCase 字段到本地表单
      Object.assign(formData, {
        id: newData.id,
        // 注意：如果后端详情没返回 hospitalId，这里可能是 null，导致医院无法选中
        // 建议后端详情接口返回 hospitalId
        hospitalId: newData.hospitalId || null, 
        name: newData.name || '',
        title: newData.title || '',
        department: newData.department || '',
        goodAt: newData.goodAt || '',
        clinicTime: newData.clinicTime || '',
        contact: newData.contact || '',
        score: Number(newData.score ?? 0),
        commentNum: Number(newData.commentNum ?? 0),
        auditStatus: Number(newData.auditStatus ?? 0),
        rejectReason: newData.rejectReason || '',
        diseaseIds: Array.isArray(newData.diseaseIds) ? newData.diseaseIds : []
      })
      await ensureOptionsForEdit()
    } else if (!props.isEdit) {
      resetForm()
    }
  },
  { immediate: true }
)
</script>