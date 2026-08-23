import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMockWeatherInfoStore = defineStore('mockinfo', () => {
  const static_mockData = ref([
    { _id: 0, city: '서울', temp: 28, status: '맑음', humidity: 55, wind: 2.5, winddir: 'East' },
    {
      _id: 1,
      city: '수원',
      temp: 19,
      status: '비',
      msg: '집에가고싶다.',
      humidity: 65,
      wind: 5,
      winddir: 'West',
    },
    { _id: 2, city: '부산', temp: 26, status: '구름', humidity: 9, winddir: 'NorthEast' },
    { _id: 3, city: '광주', temp: -1, status: '눈', humidity: 0, wind: 2, winddir: 'South' },
    { _id: 4, city: '인천', temp: 75, status: '죽음', humidity: 77, wind: -2.5 },
    { _id: 5, city: '수성군', temp: 10101, status: '북한이네요' },
    { _id: 6, city: '원산', temp: 10101, status: '여기도 북한이네요' },
  ])

  const index_mockdata = (index) => static_mockData.value[index]

  return { static_mockData, index_mockdata }
})
