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

export interface RehabTrainGuideItem {
  id: number
  rehabStage: string
  title: string
  trainPurpose: string
  trainContent: string
  forbiddenAction: string
  picUrls?: string[]
  guidePdf?: string
  guideWord?: string
  auditStatus: 0 | 1 | 2
  rejectReason?: string
  sort?: number
  diseaseIds?: number[]
  diseases?: DiseaseOption[]
  diseaseCount?: number
  createdAt?: string
  updatedAt?: string
}

export interface RehabTrainGuideListParams {
  page: number
  pageSize: number
  keyword?: string
  rehabStage?: string
  auditStatus?: number | ''
  diseaseId?: number | ''
}

export interface RehabTrainGuideForm {
  id?: number
  rehabStage: string
  title: string
  trainPurpose: string
  trainContent: string
  forbiddenAction: string
  picUrls?: string[]
  guidePdf?: string
  guideWord?: string
  auditStatus: number
  rejectReason?: string
  sort?: number
  diseaseIds?: number[]
}

const normalizePicUrls = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((v) => asString(v)).filter(Boolean)
  if (typeof value === 'string' && value) return [value]
  return []
}

const normalizeRehabTrainGuide = (raw: RawRecord): RehabTrainGuideItem => {
  const diseases = normalizeDiseaseList(pickField(raw, 'diseases'))
  const diseaseIds = normalizeIdList(pickField(raw, 'diseaseIds', 'disease_ids'))
  return {
    id: asNumber(raw.id),
    rehabStage: asString(pickField(raw, 'rehabStage', 'rehab_stage')),
    title: asString(pickField(raw, 'title')),
    trainPurpose: asString(pickField(raw, 'trainPurpose', 'train_purpose')),
    trainContent: asString(pickField(raw, 'trainContent', 'train_content')),
    forbiddenAction: asString(pickField(raw, 'forbiddenAction', 'forbidden_action')),
    picUrls: normalizePicUrls(pickField(raw, 'picUrls', 'pic_urls')),
    guidePdf: asString(pickField(raw, 'guidePdf', 'guide_pdf')),
    guideWord: asString(pickField(raw, 'guideWord', 'guide_word')),
    auditStatus: asNumber(pickField(raw, 'auditStatus', 'audit_status')) as 0 | 1 | 2,
    rejectReason: asString(pickField(raw, 'rejectReason', 'reject_reason')),
    sort: asNumber(pickField(raw, 'sort')),
    diseaseIds: diseaseIds.length ? diseaseIds : diseases.map((d) => d.id),
    diseases,
    diseaseCount: diseases.length || diseaseIds.length,
    createdAt: asString(pickField(raw, 'createdAt', 'created_at')),
    updatedAt: asString(pickField(raw, 'updatedAt', 'updated_at')),
  }
}

const toSubmitPayload = (data: RehabTrainGuideForm) => ({
  rehabStage: data.rehabStage,
  title: data.title,
  trainPurpose: data.trainPurpose,
  trainContent: data.trainContent,
  forbiddenAction: data.forbiddenAction,
  picUrls: data.picUrls || [],
  guidePdf: data.guidePdf || '',
  guideWord: data.guideWord || '',
  auditStatus: data.auditStatus,
  rejectReason: data.rejectReason || '',
  sort: data.sort ?? 0,
  diseaseIds: data.diseaseIds || [],
})

export const getRehabTrainGuideList = async (
  params: RehabTrainGuideListParams
): Promise<ApiResponse<{ list: RehabTrainGuideItem[]; total: number }>> => {
  const res = await request.get<{ list?: RawRecord[]; total?: number }>('/resource/rehab/trainings', { params })
  return mapListResponse(res, normalizeRehabTrainGuide)
}

export const getRehabTrainGuideDetail = async (id: number): Promise<ApiResponse<RehabTrainGuideItem>> => {
  const res = await request.get<RawRecord>(`/resource/rehab/trainings/${id}`)
  return mapDetailResponse(res, normalizeRehabTrainGuide)
}

export const addRehabTrainGuide = (data: RehabTrainGuideForm): Promise<ApiResponse<null>> => {
  return request.post('/resource/rehab/trainings', toSubmitPayload(data))
}

export const updateRehabTrainGuide = (id: number, data: RehabTrainGuideForm): Promise<ApiResponse<null>> => {
  return request.put(`/resource/rehab/trainings/${id}`, toSubmitPayload(data))
}

export const deleteRehabTrainGuide = (id: number): Promise<ApiResponse<null>> => {
  return request.delete(`/resource/rehab/trainings/${id}`)
}

export const searchDiseaseOptions = async (keyword = ''): Promise<DiseaseOption[]> => {
  const res = await getDiseaseList({ page: 1, pageSize: 20, keyword, status: 1 })
  return (res.data?.list ?? []).map(fromDisease)
}
