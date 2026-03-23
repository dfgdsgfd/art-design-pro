<template>
  <div class="art-full-height">
    <ElCard class="art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElInput
              v-model="searchNickname"
              placeholder="搜索昵称"
              clearable
              style="width: 200px"
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            />
            <ElButton type="primary" @click="handleSearch" v-ripple>搜索</ElButton>
            <ElButton @click="showDialog('add')" v-ripple>新增用户</ElButton>
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
        :title="dialogType === 'add' ? '新增用户' : '编辑用户'"
        width="500px"
        align-center
      >
        <ElForm ref="formRef" :model="formData" :rules="formRules" label-width="80px">
          <ElFormItem label="用户ID" prop="user_id">
            <ElInput v-model="formData.user_id" placeholder="请输入用户ID" />
          </ElFormItem>
          <ElFormItem label="昵称" prop="nickname">
            <ElInput v-model="formData.nickname" placeholder="请输入昵称" />
          </ElFormItem>
          <ElFormItem label="头像" prop="avatar">
            <ElInput v-model="formData.avatar" placeholder="请输入头像URL" />
          </ElFormItem>
          <ElFormItem label="简介" prop="bio">
            <ElInput v-model="formData.bio" type="textarea" placeholder="请输入简介" />
          </ElFormItem>
          <ElFormItem label="地区" prop="location">
            <ElInput v-model="formData.location" placeholder="请输入地区" />
          </ElFormItem>
          <ElFormItem label="性别" prop="gender">
            <ElSelect v-model="formData.gender" placeholder="请选择性别">
              <ElOption label="男" value="男" />
              <ElOption label="女" value="女" />
              <ElOption label="未知" value="未知" />
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="状态" prop="is_active">
            <ElSelect v-model="formData.is_active" placeholder="请选择状态">
              <ElOption label="启用" value="true" />
              <ElOption label="禁用" value="false" />
            </ElSelect>
          </ElFormItem>
        </ElForm>
        <template #footer>
          <ElButton @click="dialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleDialogSubmit">确定</ElButton>
        </template>
      </ElDialog>

      <!-- 用户详情抽屉 -->
      <ElDrawer v-model="detailVisible" title="用户详情" size="50%">
        <template v-if="detailData">
          <ElDescriptions :column="2" border>
            <ElDescriptionsItem label="ID">{{ detailData.id }}</ElDescriptionsItem>
            <ElDescriptionsItem label="用户ID">{{ detailData.user_id }}</ElDescriptionsItem>
            <ElDescriptionsItem label="昵称">{{ detailData.nickname }}</ElDescriptionsItem>
            <ElDescriptionsItem label="性别">{{ detailData.gender || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="头像">
              <ElImage
                v-if="detailData.avatar"
                :src="detailData.avatar"
                :preview-src-list="[detailData.avatar]"
                preview-teleported
                fit="cover"
                style="width: 80px; height: 80px"
                class="rounded"
              />
              <span v-else>-</span>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="状态">
              <ElTag
                :type="String(detailData.is_active) === 'true' ? 'success' : 'danger'"
                size="small"
              >
                {{ String(detailData.is_active) === 'true' ? '启用' : '禁用' }}
              </ElTag>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="简介" :span="2">{{
              detailData.bio || '-'
            }}</ElDescriptionsItem>
            <ElDescriptionsItem label="地区">{{ detailData.location || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="认证">
              <ElTag :type="detailData.verified === 1 ? 'success' : 'info'" size="small">
                {{ detailData.verified === 1 ? '已认证' : '未认证' }}
              </ElTag>
            </ElDescriptionsItem>
            <ElDescriptionsItem label="星座">{{
              detailData.zodiac_sign || '-'
            }}</ElDescriptionsItem>
            <ElDescriptionsItem label="MBTI">{{ detailData.mbti || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="学历">{{ detailData.education || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="专业">{{ detailData.major || '-' }}</ElDescriptionsItem>
            <ElDescriptionsItem label="兴趣" :span="2">{{
              detailData.interests || '-'
            }}</ElDescriptionsItem>
            <ElDescriptionsItem label="创建时间">{{ detailData.created_at }}</ElDescriptionsItem>
            <ElDescriptionsItem label="更新时间">{{ detailData.updated_at }}</ElDescriptionsItem>
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
    fetchGetUserList,
    fetchGetUser,
    fetchCreateUser,
    fetchUpdateUser,
    fetchDeleteUser,
    fetchBatchDeleteUsers
  } from '@/api/system-manage'
  import { ElTag, ElMessageBox, ElImage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'

  defineOptions({ name: 'UserManage' })

  const searchNickname = ref('')
  const selectedIds = ref<number[]>([])
  const dialogVisible = ref(false)
  const dialogType = ref<'add' | 'edit'>('add')
  const currentEditId = ref<number>(0)
  const formRef = ref<FormInstance>()

  const detailVisible = ref(false)
  const detailData = ref<Api.Admin.User | null>(null)

  const formData = reactive({
    user_id: '',
    nickname: '',
    avatar: '',
    bio: '',
    location: '',
    gender: '',
    is_active: 'true'
  })

  const formRules: FormRules = {
    user_id: [{ required: true, message: '请输入用户ID', trigger: 'blur' }],
    nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }]
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
      apiFn: fetchGetUserList,
      apiParams: { page: 1, limit: 20 },
      columnsFactory: () => [
        { type: 'selection' },
        { type: 'index', width: 60, label: '序号' },
        { prop: 'user_id', label: '用户ID', width: 120 },
        {
          prop: 'nickname',
          label: '昵称',
          minWidth: 120,
          formatter: (row: Api.Admin.User) =>
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
        { prop: 'location', label: '地区', minWidth: 100 },
        {
          prop: 'is_active',
          label: '状态',
          width: 80,
          formatter: (row: Api.Admin.User) =>
            h(
              ElTag,
              { type: String(row.is_active) === 'true' ? 'success' : 'danger', size: 'small' },
              () => (String(row.is_active) === 'true' ? '启用' : '禁用')
            )
        },
        {
          prop: 'verified',
          label: '认证',
          width: 80,
          formatter: (row: Api.Admin.User) =>
            h(ElTag, { type: row.verified === 1 ? 'success' : 'info', size: 'small' }, () =>
              row.verified === 1 ? '已认证' : '未认证'
            )
        },
        { prop: 'created_at', label: '创建时间', width: 180, sortable: true },
        {
          prop: 'operation',
          label: '操作',
          width: 160,
          fixed: 'right',
          formatter: (row: Api.Admin.User) =>
            h('div', [
              h(ArtButtonTable, { type: 'view', onClick: () => showDetail(row.id) }),
              h(ArtButtonTable, { type: 'edit', onClick: () => showDialog('edit', row) }),
              h(ArtButtonTable, { type: 'delete', onClick: () => handleDelete(row.id) })
            ])
        }
      ]
    }
  })

  const handleSearch = () => {
    replaceSearchParams({ nickname: searchNickname.value || undefined })
    getData()
  }

  const handleSelectionChange = (selection: Api.Admin.User[]) => {
    selectedIds.value = selection.map((item) => item.id)
  }

  const showDetail = async (id: number) => {
    try {
      const res = await fetchGetUser(id)
      detailData.value = res
      detailVisible.value = true
    } catch {
      // ignore
    }
  }

  const showDialog = (type: 'add' | 'edit', row?: Api.Admin.User) => {
    dialogType.value = type
    currentEditId.value = row?.id || 0
    Object.assign(formData, {
      user_id: row?.user_id || '',
      nickname: row?.nickname || '',
      avatar: row?.avatar || '',
      bio: row?.bio || '',
      location: row?.location || '',
      gender: row?.gender || '',
      is_active: row ? String(row.is_active) : 'true'
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
        await fetchCreateUser(formData)
        refreshCreate()
      } else {
        await fetchUpdateUser(currentEditId.value, formData)
        refreshUpdate()
      }
      dialogVisible.value = false
    })
  }

  const handleDelete = (id: number) => {
    ElMessageBox.confirm('确定要删除该用户吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteUser(id)
      refreshRemove()
    })
  }

  const handleBatchDelete = () => {
    ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个用户吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      await fetchBatchDeleteUsers(selectedIds.value)
      refreshRemove()
      selectedIds.value = []
    })
  }
</script>
