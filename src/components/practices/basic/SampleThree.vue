<script setup>
import { ref, watch, watchEffect } from 'vue'

const yeetarray = ref(['a', 'b', 'c', 'd'])

const yeetdict = {
  1: 'ㅁ',
  2: 'ㄴ',
  3: 'ㄷ',
  4: 'ㅇ',
}

const toggler = ref(false)

const color_what = ref(['#f0ff0f', '#00ff00', '#121212', '#494121'])
const i = ref(0)
const content = ref('asd')

const wtf = ref(0)

watch(wtf, (value, oldvalue) => {
  const prev = oldvalue ? oldvalue : 0
  content.value = value + prev
})
watchEffect(() => {
    toggler.value = Boolean(Number(wtf.value))
})
</script>

<template>
  <h3>이야 여기는 반복문도 되고!</h3>
  <ul>
    <li v-for="(item, index) in yeetarray" :key="index">{{ index }} = {{ item }}</li>
  </ul>
  <h3>이야 여기는 루프문도 되고!</h3>
  <ol>
    <li v-for="(value, key) in yeetdict" :key="key">{{ value }} = {{ key }}</li>
  </ol>
  <h3 v-pre v-once>{{ yeetarray }}!!</h3>

  <h4 v-show="toggler">이건 안보인다네!</h4>
  <button @click="toggler = !toggler">이건 바뀐다네!</button>

  <div
    :style="{ backgroundColor: color_what[i] }"
    style="width: 100px; height: 100px"
    @keydown="
      i++;
      i = i >= 4 ? 0 : i
    "
    tabindex="0"
  >
    <div
      :style="{ backgroundColor: color_what[3 - i] }"
      style="width: 50px; height: 50px"
      @keydown="content = $event.key"
      tabindex="0"
    >
      {{ content }}
    </div>

    <input type="text" v-model="content" placeholder="yeet" />
  </div>

  <input type="checkbox" v-model="toggler" />

  <div>
    <input type="text" v-model.trim.number="wtf" />
    <ol>
      <li v-for="n in wtf" :key="n">{{ n }} 이게뭐노??</li>
    </ol>
  </div>
</template>

<style scoped>
h4 {
  background-color: #f0ffff;
  color: bisque;
}
</style>
