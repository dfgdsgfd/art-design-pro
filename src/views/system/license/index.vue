<template>
  <div class="art-full-height">
    <ElCard class="mb-4">
      <div class="flex items-center gap-8">
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-500">{{ stats.total }}</div>
          <div class="text-sm text-gray-500 mt-1">总数</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-green-500">{{ stats.available }}</div>
          <div class="text-sm text-gray-500 mt-1">可用</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-orange-500">{{ stats.distributed }}</div>
          <div class="text-sm text-gray-500 mt-1">已分配</div>
        </div>
      </div>
    </ElCard>

    <ElCard class="art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="handleRefresh">
        <template #left>
          <ElSpace wrap>
            <ElInput
              v-model="searchKey"
              placeholder="搜索许可证"
              clearable
              style="width: 250px"
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            />
            <ElButton type="primary" @click="handleSearch" v-ripple>搜索</ElButton>
            <ElButton @click="showBatchDialog" v-ripple>批量生成</ElButton>
            <ElButton @click="showCreateDialog" v-ripple>单个生成</ElButton>
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

      <ElDialog v-model="batchDialogVisible" title="批量生成许可证" width="400px" align-center>
        <ElForm
          ref="batchFormRef"
          :model="batchFormData"
          :rules="batchFormRules"
          label-width="80px"
        >
          <ElFormItem label="数量" prop="count">
            <ElInputNumber v-model="batchFormData.count" :min="1" :max="100" />
          </ElFormItem>
        </ElForm>
        <template #footer>
          <ElButton @click="batchDialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleBatchSubmit">确定</ElButton>
        </template>
      </ElDialog>

      <!-- 单个生成许可证 -->
      <ElDialog v-model="createDialogVisible" title="生成许可证" width="400px" align-center>
        <ElForm ref="createFormRef" :model="createFormData" label-width="80px">
          <ElFormItem label="备注">
            <ElInput
              v-model="createFormData.remark"
              type="textarea"
              :rows="3"
              placeholder="可选备注"
            />
          </ElFormItem>
        </ElForm>
        <template #footer>
          <ElButton @click="createDialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleCreateSubmit">确定</ElButton>
        </template>
      </ElDialog>

      <!-- 编辑许可证 -->
      <ElDialog v-model="editDialogVisible" title="编辑许可证" width="400px" align-center>
        <ElForm ref="editFormRef" :model="editFormData" label-width="80px">
          <ElFormItem label="状态">
            <ElSwitch v-model="editFormData.is_active" active-text="激活" inactive-text="未激活" />
          </ElFormItem>
          <ElFormItem label="备注">
            <ElInput
              v-model="editFormData.remark"
              type="textarea"
              :rows="3"
              placeholder="可选备注"
            />
          </ElFormItem>
        </ElForm>
        <template #footer>
          <ElButton @click="editDialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleEditSubmit">确定</ElButton>
        </template>
      </ElDialog>

      <!-- 详情抽屉 -->
      <ElDrawer v-model="detailVisible" title="许可证详情" size="50%">
        <template v-if="detailData">
          <ElDescriptions :column="2" border>
            <ElDescriptions-item label="ID">{{ detailData.id }}</ElDescriptions-item>
            <ElDescriptions-item label="状态">
              <ElTag :type="detailData.is_active ? 'success' : 'danger'" size="small">
                {{ detailData.is_active ? '激活' : '未激活' }}
              </ElTag>
            </ElDescriptions-item>
            <ElDescriptions-item label="许可证" :span="2">{{
              detailData.license_key
            }}</ElDescriptions-item>
            <ElDescriptions-item label="机器型号">{{
              detailData.machine_model || '-'
            }}</ElDescriptions-item>
            <ElDescriptions-item label="机器ID">{{
              detailData.machine_id || '-'
            }}</ElDescriptions-item>
            <ElDescriptions-item label="备注" :span="2">{{
              detailData.remark || '-'
            }}</ElDescriptions-item>
            <ElDescriptions-item label="过期时间">{{
              detailData.expires_at || '-'
            }}</ElDescriptions-item>
            <ElDescriptions-item label="最后验证时间">{{
              detailData.last_verified_at || '-'
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
    fetchGetLicenseList,
    fetchGetLicenseStats,
    fetchDeleteLicense,
    fetchBatchCreateLicenses,
    fetchCreateLicense,
    fetchUpdateLicense,
    fetchBatchDeleteLicenses
  } from '@/api/system-manage'
  import { ElTag, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'

  defineOptions({ name: 'LicenseManage' })

  const searchKey = ref('')
  const selectedIds = ref<number[]>([])
  const stats = reactive({ total: 0, distributed: 0, available: 0 })
  const batchDialogVisible = ref(false)
  const batchFormRef = ref<FormInstance>()
  const batchFormData = reactive({ count: 10 })
  const batchFormRules: FormRules = {
    count: [{ required: true, message: '请输入数量', trigger: 'blur' }]
  }

  const detailVisible = ref(false)
  const detailData = ref<Api.Admin.License | null>(null)

  const createDialogVisible = ref(false)
  const createFormRef = ref<FormInstance>()
  const createFormData = reactive({ remark: '' })

  const editDialogVisible = ref(false)
  const editFormRef = ref<FormInstance>()
  const currentEditId = ref<number>(0)
  const editFormData = reactive({ is_active: true, remark: '' })

  const loadStats = async () => {
    try {
      const res = await fetchGetLicenseStats()
      Object.assign(stats, res)
    } catch {
      // ignore
    }
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
    refreshUpdate,
    refreshRemove
  } = useTable({
    core: {
      apiFn: fetchGetLicenseList,
      apiParams: { page: 1, limit: 20 },
      columnsFactory: () => [
        { type: 'selection' },
        { type: 'index', width: 60, label: '序号' },
        { prop: 'license_key', label: '许可证', minWidth: 280, showOverflowTooltip: true },
        { prop: 'machine_model', label: '机器型号', width: 120 },
        {
          prop: 'is_active',
          label: '状态',
          width: 80,
          formatter: (row: Api.Admin.License) =>
            h(ElTag, { type: row.is_active ? 'success' : 'danger', size: 'small' }, () =>
              row.is_active ? '激活' : '未激活'
            )
        },
        { prop: 'last_verified_at', label: '最后验证时间', width: 180 },
        { prop: 'created_at', label: '创建时间', width: 180, sortable: true },
        {
          prop: 'operation',
          label: '操作',
          width: 180,
          fixed: 'right',
          formatter: (row: Api.Admin.License) =>
            h('div', { class: 'flex gap-1' }, [
              h(ArtButtonTable, { type: 'view', onClick: () => showDetail(row) }),
              h(ArtButtonTable, { type: 'edit', onClick: () => showEditDialog(row) }),
              h(ArtButtonTable, { type: 'delete', onClick: () => handleDelete(row.id) })
            ])
        }
      ]
    }
  })

  const handleSelectionChange = (selection: Api.Admin.License[]) => {
    selectedIds.value = selection.map((item) => item.id)
  }

  onMounted(() => {
    loadStats()
  })

  const handleRefresh = () => {
    refreshData()
    loadStats()
  }

  const handleSearch = () => {
    replaceSearchParams({ license_key: searchKey.value || undefined })
    getData()
  }

  const showDetail = (row: Api.Admin.License) => {
    detailData.value = row
    detailVisible.value = true
  }

  const showCreateDialog = () => {
    createFormData.remark = ''
    nextTick(() => {
      createFormRef.value?.clearValidate()
      createDialogVisible.value = true
    })
  }

  const handleCreateSubmit = async () => {
    await fetchCreateLicense({ remark: createFormData.remark || undefined })
    createDialogVisible.value = false
    refreshData()
    loadStats()
  }

  const showEditDialog = (row: Api.Admin.License) => {
    currentEditId.value = row.id
    Object.assign(editFormData, {
      is_active: row.is_active,
      remark: row.remark || ''
    })
    nextTick(() => {
      editFormRef.value?.clearValidate()
      editDialogVisible.value = true
    })
  }

  const handleEditSubmit = async () => {
    await fetchUpdateLicense(currentEditId.value, editFormData)
    editDialogVisible.value = false
    refreshUpdate()
    loadStats()
  }

  const showBatchDialog = () => {
    batchFormData.count = 10
    nextTick(() => {
      batchFormRef.value?.clearValidate()
      batchDialogVisible.value = true
    })
  }

  const handleBatchSubmit = async () => {
    if (!batchFormRef.value) return
    await batchFormRef.value.validate(async (valid) => {
      if (!valid) return
      await fetchBatchCreateLicenses({ count: batchFormData.count })
      batchDialogVisible.value = false
      refreshData()
      loadStats()
    })
  }

  const handleDelete = (id: number) => {
    ElMessageBox.confirm('确定要删除该许可证吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteLicense(id)
      refreshRemove()
      loadStats()
    })
  }

  const handleBatchDelete = () => {
    ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个许可证吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      await fetchBatchDeleteLicenses(selectedIds.value)
      refreshRemove()
      selectedIds.value = []
      loadStats()
    })
  }
</script>
