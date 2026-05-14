<!-- src/views/resource/charity/Charity.vue -->
<template>
  <div class="charity-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>公益救助中心</span>
        </div>
      </template>

      <div class="module-grid">
        <el-card class="module-card" @click="navigateTo('project')">
          <div class="module-icon">
            <el-icon :size="40"><Wallet /></el-icon>
          </div>
          <h3>救助项目库</h3>
          <p>各类公益救助项目信息</p>
        </el-card>


        <el-card class="module-card" @click="navigateTo('case')">
          <div class="module-icon">
            <el-icon :size="40"><Notebook /></el-icon>
          </div>
          <h3>救助案例分享</h3>
          <p>真实救助案例记录</p>
        </el-card>

        <el-card class="module-card" @click="navigateTo('channel')">
          <div class="module-icon">
            <el-icon :size="40"><Guide /></el-icon>
          </div>
          <h3>求助通道指引</h3>
          <p>求助渠道和联系方式</p>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Wallet, Notebook, Guide } from '@element-plus/icons-vue'

const router = useRouter()

const navigateTo = (module: string) => {
  router.push(`/resource/charity/${module}`)
}
</script>

<style lang="scss" scoped>
.charity-page {
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