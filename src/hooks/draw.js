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
      this.type = 'stroke'
      this.path = new Path2D()
      this.contextOptions = null
    }

    // 记录坐标
    init (startPoint) {
      this.startPoint = startPoint
      this.lastPoint = startPoint
      this.ctx.moveTo(startPoint.x, startPoint.y)
    }

    line (x, y) {
      this.ctx.beginPath()
      this.path = new Path2D()
      this.path.moveTo(this.lastPoint.x, this.lastPoint.y)
      this.path.lineTo(x, y)
      this.type = 'stroke'
      this.draw()
      this.ctx.closePath()
      this.lastPoint = { x, y }
    }

    arc (x, y) {
      this.path = new Path2D()
      const distenceX = x - this.startPoint.x
      const distenceY = y - this.startPoint.y
      const centerX = this.startPoint.x + distenceX / 2
      const centerY = this.startPoint.y + distenceY / 2
      const r = Math.pow(distenceX * distenceX + distenceY * distenceY, 1/2)
      this.path.arc(centerX, centerY, r / 2, 0, Math.PI * 2)
      this.type = 'stroke'
      this.draw()
    }

    rect (x, y) {
      this.path = new Path2D()
      const distenceX = x - this.startPoint.x
      const distenceY = y - this.startPoint.y
      this.path.rect(this.startPoint.x, this.startPoint.y, distenceX, distenceY)
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
      this.pathStore.push({
        type: this.type,
        contextOptions: this.contextOptions || {},
        path: this.path
      })
      this.contextOptions = null
      this.type = 'stroke'
    }

  }

  return { Draw }
}
