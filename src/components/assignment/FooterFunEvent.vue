<script setup>
import { computed, inject, ref, watch } from 'vue'

const northKoreanCities = inject('is_north_korea', ['평양'])

const city = defineModel()

const isNorthKoreanCity = computed(() => northKoreanCities.includes(city.value))
const isExploded = ref(false)

const explodeEvent = () => {
  isExploded.value = true
}

watch(city, () => {
  isExploded.value = false
})
</script>

<!--전달받은 정보를 활용하기 위헤 코파일럿에게 뭔가를 시켰습니다.
이제 inject된 'is_north_korea'에 props로 받은 city가 있다면 뭔가 합니다.
폭파 버튼을 누르면 뭔가 더 합니다.-->

<template>
  <div
    v-if="isNorthKoreanCity"
    class="funEventContainer"
    :class="{ exploded: isExploded }"
    aria-live="polite"
  >
    <template v-if="!isExploded">
      <span v-for="spark in 12" :key="spark" class="spark" :class="`spark-${spark}`">✦</span>
      <div class="eventBadge">★ 특별방송 ★</div>
      <div class="eventTitle">{{ city }} 축하 대폭발!</div>
      <div class="eventMessage">오늘의 날씨 운세는 대길입니다. 모두 함께 만세!</div>
      <button class="explodeButton" type="button" @click="explodeEvent">💥 대폭발 실행</button>
      <div class="eventFireworks" aria-hidden="true">
        <span>✹</span>
        <span>✷</span>
        <span>✹</span>
      </div>
    </template>
    <template v-else>
      <span v-for="debris in 10" :key="debris" class="debris" :class="`debris-${debris}`">✦</span>
      <div class="brokenMessage">💥 방송국이 와장창! 💥</div>
      <div class="resetHint">다른 도시를 선택하면 방송이 복구됩니다.</div>
    </template>
  </div>
</template>

