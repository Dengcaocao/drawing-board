<template>
  <main>
    <canvas ref="cDom" class="canvas"></canvas>
    <action-bar />
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useContext } from '@/stores/context'
import ActionBar from '@/components/actionBar.vue'

const contextStore = useContext()

/**
 * @description: 初始化画布大小&获取画笔
 * @return {*}
 */
const cDom = ref()
const ctx = ref()
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

const draw = (x, y) => {
  ctx.value.lineTo(x, y)
  ctx.value.stroke()
}

const drawArc = (x, y) => {
  const distenceX = Math.abs(x - startPoint.value.x)
  const distenceY = Math.abs(y - startPoint.value.y)
  const r = Math.pow(distenceX * distenceX + distenceY * distenceY, 1/2)
  ctx.value.beginPath()
  ctx.value.arc(x, y, r, 0, Math.PI * 2)
  ctx.value.closePath()
  ctx.value.stroke()
}

const drawRect = (x, y) => {
  const distenceX = x - startPoint.value.x
  const distenceY = y - startPoint.value.y
  ctx.value.beginPath()
  ctx.value.strokeRect(startPoint.value.x, startPoint.value.y, distenceX, distenceY)
  ctx.value.closePath()
}

const handleMousedown = e => {
  isStart.value = true
  const { clientX, clientY } = e
  startPoint.value = {
    x: clientX,
    y: clientY
  }
  ctx.value.moveTo(clientX, clientY)
}

const handleMousemove = e => {
  if (!isStart.value) return
  const { clientX, clientY } = e
  const drawType = {
    line: draw,
    arc: drawArc,
    rect: drawRect
  }
  drawType[contextStore.ctx.mode](clientX, clientY)
}

const handleMouseup = () => isStart.value = false

const getPoint = () => {
  cDom.value.addEventListener('mousedown', handleMousedown)
  cDom.value.addEventListener('mousemove', handleMousemove)
  cDom.value.addEventListener('onmouseleave', handleMouseup)
  cDom.value.addEventListener('mouseup', handleMouseup)
}

onMounted(() => {
  initSize(),
  getPoint()
})
</script>

<style>
.canvas {
  position: fixed;
  top: 0;
  left: 0;
  display: block;
  background-image: linear-gradient( #000 4%, transparent 4%),
                    linear-gradient(to right, #000 4%, transparent 4%);
  background-size: 20px 20px;
}
</style>
