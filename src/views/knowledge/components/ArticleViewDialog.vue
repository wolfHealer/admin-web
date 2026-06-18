<template>
  <el-dialog v-model="visible" title="文章详情" width="920px" top="4vh">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="标题" :span="2">{{ data.title || '-' }}</el-descriptions-item>
      <el-descriptions-item label="摘要" :span="2">{{ data.summary || '-' }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="statusMeta.tag">{{ statusMeta.label }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="内容类型">{{ contentTypeLabel }}</el-descriptions-item>
      <el-descriptions-item label="浏览 / 点赞 / 收藏">
        {{ data.viewCount ?? 0 }} / {{ data.likeCount ?? 0 }} / {{ data.favoriteCount ?? 0 }}
      </el-descriptions-item>
      <el-descriptions-item label="发布时间">{{ data.publishTime || '-' }}</el-descriptions-item>
      <el-descriptions-item label="置顶">
        <el-tag v-if="data.isTop === 1" type="warning" size="small">置顶</el-tag>
        <span v-else>否</span>
      </el-descriptions-item>
      <el-descriptions-item label="推荐">
        <el-tag v-if="data.isRecommend === 1" type="success" size="small">推荐</el-tag>
        <span v-else>否</span>
      </el-descriptions-item>
      <el-descriptions-item label="作者" :span="2">
        <div v-if="data.author" class="author-info">
          <el-avatar :src="data.author.avatar" :size="32">{{ data.author.displayName.slice(0, 1) }}</el-avatar>
          <span>{{ data.author.displayName }}</span>
          <span class="author-id">ID: {{ data.author.id }}</span>
        </div>
        <span v-else-if="data.authorId">用户 ID: {{ data.authorId }}</span>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="关联病种" :span="2">
        <el-space wrap>
          <el-tag v-for="item in data.diseases || []" :key="item.id" effect="plain">{{ item.name }}</el-tag>
          <span v-if="!(data.diseases || []).length">-</span>
        </el-space>
      </el-descriptions-item>
      <el-descriptions-item label="标签" :span="2">
        <el-space wrap>
          <el-tag v-for="item in data.tags || []" :key="item.id" type="info">{{ item.name }}</el-tag>
          <span v-if="!(data.tags || []).length">-</span>
        </el-space>
      </el-descriptions-item>
      <el-descriptions-item label="封面" :span="2">
        <el-image
          v-if="data.coverImage"
          :src="data.coverImage"
          fit="cover"
          :preview-src-list="[data.coverImage]"
          style="width: 160px; height: 90px; border-radius: 6px"
        />
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="来源" :span="2">
        <template v-if="data.sourceName || data.sourceUrl">
          {{ data.sourceName || '-' }}
          <el-link v-if="data.sourceUrl" :href="data.sourceUrl" target="_blank" type="primary" style="margin-left: 8px">
            查看来源
          </el-link>
        </template>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="SEO 标题" :span="2">{{ data.seoTitle || '-' }}</el-descriptions-item>
      <el-descriptions-item label="SEO 关键词" :span="2">{{ data.seoKeywords || '-' }}</el-descriptions-item>
      <el-descriptions-item label="SEO 描述" :span="2">{{ data.seoDescription || '-' }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ data.createdAt || '-' }}</el-descriptions-item>
      <el-descriptions-item label="更新时间">{{ data.updatedAt || '-' }}</el-descriptions-item>
    </el-descriptions>

    <el-divider content-position="left">内容块</el-divider>
    <div v-if="sortedBlocks.length" class="block-list">
      <el-card
        v-for="(block, index) in sortedBlocks"
        :key="block.id ?? index"
        shadow="never"
        class="block-card"
      >
        <template #header>
          <div class="block-card-header">
            <span>#{{ block.sortNo || index + 1 }} · {{ getBlockTypeLabel(block.blockType) }}</span>
            <span v-if="block.title" class="block-title">{{ block.title }}</span>
          </div>
        </template>

        <div v-if="block.blockType === 'image'" class="block-image">
          <el-image
            v-if="getBlockImageUrl(block)"
            :src="getBlockImageUrl(block)"
            fit="contain"
            :preview-src-list="[getBlockImageUrl(block)]"
            style="max-width: 100%; max-height: 280px"
          />
          <span v-else>-</span>
          <div v-if="block.extra?.width || block.extra?.height" class="block-extra">
            尺寸：{{ block.extra?.width || '-' }} × {{ block.extra?.height || '-' }}
          </div>
        </div>

        <div v-else-if="block.blockType === 'faq'" class="block-faq">
          <div><strong>问：</strong>{{ block.extra?.question || '-' }}</div>
          <div><strong>答：</strong>{{ block.extra?.answer || '-' }}</div>
        </div>

        <div v-else-if="isTextLikeBlock(block.blockType)" class="block-content">
          {{ block.content || '-' }}
        </div>

        <div v-else class="block-content">{{ block.content || '-' }}</div>

        <div
          v-if="block.extra && block.blockType !== 'faq' && block.blockType !== 'image'"
          class="block-extra"
        >
          扩展：{{ formatExtra(block.extra) }}
        </div>
      </el-card>
    </div>
    <el-empty v-else description="暂无内容块" />

    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  getArticleStatusMeta,
  getBlockImageUrl,
  getBlockTypeLabel,
  getContentTypeLabel,
  isTextLikeBlock,
  type ArticleDetail,
} from '@/api/knowledge/article'

interface Props {
  modelValue: boolean
  data: Partial<ArticleDetail>
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const data = computed(() => props.data || {})

const statusMeta = computed(() => getArticleStatusMeta(Number(data.value.status ?? 0)))

const contentTypeLabel = computed(() => getContentTypeLabel(data.value.contentType))

const sortedBlocks = computed(() =>
  [...(data.value.blocks || [])].sort((a, b) => (a.sortNo || 0) - (b.sortNo || 0))
)

const formatExtra = (extra: Record<string, unknown>) => {
  try {
    return JSON.stringify(extra)
  } catch {
    return String(extra)
  }
}
</script>

<style scoped lang="scss">
.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-id {
  color: #909399;
  font-size: 12px;
}

.block-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.block-card-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.block-title {
  color: #606266;
}

.block-content,
.block-faq {
  white-space: pre-wrap;
  line-height: 1.7;
}

.block-faq div + div {
  margin-top: 8px;
}

.block-extra {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}
</style>
