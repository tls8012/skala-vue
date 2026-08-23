<script>
/*
const static_mockData = [
  { _id: 0, city: '서울', temp: 28, status: '맑음', humidity: 55, wind: 2.5, winddir: 'East'},
  { _id: 1, city: '수원', temp: 19, status: '비', msg: '집에가고싶다.' , humidity: 65, wind:5, winddir: 'West'},
  { _id: 2, city: '부산', temp: 26, status: '구름' , humidity: 9, winddir: 'NorthEast'},
  { _id: 3, city: '광주', temp: -1, status: '눈' , humidity: 0, wind: 2, winddir: 'South'},
  { _id: 4, city: '인천', temp: 75, status: '죽음' , humidity: 77, wind: -2.5},
  { _id: 5, city: '수성군', temp: 10101, status: '북한이네요'},
  { _id: 6, city: '원산', temp: 10101, status: '여기도 북한이네요'},
]*/
</script>

<script setup>
import { computed, onMounted, ref, nextTick, watchEffect, watch, provide } from 'vue'
import WeatherItem from './WeatherItem.vue'
import WeatherFooter from './WeatherFooter.vue'
import BaseDashboard from './BaseDashboard.vue'
import SearchBar from './SearchBar.vue'
//import { useMockWeatherInfoStore } from '@/stores/MockWeatherInfo.js'
import { useFooterCityStore } from '@/stores/footerCity.js'
import { useRealWeatherInfoStore } from '@/stores/RealWeatherInfo.js'
import { storeToRefs } from 'pinia'
import { useUiModeStore } from '@/stores/uiMode.js'
import cityList from '@/assets/cities.json'
import worldMap from '@/assets/world_map.svg'

const searchText = ref('')
const uiMode = useUiModeStore()
const compositionVisible = ref(true) // for flappable wing

// Preserve previous composition visibility so toggling pretty restores it when leaving pretty mode
const _prevCompositionVisible = ref(true)
watch(() => uiMode.pretty, (val) => {
  if (val) {
    // entering pretty mode: save previous and hide composition
    _prevCompositionVisible.value = compositionVisible.value
    compositionVisible.value = false
  } else {
    // leaving pretty mode: restore previous visibility (default true)
    compositionVisible.value = _prevCompositionVisible.value ?? true
  }
})

function toggleComposition() {
  compositionVisible.value = !compositionVisible.value
}

//const data = ref([])
//const weatherStore = useMockWeatherInfoStore()
const weatherStore = useRealWeatherInfoStore()
const { weatherData, isInit } = storeToRefs(weatherStore)

const filteredCities = computed(() => {
  if (!weatherData.value) return []
  if (!searchText.value.trim()) return weatherData.value
  return weatherData.value.filter((item) => item.city.includes(searchText.value))
})
const firstItemRef = ref(null)
const singleItemHeight = ref(0)
const gap = 8 // 카드 사이의 margin/gap 간격 (px)

// 첫 번째 아이템의 실제 DOM 높이 측정
const updateHeight = async () => {
  await nextTick()
  const el = Array.isArray(firstItemRef.value) ? firstItemRef.value[0] : firstItemRef.value

  if (el && el.offsetHeight) {
    singleItemHeight.value = el.offsetHeight
  }
}

onMounted(async () => {
  await updateHeight()
})
//onUpdated(updateHeight) // 데이터가 바뀌어 리렌더링될 때 높이 재측정
watch(
  filteredCities,
  async () => {
    await updateHeight()
  },
  { deep: true },
)

// 아이템 3개 높이 + 간격(gap 2개분) 자동 계산
const maxContainerHeight = computed(() => {
  if (singleItemHeight.value === 0) return '16px' // 측정 전엔 기본값

  const totalHeight = singleItemHeight.value * 3 + gap * 4
  return `${totalHeight}px`
})

watchEffect(() => {
  console.log(`사용자가 입력한 검색어는 ${searchText.value}`)
})

// emit handler
// pinia를 추가했기 때문에 리팩토링합니다.
const cityStore = useFooterCityStore()
//const selectedCityData = ref({ city: '', msg: '' })
const handleCardEmit = (cityObj) => {
  //selectedCityData.value = cityObj
  cityStore.setCity(cityObj.city)
  cityStore.setMsg(cityObj.msg)
}
const handleFooterEmit = () => {
  //selectedCityData.value = { city: '', msg: '' }
  cityStore.setCity('')
  cityStore.setMsg('')
}

