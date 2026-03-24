<!-- src/views/community/components/PostCreateDialog.vue -->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="发布新帖子"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
      <el-form-item label="内容" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="8"
          placeholder="请输入帖子内容..."
          maxlength="2000"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="图片">
        <el-upload
          action="/api/upload"
          list-type="picture-card"
          :file-list="fileList"
          :on-change="handleFileChange"
          :on-remove="handleRemove"
          :before-upload="beforeUpload"
          :limit="9"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="submitting">
        发布
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, UploadProps } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { createPost } from '@/api/community/post'

interface Props {
  modelValue: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

const formRef = ref()
const dialogVisible = ref(false)
const submitting = ref(false)
const fileList = ref([])

const form = reactive({
  content: '',
  images: [] as string[]
})

const rules = {
  content: [
    { required: true, message: '请输入帖子内容', trigger: 'blur' },
    { min: 5, message: '内容至少 5 个字符', trigger: 'blur' }
  ]
}

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val
  if (val) {
    // 打开时重置表单
    form.content = ''
    fileList.value = []
    form.images = []
  }
})

watch(dialogVisible, (val) => {
  emit('update:modelValue', val)
})

const handleFileChange: UploadProps['onChange'] = (file, files) => {
  fileList.value = files
}

const handleRemove: UploadProps['onRemove'] = (file, files) => {
  fileList.value = files
}

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
  }
  return isImage && isLt2M
}

const handleSubmit = async () => {
  await formRef.value.validate()
  
  // 获取图片 URL 列表（实际项目中需要根据上传接口返回处理）
  const imageUrls = fileList.value.map((file: any) => file.url || file.response?.url).filter(Boolean)
  
  submitting.value = true
  try {
    await createPost({
      content: form.content,
      images: imageUrls
    })
    ElMessage.success('发布成功')
    emit('success')
    handleClose()
  } catch (error) {
    ElMessage.error('发布失败')
  } finally {
    submitting.value = false
  }
}

const handleClose = () => {
  dialogVisible.value = false
  formRef.value?.resetFields()
}
</script>

<style lang="scss" scoped>
:deep(.el-upload-list--picture-card) {
  margin-top: 10px;
}
</style>