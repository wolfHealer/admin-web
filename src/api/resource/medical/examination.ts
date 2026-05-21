import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import {
  asNumber,
  asString,
  mapDetailResponse,
  mapListResponse,
  normalizeDiseaseList,
  normalizeIdList,
  pickField,
  type DiseaseOption,
  type RawRecord,
} from '@/api/resource/shared/normalize'

export type DiseaseOptionItem = DiseaseOption

export interface ExaminationManualItem {
  id: number
  examType: string
  examName: string
  examPurpose: string
  referenceValue: string
  abnormalInterpret: string
  sampleNotes: string
  institution: string
  templateExcel: string
  templateWord: string
  compareTemplate: string
  templates: {
    excel: string
    word: string
    compare: string
  }
  auditStatus: number
  rejectReason: string
  sort: number
  diseaseCount?: number
  diseaseIds: number[]
  diseases: DiseaseOption[]
  createdAt?: string
  updatedAt?: string
}

export interface ExaminationManualListParams {
  page: number
  pageSize: number
  keyword?: string
  examType?: string
  auditStatus?: number | null
  diseaseId?: number | null
}

export interface ExaminationManualForm {
  id?: number
  examType: string
  examName: string
  examPurpose: string
  referenceValue: string
  abnormalInterpret: string
  sampleNotes: string
  institution?: string
  templateExcel?: string
  templateWord?: string
  compareTemplate?: string
  templates?: {
    excel?: string
    word?: string
    compare?: string
  }
  auditStatus: number
  rejectReason?: string
  sort: number
  diseaseIds: number[]
}

/** @deprecated 使用 ExaminationManualForm */
export type ExaminationManualSavePayload = ExaminationManualForm

const normalizeExamination = (raw: RawRecord): ExaminationManualItem => {
  const diseases = normalizeDiseaseList(pickField(raw, 'diseases'))
  const diseaseIds = normalizeIdList(pickField(raw, 'diseaseIds', 'disease_ids'))
  const templateExcel = asString(pickField(raw, 'templateExcel', 'template_excel'))
  const templateWord = asString(pickField(raw, 'templateWord', 'template_word'))
  const compareTemplate = asString(pickField(raw, 'compareTemplate', 'compare_template'))
  return {
    id: asNumber(raw.id),
    examType: asString(pickField(raw, 'examType', 'exam_type')),
    examName: asString(pickField(raw, 'examName', 'exam_name')),
    examPurpose: asString(pickField(raw, 'examPurpose', 'exam_purpose')),
    referenceValue: asString(pickField(raw, 'referenceValue', 'reference_value')),
    abnormalInterpret: asString(pickField(raw, 'abnormalInterpret', 'abnormal_interpret')),
    sampleNotes: asString(pickField(raw, 'sampleNotes', 'sample_notes')),
    institution: asString(pickField(raw, 'institution')),
    templateExcel,
    templateWord,
    compareTemplate,
    templates: {
      excel: templateExcel,
      word: templateWord,
      compare: compareTemplate,
    },
    auditStatus: asNumber(pickField(raw, 'auditStatus', 'audit_status')),
    rejectReason: asString(pickField(raw, 'rejectReason', 'reject_reason')),
    sort: asNumber(pickField(raw, 'sort')),
    diseaseIds: diseaseIds.length ? diseaseIds : diseases.map((d) => d.id),
    diseases,
    diseaseCount: diseases.length || diseaseIds.length,
    createdAt: asString(pickField(raw, 'createdAt', 'created_at')),
    updatedAt: asString(pickField(raw, 'updatedAt', 'updated_at')),
  }
}

const toSubmitPayload = (data: ExaminationManualForm) => {
  const templates = data.templates || {}
  return {
    exam_type: data.examType,
    exam_name: data.examName,
    exam_purpose: data.examPurpose,
    reference_value: data.referenceValue,
    abnormal_interpret: data.abnormalInterpret,
    sample_notes: data.sampleNotes,
    institution: data.institution || '',
    template_excel: templates.excel ?? data.templateExcel ?? '',
    template_word: templates.word ?? data.templateWord ?? '',
    compare_template: templates.compare ?? data.compareTemplate ?? '',
    audit_status: data.auditStatus,
    reject_reason: data.rejectReason || '',
    sort: data.sort,
    disease_ids: data.diseaseIds || [],
  }
}

export const getExaminationList = async (
  params: ExaminationManualListParams
): Promise<ApiResponse<{ list: ExaminationManualItem[]; total: number }>> => {
  const res = await request.get<{ list?: RawRecord[]; total?: number }>('/resource/medical/examinations', { params })
  return mapListResponse(res, normalizeExamination)
}

export const getExaminationDetail = async (id: number | string): Promise<ApiResponse<ExaminationManualItem>> => {
  const res = await request.get<RawRecord>(`/resource/medical/examinations/${id}`)
  return mapDetailResponse(res, normalizeExamination)
}

export const addExamination = (data: ExaminationManualForm): Promise<ApiResponse<null>> => {
  return request.post('/resource/medical/examinations', toSubmitPayload(data))
}

export const updateExamination = (id: number | string, data: ExaminationManualForm): Promise<ApiResponse<null>> => {
  return request.put(`/resource/medical/examinations/${id}`, toSubmitPayload(data))
}

export const deleteExamination = (id: number | string): Promise<ApiResponse<null>> => {
  return request.delete(`/resource/medical/examinations/${id}`)
}

export const getDiseaseOptions = async (keyword = ''): Promise<ApiResponse<DiseaseOption[]>> => {
  const res = await request.get<RawRecord[]>('/knowledge/diseases/options', { params: { keyword } })
  const list = (res.data ?? []).map((item) => ({
    id: asNumber(item.id),
    name: asString(item.name),
    alias: asString(item.alias),
  }))
  return { ...res, data: list }
}
