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
  ctx.value.clearRect(0, 0, cDom.value.width, cDom.value.height)
  const distenceX = Math.abs(x - startPoint.value.x)
  const distenceY = Math.abs(y - startPoint.value.y)
  const r = Math.pow(distenceX * distenceX + distenceY * distenceY, 1/2)
  ctx.value.beginPath()
  ctx.value.arc(startPoint.value.x, startPoint.value.y, r, 0, Math.PI * 2)
  ctx.value.closePath()
  ctx.value.stroke()
}

const drawRect = (x, y) => {
  ctx.value.clearRect(0, 0, cDom.value.width, cDom.value.height)
  const distenceX = x - startPoint.value.x
  const distenceY = y - startPoint.value.y
  ctx.value.beginPath()
  ctx.value.strokeRect(startPoint.value.x, startPoint.value.y, distenceX, distenceY)
  ctx.value.closePath()
}

const getMarkSize = distence => {
  const h = distence / 4
  switch (true) {
    case distence < 100:
      return {
        w: 1,
        h: h < 2 ? 2 : h,
        incline: 2,
        size: h < 2 ? 2 : h / 2
      }
  
    default:
      return {
        w: 4,
        h: 20,
        incline: 4,
        size: 10
      }
  }
}

const drawMark = (x, y) => {
  ctx.value.clearRect(0, 0, cDom.value.width, cDom.value.height)
  ctx.value.save()
  // 计算长度
  const distenceX = x - startPoint.value.x
  const distenceY = y - startPoint.value.y
  const distence = Math.pow(distenceX * distenceX + distenceY * distenceY, 1/2) * (distenceX < 0 ? -1 : 1)
  // 旋转角度
  let deg = Math.asin(Math.sin(distenceY / distence))

  ctx.value.translate(startPoint.value.x, startPoint.value.y)
  ctx.value.rotate(deg)
  ctx.value.beginPath()

  const obj = getMarkSize(Math.abs(distence))
  ctx.value.lineTo(0, 0)
  ctx.value.lineTo(0, -obj.w / 2)
  ctx.value.lineTo(distence - obj.h, -obj.size)
  ctx.value.lineTo(distence - obj.h - obj.incline, -obj.size * 2)
  ctx.value.lineTo(distence, 0)
  ctx.value.lineTo(distence - obj.h - obj.incline, obj.size * 2)
  ctx.value.lineTo(distence - obj.h, obj.size)
  ctx.value.lineTo(0, obj.w / 2)
  ctx.value.lineTo(0, 0)
  ctx.value.fill()

  ctx.value.closePath()
  ctx.value.restore()
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
    rect: drawRect,
    mark: drawMark
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
