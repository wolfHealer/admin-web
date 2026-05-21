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
  type RawRecord,
} from '@/api/resource/shared/normalize'

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

export interface DoctorForm {
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

/** @deprecated 使用 DoctorForm */
export type DoctorSubmitPayload = DoctorForm

const normalizeDoctor = (raw: RawRecord): DoctorItem => {
  const diseases = normalizeDiseaseList(pickField(raw, 'diseases'))
  const diseaseIds = normalizeIdList(pickField(raw, 'diseaseIds', 'disease_ids'))
  return {
    id: asNumber(raw.id),
    hospitalId: asNumber(pickField(raw, 'hospitalId', 'hospital_id')),
    hospitalName: asString(pickField(raw, 'hospitalName', 'hospital_name')),
    hospitalLevel: asString(pickField(raw, 'hospitalLevel', 'hospital_level')),
    provinceName: asString(pickField(raw, 'provinceName', 'province_name')),
    cityName: asString(pickField(raw, 'cityName', 'city_name')),
    districtName: asString(pickField(raw, 'districtName', 'district_name')),
    name: asString(pickField(raw, 'name')),
    title: asString(pickField(raw, 'title')),
    department: asString(pickField(raw, 'department')),
    goodAt: asString(pickField(raw, 'goodAt', 'good_at')),
    clinicTime: asString(pickField(raw, 'clinicTime', 'clinic_time')),
    contact: asString(pickField(raw, 'contact')),
    score: asNumber(pickField(raw, 'score')),
    commentNum: asNumber(pickField(raw, 'commentNum', 'comment_num')),
    auditStatus: asNumber(pickField(raw, 'auditStatus', 'audit_status')),
    rejectReason: asString(pickField(raw, 'rejectReason', 'reject_reason')),
    diseaseIds: diseaseIds.length ? diseaseIds : diseases.map((d) => d.id),
    diseases,
    diseaseCount: diseases.length || diseaseIds.length,
    createdAt: asString(pickField(raw, 'createdAt', 'created_at')),
    updatedAt: asString(pickField(raw, 'updatedAt', 'updated_at')),
  }
}

const toSubmitPayload = (data: DoctorForm) => ({
  hospitalId: data.hospitalId,
  name: data.name,
  title: data.title,
  department: data.department,
  goodAt: data.goodAt,
  clinicTime: data.clinicTime,
  contact: data.contact || '',
  score: data.score ?? 0,
  commentNum: data.commentNum ?? 0,
  auditStatus: data.auditStatus,
  rejectReason: data.rejectReason || '',
  diseaseIds: data.diseaseIds || [],
})

export const getDoctorList = async (
  params: DoctorListParams
): Promise<ApiResponse<{ list: DoctorItem[]; total: number }>> => {
  const res = await request.get<{ list?: RawRecord[]; total?: number }>('/resource/medical/doctors', { params })
  return mapListResponse(res, normalizeDoctor)
}

export const getDoctorDetail = async (id: number | string): Promise<ApiResponse<DoctorItem>> => {
  const res = await request.get<RawRecord>(`/resource/medical/doctors/${id}`)
  return mapDetailResponse(res, normalizeDoctor)
}

export const addDoctor = (data: DoctorForm): Promise<ApiResponse<null>> => {
  return request.post('/resource/medical/doctors', toSubmitPayload(data))
}

export const updateDoctor = (id: number | string, data: DoctorForm): Promise<ApiResponse<null>> => {
  return request.put(`/resource/medical/doctors/${id}`, toSubmitPayload(data))
}

export const deleteDoctor = (id: number | string): Promise<ApiResponse<null>> => {
  return request.delete(`/resource/medical/doctors/${id}`)
}

export const getHospitalOptions = async (params?: { keyword?: string }): Promise<ApiResponse<SimpleOption[]>> => {
  const res = await request.get<RawRecord[]>('/resource/medical/hospitals/options', { params })
  const list = (res.data ?? []).map((item) => ({
    id: asNumber(item.id),
    name: asString(item.name),
  }))
  return { ...res, data: list }
}

export const getDiseaseOptions = async (params?: { keyword?: string }): Promise<ApiResponse<DoctorDiseaseOption[]>> => {
  const res = await request.get<RawRecord[]>('/knowledge/diseases/options', { params })
  const list = (res.data ?? []).map((item) => ({
    id: asNumber(item.id),
    name: asString(item.name),
    alias: asString(item.alias),
  }))
  return { ...res, data: list }
}
