// src/medical/caseTemplate.ts
import request from '@/utils/request'

export function getCaseTemplateList(params: any) {
  return request({ url: '/medical/case-template/list', method: 'get', params })
}

export function getCaseTemplateDetail(id: number) {
  return request({ url: `/medical/case-template/${id}`, method: 'get' })
}

export function addCaseTemplate(data: any) {
  return request({ url: '/medical/case-template', method: 'post', data })
}

export function updateCaseTemplate(id: number, data: any) {
  return request({ url: `/medical/case-template/${id}`, method: 'put', data })
}

export function deleteCaseTemplate(id: number) {
  return request({ url: `/medical/case-template/${id}`, method: 'delete' })
}

export function copyCaseTemplate(id: number) {
  return request({ url: `/medical/case-template/${id}/copy`, method: 'post' })
}