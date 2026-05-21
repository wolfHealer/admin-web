/** 统一 API 响应结构（与 request 拦截器返回一致） */
export interface ApiResponse<T = unknown> {
  code: number
  data: T
  message?: string
}

/** 通用分页请求参数 */
export interface PageParams {
  page: number
  pageSize: number
}

/** 通用分页列表响应 data 结构 */
export interface PageResult<T> {
  list: T[]
  total: number
}

/** 带 keyword 的分页参数 */
export interface PageQueryParams extends PageParams {
  keyword?: string
}
