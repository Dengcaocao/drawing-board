<template>
  <aside class="aside">
    <div
      class="item iconfont"
      v-for="item in actionType"
      :key="item.type"
      :class="[item.icon, stroe.ctx.mode === item.type ? 'active' : '']"
      @click="changeType(item.type)">
    </div>
  </aside>
</template>

<script setup>
import { reactive } from 'vue'
import { useContext } from '@/stores/context'

const stroe = useContext()

const actionType = reactive([
  {
    icon: 'icon-Icon_huabi',
    type: 'line'
  },
  {
    icon: 'icon-weixuanzhongyuanquan',
    type: 'arc'
  },
  {
    icon: 'icon-juxing',
    type: 'rect'
  },
  {
    icon: 'icon-rubber-full',
    type: 'clear'
  }
])

const changeType = type => {
  // stroe.mode = type
  stroe.handleCtx(type)
  console.log(stroe.ctx.mode)
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
  box-shadow: 0 6px 16px -8px rgba(0, 0, 0, 0.08)
              0 9px 28px 0px rgba(0, 0, 0, 0.05)
              0 12px 48px 16px rgba(0, 0, 0, 0.03);
}
.aside .item {
  width: 20px;
  height: 20px;
  padding: 4px;
  border-radius: 4px;
  font-size: 20px;
  cursor: pointer;
}
.aside .item:not(:nth-child(1)) {
  margin-top: 15px;
}
.aside .item:hover,
.item.active {
  background-color: rgba(0, 0, 0, 0.03);
}
</style>
