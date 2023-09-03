import { useContext } from '@/stores/context'

const contextStore = useContext()

export function useDraw() {
  class Draw {
    constructor (canvas) {
      this.canvas = canvas
      this.ctx = canvas.value.getContext('2d')
      // 保存绘制路径
      this.pathStore = []
      // 保存撤销的路径
      this.revokePathStore = []
      // 保存当前图形的骨骼
      this.bones = []
      // 绘制路径
      this.path = new Path2D()
      // 绘制类型 fill | stroke
      this.type = 'stroke'
      // 画笔样式
      this.contextOptions = null
    }

    // 初始化坐标点
    init (startPoint) {
      this.startPoint = startPoint
      this.lastPoint = startPoint
      this.ctx.moveTo(startPoint.x, startPoint.y)
    }

    line (x, y) {
      this.path = new Path2D()
      this.path.moveTo(this.lastPoint.x, this.lastPoint.y)
      this.path.lineTo(x, y)
      this.type = 'stroke'
      this.draw()
      this.lastPoint = { x, y }
    }

    arc (x, y) {
      this.path = new Path2D()
      const distenceX = x - this.startPoint.x
      const distenceY = y - this.startPoint.y
      const centerX = this.startPoint.x + distenceX / 2
      const centerY = this.startPoint.y + distenceY / 2
      const r = Math.pow(distenceX * distenceX + distenceY * distenceY, 1/2) / 2
      // 记录骨骼信息
      this.bones = [
        [centerX - r, centerY - r],
        [centerX, centerY - r],
        [centerX + r, centerY - r],
        [centerX + r, centerY],
        [centerX + r, centerY + r],
        [centerX, centerY + r],
        [centerX - r, centerY + r],
        [centerX - r, centerY]
      ]
      this.path.arc(centerX, centerY, r, 0, Math.PI * 2)
      this.type = 'stroke'
      this.draw()
    }

    rect (x, y) {
      this.path = new Path2D()
      const { x: spX, y: spY } = this.startPoint
      const distenceX = x - spX
      const distenceY = y - spY
      // 记录骨骼信息
      this.bones = [
        [spX, spY],
        [spX + distenceX / 2, spY],
        [spX + distenceX, spY],
        [spX + distenceX, spY + distenceY / 2],
        [spX + distenceX, spY + distenceY],
        [spX + distenceX / 2, spY + distenceY],
        [spX, spY + distenceY],
        [spX, spY + distenceY / 2],
      ]
      this.path.rect(spX, spY, distenceX, distenceY)
      this.type = 'stroke'
      this.draw()
    }

    // 获取箭头大小信息
    getMarkSize (distence) {
      const h = distence / 4
      switch (true) {
        case distence < 100:
          return {
            w: 1,
            h: h < 2 ? 2 : h,
            incline: 2, // 倾斜度
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

    mark (x, y) {
      this.ctx.save()
      this.path = new Path2D()
      // 计算位移
      const distenceX = x - this.startPoint.x
      const distenceY = y - this.startPoint.y
      // 箭头方向
      const direction = distenceX < 0 ? -1 : 1
      // 计算长度
      const distence = Math.pow(distenceX * distenceX + distenceY * distenceY, 1/2) * direction
      // 旋转角度
      let deg = Math.asin(Math.sin(distenceY / distence))
      this.setContextOptions({
        translate: { x: this.startPoint.x, y: this.startPoint.y },
        rotate: deg
      })

      const obj = this.getMarkSize(Math.abs(distence))
      this.path.lineTo(0, 0)
      this.path.lineTo(0, -obj.w / 2)
      this.path.lineTo(distence - (obj.h * direction), -obj.size)
      this.path.lineTo(distence - (obj.h * direction) - (obj.incline * direction), -obj.size * 2)
      this.path.lineTo(distence, 0)
      this.path.lineTo(distence - (obj.h * direction) - (obj.incline * direction), obj.size * 2)
      this.path.lineTo(distence - (obj.h * direction), obj.size)
      this.path.lineTo(0, obj.w / 2)
      this.path.lineTo(0, 0)
      // 记录骨骼信息
      this.bones = [
        [0, -obj.size * 2],
        [distence / 2, -obj.size * 2],
        [distence, -obj.size * 2],
        [distence, 0],
        [distence, obj.size * 2],
        [distence / 2, obj.size * 2],
        [0, obj.size * 2],
        [0, 0],
      ]
      this.type = 'fill'
      this.draw()
      this.ctx.restore()
    }

    text (x, y, canvasRoot) {
      const font = 32
      const textarea = document.createElement('textarea')
      textarea.cols = 1
      textarea.rows = 1
      this.setContextOptions({
        font: `${font}px auto`,
        textBaseline: 'middle'
      })
      textarea.oninput = e => {
        this.clearCanvas()
        this.reDraw()
        textarea.cols = e.target.value.length + 1
        // 缩进了 2px
        this.ctx.fillText(e.target.value, x + 2, y)
      }
      textarea.onblur = e => {
        this.type = 'fill'
        this.path = {
          x: x + 2,
          y,
          text: e.target.value
        }
        e.target.value && this.savePath()
        textarea.parentNode.removeChild(textarea)
      }
      textarea.style.cssText = `
        overflow: hidden;
        position: absolute;
        top: ${y - font / 2}px;
        left: ${x}px;
        height: ${font}px;
        line-height: ${font}px;
        background-color: transparent;
        outline: none;
        resize: none;
        border: 1px solid #000;
        font-size: ${font}px;
        white-space: pre-wrap;
        text-indent: 2px;
        color: transparent;
        caret-color: #000;
      `
      canvasRoot.value.appendChild(textarea)
    }

    // 重新绘制 pathStore 中的路径
    reDraw () {
      this.pathStore.forEach(({ type, contextOptions, path }) => {
        if (path.text) {
          this.ctx.fillText(path.text, path.x, path.y)
        } else {
          this.type = type
          this.contextOptions = contextOptions
          this.path = path
          this.draw(true)
        }
        this.contextOptions = null
      })
    }

    // 橡皮擦
    clear (x, y) {
      this.ctx.save()
      this.path = new Path2D()
      this.setContextOptions({
        globalCompositeOperation: 'destination-out'
      })

      this.path.moveTo(this.lastPoint.x, this.lastPoint.y)
      this.path.lineTo(x, y)
      this.type = 'stroke'
      this.draw()
      this.lastPoint = { x, y }
      this.ctx.restore()
    }

    // 撤销
    revoke () {
      if (!this.pathStore.length) return
      this.clearCanvas()
      const delPath = this.pathStore.pop()
      this.revokePathStore.push(delPath)
      this.reDraw()
    }
    // 前进
    forward () {
      if (!this.revokePathStore.length) return
      this.clearCanvas()
      const lastPath = this.revokePathStore.pop()
      this.pathStore.push(lastPath)
      this.reDraw()
    }

    // 清除画布
    clearCanvas () {
      this.ctx.clearRect(0, 0, this.canvas.value.width, this.canvas.value.height)
    }

    // 设置画笔样式
    setContextOptions (options) {
      for (let i in options) {
        if (i === 'translate') {
          this.ctx[i](options[i].x, options[i].y)
          continue
        }
        if (i === 'rotate') {
          this.ctx[i](options[i])
          continue
        }
        this.ctx[i] = options[i]
      }
      this.contextOptions = { ...this.contextOptions, ...options }
    }

    /**
     * 绘制图形骨骼🦴
     * @param {*} bones 骨骼位置[]
     * @param {*} contextOptions 画笔样式
     */
    showBones (bones, contextOptions) {
      this.ctx.save()
      this.ctx.beginPath()
      for (let i = 0; i <= bones.length; i++) {
        // 取末形成闭合
        const index = i % bones.length
        const [x, y] = bones[index]
        this.ctx.save()
        this.setContextOptions({
          ...contextOptions,
          lineWidth: 1,
          fillStyle: '#fff',
          strokeStyle: 'rgba(0, 0, 0, .8)'
        })
        this.ctx.moveTo(x, y)
        this.ctx.arc(x, y, 3, 0, Math.PI * 2)
        this.ctx.moveTo(x, y)
        const [nextX, nextY] = bones[index + 1] || bones[0]
        this.ctx.lineTo(nextX, nextY)
        this.ctx.stroke()
        this.ctx.fill()
        this.ctx.restore()
      }
      this.contextOptions = null
      this.ctx.closePath()
      this.ctx.restore()
    }

    /**
     * 判断点是否在路径上
     * @param {*} movePoint 鼠标移动的点位信息
     * @returns 
     */
    checkPointInPath (movePoint) {
      this.clearCanvas()
      this.reDraw()
      // 计算每次偏移的距离
      const translatePoint = movePoint
        ? { x: movePoint.x - this.lastPoint.x, y: movePoint.y - this.lastPoint.y }
        : { x: 0, y: 0 }
      movePoint && (this.lastPoint = movePoint)
      for (let i = 0; i < this.pathStore.length; i++) {
        const path = this.pathStore[i].path
        const contextOptions = this.pathStore[i].contextOptions
        // 计算最终鼠标点击的位置
        const cot = contextOptions.translate || { x: 0, y: 0 }
        const x = movePoint ? movePoint.x - cot.x : this.startPoint.x - cot.x
        const y = movePoint ? movePoint.y - cot.y : this.startPoint.y - cot.y
        // 判断路径
        const isPointInPath = this.ctx.isPointInPath(path, x, y)
        if (isPointInPath) {
          const bones = this.pathStore[i].bones
          // 设置新的坐标信息
          contextOptions.translate = {
            x: movePoint ? cot.x + translatePoint.x : cot.x,
            y: movePoint ? cot.y + translatePoint.y : cot.y
          }
          this.pathStore[i].contextOptions = contextOptions
          return this.showBones(bones, contextOptions)
        }
      }
    }

    // 路径绘制
    draw (isPathStore) {
      this.ctx.save()
      this.ctx.beginPath()
      isPathStore
        ? this.setContextOptions(this.contextOptions)
        : this.setContextOptions({
            strokeStyle: contextStore.ctx.color,
            fillStyle: contextStore.ctx.color,
            lineWidth: (contextStore.ctx.mode === 'clear' && contextStore.ctx.lineWidth < 10)
              ? 10
              : contextStore.ctx.lineWidth,
            lineCap: contextStore.ctx.lineCap
          })
      this.type === 'stroke'
        ? this.ctx.stroke(this.path)
        : this.ctx.fill(this.path)
      this.ctx.closePath()
      this.ctx.restore()
    }

    savePath () {
      if (!this.path) return
      this.pathStore.push({
        type: this.type,
        contextOptions: this.contextOptions || {},
        path: this.path,
        bones: this.bones
      })
      this.contextOptions = null
      this.path = null
      this.bones = []
      this.type = 'stroke'
    }

  }

  return { Draw }
}
