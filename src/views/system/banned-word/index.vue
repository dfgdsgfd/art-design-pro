<template>
  <div class="art-full-height">
    <ElCard class="art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElInput
              v-model="searchWord"
              placeholder="搜索违禁词"
              clearable
              style="width: 200px"
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            />
            <ElButton type="primary" @click="handleSearch" v-ripple>搜索</ElButton>
            <ElButton @click="showDialog('add')" v-ripple>新增违禁词</ElButton>
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
        :title="dialogType === 'add' ? '新增违禁词' : '编辑违禁词'"
        width="400px"
        align-center
      >
        <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="80px">
          <ElFormItem label="违禁词" prop="word">
            <ElInput v-model="formData.word" placeholder="请输入违禁词" />
          </ElFormItem>
          <ElFormItem label="严重程度" prop="severity">
            <ElSelect v-model="formData.severity" placeholder="请选择严重程度">
              <ElOption label="低" value="low" />
              <ElOption label="中" value="medium" />
              <ElOption label="高" value="high" />
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
    fetchGetBannedWordList,
    fetchCreateBannedWord,
    fetchUpdateBannedWord,
    fetchDeleteBannedWord,
    fetchBatchDeleteBannedWords
  } from '@/api/system-manage'
  import { ElTag, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'

  defineOptions({ name: 'BannedWordManage' })

  const searchWord = ref('')
  const selectedIds = ref<number[]>([])
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentEditId = ref<number>(0)
  const formRef = ref<FormInstance>()

  const formData = reactive({
    word: '',
    severity: 'medium'
  })

  const formRules: FormRules = {
    word: [{ required: true, message: '请输入违禁词', trigger: 'blur' }]
  }

  const SEVERITY_CONFIG: Record<string, { type: 'success' | 'warning' | 'danger'; text: string }> =
    {
      low: { type: 'success', text: '低' },
      medium: { type: 'warning', text: '中' },
      high: { type: 'danger', text: '高' }
    }
  const UNKNOWN_SEVERITY = { type: 'info' as const, text: '未知' }

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
      apiFn: fetchGetBannedWordList,
      apiParams: { page: 1, limit: 20 },
      columnsFactory: () => [
        { type: 'selection' },
        { type: 'index', width: 60, label: '序号' },
        { prop: 'word', label: '违禁词', minWidth: 150 },
        {
          prop: 'severity',
          label: '严重程度',
          width: 100,
          formatter: (row: Api.Admin.BannedWord) => {
            const config = SEVERITY_CONFIG[row.severity] || UNKNOWN_SEVERITY
            return h(ElTag, { type: config.type, size: 'small' }, () => config.text)
          }
        },
        {
          prop: 'is_active',
          label: '状态',
          width: 80,
          formatter: (row: Api.Admin.BannedWord) =>
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
          formatter: (row: Api.Admin.BannedWord) =>
            h('div', [
              h(ArtButtonTable, { type: 'edit', onClick: () => showDialog('edit', row) }),
              h(ArtButtonTable, { type: 'delete', onClick: () => handleDelete(row.id) })
            ])
        }
      ]
    }
  })

  const handleSearch = () => {
    replaceSearchParams({ word: searchWord.value || undefined })
    getData()
  }

  const handleSelectionChange = (selection: Api.Admin.BannedWord[]) => {
    selectedIds.value = selection.map((item) => item.id)
  }

  const showDialog = (type: 'add' | 'edit', row?: Api.Admin.BannedWord) => {
    dialogType.value = type
    currentEditId.value = row?.id || 0
    Object.assign(formData, {
      word: row?.word || '',
      severity: row?.severity || 'medium'
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
        await fetchCreateBannedWord({ word: formData.word, severity: formData.severity })
        refreshCreate()
      } else {
        await fetchUpdateBannedWord(currentEditId.value, {
          word: formData.word,
          severity: formData.severity
        })
        refreshUpdate()
      }
      dialogVisible.value = false
    })
  }

  const handleDelete = (id: number) => {
    ElMessageBox.confirm('确定要删除该违禁词吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteBannedWord(id)
      refreshRemove()
    })
  }

  const handleBatchDelete = () => {
    ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个违禁词吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      await fetchBatchDeleteBannedWords(selectedIds.value)
      refreshRemove()
      selectedIds.value = []
    })
  }
</script>
