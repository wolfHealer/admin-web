import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000,
})

service.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

service.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code === 200) {
      return res
    }
    if (res.code === 401) {
      ElMessage.error('登录失效，请重新登录')
      localStorage.removeItem('token')
      router.replace('/login')
      return Promise.reject(res)
    }
    ElMessage.error(res.message || '请求失败')
    return Promise.reject(res)
  },
  () => {
    ElMessage.error('网络异常')
  }
)

export default service
