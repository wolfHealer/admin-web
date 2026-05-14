<!-- src/views/resource/medicare/Medicare.vue -->
<template>
  <div class="medicare-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>医保政策解读</span>
        </div>
      </template>

      <div class="module-grid">
        
        <el-card class="module-card" @click="navigateTo('policy')">
          <div class="module-icon">
            <el-icon :size="40"><Document /></el-icon>
          </div>
          <h3>医保政策解读</h3>
          <p>医保政策详细说明</p>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Document} from '@element-plus/icons-vue'

const router = useRouter()

const navigateTo = (module: string) => {
  router.push(`/resource/medicare/${module}`)
}
</script>

<style lang="scss" scoped>
.medicare-page {
  padding: 20px;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .module-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-top: 20px;

    .module-card {
      cursor: pointer;
      transition: all 0.3s;
      text-align: center;
      padding: 30px 20px;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .module-icon {
        color: var(--el-color-primary);
        margin-bottom: 15px;
      }

      h3 {
        margin: 10px 0;
        font-size: 16px;
      }

      p {
        color: #909399;
        font-size: 13px;
      }
    }
  }
}
</style>