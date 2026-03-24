<!-- src/views/knowledge/components/DiseaseViewDialog.vue -->
<template>
  <el-dialog v-model="visible" title="疾病详情" width="900px">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="疾病名称" :span="2">
        <span class="detail-value">{{ data.name }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="别名" :span="2">
        <span class="detail-value">{{ data.alias || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="病种简介" :span="2">
        <span class="detail-value">{{ data.introduction || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="常见症状" :span="2">
        <span class="detail-value">{{ data.symptoms || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="诊疗指南" :span="2">
        <span class="detail-value">{{ data.guidelines || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="用药推荐" :span="2">
        <span class="detail-value">{{ data.medications || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="病友经验" :span="2">
        <span class="detail-value">{{ data.experiences || '-' }}</span>
      </el-descriptions-item>
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

// 修改：适配后端返回的数据结构（不需要 id、categoryId 等字段）
interface Props {
  modelValue: boolean
  data: {
    name: string
    alias?: string
    introduction?: string
    symptoms?: string
    guidelines?: string
    medications?: string
    experiences?: string
    images?: string[]
  }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<style lang="scss" scoped>
.detail-value {
  line-height: 1.6;
  word-break: break-all;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  .preview-image {
    width: 100px;
    height: 100px;
    border-radius: 4px;
    cursor: pointer;
    border: 1px solid #e6e6e6;
  }
}
</style>
