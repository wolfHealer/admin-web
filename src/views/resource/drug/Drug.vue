<!-- src/views/resource/drug/Drug.vue -->
<template>
  <div class="drug-platform-page">
    <el-card>
      <template #header>
        <span>用药信息平台</span>
      </template>
      
      <div class="module-grid">
        <el-card 
          v-for="module in modules" 
          :key="module.path"
          class="module-card"
          @click="$router.push(`/resource/drug/${module.path}`)"
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
import { Shop, Tools } from '@element-plus/icons-vue'

const modules = [
  { name: '罕见病药品名录', path: 'rare-drug', icon: Shop, desc: '管理罕见病药品信息和名录' },
  { name: '正规购药渠道', path: 'purchase-channel', icon: Shop, desc: '管理正规药店和医院渠道' },
  { name: '赠药/援助项目', path: 'assistance-program', icon: Shop, desc: '管理药品援助和赠药项目' },
  { name: '用药管理工具', path: 'management-tool', icon: Tools, desc: '管理用药提醒和查询工具' }
]
</script>

<style lang="scss" scoped>
.drug-platform-page {
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