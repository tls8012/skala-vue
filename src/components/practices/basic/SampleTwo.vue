<script setup>
import { ref } from 'vue'

const isWarning = ref(false)
const themeClass = ref('bg-dark')
const src = './src/assets/logo.svg'
const id = 'thisIdForThisTestlol'

const score = ref(85)
</script>

<template>
  <div class="practice-section">
    <h2>DIRECTIVE?E>E>E</h2>
    <p :class="{ 'text-danger': isWarning }">YEET: {{ isWarning }}</p>
    <button @click="isWarning = !isWarning">YETETET</button>
    <br />
    <h3>MULTI CLASS!!</h3>
    <div :class="[themeClass, isWarning ? 'border-red' : 'border-gray']">BOXBOX</div>
    <div :id>
      <img :src alt="wtf?" style="width: 50px" />
    </div>

    <label>유잼점수</label>
    <input type="number" v-model="score" min="0" max="100" step="5" />
    <br />
    <div v-if="score >= 90">1!</div>
    <div v-else-if="score >= 80">2@</div>
    <div v-else-if="score >= 70">3#</div>
    <div v-else>4$</div>
  </div>
</template>

<style scoped>
.text-danger {
  color: red;
  font-weight: bold;
}
.bg-dark {
  background-color: aliceblue;
  color: antiquewhite;
  padding: 15px;
}
.border-red {
  border: 3px solid darkred;
}
.border-gray {
  border: 5px dotted lightcoral;
}
#thisIdForThisTestlol {
  border-color: aqua;
  border-width: 10px;
  border-style: dashed;
}
</style>
