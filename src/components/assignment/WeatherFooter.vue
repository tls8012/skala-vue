<script>
const defaultString = '아무 도시도 선택되지 않았습니다.'

const getJosa = (word, kor1, kor2) => {
  if (!word) return ''
  const lastChar = word.charCodeAt(word.length - 1)
  // 한글 범위(가~힣) 내에 있는지 확인
  if (lastChar < 0xac00 || lastChar > 0xd7a3) {
    return kor1 // 한글이 아닌 경우 기본값
  }
  // (글자 - 0xAC00) % 28 값이 0이면 받침 없음, 0이 아니면 받침 있음
  return (lastChar - 0xac00) % 28 > 0 ? kor1 : kor2
}
</script>

<script setup>
//import { ref, watch } from 'vue'
import FooterFunEvent from './FooterFunEvent.vue'
import { useFooterCityStore } from '@/stores/footerCity.js'
import { storeToRefs } from 'pinia'
/*const props = defineProps({
  city: { type: String },
  msg: { type: String },
})*/
const emit = defineEmits(['reset-footer'])
const resetter = () => {
  emit('reset-footer')
}
//const city_inner = ref('')

const cityStore = useFooterCityStore()

const { city, msg } = storeToRefs(cityStore)

//watch(() => props.city,() => {city_inner.value = props.city},)
/*watch(city, (newcity) => {
  city_inner.value = newcity
})*/
</script>

<template>
  <div
    class="footerContainer"
    style="
      height: 100px;
      background-color: blueviolet;
      border-radius: 8px;
      padding: 8px;
      align-content: center;
      color: bisque;
    "
  >
    <!--<p v-if="Boolean(props.city)">-->
    <p v-if="city">{{ city }}{{ getJosa(city, '이', '가') }} 선택되었습니다.</p>
    <p v-else>{{ defaultString }}</p>
    <!--<p v-show="Boolean(props.msg)">{{ props.msg }}</p>-->
    <p v-show="msg">{{ msg }}</p>
    <button @click.stop="resetter">표기 정리하기</button>
  </div>
  <div class="funContainer">
    <FooterFunEvent v-model="city"></FooterFunEvent>
  </div>
</template>

<style scoped>
.footerContainer p {
  width: 75%;
  text-align: center;
  margin: 0 auto;
}
.footerContainer button {
  margin: 10px auto;
  display: block;
}
</style>
