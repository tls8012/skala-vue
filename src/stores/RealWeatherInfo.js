import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

// 도시별 위도경도 정보
// read assets/cities.json
import cityList from '@/assets/cities.json'

// 나중에 env로 던지거나 할 것
// 환경변수로 처리함
const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY
const WEATHER_INTERVAL = Number(import.meta.env.VITE_WEATHER_INTERVAL)
const URL = import.meta.env.VITE_WEATHER_API_URL

function getWindDirection(deg) {
  if (deg === undefined || deg === null) return '정보없음'

  // 8방위 기준 (각 방위당 45도 범위)
  const directions = ['북', '북동', '동', '남동', '남', '남서', '서', '북서']
  // 360도를 8등분(45도)하여 인덱스 계산 (22.5도 보정)
  const index = Math.round(deg / 45) % 8
  return directions[index]
}

function parseWeather(data, cityName, _id, sundata) {
  // 날씨 상태 (lang: 'kr' 사용 시 description에 '맑음', '튼구름' 등 한국어로 들어옴)
  const status = data.weather?.[0]?.description || '정보없음'

  // 온도 (units: 'metric' 사용 시 섭씨 온도로 들어옴)
  const temp = data.main?.temp !== undefined ? Math.round(data.main.temp) : 999

  // 습도
  const humidity = data.main?.humidity ?? -1

  // 풍량
  const wind = data.wind?.speed ?? -1

  // 풍향 (deg 기반 변환)
  const winddir = getWindDirection(data.wind?.deg)

  // 상황별 메시지 자동 생성 (체감온도 차이, 강수 여부 등)
  let msg = ''
  if (data.main?.feels_like) {
    const feelsLike = Math.round(data.main.feels_like)
    if (Math.abs(temp - feelsLike) >= 3) {
      msg = `체감 온도는 ${feelsLike}°C 입니다.`
    }
  }
  // 이스터에그
  if (cityName === '수원') {
    msg += '집에가고싶다.'
  }

  // sunrise, sunset parse
  const sunrise = sundata.results?.sunrise ?? ''
  const sunset = sundata.results?.sunset ?? ''

  return {
    _id: _id,
    city: cityName || data.name || '알 수 없음',
    temp,
    status,
    humidity,
    wind,
    winddir,
    sunrise,
    sunset,
    msg,
  }
}

async function fetchCityWeather(cityInfo, _id) {
  const { city, lat, lon } = cityInfo
  let to_return = {
    _id: _id,
    city: city,
    temp: 999,
    status: '',
    humidity: -1,
    wind: -1,
    winddir: '',
    sunrise: '',
    sunset: '',
    msg: '',
  }
  try {
    const data = await axios.get(URL, {
      params: { lat: lat, lon: lon, appid: WEATHER_API_KEY, units: 'metric', lang: 'kr' },
    })
    const sundata = await axios.get('https://api.sunrise-sunset.org/json', {
      params: { lat: lat, lng: lon, formatted: 0 },
    })
    //console.log(parseWeather(data.data, city, _id))
    to_return = parseWeather(data.data, city, _id, sundata.data)
  } catch (error) {
    console.error(`${city} ERROR!!: `, error.message)
    to_return['msg'] = error
  } finally {
    return to_return
  }
}

export const useRealWeatherInfoStore = defineStore('realInfo', () => {
  // mockdata와 양식을 맞추기 위해, list of dicts
  // 요구 꼴: 각 도시별 dict:
  // _id, city, temp(cel), status, humidity, wind, winddir, msg
  const weatherData = ref([])

  // 로딩 완료 플래그
  const isInit = ref(false)

  // 첫 로딩
  // 사실 lazy loading이 더 좋을 것 같긴 합니다만,
  // 요구사항 중 하나가 모든 도시를 표기하는 박스여서 이렇게 선택했습니다.
  async function _init() {
    if (weatherData.value.length === 0) {
      const BATCH_SIZE = 50
      const DELAY_MS = 1100
      const tempRes = []
      for (let i = 0; i < cityList.length; i += BATCH_SIZE) {
        const chunk = cityList.slice(i, i + BATCH_SIZE)
        const results = await Promise.all(
          chunk.map((cityInfo, idx) => fetchCityWeather(cityInfo, i + idx)),
        )
        tempRes.push(...results)
        if (i + BATCH_SIZE < cityList.length) {
          await new Promise((resolve) => setTimeout(resolve, DELAY_MS))
        }
      }

      tempRes.sort((a, b) => a._id - b._id)
      weatherData.value = tempRes
    }
    console.log(weatherData.value)
    isInit.value = true
    //startAutoRefresh()
  }

  // 매 n초마다 도시 하나의 날씨를 업데이트합니다.
  let timerId = null
  let currentIndex = 0

  function startAutoRefresh() {
    if (timerId) return
    timerId = setInterval(async () => {
      if (cityList.length === 0) return
      if (currentIndex >= cityList.length) {
        currentIndex = 0
      }
      const target = cityList[currentIndex]
      weatherData.value[currentIndex] = await fetchCityWeather(target, currentIndex)
      currentIndex += 1
    }, WEATHER_INTERVAL)
  }

  function stopAutoRefresh() {
    if (timerId) {
      clearInterval(timerId)
      timerId = null
    }
  }

  _init()

  return {
    weatherData,
    isInit,
    startAutoRefresh,
    stopAutoRefresh,
  }
})
