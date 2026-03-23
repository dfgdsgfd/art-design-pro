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
      path: 'like',
      name: 'AdminLike',
      component: '/system/like',
      meta: {
        title: 'menus.system.like',
        icon: 'ri:heart-line',
        keepAlive: true
      }
    },
    {
      path: 'follow',
      name: 'AdminFollow',
      component: '/system/follow',
      meta: {
        title: 'menus.system.follow',
        icon: 'ri:user-follow-line',
        keepAlive: true
      }
    },
    {
      path: 'collection',
      name: 'AdminCollection',
      component: '/system/collection',
      meta: {
        title: 'menus.system.collection',
        icon: 'ri:star-line',
        keepAlive: true
      }
    },
    {
      path: 'session',
      name: 'AdminSession',
      component: '/system/session',
      meta: {
        title: 'menus.system.session',
        icon: 'ri:key-line',
        keepAlive: true
      }
    },
    {
      path: 'audit',
      name: 'AdminAudit',
      component: '/system/audit',
      meta: {
        title: 'menus.system.audit',
        icon: 'ri:shield-check-line',
        keepAlive: true
      }
    },
    {
      path: 'license',
      name: 'AdminLicense',
      component: '/system/license',
      meta: {
        title: 'menus.system.license',
        icon: 'ri:key-2-line',
        keepAlive: true
      }
    },
    {
      path: 'app-version',
      name: 'AdminAppVersion',
      component: '/system/app-version',
      meta: {
        title: 'menus.system.appVersion',
        icon: 'ri:smartphone-line',
        keepAlive: true
      }
    },
    {
      path: 'banned-word',
      name: 'AdminBannedWord',
      component: '/system/banned-word',
      meta: {
        title: 'menus.system.bannedWord',
        icon: 'ri:forbid-line',
        keepAlive: true
      }
    },
    {
      path: 'notification',
      name: 'AdminNotification',
      component: '/system/notification',
      meta: {
        title: 'menus.system.notification',
        icon: 'ri:notification-line',
        keepAlive: true
      }
    },
    {
      path: 'content-review',
      name: 'AdminContentReview',
      component: '/system/content-review',
      meta: {
        title: 'menus.system.contentReview',
        icon: 'ri:eye-line',
        keepAlive: true
      }
    },
    {
      path: 'queue',
      name: 'AdminQueue',
      component: '/system/queue',
      meta: {
        title: 'menus.system.queue',
        icon: 'ri:stack-line',
        keepAlive: true
      }
    },
    {
      path: 'system-settings',
      name: 'AdminSystemSettings',
      component: '/system/system-settings',
      meta: {
        title: 'menus.system.systemSettings',
        icon: 'ri:settings-line',
        keepAlive: true
      }
    },
    {
      path: 'notification-template',
      name: 'AdminNotificationTemplate',
      component: '/system/notification-template',
      meta: {
        title: 'menus.system.notificationTemplate',
        icon: 'ri:mail-settings-line',
        keepAlive: true
      }
    },
    {
      path: 'open-api',
      name: 'AdminOpenApi',
      component: '/system/open-api',
      meta: {
        title: 'menus.system.openApi',
        icon: 'ri:key-fill',
        keepAlive: true
      }
    },
    {
      path: 'monitor',
      name: 'AdminMonitor',
      component: '/system/monitor',
      meta: {
        title: 'menus.system.monitor',
        icon: 'ri:pulse-line',
        keepAlive: true
      }
    },
    {
      path: 'user-toolbar',
      name: 'AdminUserToolbar',
      component: '/system/user-toolbar',
      meta: {
        title: 'menus.system.userToolbar',
        icon: 'ri:tools-line',
        keepAlive: true
      }
    },
    {
      path: 'recommendation',
      name: 'AdminRecommendation',
      component: '/system/recommendation',
      meta: {
        title: 'menus.system.recommendation',
        icon: 'ri:thumb-up-line',
        keepAlive: true
      }
    },
    {
      path: 'batch-upload',
      name: 'AdminBatchUpload',
      component: '/system/batch-upload',
      meta: {
        title: 'menus.system.batchUpload',
        icon: 'ri:upload-cloud-line',
        keepAlive: true
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
