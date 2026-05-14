<template>
  <el-dialog 
    :model-value="modelValue" 
    :title="projectId ? '编辑救助项目' : '新增救助项目'" 
    width="900px" 
    @close="emit('update:modelValue', false)"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="项目名称" prop="name"><el-input v-model="form.name" /></el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="主办机构" prop="organizer"><el-input v-model="form.organizer" /></el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="救助类型" prop="reliefType">
            <el-select v-model="form.reliefType" style="width: 100%">
              <el-option label="医疗费用" value="medical_cost" />
              <el-option label="生活支持" value="living_support" />
              <el-option label="康复补贴" value="rehab_subsidy" />
              <el-option label="药品援助" value="drug_relief" />
              <el-option label="其他" value="other" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="申请难度" prop="applyDifficulty">
            <el-select v-model="form.applyDifficulty" style="width: 100%">
              <el-option label="容易" value="easy" />
              <el-option label="中等" value="medium" />
              <el-option label="较难" value="hard" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="截止日期">
            <el-date-picker 
              v-model="form.applyDeadline" 
              type="date" 
              value-format="YYYY-MM-DD" 
              style="width:100%" 
              placeholder="选择日期"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序"><el-input-number v-model="form.sort" :min="0" style="width:100%" /></el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="关联疾病" prop="diseaseIds">
            <el-select 
              v-model="form.diseaseIds" 
              multiple 
              filterable 
              remote 
              reserve-keyword 
              :remote-method="loadDiseaseOptions" 
              :loading="diseaseLoading" 
              style="width:100%"
              placeholder="请输入疾病名称搜索"
            >
              <el-option 
                v-for="item in diseaseOptions" 
                :key="item.id" 
                :label="`${item.name}${item.alias ? `（${item.alias}）` : ''}`" 
                :value="item.id" 
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24"><el-form-item label="申请条件" prop="applyCondition"><el-input v-model="form.applyCondition" type="textarea" :rows="3" /></el-form-item></el-col>
        <el-col :span="24"><el-form-item label="救助标准" prop="reliefStandard"><el-input v-model="form.reliefStandard" type="textarea" :rows="3" /></el-form-item></el-col>
        <el-col :span="24"><el-form-item label="申请流程" prop="applyProcess"><el-input v-model="form.applyProcess" type="textarea" :rows="4" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="申请表"><el-input v-model="form.applyForm" placeholder="链接或文件路径" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="申请指南"><el-input v-model="form.applyGuide" placeholder="链接或文件路径" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="材料清单"><el-input v-model="form.materialList" placeholder="链接或文件路径" /></el-form-item></el-col>
        <el-col :span="12"><el-form-item label="咨询电话"><el-input v-model="form.contactPhone" /></el-form-item></el-col>
        <el-col :span="24"><el-form-item label="咨询链接"><el-input v-model="form.contactUrl" /></el-form-item></el-col>
        <el-col :span="12">
          <el-form-item label="审核状态" prop="auditStatus">
            <el-select v-model="form.auditStatus" style="width:100%">
              <el-option label="待审核" :value="0" />
              <el-option label="已通过" :value="1" />
              <el-option label="已驳回" :value="2" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="form.auditStatus === 2">
          <el-form-item label="驳回原因"><el-input v-model="form.rejectReason" /></el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="saving" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { reactive, ref, watch } from 'vue'
import {
  addReliefProject,
  getReliefProjectDetail,
  searchDiseaseOptions,
  updateReliefProject,
  type DiseaseOption,
  type ReliefProjectItem,
} from '@/api/resource/charity/project'

const props = defineProps<{ modelValue: boolean; projectId?: number }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void; (e: 'success'): void }>()

const formRef = ref<FormInstance>()
const saving = ref(false)
const diseaseLoading = ref(false)
const diseaseOptions = ref<DiseaseOption[]>([])

