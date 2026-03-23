<template>
  <div class="art-full-height">
    <ElCard class="art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElInput
              v-model="searchVersion"
              placeholder="搜索版本号"
              clearable
              style="width: 200px"
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            />
            <ElButton type="primary" @click="handleSearch" v-ripple>搜索</ElButton>
            <ElButton @click="showDialog('add')" v-ripple>新增版本</ElButton>
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
        :title="dialogType === 'add' ? '新增版本' : '编辑版本'"
        width="500px"
        align-center
      >
        <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="100px">
          <ElFormItem label="版本号" prop="version">
            <ElInput v-model="formData.version" placeholder="例如: 1.0.0" />
          </ElFormItem>
          <ElFormItem label="构建号" prop="build_number">
            <ElInputNumber v-model="formData.build_number" :min="1" />
          </ElFormItem>
          <ElFormItem label="平台" prop="platform">
            <ElSelect v-model="formData.platform" placeholder="请选择平台">
              <ElOption label="Android" value="android" />
              <ElOption label="iOS" value="ios" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="下载链接" prop="download_url">
            <ElInput v-model="formData.download_url" placeholder="请输入下载链接" />
          </ElFormItem>
          <ElFormItem label="更新说明" prop="release_notes">
            <ElInput
              v-model="formData.release_notes"
              type="textarea"
              :rows="3"
              placeholder="请输入更新说明"
            />
          </ElFormItem>
          <ElFormItem label="强制更新">
            <ElSwitch v-model="formData.is_force_update" />
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
    fetchGetAppVersionList,
    fetchCreateAppVersion,
    fetchUpdateAppVersion,
    fetchDeleteAppVersion,
    fetchBatchDeleteAppVersions
  } from '@/api/system-manage'
  import { ElTag, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'

  defineOptions({ name: 'AppVersionManage' })

  const searchVersion = ref('')
  const selectedIds = ref<number[]>([])
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentEditId = ref<number>(0)
  const formRef = ref<FormInstance>()

  const formData = reactive({
    version: '',
    build_number: 1,
    platform: 'android',
    download_url: '',
    release_notes: '',
    is_force_update: false,
    is_active: true
  })

  const formRules: FormRules = {
    version: [{ required: true, message: '请输入版本号', trigger: 'blur' }],
    platform: [{ required: true, message: '请选择平台', trigger: 'change' }]
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
      apiFn: fetchGetAppVersionList,
      apiParams: { page: 1, limit: 20 },
      columnsFactory: () => [
        { type: 'selection' },
        { type: 'index', width: 60, label: '序号' },
        { prop: 'version', label: '版本号', width: 120 },
        { prop: 'build_number', label: '构建号', width: 100 },
        { prop: 'platform', label: '平台', width: 100 },
        {
          prop: 'is_force_update',
          label: '强制更新',
          width: 100,
          formatter: (row: Api.Admin.AppVersion) =>
            h(ElTag, { type: row.is_force_update ? 'danger' : 'info', size: 'small' }, () =>
              row.is_force_update ? '是' : '否'
            )
        },
        {
          prop: 'is_active',
          label: '状态',
          width: 80,
          formatter: (row: Api.Admin.AppVersion) =>
            h(ElTag, { type: row.is_active ? 'success' : 'danger', size: 'small' }, () =>
              row.is_active ? '启用' : '禁用'
            )
        },
        { prop: 'release_notes', label: '更新说明', minWidth: 200, showOverflowTooltip: true },
        { prop: 'created_at', label: '创建时间', width: 180, sortable: true },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right',
          formatter: (row: Api.Admin.AppVersion) =>
            h('div', [
              h(ArtButtonTable, { type: 'edit', onClick: () => showDialog('edit', row) }),
              h(ArtButtonTable, { type: 'delete', onClick: () => handleDelete(row.id) })
            ])
        }
      ]
    }
  })

  const handleSearch = () => {
    replaceSearchParams({ version: searchVersion.value || undefined })
    getData()
  }

  const handleSelectionChange = (selection: Api.Admin.AppVersion[]) => {
    selectedIds.value = selection.map((item) => item.id)
  }

  const showDialog = (type: 'add' | 'edit', row?: Api.Admin.AppVersion) => {
    dialogType.value = type
    currentEditId.value = row?.id || 0
    Object.assign(formData, {
      version: row?.version || '',
      build_number: row?.build_number || 1,
      platform: row?.platform || 'android',
      download_url: row?.download_url || '',
      release_notes: row?.release_notes || '',
      is_force_update: row?.is_force_update || false,
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
        await fetchCreateAppVersion(formData)
        refreshCreate()
      } else {
        await fetchUpdateAppVersion(currentEditId.value, formData)
        refreshUpdate()
      }
      dialogVisible.value = false
    })
  }

  const handleDelete = (id: number) => {
    ElMessageBox.confirm('确定要删除该版本吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteAppVersion(id)
      refreshRemove()
    })
  }

  const handleBatchDelete = () => {
    ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个版本吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      await fetchBatchDeleteAppVersions(selectedIds.value)
      refreshRemove()
      selectedIds.value = []
    })
  }
</script>
