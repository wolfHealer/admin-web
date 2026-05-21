import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import {
  asNumber,
  asString,
  mapDetailResponse,
  mapListResponse,
  pickField,
  unwrapList,
  type RawRecord,
} from '@/api/resource/shared/normalize'

export interface ReliefProjectItem {
  id?: number
  drugId: number | null
  drugGenericName?: string
  drugBrandName?: string
  diseaseId: number | null
  diseaseName?: string
  name: string
  organizer: string
  applyCondition: string
  reliefCycle: string
  reliefDosageDesc: string
  applyForm: string
  applyGuide: string
  materialList: string
  progressQuery: string
  auditStatus: number
  rejectReason?: string
  createdAt?: string
  updatedAt?: string
}

export interface ReliefProjectListParams {
  page: number
  pageSize: number
  keyword?: string
  organizer?: string
  drugId?: number | null
  diseaseId?: number | null
  auditStatus?: number | null
}

export interface DonationProjectForm {
  id?: number
  drugId: number | null
  diseaseId: number | null
  name: string
  organizer: string
  applyCondition: string
  reliefCycle: string
  reliefDosageDesc: string
  applyForm: string
  applyGuide: string
  materialList: string
  progressQuery: string
  auditStatus: number
  rejectReason?: string
}

export interface ReliefApplicationItem {
  id?: number
  projectId: number | null
  projectName?: string
  userId: number | null
  patientName: string
  patientIdCardEnc?: string
  patientIdCardMask: string
  diagnosisProof: string
  incomeProof: string
  contactPhone: string
  status: string
  submitTime?: string
  reviewerId?: number | null
  reviewerName?: string
  reviewTime?: string
  rejectReason?: string
  createdAt?: string
  updatedAt?: string
  logs?: ReliefLogItem[]
}

export interface ReliefApplicationListParams {
  page: number
  pageSize: number
  keyword?: string
  projectId?: number | null
  status?: string | null
}

export interface ReliefApplicationForm {
  id?: number
  projectId: number | null
  userId?: number | null
  patientName: string
  patientIdCardEnc?: string
  patientIdCardMask: string
  diagnosisProof: string
  incomeProof: string
  contactPhone: string
  status?: string
}

export interface ReliefLogItem {
  id?: number
  applicationId: number
  status: string
  actionDesc: string
  operatorId?: number | null
  operatorName?: string | null
  createdAt: string
}

export interface DrugOptionItem {
  id: number
  genericName: string
  brandName?: string
}

export interface DiseaseOptionItem {
  id: number
  name: string
  alias?: string
}

export interface ReviewApplicationParams {
  status: 'approved' | 'rejected'
  actionDesc?: string
  rejectReason?: string
}

const normalizeDonationProject = (raw: RawRecord): ReliefProjectItem => ({
  id: raw.id !== undefined ? asNumber(raw.id) : undefined,
  drugId: pickField(raw, 'drugId', 'drug_id') === null ? null : asNumber(pickField(raw, 'drugId', 'drug_id')),
  drugGenericName: asString(pickField(raw, 'drugGenericName', 'drug_generic_name')),
  drugBrandName: asString(pickField(raw, 'drugBrandName', 'drug_brand_name')),
  diseaseId: pickField(raw, 'diseaseId', 'disease_id') === null ? null : asNumber(pickField(raw, 'diseaseId', 'disease_id')),
  diseaseName: asString(pickField(raw, 'diseaseName', 'disease_name')),
  name: asString(pickField(raw, 'name')),
  organizer: asString(pickField(raw, 'organizer')),
  applyCondition: asString(pickField(raw, 'applyCondition', 'apply_condition')),
  reliefCycle: asString(pickField(raw, 'reliefCycle', 'relief_cycle')),
  reliefDosageDesc: asString(pickField(raw, 'reliefDosageDesc', 'relief_dosage_desc')),
  applyForm: asString(pickField(raw, 'applyForm', 'apply_form')),
  applyGuide: asString(pickField(raw, 'applyGuide', 'apply_guide')),
  materialList: asString(pickField(raw, 'materialList', 'material_list')),
  progressQuery: asString(pickField(raw, 'progressQuery', 'progress_query')),
  auditStatus: asNumber(pickField(raw, 'auditStatus', 'audit_status')),
  rejectReason: asString(pickField(raw, 'rejectReason', 'reject_reason')),
  createdAt: asString(pickField(raw, 'createdAt', 'created_at')),
  updatedAt: asString(pickField(raw, 'updatedAt', 'updated_at')),
})

