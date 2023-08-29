export function useDraw() {
  class Draw {
    constructor (ctx, startPoint) {
      this.pathStore = []
      this.ctx = ctx
      this.startPoint = startPoint
      this.lastPoint = startPoint
    }

    line (x, y) {
      const path = new Path2D()
      path.moveTo(this.lastPoint.x, this.lastPoint.y)
      path.lineTo(x, y)
      this.draw(path, 'stroke')
      this.lastPoint = { x, y }
    }

    arc (x, y) {
      const path = new Path2D()
      const distenceX = Math.abs(x - this.startPoint.x)
      const distenceY = Math.abs(y - this.startPoint.y)
      const r = Math.pow(distenceX * distenceX + distenceY * distenceY, 1/2)
      path.arc(this.startPoint.x, this.startPoint.y, r, 0, Math.PI * 2)
      this.draw(path, 'stroke')
    }

    rect (x, y) {
      const path = new Path2D()
      const distenceX = x - this.startPoint.x
      const distenceY = y - this.startPoint.y
      path.rect(this.startPoint.x, this.startPoint.y, distenceX, distenceY)
      this.draw(path, 'stroke')
    }

    getMarkSize (distence) {
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

    mark (x, y) {
      /**
       * 画布清除和状态保存
       */
      this.ctx.value.clearRect(0, 0, window.innerWidth, window.innerHeight)
      const path = new Path2D()
      this.ctx.value.save()
      // 计算长度
      const distenceX = x - this.startPoint.x
      const distenceY = y - this.startPoint.y
      const distence = Math.pow(distenceX * distenceX + distenceY * distenceY, 1/2) * (distenceX < 0 ? -1 : 1)
      // 旋转角度
      let deg = Math.asin(Math.sin(distenceY / distence))
      this.ctx.value.translate(this.startPoint.x, this.startPoint.y)
      this.ctx.value.rotate(deg)
      this.ctx.value.fillStyle = 'red'

      const obj = this.getMarkSize(Math.abs(distence))
      path.lineTo(0, 0)
      path.lineTo(0, -obj.w / 2)
      path.lineTo(distence - obj.h, -obj.size)
      path.lineTo(distence - obj.h - obj.incline, -obj.size * 2)
      path.lineTo(distence, 0)
      path.lineTo(distence - obj.h - obj.incline, obj.size * 2)
      path.lineTo(distence - obj.h, obj.size)
      path.lineTo(0, obj.w / 2)
      path.lineTo(0, 0)
      this.draw(path, 'fill')
      this.ctx.value.restore()
    }

    text (x, y, canvasRoot) {
      // const path = new Path2D()
      const font = 32
      const textarea = document.createElement('textarea')
      textarea.cols = 1
      textarea.rows = 1
      textarea.oninput = e => {
        // const fillWidth = ctx.value.measureText(textarea.value).width
        textarea.cols = e.target.value.length + 1
        // textarea.style.width = `${fillWidth + 32}px`
        this.ctx.value.font = `${font}px auto`
        this.ctx.value.textBaseline = 'middle'
        this.ctx.value.fillText(e.target.value, x + 2, y)
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
      const path = new Path2D()
      this.ctx.value.save()
      this.ctx.value.beginPath()
      this.ctx.value.lineWidth = 20
      this.ctx.value.lineCap = 'round'
      this.ctx.value.globalCompositeOperation = 'destination-out'
      path.moveTo(this.lastPoint.x, this.lastPoint.y)
      path.lineTo(x, y)
      this.draw(path, 'fill')
      this.lastPoint = { x, y }
      this.ctx.value.closePath()
      this.ctx.value.restore()
    }

    draw (path, type) {
      this.ctx.value.save()
      this.ctx.value.beginPath()
      type === 'stroke'
        ? this.ctx.value.stroke(path)
        : this.ctx.value.fill(path)
      this.ctx.value.closePath()
      this.ctx.value.restore()
    }

  }

  return { Draw }
}
