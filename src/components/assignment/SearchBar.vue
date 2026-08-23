<script setup>
import { ref, onMounted } from 'vue'

//const model = defineModel('search')
const emit = defineEmits(['update:search'])
const props = defineProps({
  search: {
    type: String,
    default: '',
  },
})

/*const emitHandeler = (event) => {
  emit('update:search', event.target.value)
}*/
// element plus를 쓰니 원래 구조가 먹통이 되어서 해결합니다.
// 온갖게 다 안되어서 el-input을 조금 뜯습니다.

const inputRef = ref(null)

onMounted(() => {
  // el-input 내부의 실제 HTML input 요소를 가져와 이벤트를 강제로 연결합니다.
  const nativeInput = inputRef.value?.$el.querySelector('input')
  if (nativeInput) {
    nativeInput.addEventListener('input', (e) => {
      emit('update:search', e.target.value)
    })
  }
})
</script>

<template>
  <el-input
    ref="inputRef"
    :model-value="props.search"
    @input="(val) => $emit('update:search', $event.target ? $event.target.value : val)"
    placeholder="도시 검색해 보세요"
    @clear="emit('update:search', '')"
    size="large"
  />
</template>

<style scoped>
.search-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-content .el-input {
  flex: 1;
}
</style>
