import { reactive } from 'vue'
import { defineStore } from 'pinia'

export const useContext = defineStore('ctx', () => {
  const ctx = reactive({
    // line | arc | rect | clear
    mode: 'line'
  })

  const handleCtx = mode => ctx.mode = mode

  return { ctx, handleCtx }
})