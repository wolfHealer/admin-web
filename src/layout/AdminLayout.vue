<template>
  <el-container style="height: 100vh">
    <el-aside width="200px">
      <el-menu router>
        <el-menu-item index="/post">内容审核
          <el-badge v-if="counts.posts > 0" :value="counts.posts" class="badge" />
        </el-menu-item>
        <el-menu-item index="/resource">资源审核
          <el-badge v-if="counts.resources > 0" :value="counts.resources" class="badge" />
        </el-menu-item>
        <el-menu-item index="/user">用户管理</el-menu-item>
        <el-menu-item index="/feedback">反馈处理
          <el-badge v-if="counts.feedback > 0" :value="counts.feedback" class="badge" />
        </el-menu-item>
        <el-menu-item index="/logs">操作日志</el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header>罕见病论坛后台</el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import adminService from '../services/adminService'

const counts = reactive({ posts: 0, resources: 0, feedback: 0 })

async function loadCounts() {
  const posts = await adminService.listPosts()
  const resources = await adminService.listResources()
  const feedback = await adminService.listFeedback()
  counts.posts = posts.length
  counts.resources = resources.length
  counts.feedback = feedback.length
}

onMounted(() => {
  loadCounts()
})
</script>
