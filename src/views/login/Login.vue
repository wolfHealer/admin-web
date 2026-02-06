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

const form = reactive({
  username: '',
  password: '',
})

const login = () => {
  console.log('login', form)
}
</script>