// mini popup state for pretty mode
const mini = ref({ visible: false, data: null, style: {} })
function showMini(idx, ev) {
  const data = weatherData.value[idx]
  if (!data) return
  mini.value.visible = true
  mini.value.data = data
  // position popup near mouse, but keep inside map
  const rect = ev.currentTarget.getBoundingClientRect()
  mini.value.style = { left: rect.left + window.scrollX + 20 + 'px', top: rect.top + window.scrollY + 'px' }
}
function hideMini() {
  mini.value.visible = false
}

function cityStyle(id) {
  // find city coordinates from cityList (has lat, lon). Convert to percent position on mercator-ish simple projection
  const info = cityList[id]
  if (!info) return { left: '50%', top: '50%' }
  const lat = info.lat
  const lon = info.lon
  // equirectangular projection: x = (lon + 180) / 360 * 100, y = (90 - lat) / 180 * 100
  const x = ((lon + 180) / 360) * 100
  const y = ((90 - lat) / 180) * 100
  return { left: x + '%', top: y + '%' }
}

// provide
provide('is_north_korea', ['수성군', '원산'])
</script>
 
<template>
  <main class="weatherContainer">
    <!-- Pretty mode overlay -->
    <div v-if="uiMode && uiMode.pretty" class="pretty-overlay">
      <div class="map-canvas" @click.stop>
        <!-- Simple flat world map background -->
        <div class="map-bg" :style="{ backgroundImage: `url(${worldMap})` }"></div>
        <!-- Plot city dots -->
        <div v-for="(cityInfo, idx) in weatherData" :key="cityInfo._id" class="city-dot"
          :style="cityStyle(cityInfo._id)"
          @mouseenter="showMini(idx, $event)" @mouseleave="hideMini">
          <div class="dot"></div>
        </div>
        <div v-if="mini.visible" class="mini-popup" :style="mini.style">
          <WeatherItem v-bind="mini.data" />
        </div>

        <!-- wing to toggle composition visibility (on top of map) -->
        <div class="wing" @click.stop="toggleComposition">
          {{ compositionVisible ? '◀' : '▶' }}
        </div>

        <!-- overlay panel rendered on top of the map when compositionVisible -->
        <div v-if="compositionVisible" class="overlay-panel">
          <BaseDashboard class="searchBox">
            <template v-slot:title><h2>도시 검색 박스</h2></template>
            <template v-slot:content
              ><SearchBar :search="searchText" @update:search="(val) => (searchText = val)"></SearchBar
            ></template>
            <template v-slot:caption><p>도시 검색에 따라 실시간으로 찾아집니다.</p></template>
          </BaseDashboard>

          <BaseDashboard v-if="!isInit">
            <template v-slot:title><h2>도시 정보 박스</h2></template>
            <template v-slot:content><p>DATA LOADING...</p></template>
            <template v-slot:caption><p></p></template>
          </BaseDashboard>

          <BaseDashboard v-else class="weatherBox overlay-weatherBox">
            <template v-slot:title><h2>도시 정보 박스</h2></template>
            <template v-slot:content>
              <div class="scrollbox" :style="{ maxHeight: maxContainerHeight }">
                <template v-if="filteredCities.length > 0">
                  <!-- 자식 요소들을 각각 컨테이너로 지정 -->
                  <div
                    class="item-wrapper"
                    v-for="(item, index) in filteredCities"
                    :key="item._id"
                    :ref="
                      (el) => {
                        if (index === 0) firstItemRef = el
                      }
                    "
                  >
                    <WeatherItem :="item" @selected-city="handleCardEmit"></WeatherItem>
                  </div>
                </template>
                <!-- 2. 검색 결과가 0개일 때 (결과 없음) -->
                <div v-else class="no-result">
                  🔍 '<strong>{{ searchText }}</strong
                  >'에 대한 검색 결과가 없습니다.
                </div>
              </div>
            </template>
          </BaseDashboard>
          <BaseDashboard class="footerBox overlay-footerBox">
            <template v-slot:title><p></p></template>
            <template v-slot:content>
              <WeatherFooter @reset-footer="handleFooterEmit" />
            </template>
            <template v-slot:caption><p></p></template>
          </BaseDashboard>
        </div>
      </div>
    </div>

    <!-- Existing composition area: shown only when not in pretty mode -->
    <div v-if="!uiMode || !uiMode.pretty">
    <BaseDashboard class="searchBox">
      <template v-slot:title><h2>도시 검색 박스</h2></template>
      <template v-slot:content
        ><SearchBar :search="searchText" @update:search="(val) => (searchText = val)"></SearchBar
      ></template>
      <template v-slot:caption><p>도시 검색에 따라 실시간으로 찾아집니다.</p></template>
    </BaseDashboard>

    <BaseDashboard v-if="!isInit">
      <template v-slot:title><h2>도시 정보 박스</h2></template>
      <template v-slot:content><p>DATA LOADING...</p></template>
      <template v-slot:caption><p></p></template>
    </BaseDashboard>
    <!--<div class="weatherBox">-->
    <BaseDashboard v-else class="weatherBox">
      <template v-slot:title><h2>도시 정보 박스</h2></template>
      <template v-slot:content>
        <div class="scrollbox" :style="{ maxHeight: maxContainerHeight }">
          <template v-if="filteredCities.length > 0">
            <!-- 자식 요소들을 각각 컨테이너로 지정 -->
            <div
              class="item-wrapper"
              v-for="(item, index) in filteredCities"
              :key="item._id"
              :ref="
                (el) => {
                  if (index === 0) firstItemRef = el
                }
              "
            >
              <!--<WeatherItem :_id="item.id" :city="item.name" :temp="item.temp" :status="item.status" />-->
              <WeatherItem :="item" @selected-city="handleCardEmit"></WeatherItem>
            </div>
          </template>
          <!-- 2. 검색 결과가 0개일 때 (결과 없음) -->
          <div v-else class="no-result">
            🔍 '<strong>{{ searchText }}</strong
            >'에 대한 검색 결과가 없습니다.
          </div>
        </div>
      </template>
    </BaseDashboard>
    <BaseDashboard class="footerBox">
      <template v-slot:title><p></p></template>
      <template v-slot:content>
        <!--<WeatherFooter v-bind="selectedCityData" @reset-footer="handleFooterEmit"></WeatherFooter>-->
        <WeatherFooter @reset-footer="handleFooterEmit" />
      </template>
      <template v-slot:caption><p></p></template>
    </BaseDashboard>
  </div>
  </main>
