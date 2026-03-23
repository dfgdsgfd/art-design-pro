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
            <ElTag :type="row.waiting > 0 ? 'warning' : 'info'" size="small">{{ row.waiting }}</ElTag>
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
            <ElTag :type="row.delayed > 0 ? 'warning' : 'info'" size="small">{{ row.delayed }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <ElButton size="small" @click="showJobs(row.name)">查看任务</ElButton>
            <ElButton size="small" type="danger" @click="handleClearQueue(row.name)">清空</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElCard>

    <!-- 任务列表抽屉 -->
    <ElDrawer v-model="jobsVisible" :title="`队列任务 - ${currentQueueName}`" size="60%">
      <ElTable :data="jobs" v-loading="jobsLoading" stripe>
        <ElTableColumn prop="id" label="任务ID" width="100" />
        <ElTableColumn prop="name" label="任务名称" min-width="150" show-overflow-tooltip />
        <ElTableColumn prop="status" label="状态" width="100">
          <template #default="{ row }">
            <ElTag
              :type="row.status === 'completed' ? 'success' : row.status === 'failed' ? 'danger' : row.status === 'active' ? 'primary' : 'warning'"
              size="small"
            >
              {{ row.status }}
            </ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn prop="attemptsMade" label="重试次数" width="80" />
        <ElTableColumn prop="timestamp" label="创建时间" width="180">
          <template #default="{ row }">
            {{ row.timestamp ? new Date(row.timestamp).toLocaleString() : '-' }}
          </template>
        </ElTableColumn>
        <ElTableColumn prop="failedReason" label="失败原因" min-width="200" show-overflow-tooltip />
        <ElTableColumn label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <ElButton v-if="row.status === 'failed'" size="small" type="primary" @click="handleRetry(row.id)">
              重试
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
  import { fetchGetQueues, fetchGetQueueJobs, fetchRetryQueueJob, fetchClearQueue } from '@/api/system-manage'
  import { ElMessageBox } from 'element-plus'

  defineOptions({ name: 'QueueManage' })

  const queueLoading = ref(false)
  const queues = ref<Api.Admin.QueueInfo[]>([])

  const jobsVisible = ref(false)
  const jobsLoading = ref(false)
  const currentQueueName = ref('')
  const jobs = ref<Api.Admin.QueueJob[]>([])

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

  const showJobs = async (name: string) => {
    currentQueueName.value = name
    jobsLoading.value = true
    jobsVisible.value = true
    try {
      const res = await fetchGetQueueJobs(name, { page: 1, limit: 50 })
      jobs.value = (res as any)?.jobs || (res as any)?.data || []
    } catch {
      jobs.value = []
    } finally {
      jobsLoading.value = false
    }
  }

  const handleRetry = async (jobId: string) => {
    await fetchRetryQueueJob(currentQueueName.value, jobId)
    showJobs(currentQueueName.value)
  }

  const handleClearQueue = (name: string) => {
    ElMessageBox.confirm(`确定要清空队列 "${name}" 吗？`, '清空确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchClearQueue(name)
      loadQueues()
    })
  }

  onMounted(() => {
    loadQueues()
  })
</script>
