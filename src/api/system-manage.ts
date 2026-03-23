import request from '@/utils/http'
import { AppRouteRecord } from '@/types/router'

// ==================== 用户管理 ====================

/** 获取用户列表 */
export function fetchGetUserList(params?: Api.Admin.UserSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Admin.User>>({
    url: '/api/admin/users',
    params
  })
}

/** 获取用户详情 */
export function fetchGetUser(id: number) {
  return request.get<Api.Admin.User>({
    url: `/api/admin/users/${id}`
  })
}

/** 创建用户 */
export function fetchCreateUser(data: Api.Admin.UserFormParams) {
  return request.post<Api.Admin.User>({
    url: '/api/admin/users',
    data,
    showSuccessMessage: true
  })
}

/** 更新用户 */
export function fetchUpdateUser(id: number, data: Api.Admin.UserFormParams) {
  return request.put<Api.Admin.User>({
    url: `/api/admin/users/${id}`,
    data,
    showSuccessMessage: true
  })
}

/** 删除用户 */
export function fetchDeleteUser(id: number) {
  return request.del({
    url: `/api/admin/users/${id}`,
    showSuccessMessage: true
  })
}

/** 批量删除用户 */
export function fetchBatchDeleteUsers(ids: number[]) {
  return request.del({
    url: '/api/admin/users',
    data: { ids: ids.join(',') },
    showSuccessMessage: true
  })
}

// ==================== 帖子管理 ====================

/** 获取帖子列表 */
export function fetchGetPostList(params?: Api.Admin.PostSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Admin.Post>>({
    url: '/api/admin/posts',
    params
  })
}

/** 获取帖子详情 */
export function fetchGetPost(id: number) {
  return request.get<Api.Admin.Post>({
    url: `/api/admin/posts/${id}`
  })
}

/** 创建帖子 */
export function fetchCreatePost(data: Api.Admin.PostFormParams) {
  return request.post<Api.Admin.Post>({
    url: '/api/admin/posts',
    data,
    showSuccessMessage: true
  })
}

/** 更新帖子 */
export function fetchUpdatePost(id: number, data: Api.Admin.PostFormParams) {
  return request.put<Api.Admin.Post>({
    url: `/api/admin/posts/${id}`,
    data,
    showSuccessMessage: true
  })
}

/** 删除帖子 */
export function fetchDeletePost(id: number) {
  return request.del({
    url: `/api/admin/posts/${id}`,
    showSuccessMessage: true
  })
}

/** 批量删除帖子 */
export function fetchBatchDeletePosts(ids: number[]) {
  return request.del({
    url: '/api/admin/posts',
    data: { ids: ids.join(',') },
    showSuccessMessage: true
  })
}

// ==================== 评论管理 ====================

/** 获取评论列表 */
export function fetchGetCommentList(params?: Api.Admin.CommentSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Admin.Comment>>({
    url: '/api/admin/comments',
    params
  })
}

/** 获取评论详情 */
export function fetchGetComment(id: number) {
  return request.get<Api.Admin.Comment>({
    url: `/api/admin/comments/${id}`
  })
}

/** 创建评论 */
export function fetchCreateComment(data: Api.Admin.CommentFormParams) {
  return request.post<Api.Admin.Comment>({
    url: '/api/admin/comments',
    data,
    showSuccessMessage: true
  })
}

/** 更新评论 */
export function fetchUpdateComment(id: number, data: { content: string }) {
  return request.put<Api.Admin.Comment>({
    url: `/api/admin/comments/${id}`,
    data,
    showSuccessMessage: true
  })
}

/** 删除评论 */
export function fetchDeleteComment(id: number) {
  return request.del({
    url: `/api/admin/comments/${id}`,
    showSuccessMessage: true
  })
}

/** 批量删除评论 */
export function fetchBatchDeleteComments(ids: number[]) {
  return request.del({
    url: '/api/admin/comments',
    data: { ids: ids.join(',') },
    showSuccessMessage: true
  })
}

// ==================== 标签管理 ====================

/** 获取标签列表 */
export function fetchGetTagList(params?: Api.Admin.TagSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Admin.Tag>>({
    url: '/api/admin/tags',
    params
  })
}

/** 获取标签详情 */
export function fetchGetTag(id: number) {
  return request.get<Api.Admin.Tag>({
    url: `/api/admin/tags/${id}`
  })
}

