import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'

export type ArticleTagStatus = 0 | 1

export interface ArticleTagItem {
  id: number
  name: string
  type: string
  code: string
  sortOrder: number
  status: ArticleTagStatus
  useCount: number
  createdAt: string
  updatedAt: string
}

/** 文章模块使用的精简标签结构 */
export interface ArticleTag {
  id: number
  name: string
  type?: string
  code?: string
}

export interface ArticleTagListParams {
  keyword?: string
  status?: ArticleTagStatus | null
}

export interface ArticleTagSubmitPayload {
  name: string
  type: string
  sortOrder?: number
  status?: ArticleTagStatus
}

type RawRecord = Record<string, unknown>

const trimText = (value: unknown) => String(value ?? '').trim()

const extractTagListPayload = (payload: unknown): RawRecord[] => {
  if (Array.isArray(payload)) return payload as RawRecord[]
  const data = (payload ?? {}) as RawRecord
  const list = data.list ?? data.tags ?? data.records
  return Array.isArray(list) ? (list as RawRecord[]) : []
}

const normalizeArticleTagItem = (item: RawRecord): ArticleTagItem => ({
  id: Number(item.id),
  name: trimText(item.name),
  type: trimText(item.type ?? item.code),
  code: trimText(item.code ?? item.type),
  sortOrder: Number(item.sortOrder ?? item.sort_order ?? 0),
  status: Number(item.status ?? 1) as ArticleTagStatus,
  useCount: Number(item.useCount ?? item.use_count ?? 0),
  createdAt: trimText(item.createdAt ?? item.created_at),
  updatedAt: trimText(item.updatedAt ?? item.updated_at),
})

export const toArticleTagOption = (item: ArticleTagItem | ArticleTag): ArticleTag => ({
  id: item.id,
  name: item.name,
  type: item.type,
  code: item.code ?? item.type,
})

export const getArticleTagList = async (
  params?: ArticleTagListParams
): Promise<ApiResponse<ArticleTagItem[]>> => {
  const res = await request.get<unknown>('/knowledge/articles/tags', {
    params: {
      keyword: params?.keyword || undefined,
      status: params?.status ?? undefined,
    },
  })
  return {
    ...res,
    data: extractTagListPayload(res.data).map(normalizeArticleTagItem),
  }
}

export const getArticleTagDetail = async (id: number): Promise<ApiResponse<ArticleTagItem>> => {
  const res = await request.get<RawRecord>(`/knowledge/articles/tags/${id}`)
  return {
    ...res,
    data: normalizeArticleTagItem(res.data ?? {}),
  }
}

export const createArticleTag = (data: ArticleTagSubmitPayload) => {
  return request.post<null>('/knowledge/articles/tags', data)
}

export const updateArticleTag = (id: number, data: Partial<ArticleTagSubmitPayload>) => {
  return request.put<null>(`/knowledge/articles/tags/${id}`, data)
}

export const deleteArticleTag = (id: number) => {
  return request.delete<null>(`/knowledge/articles/tags/${id}`)
}
