<template>
  <div :class="blockName | bemMods(mods)">
    <Button :icon="icon" :class="blockName | bemElement('icon') | bemMods()" :mods="{hover: 'size'}" @click="toggleMute" />
    <div :class="blockName | bemElement('front') | bemMods()" @mousemove="change"  @mouseout="stopChanges">
      <Button :icon="icon" @click="toggleMute" />
      <div :class="blockName | bemElement('range') | bemMods()" @click="click" @mousedown="startChanges" @mouseup="stopChanges">
        <div :class="blockName | bemElement('track') | bemMods()" :style="{top: `${value * height}px`}"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Watch, Vue } from 'vue-property-decorator';

import { Button } from '@/components/core';

@Component({
  components: { Button },
})
export default class Volume extends Vue {
  @Prop({ default: () => ({}) }) private mods!: Hash;
  @Prop({ default: () => 1 }) private value!: number;

  private blockName: string = 'volume';
  private height: number = 100;
  private changeVolumeDynamicly: boolean = false;
  private mute: number = 0;
  private icon: 'volume_off'|'volume_mute'|'volume_down'|'volume_up' = 'volume_up';

  @Watch('value')
  private onValueChanged(val: number, oldVal: number) {
    if (val === 0) {
      this.icon = 'volume_off';
    } else if (val <= 0.3) {
      this.icon = 'volume_mute';
    } else if (0.3 < val && val <= 0.6) {
      this.icon = 'volume_down';
    } else {
      this.icon = 'volume_up';
    }
  }

  private click(event: any) {
    this.$emit('changed', Number((event.offsetY / this.height).toFixed(2)));
  }

  private change(event: any) {
    if (!this.changeVolumeDynamicly) return;
    this.$emit('changed', Number((event.offsetY / this.height).toFixed(2)));
  }

  private startChanges(event: any) {
    this.changeVolumeDynamicly = true;
  }

  private stopChanges(event: any) {
    this.changeVolumeDynamicly = false;
  }

  private toggleMute(event: any) {
    if (this.mute === 0) {
      this.mute = this.value;
      this.$emit('changed', 0);
    } else {
      this.$emit('changed', this.mute);
      this.mute = 0;
    }
  }
}
</script>

<style scoped lang="stylus">
.volume
  position relative
  display grid
  width 32px
  &:hover
    & .volume__icon
      visibility hidden
      opacity 0
      transition opacity .4s linear 0s, visibility 0s linear .4s 
    & .volume__front
      visibility visible
      opacity 1
      transition visibility 0s linear 0s, opacity .4s linear 0s 
  &__icon
    transition visibility 0s linear 0s, opacity .4s linear 1s
  &__front
    position fixed
    z-index 100
    display grid
    grid-template-columns auto
    grid-template-rows 32px 132px
    justify-content center
    align-items center
    visibility hidden
    background hsla(0, 0%, 0%, .4)
    opacity 0
    transition opacity .4s linear 1s, visibility 0s linear 1.8s
  &__range
    position relative
    margin 16px auto
    display grid
    width 8px
    height 100px
    border-radius 8px
    background linear-gradient(to right, hsla(120, 100%, 25%, 0.4) 0%,hsla(120, 100% ,25% ,0) 50%,hsla(120, 100%, 25%, .4) 100%)
    box-shadow 0 0 4px 2px hsla(120,100%,25%,0.2)
    cursor pointer
  &__fill
    position relative
    height 100px
    border-radius 8px
    background hsla(200, 70%, 60%, 0.4)
  &__track
    position absolute
    top 0
    left 50%
    transform translate(-50%, -50%)
    width 24px
    height 8px
    border-radius 4px
    background hsl(200, 70%, 50%)
    pointer-events none

</style>
