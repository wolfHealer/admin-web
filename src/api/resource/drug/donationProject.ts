import request from '@/utils/request'

export interface ApiResponse<T = any> {
  code: number
  data: T
  message?: string
}

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

export interface ReliefProjectListResponse {
  list: ReliefProjectItem[]
  total: number
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

export interface ReliefApplicationListResponse {
  list: ReliefApplicationItem[]
  total: number
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

export const getReliefProjectList = (params: ReliefProjectListParams): Promise<ApiResponse<ReliefProjectListResponse>> => {
  return request({
    url: '/resource/drug/donations',
    method: 'get',
    params
  })
}

export const getReliefProjectDetail = (id: number): Promise<ApiResponse<ReliefProjectItem>> => {
  return request({
    url: `/resource/drug/donations/${id}`,
    method: 'get'
  })
}

export const addReliefProject = (data: Partial<ReliefProjectItem>): Promise<ApiResponse> => {
  return request({
    url: '/resource/drug/donations',
    method: 'post',
    data
  })
}

export const updateReliefProject = (id: number, data: Partial<ReliefProjectItem>): Promise<ApiResponse> => {
  return request({
    url: `/resource/drug/donations/${id}`,
    method: 'put',
    data
  })
}

export const deleteReliefProject = (id: number): Promise<ApiResponse> => {
  return request({
    url: `/resource/drug/donations/${id}`,
    method: 'delete'
  })
}

export const getReliefApplicationList = (params: ReliefApplicationListParams): Promise<ApiResponse<ReliefApplicationListResponse>> => {
  return request({
    url: '/resource/drug/relief-applications',
    method: 'get',
    params
  })
}

export const getReliefApplicationDetail = (id: number): Promise<ApiResponse<ReliefApplicationItem>> => {
  return request({
    url: `/resource/drug/relief-applications/${id}`,
    method: 'get'
  })
}

export const addReliefApplication = (data: Partial<ReliefApplicationItem>): Promise<ApiResponse> => {
  return request({
    url: '/resource/drug/relief-applications',
    method: 'post',
    data
  })
}

export const updateReliefApplication = (id: number, data: Partial<ReliefApplicationItem>): Promise<ApiResponse> => {
  return request({
    url: `/resource/drug/relief-applications/${id}`,
    method: 'put',
    data
  })
}

export const deleteReliefApplication = (id: number): Promise<ApiResponse> => {
  return request({
    url: `/resource/drug/relief-applications/${id}`,
    method: 'delete'
  })
}



export const getReliefApplicationLogs = (applicationId: number): Promise<ApiResponse<ReliefLogItem[]>> => {
  return request({
    url: `/resource/drug/relief-applications/${applicationId}/logs`,
    method: 'get'
  })
}

export const getDrugOptions = (keyword = ''): Promise<ApiResponse<DrugOptionItem[]>> => {
  return request({
    url: '/resource/drug/drugs/options',
    method: 'get',
    params: { keyword, audit_status: 1 }
  })
}

export const getDiseaseOptions = (keyword = ''): Promise<ApiResponse<DiseaseOptionItem[]>> => {
  return request({
    url: '/knowledge/diseases/options',
    method: 'get',
    params: { keyword, status: 1 }
  })
}



// @/api/resource/drug/donationProject.ts 中的定义示例
export interface ReviewApplicationParams {
  status: 'approved' | 'rejected';
  actionDesc?: string; // 注意是驼峰
  rejectReason?: string; // 注意是驼峰
}

export function reviewReliefApplication(id: number, data: ReviewApplicationParams) {
  return request({
    url: `/api/resource/drug/donations/applications/${id}/review`,
    method: 'post',
    data
  })
}