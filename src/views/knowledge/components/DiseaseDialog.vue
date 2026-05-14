<template>
  <el-dialog v-model="visible" :title="isEdit ? '编辑疾病' : '新增疾病'" width="860px" @close="handleClose">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="110px">
      <el-divider content-position="left">基础信息</el-divider>
      <el-form-item label="疾病名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入疾病名称" />
      </el-form-item>
      <el-form-item label="疾病别名" prop="alias">
        <el-input v-model="formData.alias" placeholder="多个别名用逗号分隔" />
      </el-form-item>
      <el-form-item label="疾病简介" prop="introduction">
        <el-input v-model="formData.introduction" type="textarea" :rows="3" placeholder="用于列表页和详情页简介" />
      </el-form-item>
      <el-form-item label="常见症状" prop="symptoms">
        <el-input v-model="formData.symptoms" type="textarea" :rows="4" placeholder="请输入常见症状" />
      </el-form-item>
      <el-form-item label="图片地址" prop="images">
        <el-input v-model="imageInput" type="textarea" :rows="3" placeholder="一行一个图片 URL，保存时自动转数组" />
      </el-form-item>

      <el-divider content-position="left">分类绑定</el-divider>
      <el-form-item label="主分类" prop="primaryCategoryId">
        <el-tree-select
          v-model="formData.primaryCategoryId"
          :data="categoryTree"
          node-key="id"
          check-strictly
          :props="{ label: 'name', children: 'children' }"
          placeholder="请选择主分类"
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="关联分类" prop="categoryIds">
        <el-tree-select
          v-model="formData.categoryIds"
          :data="categoryTree"
          node-key="id"
          show-checkbox
          check-strictly
          multiple
          collapse-tags
          collapse-tags-tooltip
          :props="{ label: 'name', children: 'children' }"
          placeholder="请选择关联分类"
          style="width: 100%"
        />
        <div class="field-tip">关联表由系统自动维护，不需要单独录入 disease_category_rel。</div>
      </el-form-item>

      <el-divider content-position="left">标签绑定</el-divider>
      <el-form-item label="疾病标签" prop="tagIds">
        <el-select
          v-model="formData.tagIds"
          multiple
          collapse-tags
          collapse-tags-tooltip
          placeholder="请选择标签"
          style="width: 100%"
        >
          <el-option v-for="item in tagList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
        <div class="field-tip">标签关联同样由系统自动维护，不需要单独维护 disease_tag_rel。</div>
      </el-form-item>

      <el-divider content-position="left">发布设置</el-divider>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :value="1">启用</el-radio>
          <el-radio :value="0">停用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { CategoryTreeNode, TagItem } from '@/api/knowledge/knowledge'

interface Props {
  modelValue: boolean
  isEdit: boolean
  data?: any
  categoryTree: CategoryTreeNode[]
  tagList: TagItem[]
}

const props = withDefaults(defineProps<Props>(), {
  data: null,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: any]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const formRef = ref<FormInstance>()
const loading = ref(false)
const imageInput = ref('')

const formData = reactive({
  id: null as number | null,
  name: '',
  alias: '',
  introduction: '',
  symptoms: '',
  images: [] as string[],
  primaryCategoryId: undefined as number | undefined,
  categoryIds: [] as number[],
  tagIds: [] as number[],
  status: 1 as 0 | 1,
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入疾病名称', trigger: 'blur' }],
  primaryCategoryId: [{ required: true, message: '请选择主分类', trigger: 'change' }],
  categoryIds: [{ required: true, type: 'array', min: 1, message: '至少选择一个关联分类', trigger: 'change' }],
}

const resetForm = () => {
  formData.id = null
  formData.name = ''
  formData.alias = ''
  formData.introduction = ''
  formData.symptoms = ''
  formData.images = []
  formData.primaryCategoryId = undefined
  formData.categoryIds = []
  formData.tagIds = []
  formData.status = 1
  imageInput.value = ''
}

watch(
  () => props.data,
  (newData) => {
    if (newData) {
      formData.id = newData.id || null
      formData.name = newData.name || ''
      formData.alias = newData.alias || ''
      formData.introduction = newData.introduction || ''
      formData.symptoms = newData.symptoms || ''
      formData.images = newData.images || []
      formData.primaryCategoryId = newData.primaryCategoryId
      formData.categoryIds = newData.categoryIds || []
      formData.tagIds = newData.tagIds || []
      formData.status = newData.status ?? 1
      imageInput.value = formData.images.join('\n')
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

watch(
  () => formData.primaryCategoryId,
  (value) => {
    if (value && !formData.categoryIds.includes(value)) {
      formData.categoryIds = [value, ...formData.categoryIds]
    }
  }
)

const handleSubmit = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  formData.images = imageInput.value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)

  if (formData.primaryCategoryId && !formData.categoryIds.includes(formData.primaryCategoryId)) {
    formData.categoryIds.unshift(formData.primaryCategoryId)
  }

  loading.value = true
  try {
    emit('submit', { ...formData })
    visible.value = false
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  formRef.value?.resetFields()
  resetForm()
}
</script>

<style scoped lang="scss">
.field-tip {
  margin-top: 6px;
  color: #909399;
  font-size: 12px;
  line-height: 1.5;
}
</style>
