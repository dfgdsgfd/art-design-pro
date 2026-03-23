<template>
  <div class="art-full-height">
    <ElCard class="art-table-card">
      <div class="flex items-center justify-between mb-4 px-2">
        <h3 class="text-lg font-medium">批量上传管理</h3>
        <ElSpace>
          <ElButton @click="loadFiles" :loading="filesLoading" v-ripple>刷新</ElButton>
          <ElButton type="primary" @click="showCreateDialog" v-ripple>批量创建笔记</ElButton>
        </ElSpace>
      </div>

      <div v-loading="filesLoading" class="flex-1 overflow-auto">
        <h4 class="text-base font-medium mb-3 px-2">图片文件 ({{ images.length }})</h4>
        <ElTable :data="images" stripe style="width: 100%">
          <ElTableColumn type="selection" width="55" />
          <ElTableColumn type="index" width="60" label="序号" />
          <ElTableColumn prop="name" label="文件名" min-width="300" show-overflow-tooltip />
          <ElTableColumn prop="size" label="大小" width="120">
            <template #default="{ row }">
              {{ formatSize(row.size) }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="createdAt" label="上传时间" width="180" />
          <ElTableColumn label="预览" width="100">
            <template #default="{ row }">
              <ElImage
                :src="getFileUrl(row.path)"
                :preview-src-list="[getFileUrl(row.path)]"
                preview-teleported
                fit="cover"
                style="width: 60px; height: 60px"
                class="rounded"
              />
            </template>
          </ElTableColumn>
          <ElTableColumn label="操作" width="80" fixed="right">
            <template #default="{ row }">
              <ElButton type="danger" size="small" link @click="handleDeleteFile(row.name)">
                删除
              </ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>

      <ElDialog v-model="createDialogVisible" title="批量创建笔记" width="400px" align-center>
        <ElForm :model="createForm" label-width="80px">
          <ElFormItem label="用户ID">
            <ElInput v-model="createForm.user_id" placeholder="请输入用户ID" />
          </ElFormItem>
          <ElFormItem label="分类ID">
            <ElInputNumber v-model="createForm.category_id" :min="0" placeholder="可选" />
          </ElFormItem>
        </ElForm>
        <template #footer>
          <ElButton @click="createDialogVisible = false">取消</ElButton>
          <ElButton @click="handleSyncCreate" :loading="creating">同步创建</ElButton>
          <ElButton type="primary" @click="handleAsyncCreate" :loading="creating"
            >异步创建</ElButton
          >
        </template>
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import {
    fetchGetBatchUploadFiles,
    fetchDeleteBatchUploadFiles,
    fetchBatchCreateNotes,
    fetchAsyncBatchCreateNotes
  } from '@/api/system-manage'
  import { ElMessageBox } from 'element-plus'

  defineOptions({ name: 'BatchUploadManage' })

  const filesLoading = ref(false)
  const images = ref<Api.Admin.BatchUploadFile[]>([])
  const createDialogVisible = ref(false)
  const creating = ref(false)

  const createForm = reactive({
    user_id: '',
    category_id: 0
  })

  const apiBaseUrl = import.meta.env.VITE_API_URL || ''

  const getFileUrl = (path: string) => {
    if (path.startsWith('http')) return path
    return `${apiBaseUrl}${path}`
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const loadFiles = async () => {
    filesLoading.value = true
    try {
      const res = await fetchGetBatchUploadFiles()
      images.value = res.images || []
    } catch {
      // ignore
    } finally {
      filesLoading.value = false
    }
  }

  const handleDeleteFile = (fileName: string) => {
    ElMessageBox.confirm(`确定要删除文件 "${fileName}" 吗？`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteBatchUploadFiles([fileName])
      loadFiles()
    })
  }

  const showCreateDialog = () => {
    createForm.user_id = ''
    createForm.category_id = 0
    createDialogVisible.value = true
  }

  const handleSyncCreate = async () => {
    creating.value = true
    try {
      await fetchBatchCreateNotes({
        user_id: createForm.user_id,
        category_id: createForm.category_id || undefined
      })
      createDialogVisible.value = false
      loadFiles()
    } catch {
      // ignore
    } finally {
      creating.value = false
    }
  }

  const handleAsyncCreate = async () => {
    creating.value = true
    try {
      await fetchAsyncBatchCreateNotes({
        user_id: createForm.user_id,
        category_id: createForm.category_id || undefined
      })
      createDialogVisible.value = false
    } catch {
      // ignore
    } finally {
      creating.value = false
    }
  }

  onMounted(() => {
    loadFiles()
  })
</script>
