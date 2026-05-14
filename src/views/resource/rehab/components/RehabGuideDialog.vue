<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑康复训练指南' : '新增康复训练指南'"
    width="900px"
    :close-on-click-modal="false"
    @open="handleOpen"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="120px">
      <!-- 修改点：prop 和 v-model 改为 rehabStage -->
      <el-form-item label="康复阶段" prop="rehabStage">
        <el-select v-model="formData.rehabStage" placeholder="请选择康复阶段" style="width: 100%">
          <el-option v-for="item in rehabStageOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="指南标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入指南标题" maxlength="500" show-word-limit />
      </el-form-item>

      <!-- 修改点：prop 和 v-model 改为 trainPurpose -->
      <el-form-item label="训练目的" prop="trainPurpose">
        <el-input v-model="formData.trainPurpose" type="textarea" :rows="3" placeholder="请输入训练目的" maxlength="500" show-word-limit />
      </el-form-item>

      <!-- 修改点：prop 和 v-model 改为 trainContent -->
      <el-form-item label="训练内容" prop="trainContent">
        <el-input v-model="formData.trainContent" type="textarea" :rows="5" placeholder="请输入训练内容" />
      </el-form-item>

      <!-- 修改点：prop 和 v-model 改为 forbiddenAction -->
      <el-form-item label="禁忌动作" prop="forbiddenAction">
        <el-input v-model="formData.forbiddenAction" type="textarea" :rows="4" placeholder="请输入禁忌动作" />
      </el-form-item>

      <!-- 修改点：prop 和 v-model 改为 diseaseIds -->
      <el-form-item label="适用疾病" prop="diseaseIds">
        <el-select
          v-model="formData.diseaseIds"
          multiple
          filterable
          remote
          reserve-keyword
          clearable
          style="width: 100%"
          placeholder="请输入疾病名称搜索"
          :remote-method="loadDiseaseOptions"
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

      <!-- 注意：picUrlsText 是本地辅助变量，用于编辑 JSON，不直接对应后端字段，保持不变 -->
      <el-form-item label="图片链接(JSON)" prop="picUrlsText">
        <el-input
          v-model="picUrlsText"
          type="textarea"
          :rows="4"
          placeholder='请输入 JSON 数组，例如：["https://a.com/1.jpg", "https://a.com/2.jpg"]'
        />
      </el-form-item>

      <!-- 修改点：prop 和 v-model 改为 guidePdf -->
      <el-form-item label="PDF 下载" prop="guidePdf">
        <el-input v-model="formData.guidePdf" placeholder="请输入 PDF 下载地址" />
      </el-form-item>

      <!-- 修改点：prop 和 v-model 改为 guideWord -->
      <el-form-item label="Word 下载" prop="guideWord">
        <el-input v-model="formData.guideWord" placeholder="请输入 Word 下载地址" />
      </el-form-item>

      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="formData.sort" :min="0" :max="9999" />
      </el-form-item>

      <!-- 修改点：prop 和 v-model 改为 auditStatus -->
      <el-form-item label="审核状态" prop="auditStatus">
        <el-radio-group v-model="formData.auditStatus">
          <el-radio :label="0">待审核</el-radio>
          <el-radio :label="1">已通过</el-radio>
          <el-radio :label="2">已驳回</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- 修改点：v-if 判断 auditStatus, v-model 改为 rejectReason -->
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
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import {
  searchDiseaseOptions,
  type DiseaseOption,
  type RehabTrainGuideItem,
} from '@/api/resource/rehab/rehabGuide'

interface Props {
  modelValue: boolean
  editData?: RehabTrainGuideItem | null
}

const props = withDefaults(defineProps<Props>(), {
  editData: null,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: RehabTrainGuideItem]
}>()

const rehabStageOptions = [
  { label: '早期', value: 'early' },
  { label: '中期', value: 'middle' },
  { label: '晚期', value: 'late' },
  { label: '稳定期', value: 'stable' },
  { label: '进展期', value: 'progressive' },
]

const formRef = ref<FormInstance>()
const dialogVisible = ref(false)
const submitLoading = ref(false)
const diseaseLoading = ref(false)
const isEdit = computed(() => !!formData.id)
const diseaseOptions = ref<DiseaseOption[]>([])
const picUrlsText = ref('[]')

