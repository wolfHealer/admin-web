// src/api/resource/medical/region.ts
import request from '@/utils/request' // 假设你的项目有统一的request封装

export const getRegionTree = () => {
  return request({
    url: '/region/tree',
    method: 'get'
  })
}