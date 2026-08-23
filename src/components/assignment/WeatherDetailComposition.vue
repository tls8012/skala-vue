<script setup>
import { onMounted, ref, computed } from 'vue'
import BaseDashboard from './BaseDashboard.vue'
import RetunToMain from './RetunToMain.vue'
//import { useMockWeatherInfoStore } from '@/stores/MockWeatherInfo.js'
import { useRoute } from 'vue-router'
import { useRealWeatherInfoStore } from '@/stores/RealWeatherInfo.js'
const weatherData = ref(null)

//const weatherStore = useMockWeatherInfoStore()
const weatherStore = useRealWeatherInfoStore()

const route = useRoute()

onMounted(() => {
  // history.state로 전달된 데이터 수신
  //weatherData.value = history.state.weatherData
  weatherData.value = weatherStore.weatherData[route.params.cityId]
})

const tempBig = computed(() => {
  return weatherData.value ? (Math.round(weatherData.value.temp)) : '--'
})

function fmtTime(iso) {
  try {
    if (!iso) return '--'
    const d = new Date(iso)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch (e) {
    console.log(e)
    return '--'
  }
}

const sunrise = computed(() => fmtTime(weatherData.value?.sunrise))
const sunset = computed(() => fmtTime(weatherData.value?.sunset))
</script>

<template>
  <BaseDashboard>
    <template v-slot:title>
      <div class="detail-head">
        <div>
          <h2 class="city-name">{{ weatherData?.city || '로딩 중...' }}</h2>
          <div class="meta">{{ weatherData?.country || '' }} • {{ weatherData?.status || '' }}</div>
        </div>
      </div>
    </template>

    <template v-slot:content>
      <section class="detail-card">
        <div class="main-col">
          <div class="temp-big">{{ tempBig }}°</div>
          <div class="sub">체감: {{ $tempFormat(weatherData?.feels_like) }}</div>
        </div>

        <div class="info-col">
          <div class="row"><span>습도</span><strong>{{ weatherData?.humidity ?? '--' }}%</strong></div>
          <div class="row"><span>풍속</span><strong>{{ weatherData?.wind ?? '--' }} m/s</strong></div>
          <div class="row"><span>풍향</span><strong>{{ weatherData?.winddir ?? '--' }}</strong></div>
          <div class="row"><span>일출</span><strong>{{ sunrise }}</strong></div>
          <div class="row"><span>일몰</span><strong>{{ sunset }}</strong></div>
        </div>
      </section>
    </template>

    <template v-slot:caption>
      <RetunToMain />
    </template>
  </BaseDashboard>
</template>

<style scoped>
.detail-head { display:flex; align-items:center; gap:12px; justify-content:center }
.city-name { margin:0; font-size:20px; font-weight:800 }
.meta { color:#6b7280; font-size:13px }

.detail-card { display:flex; gap:20px; align-items:center; max-width:880px; margin:18px auto; background:linear-gradient(180deg,#ffffff,#fbfdff); border-radius:12px; padding:18px; box-shadow:0 8px 24px rgba(2,6,23,0.06); border:1px solid #eef2ff }
.main-col { flex:0 0 160px; display:flex; flex-direction:column; align-items:center; justify-content:center }
.temp-big { font-size:48px; font-weight:900; color:#0f172a }
.sub { color:#6b7280; font-size:13px; margin-top:6px }
.info-col { flex:1; display:grid; grid-template-columns:repeat(2,1fr); gap:10px }
.row { display:flex; justify-content:space-between; align-items:center; padding:10px; background:#f8fafc; border-radius:8px; border:1px solid #eef2ff }
.row span { color:#475569 }
.row strong { font-weight:700; color:#0f172a }

@media (max-width:720px) {
  .detail-card { flex-direction:column; padding:14px }
  .main-col { flex-basis:auto }
  .info-col { grid-template-columns:1fr }
}
</style>