<template>
  <main ref="canvasRoot">
    <canvas ref="cDom" class="canvas" :class="{'show-grid': contextStore.isGrid}"></canvas>
    <action-bar :handleDownload="handleDownload" />
  </main>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useContext } from '@/stores/context'
import { useDraw } from '@/hooks/draw'
import ActionBar from '@/components/actionBar.vue'

const contextStore = useContext()
const { Draw } = useDraw()

const canvasRoot = ref()
const cDom = ref()
let drawMethod = null

/**
 * @description: 初始化画布大小
 * @return {*}
 */
const initSize = () => {
  const { clientWidth, clientHeight } = document.documentElement
  cDom.value.width = clientWidth
  cDom.value.height = clientHeight
}

const isStart = ref(false)

const handleDownload = () => {
  const url = cDom.value.toDataURL()
  const targ_a = document.createElement('a')
  targ_a.setAttribute('href', url)
  targ_a.setAttribute('download', Math.random().toString(16).slice(-6))
  targ_a.click()
}

const handleMousedown = e => {
  isStart.value = true
  const { clientX, clientY } = e
  drawMethod.init({ x: clientX, y: clientY })
  if (contextStore.ctx.mode === 'text') {
    isStart.value = false
    drawMethod.text(clientX, clientY, canvasRoot)
  }
}

const handleMousemove = e => {
  if (!isStart.value) return
  const { clientX, clientY } = e
  drawMethod.clearCanvas()
  const drayType = ['line', 'clear']
  drayType.includes(contextStore.ctx.mode) && drawMethod.savePath()
  drawMethod.pathStore.forEach(({ type, styleOptions, path }) => {
    if (path.text) {
      drawMethod.ctx.fillText(path.text, path.x, path.y)
    } else {
      drawMethod.type = type
      drawMethod.styleOptions = styleOptions
      drawMethod.path = path
      drawMethod.draw(true)
    }
    drawMethod.styleOptions = null
  })
  drawMethod[contextStore.ctx.mode](clientX, clientY)
}

const handleMouseup = () => {
  isStart.value = false
  drawMethod.savePath()
}

const addMouseEvent = () => {
  cDom.value.addEventListener('mousedown', handleMousedown)
  cDom.value.addEventListener('mousemove', handleMousemove)
  cDom.value.addEventListener('onmouseleave', handleMouseup)
  cDom.value.addEventListener('mouseup', handleMouseup)
}

onMounted(() => {
  initSize()
  addMouseEvent()
  window.addEventListener('resize', initSize)
  drawMethod = new Draw(cDom)
})

onBeforeUnmount(() => {
  cDom.value.removeEventListener('mousedown', handleMousedown)
  cDom.value.removeEventListener('mousemove', handleMousemove)
  cDom.value.removeEventListener('onmouseleave', handleMouseup)
  cDom.value.removeEventListener('mouseup', handleMouseup)
  window.removeEventListener('resize', initSize)
})
</script>

<style>
.canvas {
  position: fixed;
  top: 0;
  left: 0;
  display: block;
}
.canvas.show-grid {
  background-image: linear-gradient(transparent 96%, rgba(0, 0, 0, 0.2) 96%),
                    linear-gradient(to right, transparent 96%, rgba(0, 0, 0, 0.2) 96%);
  background-size: 20px 20px;
}
</style>
