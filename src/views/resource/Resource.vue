<!-- src/views/resource/Resource.vue -->
<template>
  <div class="resource-container">
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="医疗资源服务" name="/resource/medical" />
      <el-tab-pane label="用药信息平台" name="/resource/drug" />
      <el-tab-pane label="公益救助中心" name="/resource/charity" />
      <el-tab-pane label="康复支持专区" name="/resource/rehab" />
    </el-tabs>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const activeTab = ref('/resource/medical')

const handleTabChange = (path: string) => {
  router.push(path)
}

onMounted(() => {
  activeTab.value = route.path
})
</script>

<style lang="scss" scoped>
.resource-container {
  padding: 20px;
}
</style>