const toDonationProjectPayload = (data: DonationProjectForm) => ({
  drugId: data.drugId,
  diseaseId: data.diseaseId,
  name: data.name,
  organizer: data.organizer,
  applyCondition: data.applyCondition,
  reliefCycle: data.reliefCycle,
  reliefDosageDesc: data.reliefDosageDesc,
  applyForm: data.applyForm,
  applyGuide: data.applyGuide,
  materialList: data.materialList,
  progressQuery: data.progressQuery,
  auditStatus: data.auditStatus,
  rejectReason: data.rejectReason || '',
})

const normalizeApplication = (raw: RawRecord): ReliefApplicationItem => ({
  id: raw.id !== undefined ? asNumber(raw.id) : undefined,
  projectId: pickField(raw, 'projectId', 'project_id') === null ? null : asNumber(pickField(raw, 'projectId', 'project_id')),
  projectName: asString(pickField(raw, 'projectName', 'project_name')),
  userId: pickField(raw, 'userId', 'user_id') === null ? null : asNumber(pickField(raw, 'userId', 'user_id')),
  patientName: asString(pickField(raw, 'patientName', 'patient_name')),
  patientIdCardEnc: asString(pickField(raw, 'patientIdCardEnc', 'patient_id_card_enc')),
  patientIdCardMask: asString(pickField(raw, 'patientIdCardMask', 'patient_id_card_mask')),
  diagnosisProof: asString(pickField(raw, 'diagnosisProof', 'diagnosis_proof')),
  incomeProof: asString(pickField(raw, 'incomeProof', 'income_proof')),
  contactPhone: asString(pickField(raw, 'contactPhone', 'contact_phone')),
  status: asString(pickField(raw, 'status')),
  submitTime: asString(pickField(raw, 'submitTime', 'submit_time')),
  reviewerId: pickField(raw, 'reviewerId', 'reviewer_id') === null ? null : asNumber(pickField(raw, 'reviewerId', 'reviewer_id')),
  reviewerName: asString(pickField(raw, 'reviewerName', 'reviewer_name')),
  reviewTime: asString(pickField(raw, 'reviewTime', 'review_time')),
  rejectReason: asString(pickField(raw, 'rejectReason', 'reject_reason')),
  createdAt: asString(pickField(raw, 'createdAt', 'created_at')),
  updatedAt: asString(pickField(raw, 'updatedAt', 'updated_at')),
})

const normalizeLog = (raw: RawRecord): ReliefLogItem => ({
  id: raw.id !== undefined ? asNumber(raw.id) : undefined,
  applicationId: asNumber(pickField(raw, 'applicationId', 'application_id')),
  status: asString(pickField(raw, 'status')),
  actionDesc: asString(pickField(raw, 'actionDesc', 'action_desc')),
  operatorId: pickField(raw, 'operatorId', 'operator_id') === null ? null : asNumber(pickField(raw, 'operatorId', 'operator_id')),
  operatorName: asString(pickField(raw, 'operatorName', 'operator_name')) || null,
  createdAt: asString(pickField(raw, 'createdAt', 'created_at')),
})

const toApplicationPayload = (data: ReliefApplicationForm) => ({
  projectId: data.projectId,
  userId: data.userId ?? null,
  patientName: data.patientName,
  patientIdCardEnc: data.patientIdCardEnc || '',
  patientIdCardMask: data.patientIdCardMask,
  diagnosisProof: data.diagnosisProof,
  incomeProof: data.incomeProof,
  contactPhone: data.contactPhone,
  status: data.status || 'pending',
})

