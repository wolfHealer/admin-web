import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import { getDiseaseList } from '@/api/knowledge/knowledge'
import {
  asNumber,
  asString,
  mapDetailResponse,
  mapListResponse,
  fromDisease,
  normalizeDiseaseList,
  normalizeIdList,
  pickField,
  type DiseaseOption,
  type RawRecord,
} from '@/api/resource/shared/normalize'

export type { DiseaseOption }

export interface RehabInstitutionItem {
  id: number
  name: string
  provinceCode: string
  cityCode: string
  districtCode: string
  provinceName?: string
  cityName?: string
  districtName?: string
  address: string
  contactPhone: string
  contactUrl: string
  qualification?: string
  rehabProjects?: string
  feeStandard?: string
  diseaseIds?: number[]
  diseases?: DiseaseOption[]
  auditStatus: 0 | 1 | 2
  rejectReason?: string
  rating?: number
  status?: string
  createdAt?: string
  updatedAt?: string
  diseaseCount?: number
}

export interface RehabInstitutionListParams {
  page: number
  pageSize: number
  keyword?: string
  provinceCode?: string
  cityCode?: string
  districtCode?: string
  auditStatus?: number | null
  diseaseId?: number | null
}

export interface RehabInstitutionForm {
  id?: number
  name: string
  provinceCode: string
  cityCode: string
  districtCode: string
  provinceName?: string
  cityName?: string
  districtName?: string
  address: string
  contactPhone: string
  contactUrl: string
  qualification?: string
  rehabProjects?: string
  feeStandard?: string
  diseaseIds?: number[]
  auditStatus: number
  rejectReason?: string
}

export interface RegionNode {
  code: string
  name: string
  fullName?: string
  children?: RegionNode[]
}

const normalizeRehabInstitution = (raw: RawRecord): RehabInstitutionItem => {
  const diseases = normalizeDiseaseList(pickField(raw, 'diseases'))
  const diseaseIds = normalizeIdList(pickField(raw, 'diseaseIds', 'disease_ids'))
  return {
    id: asNumber(raw.id),
    name: asString(pickField(raw, 'name')),
    provinceCode: asString(pickField(raw, 'provinceCode', 'province_code')),
    cityCode: asString(pickField(raw, 'cityCode', 'city_code')),
    districtCode: asString(pickField(raw, 'districtCode', 'district_code')),
    provinceName: asString(pickField(raw, 'provinceName', 'province_name')),
    cityName: asString(pickField(raw, 'cityName', 'city_name')),
    districtName: asString(pickField(raw, 'districtName', 'district_name')),
    address: asString(pickField(raw, 'address')),
    contactPhone: asString(pickField(raw, 'contactPhone', 'contact_phone')),
    contactUrl: asString(pickField(raw, 'contactUrl', 'contact_url')),
    qualification: asString(pickField(raw, 'qualification')),
    rehabProjects: asString(pickField(raw, 'rehabProjects', 'rehab_projects')),
    feeStandard: asString(pickField(raw, 'feeStandard', 'fee_standard')),
    diseaseIds: diseaseIds.length ? diseaseIds : diseases.map((d) => d.id),
    diseases,
    diseaseCount: diseases.length || diseaseIds.length,
    auditStatus: asNumber(pickField(raw, 'auditStatus', 'audit_status')) as 0 | 1 | 2,
    rejectReason: asString(pickField(raw, 'rejectReason', 'reject_reason')),
    rating: asNumber(pickField(raw, 'rating')),
    status: asString(pickField(raw, 'status')),
    createdAt: asString(pickField(raw, 'createdAt', 'created_at')),
    updatedAt: asString(pickField(raw, 'updatedAt', 'updated_at')),
  }
}

const toSubmitPayload = (data: RehabInstitutionForm) => ({
  name: data.name,
  provinceCode: data.provinceCode,
  cityCode: data.cityCode,
  districtCode: data.districtCode,
  provinceName: data.provinceName || '',
  cityName: data.cityName || '',
  districtName: data.districtName || '',
  address: data.address,
  contactPhone: data.contactPhone,
  contactUrl: data.contactUrl || '',
  qualification: data.qualification || '',
  rehabProjects: data.rehabProjects || '',
  feeStandard: data.feeStandard || '',
  diseaseIds: data.diseaseIds || [],
  auditStatus: data.auditStatus,
  rejectReason: data.rejectReason || '',
})

export const getRehabInstitutionList = async (
  params: RehabInstitutionListParams
): Promise<ApiResponse<{ list: RehabInstitutionItem[]; total: number }>> => {
  const res = await request.get<{ list?: RawRecord[]; total?: number }>('/resource/rehab/institutions', { params })
  return mapListResponse(res, normalizeRehabInstitution)
}

export const getRehabInstitutionDetail = async (id: number): Promise<ApiResponse<RehabInstitutionItem>> => {
  const res = await request.get<RawRecord>(`/resource/rehab/institutions/${id}`)
  return mapDetailResponse(res, normalizeRehabInstitution)
}

export const addRehabInstitution = (data: RehabInstitutionForm): Promise<ApiResponse<null>> => {
  return request.post('/resource/rehab/institutions', toSubmitPayload(data))
}

export const updateRehabInstitution = (id: number, data: RehabInstitutionForm): Promise<ApiResponse<null>> => {
  return request.put(`/resource/rehab/institutions/${id}`, toSubmitPayload(data))
}

export const deleteRehabInstitution = (id: number): Promise<ApiResponse<null>> => {
  return request.delete(`/resource/rehab/institutions/${id}`)
}

export const getRegionTree = (): Promise<ApiResponse<RegionNode[]>> => {
  return request.get('/region/tree')
}

export async function searchDiseaseOptions(keyword: string): Promise<DiseaseOption[]> {
  const res = await getDiseaseList({ page: 1, pageSize: 20, keyword, status: 1 })
  return (res.data?.list ?? []).map(fromDisease)
}
