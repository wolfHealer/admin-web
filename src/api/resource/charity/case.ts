import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import { getDiseaseList } from '@/api/knowledge/knowledge'
import {
  asNumber,
  asString,
  mapDetailResponse,
  mapListResponse,
  fromDisease,
  pickField,
  unwrapList,
  type DiseaseOption,
  type RawRecord,
} from '@/api/resource/shared/normalize'

export type { DiseaseOption }

export interface ReliefProjectOption {
  id: number
  name: string
}

export interface ReliefCaseItem {
  id: number
  diseaseId: number
  diseaseName?: string
  projectId: number
  projectName?: string
  caseTitle: string
  patientDesc: string
  applyCycle: string
  actualRelief: string
  experience: string
  pitfallGuide: string
  casePdf?: string
  materialTemplate?: string
  auditStatus: 0 | 1 | 2
  rejectReason?: string
  createdAt?: string
  updatedAt?: string
}

export interface ReliefCaseListParams {
  page: number
  pageSize: number
  keyword?: string
  diseaseId?: number | ''
  projectId?: number | ''
  auditStatus?: number | ''
}

export interface ReliefCaseForm {
  id?: number
  diseaseId: number
  projectId: number
  caseTitle: string
  patientDesc: string
  applyCycle: string
  actualRelief: string
  experience: string
  pitfallGuide: string
  casePdf?: string
  materialTemplate?: string
  auditStatus: number
  rejectReason?: string
}

const normalizeReliefCase = (raw: RawRecord): ReliefCaseItem => ({
  id: asNumber(raw.id),
  diseaseId: asNumber(pickField(raw, 'diseaseId', 'disease_id')),
  diseaseName: asString(pickField(raw, 'diseaseName', 'disease_name')),
  projectId: asNumber(pickField(raw, 'projectId', 'project_id')),
  projectName: asString(pickField(raw, 'projectName', 'project_name')),
  caseTitle: asString(pickField(raw, 'caseTitle', 'case_title')),
  patientDesc: asString(pickField(raw, 'patientDesc', 'patient_desc')),
  applyCycle: asString(pickField(raw, 'applyCycle', 'apply_cycle')),
  actualRelief: asString(pickField(raw, 'actualRelief', 'actual_relief')),
  experience: asString(pickField(raw, 'experience')),
  pitfallGuide: asString(pickField(raw, 'pitfallGuide', 'pitfall_guide')),
  casePdf: asString(pickField(raw, 'casePdf', 'case_pdf')),
  materialTemplate: asString(pickField(raw, 'materialTemplate', 'material_template')),
  auditStatus: asNumber(pickField(raw, 'auditStatus', 'audit_status')) as 0 | 1 | 2,
  rejectReason: asString(pickField(raw, 'rejectReason', 'reject_reason')),
  createdAt: asString(pickField(raw, 'createdAt', 'created_at')),
  updatedAt: asString(pickField(raw, 'updatedAt', 'updated_at')),
})

const toSubmitPayload = (data: ReliefCaseForm) => ({
  diseaseId: data.diseaseId,
  projectId: data.projectId,
  caseTitle: data.caseTitle,
  patientDesc: data.patientDesc,
  applyCycle: data.applyCycle,
  actualRelief: data.actualRelief,
  experience: data.experience,
  pitfallGuide: data.pitfallGuide,
  casePdf: data.casePdf || '',
  materialTemplate: data.materialTemplate || '',
  auditStatus: data.auditStatus,
  rejectReason: data.rejectReason || '',
})

const normalizeProjectOption = (raw: RawRecord): ReliefProjectOption => ({
  id: asNumber(raw.id),
  name: asString(pickField(raw, 'name')),
})

export const getReliefCaseList = async (
  params: ReliefCaseListParams
): Promise<ApiResponse<{ list: ReliefCaseItem[]; total: number }>> => {
  const res = await request.get<{ list?: RawRecord[]; total?: number }>('/resource/charity/cases', { params })
  return mapListResponse(res, normalizeReliefCase)
}

export const getReliefCaseDetail = async (id: number): Promise<ApiResponse<ReliefCaseItem>> => {
  const res = await request.get<RawRecord>(`/resource/charity/cases/${id}`)
  return mapDetailResponse(res, normalizeReliefCase)
}

export const addReliefCase = (data: ReliefCaseForm): Promise<ApiResponse<null>> => {
  return request.post('/resource/charity/cases', toSubmitPayload(data))
}

export const updateReliefCase = (id: number, data: ReliefCaseForm): Promise<ApiResponse<null>> => {
  return request.put(`/resource/charity/cases/${id}`, toSubmitPayload(data))
}

export const deleteReliefCase = (id: number): Promise<ApiResponse<null>> => {
  return request.delete(`/resource/charity/cases/${id}`)
}

export const searchDiseaseOptions = async (keyword = ''): Promise<DiseaseOption[]> => {
  const res = await getDiseaseList({ page: 1, pageSize: 20, keyword, status: 1 })
  return (res.data?.list ?? []).map(fromDisease)
}

export const searchReliefProjectOptions = async (keyword = ''): Promise<ReliefProjectOption[]> => {
  const res = await request.get<{ list?: RawRecord[] } | RawRecord[]>('/resource/charity/projects/options', {
    params: { page: 1, pageSize: 20, keyword, auditStatus: 1 },
  })
  return unwrapList(res.data).map(normalizeProjectOption)
}
