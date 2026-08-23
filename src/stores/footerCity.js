import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useFooterCityStore = defineStore('footerCity', () => {
  const city = ref('')
  const msg = ref('')

  function setCity(newCity) {
    city.value = newCity
  }
  function setMsg(newMsg) {
    msg.value = newMsg
  }

  return { city, msg, setCity, setMsg }
})