<template>
  <Dialog v-model="visible" :title="dialogTitle" width="860px">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-row :gutter="16">
        <el-col :span="12"><el-form-item label="关联疾病" prop="disease_id">
          <el-select v-model="form.disease_id" filterable remote reserve-keyword :remote-method="searchDiseases" style="width: 100%">
            <el-option v-for="item in diseaseOptions" :key="item.id" :label="`${item.name}${item.alias ? `（${item.alias}）` : ''}`" :value="item.id" />
          </el-select>
        </el-form-item></el-col>
        <el-col :span="12"><el-form-item label="资源类型" prop="resource_type">
          <el-select v-model="form.resource_type"><el-option label="心理疏导指南" value="guide" /><el-option label="心理手册" value="manual" /><el-option label="心理热线" value="hotline" /><el-option label="线上资源" value="online_resource" /></el-select>
        </el-form-item></el-col>
        <el-col :span="24"><el-form-item label="资源名称" prop="name"><el-input v-model="form.name" /></el-form-item></el-col>
        <el-col :span="24"><el-form-item label="内容简介" prop="content_intro"><el-input v-model="form.content_intro" type="textarea" :rows="4" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="指南PDF"><el-input v-model="form.guide_pdf" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="患者手册"><el-input v-model="form.manual_patient" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="家属手册"><el-input v-model="form.manual_family" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="联系电话/热线"><el-input v-model="form.contact_phone" /></el-form-item></el-col>
        <el-col :span="24"><el-form-item label="官网/入口"><el-input v-model="form.contact_url" /></el-form-item></el-col>
        <el-col :span="24"><el-form-item label="审核状态" prop="audit_status"><el-radio-group v-model="form.audit_status"><el-radio :label="0">待审核</el-radio><el-radio :label="1">已通过</el-radio><el-radio :label="2">已驳回</el-radio></el-radio-group></el-form-item></el-col>
        <el-col :span="24" v-if="form.audit_status === 2"><el-form-item label="驳回原因"><el-input v-model="form.reject_reason" type="textarea" :rows="3" /></el-form-item></el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="submit">保存</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
// 修复点1: 去除重复的 updatePsychResource，增加 getPsychResourceDetail 和 searchDiseaseOptions
import { 
  addPsychResource, 
  updatePsychResource, 
  getPsychResourceDetail,
  searchDiseaseOptions 
} from '@/api/resource/rehab/psychologicalOrg'

const emit = defineEmits(['success'])
const visible = ref(false)
const loading = ref(false)
const dialogTitle = ref('新增资源')
const mode = ref<'create' | 'update'>('create')
const currentId = ref<number>()
const formRef = ref()
const diseaseOptions = ref<any[]>([])

const defaultForm = () => ({ 
  disease_id: null, 
  resource_type: 'guide', 
  name: '', 
  content_intro: '', 
  guide_pdf: '', 
  manual_patient: '', 
  manual_family: '', 
  contact_phone: '', 
  contact_url: '', 
  audit_status: 0, 
  reject_reason: '' 
})

const form = reactive<any>(defaultForm())

const rules = {
  disease_id: [{ required: true, message: '请选择疾病', trigger: 'change' }],
  resource_type: [{ required: true, message: '请选择资源类型', trigger: 'change' }],
  name: [{ required: true, message: '请输入资源名称', trigger: 'blur' }],
  content_intro: [{ required: true, message: '请输入内容简介', trigger: 'blur' }]
}

// 修复点2: 使用正确的 API 函数 searchDiseaseOptions
const searchDiseases = async (keyword: string) => {
  const res = await searchDiseaseOptions(keyword)
  diseaseOptions.value = (res.data as any)?.list || res.data || []
}

const open = async (type: 'create' | 'update', id?: number) => {
  visible.value = true
  mode.value = type
  dialogTitle.value = type === 'create' ? '新增资源' : '编辑资源'
  Object.assign(form, defaultForm())
  await searchDiseases('')
  
  if (type === 'update' && id) {
    currentId.value = id
    // 修复点3: 使用 getPsychResourceDetail 获取详情，而不是 updatePsychResource
    const res = await getPsychResourceDetail(id)
    Object.assign(form, res.data)
    if (res.data?.diseaseName) {
      diseaseOptions.value = [{ 
        id: res.data.disease_id, 
        name: res.data.disease_name, 
        alias: res.data.disease_alias || '' 
      }]
    }
  }
}

const submit = async () => {
  await formRef.value.validate()
  loading.value = true
  try {
    if (mode.value === 'create') await addPsychResource(form)
    else await updatePsychResource(currentId.value!, form)
    ElMessage.success('保存成功')
    visible.value = false
    emit('success')
  } finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>