// 修改点：默认值对象字段改为小驼峰
const getEmptyFormData = (): RehabTrainGuideItem => ({
  id: 0,
  rehabStage: '',
  title: '',
  trainPurpose: '',
  trainContent: '',
  forbiddenAction: '',
  picUrls: [],
  guidePdf: '',
  guideWord: '',
  auditStatus: 0,
  rejectReason: '',
  sort: 0,
  diseaseIds: [],
  diseases: [],
})

const formData = reactive<RehabTrainGuideItem>(getEmptyFormData())

// 修改点：校验规则的 prop 改为小驼峰
const formRules: FormRules = {
  rehabStage: [{ required: true, message: '请选择康复阶段', trigger: 'change' }],
  title: [{ required: true, message: '请输入指南标题', trigger: 'blur' }],
  trainPurpose: [{ required: true, message: '请输入训练目的', trigger: 'blur' }],
  trainContent: [{ required: true, message: '请输入训练内容', trigger: 'blur' }],
  forbiddenAction: [{ required: true, message: '请输入禁忌动作', trigger: 'blur' }],
  // 如果 diseaseIds 也是必填，可以添加
  // diseaseIds: [{ required: true, type: 'array', min: 1, message: '请至少选择一个疾病', trigger: 'change' }],
}

const loadDiseaseOptions = async (keyword = '') => {
  diseaseLoading.value = true
  try {
    const res = await searchDiseaseOptions(keyword)
    // 兼容不同的返回结构
    const data = Array.isArray(res.data) ? res.data : res.data?.list || []
    diseaseOptions.value = data
  } finally {
    diseaseLoading.value = false
  }
}

const mergeDiseaseOptionsFromDetail = () => {
  const merged = [...diseaseOptions.value]
  // 修改点：访问 formData.diseases
  ;(formData.diseases || []).forEach((item) => {
    if (!merged.find((m) => m.id === item.id)) {
      merged.push({ id: item.id, name: item.name, alias: item.alias })
    }
  })
  diseaseOptions.value = merged
}

const resetForm = () => {
  Object.assign(formData, getEmptyFormData())
  picUrlsText.value = '[]'
  diseaseOptions.value = []
  formRef.value?.clearValidate()
}

const handleOpen = async () => {
  await loadDiseaseOptions('')
  if (props.editData) {
    // 重置表单以避免残留数据
    resetForm()
    
    // 填充数据：注意后端返回的是小驼峰，直接 assign 即可
    Object.assign(formData, props.editData)
    
    // 处理疾病 ID 映射：优先使用 diseaseIds，如果没有则从 diseases 对象提取
    formData.diseaseIds = props.editData.diseaseIds || props.editData.diseases?.map((i) => i.id) || []
    
    // 处理图片链接显示
    picUrlsText.value = JSON.stringify(props.editData.picUrls || [], null, 2)
    
    // 合并疾病选项以便下拉框显示名称
    mergeDiseaseOptionsFromDetail()
  } else {
    resetForm()
    await loadDiseaseOptions('')
  }
}

const handleClose = () => {
  dialogVisible.value = false
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  // 解析图片链接 JSON
  try {
    // 如果输入为空，解析为 empty array
    const parsed = picUrlsText.value.trim() === '' ? [] : JSON.parse(picUrlsText.value)
    if (!Array.isArray(parsed)) {
      ElMessage.error('图片链接必须是 JSON 数组')
      return
    }
    formData.picUrls = parsed
  } catch {
    ElMessage.error('图片链接 JSON 格式不正确')
    return
  }

  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitLoading.value = true
    try {
      // 构造提交数据
      // 由于 API 定义已改为小驼峰，且 formData 也是小驼峰，可以直接提交
      // 确保只提交必要的字段，或者根据后端要求清理字段
      const payload: Partial<RehabTrainGuideItem> = {
        ...formData,
        // 确保 diseaseIds 是数组
        diseaseIds: [...(formData.diseaseIds || [])],
        // 确保 picUrls 是数组
        picUrls: formData.picUrls || [],
      }
      
      // 如果后端不需要 diseases 对象列表，可以删除它以减少 payload 大小
      delete payload.diseases 
      // 如果后端不需要 diseaseCount，也可以删除
      delete payload.diseaseCount

      emit('submit', payload as RehabTrainGuideItem)
    } finally {
      submitLoading.value = false
    }
  })
}

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
  if (!val) {
    resetForm()
  }
})
</script>