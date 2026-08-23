import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useConfigStore = defineStore('configs', () => {
  const unit = ref('°C')

  // 현재 단위의 반대 단위를 자동으로 계산
  const nextUnit = computed(() => (unit.value === '°C' ? '°F' : '°C'))

  function toggleUnit() {
    unit.value = nextUnit.value
  }

  return { unit, nextUnit, toggleUnit }
})
