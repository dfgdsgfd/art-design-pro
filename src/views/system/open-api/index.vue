<template>
  <div class="art-full-height">
    <ElCard class="art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElInput
              v-model="searchName"
              placeholder="搜索API名称"
              clearable
              style="width: 200px"
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            />
            <ElButton type="primary" @click="handleSearch" v-ripple>搜索</ElButton>
            <ElButton @click="showDialog('add')" v-ripple>创建API密钥</ElButton>
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
        :title="dialogType === 'add' ? '创建API密钥' : '编辑API密钥'"
        width="500px"
        align-center
      >
        <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="100px">
          <ElFormItem label="名称" prop="name">
            <ElInput v-model="formData.name" placeholder="请输入API名称" />
          </ElFormItem>
          <ElFormItem label="权限" prop="permissions">
            <ElInput v-model="formData.permissions" placeholder="请输入权限，如: read,write" />
          </ElFormItem>
          <ElFormItem label="速率限制">
            <ElInputNumber v-model="formData.rate_limit" :min="1" :max="10000" />
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

      <!-- 详情抽屉 -->
      <ElDrawer v-model="detailVisible" title="API密钥详情" size="40%">
        <template v-if="detailData">
          <ElDescriptions :column="1" border>
            <ElDescriptionsItem label="ID">{{ detailData.id }}</ElDescriptionsItem>
            <ElDescriptionsItem label="名称">{{ detailData.name }}</ElDescriptionsItem>
            <ElDescriptionsItem label="API Key">
              <code class="text-sm bg-gray-100 px-2 py-1 rounded">{{ detailData.api_key }}</code>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="API Secret">
              <code class="text-sm bg-gray-100 px-2 py-1 rounded">{{ detailData.api_secret }}</code>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="权限">{{ detailData.permissions }}</ElDescriptionsItem>
            <ElDescriptionsItem label="速率限制"
              >{{ detailData.rate_limit }}/分钟</ElDescriptionsItem
            >
            <ElDescriptionsItem label="状态">
              <ElTag :type="detailData.is_active ? 'success' : 'danger'" size="small">
                {{ detailData.is_active ? '启用' : '禁用' }}
              </ElTag>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="过期时间">{{
              detailData.expires_at || '永不过期'
            }}</ElDescriptionsItem>
            <ElDescriptionsItem label="创建时间">{{ detailData.created_at }}</ElDescriptionsItem>
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
    fetchGetOpenApiList,
    fetchGetOpenApi,
    fetchCreateOpenApi,
    fetchUpdateOpenApi,
    fetchDeleteOpenApi,
    fetchBatchDeleteOpenApis
  } from '@/api/system-manage'
  import { ElTag, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'

  defineOptions({ name: 'OpenApiManage' })

  const selectedIds = ref<number[]>([])
  const searchName = ref('')
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentEditId = ref<number>(0)
  const formRef = ref<FormInstance>()

  const detailVisible = ref(false)
  const detailData = ref<Api.Admin.OpenApi | null>(null)

  const formData = reactive({
    name: '',
    permissions: '',
    rate_limit: 60,
    is_active: true
  })

  const formRules: FormRules = {
    name: [{ required: true, message: '请输入API名称', trigger: 'blur' }]
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
      apiFn: fetchGetOpenApiList,
      apiParams: { page: 1, limit: 20 },
      columnsFactory: () => [
        { type: 'selection' },
        { type: 'index', width: 60, label: '序号' },
        { prop: 'name', label: '名称', minWidth: 150 },
        { prop: 'api_key', label: 'API Key', minWidth: 200, showOverflowTooltip: true },
        { prop: 'rate_limit', label: '速率限制', width: 100 },
        {
          prop: 'is_active',
          label: '状态',
          width: 80,
          formatter: (row: Api.Admin.OpenApi) =>
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
          formatter: (row: Api.Admin.OpenApi) =>
            h('div', [
              h(ArtButtonTable, { type: 'view', onClick: () => showDetail(row.id) }),
              h(ArtButtonTable, { type: 'edit', onClick: () => showDialog('edit', row) }),
              h(ArtButtonTable, { type: 'delete', onClick: () => handleDelete(row.id) })
            ])
        }
      ]
    }
  })

  const handleSelectionChange = (selection: Api.Admin.OpenApi[]) => {
    selectedIds.value = selection.map((item) => item.id)
  }

  const handleSearch = () => {
    replaceSearchParams({ name: searchName.value || undefined })
    getData()
  }

  const showDetail = async (id: number) => {
    try {
      const res = await fetchGetOpenApi(id)
      detailData.value = res
      detailVisible.value = true
    } catch {
      // ignore
    }
  }

  const showDialog = (type: 'add' | 'edit', row?: Api.Admin.OpenApi) => {
    dialogType.value = type
    currentEditId.value = row?.id || 0
    Object.assign(formData, {
      name: row?.name || '',
      permissions: row?.permissions || '',
      rate_limit: row?.rate_limit || 60,
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
        await fetchCreateOpenApi(formData)
        refreshCreate()
      } else {
        await fetchUpdateOpenApi(currentEditId.value, formData)
        refreshUpdate()
      }
      dialogVisible.value = false
    })
  }

  const handleDelete = (id: number) => {
    ElMessageBox.confirm('确定要删除该API密钥吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteOpenApi(id)
      refreshRemove()
    })
  }

  const handleBatchDelete = () => {
    ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个API密钥吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      await fetchBatchDeleteOpenApis(selectedIds.value)
      refreshRemove()
      selectedIds.value = []
    })
  }
</script>
