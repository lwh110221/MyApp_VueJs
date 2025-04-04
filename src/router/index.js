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
    path: '/forgot-password',
    name: 'forgotPassword',
    component: () => import('../views/ForgotPassword.vue'),
    meta: { title: '找回密码' }
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
    path: '/user/:id',
    name: 'userProfile',
    component: () => import('../views/user/UserProfile.vue'),
    meta: {
      title: '用户主页'
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

// 专家求助模块路由
const helpRoutes = {
  path: '/help',
  name: 'Help',
  component: () => import('@/views/help/HelpList.vue'),
  meta: {
    title: '专家求助'
  }
};

const helpDetailRoute = {
  path: '/help/post/:id',
  name: 'HelpDetail',
  component: () => import('@/views/help/HelpDetail.vue'),
  meta: {
    title: '求助详情'
  }
};

const helpCreateRoute = {
  path: '/help/create',
  name: 'CreateHelp',
  component: () => import('@/views/help/CreateHelp.vue'),
  meta: {
    requiresAuth: true,
    title: '发布求助'
  }
};

// 将专家求助路由添加到路由配置中
routes.push(helpRoutes);
routes.push(helpDetailRoute);
routes.push(helpCreateRoute);

// 聊天模块路由
const chatRoute = {
  path: '/chat',
  name: 'Chat',
  component: () => import('@/views/chat'),
  meta: {
    requiresAuth: true,
    title: '我的消息'
  }
};

// 聊天模块路由 - 带有用户ID参数
const chatWithUserRoute = {
  path: '/chat/user/:partnerId',
  name: 'ChatWithUser',
  component: () => import('@/views/chat'),
  meta: {
    requiresAuth: true,
    title: '聊天对话'
  }
};

// AI聊天助手路由
const aiChatRoute = {
  path: '/ai-chat',
  name: 'AiChat',
  component: () => import('@/views/ai/AiChat.vue'),
  meta: {
    requiresAuth: true,
    title: 'AI农业助手'
  }
};

// 将聊天路由添加到路由配置中
routes.push(chatRoute);
routes.push(chatWithUserRoute);
routes.push(aiChatRoute);

// 农产品模块路由
const productListRoute = {
  path: '/products',
  name: 'ProductList',
  component: () => import('@/views/product/ProductList.vue'),
  meta: {
    title: '产品列表'
  }
};

const productDetailRoute = {
  path: '/products/:id',
  name: 'ProductDetail',
  component: () => import('@/views/product/ProductDetail.vue'),
  meta: {
    title: '产品详情'
  }
};

const productCreateRoute = {
  path: '/products/create',
  name: 'CreateProduct',
  component: () => import('@/views/product/CreateProduct.vue'),
  meta: {
    requiresAuth: true,
    title: '发布产品'
  }
};

const productEditRoute = {
  path: '/products/edit/:id',
  name: 'EditProduct',
  component: () => import('@/views/product/CreateProduct.vue'),
  meta: {
    requiresAuth: true,
    title: '编辑产品'
  },
  props: route => ({
    isEdit: true,
    productId: parseInt(route.params.id)
  })
};

const myProductsRoute = {
  path: '/my-products',
  name: 'MyProducts',
  component: () => import('@/views/product/MyProducts.vue'),
  meta: {
    requiresAuth: true,
    title: '我的产品'
  }
};

// 购物车路由
const cartRoute = {
  path: '/cart',
  name: 'Cart',
  component: () => import('@/views/product/Cart.vue'),
  meta: {
    requiresAuth: true,
    title: '购物车'
  }
};

// 订单路由
const orderListRoute = {
  path: '/orders',
  name: 'OrderList',
  component: () => import('@/views/product/OrderList.vue'),
  meta: {
    requiresAuth: true,
    title: '我的订单'
  }
};

// 卖家订单路由
const sellerOrderListRoute = {
  path: '/seller/orders',
  name: 'SellerOrderList',
  component: () => import('@/views/product/SellerOrderList.vue'),
  meta: {
    requiresAuth: true,
    title: '销售订单'
  }
};

const sellerOrderDetailRoute = {
  path: '/seller/orders/:id',
  name: 'SellerOrderDetail',
  component: () => import('@/views/product/SellerOrderDetail.vue'),
  meta: {
    requiresAuth: true,
    title: '销售订单详情'
  }
};

const orderDetailRoute = {
  path: '/orders/:id',
  name: 'OrderDetail',
  component: () => import('@/views/product/OrderDetail.vue'),
  meta: {
    requiresAuth: true,
    title: '订单详情'
  }
};

const checkoutRoute = {
  path: '/checkout',
  name: 'Checkout',
  component: () => import('@/views/product/Checkout.vue'),
  meta: {
    requiresAuth: true,
    title: '结算'
  }
};

// 将农产品相关路由添加到路由配置中
routes.push(productListRoute);
routes.push(productCreateRoute);
routes.push(productEditRoute);
routes.push(productDetailRoute);
routes.push(myProductsRoute);
routes.push(cartRoute);
routes.push(orderListRoute);
routes.push(orderDetailRoute);
routes.push(checkoutRoute);
routes.push(sellerOrderListRoute);
routes.push(sellerOrderDetailRoute);

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
