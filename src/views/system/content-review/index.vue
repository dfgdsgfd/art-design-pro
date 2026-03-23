<template>
  <div class="art-full-height">
    <ElCard class="art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElSelect
              v-model="searchStatus"
              placeholder="审核状态"
              clearable
              style="width: 150px"
              @change="handleSearch"
            >
              <ElOption label="待审核" value="pending" />
              <ElOption label="已通过" value="approved" />
              <ElOption label="已拒绝" value="rejected" />
            </ElSelect>
            <ElSelect
              v-model="searchType"
              placeholder="内容类型"
              clearable
              style="width: 150px"
              @change="handleSearch"
            >
              <ElOption label="帖子" value="post" />
              <ElOption label="评论" value="comment" />
              <ElOption label="用户名" value="username" />
            </ElSelect>
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

      <ElDialog v-model="rejectDialogVisible" title="拒绝原因" width="400px" align-center>
        <ElForm
          ref="rejectFormRef"
          :model="rejectFormData"
          :rules="rejectFormRules"
          label-width="80px"
        >
          <ElFormItem label="原因" prop="reason">
            <ElInput
              v-model="rejectFormData.reason"
              type="textarea"
              :rows="3"
              placeholder="请输入拒绝原因"
            />
          </ElFormItem>
        </ElForm>
        <template #footer>
          <ElButton @click="rejectDialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleRejectSubmit">确定</ElButton>
        </template>
      </ElDialog>

      <!-- 详情抽屉 -->
      <ElDrawer v-model="detailVisible" title="审核详情" size="50%">
        <template v-if="detailData">
          <ElDescriptions :column="2" border>
            <ElDescriptions-item label="ID">{{ detailData.id }}</ElDescriptions-item>
            <ElDescriptions-item label="类型">
              <ElTag size="small">{{
                TYPE_MAP[detailData.content_type] || detailData.content_type
              }}</ElTag>
            </ElDescriptions-item>
            <ElDescriptions-item label="用户ID">{{
              detailData.user_display_id
            }}</ElDescriptions-item>
            <ElDescriptions-item label="内容ID">{{ detailData.content_id }}</ElDescriptions-item>
            <ElDescriptions-item label="状态">
              <ElTag :type="(STATUS_CONFIG[detailData.status] || UNKNOWN_STATUS).type" size="small">
                {{ (STATUS_CONFIG[detailData.status] || UNKNOWN_STATUS).text }}
              </ElTag>
            </ElDescriptions-item>
            <ElDescriptions-item label="审核人ID">{{
              detailData.reviewer_id || '-'
            }}</ElDescriptions-item>
            <ElDescriptions-item label="内容" :span="2">{{
              detailData.content
            }}</ElDescriptions-item>
            <ElDescriptions-item label="AI审核结果" :span="2">{{
              detailData.ai_result || '-'
            }}</ElDescriptions-item>
            <ElDescriptions-item label="审核时间">{{
              detailData.reviewed_at || '-'
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
    fetchGetContentReviewList,
    fetchGetContentReview,
    fetchApproveContentReview,
    fetchRejectContentReview,
    fetchRetryContentReview,
    fetchBatchDeleteContentReviews
  } from '@/api/system-manage'
  import { ElTag, ElMessageBox, ElButton as ElBtn } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'

  defineOptions({ name: 'ContentReviewManage' })

  const searchStatus = ref('')
  const searchType = ref('')
  const selectedIds = ref<number[]>([])
  const rejectDialogVisible = ref(false)
  const currentRejectId = ref<number>(0)
  const rejectFormRef = ref<FormInstance>()
  const rejectFormData = reactive({ reason: '' })
  const rejectFormRules: FormRules = {
    reason: [{ required: true, message: '请输入拒绝原因', trigger: 'blur' }]
  }

  const detailVisible = ref(false)
  const detailData = ref<Api.Admin.ContentReview | null>(null)

  const STATUS_CONFIG: Record<
    string,
    { type: 'warning' | 'success' | 'danger' | 'info'; text: string }
  > = {
    pending: { type: 'warning', text: '待审核' },
    approved: { type: 'success', text: '已通过' },
    rejected: { type: 'danger', text: '已拒绝' },
    failed: { type: 'danger', text: '失败' }
  }
  const UNKNOWN_STATUS = { type: 'info' as const, text: '未知' }

  const TYPE_MAP: Record<string, string> = {
    post: '帖子',
    comment: '评论',
    username: '用户名'
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
      apiFn: fetchGetContentReviewList,
      apiParams: { page: 1, limit: 20 },
      columnsFactory: () => [
        { type: 'selection' },
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'content_type',
          label: '类型',
          width: 80,
          formatter: (row: Api.Admin.ContentReview) =>
            h(ElTag, { size: 'small' }, () => TYPE_MAP[row.content_type] || row.content_type)
        },
        { prop: 'content', label: '内容', minWidth: 250, showOverflowTooltip: true },
        { prop: 'user_display_id', label: '用户ID', width: 120 },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row: Api.Admin.ContentReview) => {
            const config = STATUS_CONFIG[row.status] || UNKNOWN_STATUS
            return h(ElTag, { type: config.type, size: 'small' }, () => config.text)
          }
        },
        { prop: 'ai_result', label: 'AI结果', minWidth: 150, showOverflowTooltip: true },
        { prop: 'created_at', label: '创建时间', width: 180, sortable: true },
        {
          prop: 'operation',
          label: '操作',
          width: 240,
          fixed: 'right',
          formatter: (row: Api.Admin.ContentReview) => {
            const buttons: any[] = [
              h(ArtButtonTable, { type: 'view', onClick: () => showDetail(row.id) })
            ]

            if (row.status === 'pending') {
              buttons.push(
                h(
                  ElBtn,
                  { type: 'primary', size: 'small', onClick: () => handleApprove(row.id) },
                  () => '通过'
                ),
                h(
                  ElBtn,
                  { type: 'danger', size: 'small', onClick: () => showRejectDialog(row.id) },
                  () => '拒绝'
                )
              )
            } else if (row.status === 'rejected' || row.status === 'failed') {
              buttons.push(
                h(
                  ElBtn,
                  { type: 'warning', size: 'small', onClick: () => handleRetry(row.id) },
                  () => '重试'
                )
              )
            }

            return h('div', { class: 'flex gap-1' }, buttons)
          }
        }
      ]
    }
  })

  const handleSelectionChange = (selection: Api.Admin.ContentReview[]) => {
    selectedIds.value = selection.map((item) => item.id)
  }

  const handleSearch = () => {
    replaceSearchParams({
      status: searchStatus.value || undefined,
      content_type: searchType.value || undefined
    })
    getData()
  }

  const showDetail = async (id: number) => {
    try {
      const res = await fetchGetContentReview(id)
      detailData.value = res
      detailVisible.value = true
    } catch {
      // ignore
    }
  }

  const handleRetry = (id: number) => {
    ElMessageBox.confirm('确定要重试该审核吗？', '重试确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }).then(async () => {
      await fetchRetryContentReview(id)
      refreshUpdate()
    })
  }

  const handleApprove = (id: number) => {
    ElMessageBox.confirm('确定要通过该审核吗？', '审核确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }).then(async () => {
      await fetchApproveContentReview(id)
      refreshUpdate()
    })
  }

  const showRejectDialog = (id: number) => {
    currentRejectId.value = id
    rejectFormData.reason = ''
    nextTick(() => {
      rejectFormRef.value?.clearValidate()
      rejectDialogVisible.value = true
    })
  }

  const handleRejectSubmit = async () => {
    if (!rejectFormRef.value) return
    await rejectFormRef.value.validate(async (valid) => {
      if (!valid) return
      await fetchRejectContentReview(currentRejectId.value, { reason: rejectFormData.reason })
      rejectDialogVisible.value = false
      refreshUpdate()
    })
  }

  const handleBatchDelete = () => {
    ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 条审核记录吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      await fetchBatchDeleteContentReviews(selectedIds.value)
      refreshRemove()
      selectedIds.value = []
    })
  }
</script>
