<template>
  <!-- 【修改点1】确认 Dialog 组件名称。如果是 Element Plus，请使用 el-dialog -->
  <el-dialog 
    v-model="visible" 
    title="机构详情" 
    width="860px"
    :close-on-click-modal="false"
  >
    <!-- 假设 Descriptions 也是 element-plus 的 el-descriptions，或者是你自定义的组件 -->
    <el-descriptions :column="1" border v-if="detail.id">
      <el-descriptions-item label="机构名称">{{ detail.name }}</el-descriptions-item>
      <el-descriptions-item label="所在区域">{{ detail.regionText }}</el-descriptions-item>
      <el-descriptions-item label="是否免费">{{ detail.isFreeText }}</el-descriptions-item>
      <el-descriptions-item label="咨询方式">{{ detail.consultWay }}</el-descriptions-item>
      <el-descriptions-item label="机构地址">{{ detail.address }}</el-descriptions-item>
      <el-descriptions-item label="联系电话">{{ detail.contactPhone }}</el-descriptions-item>
      <el-descriptions-item label="官网/预约入口">
        <el-link v-if="detail.contactUrl" :href="detail.contactUrl" target="_blank" type="primary">链接</el-link>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="机构简介">{{ detail.contentIntro }}</el-descriptions-item>
      <el-descriptions-item label="审核状态">
        <el-tag :type="detail.auditStatus === 1 ? 'success' : detail.auditStatus === 2 ? 'danger' : 'warning'">
          {{ detail.auditStatus === 1 ? '已通过' : detail.auditStatus === 2 ? '已驳回' : '待审核' }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item v-if="detail.auditStatus === 2" label="驳回原因">{{ detail.rejectReason }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ detail.createdAt }}</el-descriptions-item>
      <el-descriptions-item label="更新时间">{{ detail.updatedAt }}</el-descriptions-item>
    </el-descriptions>
    
    <el-divider>关联疾病</el-divider>
    <div>
      <el-tag v-for="item in detail.diseases || []" :key="item.id" class="mr-8px mb-8px">{{ item.name }}</el-tag>
      <span v-if="!detail.diseases || detail.diseases.length === 0">无</span>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// 【修改点2】必须导入 ElMessage
import { ElMessage } from 'element-plus'
import { getPsychOrgDetail } from '@/api/resource/rehab/psychologicalOrg'

const visible = ref(false)
const detail = ref<any>({})

const open = async (id: number) => {
  console.log('尝试打开详情弹窗, ID:', id) // 调试日志
  visible.value = true
  detail.value = {} 
  
  try {
    const res = await getPsychOrgDetail(id)
    const data = res.data
    
    if (!data) {
      ElMessage.warning('未获取到详情数据')
      visible.value = false // 没数据则关闭
      return
    }

    detail.value = {
      ...data,
      regionText: `${data?.provinceName || ''} ${data?.cityName || ''} ${data?.districtName || ''}`.trim() || '-',
      isFreeText: data?.isFree === true ? '是' : (data?.isFree === false ? '否' : '-')
    }
  } catch (error) {
    console.error('获取详情失败', error)
    ElMessage.error('获取详情失败')
    visible.value = false 
  }
}

// 【修改点3】确保暴露
defineExpose({ open })
</script>