<template>
  <div class="art-full-height">
    <ElCard class="art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElInput
              v-model="searchTitle"
              placeholder="搜索标题"
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

      <ElDialog v-model="dialogVisible" title="编辑帖子" width="600px" align-center>
        <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="80px">
          <ElFormItem label="标题" prop="title">
            <ElInput v-model="formData.title" placeholder="请输入标题" />
          </ElFormItem>
          <ElFormItem label="内容" prop="content">
            <ElInput
              v-model="formData.content"
              type="textarea"
              :rows="4"
              placeholder="请输入内容"
            />
          </ElFormItem>
          <ElFormItem label="类型" prop="type">
            <ElSelect v-model="formData.type" placeholder="请选择类型">
              <ElOption label="图文" value="1" />
              <ElOption label="视频" value="2" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="草稿" prop="is_draft">
            <ElSelect v-model="formData.is_draft" placeholder="请选择">
              <ElOption label="是" value="1" />
              <ElOption label="否" value="0" />
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
    fetchGetPostList,
    fetchUpdatePost,
    fetchDeletePost,
    fetchBatchDeletePosts
  } from '@/api/system-manage'
  import { ElTag, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'

  defineOptions({ name: 'PostManage' })

  const searchTitle = ref('')
  const selectedIds = ref<number[]>([])
  const dialogVisible = ref(false)
  const currentEditId = ref<number>(0)
  const formRef = ref<FormInstance>()

  const formData = reactive({
    title: '',
    content: '',
    type: '1',
    is_draft: '0'
  })

  const formRules: FormRules = {
    title: [{ required: true, message: '请输入标题', trigger: 'blur' }]
  }

  const POST_TYPE_CONFIG: Record<number, { type: 'success' | 'warning'; text: string }> = {
    1: { type: 'success', text: '图文' },
    2: { type: 'warning', text: '视频' }
  }
  const UNKNOWN_POST_TYPE = { type: 'info' as const, text: '未知' }

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
      apiFn: fetchGetPostList,
      apiParams: { page: 1, limit: 20 },
      columnsFactory: () => [
        { type: 'selection' },
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'title',
          label: '标题',
          minWidth: 200,
          showOverflowTooltip: true,
          formatter: (row: Api.Admin.Post) => row.title
        },
        { prop: 'user_id', label: '用户ID', width: 100 },
        {
          prop: 'type',
          label: '类型',
          width: 80,
          formatter: (row: Api.Admin.Post) => {
            const config = POST_TYPE_CONFIG[row.type] || UNKNOWN_POST_TYPE
            return h(ElTag, { type: config.type, size: 'small' }, () => config.text)
          }
        },
        { prop: 'view_count', label: '浏览', width: 80, sortable: true },
        { prop: 'likes_count', label: '点赞', width: 80, sortable: true },
        { prop: 'comments_count', label: '评论', width: 80, sortable: true },
        {
          prop: 'is_draft',
          label: '草稿',
          width: 80,
          formatter: (row: Api.Admin.Post) =>
            h(ElTag, { type: row.is_draft ? 'warning' : 'success', size: 'small' }, () =>
              row.is_draft ? '草稿' : '已发布'
            )
        },
        { prop: 'created_at', label: '创建时间', width: 180, sortable: true },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right',
          formatter: (row: Api.Admin.Post) =>
            h('div', [
              h(ArtButtonTable, { type: 'edit', onClick: () => showDialog(row) }),
              h(ArtButtonTable, { type: 'delete', onClick: () => handleDelete(row.id) })
            ])
        }
      ]
    }
  })

  const handleSearch = () => {
    replaceSearchParams({ title: searchTitle.value || undefined })
    getData()
  }

  const handleSelectionChange = (selection: Api.Admin.Post[]) => {
    selectedIds.value = selection.map((item) => item.id)
  }

  const showDialog = (row: Api.Admin.Post) => {
    currentEditId.value = row.id
    Object.assign(formData, {
      title: row.title || '',
      content: row.content || '',
      type: String(row.type),
      is_draft: String(row.is_draft ? 1 : 0)
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
      await fetchUpdatePost(currentEditId.value, formData)
      dialogVisible.value = false
      refreshUpdate()
    })
  }

  const handleDelete = (id: number) => {
    ElMessageBox.confirm('确定要删除该帖子吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeletePost(id)
      refreshRemove()
    })
  }

  const handleBatchDelete = () => {
    ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个帖子吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      await fetchBatchDeletePosts(selectedIds.value)
      refreshRemove()
      selectedIds.value = []
    })
  }
</script>
