import request from '@/utils/request'

export interface ApiResponse<T = any> {
  code: number
  data: T
  message?: string
}

// src/api/resource/charity/project.ts

export interface DiseaseOption {
  id: number;
  name: string;
  alias?: string;
}

export interface ReliefProjectItem {
  id?: number;
  name: string;
  organizer: string;
  reliefType: string; // 对应后端的 type 或 reliefType，需根据实际后端调整，这里假设前端统一用 reliefType
  applyCondition: string;
  reliefStandard: string;
  applyDeadline?: string;
  applyDifficulty: string;
  applyProcess: string;
  applyForm?: string;
  applyGuide?: string;
  materialList?: string;
  contactPhone?: string;
  contactUrl?: string;
  auditStatus: number;
  rejectReason?: string;
  sort: number;
  
  // 关键：用于表单提交和展示的 ID 列表
  diseaseIds?: number[]; 
  // 关键：后端详情接口返回的完整对象列表，用于展示名称
  diseases?: DiseaseOption[]; 
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

export interface ReliefProjectListResponse {
  list: ReliefProjectItem[]
  total: number
}

export const getReliefProjectList = (params: ReliefProjectListParams) => {
  return request<ApiResponse<ReliefProjectListResponse>>({
    url: '/resource/charity/projects',
    method: 'get',
    params,
  })
}

export const getReliefProjectDetail = (id: number) => {
  return request<ApiResponse<ReliefProjectItem>>({
    url: `/resource/charity/projects/${id}`,
    method: 'get',
  })
}

export const addReliefProject = (data: Partial<ReliefProjectItem>) => {
  return request<ApiResponse>({
    url: '/resource/charity/projects',
    method: 'post',
    data,
  })
}

export const updateReliefProject = (id: number, data: Partial<ReliefProjectItem>) => {
  return request<ApiResponse>({
    url: `/resource/charity/projects/${id}`,
    method: 'put',
    data,
  })
}

export const deleteReliefProject = (id: number) => {
  return request<ApiResponse>({
    url: `/resource/charity/projects/${id}`,
    method: 'delete',
  })
}

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
