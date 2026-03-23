<template>
  <div class="art-full-height">
    <ElCard class="art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>创建工具栏项</ElButton>
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
        :title="dialogType === 'add' ? '创建工具栏项' : '编辑工具栏项'"
        width="500px"
        align-center
      >
        <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="100px">
          <ElFormItem label="名称" prop="name">
            <ElInput v-model="formData.name" placeholder="请输入名称" />
          </ElFormItem>
          <ElFormItem label="图标" prop="icon">
            <ElInput v-model="formData.icon" placeholder="请输入图标名称" />
          </ElFormItem>
          <ElFormItem label="链接" prop="url">
            <ElInput v-model="formData.url" placeholder="请输入链接URL" />
          </ElFormItem>
          <ElFormItem label="排序">
            <ElInputNumber v-model="formData.sort_order" :min="0" />
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
    fetchGetUserToolbarList,
    fetchCreateUserToolbar,
    fetchUpdateUserToolbar,
    fetchDeleteUserToolbar,
    fetchBatchDeleteUserToolbars,
    fetchToggleUserToolbarActive
  } from '@/api/system-manage'
  import { ElTag, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'

  defineOptions({ name: 'UserToolbarManage' })

  const selectedIds = ref<number[]>([])
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentEditId = ref<number>(0)
  const formRef = ref<FormInstance>()

  const formData = reactive({
    name: '',
    icon: '',
    url: '',
    sort_order: 0,
    is_active: true
  })

  const formRules: FormRules = {
    name: [{ required: true, message: '请输入名称', trigger: 'blur' }]
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
      apiFn: fetchGetUserToolbarList,
      apiParams: { page: 1, limit: 20 },
      columnsFactory: () => [
        { type: 'selection' },
        { type: 'index', width: 60, label: '序号' },
        { prop: 'name', label: '名称', minWidth: 150 },
        { prop: 'icon', label: '图标', width: 120 },
        { prop: 'url', label: '链接', minWidth: 200, showOverflowTooltip: true },
        { prop: 'sort_order', label: '排序', width: 80 },
        {
          prop: 'is_active',
          label: '状态',
          width: 80,
          formatter: (row: Api.Admin.UserToolbar) =>
            h(ElTag, { type: row.is_active ? 'success' : 'danger', size: 'small' }, () =>
              row.is_active ? '启用' : '禁用'
            )
        },
        { prop: 'created_at', label: '创建时间', width: 180, sortable: true },
        {
          prop: 'operation',
          label: '操作',
          width: 160,
          fixed: 'right',
          formatter: (row: Api.Admin.UserToolbar) =>
            h('div', [
              h(ArtButtonTable, {
                type: 'view',
                onClick: () => handleToggle(row.id)
              }),
              h(ArtButtonTable, { type: 'edit', onClick: () => showDialog('edit', row) }),
              h(ArtButtonTable, { type: 'delete', onClick: () => handleDelete(row.id) })
            ])
        }
      ]
    }
  })

  const handleSelectionChange = (selection: Api.Admin.UserToolbar[]) => {
    selectedIds.value = selection.map((item) => item.id)
  }

  const handleToggle = async (id: number) => {
    await fetchToggleUserToolbarActive(id)
    refreshUpdate()
  }

  const showDialog = (type: 'add' | 'edit', row?: Api.Admin.UserToolbar) => {
    dialogType.value = type
    currentEditId.value = row?.id || 0
    Object.assign(formData, {
      name: row?.name || '',
      icon: row?.icon || '',
      url: row?.url || '',
      sort_order: row?.sort_order || 0,
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
        await fetchCreateUserToolbar(formData)
        refreshCreate()
      } else {
        await fetchUpdateUserToolbar(currentEditId.value, formData)
        refreshUpdate()
      }
      dialogVisible.value = false
    })
  }

  const handleDelete = (id: number) => {
    ElMessageBox.confirm('确定要删除该工具栏项吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteUserToolbar(id)
      refreshRemove()
    })
  }

  const handleBatchDelete = () => {
    ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个工具栏项吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      await fetchBatchDeleteUserToolbars(selectedIds.value)
      refreshRemove()
      selectedIds.value = []
    })
  }
</script>
