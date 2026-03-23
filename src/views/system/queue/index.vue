<template>
  <div class="art-full-height">
    <ElCard class="art-table-card">
      <div class="flex items-center justify-between mb-4 px-2">
        <h3 class="text-lg font-medium">队列监控</h3>
        <ElButton @click="loadQueues" :loading="queueLoading" v-ripple>刷新</ElButton>
      </div>

      <ElTable :data="queues" v-loading="queueLoading" stripe>
        <ElTableColumn type="index" width="60" label="序号" />
        <ElTableColumn prop="name" label="队列名称" min-width="180" />
        <ElTableColumn prop="waiting" label="等待中" width="100">
          <template #default="{ row }">
            <ElTag :type="row.waiting > 0 ? 'warning' : 'info'" size="small">{{
              row.waiting
            }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="active" label="执行中" width="100">
          <template #default="{ row }">
            <ElTag :type="row.active > 0 ? 'primary' : 'info'" size="small">{{ row.active }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="completed" label="已完成" width="100">
          <template #default="{ row }">
            <ElTag type="success" size="small">{{ row.completed }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="failed" label="失败" width="100">
          <template #default="{ row }">
            <ElTag :type="row.failed > 0 ? 'danger' : 'info'" size="small">{{ row.failed }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="delayed" label="延迟" width="100">
          <template #default="{ row }">
            <ElTag :type="row.delayed > 0 ? 'warning' : 'info'" size="small">{{
              row.delayed
            }}</ElTag>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { fetchGetQueues } from '@/api/system-manage'

  defineOptions({ name: 'QueueManage' })

  const queueLoading = ref(false)
  const queues = ref<Api.Admin.QueueInfo[]>([])

  const loadQueues = async () => {
    queueLoading.value = true
    try {
      const res = await fetchGetQueues()
      queues.value = res.queues || []
    } catch {
      // ignore
    } finally {
      queueLoading.value = false
    }
  }

  onMounted(() => {
    loadQueues()
  })
</script>
