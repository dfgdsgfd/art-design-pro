<template>
  <div class="art-full-height">
    <ElCard class="art-table-card">
      <ArtTableHeader v-model:columns="columnChecks" :loading="loading" @refresh="refreshData">
        <template #left>
          <ElSpace wrap>
            <ElInput
              v-model="searchUsername"
              placeholder="搜索用户名"
              clearable
              style="width: 200px"
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            />
            <ElButton type="primary" @click="handleSearch" v-ripple>搜索</ElButton>
            <ElButton @click="showCreateDialog" v-ripple>新增管理员</ElButton>
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

      <ElDialog v-model="createDialogVisible" title="新增管理员" width="400px" align-center>
        <ElForm
          ref="createFormRef"
          :model="createFormData"
          :rules="createFormRules"
          label-width="80px"
        >
          <ElFormItem label="用户名" prop="username">
            <ElInput v-model="createFormData.username" placeholder="请输入用户名" />
          </ElFormItem>
          <ElFormItem label="密码" prop="password">
            <ElInput
              v-model="createFormData.password"
              type="password"
              show-password
              placeholder="请输入密码"
            />
          </ElFormItem>
        </ElForm>
        <template #footer>
          <ElButton @click="createDialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handleCreateSubmit">确定</ElButton>
        </template>
      </ElDialog>

      <ElDialog v-model="passwordDialogVisible" title="重置密码" width="400px" align-center>
        <ElForm
          ref="passwordFormRef"
          :model="passwordFormData"
          :rules="passwordFormRules"
          label-width="80px"
        >
          <ElFormItem label="新密码" prop="password">
            <ElInput
              v-model="passwordFormData.password"
              type="password"
              show-password
              placeholder="请输入新密码"
            />
          </ElFormItem>
        </ElForm>
        <template #footer>
          <ElButton @click="passwordDialogVisible = false">取消</ElButton>
          <ElButton type="primary" @click="handlePasswordSubmit">确定</ElButton>
        </template>
      </ElDialog>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import { useTable } from '@/hooks/core/useTable'
  import {
    fetchGetAdminList,
    fetchCreateAdmin,
    fetchUpdateAdmin,
    fetchDeleteAdmin,
    fetchBatchDeleteAdmins
  } from '@/api/system-manage'
  import { ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'

  defineOptions({ name: 'AdminManage' })

  const searchUsername = ref('')
  const selectedIds = ref<number[]>([])

  const createDialogVisible = ref(false)
  const createFormRef = ref<FormInstance>()
  const createFormData = reactive({ username: '', password: '' })
  const createFormRules: FormRules = {
    username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, message: '密码至少6个字符', trigger: 'blur' }
    ]
  }

  const passwordDialogVisible = ref(false)
  const passwordFormRef = ref<FormInstance>()
  const passwordFormData = reactive({ password: '' })
  const currentEditId = ref<number>(0)
  const passwordFormRules: FormRules = {
    password: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 6, message: '密码至少6个字符', trigger: 'blur' }
    ]
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
      apiFn: fetchGetAdminList,
      apiParams: { page: 1, limit: 20 },
      columnsFactory: () => [
        { type: 'selection' },
        { type: 'index', width: 60, label: '序号' },
        { prop: 'username', label: '用户名', minWidth: 150 },
        { prop: 'created_at', label: '创建时间', width: 180, sortable: true },
        {
          prop: 'operation',
          label: '操作',
          width: 120,
          fixed: 'right',
          formatter: (row: Api.Admin.AdminUser) =>
            h('div', [
              h(ArtButtonTable, { type: 'edit', onClick: () => showPasswordDialog(row) }),
              h(ArtButtonTable, { type: 'delete', onClick: () => handleDelete(row.id) })
            ])
        }
      ]
    }
  })

  const handleSearch = () => {
    replaceSearchParams({ username: searchUsername.value || undefined })
    getData()
  }

  const handleSelectionChange = (selection: Api.Admin.AdminUser[]) => {
    selectedIds.value = selection.map((item) => item.id)
  }

  const showCreateDialog = () => {
    createFormData.username = ''
    createFormData.password = ''
    nextTick(() => {
      createFormRef.value?.clearValidate()
      createDialogVisible.value = true
    })
  }

  const handleCreateSubmit = async () => {
    if (!createFormRef.value) return
    await createFormRef.value.validate(async (valid) => {
      if (!valid) return
      await fetchCreateAdmin({
        username: createFormData.username,
        password: createFormData.password
      })
      createDialogVisible.value = false
      refreshCreate()
    })
  }

  const showPasswordDialog = (row: Api.Admin.AdminUser) => {
    currentEditId.value = row.id
    passwordFormData.password = ''
    nextTick(() => {
      passwordFormRef.value?.clearValidate()
      passwordDialogVisible.value = true
    })
  }

  const handlePasswordSubmit = async () => {
    if (!passwordFormRef.value) return
    await passwordFormRef.value.validate(async (valid) => {
      if (!valid) return
      await fetchUpdateAdmin(currentEditId.value, { password: passwordFormData.password })
      passwordDialogVisible.value = false
      refreshUpdate()
    })
  }

  const handleDelete = (id: number) => {
    ElMessageBox.confirm('确定要删除该管理员吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      await fetchDeleteAdmin(id)
      refreshRemove()
    })
  }

  const handleBatchDelete = () => {
    ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个管理员吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(async () => {
      await fetchBatchDeleteAdmins(selectedIds.value)
      refreshRemove()
      selectedIds.value = []
    })
  }
</script>
