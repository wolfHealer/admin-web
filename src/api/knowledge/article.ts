import type { ArticleTag } from './articleTag'
import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
export type { ArticleTag } from './articleTag'

/** 0 草稿 1 待发布 2 已发布（以后端约定为准） */
export type ArticleStatus = 0 | 1 | 2

export interface ArticleBlock {
  id?: number
  blockType: string
  sortNo: number
  title?: string
  content?: string
  extra?: Record<string, unknown> | null
}

export interface ArticleAuthor {
  id: number
  displayName: string
  avatar: string
}

export interface ArticleDiseaseOption {
  id: number
  name: string
}

export interface ArticleListItem {
  id: number
  title: string
  summary: string
  coverImage: string
  contentType: string
  status: ArticleStatus
  publishTime: string
  isTop: 0 | 1
  isRecommend: 0 | 1
  viewCount: number
  likeCount: number
  favoriteCount: number
  createdAt: string
  updatedAt: string
  tags: ArticleTag[]
  diseases: ArticleDiseaseOption[]
}

export interface ArticleDetail extends ArticleListItem {
  authorId: number | null
  author: ArticleAuthor | null
  sourceName: string
  sourceUrl: string
  seoTitle: string
  seoKeywords: string
  seoDescription: string
  blocks: ArticleBlock[]
  tagIds: number[]
  diseaseIds: number[]
}

export interface ArticleListParams {
  page: number
  pageSize: number
  keyword?: string
  status?: ArticleStatus | null
  tagId?: number | null
}

export interface ArticleListResponse {
  list: ArticleListItem[]
  total: number
}

export interface ArticleSubmitPayload {
  title: string
  summary?: string
  coverImage?: string
  contentType?: string
  authorId?: number
  sourceName?: string
  sourceUrl?: string
  status?: ArticleStatus
  publishTime?: string
  isTop?: 0 | 1
  isRecommend?: 0 | 1
  seoTitle?: string
  seoKeywords?: string
  seoDescription?: string
  blocks: ArticleBlock[]
  tagIds?: number[]
  diseaseIds?: number[]
}

export const ARTICLE_BLOCK_TYPE_OPTIONS = [
  { label: '文本', value: 'text' },
  { label: '段落', value: 'paragraph' },
  { label: '标题', value: 'heading' },
  { label: '图片', value: 'image' },
  { label: 'FAQ', value: 'faq' },
  { label: '引用', value: 'quote' },
  { label: '列表', value: 'list' },
] as const

export const ARTICLE_CONTENT_TYPE_OPTIONS = [
  { label: '块内容', value: 'block' },
  { label: '富文本块', value: 'rich' },
  { label: '图文', value: 'article' },
] as const

export const ARTICLE_STATUS_OPTIONS: Array<{
  label: string
  value: ArticleStatus
  tag: '' | 'success' | 'warning' | 'info'
}> = [
  { label: '草稿', value: 0, tag: 'info' },
  { label: '待发布', value: 1, tag: 'warning' },
  { label: '已发布', value: 2, tag: 'success' },
]

type RawRecord = Record<string, unknown>

const trimText = (value: unknown) => String(value ?? '').trim()

const trimUrl = (value: unknown) => String(value ?? '').replace(/\s/g, '')

