import request from '@/utils/request'

export interface ApiResponse<T = any> {
  code: number
  data: T
  message?: string
}

/** =========================
 * 通用类型
 * ========================= */

export interface DiseaseOption {
  id: number
  name: string
  alias?: string
}

export interface RegionTreeNode {
  code: string
  name: string
  fullName?: string
  children?: RegionTreeNode[]
}

/** =========================
 * 心理支持机构
 * 对应：
 * psych_support_org
 * psych_support_org_disease_rel
 * ========================= */

export interface PsychOrgDiseaseItem {
  id: number
  name: string
  alias?: string
}

export interface PsychOrgItem {
  id: number
  name: string

  provinceCode?: string
  cityCode?: string
  districtCode?: string

  provinceName?: string
  cityName?: string
  districtName?: string

  address?: string
  contactPhone?: string
  contactUrl?: string

  isFree?: 0 | 1 | null
  consultWay?: 'online' | 'offline' | 'both' | ''

  contentIntro: string

  auditStatus: 0 | 1 | 2
  rejectReason?: string

  diseaseIds?: number[]
  diseases?: PsychOrgDiseaseItem[]
  diseaseCount?: number

  createdAt?: string
  updatedAt?: string
}

export interface PsychOrgListParams {
  page: number
  pageSize: number
  keyword?: string
  consultWay?: 'online' | 'offline' | 'both' | ''
  isFree?: 0 | 1 | ''
  auditStatus?: number | ''
  provinceCode?: string
  cityCode?: string
  districtCode?: string
  diseaseId?: number | ''
}

export interface PsychOrgListResponse {
  list: PsychOrgItem[]
  total: number
}

/** =========================
 * 心理支持资源
 * 对应：
 * psych__resource
 * ========================= */

export interface PsychResourceItem {
  id: number
  diseaseId: number
  diseaseName?: string

  resourceType: 'guide' | 'manual' | 'hotline' | 'online_resource' | ''
  name: string
  contentIntro: string

  guidePdf?: string
  manualPatient?: string
  manualFamily?: string
  contactPhone?: string
  contactUrl?: string

  auditStatus: 0 | 1 | 2
  rejectReason?: string

  createdAt?: string
  updatedAt?: string
}

export interface PsychResourceListParams {
  page: number
  pageSize: number
  keyword?: string
  resourceType?: 'guide' | 'manual' | 'hotline' | 'online_resource' | ''
  diseaseId?: number | ''
  auditStatus?: number | ''
}

export interface PsychResourceListResponse {
  list: PsychResourceItem[]
  total: number
}

/** =========================
 * 心理支持机构接口
 * ========================= */

export const getPsychOrgList = (params: PsychOrgListParams) => {
  return request<ApiResponse<PsychOrgListResponse>>({
    url: '/resource/rehab/psychological/orgs',
    method: 'get',
    params,
  })
}

export const getPsychOrgDetail = (id: number) => {
  return request<ApiResponse<PsychOrgItem>>({
    url: `/resource/rehab/psychological/orgs/${id}`,
    method: 'get',
  })
}

export const addPsychOrg = (data: Partial<PsychOrgItem>) => {
  return request<ApiResponse>({
    url: '/resource/rehab/psychological/orgs',
    method: 'post',
    data,
  })
}

export const updatePsychOrg = (id: number, data: Partial<PsychOrgItem>) => {
  return request<ApiResponse>({
    url: `/resource/rehab/psychological/orgs/${id}`,
    method: 'put',
    data,
  })
}

export const deletePsychOrg = (id: number) => {
  return request<ApiResponse>({
    url: `/resource/rehab/psychological/orgs/${id}`,
    method: 'delete',
  })
}

/** =========================
 * 心理支持资源接口
 * ========================= */

export const getPsychResourceList = (params: PsychResourceListParams) => {
  return request<ApiResponse<PsychResourceListResponse>>({
    url: '/resource/rehab/psychological/resources',
    method: 'get',
    params,
  })
}

export const getPsychResourceDetail = (id: number) => {
  return request<ApiResponse<PsychResourceItem>>({
    url: `/resource/rehab/psychological/resources/${id}`,
    method: 'get',
  })
}

export const addPsychResource = (data: Partial<PsychResourceItem>) => {
  return request<ApiResponse>({
    url: '/resource/rehab/psychological/resources',
    method: 'post',
    data,
  })
}

export const updatePsychResource = (id: number, data: Partial<PsychResourceItem>) => {
  return request<ApiResponse>({
    url: `/resource/rehab/psychological/resources/${id}`,
    method: 'put',
    data,
  })
}

export const deletePsychResource = (id: number) => {
  return request<ApiResponse>({
    url: `/resource/rehab/psychological/resources/${id}`,
    method: 'delete',
  })
}

/** =========================
 * 通用辅助接口
 * ========================= */

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

export const getRegionTree = () => {
  return request<ApiResponse<RegionTreeNode[]>>({
    url: '/region/tree',
    method: 'get',
  })
}