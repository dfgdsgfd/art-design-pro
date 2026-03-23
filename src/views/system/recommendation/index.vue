<template>
  <div class="art-full-height">
    <ElCard class="art-table-card">
      <div class="flex items-center justify-between mb-4 px-2">
        <h3 class="text-lg font-medium">推荐算法配置</h3>
        <ElButton type="primary" @click="handleSave" :loading="saving" v-ripple>保存配置</ElButton>
      </div>

      <div v-loading="loading" class="p-4">
        <ElForm label-width="200px">
          <h4 class="text-base font-medium mb-3">权重配置</h4>
          <ElFormItem label="点赞权重">
            <ElInputNumber v-model="config.like_weight" :min="0" :max="10" :step="0.5" />
          </ElFormItem>
          <ElFormItem label="收藏权重">
            <ElInputNumber v-model="config.collect_weight" :min="0" :max="10" :step="0.5" />
          </ElFormItem>
          <ElFormItem label="浏览权重">
            <ElInputNumber v-model="config.view_weight" :min="0" :max="10" :step="0.5" />
          </ElFormItem>
          <ElFormItem label="分类权重">
            <ElInputNumber v-model="config.category_weight" :min="0" :max="10" :step="0.5" />
          </ElFormItem>
          <ElFormItem label="标签权重">
            <ElInputNumber v-model="config.tag_weight" :min="0" :max="10" :step="0.5" />
          </ElFormItem>
          <ElFormItem label="关注权重">
            <ElInputNumber v-model="config.following_weight" :min="0" :max="10" :step="0.5" />
          </ElFormItem>
          <ElFormItem label="互相关注权重">
            <ElInputNumber v-model="config.mutual_follow_weight" :min="0" :max="10" :step="0.5" />
          </ElFormItem>
          <ElFormItem label="热度权重">
            <ElInputNumber v-model="config.popularity_weight" :min="0" :max="10" :step="0.5" />
          </ElFormItem>
          <ElFormItem label="兴趣权重">
            <ElInputNumber v-model="config.interest_weight" :min="0" :max="10" :step="0.5" />
          </ElFormItem>

          <ElDivider />
          <h4 class="text-base font-medium mb-3">时间衰减</h4>
          <ElFormItem label="半衰期（天）">
            <ElInputNumber v-model="config.time_decay_half_life" :min="1" :max="365" />
          </ElFormItem>

          <ElDivider />
          <h4 class="text-base font-medium mb-3">内容类型加成</h4>
          <ElFormItem label="图文加成">
            <ElInputNumber v-model="config.content_type_boost_image" :min="0" :max="5" :step="0.1" />
          </ElFormItem>
          <ElFormItem label="视频加成">
            <ElInputNumber v-model="config.content_type_boost_video" :min="0" :max="5" :step="0.1" />
          </ElFormItem>
          <ElFormItem label="外部链接加成">
            <ElInputNumber v-model="config.content_type_boost_external" :min="0" :max="5" :step="0.1" />
          </ElFormItem>

          <ElDivider />
          <h4 class="text-base font-medium mb-3">候选池配置</h4>
          <ElFormItem label="候选池倍数">
            <ElInputNumber v-model="config.candidate_pool_multiplier" :min="1" :max="20" />
          </ElFormItem>
          <ElFormItem label="最大推荐数">
            <ElInputNumber v-model="config.max_recommended" :min="10" :max="10000" />
          </ElFormItem>
          <ElFormItem label="最大热门数">
            <ElInputNumber v-model="config.max_hot" :min="10" :max="10000" />
          </ElFormItem>
        </ElForm>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { fetchGetRecommendationConfig, fetchUpdateRecommendationConfig } from '@/api/system-manage'

  defineOptions({ name: 'RecommendationManage' })

  const loading = ref(false)
  const saving = ref(false)
  const config = reactive<Api.Admin.RecommendationConfig>({
    like_weight: 3,
    collect_weight: 4,
    view_weight: 1,
    category_weight: 2,
    tag_weight: 2.5,
    following_weight: 3,
    mutual_follow_weight: 4,
    popularity_weight: 1.5,
    interest_weight: 2,
    time_decay_half_life: 7,
    content_type_boost_image: 1.5,
    content_type_boost_video: 1.5,
    content_type_boost_external: 0.8,
    candidate_pool_multiplier: 5,
    max_recommended: 500,
    max_hot: 300
  })

  const loadConfig = async () => {
    loading.value = true
    try {
      const res = await fetchGetRecommendationConfig()
      Object.assign(config, res)
    } catch {
      // ignore
    } finally {
      loading.value = false
    }
  }

  const handleSave = async () => {
    saving.value = true
    try {
      await fetchUpdateRecommendationConfig({ ...config })
    } catch {
      // ignore
    } finally {
      saving.value = false
    }
  }

  onMounted(() => {
    loadConfig()
  })
</script>
