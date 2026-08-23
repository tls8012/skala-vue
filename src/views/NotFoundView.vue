<script setup>
import BaseDashboard from '@/components/assignment/BaseDashboard.vue'
import RetunToMain from '@/components/assignment/RetunToMain.vue';
</script>

<template>
  <main>
    <BaseDashboard>
      <template v-slot:title>
        <h2 style="text-align: center">요청하신 페이지를 찾을 수 없습니다.</h2>
      </template>
      <template v-slot:content>
        <p style="text-align: center">요청하신 주소가 없거나 아직 개발하는 중입니다.</p>
      </template>
      <template v-slot:caption>
        <RetunToMain></RetunToMain>
      </template>
    </BaseDashboard>
  </main>
</template>
