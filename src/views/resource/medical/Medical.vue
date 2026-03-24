<template>
  <div class="medical-page">
    <el-card>
      <template #header>
        <span>医疗资源服务</span>
      </template>
      
      <div class="module-grid">
        <el-card 
          v-for="module in modules" 
          :key="module.path"
          class="module-card"
          @click="$router.push(`/resource/medical/${module.path}`)"
        >
          <el-icon :size="40"><component :is="module.icon" /></el-icon>
          <h3>{{ module.name }}</h3>
          <p>{{ module.desc }}</p>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { OfficeBuilding, User, Document, Files } from '@element-plus/icons-vue'

const modules = [
  { name: '医院名录', path: 'hospital', icon: OfficeBuilding, desc: '管理医院信息和名录' },
  { name: '医生名录', path: 'doctor', icon: User, desc: '管理医生信息和名录' },
  { name: '诊疗指南', path: 'guideline', icon: Document, desc: '诊疗规范和指南文档' },
  { name: '检查项目', path: 'examination', icon: Files, desc: '医学检查项目配置' },
  { name: '病例模版', path: 'case', icon: Files, desc: '标准化病例模版管理' }
]
</script>

<style lang="scss" scoped>
.medical-page {
  padding: 20px;
  
  .module-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    
    .module-card {
      cursor: pointer;
      text-align: center;
      transition: all 0.3s;
      
      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }
      
      h3 {
        margin: 15px 0 10px;
      }
      
      p {
        color: #909399;
        font-size: 14px;
      }
    }
  }
}
</style>