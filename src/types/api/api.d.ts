/**
 * API 接口类型定义模块
 *
 * 提供所有后端接口的类型定义，基于汐社校园图文社区 API 文档
 *
 * @module types/api/api
 */

declare namespace Api {
  /** 通用类型 */
  namespace Common {
    /** 分页参数（请求用） */
    interface PaginationParams {
      /** 当前页码 */
      page: number
      /** 每页条数 */
      limit: number
    }

    /** 通用搜索参数 */
    type CommonSearchParams = Partial<PaginationParams>

    /** 分页信息（响应用） */
    interface PaginationInfo {
      page: number
      limit: number
      total: number
      totalPages: number
    }

    /** 分页响应基础结构 */
    interface PaginatedResponse<T = any> {
      list: T[]
      pagination: PaginationInfo
    }

    /** 排序参数 */
    interface SortParams {
      sortField?: string
      sortOrder?: string
    }
  }

  /** 认证类型 */
  namespace Auth {
    /** 管理员登录参数 */
    interface LoginParams {
      username: string
      password: string
    }

    /** 登录响应 */
    interface LoginResponse {
      access_token: string
      refresh_token?: string
      expires_in?: number
      /** 兼容旧格式 */
      token?: string
      refreshToken?: string
    }

    /** 管理员信息 */
    interface UserInfo {
      id: number
      username: string
      buttons: string[]
      roles: string[]
      userId: number
      userName: string
      email: string
      avatar?: string
    }
  }

  /** 管理后台类型 */
  namespace Admin {
    // ==================== 用户管理 ====================

    /** 用户 */
    interface User {
      id: number
      user_id: string
      nickname: string
      avatar: string
      bio: string
      location: string
      verified: number
      is_active: string
      gender: string
      zodiac_sign: string
      mbti: string
      education: string
      major: string
      interests: string
      created_at: string
      updated_at: string
    }

    /** 用户搜索参数 */
    interface UserSearchParams extends Api.Common.CommonSearchParams, Api.Common.SortParams {
      user_id?: string
      nickname?: string
      location?: string
      is_active?: string
    }

    /** 用户创建/更新参数 */
    interface UserFormParams {
      user_id?: string
      nickname?: string
      avatar?: string
      bio?: string
      location?: string
      is_active?: string
      password?: string
      gender?: string
      zodiac_sign?: string
      mbti?: string
      education?: string
      major?: string
      interests?: string
      verified?: string
    }

    // ==================== 帖子管理 ====================

    /** 帖子 */
    interface Post {
      id: number
      title: string
      content: string
      images: string
      type: number
      user_id: string
      likes_count: number
      comments_count: number
      collects_count: number
      category_id: number
      is_draft: number
      view_count: number
      video_url: string
      cover_url: string
      created_at: string
      updated_at: string
    }

    /** 帖子搜索参数 */
    interface PostSearchParams extends Api.Common.CommonSearchParams, Api.Common.SortParams {
      title?: string
      user_display_id?: string
      category_id?: string
      type?: string
      is_draft?: string
    }

    /** 帖子创建/更新参数 */
    interface PostFormParams {
      user_id?: string
      title?: string
      content?: string
      category_id?: string
      images?: string
      image_urls?: string
      tags?: string
      type?: string
      is_draft?: string
      video_url?: string
      cover_url?: string
      view_count?: number
      video?: string
    }

    // ==================== 评论管理 ====================

    /** 评论 */
    interface Comment {
      id: number
      content: string
      post_id: number
      user_id: string
      parent_id: number | null
      audit_status: string
      created_at: string
      updated_at: string
    }

    /** 评论搜索参数 */
    interface CommentSearchParams extends Api.Common.CommonSearchParams, Api.Common.SortParams {
      user_display_id?: string
      post_id?: string
      content?: string
      audit_status?: string
    }

    /** 评论创建参数 */
    interface CommentFormParams {
      user_id?: string
      post_id?: string
      content?: string
      parent_id?: string
    }

    // ==================== 标签管理 ====================

    /** 标签 */
    interface Tag {
      id: number
      name: string
      post_count: number
      created_at: string
      updated_at: string
    }

    /** 标签搜索参数 */
    interface TagSearchParams extends Api.Common.CommonSearchParams, Api.Common.SortParams {
      name?: string
    }

    // ==================== 分类管理 ====================

    /** 分类 */
    interface Category {
      id: number
      name: string
      category_title: string
      created_at: string
      updated_at: string
    }

    /** 分类搜索参数 */
    interface CategorySearchParams extends Api.Common.CommonSearchParams, Api.Common.SortParams {
      name?: string
      category_title?: string
    }

    // ==================== 管理员管理 ====================

    /** 管理员 */
    interface AdminUser {
      id: number
      username: string
      created_at: string
      updated_at: string
    }

    /** 管理员搜索参数 */
    interface AdminSearchParams extends Api.Common.CommonSearchParams, Api.Common.SortParams {
      username?: string
    }

    // ==================== 统计信息 ====================

    /** 统计概览 */
    interface StatsOverview {
      totalUsers: number
      totalPosts: number
      totalComments: number
      totalLikes: number
      [key: string]: any
    }

    // ==================== 系统设置 ====================

    /** 系统设置项 */
    interface SystemSetting {
      key: string
      value: string
      category: string
      description: string
    }
  }

  /** 系统管理类型（保留兼容） */
  namespace SystemManage {
    /** 用户列表 */
    type UserList = Api.Common.PaginatedResponse<Api.Admin.User>

    /** 用户搜索参数 */
    type UserSearchParams = Api.Admin.UserSearchParams

    /** 角色列表 */
    type RoleList = Api.Common.PaginatedResponse<RoleListItem>

    /** 角色列表项 */
    interface RoleListItem {
      roleId: number
      roleName: string
      roleCode: string
      description: string
      enabled: boolean
      createTime: string
    }

    /** 角色搜索参数 */
    type RoleSearchParams = Partial<
      Pick<RoleListItem, 'roleId' | 'roleName' | 'roleCode' | 'description' | 'enabled'> &
        Api.Common.CommonSearchParams & {
          startTime: string | null
          endTime: string | null
        }
    >
  }
}
