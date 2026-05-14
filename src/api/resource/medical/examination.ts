
import request from '@/utils/request'

export interface ApiResponse<T = any> {
  code: number
  data: T
  message?: string
}

export interface DiseaseOptionItem {
  id: number
  name: string
  alias?: string
}

export interface ExaminationManualItem {
  id: number
  exam_type: string
  exam_name: string
  exam_purpose: string
  reference_value?: string
  abnormal_interpret?: string
  sample_notes?: string
  institution?: string
  template_excel?: string
  template_word?: string
  compare_template?: string
  audit_status: number
  reject_reason?: string
  sort: number
  disease_count?: number
  disease_ids?: number[]
  diseases?: DiseaseOptionItem[]
  created_at?: string
  updated_at?: string
}

export interface ExaminationManualListParams {
  page: number
  pageSize: number
  keyword?: string
  examType?: string
  auditStatus?: number | null
  diseaseId?: number | null
}

export interface ExaminationManualSavePayload {
  id?: number
  exam_type: string
  exam_name: string
  exam_purpose: string
  reference_value: string
  abnormal_interpret: string
  sample_notes: string
  institution?: string
  template_excel?: string
  template_word?: string
  compare_template?: string
  audit_status: number
  reject_reason?: string
  sort: number
  disease_ids: number[]
}

export interface ExaminationManualListResponse {
  list: ExaminationManualItem[]
  total: number
}

export const getExaminationList = (
  params: ExaminationManualListParams
): Promise<ApiResponse<ExaminationManualListResponse>> => {
  return request({
    url: '/resource/medical/examinations',
    method: 'get',
    params
  })
}

export const getExaminationDetail = (
  id: number | string
): Promise<ApiResponse<ExaminationManualItem>> => {
  return request({
    url: `/resource/medical/examinations/${id}`,
    method: 'get'
  })
}

export const addExamination = (
  data: ExaminationManualSavePayload
): Promise<ApiResponse> => {
  return request({
    url: '/resource/medical/examinations',
    method: 'post',
    data
  })
}

export const updateExamination = (
  id: number | string,
  data: ExaminationManualSavePayload
): Promise<ApiResponse> => {
  return request({
    url: `/resource/medical/examinations/${id}`,
    method: 'put',
    data
  })
}

export const deleteExamination = (id: number | string): Promise<ApiResponse> => {
  return request({
    url: `/resource/medical/examinations/${id}`,
    method: 'delete'
  })
}

export const getDiseaseOptions = (
  keyword = ''
): Promise<ApiResponse<DiseaseOptionItem[]>> => {
  return request({
    url: '/knowledge/diseases/options',
    method: 'get',
    params: { keyword }
  })
}
