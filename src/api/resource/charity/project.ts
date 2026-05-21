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

export interface ReliefProjectItem {
  id?: number
  name: string
  organizer: string
  reliefType: string
  applyCondition: string
  reliefStandard: string
  applyDeadline?: string
  applyDifficulty: string
  applyProcess: string
  applyForm?: string
  applyGuide?: string
  materialList?: string
  contactPhone?: string
  contactUrl?: string
  auditStatus: number
  rejectReason?: string
  sort: number
  createdAt?: string
  updatedAt?: string
  diseaseIds?: number[]
  diseases?: DiseaseOption[]
}

export interface ReliefProjectListParams {
  page: number
  pageSize: number
  keyword?: string
  reliefType?: string
  applyDifficulty?: string
  auditStatus?: number | ''
  diseaseId?: number | ''
}

export interface ReliefProjectForm {
  id?: number
  name: string
  organizer: string
  reliefType: string
  applyCondition: string
  reliefStandard: string
  applyDeadline?: string
  applyDifficulty: string
  applyProcess: string
  applyForm?: string
  applyGuide?: string
  materialList?: string
  contactPhone?: string
  contactUrl?: string
  auditStatus: number
  rejectReason?: string
  sort: number
  diseaseIds?: number[]
}

const normalizeReliefProject = (raw: RawRecord): ReliefProjectItem => {
  const diseases = normalizeDiseaseList(pickField(raw, 'diseases'))
  const diseaseIds = normalizeIdList(pickField(raw, 'diseaseIds', 'disease_ids'))
  return {
    id: raw.id !== undefined ? asNumber(raw.id) : undefined,
    name: asString(pickField(raw, 'name')),
    organizer: asString(pickField(raw, 'organizer')),
    reliefType: asString(pickField(raw, 'reliefType', 'relief_type') || pickField(raw, 'type')),
    applyCondition: asString(pickField(raw, 'applyCondition', 'apply_condition')),
    reliefStandard: asString(pickField(raw, 'reliefStandard', 'relief_standard')),
    applyDeadline: asString(pickField(raw, 'applyDeadline', 'apply_deadline')),
    applyDifficulty: asString(pickField(raw, 'applyDifficulty', 'apply_difficulty')),
    applyProcess: asString(pickField(raw, 'applyProcess', 'apply_process')),
    applyForm: asString(pickField(raw, 'applyForm', 'apply_form')),
    applyGuide: asString(pickField(raw, 'applyGuide', 'apply_guide')),
    materialList: asString(pickField(raw, 'materialList', 'material_list')),
    contactPhone: asString(pickField(raw, 'contactPhone', 'contact_phone')),
    contactUrl: asString(pickField(raw, 'contactUrl', 'contact_url')),
    auditStatus: asNumber(pickField(raw, 'auditStatus', 'audit_status')),
    rejectReason: asString(pickField(raw, 'rejectReason', 'reject_reason')),
    sort: asNumber(pickField(raw, 'sort')),
    diseaseIds: diseaseIds.length ? diseaseIds : diseases.map((d) => d.id),
    diseases,
    createdAt: asString(pickField(raw, 'createdAt', 'created_at')),
    updatedAt: asString(pickField(raw, 'updatedAt', 'updated_at')),
  }
}

const toSubmitPayload = (data: ReliefProjectForm) => {
  const payload: Record<string, unknown> = {
    name: data.name,
    organizer: data.organizer,
    reliefType: data.reliefType,
    applyCondition: data.applyCondition,
    reliefStandard: data.reliefStandard,
    applyDeadline: data.applyDeadline || '',
    applyDifficulty: data.applyDifficulty,
    applyProcess: data.applyProcess,
    applyForm: data.applyForm || '',
    applyGuide: data.applyGuide || '',
    materialList: data.materialList || '',
    contactPhone: data.contactPhone || '',
    contactUrl: data.contactUrl || '',
    auditStatus: data.auditStatus,
    rejectReason: data.rejectReason || '',
    sort: data.sort,
    diseaseIds: data.diseaseIds || [],
  }
  return payload
}

export const getReliefProjectList = async (
  params: ReliefProjectListParams
): Promise<ApiResponse<{ list: ReliefProjectItem[]; total: number }>> => {
  const res = await request.get<{ list?: RawRecord[]; total?: number }>('/resource/charity/projects', { params })
  return mapListResponse(res, normalizeReliefProject)
}

export const getReliefProjectDetail = async (id: number): Promise<ApiResponse<ReliefProjectItem>> => {
  const res = await request.get<RawRecord>(`/resource/charity/projects/${id}`)
  return mapDetailResponse(res, normalizeReliefProject)
}

export const addReliefProject = (data: ReliefProjectForm): Promise<ApiResponse<null>> => {
  return request.post('/resource/charity/projects', toSubmitPayload(data))
}

export const updateReliefProject = (id: number, data: ReliefProjectForm): Promise<ApiResponse<null>> => {
  return request.put(`/resource/charity/projects/${id}`, toSubmitPayload(data))
}

export const deleteReliefProject = (id: number): Promise<ApiResponse<null>> => {
  return request.delete(`/resource/charity/projects/${id}`)
}

export const searchDiseaseOptions = async (keyword = ''): Promise<DiseaseOption[]> => {
  const res = await getDiseaseList({ page: 1, pageSize: 20, keyword, status: 1 })
  return (res.data?.list ?? []).map(fromDisease)
}
