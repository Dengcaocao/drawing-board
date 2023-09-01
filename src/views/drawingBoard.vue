<template>
  <main ref="canvasRoot">
    <canvas ref="cDom" class="canvas" :class="{'show-grid': contextStore.isGrid}"></canvas>
    <action-bar :actions="actions" />
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
const actions = ref({})
// 绘制实例
let drawMethod = null
// 记录操作时长
let times = 0

/**
 * @description: 初始化画布大小
 * @return {*}
 */
const initSize = () => {
  const { clientWidth, clientHeight } = document.documentElement
  cDom.value.width = clientWidth
  cDom.value.height = clientHeight
  drawMethod.reDraw()
}

// 控制事件
const isStart = ref(false)

/**
 * @description: 保存canvas为图片
 * @return {*}
 */
const handleDownload = () => {
  const url = cDom.value.toDataURL()
  const targ_a = document.createElement('a')
  targ_a.setAttribute('href', url)
  targ_a.setAttribute('download', Math.random().toString(16).slice(-6))
  targ_a.click()
}

const getActions = () => ({
  revoke: () => drawMethod.revoke(),
  forward: () => drawMethod.forward(),
  download: handleDownload
})

// pc 事件
const handleMousedown = e => {
  isStart.value = true
  times = new Date().getTime()
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
  drawMethod.reDraw()
  drawMethod[contextStore.ctx.mode](clientX, clientY)
}

const handleMouseup = () => {
  isStart.value = false
  new Date().getTime() - times > 200 && drawMethod.savePath()
  times = 0
}

// 移动端事件
const handleTouchstart = e => handleMousedown(e.changedTouches[0])

const handleTouchmove = e => handleMousemove(e.changedTouches[0])

const handleTouchend = handleMouseup

const addMouseEvent = () => {
  // 监听pc
  cDom.value.addEventListener('mousedown', handleMousedown)
  cDom.value.addEventListener('mousemove', handleMousemove)
  cDom.value.addEventListener('onmouseleave', handleMouseup)
  cDom.value.addEventListener('mouseup', handleMouseup)
  // 监听移动端
  cDom.value.addEventListener('touchstart', handleTouchstart)
  cDom.value.addEventListener('touchmove', handleTouchmove)
  cDom.value.addEventListener('touchend', handleTouchend)
}

onMounted(() => {
  drawMethod = new Draw(cDom)
  initSize()
  addMouseEvent()
  actions.value = getActions()
  window.addEventListener('resize', initSize)
})

onBeforeUnmount(() => {
  // 移除监听
  cDom.value.removeEventListener('mousedown', handleMousedown)
  cDom.value.removeEventListener('mousemove', handleMousemove)
  cDom.value.removeEventListener('onmouseleave', handleMouseup)
  cDom.value.removeEventListener('mouseup', handleMouseup)
  cDom.value.removeEventListener('touchstart', handleTouchstart)
  cDom.value.removeEventListener('touchmove', handleTouchmove)
  cDom.value.removeEventListener('touchend', handleTouchend)
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