/** 创建标签 */
export function fetchCreateTag(data: { name: string }) {
  return request.post<Api.Admin.Tag>({
    url: '/api/admin/tags',
    data,
    showSuccessMessage: true
  })
}

/** 更新标签 */
export function fetchUpdateTag(id: number, data: { name: string }) {
  return request.put<Api.Admin.Tag>({
    url: `/api/admin/tags/${id}`,
    data,
    showSuccessMessage: true
  })
}

/** 删除标签 */
export function fetchDeleteTag(id: number) {
  return request.del({
    url: `/api/admin/tags/${id}`,
    showSuccessMessage: true
  })
}

/** 批量删除标签 */
export function fetchBatchDeleteTags(ids: number[]) {
  return request.del({
    url: '/api/admin/tags',
    data: { ids: ids.join(',') },
    showSuccessMessage: true
  })
}

// ==================== 分类管理 ====================

/** 获取分类列表 */
export function fetchGetCategoryList(params?: Api.Admin.CategorySearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Admin.Category>>({
    url: '/api/admin/categories',
    params
  })
}

/** 获取分类详情 */
export function fetchGetCategory(id: number) {
  return request.get<Api.Admin.Category>({
    url: `/api/admin/categories/${id}`
  })
}

/** 创建分类 */
export function fetchCreateCategory(data: { name: string; category_title: string }) {
  return request.post<Api.Admin.Category>({
    url: '/api/admin/categories',
    data,
    showSuccessMessage: true
  })
}

/** 更新分类 */
export function fetchUpdateCategory(
  id: number,
  data: { name?: string; category_title?: string }
) {
  return request.put<Api.Admin.Category>({
    url: `/api/admin/categories/${id}`,
    data,
    showSuccessMessage: true
  })
}

/** 删除分类 */
export function fetchDeleteCategory(id: number) {
  return request.del({
    url: `/api/admin/categories/${id}`,
    showSuccessMessage: true
  })
}

/** 批量删除分类 */
export function fetchBatchDeleteCategories(ids: number[]) {
  return request.del({
    url: '/api/admin/categories',
    data: { ids: ids.join(',') },
    showSuccessMessage: true
  })
}

// ==================== 管理员管理 ====================

/** 获取管理员列表 */
export function fetchGetAdminList(params?: Api.Admin.AdminSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Admin.AdminUser>>({
    url: '/api/admin/admins',
    params
  })
}

/** 获取管理员详情 */
export function fetchGetAdmin(id: number) {
  return request.get<Api.Admin.AdminUser>({
    url: `/api/admin/admins/${id}`
  })
}

/** 创建管理员 */
export function fetchCreateAdmin(data: { username: string; password: string }) {
  return request.post<Api.Admin.AdminUser>({
    url: '/api/admin/admins',
    data,
    showSuccessMessage: true
  })
}

/** 更新管理员密码 */
export function fetchUpdateAdmin(id: number, data: { password: string }) {
  return request.put({
    url: `/api/admin/admins/${id}`,
    data,
    showSuccessMessage: true
  })
}

/** 删除管理员 */
export function fetchDeleteAdmin(id: number) {
  return request.del({
    url: `/api/admin/admins/${id}`,
    showSuccessMessage: true
  })
}

/** 批量删除管理员 */
export function fetchBatchDeleteAdmins(ids: number[]) {
  return request.del({
    url: '/api/admin/admins',
    data: { ids: ids.join(',') },
    showSuccessMessage: true
  })
}

// ==================== 统计信息 ====================

/** 获取统计概览 */
export function fetchGetStatsOverview() {
  return request.get<Api.Admin.StatsOverview>({
    url: '/api/admin/stats/overview'
  })
}

// ==================== 系统设置 ====================

/** 获取系统设置 */
export function fetchGetSystemSettings() {
  return request.get<Api.Admin.SystemSetting[]>({
    url: '/api/admin/system-settings'
  })
}

/** 更新系统设置 */
export function fetchUpdateSystemSettings(settings: Record<string, string>) {
  return request.put({
    url: '/api/admin/system-settings',
    data: { settings: JSON.stringify(settings) },
    showSuccessMessage: true
  })
}

// ==================== 点赞管理 ====================

