import request from '@/utils/request'

export interface ApiResponse<T = any> {
  code: number
  data: T
  message?: string
}

export interface SimpleOption {
  id: number
  name: string
}

export interface DoctorDiseaseOption {
  id: number
  name: string
  alias?: string
}

export interface DoctorItem {
  id: number
  hospitalId: number
  hospitalName?: string
  hospitalLevel?: string
  provinceName?: string
  cityName?: string
  districtName?: string
  name: string
  title: string
  department: string
  goodAt: string
  clinicTime: string
  contact?: string
  score?: number
  commentNum?: number
  auditStatus: number
  rejectReason?: string
  diseaseCount?: number
  diseaseIds?: number[]
  diseases?: DoctorDiseaseOption[]
  createdAt?: string
  updatedAt?: string
}

export interface DoctorListParams {
  page: number
  pageSize: number
  keyword?: string
  hospitalId?: number | string
  department?: string
  title?: string
  auditStatus?: number | string
  diseaseId?: number | string
}

export interface DoctorSubmitPayload {
  id?: number
  hospitalId: number | null
  name: string
  title: string
  department: string
  goodAt: string
  clinicTime: string
  contact?: string
  score?: number
  commentNum?: number
  auditStatus: number
  rejectReason?: string
  diseaseIds: number[]
}

export const getDoctorList = (params: DoctorListParams): Promise<ApiResponse<{ list: DoctorItem[]; total: number }>> => {
  return request({
    url: '/resource/medical/doctors',
    method: 'get',
    params: {
      page: params.page,
      pageSize: params.pageSize,
      keyword: params.keyword,
      hospitalId: params.hospitalId,
      department: params.department,
      title: params.title,
      auditStatus: params.auditStatus,
      diseaseId: params.diseaseId
    }
  })
}

export const getDoctorDetail = (id: number | string): Promise<ApiResponse<DoctorItem>> => {
  return request({
    url: `/resource/medical/doctors/${id}`,
    method: 'get'
  })
}

export const addDoctor = (data: DoctorSubmitPayload): Promise<ApiResponse> => {
  return request({
    url: '/resource/medical/doctors',
    method: 'post',
    data
  })
}

export const updateDoctor = (id: number | string, data: DoctorSubmitPayload): Promise<ApiResponse> => {
  return request({
    url: `/resource/medical/doctors/${id}`,
    method: 'put',
    data
  })
}

export const deleteDoctor = (id: number | string): Promise<ApiResponse> => {
  return request({
    url: `/resource/medical/doctors/${id}`,
    method: 'delete'
  })
}

export const getHospitalOptions = (params?: { keyword?: string }): Promise<ApiResponse<SimpleOption[]>> => {
  return request({
    url: '/resource/medical/hospitals/options',
    method: 'get',
    params
  })
}

export const getDiseaseOptions = (params?: { keyword?: string }): Promise<ApiResponse<DoctorDiseaseOption[]>> => {
  return request({
    url: '/knowledge/diseases/options',
    method: 'get',
    params
  })
}


