import type { App } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import type {RouteRecordRaw} from 'vue-router'
import ImageCompress from '@/views/ImageCompress/index.vue'

const routes: RouteRecordRaw[] = [{
  path: '/',
  name: 'ImageCompress',
  component: ImageCompress
}]

const router = createRouter({
  history: createMemoryHistory(),
  routes
})

export function setupRouter(app: App) {
  app.use(router)
}

export default router
