import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import { getDiseaseList } from '@/api/knowledge/knowledge'
import {
  asFlag,
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

export interface RegionTreeNode {
  code: string
  name: string
  fullName?: string
  children?: RegionTreeNode[]
}

export interface PsychOrgDiseaseItem {
  id: number
  name: string
  alias?: string
}

export interface PsychOrgItem {
  id: number
  name: string
  provinceCode?: string
  cityCode?: string
  districtCode?: string
  provinceName?: string
  cityName?: string
  districtName?: string
  address?: string
  contactPhone?: string
  contactUrl?: string
  isFree?: 0 | 1 | null
  consultWay?: 'online' | 'offline' | 'both' | ''
  contentIntro: string
  auditStatus: 0 | 1 | 2
  rejectReason?: string
  diseaseIds?: number[]
  diseases?: PsychOrgDiseaseItem[]
  diseaseCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface PsychOrgListParams {
  page: number
  pageSize: number
  keyword?: string
  consultWay?: 'online' | 'offline' | 'both' | ''
  isFree?: 0 | 1 | ''
  auditStatus?: number | ''
  provinceCode?: string
  cityCode?: string
  districtCode?: string
  diseaseId?: number | ''
}

export interface PsychOrgForm {
  id?: number
  name: string
  provinceCode?: string
  cityCode?: string
  districtCode?: string
  provinceName?: string
  cityName?: string
  districtName?: string
  address?: string
  contactPhone?: string
  contactUrl?: string
  isFree?: 0 | 1 | null
  consultWay?: 'online' | 'offline' | 'both' | ''
  contentIntro: string
  auditStatus: number
  rejectReason?: string
  diseaseIds?: number[]
}

export interface PsychResourceItem {
  id: number
  diseaseId: number
  diseaseName?: string
  resourceType: 'guide' | 'manual' | 'hotline' | 'online_resource' | ''
  name: string
  contentIntro: string
  guidePdf?: string
  manualPatient?: string
  manualFamily?: string
  contactPhone?: string
  contactUrl?: string
  auditStatus: 0 | 1 | 2
  rejectReason?: string
  createdAt?: string
  updatedAt?: string
}

export interface PsychResourceListParams {
  page: number
  pageSize: number
  keyword?: string
  resourceType?: 'guide' | 'manual' | 'hotline' | 'online_resource' | ''
  diseaseId?: number | ''
  auditStatus?: number | ''
}

export interface PsychResourceForm {
  id?: number
  diseaseId: number
  resourceType: 'guide' | 'manual' | 'hotline' | 'online_resource' | ''
  name: string
  contentIntro: string
  guidePdf?: string
  manualPatient?: string
  manualFamily?: string
  contactPhone?: string
  contactUrl?: string
  auditStatus: number
  rejectReason?: string
}

const normalizePsychOrg = (raw: RawRecord): PsychOrgItem => {
  const diseases = normalizeDiseaseList(pickField(raw, 'diseases'))
  const diseaseIds = normalizeIdList(pickField(raw, 'diseaseIds', 'disease_ids'))
  const isFreeRaw = pickField(raw, 'isFree', 'is_free')
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
    isFree: isFreeRaw === null || isFreeRaw === undefined ? null : asFlag(isFreeRaw),
    consultWay: asString(pickField(raw, 'consultWay', 'consult_way')) as PsychOrgItem['consultWay'],
    contentIntro: asString(pickField(raw, 'contentIntro', 'content_intro')),
    auditStatus: asNumber(pickField(raw, 'auditStatus', 'audit_status')) as 0 | 1 | 2,
    rejectReason: asString(pickField(raw, 'rejectReason', 'reject_reason')),
    diseaseIds: diseaseIds.length ? diseaseIds : diseases.map((d) => d.id),
    diseases,
    diseaseCount: diseases.length || diseaseIds.length,
    createdAt: asString(pickField(raw, 'createdAt', 'created_at')),
    updatedAt: asString(pickField(raw, 'updatedAt', 'updated_at')),
  }
}

const toPsychOrgPayload = (data: PsychOrgForm) => ({
  name: data.name,
  provinceCode: data.provinceCode || '',
  cityCode: data.cityCode || '',
  districtCode: data.districtCode || '',
  provinceName: data.provinceName || '',
  cityName: data.cityName || '',
  districtName: data.districtName || '',
  address: data.address || '',
  contactPhone: data.contactPhone || '',
  contactUrl: data.contactUrl || '',
  isFree: data.isFree ?? null,
  consultWay: data.consultWay || '',
  contentIntro: data.contentIntro,
  auditStatus: data.auditStatus,
  rejectReason: data.rejectReason || '',
  diseaseIds: data.diseaseIds || [],
})

const normalizePsychResource = (raw: RawRecord): PsychResourceItem => ({
  id: asNumber(raw.id),
  diseaseId: asNumber(pickField(raw, 'diseaseId', 'disease_id')),
  diseaseName: asString(pickField(raw, 'diseaseName', 'disease_name')),
  resourceType: asString(pickField(raw, 'resourceType', 'resource_type')) as PsychResourceItem['resourceType'],
  name: asString(pickField(raw, 'name')),
  contentIntro: asString(pickField(raw, 'contentIntro', 'content_intro')),
  guidePdf: asString(pickField(raw, 'guidePdf', 'guide_pdf')),
  manualPatient: asString(pickField(raw, 'manualPatient', 'manual_patient')),
  manualFamily: asString(pickField(raw, 'manualFamily', 'manual_family')),
  contactPhone: asString(pickField(raw, 'contactPhone', 'contact_phone')),
  contactUrl: asString(pickField(raw, 'contactUrl', 'contact_url')),
  auditStatus: asNumber(pickField(raw, 'auditStatus', 'audit_status')) as 0 | 1 | 2,
  rejectReason: asString(pickField(raw, 'rejectReason', 'reject_reason')),
  createdAt: asString(pickField(raw, 'createdAt', 'created_at')),
  updatedAt: asString(pickField(raw, 'updatedAt', 'updated_at')),
})

const toPsychResourcePayload = (data: PsychResourceForm) => ({
  diseaseId: data.diseaseId,
  resourceType: data.resourceType,
  name: data.name,
  contentIntro: data.contentIntro,
  guidePdf: data.guidePdf || '',
  manualPatient: data.manualPatient || '',
  manualFamily: data.manualFamily || '',
  contactPhone: data.contactPhone || '',
  contactUrl: data.contactUrl || '',
  auditStatus: data.auditStatus,
  rejectReason: data.rejectReason || '',
})

export const getPsychOrgList = async (
  params: PsychOrgListParams
): Promise<ApiResponse<{ list: PsychOrgItem[]; total: number }>> => {
  const res = await request.get<{ list?: RawRecord[]; total?: number }>('/resource/rehab/psychological/orgs', { params })
  return mapListResponse(res, normalizePsychOrg)
}

export const getPsychOrgDetail = async (id: number): Promise<ApiResponse<PsychOrgItem>> => {
  const res = await request.get<RawRecord>(`/resource/rehab/psychological/orgs/${id}`)
  return mapDetailResponse(res, normalizePsychOrg)
}

export const addPsychOrg = (data: PsychOrgForm): Promise<ApiResponse<null>> => {
  return request.post('/resource/rehab/psychological/orgs', toPsychOrgPayload(data))
}

export const updatePsychOrg = (id: number, data: PsychOrgForm): Promise<ApiResponse<null>> => {
  return request.put(`/resource/rehab/psychological/orgs/${id}`, toPsychOrgPayload(data))
}

export const deletePsychOrg = (id: number): Promise<ApiResponse<null>> => {
  return request.delete(`/resource/rehab/psychological/orgs/${id}`)
}

export const getPsychResourceList = async (
  params: PsychResourceListParams
): Promise<ApiResponse<{ list: PsychResourceItem[]; total: number }>> => {
  const res = await request.get<{ list?: RawRecord[]; total?: number }>('/resource/rehab/psychological/resources', { params })
  return mapListResponse(res, normalizePsychResource)
}

export const getPsychResourceDetail = async (id: number): Promise<ApiResponse<PsychResourceItem>> => {
  const res = await request.get<RawRecord>(`/resource/rehab/psychological/resources/${id}`)
  return mapDetailResponse(res, normalizePsychResource)
}

export const addPsychResource = (data: PsychResourceForm): Promise<ApiResponse<null>> => {
  return request.post('/resource/rehab/psychological/resources', toPsychResourcePayload(data))
}

export const updatePsychResource = (id: number, data: PsychResourceForm): Promise<ApiResponse<null>> => {
  return request.put(`/resource/rehab/psychological/resources/${id}`, toPsychResourcePayload(data))
}

export const deletePsychResource = (id: number): Promise<ApiResponse<null>> => {
  return request.delete(`/resource/rehab/psychological/resources/${id}`)
}

export const searchDiseaseOptions = async (keyword = ''): Promise<DiseaseOption[]> => {
  const res = await getDiseaseList({ page: 1, pageSize: 20, keyword, status: 1 })
  return (res.data?.list ?? []).map(fromDisease)
}

export const getRegionTree = (): Promise<ApiResponse<RegionTreeNode[]>> => {
  return request.get('/region/tree')
}
