<template>
  <div class="art-full-height">
    <ElCard class="art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElInput
              v-model="searchName"
              placeholder="搜索标签名"
              clearable
              style="width: 200px"
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            />
            <ElButton type="primary" @click="handleSearch" v-ripple>搜索</ElButton>
            <ElButton @click="showDialog('add')" v-ripple>新增标签</ElButton>
            <ElButton type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete" v-ripple>
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
        :title="dialogType === 'add' ? '新增标签' : '编辑标签'"
        width="400px"
        align-center
      >
        <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="80px">
          <ElFormItem label="标签名" prop="name">
            <ElInput v-model="formData.name" placeholder="请输入标签名" />
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
    fetchGetTagList,
    fetchCreateTag,
    fetchUpdateTag,
    fetchDeleteTag,
    fetchBatchDeleteTags
  } from '@/api/system-manage'
  import { ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'

  defineOptions({ name: 'TagManage' })

  const searchName = ref('')
  const selectedIds = ref<number[]>([])
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentEditId = ref<number>(0)
  const formRef = ref<FormInstance>()

  const formData = reactive({ name: '' })

  const formRules: FormRules = {
    name: [{ required: true, message: '请输入标签名', trigger: 'blur' }]
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
      apiFn: fetchGetTagList,
      apiParams: { page: 1, limit: 20 },
      columnsFactory: () => [
        { type: 'selection' },
        { type: 'index', width: 60, label: '序号' },
        { prop: 'name', label: '标签名', minWidth: 150 },
        { prop: 'post_count', label: '帖子数', width: 100, sortable: true },
        { prop: 'created_at', label: '创建时间', width: 180, sortable: true },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right',
          formatter: (row: Api.Admin.Tag) =>
            h('div', [
              h(ArtButtonTable, { type: 'edit', onClick: () => showDialog('edit', row) }),
              h(ArtButtonTable, { type: 'delete', onClick: () => handleDelete(row.id) })
            ])
        }
      ]
    }
  })

  const handleSearch = () => {
    replaceSearchParams({ name: searchName.value || undefined })
    getData()
  }

  const handleSelectionChange = (selection: Api.Admin.Tag[]) => {
    selectedIds.value = selection.map((item) => item.id)
  }

  const showDialog = (type: 'add' | 'edit', row?: Api.Admin.Tag) => {
    dialogType.value = type
    currentEditId.value = row?.id || 0
    formData.name = row?.name || ''
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
        await fetchCreateTag({ name: formData.name })
        refreshCreate()
      } else {
        await fetchUpdateTag(currentEditId.value, { name: formData.name })
        refreshUpdate()
      }
      dialogVisible.value = false
    })
  }

  const handleDelete = (id: number) => {
    ElMessageBox.confirm('确定要删除该标签吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteTag(id)
      refreshRemove()
    })
  }

  const handleBatchDelete = () => {
    ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个标签吗？`, '批量删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchBatchDeleteTags(selectedIds.value)
      refreshRemove()
      selectedIds.value = []
    })
  }
</script>
