<template>
  <div class="art-full-height">
    <ElCard class="art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElInput
              v-model="searchContent"
              placeholder="搜索评论内容"
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

    <ElDrawer v-model="detailVisible" title="评论详情" size="400px">
      <ElDescriptions v-if="detailData" :column="1" border>
        <ElDescriptionsItem label="ID">{{ detailData.id }}</ElDescriptionsItem>
        <ElDescriptionsItem label="评论内容">{{ detailData.content }}</ElDescriptionsItem>
        <ElDescriptionsItem label="帖子ID">{{ detailData.post_id }}</ElDescriptionsItem>
        <ElDescriptionsItem label="用户ID">{{ detailData.user_id }}</ElDescriptionsItem>
        <ElDescriptionsItem label="父评论ID">{{ detailData.parent_id ?? '-' }}</ElDescriptionsItem>
        <ElDescriptionsItem label="审核状态">
          <ElTag :type="(AUDIT_STATUS_CONFIG[detailData.audit_status] || UNKNOWN_AUDIT_STATUS).type" size="small">
            {{ (AUDIT_STATUS_CONFIG[detailData.audit_status] || UNKNOWN_AUDIT_STATUS).text }}
          </ElTag>
        </ElDescriptionsItem>
        <ElDescriptionsItem label="创建时间">{{ detailData.created_at }}</ElDescriptionsItem>
      </ElDescriptions>
    </ElDrawer>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import {
    fetchGetCommentList,
    fetchDeleteComment,
    fetchBatchDeleteComments,
    fetchGetComment
  } from '@/api/system-manage'
  import { ElTag, ElMessageBox, ElDrawer, ElDescriptions, ElDescriptionsItem } from 'element-plus'

  defineOptions({ name: 'CommentManage' })

  const searchContent = ref('')
  const selectedIds = ref<number[]>([])
  const detailVisible = ref(false)
  const detailData = ref<Api.Admin.Comment | null>(null)

  const AUDIT_STATUS_CONFIG: Record<
    string,
    { type: 'success' | 'warning' | 'danger' | 'info'; text: string }
  > = {
    approved: { type: 'success', text: '已通过' },
    pending: { type: 'warning', text: '待审核' },
    rejected: { type: 'danger', text: '已拒绝' }
  }
  const UNKNOWN_AUDIT_STATUS = { type: 'info' as const, text: '未知' }

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
      apiFn: fetchGetCommentList,
      apiParams: { page: 1, limit: 20 },
      columnsFactory: () => [
        { type: 'selection' },
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'content',
          label: '评论内容',
          minWidth: 250,
          showOverflowTooltip: true,
          formatter: (row: Api.Admin.Comment) => row.content
        },
        { prop: 'post_id', label: '帖子ID', width: 80 },
        { prop: 'user_id', label: '用户ID', width: 120 },
        {
          prop: 'audit_status',
          label: '审核状态',
          width: 100,
          formatter: (row: Api.Admin.Comment) => {
            const config = AUDIT_STATUS_CONFIG[row.audit_status] || UNKNOWN_AUDIT_STATUS
            return h(ElTag, { type: config.type, size: 'small' }, () => config.text)
          }
        },
        { prop: 'created_at', label: '创建时间', width: 180, sortable: true },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right',
          formatter: (row: Api.Admin.Comment) =>
            h('div', [
              h(ArtButtonTable, { type: 'view', onClick: () => handleView(row.id) }),
              h(ArtButtonTable, { type: 'delete', onClick: () => handleDelete(row.id) })
            ])
        }
      ]
    }
  })

  const handleSearch = () => {
    replaceSearchParams({ content: searchContent.value || undefined })
    getData()
  }

  const handleView = async (id: number) => {
    const res = await fetchGetComment(id)
    detailData.value = res
    detailVisible.value = true
  }

  const handleSelectionChange = (selection: Api.Admin.Comment[]) => {
    selectedIds.value = selection.map((item) => item.id)
  }

  const handleDelete = (id: number) => {
    ElMessageBox.confirm('确定要删除该评论吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteComment(id)
      refreshRemove()
    })
  }

  const handleBatchDelete = () => {
    ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 条评论吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      await fetchBatchDeleteComments(selectedIds.value)
      refreshRemove()
      selectedIds.value = []
    })
  }
</script>
