import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/public/file/download/excel/',
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '首页', icon: 'dashboard' }
    }]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/member',
    component: Layout,
    // redirect: '/member/table',
    // name: 'Example',
    meta: { title: '会员', icon: 'people' },
    children: [
      {
        path: 'index',
        name: 'Member',
        component: () => import('@/views/member/index'),
        meta: { title: '会员列表', icon: 'people' }
      },
      {
        path: 'detail',
        name: 'Detail',
        component: () => import('@/views/member/detail/index'),
        meta: { title: '会员详情', icon: 'people' }
      },
      {
        path: 'delete',
        name: 'Delete',
        component: () => import('@/views/member/delete/delete'),
        meta: { roles: ['mpow', 'victsing', 'holife', 'ikich'], title: '删除', icon: 'edit' }
      }
    ]
  },
  {
    path: '/point',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Point',
        component: () => import('@/views/point/index'),
        meta: { roles: ['mpow', 'victsing', 'holife'], title: '积分记录', icon: 'star' }
      }
    ]
  },

  {
    path: '/order',
    component: Layout,
    meta: { title: '订单', icon: 'people' },
    children: [
      {
        path: 'index',
        name: 'Order',
        component: () => import('@/views/order/index'),
        meta: { title: '订单记录', icon: 'shopping' }
      },
      {
        path: 'review',
        name: 'orderReview',
        component: () => import('@/views/order/review'),
        meta: { roles: ['holife'],title: '订单评论', icon: 'shopping' }
      }
    ]
  },

  {
    path: '/product',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Product',
        component: () => import('@/views/product/index'),
        meta: { roles: ['mpow', 'victsing'], title: '产品列表', icon: 'form' }
      }
    ]
  },

  {
    path: '/mail',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'mail',
        component: () => import('@/views/mail/index'),
        meta: { roles: ['mpow', 'victsing'], title: '邮件记录', icon: 'email' }
        // meta: { roles: ['victsing'], title: '邮件记录', icon: 'form' }
      }
    ]
  },

  {
    path: '/coupon',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'coupon',
        component: () => import('@/views/coupon/index'),
        meta: { roles: ['mpow', 'victsing'], title: '优惠券记录', icon: 'example' }
      }
    ]
  },

  {
    path: '/referral',
    component: Layout,
    meta: { roles: ['victsing'], title: '活动记录', icon: 'example' },
    children: [
      {
        path: 'index',
        name: 'referral',
        component: () => import('@/views/referral/index'),
        meta: { title: 'referral活动记录', icon: 'example' }
      },
      {
        path: 'review',
        name: 'referral',
        component: () => import('@/views/referral/review'),
        meta: { title: '活动审核', icon: 'example' }
      },
      // {
      //   path: 'reviews',
      //   name: 'reviews',
      //   component: () => import('@/views/review/index'),
      //   meta: { title: 'review收集活动', icon: 'example' }
      // }
    ]
  },
  {
    path: '/active',
    component: Layout,
    meta: { roles: ['mpow'], title: '活动记录', icon: 'example' },
    children: [
      {
        path: 'reviews',
        name: 'reviews',
        component: () => import('@/views/review/index'),
        meta: { title: 'review收集活动', icon: 'example' }
      }
    ]
  },
  // {
  //   path: 'external-link',
  //   component: Layout,
  //   children: [
  //     {
  //       path: 'https://panjiachen.github.io/vue-element-admin-site/#/',
  //       meta: { title: 'External Link', icon: 'link' }
  //     }
  //   ]
  // },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]
const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
