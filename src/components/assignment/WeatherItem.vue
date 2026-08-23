<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  _id: { type: Number, required: true },
  city: {
    type: String,
    required: true,
  },
  temp: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  msg: {
    type: String,
    default: '',
  },
  humidity: {
    type: Number,
    default: 0,
  },
  wind: {
    type: Number,
    default: 0,
  },
  winddir: {
    type: String,
    default: 'No Wind',
  },
  sunrise: { type: String, default: '' },
  sunset: { type: String, default: '' },
})

const bins = {
  0: { msg: '추워요!! : 0도 이하', color: '#e0f7fa' },
  20: { msg: '쌀쌀해요. : 20도 이하', color: '#bbdefb' },
  27: { msg: '딱 좋아요 : 27도 이하', color: '#c8e6c9' },
  40: { msg: '더워요!! : 40도 이하', color: '#ffe0b2' },
  100: { msg: '지구 온난화는 힘들어요. ;(', color: '#ffcdd2' },
}

const currentBin = computed(() => {
  const thresholds = Object.keys(bins)
    .map(Number)
    .sort((a, b) => a - b)
  const matched = thresholds.find((limit) => props.temp <= limit)
  return matched !== undefined ? bins[matched] : bins[100]
})

const bcolor = ref('#0fffff')
const timeStatus = ref('unknown') // 'day' | 'night' | 'sunrise' | 'sunset' | 'unknown'
const currentUtc = ref(null)

const COLORS = {
  day: '#c8e6c9', // light green
  night: '#263238', // dark blue-gray
  sunrise: '#ffe0b2', // warm
  sunset: '#ffccbc',
  unknown: '#e0e0e0',
}

const timelinePercent = computed(() => {
  const sr = parseISOToDate(props.sunrise)
  const ss = parseISOToDate(props.sunset)
  const now = currentUtc.value
  if (!sr || !ss || !now) return null
  const start = sr.getTime()
  const end = ss.getTime()
  const total = end - start
  if (total <= 0) return null
  const pos = (now.getTime() - start) / total
  // position as percent between 0 and 100, clamp
  const pct = Math.max(0, Math.min(1, pos)) * 100
  return pct
})

function formatTimeUTC(iso) {
  const d = parseISOToDate(iso)
  if (!d) return '-'
  // return HH:MM (UTC)
  const hh = String(d.getUTCHours()).padStart(2, '0')
  const mm = String(d.getUTCMinutes()).padStart(2, '0')
  return `${hh}:${mm} UTC`
}
// 부모로 보낼 emit을 정의합니다.
const emit = defineEmits(['selected-city'])

// 이제 라우터도 여기에 붙입니다.
const router = useRouter()
const emitHandler = () => {
  emit('selected-city', { city: props.city, msg: props.msg ?? '' })
  //router.push({path:`/weather/${props._id}`, state:{weatherData:{...props}}})
  router.push(`weather/${props._id}`)
}

const showDetail = () => {
  window.alert(
    `${props.city} 의 현재 날씨는 ${props.status} 상태입니다.\nUTC 기준: ${props.sunrise}, ${props.sunset}\n현재 상태: ${timeStatus.value}`,
  )
}

function parseISOToDate(iso) {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d.getTime())) return null
  return d
}

function determineTimeStatus(currentDate) {
  // currentDate is a Date in UTC (JS Date object)
  const sr = parseISOToDate(props.sunrise)
  const ss = parseISOToDate(props.sunset)
  if (!sr || !ss || !currentDate) {
    return 'unknown'
  }

  // window of +/- 1 hour in milliseconds
  const H = 1000 * 60 * 60
  const srStart = new Date(sr.getTime() - H)
  const srEnd = new Date(sr.getTime() + H)
  const ssStart = new Date(ss.getTime() - H)
  const ssEnd = new Date(ss.getTime() + H)

  if (currentDate >= srStart && currentDate <= srEnd) return 'sunrise'
  if (currentDate >= ssStart && currentDate <= ssEnd) return 'sunset'

  // Day if between srEnd and ssStart
  if (currentDate > srEnd && currentDate < ssStart) return 'day'

  // Otherwise night
  return 'night'
}

async function fetchUtcNowAndUpdate() {
  try {
    const resp = await fetch('https://worldtimeapi.org/api/timezone/Etc/UTC')
    if (!resp.ok) throw new Error('time api error')
    const data = await resp.json()
    // normalize datetime
    let dt = null
    if (data.datetime) dt = data.datetime
    else if (data.utc_datetime) dt = data.utc_datetime
    else if (data.unixtime) dt = new Date(data.unixtime * 1000).toISOString()

    const current = parseISOToDate(dt)
    currentUtc.value = current
    const status = determineTimeStatus(current)
    timeStatus.value = status
    bcolor.value = COLORS[status] || COLORS.unknown
  } catch (e) {
    // fallback: use local Date (UTC)
    console.log(e)
    const now = new Date()
    currentUtc.value = now
    const status = determineTimeStatus(now)
    timeStatus.value = status
    bcolor.value = COLORS[status] || COLORS.unknown
  }
}

onMounted(() => {
  fetchUtcNowAndUpdate()
})

// update when sunrise/sunset props change
watch(
  () => [props.sunrise, props.sunset],
  () => {
    fetchUtcNowAndUpdate()
  },
)
</script>

<template>
  <div
    class="weatherBox"
    style="width: 100%"
    :style="{ backgroundColor: bcolor, color: timeStatus==='night' ? '#fff' : '#000' }"
    @click.stop="emitHandler"
  >
    <p class="text1">{{ city }} 날씨는: ({{ status }})</p>
    <p class="text2">현재 기온: {{ $tempFormat(temp) }}</p>
    <div class="text3" style="width: 75%" :style="{ backgroundColor: currentBin.color }">
      {{ currentBin.msg }}

      <div v-if="timelinePercent !== null" class="timeline" style="margin-top:8px">
        <div class="timeline-track">
          <div class="timeline-interval">
            <div class="timeline-marker" :style="{ left: timelinePercent + '%' }"></div>
          </div>
        </div>
        <div class="timeline-labels">
          <span>{{ formatTimeUTC(props.sunrise) }}</span>
          <span>{{ formatTimeUTC(props.sunset) }}</span>
        </div>
        <div style="font-size:.8rem; margin-top:.25rem">상태: {{ timeStatus }}</div>
      </div>
    </div>
    <button class="wbtn" @click.stop="showDetail">상세보기!</button>
  </div>
</template>

<style scoped>
.weatherBox {
  padding: 20px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
  font-weight: bold;

  /* grid-layout */

  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px 32px;
  grid-template-rows: repeat(3, auto);

  grid-template-areas:
    'text1 btn'
    'text2 btn'
    'text3 btn';
  align-items: center;
  padding: 16px;
}

.timeline {
  width: 100%;
}
.timeline-track {
  width: 100%;
  height: 10px;
  background: rgba(0,0,0,0.08);
  border-radius: 6px;
  position: relative;
}
.timeline-interval {
  position: relative;
  width: 100%;
  height: 100%;
}
.timeline-marker {
  position: absolute;
  top: -4px;
  width: 8px;
  height: 18px;
  background: #1976d2;
  border-radius: 3px;
  transform: translateX(-50%);
}
.timeline-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: inherit;
  margin-top: 6px;
}
.text1 {
  grid-area: text1;
}
.text2 {
  grid-area: text2;
}
.text3 {
  grid-area: text3;
}
.wtbn {
  grid-area: btn;
  height: 50%;
  padding: auto;
  cursor: pointer;
}
</style>
