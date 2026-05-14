import request from '@/utils/request'

export interface ApiResponse<T = any> {
  code: number
  data: T
  message?: string
}

export interface DiseaseOption {
  id: number
  name: string
  alias?: string
}

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

export interface ReliefCaseListResponse {
  list: ReliefCaseItem[]
  total: number
}

export const getReliefCaseList = (params: ReliefCaseListParams) => {
  return request<ApiResponse<ReliefCaseListResponse>>({
    url: '/resource/charity/cases',
    method: 'get',
    params,
  })
}

export const getReliefCaseDetail = (id: number) => {
  return request<ApiResponse<ReliefCaseItem>>({
    url: `/resource/charity/cases/${id}`,
    method: 'get',
  })
}

export const addReliefCase = (data: Partial<ReliefCaseItem>) => {
  return request<ApiResponse>({
    url: '/resource/charity/cases',
    method: 'post',
    data,
  })
}

export const updateReliefCase = (id: number, data: Partial<ReliefCaseItem>) => {
  return request<ApiResponse>({
    url: `/resource/charity/cases/${id}`,
    method: 'put',
    data,
  })
}

export const deleteReliefCase = (id: number) => {
  return request<ApiResponse>({
    url: `/resource/charity/cases/${id}`,
    method: 'delete',
  })
}

/** 疾病远程搜索 */
export const searchDiseaseOptions = (keyword = '') => {
  return request<ApiResponse<{ list: DiseaseOption[] } | DiseaseOption[]>>({
    url: '/knowledge/diseases',
    method: 'get',
    params: {
      page: 1,
      pageSize: 20,
      keyword,
      status: 1,
    },
  })
}

/** 救助项目远程搜索 */
export const searchReliefProjectOptions = (keyword = '') => {
  return request<ApiResponse<{ list: ReliefProjectOption[] } | ReliefProjectOption[]>>({
    url: '/resource/charity/projects/options',
    method: 'get',
    params: {
      page: 1,
      pageSize: 20,
      keyword,
      auditStatus: 1,
    },
  })
}