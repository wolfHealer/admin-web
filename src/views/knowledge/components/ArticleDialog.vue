<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑科普文章' : '新增科普文章'"
    width="960px"
    top="4vh"
    destroy-on-close
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="110px">
      <el-divider content-position="left">基础信息</el-divider>
      <el-form-item label="标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入文章标题" maxlength="200" show-word-limit />
      </el-form-item>
      <el-form-item label="摘要" prop="summary">
        <el-input v-model="formData.summary" type="textarea" :rows="2" placeholder="列表页展示摘要" />
      </el-form-item>
      <el-form-item label="封面 URL" prop="coverImage">
        <el-input v-model="formData.coverImage" placeholder="https://example.com/cover.jpg" />
      </el-form-item>
      <el-form-item label="内容类型" prop="contentType">
        <el-select v-model="formData.contentType" style="width: 220px">
          <el-option
            v-for="item in ARTICLE_CONTENT_TYPE_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-divider content-position="left">关联信息</el-divider>
      <el-form-item label="关联病种" prop="diseaseIds">
        <el-select
          v-model="formData.diseaseIds"
          multiple
          filterable
          remote
          reserve-keyword
          collapse-tags
          collapse-tags-tooltip
          placeholder="搜索并选择病种"
          style="width: 100%"
          :remote-method="searchDiseases"
          :loading="diseaseLoading"
        >
          <el-option v-for="item in diseaseOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="关联标签" prop="tagIds">
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
      </el-form-item>

      <el-divider content-position="left">内容块</el-divider>
      <div class="blocks-toolbar">
        <el-button type="primary" plain @click="addBlock">
          <el-icon><Plus /></el-icon>
          添加内容块
        </el-button>
        <span class="field-tip">至少保留 1 个内容块；更新时会全量替换 blocks</span>
      </div>

      <div v-for="(block, index) in formData.blocks" :key="index" class="block-item">
        <div class="block-item-header">
          <span>内容块 #{{ index + 1 }}</span>
          <el-button
            link
            type="danger"
            :disabled="formData.blocks.length <= 1"
            @click="removeBlock(index)"
          >
            删除
          </el-button>
        </div>
        <el-row :gutter="12">
          <el-col :span="8">
            <el-form-item
              label="块类型"
              :prop="`blocks.${index}.blockType`"
              :rules="[{ required: true, message: '请选择块类型', trigger: 'change' }]"
              label-width="80px"
            >
              <el-select v-model="block.blockType" style="width: 100%">
                <el-option
                  v-for="item in ARTICLE_BLOCK_TYPE_OPTIONS"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="排序" label-width="60px">
              <el-input-number v-model="block.sortNo" :min="1" :max="999" controls-position="right" />
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="块标题" label-width="80px">
              <el-input v-model="block.title" placeholder="可选" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="块内容" label-width="80px">
          <el-input
            v-model="block.content"
            type="textarea"
            :rows="block.blockType === 'image' ? 2 : 4"
            :placeholder="blockPlaceholder(block.blockType)"
          />
        </el-form-item>
        <el-form-item label="扩展 JSON" label-width="80px">
          <el-input
            v-model="block.extraText"
            type="textarea"
            :rows="2"
            placeholder='可选，如 {"caption":"说明"}'
          />
        </el-form-item>
      </div>

      <el-divider content-position="left">发布设置</el-divider>
      <el-row :gutter="16">
        <el-col :span="8">
          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="formData.status">
              <el-radio v-for="item in ARTICLE_STATUS_OPTIONS" :key="item.value" :value="item.value">
                {{ item.label }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="置顶">
            <el-switch v-model="formData.isTop" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="推荐">
            <el-switch v-model="formData.isRecommend" :active-value="1" :inactive-value="0" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="发布时间">
        <el-date-picker
          v-model="formData.publishTime"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="留空则按后端默认"
          style="width: 260px"
          clearable
        />
      </el-form-item>
      <el-form-item label="作者 ID">
        <el-input-number v-model="formData.authorId" :min="1" controls-position="right" />
      </el-form-item>
      <el-form-item label="来源名称">
        <el-input v-model="formData.sourceName" placeholder="可选" />
      </el-form-item>
      <el-form-item label="来源链接">
        <el-input v-model="formData.sourceUrl" placeholder="https://..." />
      </el-form-item>

      <el-collapse>
        <el-collapse-item title="SEO 设置（可选）" name="seo">
          <el-form-item label="SEO 标题">
            <el-input v-model="formData.seoTitle" />
          </el-form-item>
          <el-form-item label="SEO 关键词">
            <el-input v-model="formData.seoKeywords" />
          </el-form-item>
          <el-form-item label="SEO 描述">
            <el-input v-model="formData.seoDescription" type="textarea" :rows="2" />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import {
  ARTICLE_BLOCK_TYPE_OPTIONS,
  ARTICLE_CONTENT_TYPE_OPTIONS,
  ARTICLE_STATUS_OPTIONS,
  getBlockImageUrl,
  toArticleSubmitPayload,
  type ArticleBlock,
  type ArticleDetail,
  type ArticleStatus,
  type ArticleSubmitPayload,
} from '@/api/knowledge/article'
import { getDiseaseList } from '@/api/knowledge/knowledge'
import type { ArticleTag } from '@/api/knowledge/articleTag'

interface BlockFormItem extends ArticleBlock {
  extraText: string
}

interface Props {
  modelValue: boolean
  isEdit: boolean
  data?: Partial<ArticleDetail> | null
  tagList: ArticleTag[]
}

const props = withDefaults(defineProps<Props>(), {
  data: null,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [payload: ArticleSubmitPayload, id?: number]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const formRef = ref<FormInstance>()
const loading = ref(false)
const diseaseLoading = ref(false)
const diseaseOptions = ref<Array<{ id: number; name: string }>>([])

const createEmptyBlock = (sortNo = 1): BlockFormItem => ({
  blockType: 'text',
  sortNo,
  title: '',
  content: '',
  extra: undefined,
  extraText: '',
})

const formData = reactive({
  id: null as number | null,
  title: '',
  summary: '',
  coverImage: '',
  contentType: 'block',
  authorId: undefined as number | undefined,
  sourceName: '',
  sourceUrl: '',
  status: 0 as ArticleStatus,
  publishTime: '',
  isTop: 0 as 0 | 1,
  isRecommend: 0 as 0 | 1,
  seoTitle: '',
  seoKeywords: '',
  seoDescription: '',
  tagIds: [] as number[],
  diseaseIds: [] as number[],
  blocks: [createEmptyBlock()] as BlockFormItem[],
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入文章标题', trigger: 'blur' }],
}

const blockPlaceholder = (blockType: string) => {
  if (blockType === 'image') return '图片 URL（也可留空，改在扩展 JSON 填 url）'
  if (blockType === 'faq') return 'FAQ 请在扩展 JSON 填写 question / answer'
  if (blockType === 'heading') return '标题文本'
  return '正文内容'
}

const parseExtraText = (extraText: string) => {
  const text = extraText.trim()
  if (!text) return undefined
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('扩展 JSON 格式不正确')
  }
}

const stringifyExtra = (extra: unknown) => {
  if (extra == null || extra === '') return ''
  if (typeof extra === 'string') return extra
  try {
    return JSON.stringify(extra)
  } catch {
    return ''
  }
}

const resetForm = () => {
  formData.id = null
  formData.title = ''
  formData.summary = ''
  formData.coverImage = ''
  formData.contentType = 'block'
  formData.authorId = undefined
  formData.sourceName = ''
  formData.sourceUrl = ''
  formData.status = 0
  formData.publishTime = ''
  formData.isTop = 0
  formData.isRecommend = 0
  formData.seoTitle = ''
  formData.seoKeywords = ''
  formData.seoDescription = ''
  formData.tagIds = []
  formData.diseaseIds = []
  formData.blocks = [createEmptyBlock()]
  diseaseOptions.value = []
}

const fillForm = (detail: Partial<ArticleDetail>) => {
  formData.id = detail.id ?? null
  formData.title = detail.title || ''
  formData.summary = detail.summary || ''
  formData.coverImage = detail.coverImage || ''
  formData.contentType = detail.contentType || 'block'
  formData.authorId = detail.authorId ?? detail.author?.id ?? undefined
  formData.sourceName = detail.sourceName || ''
  formData.sourceUrl = detail.sourceUrl || ''
  formData.status = detail.status ?? 0
  formData.publishTime = detail.publishTime || ''
  formData.isTop = detail.isTop ?? 0
  formData.isRecommend = detail.isRecommend ?? 0
  formData.seoTitle = detail.seoTitle || ''
  formData.seoKeywords = detail.seoKeywords || ''
  formData.seoDescription = detail.seoDescription || ''
  formData.tagIds = detail.tagIds || detail.tags?.map((item) => item.id) || []
  formData.diseaseIds = detail.diseaseIds || detail.diseases?.map((item) => item.id) || []
  formData.blocks =
    detail.blocks?.length
      ? detail.blocks.map((block, index) => {
          const imageUrl = block.blockType === 'image' ? getBlockImageUrl(block) : ''
          return {
            id: block.id,
            blockType: block.blockType,
            sortNo: block.sortNo || index + 1,
            title: block.title || '',
            content: block.blockType === 'image' ? imageUrl : block.content || '',
            extra: block.extra,
            extraText: stringifyExtra(block.extra),
          }
        })
      : [createEmptyBlock()]

  diseaseOptions.value = (detail.diseases || []).map((item) => ({ id: item.id, name: item.name }))
}

const searchDiseases = async (keyword: string) => {
  diseaseLoading.value = true
  try {
    const res = await getDiseaseList({
      page: 1,
      pageSize: 20,
      keyword: keyword || undefined,
      status: 1,
    })
    const selected = diseaseOptions.value.filter((item) => formData.diseaseIds.includes(item.id))
    const fetched = (res.data?.list || []).map((item) => ({ id: item.id, name: item.name }))
    const merged = [...selected]
    fetched.forEach((item) => {
      if (!merged.some((existing) => existing.id === item.id)) merged.push(item)
    })
    diseaseOptions.value = merged
  } finally {
    diseaseLoading.value = false
  }
}

const addBlock = () => {
  formData.blocks.push(createEmptyBlock(formData.blocks.length + 1))
}

const removeBlock = (index: number) => {
  if (formData.blocks.length <= 1) return
  formData.blocks.splice(index, 1)
}

watch(
  () => props.data,
  (detail) => {
    if (detail) {
      fillForm(detail)
      if (formData.diseaseIds.length) searchDiseases('')
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

watch(
  () => props.modelValue,
  (open) => {
    if (open && !props.isEdit && !props.data) {
      resetForm()
    }
  }
)

const handleSubmit = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  let blocks: ArticleBlock[]
  try {
    blocks = formData.blocks.map((block, index) => {
      const extra = parseExtraText(block.extraText)
      const isImage = block.blockType === 'image'
      const content = block.content?.trim() || undefined
      let finalExtra = extra

      if (isImage && content) {
        finalExtra = {
          ...(extra && typeof extra === 'object' ? (extra as Record<string, unknown>) : {}),
          url: content,
        }
      }

      return {
        id: block.id,
        blockType: block.blockType,
        sortNo: block.sortNo || index + 1,
        title: block.title?.trim() || undefined,
        content: isImage ? undefined : content,
        extra: finalExtra ?? undefined,
      }
    })
  } catch {
    ElMessage.error('扩展 JSON 格式不正确')
    return
  }

  const payload = toArticleSubmitPayload({
    title: formData.title,
    summary: formData.summary,
    coverImage: formData.coverImage,
    contentType: formData.contentType,
    authorId: formData.authorId,
    sourceName: formData.sourceName,
    sourceUrl: formData.sourceUrl,
    status: formData.status,
    publishTime: formData.publishTime,
    isTop: formData.isTop,
    isRecommend: formData.isRecommend,
    seoTitle: formData.seoTitle,
    seoKeywords: formData.seoKeywords,
    seoDescription: formData.seoDescription,
    tagIds: formData.tagIds,
    diseaseIds: formData.diseaseIds,
    blocks,
  })

  loading.value = true
  try {
    emit('submit', payload, formData.id ?? undefined)
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
.blocks-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.block-item {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 12px 12px 4px;
  margin-bottom: 12px;
  background: #fafafa;
}

.block-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-weight: 600;
}

.field-tip {
  color: #909399;
  font-size: 12px;
}
</style>
