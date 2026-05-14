import request from '@/utils/request'


export interface ApiResponse<T = any> {
  code: number
  data: T
  message?: string
}



export type UserRole = 1 | 2 | 9
export type UserStatus = 0 | 1



// 用户信息接口
export interface UserInfo {
  id: number
  phone: string
  email?: string
  nickname?: string
  avatar?: string
}


// 登录响应接口
export interface LoginResponse {
  token: string
  user: UserInfo
}


// 1. 新增用户列表查询参数接口
export interface UserListParams {
  page: number
  pageSize: number
  keyword?: string
  role?: UserRole | ''
  status?: UserStatus | ''
}


// 2. 新增用户列表项数据接口 (根据之前提供的 JSON 响应结构)
export interface UserListItem {
  id: number
  phone: string
  displayName: string
  avatar: string
  role: number
  status: number
  lastLoginAt: string
  loginCount: number
  createdAt: string
  updatedAt: string
}


// 3. 新增用户列表响应接口
export interface UserListResponse {
  list: UserListItem[]
  total: number
  page: number
  pageSize: number
}



// 注册数据接口
export interface RegisterData {
  phone: string
  password: string
  repassword: string
}



// src/api/user/user.ts

// ... 其他代码 ...

// 修改 UserForm 接口，建议使用小驼峰，与 UserItem 保持一致
// 如果后端接口严格要求接收下划线参数，请在 UserDialog 提交时手动转换键名
export interface UserForm {
  id?: number
  phone: string
  password?: string
  displayName?: string   // 原 display_name
  avatar?: string
  role: UserRole
  status: UserStatus
}




// 修改 UserItem 接口，使用小驼峰命名以匹配后端返回值
export interface UserItem {
  id: number
  phone: string
  displayName: string      // 原 display_name
  avatar?: string
  role: UserRole
  status: UserStatus
  lastLoginAt?: string     // 原 last_login_at
  loginCount: number       // 原 login_count
  createdAt?: string       // 原 created_at
  updatedAt?: string       // 原 updated_at
}




// 登录接口
export const userLoginService = ({ phone, password }: { phone: string, password: string }): Promise<LoginResponse> => {
  return request.post('/auth/login', { phone, password })
}

// 注册接口
export const userRegisterService = (data: RegisterData): Promise<void> => {
  return request.post('/auth/register', data)
}

// 获取用户信息接口
export const userGetInfoService = (): Promise<{ data: { data: UserInfo } }> => {
  return request.get('/auth/userinfo')
}



/**
 * 获取用户列表
 * @param params 查询参数
 */
export const getUserList = (params: UserListParams) => {
  return request<ApiResponse<UserListResponse>>({
    url: '/system/users',
    method: 'get',
    params,
  })
}

/**
 * 获取用户详情
 * @param id 用户ID
 */
export const getUserDetail = (id: number) => {
  return request<ApiResponse<UserItem>>({
    url: `/system/users/${id}`,
    method: 'get',
  })
}

/**
 * 新增用户
 * @param data 用户数据
 */
export const addUser = (data: Partial<UserForm>) => {
  return request<ApiResponse>({
    url: '/system/users',
    method: 'post',
    data,
  })
}

/**
 * 更新用户
 * @param id 用户ID
 * @param data 用户数据
 */

export const updateUser = (id: number, data: Partial<UserForm>) => {
  return request<ApiResponse>({
    url: `/system/users/${id}`,
    method: 'put',
    data,
  })
}

/**
 * 删除用户
 * @param id 用户ID
 */
export const deleteUser = (id: number): Promise<{ code: number, message: string }> => {
  return request.delete(`/users/${id}`)
}


export const resetUserPassword = (id: number, newPassword: string) => {
  return request<ApiResponse>({
    url: `/system/users/${id}/reset-password`,
    method: 'post',
    data: { newPassword },
  })
}


export const updateUserRole = (id: number, role: UserRole) => {
  return request<ApiResponse>({
    url: `/system/users/${id}/role`,
    method: 'patch',
    data: { role },
  })
}


export const updateUserStatus = (id: number, status: UserStatus) => {
  return request<ApiResponse>({
    url: `/system/users/${id}/status`,
    method: 'patch',
    data: { status },
  })
}