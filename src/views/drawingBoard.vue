<template>
  <main ref="canvasRoot">
    <canvas ref="cDom" class="canvas"></canvas>
    <action-bar :handleDownload="handleDownload" />
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useContext } from '@/stores/context'
import { useDraw } from '@/hooks/draw'
import ActionBar from '@/components/actionBar.vue'

const contextStore = useContext()
const { Draw } = useDraw()

/**
 * @description: 初始化画布大小&获取画笔
 * @return {*}
 */
const canvasRoot = ref()
const cDom = ref()
const ctx = ref()
let drawMethod = null
const initSize = () => {
  const { clientWidth, clientHeight } = document.documentElement
  cDom.value.width = clientWidth
  cDom.value.height = clientHeight
  ctx.value = cDom.value.getContext('2d')
}

const isStart = ref(false)
const startPoint = ref({
  x: 0,
  y: 0
})

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
  startPoint.value = {
    x: clientX,
    y: clientY
  }
  ctx.value.moveTo(clientX, clientY)
  if (contextStore.ctx.mode === 'text') {
    // drawText(clientX, clientY)
    drawMethod.text(clientX, clientY, canvasRoot)
  }
}

const handleMousemove = e => {
  if (!isStart.value || contextStore.ctx.mode === 'text') return
  const { clientX, clientY } = e
  drawMethod.pathStore.forEach(path => {
    drawMethod.path = path
    drawMethod.draw('stroke')
  })
  contextStore.ctx.mode === 'text'
    ? drawMethod.text(clientX, clientY, canvasRoot)
    : drawMethod[contextStore.ctx.mode](clientX, clientY)
}

const handleMouseup = () => {
  isStart.value = false
  drawMethod.savePath()
}

const getPoint = () => {
  cDom.value.addEventListener('mousedown', handleMousedown)
  cDom.value.addEventListener('mousemove', handleMousemove)
  cDom.value.addEventListener('onmouseleave', handleMouseup)
  cDom.value.addEventListener('mouseup', handleMouseup)
}

onMounted(() => {
  initSize()
  getPoint()
  drawMethod = new Draw(cDom, ctx)
})
</script>

<style>
.canvas {
  position: fixed;
  top: 0;
  left: 0;
  display: block;
  background-image: linear-gradient(transparent 96%, rgba(0, 0, 0, 0.2) 96%),
                    linear-gradient(to right, transparent 96%, rgba(0, 0, 0, 0.2) 96%);
  background-size: 20px 20px;
}
</style>
