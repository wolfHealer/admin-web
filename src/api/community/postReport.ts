import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import { getPostDetail, type PostItem } from './post'

export type ReportReasonType = 'spam' | 'abuse' | 'illegal' | 'misinfo' | 'other'
export type ReportStatus = 0 | 1 | 2

export interface PostReportListParams {
  page: number
  pageSize: number
  keyword?: string
  status?: ReportStatus | ''
  reasonType?: ReportReasonType | ''
}

export interface PostReportItem {
  id: number
  postId: number
  reporterId: number
  reasonType: ReportReasonType
  description: string
  status: ReportStatus
  handledAt: string
  handlerId: number | null
  handleNote: string
  createdAt: string
  reporterName: string
  reporterPhone: string
  handlerName: string
  postTitle: string
  postContent: string
  postAuthorName: string
}

export interface PostReportListResponse {
  list: PostReportItem[]
  total: number
}

export interface HandlePostReportPayload {
  status: 1 | 2
  handleNote?: string
  /** 确认违规时是否下架/删除帖子 */
  removePost?: boolean
}

type RawRecord = Record<string, unknown>

const normalizeReport = (item: RawRecord): PostReportItem => ({
  id: Number(item.id),
  postId: Number(item.post_id ?? item.postId ?? 0),
  reporterId: Number(item.reporter_id ?? item.reporterId ?? 0),
  reasonType: String(item.reason_type ?? item.reasonType ?? 'other') as ReportReasonType,
  description: String(item.description ?? ''),
  status: Number(item.status ?? 0) as ReportStatus,
  handledAt: String(item.handled_at ?? item.handledAt ?? ''),
  handlerId:
    item.handler_id != null || item.handlerId != null
      ? Number(item.handler_id ?? item.handlerId)
      : null,
  handleNote: String(item.handle_note ?? item.handleNote ?? ''),
  createdAt: String(item.created_at ?? item.createdAt ?? ''),
  reporterName: String(item.reporter_name ?? item.reporterName ?? ''),
  reporterPhone: String(item.reporter_phone ?? item.reporterPhone ?? ''),
  handlerName: String(item.handler_name ?? item.handlerName ?? ''),
  postTitle: String(item.post_title ?? item.postTitle ?? ''),
  postContent: String(item.post_content ?? item.postContent ?? ''),
  postAuthorName: String(item.post_author_name ?? item.postAuthorName ?? ''),
})

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

const toListQueryParams = (params: PostReportListParams) => ({
  page: params.page,
  pageSize: params.pageSize,
  limit: params.pageSize,
  keyword: params.keyword || undefined,
  status: params.status === '' ? undefined : params.status,
  reasonType: params.reasonType === '' ? undefined : params.reasonType,
})

export const REPORT_REASON_OPTIONS: Array<{ label: string; value: ReportReasonType }> = [
  { label: '垃圾广告', value: 'spam' },
  { label: '辱骂攻击', value: 'abuse' },
  { label: '违法违规', value: 'illegal' },
  { label: '虚假信息', value: 'misinfo' },
  { label: '其他', value: 'other' },
]

export const REPORT_STATUS_OPTIONS: Array<{ label: string; value: ReportStatus; tag: '' | 'warning' | 'success' | 'info' }> = [
  { label: '待处理', value: 0, tag: 'warning' },
  { label: '已处理', value: 1, tag: 'success' },
  { label: '已驳回', value: 2, tag: 'info' },
]

export const getReportReasonLabel = (type: ReportReasonType) =>
  REPORT_REASON_OPTIONS.find((item) => item.value === type)?.label ?? type

export const getReportStatusMeta = (status: ReportStatus) =>
  REPORT_STATUS_OPTIONS.find((item) => item.value === status) ?? REPORT_STATUS_OPTIONS[0]

export const getPostReportList = async (
  params: PostReportListParams
): Promise<ApiResponse<PostReportListResponse>> => {
  const res = await request.get<unknown>('/community/post-reports', {
    params: toListQueryParams(params),
  })
  const { list, total } = extractListPayload(res.data)
  return {
    ...res,
    data: {
      list: list.map(normalizeReport),
      total,
    },
  }
}

export const getPostReportDetail = async (id: number): Promise<ApiResponse<PostReportItem>> => {
  const res = await request.get<RawRecord>(`/community/post-reports/${id}`)
  return {
    ...res,
    data: normalizeReport(res.data ?? {}),
  }
}

export const handlePostReport = (id: number, data: HandlePostReportPayload) => {
  return request.put<null>(`/community/post-reports/${id}/handle`, data)
}

export const loadReportPostDetail = async (postId: number): Promise<PostItem | null> => {
  try {
    const res = await getPostDetail(postId)
    return res.data
  } catch {
    return null
  }
}
