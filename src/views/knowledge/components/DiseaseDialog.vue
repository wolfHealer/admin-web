<!-- src/views/knowledge/components/DiseaseDialog.vue -->
<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑疾病' : '新增疾病'"
    width="800px"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="疾病名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入疾病名称" />
      </el-form-item>
      <el-form-item label="别名" prop="alias">
        <el-input v-model="formData.alias" placeholder="多个别名用逗号分隔" />
      </el-form-item>
      <el-form-item label="所属分类" prop="categoryId">
        <el-select v-model="formData.categoryId" placeholder="选择分类" style="width: 100%">
          <el-option
            v-for="item in categoryTree"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="0">停用</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="病种简介" prop="introduction">
        <el-input
          v-model="formData.introduction"
          type="textarea"
          :rows="3"
          placeholder="请输入病种简介"
        />
      </el-form-item>
      <el-form-item label="常见症状" prop="symptoms">
        <el-input
          v-model="formData.symptoms"
          type="textarea"
          :rows="3"
          placeholder="请输入常见症状"
        />
      </el-form-item>
      <el-form-item label="诊疗指南" prop="guidelines">
        <el-input
          v-model="formData.guidelines"
          type="textarea"
          :rows="3"
          placeholder="请输入诊疗指南"
        />
      </el-form-item>
      <el-form-item label="用药推荐" prop="medications">
        <el-input
          v-model="formData.medications"
          type="textarea"
          :rows="3"
          placeholder="请输入用药推荐"
        />
      </el-form-item>
      <el-form-item label="病友经验" prop="experiences">
        <el-input
          v-model="formData.experiences"
          type="textarea"
          :rows="3"
          placeholder="请输入病友经验"
        />
      </el-form-item>
      <el-form-item label="相关图片" prop="images">
        <el-input
          v-model="imageInput"
          type="textarea"
          :rows="2"
          placeholder="请输入图片 URL，多个用逗号分隔"
        />
        <div class="image-preview" v-if="formData.images.length > 0">
          <el-tag
            v-for="(img, index) in formData.images"
            :key="index"
            closable
            @close="removeImage(index)"
            class="image-tag"
          >
            图片{{ index + 1 }}
          </el-tag>
        </div>
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
import { ref, reactive, computed, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { Category } from '@/api/knowledge/knowledge'

interface Props {
  modelValue: boolean
  isEdit: boolean
  categoryTree: Category[]
  data?: {
    id?: number
    name: string
    alias?: string
    categoryId?: number
    introduction?: string
    symptoms?: string
    guidelines?: string
    medications?: string
    experiences?: string
    images?: string[]
    status?: 0 | 1
  } | null
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
const imageInput = ref('')

const formData = reactive({
  id: null as number | null,
  name: '',
  alias: '',
  categoryId: null as number | null,
  introduction: '',
  symptoms: '',
  guidelines: '',
  medications: '',
  experiences: '',
  images: [] as string[],
  status: 1 as 0 | 1
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入疾病名称', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }]
}

const parseImageInput = () => {
  if (imageInput.value.trim()) {
    formData.images = imageInput.value.split(',').map(url => url.trim()).filter(url => url)
  } else {
    formData.images = []
  }
}

const removeImage = (index: number) => {
  formData.images.splice(index, 1)
  imageInput.value = formData.images.join(',')
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        parseImageInput()
        emit('submit', { 
          id: formData.id,
          name: formData.name,
          alias: formData.alias,
          categoryId: formData.categoryId,
          introduction: formData.introduction,
          symptoms: formData.symptoms,
          guidelines: formData.guidelines,
          medications: formData.medications,
          experiences: formData.experiences,
          images: formData.images,
          status: formData.status
        })
        visible.value = false
      } finally {
        loading.value = false
      }
    }
  })
}

const handleClose = () => {
  formRef.value?.resetFields()
  resetForm()
}

const resetForm = () => {
  formData.id = null
  formData.name = ''
  formData.alias = ''
  formData.categoryId = null
  formData.introduction = ''
  formData.symptoms = ''
  formData.guidelines = ''
  formData.medications = ''
  formData.experiences = ''
  formData.images = []
  formData.status = 1
  imageInput.value = ''
}

// 监听数据变化，填充表单
watch(() => props.data, (newData) => {
  if (newData && props.isEdit) {
    formData.id = newData.id || null
    formData.name = newData.name
    formData.alias = newData.alias || ''
    formData.categoryId = newData.categoryId || null
    formData.introduction = newData.introduction || ''
    formData.symptoms = newData.symptoms || ''
    formData.guidelines = newData.guidelines || ''
    formData.medications = newData.medications || ''
    formData.experiences = newData.experiences || ''
    formData.images = newData.images || []
    formData.status = newData.status ?? 1
    imageInput.value = formData.images.join(',')
  }
}, { immediate: true })
</script>

<style lang="scss" scoped>
.image-preview {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .image-tag {
    cursor: pointer;
  }
}
</style>