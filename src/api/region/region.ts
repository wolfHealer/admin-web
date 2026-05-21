import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'

export interface RegionItem {
  id?: number
  code: string
  name: string
  fullName: string
  parentCode: string
  level: 1 | 2 | 3
  sort: number
  isEnabled: 0 | 1
  createdAt?: string
  updatedAt?: string
  children?: RegionItem[]
  parentName?: string
}

export interface RegionListParams {
  page: number
  pageSize: number
  keyword?: string
  level?: number | ''
  isEnabled?: number | ''
  parentCode?: string
}

export interface RegionListResponse {
  list: RegionItem[]
  total: number
}

type RawRecord = Record<string, unknown>

const normalizeRegionData = (item: RawRecord): RegionItem => {
  const children = Array.isArray(item.children)
    ? item.children.map((child) => normalizeRegionData(child as RawRecord))
    : []

  return {
    id: item.id as number | undefined,
    code: String(item.code ?? ''),
    name: String(item.name ?? ''),
    fullName: String(item.fullName ?? item.name ?? ''),
    parentCode: String(item.parentCode ?? ''),
    level: Number(item.level ?? 1) as 1 | 2 | 3,
    sort: Number(item.sort ?? 0),
    isEnabled: (item.isEnabled !== undefined
      ? Number(item.isEnabled)
      : item.is_enabled === 1
        ? 1
        : 0) as 0 | 1,
    createdAt: String(item.createdAt ?? item.created_at ?? ''),
    updatedAt: String(item.updatedAt ?? item.updated_at ?? ''),
    children,
    parentName: String(item.parentName ?? item.parent_name ?? ''),
  }
}

export const getRegionList = async (
  params: RegionListParams
): Promise<ApiResponse<RegionListResponse>> => {
  const res = await request<RegionListResponse>({
    url: '/region/list',
    method: 'get',
    params,
  })
  const payload = (res.data ?? {}) as unknown as RawRecord & { list?: RawRecord[]; total?: number }
  const list = (payload.list as RawRecord[] | undefined) ?? []
  return {
    ...res,
    data: {
      list: list.map(normalizeRegionData),
      total: Number(payload.total ?? list.length),
    },
  }
}

export const getRegionTree = async (): Promise<ApiResponse<RegionItem[]>> => {
  const res = await request<RegionItem[]>({
    url: '/region/tree',
    method: 'get',
  })
  const list = Array.isArray(res.data) ? res.data : []
  return {
    ...res,
    data: list.map((item) => normalizeRegionData(item as unknown as RawRecord)),
  }
}

export const getRegionDetail = async (id: number): Promise<ApiResponse<RegionItem>> => {
  const res = await request<RegionItem>({
    url: `/region/${id}`,
    method: 'get',
  })
  return {
    ...res,
    data: normalizeRegionData((res.data ?? {}) as unknown as RawRecord),
  }
}

export const addRegion = (data: Partial<RegionItem>) => {
  const payload = {
    ...data,
    fullName: data.fullName,
    parentCode: data.parentCode,
    isEnabled: data.isEnabled,
  }

  return request<null>({
    url: '/region',
    method: 'post',
    data: payload,
  })
}

export const updateRegion = (id: number, data: Partial<RegionItem>) => {
  const payload = {
    ...data,
    fullName: data.fullName,
    parentCode: data.parentCode,
    isEnabled: data.isEnabled,
  }

  return request<null>({
    url: `/region/${id}`,
    method: 'put',
    data: payload,
  })
}

export const deleteRegion = (id: number) => {
  return request<null>({
    url: `/region/${id}`,
    method: 'delete',
  })
}

export const updateRegionStatus = (id: number, is_enabled: 0 | 1) => {
  return request<null>({
    url: `/region/${id}/status`,
    method: 'patch',
    data: { isEnabled: is_enabled },
  })
}
