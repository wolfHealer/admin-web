<script setup>
import {User,Lock} from '@element-plus/icons-vue'
import { ref,watch} from 'vue'
import { userRegisterService,userLoginService} from '@/api/user/user'
import { ElMessage } from 'element-plus'
import 'element-plus/dist/index.css' // 核心：导入 Element Plus 样式，ElMessage 才能显示
import { useUserStore } from '@/store/user'
import { useRouter } from 'vue-router'

const form = ref()
const isRegister = ref(false)      // 默认是注册
// 整个的用于提交的form 数据对象
const formModel= ref({
    phone: '',
    password: '',
    repassword: '',
    remember: false  // 添加 remember 字段，避免模板报错
})
const userStore = useUserStore()
const router = useRouter()
const rules = {
    phone:[
        {required:true,message:'请输入手机号',trigger:'blur'},
        {pattern:/^1[3-9]\d{9}$/,message:'请输入正确的手机号格式',trigger:'blur'},
    ],
    password:[
        {required:true,message:'请输入密码',trigger:'blur'},
        { pattern:/^\S{6,15}$/,message:'密码必须是6-15位的非空字符',trigger:'blur'},
    ],
    repassword:[
        {required:true,message:'请输入确认密码',trigger:'blur'},
        {pattern:/^\S{6,15}$/,message:'密码必须是6-15位的非空字符',trigger:'blur'},
        {
         validator:(rule,value,callback) => {
            // 判断 value和当前 form中收集的password是否一致
            if(value !== formModel.value.password){
                callback(new Error('两次输入的密码不一致'))
            }else{
                callback()
            }
          },
          trigger:'blur'
        }
    ]
}
const register = async () => {
    // 注册成功之前，先进行校验，校验成功->发送请求，校验失败->自动提示
    await form.value.validate()
    await userRegisterService(formModel.value)
    ElMessage.success('注册成功')
    isRegister.value = false
}
// 切换时重置表单内容
watch(isRegister,()=>{
    form.value ={
        phone: '',
        password: '',
        repassword: ''
    }
}

)
const login = async () => {
    await form.value.validate()
    const res = await userLoginService(formModel.value)
    userStore.setToken(res.data.token)
    ElMessage.success('登录成功')
    router.push('/')
}
</script>

<template>
    <el-row class ="login-page">
    <el-col :span="12" class="bg"></el-col>
    <el-col :span="6" :offset="3" class="form">
        <!-- 注册相关表单 -->
        <el-form
        :model="formModel"
        :rules="rules"
        size="large"
        ref="form"
        auto-complete="off"
        v-if = "isRegister"
        >
            <el-form-item> 
                <h1>注册</h1>
            </el-form-item>
            <el-form-item prop="phone">
                <el-input 
                v-model="formModel.phone"
                :prefix-icon="User"
                placeholder="请输入手机号"></el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input 
                v-model="formModel.password"
                :prefix-icon="Lock"
                placeholder="请输入密码">
            </el-input>
            </el-form-item>
            <el-form-item prop="repassword">
                <el-input 
                v-model="formModel.repassword"
                :prefix-icon="Lock"
                placeholder="请输入确认密码">
            </el-input>
            </el-form-item>
            <el-form-item class="flex">
                <div class="flex">
                    <el-checkbox>记住我</el-checkbox>
                    <el-link type="primary" :underline="false">忘记密码</el-link>
                </div>
            </el-form-item>
            <el-form-item>
                <el-button @click="register" class="button" type="primary">注册</el-button>
            </el-form-item>
             <el-form-item class="flex">
          <el-link type="info" :underline="false" >
            注册 →
          </el-link>
        </el-form-item>
        </el-form>
        <!-- 登录相关表单 -->
        <el-form
        :model="formModel"
        :rules="rules"
        ref="form"
        size="large"
        auto-complete="off"
        v-else
        > 
            <el-form-item> 
                <h1>登录</h1>
            </el-form-item>
            <el-form-item prop="phone">
                <el-input  v-model="formModel.phone" :prefix-icon="User" placeholder="请输入手机号"></el-input>
            </el-form-item>
            <el-form-item prop="password">
                <el-input v-model="formModel.password" :prefix-icon="Lock" placeholder="请输入密码"></el-input>
            </el-form-item>
            <el-form-item class="flex">
                <div class="flex">
                    <el-checkbox v-model="formModel.remember">记住我</el-checkbox>
                    <el-link type="primary" :underline="false">忘记密码</el-link>
                </div>
            </el-form-item>
            <el-form-item class="flex">
                <el-button @click="login" class="button" type="primary">登录</el-button>
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
        background:url('@/assets/login_bg.jpg') no-repeat center / cover;
        border-radius: 0 20px 20px 0;
    }
    .form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    user-select: none;
    .title {
      margin: 0 auto;
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
