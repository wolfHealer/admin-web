<!-- src/views/home/Home.vue -->
<template>
  <div class="home-page">
    <el-card class="welcome-card">
      <h1>欢迎使用医疗管理系统</h1>
      <p>当前用户：{{ userStore.user.nickname || '管理员' }}</p>
    </el-card>
    
    <el-row :gutter="20" class="stat-cards">
      <el-col :span="6" v-for="item in statList" :key="item.title">
        <el-card shadow="hover">
          <div class="stat-item">
            <el-icon :size="40" :color="item.color">
              <component :is="item.icon" />
            </el-icon>
            <div class="stat-info">
              <div class="stat-value">{{ item.value }}</div>
              <div class="stat-title">{{ item.title }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/store/user'
import { Document, User, ChatDotRound, Download } from '@element-plus/icons-vue'

const userStore = useUserStore()

const statList = ref([
  { title: '知识库文章', value: '1,234', icon: Document, color: '#409EFF' },
  { title: '专家数量', value: '56', icon: User, color: '#67C23A' },
  { title: '交流帖子', value: '8,901', icon: ChatDotRound, color: '#E6A23C' },
  { title: '资源文件', value: '345', icon: Download, color: '#F56C6C' }
])
</script>

<style lang="scss" scoped>
.home-page {
  .welcome-card {
    margin-bottom: 20px;
    
    h1 {
      margin: 0 0 10px 0;
      font-size: 24px;
    }
    
    p {
      margin: 0;
      color: #606266;
    }
  }
  
  .stat-cards {
    .stat-item {
      display: flex;
      align-items: center;
      gap: 15px;
      
      .stat-info {
        .stat-value {
          font-size: 24px;
          font-weight: bold;
        }
        
        .stat-title {
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }
}
</style>