</template>

<style scoped>
.weatherContainer {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.pretty-overlay {
  position: relative;
  width: 100%;
  height: 480px; /* 좀 더 가로로 여유가 생기도록 높이 증가 */
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
  display: flex;
  align-items: stretch;
  justify-content: center;
}
.map-canvas { position: relative; width:100%; height:100%; }
.map-bg {
  position:absolute; inset:0;
  background-image: url('https://upload.wikimedia.org/wikipedia/commons/8/83/Earthmap1000x500.jpg');
  /* 배경을 가로 방향으로 늘려 시각적으로 더 넓게 보이게 함 */
  background-size: 140% auto; 
  background-position: center center;
  filter: grayscale(40%) brightness(0.9);
}
.city-dot { position:absolute; transform: translate(-50%, -50%); }
.city-dot .dot { width:12px; height:12px; background:#1976d2; border-radius:50%; box-shadow:0 0 8px rgba(25,118,210,0.8); }
.mini-popup { position:absolute; z-index:40; width:260px; background:rgba(255,255,255,0.95); box-shadow:0 6px 18px rgba(0,0,0,0.15); border-radius:8px; padding:8px; }
.wing { position:absolute; right:320px; top: 50%; transform:translateY(-50%); background:#fff; border-radius:4px 0 0 4px; padding:8px; cursor:pointer; box-shadow: -2px 2px 6px rgba(0,0,0,0.1); z-index:45 }
/* overlay panel inside pretty map */
.overlay-container { position: relative }
.overlay-panel { position:absolute; right: 12px; top: 12px; width:300px; max-height: calc(100% - 24px); overflow:auto; z-index:50 }
.overlay-weatherBox .scrollbox { max-height: calc(100vh - 300px); }
.overlay-footerBox { margin-top:8px }


.scrollbox {
  overflow-y: auto;
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 8px;
}
.scrollbox {
  overflow-y: auto;
  padding: 8px;
  border: 1px solid #eee;
  border-radius: 8px;
}
.item-wrapper {
  container-type: normal;
  margin-bottom: 8px; /* 카드 간격 */
}
</style>
