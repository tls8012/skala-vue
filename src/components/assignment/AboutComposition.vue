<script setup>
import BaseDashboard from './BaseDashboard.vue';
import RetunToMain from './RetunToMain.vue';
</script>

<template>
  <BaseDashboard>
    <template v-slot:title>
      <div class="about-header">
        <img src="@/assets/logo.svg" alt="logo" class="about-logo" />
        <div>
          <h2>Weather <span class="brand-dot">•</span> SKALA</h2>
          <p class="subtitle">Vue 기반 가상 기상 관측 대시보드</p>
        </div>
      </div>
    </template>

    <template v-slot:content>
      <section class="about-card">
        <p class="lead">이 앱은 Vue와 Vue Router 학습을 위한 실습용 대시보드입니다. 가벼운 컴포넌트 구조와 외부 API 연동 예제가 포함되어 있으며, pretty-mode 맵 오버레이 예제가 제공됩니다.</p>

        <ul class="features">
          <li><strong>핵심 기술:</strong> Vue 3, Pinia, Vue Router</li>
          <li><strong>데이터 연동:</strong> 외부 기상 API, Sunrise/Sunset API, Deck of Cards API</li>
          <li><strong>UI:</strong> 반응형 레이아웃, 토글형 pretty-mode, 카드형 컴포넌트</li>
        </ul>

        <div class="cta-row">
          <a href="/README.md" class="btn-outline" target="_blank" rel="noopener">Readme 보기</a>
          <a href="https://deckofcardsapi.com" class="btn" target="_blank" rel="noopener">Deck of Cards API</a>
        </div>
      </section>
    </template>

    <template v-slot:caption>
      <RetunToMain />
    </template>
  </BaseDashboard>
</template>

<style scoped>
.about-header { display:flex; align-items:center; gap:12px; justify-content:center }
.about-logo { width:48px; height:48px; border-radius:8px; box-shadow:0 4px 14px rgba(2,6,23,0.08) }
.about-header h2 { margin:0; font-size:18px; letter-spacing:0.4px }
.subtitle { margin:0; color:#6b7280; font-size:13px }

.about-card { max-width:820px; margin:18px auto; background:linear-gradient(180deg,#fff,#fbfdff); border-radius:12px; padding:18px; box-shadow:0 6px 20px rgba(15,23,42,0.06); border:1px solid #eef2ff }
.lead { margin:0 0 12px 0; color:#0f172a; line-height:1.6 }
.features { list-style:none; padding:0; margin:0 0 14px 0; display:grid; gap:8px }
.features li { background:#f8fafc; padding:10px 12px; border-radius:8px; color:#0f172a; border:1px solid #eef2ff }

.cta-row { display:flex; gap:10px; justify-content:flex-end }
.btn { background:linear-gradient(90deg,#2563eb,#1e40af); color:#fff; padding:8px 12px; border-radius:10px; text-decoration:none; font-weight:700 }
.btn-outline { background:transparent; color:#2563eb; padding:8px 12px; border-radius:10px; border:1px solid #dbeafe; text-decoration:none; font-weight:700 }

@media (max-width:720px) {
  .about-card { padding:14px; margin:12px }
  .cta-row { justify-content:center; flex-direction:column; gap:8px }
}
</style>
