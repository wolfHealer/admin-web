import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { userGetInfoService, type UserInfo as ApiUserInfo } from '@/api/user/user'

export interface UserInfo {
  id?: string | number
  phone?: string
  username?: string
  nickname?: string
  avatar?: string
  email?: string
}

export const useUserStore = defineStore('big-user', () => {
  const token = ref<string>('')

  const setToken = (newToken: string): void => {
    token.value = newToken
  }

  const removeToken = (): void => {
    token.value = ''
  }

  const user = ref<UserInfo>({})

  const isProfileLoaded = computed(() => Boolean(user.value.id || user.value.phone))

  const getUser = async (): Promise<void> => {
    const res = await userGetInfoService()
    const data = res.data as ApiUserInfo
    user.value = {
      id: data.id,
      phone: data.phone,
      nickname: data.nickname,
      avatar: data.avatar,
      email: data.email,
    }
  }

  const setUser = (obj: UserInfo): void => {
    user.value = obj
  }

  const resetUser = (): void => {
    token.value = ''
    user.value = {}
  }

  return {
    token,
    setToken,
    removeToken,
    user,
    isProfileLoaded,
    getUser,
    setUser,
    resetUser,
  }
}, {
  persist: {
    key: 'big-user',
    storage: localStorage,
    pick: ['token'],
  },
})