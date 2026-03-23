<template>
  <div class="art-full-height">
    <ElCard class="art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElInput
              v-model="searchFollowerId"
              placeholder="搜索关注者ID"
              clearable
              style="width: 200px"
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            />
            <ElButton type="primary" @click="handleSearch" v-ripple>搜索</ElButton>
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
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetFollowList, fetchDeleteFollow, fetchBatchDeleteFollows } from '@/api/system-manage'
  import { ElMessageBox } from 'element-plus'

  defineOptions({ name: 'FollowManage' })

  const searchFollowerId = ref('')
  const selectedIds = ref<number[]>([])

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
      apiFn: fetchGetFollowList,
      apiParams: { page: 1, limit: 20 },
      columnsFactory: () => [
        { type: 'selection' },
        { type: 'index', width: 60, label: '序号' },
        { prop: 'id', label: 'ID', width: 80 },
        { prop: 'follower_id', label: '关注者ID', width: 120 },
        { prop: 'following_id', label: '被关注者ID', width: 120 },
        { prop: 'created_at', label: '创建时间', minWidth: 180, sortable: true },
        {
          prop: 'operation',
          label: '操作',
          width: 80,
          fixed: 'right',
          formatter: (row: Api.Admin.Follow) =>
            h('div', [h(ArtButtonTable, { type: 'delete', onClick: () => handleDelete(row.id) })])
        }
      ]
    }
  })

  const handleSearch = () => {
    replaceSearchParams({ follower_id: searchFollowerId.value || undefined })
    getData()
  }

  const handleSelectionChange = (selection: Api.Admin.Follow[]) => {
    selectedIds.value = selection.map((item) => item.id)
  }

  const handleDelete = (id: number) => {
    ElMessageBox.confirm('确定要删除该关注记录吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteFollow(id)
      refreshRemove()
    })
  }

  const handleBatchDelete = () => {
    ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 条关注记录吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      await fetchBatchDeleteFollows(selectedIds.value)
      refreshRemove()
      selectedIds.value = []
    })
  }
</script>
