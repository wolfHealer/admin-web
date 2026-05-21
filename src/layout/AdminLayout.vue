<template>
  <el-container class="admin-layout">
    <el-aside width="220px" class="aside">
      <div class="logo">
        <h2>医疗管理系统</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item v-for="item in menuItems" :key="item.path" :index="item.path">
          <el-icon v-if="item.icon && iconMap[item.icon]">
            <component :is="iconMap[item.icon]" />
          </el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-icon" @click="toggleCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" :src="userStore.user.avatar" />
              <span class="username">{{ userStore.user.nickname || userStore.user.phone || '管理员' }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import {
  HomeFilled,
  Document,
  User,
  UserFilled,
  ChatDotRound,
  Download,
  Location,
  Fold,
  Expand,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getSidebarMenus, resolveActiveMenuPath } from '@/utils/menu'
import { clearSession } from '@/utils/auth'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const iconMap: Record<string, Component> = {
  HomeFilled,
  Document,
  User,
  UserFilled,
  ChatDotRound,
  Download,
  Location,
}

const layoutRoute = router.options.routes.find((item) => item.path === '/')
const menuItems = getSidebarMenus(layoutRoute?.children ?? [])

const isCollapse = ref(false)
const activeMenu = computed(() => resolveActiveMenuPath(route.matched, route.path))

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const handleCommand = async (command: string) => {
  if (command === 'logout') {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await clearSession()
    ElMessage.success('退出登录成功')
    router.replace('/login')
  } else if (command === 'profile') {
    router.push('/profile')
  }
}
</script>

<style lang="scss" scoped>
.admin-layout {
  height: 100vh;

  .aside {
    background-color: #304156;
    color: #fff;

    .logo {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #2b3a4b;

      h2 {
        color: #fff;
        font-size: 18px;
        margin: 0;
      }
    }

    :deep(.el-menu) {
      border-right: none;
    }
  }

  .header {
    background-color: #fff;
    border-bottom: 1px solid #e6e6e6;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;

    .header-left {
      .collapse-icon {
        font-size: 20px;
        cursor: pointer;

        &:hover {
          color: #409eff;
        }
      }
    }

    .header-right {
      .user-info {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;

        .username {
          font-size: 14px;
          color: #606266;
        }
      }
    }
  }

  .main {
    background-color: #f0f2f5;
    padding: 20px;
  }
}
</style>
