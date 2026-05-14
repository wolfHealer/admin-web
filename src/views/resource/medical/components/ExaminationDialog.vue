<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑检查手册' : '新增检查手册'"
    width="820px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="110px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="检查类型" prop="examType">
            <el-select v-model="formData.examType" placeholder="请选择检查类型" style="width: 100%">
              <!-- 修改 value 为英文枚举 -->
              <el-option label="实验室检查" value="lab" />
              <el-option label="代谢筛查" value="metabolic" />
              <el-option label="影像学检查" value="imaging" />
              <el-option label="基因检测" value="genetic" />
              <el-option label="病理检查" value="pathology" />
              <el-option label="功能检查" value="functional" />
              <el-option label="量表评估" value="scale" />
              <el-option label="专科专项检查" value="special" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="检查名称" prop="examName">
            <el-input v-model="formData.examName" placeholder="请输入检查名称" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 其余表单项保持不变... -->
      <el-form-item label="检查目的" prop="examPurpose">
        <el-input
          v-model="formData.examPurpose"
          type="textarea"
          :rows="3"
          placeholder="请输入检查目的"
        />
      </el-form-item>

      <el-form-item label="参考值" prop="referenceValue">
        <el-input
          v-model="formData.referenceValue"
          type="textarea"
          :rows="4"
          placeholder="请输入参考值说明"
        />
      </el-form-item>

      <el-form-item label="异常解读" prop="abnormalInterpret">
        <el-input
          v-model="formData.abnormalInterpret"
          type="textarea"
          :rows="4"
          placeholder="请输入异常结果解读"
        />
      </el-form-item>

      <el-form-item label="采样注意事项" prop="sampleNotes">
        <el-input
          v-model="formData.sampleNotes"
          type="textarea"
          :rows="3"
          placeholder="请输入采样注意事项"
        />
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="出具机构">
            <el-input v-model="formData.institution" placeholder="请输入出具机构" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序">
            <el-input-number v-model="formData.sort" :min="0" :step="1" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="Excel模板">
            <el-input v-model="formData.templates.excel" placeholder="Excel 模板地址" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="Word模板">
            <el-input v-model="formData.templates.word" placeholder="Word 模板地址" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="对比模板">
            <el-input v-model="formData.templates.compare" placeholder="对比模板地址" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="适用疾病" prop="diseaseIds">
        <el-select
          v-model="formData.diseaseIds"
          multiple
          filterable
          remote
          reserve-keyword
          :remote-method="loadDiseaseOptions"
          :loading="diseaseLoading"
          placeholder="请输入疾病名称搜索并选择"
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

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="审核状态" prop="auditStatus">
            <el-radio-group v-model="formData.auditStatus">
              <el-radio :label="0">待审核</el-radio>
              <el-radio :label="1">已通过</el-radio>
              <el-radio :label="2">已驳回</el-radio>
            </el-radio-group>
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
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getDiseaseOptions,
  type DiseaseOptionItem
} from '@/api/resource/medical/examination'

// ... Props, Emit, visible 定义保持不变 ...
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
const diseaseLoading = ref(false)
const diseaseOptions = ref<DiseaseOptionItem[]>([])

// ... FormData 接口和 defaultForm 保持不变 ...
interface FormData {
  id?: number;
  examType: string;
  examName: string;
  examPurpose: string;
  referenceValue: string;
  abnormalInterpret: string;
  sampleNotes: string;
  institution: string;
  templates: {
    excel: string;
    word: string;
    compare: string;
  };
  auditStatus: number;
  rejectReason: string;
  sort: number;
  diseaseIds: number[];
}

const defaultForm = (): FormData => ({
  examType: '',
  examName: '',
  examPurpose: '',
  referenceValue: '',
  abnormalInterpret: '',
  sampleNotes: '',
  institution: '',
  templates: {
    excel: '',
    word: '',
    compare: ''
  },
  auditStatus: 0,
  rejectReason: '',
  sort: 0,
  diseaseIds: []
})

const formData = reactive<FormData>(defaultForm())

const rules: FormRules = {
  examType: [{ required: true, message: '请选择检查类型', trigger: 'change' }],
  examName: [{ required: true, message: '请输入检查名称', trigger: 'blur' }],
  examPurpose: [{ required: true, message: '请输入检查目的', trigger: 'blur' }],
  referenceValue: [{ required: true, message: '请输入参考值说明', trigger: 'blur' }],
  abnormalInterpret: [{ required: true, message: '请输入异常解读', trigger: 'blur' }],
  sampleNotes: [{ required: true, message: '请输入采样注意事项', trigger: 'blur' }],
  diseaseIds: [{ required: true, type: 'array', min: 1, message: '请至少选择一个适用疾病', trigger: 'change' }]
}

// ... loadDiseaseOptions, mergeDiseaseOptions, resetForm, handleClose 保持不变 ...
const loadDiseaseOptions = async (keyword = '') => {
  diseaseLoading.value = true
  try {
    const res = await getDiseaseOptions(keyword)
    if ((res as any).code === 200) {
      diseaseOptions.value = (res as any).data || []
    }
  } finally {
    diseaseLoading.value = false
  }
}

const mergeDiseaseOptions = (items: DiseaseOptionItem[] = []) => {
  const map = new Map<number, DiseaseOptionItem>()
  ;[...diseaseOptions.value, ...items].forEach(item => {
    map.set(item.id, item)
  })
  diseaseOptions.value = Array.from(map.values())
}

const resetForm = () => {
  Object.assign(formData, defaultForm())
}

const handleClose = () => {
  formRef.value?.resetFields()
  resetForm()
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      emit('submit', { ...formData, diseaseIds: [...formData.diseaseIds] })
    } finally {
      loading.value = false
    }
  })
}

watch(
  () => props.modelValue,
  (visibleNow) => {
    if (visibleNow) {
      loadDiseaseOptions('')
    }
  }
)

watch(
  () => props.data,
  (newData) => {
    resetForm()
    if (!newData) return

    const templates = newData.templates || {}
    
    Object.assign(formData, {
      id: newData.id,
      examType: newData.examType || '',
      examName: newData.examName || '',
      examPurpose: newData.examPurpose || '',
      referenceValue: newData.referenceValue || '',
      abnormalInterpret: newData.abnormalInterpret || '',
      sampleNotes: newData.sampleNotes || newData.preparation || '',
      institution: newData.institution || '',
      templates: {
        excel: templates.excel || '',
        word: templates.word || '',
        compare: templates.compare || ''
      },
      auditStatus: newData.auditStatus ?? 0,
      rejectReason: newData.rejectReason || '',
      sort: newData.sort ?? 0,
      diseaseIds: newData.diseaseIds || []
    })

    if (newData.diseases?.length) {
      mergeDiseaseOptions(newData.diseases)
    }
  },
  { immediate: true }
)
</script>