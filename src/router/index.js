import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import { useFooterCityStore } from '@/stores/footerCity.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/weather/:cityId',
      name: 'WeatherDetail',
      component: () => import('../views/WeatherDetailView.vue'),
    },
    {
      path: '/easteregg',
      name: 'easteregg',
      component: () => import('../views/EasterEggView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NonFound',
      component: NotFoundView,
    },
  ],
})

// navigation guard: only allow access to /easteregg when footerCity.city === '부산'
router.beforeEach((to, from, next) => {
  if (to.name === 'easteregg') {
    const footerCity = useFooterCityStore()
    if (footerCity.city === '광주') {
      next()
    } else {
      // cancel navigation
      next(false)
    }
  } else {
    next()
  }
})

export default router
