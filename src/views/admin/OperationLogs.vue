<template>
  <el-card>
    <h3>操作日志</h3>
    <el-table :data="logs" style="width:100%">
      <el-table-column prop="time" label="时间" width="210" />
      <el-table-column prop="admin" label="管理员" width="120" />
      <el-table-column prop="action" label="操作/详情" />
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import adminService from '../../services/adminService'

const logs = ref<any[]>([])

async function load() {
  logs.value = await adminService.listLogs()
}

onMounted(() => load())
</script>
