<template>
  <div class="art-full-height">
    <ElCard class="art-table-card">
      <div class="flex items-center justify-between mb-4 px-2">
        <h3 class="text-lg font-medium">系统设置</h3>
        <ElButton type="primary" @click="handleSave" :loading="saving" v-ripple>保存设置</ElButton>
      </div>

      <div v-loading="loading" class="p-4">
        <template v-for="(category, catKey) in settings" :key="catKey">
          <h4 class="text-base font-medium mb-3 mt-6 first:mt-0">{{ category.label }}</h4>
          <ElForm label-width="200px" class="mb-4">
            <ElFormItem
              v-for="(setting, settingKey) in category.settings"
              :key="settingKey"
              :label="setting.label"
            >
              <template v-if="setting.type === 'boolean'">
                <ElSwitch v-model="formValues[String(settingKey)]" />
              </template>
              <template v-else-if="setting.type === 'json_array'">
                <div class="w-full">
                  <ElInput
                    v-model="formValues[String(settingKey)]"
                    type="textarea"
                    :rows="3"
                    placeholder="JSON数组，如 [&quot;选项1&quot;, &quot;选项2&quot;]"
                  />
                  <div class="text-xs text-gray-400 mt-1">{{ setting.description }}</div>
                </div>
              </template>
              <template v-else>
                <ElInput v-model="formValues[String(settingKey)]" />
              </template>
              <template #label>
                <ElTooltip :content="setting.description" placement="top">
                  <span>{{ setting.label }}</span>
                </ElTooltip>
              </template>
            </ElFormItem>
          </ElForm>
        </template>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import {
    fetchGetSystemSettingsGrouped,
    fetchUpdateSystemSettingsGrouped
  } from '@/api/system-manage'
  import { ElMessage } from 'element-plus'

  defineOptions({ name: 'SystemSettingsManage' })

  const loading = ref(false)
  const saving = ref(false)
  const settings = ref<Api.Admin.SystemSettingsResponse>({})
  const formValues = reactive<Record<string, any>>({})

  const loadSettings = async () => {
    loading.value = true
    try {
      const res = await fetchGetSystemSettingsGrouped()
      settings.value = res
      for (const category of Object.values(res)) {
        for (const [key, setting] of Object.entries(category.settings)) {
          if (setting.type === 'json_array') {
            formValues[key] = JSON.stringify(setting.value)
          } else {
            formValues[key] = setting.value
          }
        }
      }
    } catch {
      // ignore
    } finally {
      loading.value = false
    }
  }

  const handleSave = async () => {
    saving.value = true
    try {
      const processed: Record<string, any> = {}
      for (const category of Object.values(settings.value)) {
        for (const [key, setting] of Object.entries(category.settings)) {
          if (setting.type === 'json_array') {
            try {
              processed[key] = JSON.parse(formValues[key])
            } catch {
              ElMessage.error(`${setting.label} 格式错误，请输入有效的JSON数组`)
              saving.value = false
              return
            }
          } else {
            processed[key] = formValues[key]
          }
        }
      }
      await fetchUpdateSystemSettingsGrouped(processed as Record<string, any>)
    } catch {
      // ignore
    } finally {
      saving.value = false
    }
  }

  onMounted(() => {
    loadSettings()
  })
</script>
