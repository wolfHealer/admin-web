import request from '@/utils/request'

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

// 注册数据接口
export interface RegisterData {
  phone: string
  password: string
  repassword: string
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