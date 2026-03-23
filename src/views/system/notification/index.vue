<template>
  <div class="art-full-height">
    <ElCard class="art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElInput
              v-model="searchTitle"
              placeholder="搜索通知标题"
              clearable
              style="width: 200px"
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            />
            <ElButton type="primary" @click="handleSearch" v-ripple>搜索</ElButton>
            <ElButton @click="showDialog()" v-ripple>发送通知</ElButton>
            <ElButton
              type="danger"
              :disabled="selectedIds.length === 0"
              @click="handleBatchDelete"
              v-ripple
            >
              批量删除
            </ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @selection-change="handleSelectionChange"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />

      <ElDialog
        v-model="dialogVisible"
        :title="dialogType === 'add' ? '发送系统通知' : '编辑通知'"
        width="500px"
        align-center
      >
        <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="80px">
          <ElFormItem label="标题" prop="title">
            <ElInput v-model="formData.title" placeholder="请输入通知标题" />
          </ElFormItem>
          <ElFormItem label="内容" prop="content">
            <ElInput
              v-model="formData.content"
              type="textarea"
              :rows="4"
              placeholder="请输入通知内容"
            />
          </ElFormItem>
          <ElFormItem label="类型" prop="type">
            <ElSelect v-model="formData.type" placeholder="请选择类型">
              <ElOption label="系统通知" value="system" />
              <ElOption label="公告" value="announcement" />
            </ElSelect>
          </ElFormItem>
        </ElForm>
        <template #footer>
          <ElButton @click="dialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleDialogSubmit">确定</ElButton>
        </template>
      </ElDialog>

      <!-- 详情抽屉 -->
      <ElDrawer v-model="detailVisible" title="通知详情" size="50%">
        <template v-if="detailData">
          <ElDescriptions :column="2" border>
            <ElDescriptions-item label="ID">{{ detailData.id }}</ElDescriptions-item>
            <ElDescriptions-item label="类型">
              <ElTag size="small">{{
                detailData.type === 'announcement' ? '公告' : '系统通知'
              }}</ElTag>
            </ElDescriptions-item>
            <ElDescriptions-item label="标题" :span="2">{{ detailData.title }}</ElDescriptions-item>
            <ElDescriptions-item label="内容" :span="2">{{
              detailData.content
            }}</ElDescriptions-item>
            <ElDescriptions-item label="状态">
              <ElTag :type="detailData.status === 'sent' ? 'success' : 'warning'" size="small">
                {{ detailData.status === 'sent' ? '已发送' : '待发送' }}
              </ElTag>
            </ElDescriptions-item>
            <ElDescriptions-item label="目标类型">{{
              detailData.target_type || '-'
            }}</ElDescriptions-item>
            <ElDescriptions-item label="发送时间">{{
              detailData.sent_at || '-'
            }}</ElDescriptions-item>
            <ElDescriptions-item label="创建时间">{{ detailData.created_at }}</ElDescriptions-item>
          </ElDescriptions>
        </template>
      </ElDrawer>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import {
    fetchGetSystemNotificationList,
    fetchGetSystemNotification,
    fetchCreateSystemNotification,
    fetchUpdateSystemNotification,
    fetchDeleteSystemNotification,
    fetchResendSystemNotification,
    fetchBatchDeleteSystemNotifications
  } from '@/api/system-manage'
  import { ElTag, ElMessageBox, ElButton as ElBtn } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'

  defineOptions({ name: 'NotificationManage' })

  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentEditId = ref<number>(0)
  const selectedIds = ref<number[]>([])
  const searchTitle = ref('')
  const formRef = ref<FormInstance>()

  const detailVisible = ref(false)
  const detailData = ref<Api.Admin.SystemNotification | null>(null)

  const formData = reactive({
    title: '',
    content: '',
    type: 'system'
  })

  const formRules: FormRules = {
    title: [{ required: true, message: '请输入通知标题', trigger: 'blur' }],
    content: [{ required: true, message: '请输入通知内容', trigger: 'blur' }]
  }

  const {
    columns,
    columnChecks,
    data,
    loading,
    pagination,
    getData,
    replaceSearchParams,
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    refreshCreate,
    refreshUpdate,
    refreshRemove
  } = useTable({
    core: {
      apiFn: fetchGetSystemNotificationList,
      apiParams: { page: 1, limit: 20 },
      columnsFactory: () => [
        { type: 'selection' },
        { type: 'index', width: 60, label: '序号' },
        { prop: 'title', label: '标题', minWidth: 200, showOverflowTooltip: true },
        { prop: 'content', label: '内容', minWidth: 250, showOverflowTooltip: true },
        {
          prop: 'type',
          label: '类型',
          width: 100,
          formatter: (row: Api.Admin.SystemNotification) =>
            h(ElTag, { size: 'small' }, () => (row.type === 'announcement' ? '公告' : '系统通知'))
        },
        {
          prop: 'status',
          label: '状态',
          width: 80,
          formatter: (row: Api.Admin.SystemNotification) =>
            h(ElTag, { type: row.status === 'sent' ? 'success' : 'warning', size: 'small' }, () =>
              row.status === 'sent' ? '已发送' : '待发送'
            )
        },
        { prop: 'created_at', label: '创建时间', width: 180, sortable: true },
        {
          prop: 'operation',
          label: '操作',
          width: 200,
          fixed: 'right',
          formatter: (row: Api.Admin.SystemNotification) =>
            h('div', { class: 'flex gap-1' }, [
              h(ArtButtonTable, { type: 'view', onClick: () => showDetail(row.id) }),
              h(ArtButtonTable, { type: 'edit', onClick: () => showDialog(row) }),
              h(ElBtn, { size: 'small', onClick: () => handleResend(row.id) }, () => '重发'),
              h(ArtButtonTable, { type: 'delete', onClick: () => handleDelete(row.id) })
            ])
        }
      ]
    }
  })

  const handleSelectionChange = (selection: Api.Admin.SystemNotification[]) => {
    selectedIds.value = selection.map((item) => item.id)
  }

  const handleSearch = () => {
    replaceSearchParams({ title: searchTitle.value || undefined })
    getData()
  }

  const showDetail = async (id: number) => {
    try {
      const res = await fetchGetSystemNotification(id)
      detailData.value = res
      detailVisible.value = true
    } catch {
      // ignore
    }
  }

  const showDialog = (row?: Api.Admin.SystemNotification) => {
    if (row) {
      dialogType.value = 'edit'
      currentEditId.value = row.id
      Object.assign(formData, {
        title: row.title,
        content: row.content,
        type: row.type || 'system'
      })
    } else {
      dialogType.value = 'add'
      currentEditId.value = 0
      Object.assign(formData, { title: '', content: '', type: 'system' })
    }
    nextTick(() => {
      formRef.value?.clearValidate()
      dialogVisible.value = true
    })
  }

  const handleDialogSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (!valid) return
      if (dialogType.value === 'add') {
        await fetchCreateSystemNotification(formData)
        dialogVisible.value = false
        refreshCreate()
      } else {
        await fetchUpdateSystemNotification(currentEditId.value, formData)
        dialogVisible.value = false
        refreshUpdate()
      }
    })
  }

  const handleResend = (id: number) => {
    ElMessageBox.confirm('确定要重新发送该通知吗？', '确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }).then(async () => {
      await fetchResendSystemNotification(id)
    })
  }

  const handleDelete = (id: number) => {
    ElMessageBox.confirm('确定要删除该通知吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteSystemNotification(id)
      refreshRemove()
    })
  }

  const handleBatchDelete = () => {
    ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 条通知吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      await fetchBatchDeleteSystemNotifications(selectedIds.value)
      refreshRemove()
      selectedIds.value = []
    })
  }
</script>
