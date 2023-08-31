import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'

export const useContext = defineStore('ctx', () => {
  const isGrid = ref(true)
  const ctx = reactive({
    // line | arc | rect | clear
    mode: 'line',
    color: '#000000',
    lineWidth: 1
  })

  const updateIsGrid = () => isGrid.value = !isGrid.value

  const updateCtx = (fileds, value) => {
    ctx[fileds] = value
  }

  return { isGrid, ctx, updateIsGrid, updateCtx }
})