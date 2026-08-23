import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiModeStore = defineStore('uiMode', () => {
  const pretty = ref(false)
  function toggle() { pretty.value = !pretty.value }
  function setPretty(v) { pretty.value = !!v }
  return { pretty, toggle, setPretty }
})
