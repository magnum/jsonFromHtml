import { createRouter, createWebHistory } from 'vue-router'
import Build from './components/Build.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/build' },
    { path: '/build', name: 'build', component: Build },
  ],
})
