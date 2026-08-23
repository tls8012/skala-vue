<script setup>
import { ref } from 'vue'
let normalCount = 0
const vueCount = ref(0)
</script>

<template>
  <div class="practice-section">
    <h3>Normal Count: {{ normalCount }}</h3>
    <button @click="normalCount++">nnn</button>
    <h3>Vue Count: {{ vueCount }}</h3>
    <button @click="vueCount++">vvv</button>
  </div>
</template>
