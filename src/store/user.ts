import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userGetInfoService } from '@/api/user/user'

// 用户信息接口定义
export interface UserInfo {
  id?: string | number
  username?: string
  nickname?: string
  avatar?: string
  email?: string
  [key: string]: any
}

// 用户状态接口定义
export interface UserState {
  token: string
  user: UserInfo
}

// 用户模块
export const useUserStore = defineStore('big-user', () => {
  // token 相关
  const token = ref<string>('')
  
  const setToken = (newToken: string): void => {
    token.value = newToken
  }
  
  const removeToken = (): void => {
    token.value = ''
  }
  
  // 用户信息相关
  const user = ref<UserInfo>({})
  
  const getUser = async (): Promise<void> => {
    try {
      const res = await userGetInfoService()
      user.value = res.data.data
    } catch (error) {
      console.error('获取用户信息失败:', error)
      throw error
    }
  }
  
  const setUser = (obj: UserInfo): void => {
    user.value = obj
  }
  
  // 重置用户状态
  const resetUser = (): void => {
    token.value = ''
    user.value = {}
  }
  
  return {
    token,
    setToken,
    removeToken,
    user,
    getUser,
    setUser,
    resetUser
  }
}, {
  persist: {
    key: 'big-user',
    storage: localStorage,
    paths: ['token'] // 只持久化 token
  }as any
})