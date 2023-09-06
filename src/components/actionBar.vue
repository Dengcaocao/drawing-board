<template>
  <aside class="aside">
    <div class="tabbar-box" :class="{collapsed: isCoolapsed}">
      <div ref="tabbar" class="tabbar" :style="{'max-height': `${tabbarMaxHeight}px`}">
        <input
          class="line-width"
          type="range"
          v-model="stroe.ctx.lineWidth"
          :max="maxRangeWidth"
          :style="{
            width: `${rangeWidth}px`,
            'background-image': `linear-gradient(to right, #91caff ${stroe.ctx.lineWidth / maxRangeWidth * 100 + '%'}, transparent ${stroe.ctx.lineWidth / 100 * 100 + '%'})`
          }"
          @change="handleChange('lineWidth', $event.target.value)">
        <div
          class="item iconfont icon-wangge"
          :class="{'hide-grid': !stroe.isGrid}"
          @click="stroe.updateIsGrid">
        </div>
        <div class="item">
          <input
            class="color"
            type="color"
            v-model="stroe.ctx.color"
            @change="handleChange('color', $event.target.value)">
        </div>
        <div
          class="item iconfont"
          v-for="item in actionType"
          :key="item.type"
          :class="[item.icon, stroe.ctx.mode === item.type ? 'active' : '']"
          :style="{transform: item.type === 'forward' && 'scaleX(-1)'}"
          @click.stop="handleChange('mode', item.type)">
        </div>
      </div>
    </div>
    <div
      class="collapsed-btn iconfont icon-jiantou_yemian_xiangzuo_o"
      :class="{overturn: isCoolapsed}"
      @click="isCoolapsed = !isCoolapsed">
    </div>
  </aside>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref, nextTick } from 'vue'
import { useContext } from '@/stores/context'

const props = defineProps({
  actions: {
    type: Object,
    required: true
  }
})

const stroe = useContext()

const tabbar = ref()
const isCoolapsed = ref(false)
const tabbarMaxHeight = ref(0)
const rangeWidth = ref(0)
const maxRangeWidth = ref(50)
const actionType = reactive([
  {
    icon: 'icon-juxing1',
    type: 'rect'
  },
  {
    icon: 'icon-yuanxingweixuanzhong',
    type: 'arc'
  },
  {
    icon: 'icon-jiantou_youshang',
    type: 'mark'
  },
  {
    icon: 'icon-Icon_huabi',
    type: 'line'
  },
  {
    icon: 'icon-wenzi',
    type: 'text'
  },
  {
    icon: 'icon-chexiao',
    type: 'revoke'
  },
  {
    icon: 'icon-chexiao',
    type: 'forward'
  },
  {
    icon: 'icon-rubber-full',
    type: 'clear'
  },
  {
    icon: 'icon-xuanze',
    type: 'pick'
  },
  {
    icon: 'icon-xiazai-',
    type: 'download'
  }
])

const setRangeWidth = () => {
  rangeWidth.value = parseInt(getComputedStyle(tabbar.value).height) - 20
}

const setTabbarMaxHeight = () => {
  // 上下边距20
  tabbarMaxHeight.value = window.innerHeight - 40
}

const handleChange = (fileds, value) => {
  if (['revoke', 'forward', 'download'].includes(value)) {
    return props.actions[value]()
  }
  stroe.updateCtx(fileds, value)
}

const init = () => {
  setTabbarMaxHeight()
  nextTick(() => {
    setRangeWidth()
  })
}

onMounted(() => {
  init()
  window.addEventListener('resize', init)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', init)
})
</script>

<style>
.collapsed-btn {
  position: fixed;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  font-size: 28px;
  color: rgba(0, 0, 0, 0.5);
  cursor: pointer;
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.6);
  transition: .2s;
  animation: aCollapsed .5s infinite alternate;
}
.collapsed-btn.overturn {
  transform: translateY(-50%) rotate(180deg);
}
.collapsed-btn:hover {
  color: rgba(0, 0, 0, 0.6);
}
@keyframes aCollapsed {
  0% {
    left: 0;
  }
  100% {
    left: -6px;
  }
}
.aside .tabbar-box {
  position: fixed;
  top: 50%;
  left: 30px;
  transition: .2s;
  transform: translateY(-50%);
}
.tabbar-box.collapsed {
  left: 0;
  transform: translate(-100%, -50%);
}
.tabbar-box .tabbar {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 0.12rem;
  box-sizing: border-box;
  border-radius: 0.1rem;
  background-color: #fff;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
              0 6px 16px 0px rgba(0, 0, 0, 0.08),
              0 9px 28px 8px rgba(0, 0, 0, 0.05);
}
.tabbar .item {
  flex-shrink: 0;
  width: 0.2rem;
  height: 0.2rem;
  padding: 0.04rem;
  border-radius: 0.04rem;
  font-size: 0.2rem;
  cursor: pointer;
}
.tabbar .item:not(:nth-child(2)) {
  margin-top: 0.15rem;
}
.tabbar .item:hover,
.item.active {
  background-color: rgba(0, 0, 0, 0.03);
}
.item>.color {
  display: block;
  width: 100%;
  height: 100%;
  flex-shrink: 0;
}
.line-width {
  position: absolute;
  top: 0.1rem;
  left: 0.52rem;
  transform-origin: left center;
  transform: rotate(90deg);
  height: 1px;
  -webkit-appearance: none;
}
.line-width::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 0.15rem;
  height: 0.15rem;
  background-color: #fff;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16),
              0 3px 6px 0px rgba(0, 0, 0, 0.12),
              0 4px 12px 4px rgba(0, 0, 0, 0.09);
}
.item.hide-grid {
  position: relative;
}
.item.hide-grid::after {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 85%;
  height: 85%;
  content: '';
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background-image: linear-gradient(to bottom left, transparent 51%, gray 51%, gray 55%, transparent 55%);
}
/* 适配移动设备 */
@media only screen and (max-width: 750px) {
  html,body {
    font-size: 66px;
  }
}

/* 适配PC设备 */
@media only screen and (min-width: 751px) {
  html,body {
    font-size: 100px;
  }
}

</style>
