import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// 전역으로 온도 토글 함수를 등록합니다.
import { useConfigStore } from './stores/config'

import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')

// in integer out string
app.config.globalProperties.$tempFormat = (celsiusTemp) => {
  // null check
  if (celsiusTemp === undefined || celsiusTemp === null) return ''
  const configStore = useConfigStore()

  const newtemp = configStore.unit === '°F' ? Math.round((celsiusTemp * 9) / 5 + 32) : celsiusTemp

  return `${newtemp} ${configStore.unit}`
}
