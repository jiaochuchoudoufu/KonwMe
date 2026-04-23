import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomePage.vue'),
  },
  {
    path: '/ledger',
    name: 'ledger',
    component: () => import('../views/LedgerPage.vue'),
  },
  {
    path: '/journal',
    name: 'journal',
    component: () => import('../views/JournalPage.vue')
  },
  {
    path: '/memo',
    name: 'memo',
    component: () => import('../views/MemoPage.vue')
  },
  {
    path: '/data-manager',
    name: 'data-manager',
    component: () => import('../components/DataManager.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router