<style scoped>
.funEventContainer {
  position: relative;
  overflow: hidden;
  padding: 18px 16px 16px;
  margin-top: 8px;
  border: 3px solid #ffd740;
  border-radius: 10px;
  background: linear-gradient(135deg, #9b111e 0%, #e3262e 48%, #8d1020 100%);
  box-shadow:
    0 0 0 3px #8d1020,
    0 0 22px rgba(255, 47, 47, 0.85);
  color: #fff8d6;
  font-weight: bold;
  text-align: center;
  animation:
    event-pop 500ms ease-out both,
    event-glow 1.8s ease-in-out infinite;
}

.funEventContainer.exploded {
  min-height: 92px;
  border-color: #ff7043;
  background: radial-gradient(circle, #ffca28 0%, #ef6c00 35%, #5d1010 100%);
  animation: event-explode 700ms cubic-bezier(0.2, 0.9, 0.3, 1.3) both;
}

.eventBadge {
  position: relative;
  z-index: 1;
  display: inline-block;
  padding: 4px 12px;
  border: 2px solid #fff8d6;
  border-radius: 999px;
  color: #fff8d6;
  font-size: 0.78rem;
  letter-spacing: 0.12em;
  background-color: #b3131b;
  animation: badge-flash 1.2s ease-in-out infinite;
}

.eventTitle {
  position: relative;
  z-index: 1;
  margin-top: 5px;
  color: #fff;
  font-size: 1.45rem;
  text-shadow:
    2px 2px 0 #7b0d18,
    0 0 12px #ffd740;
  animation: title-bounce 1.1s ease-in-out infinite;
}

.eventMessage {
  position: relative;
  z-index: 1;
  margin-top: 4px;
  color: #ffe9a3;
  font-size: 0.9rem;
}

.explodeButton {
  position: relative;
  z-index: 2;
  display: block;
  padding: 8px 16px;
  margin: 10px auto 0;
  border: 2px solid #fff8d6;
  border-radius: 6px;
  background-color: #ffd740;
  color: #7b0d18;
  cursor: pointer;
  font: inherit;
  font-size: 0.85rem;
  box-shadow: 0 3px 0 #a66d00;
  transition:
    transform 120ms ease,
    box-shadow 120ms ease;
}

.explodeButton:hover {
  transform: translateY(-2px) scale(1.04);
  box-shadow:
    0 5px 0 #a66d00,
    0 0 16px #fff8d6;
}

.explodeButton:active {
  transform: translateY(2px);
  box-shadow: 0 1px 0 #a66d00;
}

.brokenMessage,
.resetHint {
  position: relative;
  z-index: 1;
}

.brokenMessage {
  padding-top: 14px;
  color: #fff;
  font-size: 1.4rem;
  text-shadow: 0 0 12px #fff;
  animation: broken-shake 120ms linear 6;
}

.resetHint {
  margin-top: 6px;
  color: #fff3cd;
  font-size: 0.8rem;
}

.eventFireworks {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: space-between;
  padding: 8px 18px;
  color: #ffd740;
  font-size: 2.2rem;
  pointer-events: none;
}

.eventFireworks span {
  animation: firework-burst 900ms ease-in-out infinite;
}

.eventFireworks span:nth-child(2) {
  align-self: flex-end;
  animation-delay: 300ms;
}

.eventFireworks span:nth-child(3) {
  animation-delay: 600ms;
}

.spark {
  position: absolute;
  color: #fff8d6;
  font-size: 0.9rem;
  animation: spark-fly 1.4s ease-in-out infinite;
  pointer-events: none;
}

.spark-1 {
  top: 12%;
  left: 8%;
}
.spark-2 {
  top: 25%;
  left: 18%;
  animation-delay: 120ms;
}
.spark-3 {
  top: 10%;
  right: 12%;
  animation-delay: 240ms;
}
.spark-4 {
  top: 38%;
  right: 5%;
  animation-delay: 360ms;
}
.spark-5 {
  bottom: 16%;
  left: 6%;
  animation-delay: 480ms;
}
.spark-6 {
  bottom: 10%;
  right: 20%;
  animation-delay: 600ms;
}
.spark-7 {
  top: 55%;
  left: 12%;
  animation-delay: 720ms;
}
.spark-8 {
  top: 18%;
  right: 28%;
  animation-delay: 840ms;
}
.spark-9 {
  bottom: 24%;
  right: 8%;
  animation-delay: 960ms;
}
.spark-10 {
  bottom: 8%;
  left: 25%;
  animation-delay: 1080ms;
}
.spark-11 {
  top: 44%;
  right: 16%;
  animation-delay: 1200ms;
}
.spark-12 {
  top: 68%;
  left: 3%;
  animation-delay: 1320ms;
}

.debris {
  position: absolute;
  top: 50%;
  left: 50%;
  color: #fff8d6;
  font-size: 1.5rem;
  animation: debris-fly 800ms ease-out both;
}

.debris-1 {
  --x: -120px;
  --y: -42px;
  --r: -70deg;
}
.debris-2 {
  --x: -80px;
  --y: 35px;
  --r: 55deg;
  animation-delay: 40ms;
}
.debris-3 {
  --x: -30px;
  --y: -60px;
  --r: 120deg;
  animation-delay: 80ms;
}
.debris-4 {
  --x: 12px;
  --y: 52px;
  --r: -45deg;
  animation-delay: 120ms;
}
.debris-5 {
  --x: 58px;
  --y: -48px;
  --r: 80deg;
  animation-delay: 160ms;
}
.debris-6 {
  --x: 105px;
  --y: 28px;
  --r: 150deg;
  animation-delay: 200ms;
}
.debris-7 {
  --x: -150px;
  --y: 5px;
  --r: -120deg;
  animation-delay: 240ms;
}
.debris-8 {
  --x: 145px;
  --y: -8px;
  --r: 35deg;
  animation-delay: 280ms;
}
.debris-9 {
  --x: -55px;
  --y: -28px;
  --r: 180deg;
  animation-delay: 320ms;
}
.debris-10 {
  --x: 75px;
  --y: 44px;
  --r: -180deg;
  animation-delay: 360ms;
}

@keyframes event-pop {
  from {
    opacity: 0;
    transform: scale(0.7) rotate(-2deg);
  }
  to {
    opacity: 1;
    transform: scale(1) rotate(0);
  }
}

@keyframes event-glow {
  50% {
    box-shadow:
      0 0 0 3px #8d1020,
      0 0 36px rgba(255, 215, 64, 0.95);
  }
}

@keyframes badge-flash {
  50% {
    background-color: #ed2939;
    box-shadow: 0 0 12px #fff8d6;
  }
}

@keyframes title-bounce {
  50% {
    transform: translateY(-3px) scale(1.04);
  }
}

@keyframes firework-burst {
  50% {
    transform: scale(1.45) rotate(20deg);
    color: #fff;
    text-shadow: 0 0 16px #ffd740;
  }
}

@keyframes spark-fly {
  50% {
    opacity: 0.25;
    transform: scale(1.8) rotate(90deg);
    color: #ffd740;
  }
}

@keyframes event-explode {
  0% {
    transform: scale(1);
    filter: brightness(1);
  }
  35% {
    transform: scale(1.08) rotate(1deg);
    filter: brightness(2.2);
  }
  100% {
    transform: scale(0.96) rotate(-1deg);
    filter: brightness(1);
  }
}

@keyframes debris-fly {
  from {
    opacity: 1;
    transform: translate(-50%, -50%) scale(0.5) rotate(0);
  }
  to {
    opacity: 0;
    transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(1.4) rotate(var(--r));
  }
}

@keyframes broken-shake {
  50% {
    transform: translateX(4px) rotate(1deg);
  }
}
</style>
