import { reactive } from 'vue'
import { defineStore } from 'pinia'

export const useContext = defineStore('ctx', () => {
  const ctx = reactive({
    // line | arc | rect | clear
    mode: 'line',
    color: '#000000',
    lineWidth: 1
  })

  const updateCtx = (fileds, value) => {
    ctx[fileds] = value
  }

  return { ctx, updateCtx }
})