/** 获取点赞列表 */
export function fetchGetLikeList(params?: Api.Admin.LikeSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Admin.Like>>({
    url: '/api/admin/likes',
    params
  })
}

/** 删除点赞 */
export function fetchDeleteLike(id: number) {
  return request.del({
    url: `/api/admin/likes/${id}`,
    showSuccessMessage: true
  })
}

// ==================== 关注管理 ====================

/** 获取关注列表 */
export function fetchGetFollowList(params?: Api.Admin.FollowSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Admin.Follow>>({
    url: '/api/admin/follows',
    params
  })
}

/** 删除关注 */
export function fetchDeleteFollow(id: number) {
  return request.del({
    url: `/api/admin/follows/${id}`,
    showSuccessMessage: true
  })
}

// ==================== 收藏管理 ====================

/** 获取收藏列表 */
export function fetchGetCollectionList(params?: Api.Admin.CollectionSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Admin.Collection>>({
    url: '/api/admin/collections',
    params
  })
}

/** 删除收藏 */
export function fetchDeleteCollection(id: number) {
  return request.del({
    url: `/api/admin/collections/${id}`,
    showSuccessMessage: true
  })
}

// ==================== 会话管理 ====================

/** 获取会话列表 */
export function fetchGetSessionList(params?: Api.Admin.SessionSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Admin.Session>>({
    url: '/api/admin/sessions',
    params
  })
}

/** 删除会话 */
export function fetchDeleteSession(id: number) {
  return request.del({
    url: `/api/admin/sessions/${id}`,
    showSuccessMessage: true
  })
}

// ==================== 认证审核管理 ====================

/** 获取审核列表 */
export function fetchGetAuditList(params?: Api.Admin.AuditSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Admin.AuditRecord>>({
    url: '/api/admin/audit',
    params
  })
}

/** 获取审核详情 */
export function fetchGetAudit(id: number) {
  return request.get<Api.Admin.AuditRecord>({
    url: `/api/admin/audit/${id}`
  })
}

/** 审核通过 */
export function fetchApproveAudit(id: number) {
  return request.post({
    url: `/api/admin/audit/${id}/approve`,
    showSuccessMessage: true
  })
}

/** 审核拒绝 */
export function fetchRejectAudit(id: number, data: { reason: string }) {
  return request.post({
    url: `/api/admin/audit/${id}/reject`,
    data,
    showSuccessMessage: true
  })
}

// ==================== 许可证管理 ====================

/** 获取许可证列表 */
export function fetchGetLicenseList(params?: Api.Admin.LicenseSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Admin.License>>({
    url: '/api/admin/licenses',
    params
  })
}

/** 获取许可证统计 */
export function fetchGetLicenseStats() {
  return request.get<Api.Admin.LicenseStats>({
    url: '/api/admin/licenses/stats'
  })
}

/** 删除许可证 */
export function fetchDeleteLicense(id: number) {
  return request.del({
    url: `/api/admin/licenses/${id}`,
    showSuccessMessage: true
  })
}

/** 批量生成许可证 */
export function fetchBatchCreateLicenses(data: { count: number }) {
  return request.post({
    url: '/api/admin/licenses/batch',
    data,
    showSuccessMessage: true
  })
}

// ==================== 应用版本管理 ====================

/** 获取应用版本列表 */
export function fetchGetAppVersionList(params?: Api.Admin.AppVersionSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Admin.AppVersion>>({
    url: '/api/admin/app-versions',
    params
  })
}

/** 获取应用版本详情 */
export function fetchGetAppVersion(id: number) {
  return request.get<Api.Admin.AppVersion>({
    url: `/api/admin/app-versions/${id}`
  })
}

/** 创建应用版本 */
export function fetchCreateAppVersion(data: Api.Admin.AppVersionFormParams) {
  return request.post<Api.Admin.AppVersion>({
    url: '/api/admin/app-versions',
    data,
    showSuccessMessage: true
  })
}

/** 更新应用版本 */
export function fetchUpdateAppVersion(id: number, data: Api.Admin.AppVersionFormParams) {
  return request.put<Api.Admin.AppVersion>({
    url: `/api/admin/app-versions/${id}`,
    data,
    showSuccessMessage: true
  })
}

/** 删除应用版本 */
export function fetchDeleteAppVersion(id: number) {
  return request.del({
    url: `/api/admin/app-versions/${id}`,
    showSuccessMessage: true
  })
}

