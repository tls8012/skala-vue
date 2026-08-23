<script setup>
import AboutComposition from '@/components/assignment/AboutComposition.vue';
</script>


<template>
  <main class="about">
    <AboutComposition></AboutComposition>
  </main>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
