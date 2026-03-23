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
    fetchBatchCreateLicenses
  } from '@/api/system-manage'
  import { ElTag, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'

  defineOptions({ name: 'LicenseManage' })

  const searchKey = ref('')
  const stats = reactive({ total: 0, distributed: 0, available: 0 })
  const batchDialogVisible = ref(false)
  const batchFormRef = ref<FormInstance>()
  const batchFormData = reactive({ count: 10 })
  const batchFormRules: FormRules = {
    count: [{ required: true, message: '请输入数量', trigger: 'blur' }]
  }

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
    refreshRemove
  } = useTable({
    core: {
      apiFn: fetchGetLicenseList,
      apiParams: { page: 1, limit: 20 },
      columnsFactory: () => [
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
          width: 80,
          fixed: 'right',
          formatter: (row: Api.Admin.License) =>
            h('div', [h(ArtButtonTable, { type: 'delete', onClick: () => handleDelete(row.id) })])
        }
      ]
    }
  })

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
</script>
