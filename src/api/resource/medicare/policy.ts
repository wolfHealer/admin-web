import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import {
  asNumber,
  asString,
  mapDetailResponse,
  mapListResponse,
  pickField,
  type RawRecord,
} from '@/api/resource/shared/normalize'

export interface PolicyListParams {
  page: number
  pageSize: number
  keyword?: string
  status?: string
  type?: string
}

export interface MedicarePolicyItem {
  id: number
  title: string
  policyType: string
  region: string
  status: number
  uploadTime: string
  content?: string
  fileUrl?: string
}

/** @deprecated 使用 MedicarePolicyItem */
export type MedicarePolicy = MedicarePolicyItem

export interface MedicarePolicyForm {
  id?: number
  title: string
  policyType: string
  region: string
  status: number
  uploadTime?: string
  content?: string
  fileUrl?: string
}

const normalizePolicy = (raw: RawRecord): MedicarePolicyItem => ({
  id: asNumber(raw.id),
  title: asString(pickField(raw, 'title')),
  policyType: asString(pickField(raw, 'policyType', 'policy_type')),
  region: asString(pickField(raw, 'region')),
  status: asNumber(pickField(raw, 'status')),
  uploadTime: asString(pickField(raw, 'uploadTime', 'upload_time')),
  content: asString(pickField(raw, 'content')),
  fileUrl: asString(pickField(raw, 'fileUrl', 'file_url')),
})

const toSubmitPayload = (data: MedicarePolicyForm) => ({
  title: data.title,
  policyType: data.policyType,
  region: data.region,
  status: data.status,
  uploadTime: data.uploadTime || '',
  content: data.content || '',
  fileUrl: data.fileUrl || '',
})

export const getPolicyList = async (
  params: PolicyListParams
): Promise<ApiResponse<{ list: MedicarePolicyItem[]; total: number }>> => {
  const res = await request.get<{ list?: RawRecord[]; total?: number }>('/resource/medicare/policies', { params })
  return mapListResponse(res, normalizePolicy)
}

export const getPolicyDetail = async (id: number): Promise<ApiResponse<MedicarePolicyItem>> => {
  const res = await request.get<RawRecord>(`/resource/medicare/policies/${id}`)
  return mapDetailResponse(res, normalizePolicy)
}

export const addPolicy = (data: MedicarePolicyForm): Promise<ApiResponse<null>> => {
  return request.post('/resource/medicare/policies', toSubmitPayload(data))
}

export const updatePolicy = (id: number, data: MedicarePolicyForm): Promise<ApiResponse<null>> => {
  return request.put(`/resource/medicare/policies/${id}`, toSubmitPayload(data))
}

export const deletePolicy = (id: number): Promise<ApiResponse<null>> => {
  return request.delete(`/resource/medicare/policies/${id}`)
}
