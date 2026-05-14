

import request from '@/utils/request'

export interface ApiResponse<T = any> {
  code: number
  data: T
  message?: string
  msg?: string
}

export interface DiseaseOption {
  id: number
  name: string
  alias?: string
}

export interface RareDrugItem {
  id: number
  genericName: string
  brandName?: string
  indication: string
  dosageForm: string
  spec: string
  refPrice: number | string
  drugType: 'origin_import' | 'origin_domestic' | 'generic' | 'other' | ''
  isInsurance: 0 | 1
  hasRelief: 0 | 1
  isLaunched: 0 | 1
  needPrescription: 0 | 1
  manualOriginal?: string
  manualPopular?: string
  auditStatus: 0 | 1 | 2
  rejectReason?: string
  diseaseCount?: number
  diseaseIds?: number[]
  diseases?: DiseaseOption[]
  createdAt?: string
  updatedAt?: string
}

export interface RareDrugListParams {
  page: number
  pageSize: number
  keyword?: string
  drugType?: string
  isInsurance?: number | ''
  hasRelief?: number | ''
  isLaunched?: number | ''
  auditStatus?: number | ''
  diseaseIds?: number | ''
}

export interface RareDrugSubmitPayload {
  genericName: string
  brandName?: string
  indication: string
  dosageForm: string
  spec: string
  refPrice: number | string
  drugType: string
  isInsurance: number
  hasRelief: number
  isLaunched: number
  needPrescription: number
  manualOriginal?: string
  manualPopular?: string
  auditStatus: number
  rejectReason?: string
  diseaseIds: number[]
}

export const getRareDrugList = (params: RareDrugListParams) => {
  return request.get('/resource/drug/drugs', { params }) as Promise<ApiResponse<{ list: RareDrugItem[]; total: number }>>
}

export const getRareDrugDetail = (id: number | string) => {
  return request.get(`/resource/drug/drugs/${id}`) as Promise<ApiResponse<RareDrugItem>>
}

export const addRareDrug = (data: RareDrugSubmitPayload) => {
  return request.post('/resource/drug/drugs', data) as Promise<ApiResponse>
}

export const updateRareDrug = (id: number | string, data: RareDrugSubmitPayload) => {
  return request.put(`/resource/drug/drugs/${id}`, data) as Promise<ApiResponse>
}

export const deleteRareDrug = (id: number | string) => {
  return request.delete(`/resource/drug/drugs/${id}`) as Promise<ApiResponse>
}
