import request from '@/utils/request'

export interface ApiResponse<T = any> {
  code: number
  data: T
  message?: string
}

// 修改点：字段名改为小驼峰，与后端返回一致
export interface RehabTrainGuideItem {
  id: number
  rehabStage: string        // 原 rehab_stage
  title: string
  trainPurpose: string      // 原 train_purpose
  trainContent: string      // 原 train_content
  forbiddenAction: string   // 原 forbidden_action
  picUrls?: string[]        // 原 pic_urls
  guidePdf?: string         // 原 guide_pdf
  guideWord?: string        // 原 guide_word
  auditStatus: 0 | 1 | 2    // 原 audit_status
  rejectReason?: string     // 原 reject_reason
  sort?: number
  diseaseIds?: number[]     // 原 disease_ids
  diseases?: Array<{ id: number; name: string; alias?: string }>
  diseaseCount?: number     // 原 disease_count
  createdAt?: string        // 原 created_at
  updatedAt?: string        // 原 updated_at
}

// 注意：GET 请求的参数命名风格需与后端保持一致。
// 如果后端 GET 参数依然要求下划线（如 page_size），请保留下划线。
// 如果后端 GET 参数也改为小驼峰（如 pageSize），请修改此处。
// 根据常见 RESTful 习惯，有时 URL Params 和 Body 风格不同。
// 这里假设后端 URL Params 也接受小驼峰，如果不行请改回 page_size, rehab_stage 等
export interface RehabTrainGuideListParams {
  page: number
  pageSize: number          // 原 page_size
  keyword?: string
  rehabStage?: string       // 原 rehab_stage
  auditStatus?: number | '' // 原 audit_status
  diseaseId?: number | ''   // 原 disease_id
}

export interface RehabTrainGuideListResponse {
  list: RehabTrainGuideItem[]
  total: number
}

export interface DiseaseOption {
  id: number
  name: string
  alias?: string
}

export const getRehabTrainGuideList = (params: RehabTrainGuideListParams) => {
  return request<ApiResponse<RehabTrainGuideListResponse>>({
    url: '/resource/rehab/trainings',
    method: 'get',
    params,
  })
}

export const getRehabTrainGuideDetail = (id: number) => {
  return request<ApiResponse<RehabTrainGuideItem>>({
    url: `/resource/rehab/trainings/${id}`,
    method: 'get',
  })
}

export const addRehabTrainGuide = (data: Partial<RehabTrainGuideItem>) => {
  return request<ApiResponse>({
    url: '/resource/rehab/trainings',
    method: 'post',
    data,
  })
}

export const updateRehabTrainGuide = (id: number, data: Partial<RehabTrainGuideItem>) => {
  return request<ApiResponse>({
    url: `/resource/rehab/trainings/${id}`,
    method: 'put',
    data,
  })
}

export const deleteRehabTrainGuide = (id: number) => {
  return request<ApiResponse>({
    url: `/resource/rehab/trainings/${id}`,
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