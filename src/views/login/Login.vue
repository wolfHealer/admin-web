<script setup lang="ts">
import { User, Lock } from '@element-plus/icons-vue'
import { ref, watch, nextTick } from 'vue'
import type { FormInstance } from 'element-plus'
import {
  userRegisterService,
  userLoginService,
} from '@/api/user/user'
import { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css'
import { useUserStore } from '@/store/user'
import { useRouter } from 'vue-router'
import { clearSession } from '@/utils/auth'

const form = ref<FormInstance>()
const isRegister = ref(false)

const formModel = ref({
  phone: '',
  password: '',
  repassword: '',
  remember: false,
})

const userStore = useUserStore()
const router = useRouter()

const rules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { pattern: /^\S{6,15}$/, message: '密码必须是6-15位的非空字符', trigger: 'blur' },
  ],
  repassword: [
    { required: true, message: '请输入确认密码', trigger: 'blur' },
    { pattern: /^\S{6,15}$/, message: '密码必须是6-15位的非空字符', trigger: 'blur' },
    {
      validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
        if (value !== formModel.value.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}

const resetForm = async () => {
  formModel.value = {
    phone: '',
    password: '',
    repassword: '',
    remember: false,
  }
  await nextTick()
  form.value?.clearValidate()
}

const switchToLogin = () => {
  isRegister.value = false
}

const switchToRegister = () => {
  isRegister.value = true
}

watch(isRegister, () => {
  void resetForm()
})

const register = async () => {
  await form.value?.validate()
  await userRegisterService(formModel.value)
  ElMessage.success('注册成功')
  isRegister.value = false
}

const login = async () => {
  await form.value?.validate()
  try {
    const res = await userLoginService(formModel.value)
    userStore.setToken(res.data.token)
    await userStore.getUser()
    ElMessage.success('登录成功')
    router.replace('/home')
  } catch {
    await clearSession()
    ElMessage.error('登录失败，请检查账号密码')
  }
}
</script>

<template>
  <el-row class="login-page">
    <el-col :span="12" class="bg">
      <div class="bg-content">
        <h2>医疗管理系统</h2>
        <p>罕见病知识与服务管理平台</p>
      </div>
    </el-col>
    <el-col :span="6" :offset="3" class="form">
      <!-- 注册表单 -->
      <el-form
        v-if="isRegister"
        ref="form"
        :model="formModel"
        :rules="rules"
        size="large"
        autocomplete="off"
      >
        <el-form-item>
          <h1>注册</h1>
        </el-form-item>
        <el-form-item prop="phone">
          <el-input
            v-model="formModel.phone"
            :prefix-icon="User"
            placeholder="请输入手机号"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="formModel.password"
            :prefix-icon="Lock"
            type="password"
            show-password
            placeholder="请输入密码"
          />
        </el-form-item>
        <el-form-item prop="repassword">
          <el-input
            v-model="formModel.repassword"
            :prefix-icon="Lock"
            type="password"
            show-password
            placeholder="请输入确认密码"
          />
        </el-form-item>
        <el-form-item>
          <el-button class="button" type="primary" @click="register">注册</el-button>
        </el-form-item>
        <el-form-item class="flex">
          <el-link type="primary" :underline="false" @click="switchToLogin">
            已有账号？去登录
          </el-link>
        </el-form-item>
      </el-form>

      <!-- 登录表单 -->
      <el-form
        v-else
        ref="form"
        :model="formModel"
        :rules="rules"
        size="large"
        autocomplete="off"
      >
        <el-form-item>
          <h1>登录</h1>
        </el-form-item>
        <el-form-item prop="phone">
          <el-input
            v-model="formModel.phone"
            :prefix-icon="User"
            placeholder="请输入手机号"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="formModel.password"
            :prefix-icon="Lock"
            type="password"
            show-password
            placeholder="请输入密码"
          />
        </el-form-item>
        <el-form-item class="flex">
          <div class="flex">
            <el-checkbox v-model="formModel.remember">记住我</el-checkbox>
            <el-link type="primary" :underline="false">忘记密码</el-link>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button class="button" type="primary" @click="login">登录</el-button>
        </el-form-item>
        <el-form-item class="flex">
          <el-link type="primary" :underline="false" @click="switchToRegister">
            没有账号？去注册
          </el-link>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
.login-page {
  height: 100vh;
  background-color: #fff;

  .bg {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #304156 0%, #1a2a3a 50%, #409eff 100%);
    border-radius: 0 20px 20px 0;

    .bg-content {
      text-align: center;
      color: #fff;
      padding: 0 40px;

      h2 {
        margin: 0 0 12px;
        font-size: 28px;
        font-weight: 600;
      }

      p {
        margin: 0;
        font-size: 16px;
        opacity: 0.85;
      }
    }
  }

  .form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    user-select: none;

    h1 {
      margin: 0;
      font-size: 28px;
      color: #303133;
    }

    .button {
      width: 100%;
    }

    .flex {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
