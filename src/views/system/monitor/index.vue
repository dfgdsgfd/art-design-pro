<template>
  <div class="art-full-height">
    <ElCard class="art-table-card">
      <div class="flex items-center justify-between mb-4 px-2">
        <h3 class="text-lg font-medium">监控动态</h3>
        <ElButton @click="loadActivities" :loading="actLoading" v-ripple>刷新</ElButton>
      </div>

      <ElTimeline>
        <ElTimelineItem
          v-for="item in activities"
          :key="item.id"
          :timestamp="item.created_at"
          placement="top"
        >
          <ElCard shadow="hover" class="mb-2">
            <div class="flex items-center gap-3">
              <ElAvatar :src="item.avatar" :size="40" />
              <div>
                <div class="font-medium">
                  {{ item.nickname }}
                  <span class="text-gray-400 text-xs">({{ item.user_id }})</span>
                </div>
                <div class="text-sm text-gray-500 mt-1">{{ item.content }}</div>
              </div>
              <ElTag class="ml-auto" size="small" :type="getActivityType(item.type)">
                {{ getActivityLabel(item.type) }}
              </ElTag>
            </div>
          </ElCard>
        </ElTimelineItem>
      </ElTimeline>

      <ElEmpty v-if="!actLoading && activities.length === 0" description="暂无动态" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { fetchGetMonitorActivities } from '@/api/system-manage'

  defineOptions({ name: 'MonitorManage' })

  const actLoading = ref(false)
  const activities = ref<Api.Admin.MonitorActivity[]>([])

  const ACTIVITY_TYPE_MAP: Record<string, { label: string; type: string }> = {
    post_publish: { label: '发布笔记', type: 'success' },
    user_register: { label: '用户注册', type: 'primary' },
    comment_create: { label: '发表评论', type: 'info' },
    like_create: { label: '点赞', type: 'warning' },
    follow_create: { label: '关注', type: '' }
  }

  const getActivityLabel = (type: string) => ACTIVITY_TYPE_MAP[type]?.label || type
  const getActivityType = (type: string) => (ACTIVITY_TYPE_MAP[type]?.type || 'info') as any

  const loadActivities = async () => {
    actLoading.value = true
    try {
      const res = await fetchGetMonitorActivities()
      activities.value = Array.isArray(res) ? res : []
    } catch {
      // ignore
    } finally {
      actLoading.value = false
    }
  }

  onMounted(() => {
    loadActivities()
  })
</script>
