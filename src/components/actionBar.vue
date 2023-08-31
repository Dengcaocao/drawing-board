<template>
  <aside class="aside" ref="aside">
    <input
      class="line-width"
      type="range"
      v-model="stroe.ctx.lineWidth"
      :max="maxWidth"
      :style="{
        width: rangeWidth,
        'background-image': `linear-gradient(to right, #91caff ${stroe.ctx.lineWidth / maxWidth * 100 + '%'}, transparent ${stroe.ctx.lineWidth / 100 * 100 + '%'})`
      }"
      @change="handleChange('lineWidth', $event.target.value)">
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
      @click.stop="handleChange('mode', item.type)">
    </div>
  </aside>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useContext } from '@/stores/context'

const props = defineProps({
  handleDownload: {
    type: Function,
    required: true
  }
})

const stroe = useContext()

const aside = ref(null)
const maxWidth = ref(50)
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
    icon: 'icon-rubber-full',
    type: 'clear'
  },
  {
    icon: 'icon-xiazai-',
    type: 'download'
  }
])

const rangeWidth = computed(() => {
  if (!aside.value) return 0
  return getComputedStyle(aside.value).height
})

const handleChange = (fileds, value) => {
  if (value === 'download') return props.handleDownload()
  stroe.updateCtx(fileds, value)
}
</script>

<style>
.aside {
  position: absolute;
  top: 50%;
  left: 20px;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 12px;
  border-radius: 10px;
  background-color: #fff;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
              0 6px 16px 0px rgba(0, 0, 0, 0.08),
              0 9px 28px 8px rgba(0, 0, 0, 0.05);
}
.aside .item {
  width: 20px;
  height: 20px;
  padding: 4px;
  border-radius: 4px;
  font-size: 20px;
  cursor: pointer;
}
.aside .item:not(:nth-child(2)) {
  margin-top: 15px;
}
.aside .item:hover,
.item.active {
  background-color: rgba(0, 0, 0, 0.03);
}
.item>.color {
  display: block;
  width: 100%;
  height: 100%;
}
.line-width {
  position: absolute;
  top: 12px;
  left: 52px;
  transform-origin: left center;
  transform: rotate(90deg);
  width: 1px;
  height: 1px;
  -webkit-appearance: none;
}
.line-width::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 15px;
  height: 15px;
  background-color: #fff;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16),
              0 3px 6px 0px rgba(0, 0, 0, 0.12),
              0 4px 12px 4px rgba(0, 0, 0, 0.09);
}
</style>
