<!-- src/views/resource/rehab/Rehab.vue -->
<template>
  <div class="rehab-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>公益救助中心</span>
        </div>
      </template>

      <div class="module-grid">
        <!-- 康复机构管理 -->
        <el-card class="module-card" @click="navigateTo('organization')">
          <div class="module-icon">
            <el-icon :size="40"><OfficeBuilding /></el-icon>
          </div>
          <h3>康复机构管理</h3>
          <p>康复机构资源维护</p>
        </el-card>

        <!-- 康复设备管理 -->
        <el-card class="module-card" @click="navigateTo('equipment')">
          <div class="module-icon">
            <el-icon :size="40"><Monitor /></el-icon>
          </div>
          <h3>康复设备管理</h3>
          <p>康复设备资源维护</p>
        </el-card>

        <!-- 康复训练指南 -->
        <el-card class="module-card" @click="navigateTo('rehabilitation-guide')">
          <div class="module-icon">
            <el-icon :size="40"><VideoPlay /></el-icon>
          </div>
          <h3>康复训练指南</h3>
          <p>专业康复训练指导</p>
        </el-card>

        <!-- 居家护理手册 -->
        <el-card class="module-card" @click="navigateTo('home-care-manual')">
          <div class="module-icon">
            <el-icon :size="40"><Reading /></el-icon>
          </div>
          <h3>居家护理手册</h3>
          <p>居家护理知识指南</p>
        </el-card>

        <!-- 心理支持资源 -->
        <el-card class="module-card" @click="navigateTo('psychological-support')">
          <div class="module-icon">
            <el-icon :size="40"><ChatDotRound /></el-icon>
          </div>
          <h3>心理支持资源</h3>
          <p>心理咨询与支持服务</p>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { OfficeBuilding, Monitor, VideoPlay, Reading, ChatDotRound } from '@element-plus/icons-vue'

const router = useRouter()

const navigateTo = (module: string) => {
  router.push(`/resource/rehab/${module}`)
}
</script>

<style lang="scss" scoped>
.rehab-page {
  padding: 20px;

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