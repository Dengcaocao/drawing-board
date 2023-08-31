export function useDraw() {
  class Draw {
    constructor (canvas) {
      this.canvas = canvas
      this.ctx = canvas.value.getContext('2d')
      this.pathStore = []
      this.type = 'stroke'
      this.path = new Path2D()
      this.styleOptions = null
    }

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
      const distenceX = Math.abs(x - this.startPoint.x)
      const distenceY = Math.abs(y - this.startPoint.y)
      const r = Math.pow(distenceX * distenceX + distenceY * distenceY, 1/2)
      this.path.arc(this.startPoint.x, this.startPoint.y, r, 0, Math.PI * 2)
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
      this.path = new Path2D()
      this.ctx.save()
      // 计算位移
      const distenceX = x - this.startPoint.x
      const distenceY = y - this.startPoint.y
      // 箭头方向
      const direction = distenceX < 0 ? -1 : 1
      // 计算长度
      const distence = Math.pow(distenceX * distenceX + distenceY * distenceY, 1/2) * direction
      // 旋转角度
      let deg = Math.asin(Math.sin(distenceY / distence))
      const styleOptions = {
        translate: { x: this.startPoint.x, y: this.startPoint.y },
        rotate: deg,
        fillStyle: 'red'
      }
      this.setStyle(styleOptions)

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
      // const path = new Path2D()
      const font = 32
      const textarea = document.createElement('textarea')
      textarea.cols = 1
      textarea.rows = 1
      textarea.oninput = e => {
        this.clearCanvas()
        // const fillWidth = ctx.value.measureText(textarea.value).width
        textarea.cols = e.target.value.length + 1
        // textarea.style.width = `${fillWidth + 32}px`
        this.ctx.font = `${font}px auto`
        this.ctx.textBaseline = 'middle'
        this.ctx.fillText(e.target.value, x + 2, y)
        // this.draw(path, 'fill')
      }
      textarea.onblur = () => textarea.parentNode.removeChild(textarea)
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

    clear (x, y) {
      this.path = new Path2D()
      this.ctx.save()
      const styleOptions = {
        lineWidth: 20,
        lineCap: 'round',
        globalCompositeOperation: 'destination-out'
      }
      this.setStyle(styleOptions)

      this.path.moveTo(this.lastPoint.x, this.lastPoint.y)
      this.path.lineTo(x, y)
      this.type = 'stroke'
      this.draw()
      this.lastPoint = { x, y }
      this.ctx.restore()
    }

    clearCanvas () {
      this.ctx.clearRect(0, 0, this.canvas.value.width, this.canvas.value.height)
    }

    setStyle (options) {
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
      this.styleOptions = options
    }

    draw (isPathStore) {
      this.ctx.save()
      this.ctx.beginPath()
      isPathStore && this.setStyle(this.styleOptions)
      this.type === 'stroke'
        ? this.ctx.stroke(this.path)
        : this.ctx.fill(this.path)
      this.ctx.closePath()
      this.ctx.restore()
    }

    savePath () {
      this.pathStore.push({
        type: this.type,
        styleOptions: this.styleOptions || {},
        path: this.path
      })
      this.styleOptions = null
      this.type = 'stroke'
    }

  }

  return { Draw }
}