// 默认表单结构
const getDefaultForm = (): Partial<ReliefProjectItem> => ({
  reliefType: '',
  name: '',
  organizer: '',
  applyCondition: '',
  reliefStandard: '',
  applyDeadline: '',
  applyDifficulty: '',
  applyProcess: '',
  applyForm: '',
  applyGuide: '',
  materialList: '',
  contactPhone: '',
  contactUrl: '',
  auditStatus: 0,
  rejectReason: '',
  sort: 0,
  diseaseIds: [],
})

const form = reactive<Partial<ReliefProjectItem>>(getDefaultForm())

const rules: FormRules = {
  reliefType: [{ required: true, message: '请选择救助类型', trigger: 'change' }],
  name: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  organizer: [{ required: true, message: '请输入主办机构', trigger: 'blur' }],
  applyDifficulty: [{ required: true, message: '请选择申请难度', trigger: 'change' }],
  applyCondition: [{ required: true, message: '请输入申请条件', trigger: 'blur' }],
  reliefStandard: [{ required: true, message: '请输入救助标准', trigger: 'blur' }],
  applyProcess: [{ required: true, message: '请输入申请流程', trigger: 'blur' }],
}

const resetForm = () => {
  Object.assign(form, getDefaultForm())
  formRef.value?.clearValidate()
  diseaseOptions.value = []
}

const loadDiseaseOptions = async (keyword = '') => {
  if (!keyword) return 
  diseaseLoading.value = true
  try {
    const res = await searchDiseaseOptions(keyword)
    // 确保正确提取列表数据
    const list = Array.isArray(res.data) ? res.data : (res.data?.list || [])
    diseaseOptions.value = list
  } catch (error) {
    console.error('加载疾病选项失败', error)
  } finally {
    diseaseLoading.value = false
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate()
  
  saving.value = true
  try {
    const payload: any = {
      ...form,
    }
    
    // 提交时通常不需要 diseases 对象数组，只保留 diseaseIds
    delete payload.diseases 

    if (props.projectId) {
      await updateReliefProject(props.projectId, payload)
    } else {
      await addReliefProject(payload)
    }
    
    ElMessage.success('保存成功')
    emit('update:modelValue', false)
    emit('success')
  } catch (error) {
    console.error('保存失败', error)
  } finally {
    saving.value = false
  }
}

const loadDetail = async (id: number) => {
  try {
    const res = await getReliefProjectDetail(id)
    
    // 【修复点】：明确获取 res.data，并增加非空判断
    // res 的类型是 ApiResponse<ReliefProjectItem>
    // res.data 的类型是 ReliefProjectItem
    const item = res.data
    
    if (!item) {
      ElMessage.warning('未获取到项目详情')
      return
    }

    resetForm()
    
    // 【修复点】：直接使用 item 的属性，TypeScript 现在能正确识别 item 为 ReliefProjectItem
    Object.assign(form, {
      id: item.id,
      name: item.name,
      organizer: item.organizer,
      // 兼容后端可能返回 type 或 reliefType
      reliefType: (item as any).reliefType || (item as any).type, 
      applyCondition: item.applyCondition,
      reliefStandard: item.reliefStandard,
      applyDeadline: item.applyDeadline,
      applyDifficulty: item.applyDifficulty,
      applyProcess: item.applyProcess,
      applyForm: item.applyForm,
      applyGuide: item.applyGuide,
      materialList: item.materialList,
      contactPhone: item.contactPhone,
      contactUrl: item.contactUrl,
      auditStatus: item.auditStatus,
      rejectReason: item.rejectReason,
      sort: item.sort,
      // 处理关联疾病：如果有 diseases 数组，提取 ID；否则使用已有的 diseaseIds（如果有）
      diseaseIds: item.diseases 
        ? item.diseases.map((d: DiseaseOption) => d.id) 
        : (item.diseaseIds || []),
    })
    
    // 初始化下拉框显示名称
    if (item.diseases && Array.isArray(item.diseases)) {
      diseaseOptions.value = item.diseases
    }
  } catch (error) {
    console.error('加载详情失败', error)
    ElMessage.error('加载详情失败')
  }
}

watch(
  () => props.modelValue,
  async (visible) => {
    if (visible) {
      resetForm()
      if (props.projectId) {
        await loadDetail(props.projectId)
      }
    }
  },
)
</script>