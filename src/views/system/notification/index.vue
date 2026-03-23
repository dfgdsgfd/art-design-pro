<template>
  <div class="art-full-height">
    <ElCard class="art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog" v-ripple>发送通知</ElButton>
          </ElSpace>
        </template>
      </ArtTableHeader>

      <ArtTable
        :loading="loading"
        :data="data"
        :columns="columns"
        :pagination="pagination"
        @pagination:size-change="handleSizeChange"
        @pagination:current-change="handleCurrentChange"
      />

      <ElDialog v-model="dialogVisible" title="发送系统通知" width="500px" align-center>
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
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import {
    fetchGetSystemNotificationList,
    fetchCreateSystemNotification,
    fetchDeleteSystemNotification,
    fetchResendSystemNotification
  } from '@/api/system-manage'
  import { ElTag, ElMessageBox, ElButton as ElBtn } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'

  defineOptions({ name: 'NotificationManage' })

  const dialogVisible = ref(false)
  const formRef = ref<FormInstance>()

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
    handleSizeChange,
    handleCurrentChange,
    refreshData,
    refreshCreate,
    refreshRemove
  } = useTable({
    core: {
      apiFn: fetchGetSystemNotificationList,
      apiParams: { page: 1, limit: 20 },
      columnsFactory: () => [
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
          width: 140,
          fixed: 'right',
          formatter: (row: Api.Admin.SystemNotification) =>
            h('div', { class: 'flex gap-1' }, [
              h(ElBtn, { size: 'small', onClick: () => handleResend(row.id) }, () => '重发'),
              h(ArtButtonTable, { type: 'delete', onClick: () => handleDelete(row.id) })
            ])
        }
      ]
    }
  })

  const showDialog = () => {
    Object.assign(formData, { title: '', content: '', type: 'system' })
    nextTick(() => {
      formRef.value?.clearValidate()
      dialogVisible.value = true
    })
  }

  const handleDialogSubmit = async () => {
    if (!formRef.value) return
    await formRef.value.validate(async (valid) => {
      if (!valid) return
      await fetchCreateSystemNotification(formData)
      dialogVisible.value = false
      refreshCreate()
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
</script>
