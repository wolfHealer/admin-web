<template>
  <div style="padding: 40px; max-width: 360px; margin: 0 auto">
    <h2>管理员登录</h2>
    <el-input v-model="form.username" placeholder="账号" />
    <el-input
      v-model="form.password"
      type="password"
      placeholder="密码"
      style="margin-top: 12px"
    />
    <el-button type="primary" style="margin-top: 16px" @click="login">
      登录
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import adminService from '../../services/adminService'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

const form = reactive({
  username: '',
  password: '',
})

const login = async () => {
  try {
    const res: any = await adminService.authenticate(form.username, form.password)
    localStorage.setItem('token', res.token)
    localStorage.setItem('adminUser', form.username)
    ElMessage.success('登录成功')
    router.replace('/')
  } catch (e: any) {
    ElMessage.error(e.message || '登录失败')
  }
}
</script>