// ==================== 违禁词管理 ====================

/** 获取违禁词列表 */
export function fetchGetBannedWordList(params?: Api.Admin.BannedWordSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Admin.BannedWord>>({
    url: '/api/admin/banned-words',
    params
  })
}

/** 创建违禁词 */
export function fetchCreateBannedWord(data: { word: string; category_id?: number; severity?: string }) {
  return request.post<Api.Admin.BannedWord>({
    url: '/api/admin/banned-words',
    data,
    showSuccessMessage: true
  })
}

/** 更新违禁词 */
export function fetchUpdateBannedWord(id: number, data: { word?: string; category_id?: number; severity?: string; is_active?: boolean }) {
  return request.put<Api.Admin.BannedWord>({
    url: `/api/admin/banned-words/${id}`,
    data,
    showSuccessMessage: true
  })
}

/** 删除违禁词 */
export function fetchDeleteBannedWord(id: number) {
  return request.del({
    url: `/api/admin/banned-words/${id}`,
    showSuccessMessage: true
  })
}

/** 获取违禁词分类列表 */
export function fetchGetBannedWordCategories() {
  return request.get<Api.Admin.BannedWordCategory[]>({
    url: '/api/admin/banned-word-categories'
  })
}

// ==================== 系统通知管理 ====================

/** 获取系统通知列表 */
export function fetchGetSystemNotificationList(params?: Api.Admin.SystemNotificationSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Admin.SystemNotification>>({
    url: '/api/admin/system-notifications',
    params
  })
}

/** 创建系统通知 */
export function fetchCreateSystemNotification(data: Api.Admin.SystemNotificationFormParams) {
  return request.post<Api.Admin.SystemNotification>({
    url: '/api/admin/system-notifications',
    data,
    showSuccessMessage: true
  })
}

/** 删除系统通知 */
export function fetchDeleteSystemNotification(id: number) {
  return request.del({
    url: `/api/admin/system-notifications/${id}`,
    showSuccessMessage: true
  })
}

/** 重发系统通知 */
export function fetchResendSystemNotification(id: number) {
  return request.post({
    url: `/api/admin/system-notifications/${id}/resend`,
    showSuccessMessage: true
  })
}

// ==================== 内容审核管理 ====================

/** 获取内容审核列表 */
export function fetchGetContentReviewList(params?: Api.Admin.ContentReviewSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Admin.ContentReview>>({
    url: '/api/admin/content-review',
    params
  })
}

/** 获取内容审核详情 */
export function fetchGetContentReview(id: number) {
  return request.get<Api.Admin.ContentReview>({
    url: `/api/admin/content-review/${id}`
  })
}

/** 内容审核通过 */
export function fetchApproveContentReview(id: number) {
  return request.post({
    url: `/api/admin/content-review/${id}/approve`,
    showSuccessMessage: true
  })
}

/** 内容审核拒绝 */
export function fetchRejectContentReview(id: number, data: { reason: string }) {
  return request.post({
    url: `/api/admin/content-review/${id}/reject`,
    data,
    showSuccessMessage: true
  })
}

// ==================== 队列监控 ====================

/** 获取队列列表 */
export function fetchGetQueues() {
  return request.get<Api.Admin.QueuesResponse>({
    url: '/api/admin/queues'
  })
}

/** 获取队列任务列表 */
export function fetchGetQueueJobs(name: string, params?: Api.Common.CommonSearchParams) {
  return request.get<Api.Common.PaginatedResponse<Api.Admin.QueueJob>>({
    url: `/api/admin/queues/${name}/jobs`,
    params
  })
}

/** 重试队列任务 */
export function fetchRetryQueueJob(name: string, jobId: string) {
  return request.post({
    url: `/api/admin/queues/${name}/jobs/${jobId}/retry`,
    showSuccessMessage: true
  })
}

// ==================== 菜单管理（保留兼容） ====================

/** 获取菜单列表 */
export function fetchGetMenuList() {
  return request.get<AppRouteRecord[]>({
    url: '/api/v3/system/menus'
  })
}

// ==================== 兼容旧接口 ====================

/** 获取角色列表（保留兼容） */
export function fetchGetRoleList(params?: Api.SystemManage.RoleSearchParams) {
  return request.get<Api.SystemManage.RoleList>({
    url: '/api/role/list',
    params
  })
}
