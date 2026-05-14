<template>
  <el-dialog v-model="visible" title="疾病详情" width="900px">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="疾病名称" :span="2">{{ data.name || '-' }}</el-descriptions-item>
      <el-descriptions-item label="别名" :span="2">{{ data.alias || '-' }}</el-descriptions-item>
      <el-descriptions-item label="主分类">{{ data.primaryCategoryName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="data.status === 1 ? 'success' : 'info'">{{ data.status === 1 ? '启用' : '停用' }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="关联分类" :span="2">
        <el-space wrap>
          <el-tag v-for="item in data.categories || []" :key="item.id" effect="plain">{{ item.name }}</el-tag>
          <span v-if="!(data.categories || []).length">-</span>
        </el-space>
      </el-descriptions-item>
      <el-descriptions-item label="疾病标签" :span="2">
        <el-space wrap>
          <el-tag v-for="item in data.tags || []" :key="item.id" type="info">{{ item.name }}</el-tag>
          <span v-if="!(data.tags || []).length">-</span>
        </el-space>
      </el-descriptions-item>
      <el-descriptions-item label="疾病简介" :span="2">{{ data.introduction || '-' }}</el-descriptions-item>
      <el-descriptions-item label="常见症状" :span="2">{{ data.symptoms || '-' }}</el-descriptions-item>
      <el-descriptions-item label="相关图片" :span="2">
        <div class="image-list" v-if="data.images && data.images.length > 0">
          <el-image
            v-for="(img, index) in data.images"
            :key="index"
            :src="img"
            :preview-src-list="data.images"
            fit="cover"
            class="preview-image"
          />
        </div>
        <span v-else>-</span>
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: boolean
  data: Record<string, any>
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})
</script>

<style scoped lang="scss">
.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.preview-image {
  width: 100px;
  height: 100px;
  border-radius: 6px;
  border: 1px solid #ebeef5;
}
</style>
