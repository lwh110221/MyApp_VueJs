import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { logger } from '../utils/logger'

// 路由配置
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/Register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/Profile.vue'),
    meta: {
      requiresAuth: true,
      title: '个人中心'
    }
  },
  {
    path: '/change-password',
    name: 'changePassword',
    component: () => import('../views/ChangePassword.vue'),
    meta: {
      requiresAuth: true,
      title: '修改密码'
    }
  },
  {
    path: '/403',
    name: 'forbidden',
    component: () => import('../views/ErrorPage.vue'),
    props: {
      errorCode: '403',
      errorMessage: '禁止访问',
      subMessage: '抱歉，您没有权限访问此页面'
    },
    meta: { title: '禁止访问' }
  },
  {
    path: '/404',
    name: 'notFound',
    component: () => import('../views/NotFound.vue'),
    meta: { title: '页面未找到' }
  },
  {
    path: '/500',
    name: 'serverError',
    component: () => import('../views/ErrorPage.vue'),
    props: {
      errorCode: '500',
      errorMessage: '服务器错误',
      subMessage: '抱歉，服务器出现了一些问题'
    },
    meta: { title: '服务器错误' }
  },
  {
    path: '/error',
    name: 'error',
    component: () => import('../views/ErrorPage.vue'),
    props: {
      errorCode: 'Error',
      errorMessage: '发生错误',
      subMessage: '抱歉，发生了一些错误'
    },
    meta: { title: '错误' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

// 新闻模块路由
const newsRoutes = {
  path: '/news',
  name: 'News',
  component: () => import('@/views/news/NewsList.vue'),
  meta: {
    title: '新闻中心'
  }
};

const newsDetailRoute = {
  path: '/news/detail/:id',
  name: 'NewsDetail',
  component: () => import('@/views/news/NewsDetail.vue'),
  meta: {
    title: '新闻详情'
  }
};

// 将新闻路由添加到路由配置中
routes.push(newsRoutes);
routes.push(newsDetailRoute);

// 社区模块路由
const communityRoutes = {
  path: '/community',
  name: 'Community',
  component: () => import('@/views/community/CommunityList.vue'),
  meta: {
    title: '社区'
  }
};

const communityDetailRoute = {
  path: '/community/post/:id',
  name: 'PostDetail',
  component: () => import('@/views/community/PostDetail.vue'),
  meta: {
    title: '帖子详情'
  }
};

const communityCreateRoute = {
  path: '/community/create',
  name: 'CreatePost',
  component: () => import('@/views/community/CreatePost.vue'),
  meta: {
    requiresAuth: true,
    title: '发布帖子'
  }
};

const communityEditRoute = {
  path: '/community/edit/:id',
  name: 'EditPost',
  component: () => import('@/views/community/CreatePost.vue'),
  meta: {
    requiresAuth: true,
    title: '编辑帖子'
  },
  props: route => ({
    isEdit: true,
    postId: parseInt(route.params.id)
  })
};

// 将社区路由添加到路由配置中
routes.push(communityRoutes);
routes.push(communityDetailRoute);
routes.push(communityCreateRoute);
routes.push(communityEditRoute);

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 配置NProgress
NProgress.configure({
  showSpinner: false,
  minimum: 0.1,
  trickleSpeed: 200
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 开始加载进度条
  NProgress.start()

  try {
    // 设置页面标题
    document.title = to.meta.title ? `${to.meta.title} - 我的应用` : '我的应用'

    // 检查是否需要认证
    if (to.matched.some(record => record.meta.requiresAuth)) {
      const token = localStorage.getItem('token')
      if (!token) {
        // 记录未登录访问受保护路由的情况
        logger.logError(
          new Error('Unauthorized access attempt'),
          `Route: ${to.fullPath}, From: ${from.fullPath}`
        )
        next({
          path: '/login',
          query: { redirect: to.fullPath }
        })
        return
      }
    }

    // 如果已登录，禁止访问登录和注册页
    if (to.matched.some(record => record.name === 'login' || record.name === 'register')) {
      const token = localStorage.getItem('token')
      if (token) {
        next({ path: '/' })
        return
      }
    }

    next()
  } catch (error) {
    logger.logError(error, `Route error: ${to.fullPath}`)
    next('/error')
  }
})

router.afterEach(() => {
  // 结束加载进度条
  NProgress.done()
})

// 路由错误处理
router.onError((error) => {
  logger.logError(error, 'Router Error')
  NProgress.done()
})

export default router