export const getReliefProjectList = async (
  params: ReliefProjectListParams
): Promise<ApiResponse<{ list: ReliefProjectItem[]; total: number }>> => {
  const res = await request.get<{ list?: RawRecord[]; total?: number }>('/resource/drug/donations', { params })
  return mapListResponse(res, normalizeDonationProject)
}

export const getReliefProjectDetail = async (id: number): Promise<ApiResponse<ReliefProjectItem>> => {
  const res = await request.get<RawRecord>(`/resource/drug/donations/${id}`)
  return mapDetailResponse(res, normalizeDonationProject)
}

export const addReliefProject = (data: DonationProjectForm): Promise<ApiResponse<null>> => {
  return request.post('/resource/drug/donations', toDonationProjectPayload(data))
}

export const updateReliefProject = (id: number, data: DonationProjectForm): Promise<ApiResponse<null>> => {
  return request.put(`/resource/drug/donations/${id}`, toDonationProjectPayload(data))
}

export const deleteReliefProject = (id: number): Promise<ApiResponse<null>> => {
  return request.delete(`/resource/drug/donations/${id}`)
}

export const getReliefApplicationList = async (
  params: ReliefApplicationListParams
): Promise<ApiResponse<{ list: ReliefApplicationItem[]; total: number }>> => {
  const res = await request.get<{ list?: RawRecord[]; total?: number }>('/resource/drug/relief-applications', { params })
  return mapListResponse(res, normalizeApplication)
}

export const getReliefApplicationDetail = async (id: number): Promise<ApiResponse<ReliefApplicationItem>> => {
  const res = await request.get<RawRecord>(`/resource/drug/relief-applications/${id}`)
  return mapDetailResponse(res, normalizeApplication)
}

export const addReliefApplication = (data: ReliefApplicationForm): Promise<ApiResponse<null>> => {
  return request.post('/resource/drug/relief-applications', toApplicationPayload(data))
}

export const updateReliefApplication = (id: number, data: ReliefApplicationForm): Promise<ApiResponse<null>> => {
  return request.put(`/resource/drug/relief-applications/${id}`, toApplicationPayload(data))
}

export const deleteReliefApplication = (id: number): Promise<ApiResponse<null>> => {
  return request.delete(`/resource/drug/relief-applications/${id}`)
}

export const getReliefApplicationLogs = async (applicationId: number): Promise<ApiResponse<ReliefLogItem[]>> => {
  const res = await request.get<RawRecord[]>(`/resource/drug/relief-applications/${applicationId}/logs`)
  return { ...res, data: (res.data ?? []).map(normalizeLog) }
}

export const getDrugOptions = async (keyword = ''): Promise<ApiResponse<DrugOptionItem[]>> => {
  const res = await request.get<RawRecord[] | { list?: RawRecord[] }>('/resource/drug/drugs/options', {
    params: { keyword, auditStatus: 1 },
  })
  const list = unwrapList(res.data).map((item) => ({
    id: asNumber(item.id),
    genericName: asString(pickField(item, 'genericName', 'generic_name')),
    brandName: asString(pickField(item, 'brandName', 'brand_name')),
  }))
  return { ...res, data: list }
}

export const getDiseaseOptions = async (keyword = ''): Promise<ApiResponse<DiseaseOptionItem[]>> => {
  const res = await request.get<RawRecord[]>('/knowledge/diseases/options', { params: { keyword, status: 1 } })
  const list = (res.data ?? []).map((item) => ({
    id: asNumber(item.id),
    name: asString(item.name),
    alias: asString(item.alias),
  }))
  return { ...res, data: list }
}

export function reviewReliefApplication(id: number, data: ReviewApplicationParams): Promise<ApiResponse<null>> {
  return request.post(`/resource/drug/relief-applications/${id}/review`, data)
}
