<template>
  <div class="resource-container">
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="医疗资源服务" name="/resource/medical" />
      <el-tab-pane label="用药信息平台" name="/resource/drug" />
      <el-tab-pane label="公益救助中心" name="/resource/charity" />
      <el-tab-pane label="康复支持专区" name="/resource/rehab" />
      <el-tab-pane label="医保政策" name="/resource/medicare" />
    </el-tabs>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const RESOURCE_TABS = [
  '/resource/medical',
  '/resource/drug',
  '/resource/charity',
  '/resource/rehab',
  '/resource/medicare',
] as const

/** 将任意 resource 子路径映射到对应 Tab 根路径 */
const resolveResourceTab = (path: string): string => {
  const matched = RESOURCE_TABS.find((tab) => path === tab || path.startsWith(`${tab}/`))
  return matched ?? RESOURCE_TABS[0]
}

const router = useRouter()
const route = useRoute()
const activeTab = ref(resolveResourceTab(route.path))

watch(
  () => route.path,
  (path) => {
    activeTab.value = resolveResourceTab(path)
  }
)

const handleTabChange = (path: string) => {
  if (path === route.path) return
  router.push(path)
}
</script>

<style lang="scss" scoped>
.resource-container {
  padding: 20px;
}
</style>