const asExtraRecord = (value: unknown): Record<string, unknown> | null => {
  if (value == null) return null
  if (typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>
  return null
}

export const getArticleStatusMeta = (status: number) =>
  ARTICLE_STATUS_OPTIONS.find((item) => item.value === status) ?? {
    label: `状态${status}`,
    value: status as ArticleStatus,
    tag: 'info' as const,
  }

export const getBlockTypeLabel = (type?: string) =>
  ARTICLE_BLOCK_TYPE_OPTIONS.find((item) => item.value === type)?.label || type || '未知'

/** 图片块 URL 可能在 content 或 extra.url */
export const getBlockImageUrl = (block: ArticleBlock) => {
  const content = trimUrl(block.content)
  if (content) return content
  const extra = asExtraRecord(block.extra)
  return trimUrl(extra?.url)
}

export const isTextLikeBlock = (blockType: string) =>
  ['text', 'paragraph', 'heading', 'quote', 'list'].includes(blockType)

export const getContentTypeLabel = (contentType?: string) =>
  ARTICLE_CONTENT_TYPE_OPTIONS.find((item) => item.value === contentType)?.label ||
  contentType ||
  '-'

const normalizeBlock = (item: RawRecord): ArticleBlock => ({
  id: item.id != null ? Number(item.id) : undefined,
  blockType: String(item.blockType ?? item.block_type ?? 'text'),
  sortNo: Number(item.sortNo ?? item.sort_no ?? 0),
  title: trimText(item.title),
  content: trimText(item.content),
  extra: asExtraRecord(item.extra),
})

const normalizeTag = (item: RawRecord): ArticleTag => ({
  id: Number(item.id),
  name: trimText(item.name),
  type: trimText(item.type) || undefined,
  code: trimText(item.code || item.type),
})

const normalizeAuthor = (item: RawRecord): ArticleAuthor => ({
  id: Number(item.id),
  displayName: trimText(item.displayName ?? item.display_name),
  avatar: trimUrl(item.avatar),
})

const normalizeDiseaseOption = (item: RawRecord): ArticleDiseaseOption => ({
  id: Number(item.id),
  name: trimText(item.name),
})

const normalizeArticleListItem = (item: RawRecord): ArticleListItem => ({
  id: Number(item.id),
  title: trimText(item.title),
  summary: trimText(item.summary),
  coverImage: trimUrl(item.coverImage ?? item.cover_image),
  contentType: trimText(item.contentType ?? item.content_type) || 'block',
  status: Number(item.status ?? 0) as ArticleStatus,
  publishTime: trimText(item.publishTime ?? item.publish_time),
  isTop: Number(item.isTop ?? item.is_top ?? 0) as 0 | 1,
  isRecommend: Number(item.isRecommend ?? item.is_recommend ?? 0) as 0 | 1,
  viewCount: Number(item.viewCount ?? item.view_count ?? 0),
  likeCount: Number(item.likeCount ?? item.like_count ?? 0),
  favoriteCount: Number(item.favoriteCount ?? item.favorite_count ?? 0),
  createdAt: trimText(item.createdAt ?? item.created_at),
  updatedAt: trimText(item.updatedAt ?? item.updated_at),
  tags: Array.isArray(item.tags) ? item.tags.map((tag) => normalizeTag(tag as RawRecord)) : [],
  diseases: Array.isArray(item.diseases)
    ? item.diseases.map((disease) => normalizeDiseaseOption(disease as RawRecord))
    : [],
})

const normalizeArticleDetail = (item: RawRecord): ArticleDetail => {
  const base = normalizeArticleListItem(item)
  const tagIds = Array.isArray(item.tagIds)
    ? item.tagIds.map(Number)
    : Array.isArray(item.tag_ids)
      ? (item.tag_ids as unknown[]).map(Number)
      : base.tags.map((tag) => tag.id)

  const diseaseIds = Array.isArray(item.diseaseIds)
    ? item.diseaseIds.map(Number)
    : Array.isArray(item.disease_ids)
      ? (item.disease_ids as unknown[]).map(Number)
      : base.diseases.map((disease) => disease.id)

  return {
    ...base,
    authorId:
      item.authorId != null || item.author_id != null
        ? Number(item.authorId ?? item.author_id)
        : item.author && typeof item.author === 'object'
          ? Number((item.author as RawRecord).id)
          : null,
    author:
      item.author && typeof item.author === 'object'
        ? normalizeAuthor(item.author as RawRecord)
        : null,
    sourceName: trimText(item.sourceName ?? item.source_name),
    sourceUrl: trimUrl(item.sourceUrl ?? item.source_url),
    seoTitle: trimText(item.seoTitle ?? item.seo_title),
    seoKeywords: trimText(item.seoKeywords ?? item.seo_keywords),
    seoDescription: trimText(item.seoDescription ?? item.seo_description),
    blocks: Array.isArray(item.blocks) ? item.blocks.map((block) => normalizeBlock(block as RawRecord)) : [],
    tagIds,
    diseaseIds,
  }
}

const extractListPayload = (payload: unknown): { list: RawRecord[]; total: number } => {
  if (Array.isArray(payload)) {
    return { list: payload as RawRecord[], total: payload.length }
  }
  const data = (payload ?? {}) as RawRecord
  const list = (data.list ?? data.records ?? []) as RawRecord[]
  return {
    list,
    total: Number(data.total ?? list.length),
  }
}

const toListQueryParams = (params: ArticleListParams) => ({
  page: params.page,
  pageSize: params.pageSize,
  keyword: params.keyword || undefined,
  status: params.status ?? undefined,
  tagId: params.tagId ?? undefined,
})

export const getArticleList = async (
  params: ArticleListParams
): Promise<ApiResponse<ArticleListResponse>> => {
  const res = await request.get<unknown>('/knowledge/articles', {
    params: toListQueryParams(params),
  })
  const { list, total } = extractListPayload(res.data)
  return {
    ...res,
    data: {
      list: list.map(normalizeArticleListItem),
      total,
    },
  }
}

export const getArticleDetail = async (id: number): Promise<ApiResponse<ArticleDetail>> => {
  const res = await request.get<RawRecord>(`/knowledge/article/${id}`)
  return {
    ...res,
    data: normalizeArticleDetail(res.data ?? {}),
  }
}

export const createArticle = (data: ArticleSubmitPayload) => {
  return request.post<{ id: number }>('/knowledge/article', data)
}

export const updateArticle = (id: number, data: Partial<ArticleSubmitPayload>) => {
  return request.put<null>(`/knowledge/article/${id}`, data)
}

export const deleteArticle = (id: number) => {
  return request.delete<null>(`/knowledge/article/${id}`)
}

export const toArticleSubmitPayload = (form: ArticleSubmitPayload): ArticleSubmitPayload => ({
  title: form.title.trim(),
  summary: form.summary?.trim() || undefined,
  coverImage: form.coverImage?.trim() || undefined,
  contentType: form.contentType || 'block',
  authorId: form.authorId || undefined,
  sourceName: form.sourceName?.trim() || undefined,
  sourceUrl: form.sourceUrl?.trim() || undefined,
  status: form.status ?? 0,
  publishTime: form.publishTime || undefined,
  isTop: form.isTop ?? 0,
  isRecommend: form.isRecommend ?? 0,
  seoTitle: form.seoTitle?.trim() || undefined,
  seoKeywords: form.seoKeywords?.trim() || undefined,
  seoDescription: form.seoDescription?.trim() || undefined,
  blocks: form.blocks.map((block, index) => ({
    blockType: block.blockType,
    sortNo: block.sortNo || index + 1,
    title: block.title?.trim() || undefined,
    content: block.content?.trim() || undefined,
    extra: block.extra ?? undefined,
  })),
  tagIds: form.tagIds ?? [],
  diseaseIds: form.diseaseIds ?? [],
})
