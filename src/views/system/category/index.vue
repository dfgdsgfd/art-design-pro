<template>
  <div class="art-full-height">
    <ElCard class="art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElButton @click="showDialog('add')" v-ripple>新增分类</ElButton>
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
        :title="dialogType === 'add' ? '新增分类' : '编辑分类'"
        width="400px"
        align-center
      >
        <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="80px">
          <ElFormItem label="分类名" prop="name">
            <ElInput v-model="formData.name" placeholder="请输入分类名" />
          </ElFormItem>
          <ElFormItem label="分类标题" prop="category_title">
            <ElInput v-model="formData.category_title" placeholder="请输入分类标题" />
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
    fetchGetCategoryList,
    fetchCreateCategory,
    fetchUpdateCategory,
    fetchDeleteCategory,
    fetchBatchDeleteCategories
  } from '@/api/system-manage'
  import { ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'

  defineOptions({ name: 'CategoryManage' })

  const selectedIds = ref<number[]>([])
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentEditId = ref<number>(0)
  const formRef = ref<FormInstance>()

  const formData = reactive({
    name: '',
    category_title: ''
  })

  const formRules: FormRules = {
    name: [{ required: true, message: '请输入分类名', trigger: 'blur' }],
    category_title: [{ required: true, message: '请输入分类标题', trigger: 'blur' }]
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
      apiFn: fetchGetCategoryList,
      apiParams: { page: 1, limit: 20 },
      columnsFactory: () => [
        { type: 'selection' },
        { type: 'index', width: 60, label: '序号' },
        { prop: 'name', label: '分类名', minWidth: 150 },
        { prop: 'category_title', label: '分类标题', minWidth: 150 },
        { prop: 'created_at', label: '创建时间', width: 180, sortable: true },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right',
          formatter: (row: Api.Admin.Category) =>
            h('div', [
              h(ArtButtonTable, { type: 'edit', onClick: () => showDialog('edit', row) }),
              h(ArtButtonTable, { type: 'delete', onClick: () => handleDelete(row.id) })
            ])
        }
      ]
    }
  })

  const handleSelectionChange = (selection: Api.Admin.Category[]) => {
    selectedIds.value = selection.map((item) => item.id)
  }

  const showDialog = (type: 'add' | 'edit', row?: Api.Admin.Category) => {
    dialogType.value = type
    currentEditId.value = row?.id || 0
    Object.assign(formData, {
      name: row?.name || '',
      category_title: row?.category_title || ''
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
        await fetchCreateCategory({ name: formData.name, category_title: formData.category_title })
        refreshCreate()
      } else {
        await fetchUpdateCategory(currentEditId.value, {
          name: formData.name,
          category_title: formData.category_title
        })
        refreshUpdate()
      }
      dialogVisible.value = false
    })
  }

  const handleDelete = (id: number) => {
    ElMessageBox.confirm('确定要删除该分类吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteCategory(id)
      refreshRemove()
    })
  }

  const handleBatchDelete = () => {
    ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个分类吗？`, '批量删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchBatchDeleteCategories(selectedIds.value)
      refreshRemove()
      selectedIds.value = []
    })
  }
</script>
