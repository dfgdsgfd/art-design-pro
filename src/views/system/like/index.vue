<template>
  <div class="art-full-height">
    <ElCard class="art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElInput
              v-model="searchPostId"
              placeholder="搜索帖子ID"
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
  import { fetchGetLikeList, fetchDeleteLike } from '@/api/system-manage'
  import { ElMessageBox } from 'element-plus'

  defineOptions({ name: 'LikeManage' })

  const searchPostId = ref('')

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
      apiFn: fetchGetLikeList,
      apiParams: { page: 1, limit: 20 },
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        { prop: 'id', label: 'ID', width: 80 },
        { prop: 'user_id', label: '用户ID', width: 120 },
        { prop: 'post_id', label: '帖子ID', width: 120 },
        { prop: 'created_at', label: '创建时间', minWidth: 180, sortable: true },
        {
          prop: 'operation',
          label: '操作',
          width: 80,
          fixed: 'right',
          formatter: (row: Api.Admin.Like) =>
            h('div', [h(ArtButtonTable, { type: 'delete', onClick: () => handleDelete(row.id) })])
        }
      ]
    }
  })

  const handleSearch = () => {
    replaceSearchParams({ post_id: searchPostId.value || undefined })
    getData()
  }

  const handleDelete = (id: number) => {
    ElMessageBox.confirm('确定要删除该点赞记录吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteLike(id)
      refreshRemove()
    })
  }
</script>
