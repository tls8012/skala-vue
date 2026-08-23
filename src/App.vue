<script setup>
import { RouterLink, useRouter } from 'vue-router'
//import SampleOne from './components/practices/basic/SampleOne.vue'
//import SampleTwo from './components/practices/basic/SampleTwo.vue'
//import SampleThree from './components/practices/basic/SampleThree.vue'

import { useConfigStore } from './stores/config.js'
import { useCounterStore } from './stores/counter.js'
import { useUiModeStore } from './stores/uiMode.js'

import { ref } from 'vue'
const configStore = useConfigStore()

const counterStore = useCounterStore()
const uiMode = useUiModeStore()
const router = useRouter()

const controlsOpen = ref(false)
function toggleControls() {
  controlsOpen.value = !controlsOpen.value
}

function handleLogoClick() {
  // 증가시키고, 5 이상이면 값 고정 후 이스터에그로 이동
  counterStore.increment()
  console.log(counterStore.count)
  // counterStore.count는 setup()에서 ref로 정의되어 있으므로 .value를 사용
  if (counterStore.count >= 5) {
    counterStore.count = 0
    router.push('/easteregg')
  }
}

function togglePretty() {
  uiMode.toggle()
  controlsOpen.value = false
}
</script>

<template>
  <header class="app-header">
    <div class="app-inner">
      <div class="left-col">
        <div class="brand-block" @click="handleLogoClick" role="button" tabindex="0">
          <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="44" height="44" />
          <div>
            <div class="brand">Weather <span class="brand-dot">•</span> SKALA</div>
            <div class="brand-sub">가볍고 빠른 기상 대시보드</div>
          </div>
        </div>

        <div class="welcome-controls" @click.stop>
          <div class="controls-grid">
            <div class="control-item">
              <div class="control-icon unit-chip">{{ configStore.unit }}</div>
              <div class="control-label">단위</div>
            </div>

            <div class="control-item">
              <button class="control-icon btn-small" @click="configStore.toggleUnit">{{ configStore.nextUnit }}</button>
              <div class="control-label">변환</div>
            </div>

            <div class="control-item">
              <button class="control-icon pretty-small" @click="togglePretty" :aria-pressed="uiMode.pretty" :class="{ active: uiMode.pretty }">
                <span class="pretty-dot" :class="{ on: uiMode.pretty }"></span>
              </button>
              <div class="control-label">Pretty</div>
            </div>

            <div class="control-item">
              <button class="control-icon menu-small" @click="toggleControls">⋯</button>
              <div class="control-label">메뉴</div>
            </div>
          </div>
        </div>
      </div>

      <nav class="center" aria-label="Main Navigation">
        <RouterLink to="/" class="nav-link">날씨 대시보드</RouterLink>
        <RouterLink to="/about" class="nav-link">서비스 소개</RouterLink>
      </nav>

      <div class="right-col">
        <div class="avatar" title="User profile">SB</div>
      </div>

      <div class="floating-menu" v-if="controlsOpen">
        <button class="menu-item" @click="configStore.toggleUnit">단위: {{ configStore.nextUnit }}</button>
        <button class="menu-item" @click="togglePretty">{{ uiMode.pretty ? 'Exit Pretty' : 'Enter Pretty' }}</button>
      </div>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}

/* New header styles (refined grid + controls) */
.app-header { padding:14px 20px }
.app-inner { max-width:1100px; margin:0 auto; display:grid; grid-template-columns: 260px 1fr 120px; grid-template-rows: auto auto; gap:8px 20px; align-items:center; position:relative }
.left-col { grid-column:1; grid-row:1 / 3; display:flex; flex-direction:column; gap:10px }
.brand-block { display:flex; align-items:center; gap:12px; cursor:pointer }
.logo { width:48px; height:48px; border-radius:10px; box-shadow:0 8px 24px rgba(15,23,42,0.06) }
.brand { font-weight:800; font-size:18px; color:#0f172a }
.brand-sub { font-size:13px; color:#6b7280 }
.welcome-controls { display:block }
.controls-grid { display:grid; grid-template-columns: repeat(4, 1fr); gap:8px }
.control-item { display:flex; flex-direction:column; align-items:center; gap:6px }
.control-icon { width:44px; height:44px; display:inline-flex; align-items:center; justify-content:center; border-radius:10px; background:#f8fafc; border:1px solid #eef2ff; color:#0f172a; font-weight:700 }
.btn-small { background:linear-gradient(90deg,#eef2ff,#eefaff); border:0 }
.pretty-small { background:linear-gradient(90deg,#2563eb,#1e40af); color:#fff; border:0; transition: box-shadow 180ms ease, transform 120ms ease }
.pretty-small.active { box-shadow: 0 8px 20px rgba(37,99,235,0.22); transform: translateY(-2px) }
.menu-small { background:transparent; border:1px dashed #e6eef8 }
.control-label { font-size:11px; color:#64748b }
.center { grid-column:2; grid-row:1 / 3; display:flex; justify-content:center }
.nav-link { color:#334155; text-decoration:none; padding:10px 14px; border-radius:12px; font-weight:700; transition: all 160ms ease }
.nav-link.router-link-active, .nav-link:hover { background: linear-gradient(90deg, #eef2ff, #f8fbff); color:#0f172a; transform: translateY(-2px) }
.right-col { grid-column:3; grid-row:1 / 3; display:flex; align-items:center; justify-content:flex-end }
.avatar { width:40px; height:40px; border-radius:999px; display:inline-flex; align-items:center; justify-content:center; background:linear-gradient(180deg,#ffffff,#f1f5f9); color:#0f172a; font-weight:700; border:1px solid #e6eef8 }
.floating-menu { position:absolute; left:18px; top:calc(100% + 10px); background:#fff; border-radius:10px; padding:10px; box-shadow:0 10px 30px rgba(2,6,23,0.08); border:1px solid #eef2ff; z-index:60 }
.menu-item { background:transparent; border:0; padding:8px 10px; text-align:left; cursor:pointer; border-radius:6px }
.menu-item:hover { background:#f1f5ff }

@media (max-width: 900px) {
  .app-inner { grid-template-columns: 1fr; grid-template-rows: auto auto auto; padding:6px }
  .left-col { grid-row:1 }
  .center { grid-row:2; justify-content:flex-start }
  .right-col { grid-row:3; justify-content:flex-end }
  .controls-grid { grid-template-columns: repeat(4, auto); gap:6px }
}

@media (max-width: 520px) {
  .controls-grid { grid-template-columns: repeat(2, 1fr) }
  .brand { font-size:16px }
  .logo { width:40px; height:40px }
}


/* new: welcome-controls layout */
.brand-block { display:flex; align-items:center; gap:10px }
.welcome-controls { margin-top:8px; display:flex; justify-content:flex-start }
@media (min-width: 720px) {
  .welcome-controls .control-group { gap:12px }
}

@media (max-width: 860px) {
  .nav-link { padding:6px 8px; font-size:13px }
}

@media (max-width: 640px) {
  .center { display:none }
  .brand { display:none }
  .pretty-btn { width:40px }
  .control-group .unit { display:none }
  .welcome-controls { justify-content:flex-end }
}

</style>
