import request from '@/utils/http'

/**
 * 管理员登录
 * @param params 登录参数
 * @returns 登录响应
 */
export function fetchLogin(params: Api.Auth.LoginParams) {
  return request.post<Api.Auth.LoginResponse>({
    url: '/api/auth/admin/login',
    params
  })
}

/**
 * 获取当前管理员信息
 * @returns 管理员信息
 */
export function fetchGetUserInfo() {
  return request.get<Api.Auth.UserInfo>({
    url: '/api/auth/admin/me'
  })
}
