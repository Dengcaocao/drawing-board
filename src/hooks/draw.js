import { useContext } from '@/stores/context'

const contextStore = useContext()

export function useDraw() {
  class Draw {
    constructor (canvas) {
      this.canvas = canvas
      this.ctx = canvas.value.getContext('2d')
      // 保存文本绘制时创建的input，防止创建多个
      this.isCreateInput = false
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

    /**
     * 初始化坐标点
     * @param {*} startPoint 鼠标点击的位置
     */
    init (startPoint) {
      this.startPoint = startPoint
      this.lastPoint = startPoint
      this.ctx.moveTo(startPoint.x, startPoint.y)
    }

    /**
     * 线段绘制
     * @param {*} x 鼠标移动时的x坐标
     * @param {*} y 鼠标移动时的y坐标
     */
    line (x, y) {
      this.path = new Path2D()
      this.path.moveTo(this.lastPoint.x, this.lastPoint.y)
      this.path.lineTo(x, y)
      this.type = 'stroke'
      this.draw()
      this.lastPoint = { x, y }
    }

    /**
     * 圆形绘制
     * @param {*} x 鼠标移动时的x坐标
     * @param {*} y 鼠标移动时的y坐标
     */
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
      this.rotatePoint = { x: centerX, y: centerY }
      this.draw()
    }

    /**
     * 矩形绘制
     * @param {*} x 鼠标移动时的x坐标
     * @param {*} y 鼠标移动时的y坐标
     */
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
      this.rotatePoint = { x: distenceX / 2, y: distenceY / 2 }
      this.draw()
    }

    /**
     * 获取箭头大小信息
     * @param {*} distence 长度
     * @returns 
     */
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

    /**
     * 箭头绘制
     * @param {*} x 鼠标移动时的x坐标
     * @param {*} y 鼠标移动时的y坐标
     */
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
      let deg = Math.atan2(distenceY, distenceX)
      if (direction === -1) {
        deg = distenceY < 0 ? -Math.PI + deg : Math.PI + deg
      }
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
        [0, 0]
      ]
      this.type = 'fill'
      this.rotatePoint = { x: 0, y: 0 }
      this.draw()
      this.ctx.restore()
    }

    /**
     * 文本绘制
     * @param {*} x 鼠标移动时的x坐标
     * @param {*} y 鼠标移动时的y坐标
     * @param {*} canvasRoot canvas 的父级节点
     */
    text (x, y, canvasRoot) {
      this.isCreateInput = !this.isCreateInput
      if (!this.isCreateInput) return
      const input = document.createElement('input')
      const font = 28
      // 记录骨骼信息，因为基线对齐是 middle 方式，y轴需要减去自身的一半
      const realityY = y - font / 2
      let drawWidth = 0
      // 禁用拼写检查
      input.spellcheck = false
      // 等待添加到 document 中后再聚焦
      setTimeout(() => input.focus(), 0)
      this.type = 'fill'
      this.ctx.save()
      input.oninput = e => {
        this.clearCanvas()
        this.reDraw()
        this.setContextOptions({
          font: `${font}px auto`,
          textBaseline: 'middle',
          fillStyle: contextStore.ctx.color
        })
        // 获取绘制的宽度
        drawWidth = this.ctx.measureText(e.target.value).width
        input.style.width = `${drawWidth}px`
        input.style.textIndent = `${drawWidth}px`
        this.bones = [
          [x, realityY],
          [x + drawWidth / 2, realityY],
          [x + drawWidth, realityY],
          [x + drawWidth, y],
          [x + drawWidth, y + font / 2],
          [x + drawWidth / 2, y + font / 2],
          [x, y + font / 2],
          [x, y]
        ]
        this.rotatePoint = { x: drawWidth / 2, y: font / 2 }
        this.ctx.fillText(e.target.value, x, y)
      }
      input.onblur = e => {
        this.isCreateInput = false
         // 创建一个和文本宽高的矩形路径，用于拖拽判断
        const path = new Path2D()
        path.rect(x, realityY, drawWidth, font)
        this.path = { x, y, text: e.target.value, vPath: path }
        this.ctx.restore()
        e.target.value && this.savePath()
        input.parentNode.removeChild(input)
      }
      // 输入框样式
      input.style.cssText = `
        position: absolute;
        top: ${y - font / 2 - 6}px;
        left: ${x - 6}px;
        height: ${font}px;
        width: ${font}px;
        min-width: ${font}px;
        padding: 4px;
        font-size: ${font}px;
        color: transparent;
        caret-color: ${contextStore.ctx.color};
        outline: none;
        border-radius: 4px;
        border: 2px solid ${contextStore.ctx.color};
        background-color: transparent;
        box-shadow: inset 0px 0px 5px 2px rgba(0, 0, 0, 0);
      `
      canvasRoot.value.appendChild(input)
    }

    /**
     * 重新绘制 pathStore 中的路径
     */
    reDraw () {
      this.pathStore.forEach(({ type, contextOptions, path }) => {
        if (path.text) {
          this.ctx.save()
          this.setContextOptions(contextOptions)
          this.ctx.fillText(path.text, path.x, path.y)
          this.ctx.restore()
        } else {
          this.type = type
          this.contextOptions = contextOptions
          this.path = path
          this.draw(true)
        }
        this.contextOptions = null
      })
    }

    /**
     * 橡皮擦
     * @param {*} x 鼠标移动时的x坐标
     * @param {*} y 鼠标移动时的y坐标
     */
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

    /**
     * 撤销上一次操作
     */
    revoke () {
      if (!this.pathStore.length) return
      this.clearCanvas()
      const delPath = this.pathStore.pop()
      this.revokePathStore.push(delPath)
      this.reDraw()
    }

    /**
     * 取消撤销
     */
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

    /**
     * 设置画笔样式
     * @param {*} options 画笔属性键值对 
     */
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
      // 考虑层级关系，越上面的越先被选取
      for (let i = this.pathStore.length - 1; i >= 0; i--) {
        const path = this.pathStore[i].path
        const rotatePoint = this.pathStore[i].rotatePoint
        const bones = this.pathStore[i].bones
        const contextOptions = this.pathStore[i].contextOptions
        // 计算位移后鼠标点击的位置
        const cot = contextOptions.translate || { x: 0, y: 0 }
        let x = movePoint ? movePoint.x - cot.x : this.startPoint.x - cot.x
        let y = movePoint ? movePoint.y - cot.y : this.startPoint.y - cot.y
        // 计算旋转后鼠标的位置
        const cor = contextOptions.rotate
        if (cor) {
          const distanceX = x - rotatePoint.x
          const distenceY = y - rotatePoint.y
          const distance = Math.pow(distanceX * distanceX + distenceY * distenceY, 1/2)
          // BUG 垂直时只有x为0才能被选中
          x = distanceX < 0 ? -distance : distance
          y = y - (Math.sin(cor) * (distanceX < 0 ? -distance : distance))
        }
        // 判断路径
        const isPointInPath = this.ctx.isPointInPath(path.text ? path.vPath : path, x, y)
        // 点击时设置骨架状态
        if (!movePoint) this.pathStore[i].isShowBones = isPointInPath
        if (this.pathStore[i].isShowBones) {
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

    /**
     * 路径绘制
     * @param {*} isPathStore 是否路径库中的路径
     */
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

    /**
     * 将当前路径保存到pathStore中
     */
    savePath () {
      if (!this.path) return
      this.pathStore.push({
        type: this.type,
        rotatePoint: this.rotatePoint, // 旋转原点
        contextOptions: this.contextOptions || {},
        path: this.path,
        bones: this.bones,
        isShowBones: false // 是否展示骨骼
      })
      this.path = null
      this.bones = []
      this.type = 'stroke'
      this.rotatePoint = null
      this.contextOptions = null
    }

  }

  return { Draw }
}
