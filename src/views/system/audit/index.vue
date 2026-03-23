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
              <ElOption label="待审核" value="0" />
              <ElOption label="已通过" value="1" />
              <ElOption label="已拒绝" value="2" />
            </ElSelect>
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
      <ElDrawer v-model="detailVisible" title="认证详情" size="50%">
        <template v-if="detailData">
          <ElDescriptions :column="2" border>
            <ElDescriptions-item label="ID">{{ detailData.id }}</ElDescriptions-item>
            <ElDescriptions-item label="用户ID">{{ detailData.user_display_id }}</ElDescriptions-item>
            <ElDescriptions-item label="昵称">{{ detailData.nickname }}</ElDescriptions-item>
            <ElDescriptions-item label="状态">
              <ElTag :type="(AUDIT_STATUS_CONFIG[detailData.status] || UNKNOWN_STATUS).type" size="small">
                {{ (AUDIT_STATUS_CONFIG[detailData.status] || UNKNOWN_STATUS).text }}
              </ElTag>
            </ElDescriptions-item>
            <ElDescriptions-item label="申请时间">{{ detailData.created_at }}</ElDescriptions-item>
            <ElDescriptions-item label="审核时间">{{ detailData.audit_time || '未审核' }}</ElDescriptions-item>
            <ElDescriptions-item v-if="detailData.reason" label="拒绝原因" :span="2">{{ detailData.reason }}</ElDescriptions-item>
          </ElDescriptions>
          <div class="mt-4">
            <h4 class="text-sm font-medium mb-2">认证内容</h4>
            <div class="border rounded p-4" v-html="detailData.content" />
          </div>
        </template>
      </ElDrawer>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/hooks/core/useTable'
  import { fetchGetAuditList, fetchGetAudit, fetchApproveAudit, fetchRejectAudit } from '@/api/system-manage'
  import { ElTag, ElMessageBox, ElImage, ElButton as ElBtn } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'

  defineOptions({ name: 'AuditManage' })

  const searchStatus = ref('')
  const rejectDialogVisible = ref(false)
  const currentRejectId = ref<number>(0)
  const rejectFormRef = ref<FormInstance>()
  const rejectFormData = reactive({ reason: '' })
  const rejectFormRules: FormRules = {
    reason: [{ required: true, message: '请输入拒绝原因', trigger: 'blur' }]
  }

  const detailVisible = ref(false)
  const detailData = ref<Api.Admin.AuditRecord | null>(null)

  const AUDIT_STATUS_CONFIG: Record<
    number,
    { type: 'warning' | 'success' | 'danger'; text: string }
  > = {
    0: { type: 'warning', text: '待审核' },
    1: { type: 'success', text: '已通过' },
    2: { type: 'danger', text: '已拒绝' }
  }
  const UNKNOWN_STATUS = { type: 'info' as const, text: '未知' }

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
    refreshUpdate
  } = useTable({
    core: {
      apiFn: fetchGetAuditList,
      apiParams: { page: 1, limit: 20 },
      columnsFactory: () => [
        { type: 'index', width: 60, label: '序号' },
        {
          prop: 'nickname',
          label: '用户',
          minWidth: 150,
          formatter: (row: Api.Admin.AuditRecord) =>
            h('div', { class: 'flex items-center gap-2' }, [
              h(ElImage, {
                class: 'size-8 rounded-full',
                src: row.avatar,
                previewSrcList: row.avatar ? [row.avatar] : [],
                previewTeleported: true,
                fit: 'cover'
              }),
              h('span', row.nickname)
            ])
        },
        { prop: 'user_display_id', label: '用户ID', width: 120 },
        {
          prop: 'status',
          label: '状态',
          width: 100,
          formatter: (row: Api.Admin.AuditRecord) => {
            const config = AUDIT_STATUS_CONFIG[row.status] || UNKNOWN_STATUS
            return h(ElTag, { type: config.type, size: 'small' }, () => config.text)
          }
        },
        { prop: 'reason', label: '拒绝原因', minWidth: 150, showOverflowTooltip: true },
        { prop: 'created_at', label: '申请时间', width: 180, sortable: true },
        { prop: 'audit_time', label: '审核时间', width: 180 },
        {
          prop: 'operation',
          label: '操作',
          width: 200,
          fixed: 'right',
          formatter: (row: Api.Admin.AuditRecord) =>
            h('div', { class: 'flex gap-1' }, [
              h(ElBtn, { size: 'small', onClick: () => showDetail(row.id) }, () => '查看'),
              ...(row.status === 0
                ? [
                    h(ElBtn, { type: 'primary', size: 'small', onClick: () => handleApprove(row.id) }, () => '通过'),
                    h(ElBtn, { type: 'danger', size: 'small', onClick: () => showRejectDialog(row.id) }, () => '拒绝')
                  ]
                : [])
            ])
        }
      ]
    }
  })

  const handleSearch = () => {
    replaceSearchParams({ status: searchStatus.value || undefined })
    getData()
  }

  const showDetail = async (id: number) => {
    try {
      const res = await fetchGetAudit(id)
      detailData.value = res
      detailVisible.value = true
    } catch {
      // ignore
    }
  }

  const handleApprove = (id: number) => {
    ElMessageBox.confirm('确定要通过该认证申请吗？', '审核确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }).then(async () => {
      await fetchApproveAudit(id)
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
      await fetchRejectAudit(currentRejectId.value, { reason: rejectFormData.reason })
      rejectDialogVisible.value = false
      refreshUpdate()
    })
  }
</script>
