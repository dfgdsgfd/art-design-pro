import { AppRouteRecord } from '@/types/router'

export const systemRoutes: AppRouteRecord = {
  path: '/system',
  name: 'System',
  component: '/index/index',
  meta: {
    title: 'menus.system.title',
    icon: 'ri:settings-3-line',
    roles: ['R_SUPER', 'R_ADMIN']
  },
  children: [
    {
      path: 'user',
      name: 'AdminUser',
      component: '/system/user',
      meta: {
        title: 'menus.system.user',
        icon: 'ri:user-line',
        keepAlive: true
      }
    },
    {
      path: 'post',
      name: 'AdminPost',
      component: '/system/post',
      meta: {
        title: 'menus.system.post',
        icon: 'ri:article-line',
        keepAlive: true
      }
    },
    {
      path: 'comment',
      name: 'AdminComment',
      component: '/system/comment',
      meta: {
        title: 'menus.system.comment',
        icon: 'ri:chat-3-line',
        keepAlive: true
      }
    },
    {
      path: 'tag',
      name: 'AdminTag',
      component: '/system/tag',
      meta: {
        title: 'menus.system.tag',
        icon: 'ri:price-tag-3-line',
        keepAlive: true
      }
    },
    {
      path: 'category',
      name: 'AdminCategory',
      component: '/system/category',
      meta: {
        title: 'menus.system.category',
        icon: 'ri:folder-line',
        keepAlive: true
      }
    },
    {
      path: 'admin',
      name: 'AdminManage',
      component: '/system/admin',
      meta: {
        title: 'menus.system.admin',
        icon: 'ri:shield-user-line',
        keepAlive: true,
        roles: ['R_SUPER']
      }
    },
    {
      path: 'user-center',
      name: 'UserCenter',
      component: '/system/user-center',
      meta: {
        title: 'menus.system.userCenter',
        icon: 'ri:user-line',
        isHide: true,
        keepAlive: true,
        isHideTab: true
      }
    }
  ]
}
