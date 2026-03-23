<template>
  <div class="art-full-height">
    <ElCard class="art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>新建模板</ElButton>
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
        :title="dialogType === 'add' ? '新建通知模板' : '编辑通知模板'"
        width="600px"
        align-center
      >
        <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="80px">
          <ElFormItem label="名称" prop="name">
            <ElInput v-model="formData.name" placeholder="请输入模板名称" />
          </ElFormItem>
          <ElFormItem label="类型" prop="type">
            <ElSelect v-model="formData.type" placeholder="请选择类型">
              <ElOption label="邮件" value="email" />
              <ElOption label="Discord" value="discord" />
              <ElOption label="短信" value="sms" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="主题" prop="subject">
            <ElInput v-model="formData.subject" placeholder="请输入邮件主题" />
          </ElFormItem>
          <ElFormItem label="内容" prop="content">
            <ElInput
              v-model="formData.content"
              type="textarea"
              :rows="6"
              placeholder="请输入模板内容"
            />
          </ElFormItem>
          <ElFormItem label="启用">
            <ElSwitch v-model="formData.is_active" />
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
    fetchGetNotificationTemplateList,
    fetchCreateNotificationTemplate,
    fetchUpdateNotificationTemplate,
    fetchDeleteNotificationTemplate,
    fetchBatchDeleteNotificationTemplates
  } from '@/api/system-manage'
  import { ElTag, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'

  defineOptions({ name: 'NotificationTemplateManage' })

  const selectedIds = ref<number[]>([])
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentEditId = ref<number>(0)
  const formRef = ref<FormInstance>()

  const formData = reactive({
    name: '',
    type: 'email',
    subject: '',
    content: '',
    is_active: true
  })

  const formRules: FormRules = {
    name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
    type: [{ required: true, message: '请选择类型', trigger: 'change' }]
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
    refreshUpdate,
    refreshRemove
  } = useTable({
    core: {
      apiFn: fetchGetNotificationTemplateList,
      apiParams: { page: 1, limit: 20 },
      columnsFactory: () => [
        { type: 'selection' },
        { type: 'index', width: 60, label: '序号' },
        { prop: 'name', label: '名称', minWidth: 150 },
        {
          prop: 'type',
          label: '类型',
          width: 100,
          formatter: (row: Api.Admin.NotificationTemplate) =>
            h(ElTag, { size: 'small' }, () => row.type)
        },
        { prop: 'subject', label: '主题', minWidth: 200, showOverflowTooltip: true },
        {
          prop: 'is_active',
          label: '状态',
          width: 80,
          formatter: (row: Api.Admin.NotificationTemplate) =>
            h(ElTag, { type: row.is_active ? 'success' : 'danger', size: 'small' }, () =>
              row.is_active ? '启用' : '禁用'
            )
        },
        { prop: 'created_at', label: '创建时间', width: 180, sortable: true },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right',
          formatter: (row: Api.Admin.NotificationTemplate) =>
            h('div', [
              h(ArtButtonTable, { type: 'edit', onClick: () => showDialog('edit', row) }),
              h(ArtButtonTable, { type: 'delete', onClick: () => handleDelete(row.id) })
            ])
        }
      ]
    }
  })

  const handleSelectionChange = (selection: Api.Admin.NotificationTemplate[]) => {
    selectedIds.value = selection.map((item) => item.id)
  }

  const showDialog = (type: 'add' | 'edit', row?: Api.Admin.NotificationTemplate) => {
    dialogType.value = type
    currentEditId.value = row?.id || 0
    Object.assign(formData, {
      name: row?.name || '',
      type: row?.type || 'email',
      subject: row?.subject || '',
      content: row?.content || '',
      is_active: row?.is_active ?? true
    })
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
        await fetchCreateNotificationTemplate(formData)
        refreshCreate()
      } else {
        await fetchUpdateNotificationTemplate(currentEditId.value, formData)
        refreshUpdate()
      }
      dialogVisible.value = false
    })
  }

  const handleDelete = (id: number) => {
    ElMessageBox.confirm('确定要删除该模板吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteNotificationTemplate(id)
      refreshRemove()
    })
  }

  const handleBatchDelete = () => {
    ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个模板吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      await fetchBatchDeleteNotificationTemplates(selectedIds.value)
      refreshRemove()
      selectedIds.value = []
    })
  }
</script>
