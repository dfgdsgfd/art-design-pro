<template>
  <div class="art-full-height">
    <ElCard class="art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElInput
              v-model="searchUserId"
              placeholder="搜索用户ID"
              clearable
              style="width: 200px"
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            />
            <ElButton type="primary" @click="handleSearch" v-ripple>搜索</ElButton>
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
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetSessionList, fetchDeleteSession } from '@/api/system-manage'
  import { ElTag, ElMessageBox } from 'element-plus'

  defineOptions({ name: 'SessionManage' })

  const searchUserId = ref('')

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
      apiFn: fetchGetSessionList,
      apiParams: { page: 1, limit: 20 },
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        { prop: 'user_id', label: '用户ID', width: 100 },
        { prop: 'user_agent', label: 'User Agent', minWidth: 200, showOverflowTooltip: true },
        {
          prop: 'is_active',
          label: '状态',
          width: 80,
          formatter: (row: Api.Admin.Session) =>
            h(ElTag, { type: row.is_active ? 'success' : 'danger', size: 'small' }, () =>
              row.is_active ? '活跃' : '失效'
            )
        },
        { prop: 'expires_at', label: '过期时间', width: 180 },
        { prop: 'created_at', label: '创建时间', width: 180, sortable: true },
        {
          prop: 'operation',
          label: '操作',
          width: 80,
          fixed: 'right',
          formatter: (row: Api.Admin.Session) =>
            h('div', [h(ArtButtonTable, { type: 'delete', onClick: () => handleDelete(row.id) })])
        }
      ]
    }
  })

  const handleSearch = () => {
    replaceSearchParams({ user_id: searchUserId.value || undefined })
    getData()
  }

  const handleDelete = (id: number) => {
    ElMessageBox.confirm('确定要删除该会话吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteSession(id)
      refreshRemove()
    })
  }
</script>
