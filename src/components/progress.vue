<template>
  <div :class="blockName | bemMods(mods)" @click="click" @mousedown.passive="startChanges">
    <div :class="blockName | bemElement('back') | bemMods()"></div>
    <div :class="blockName | bemElement('cache') | bemMods()" :style="{width: `${cacheProgress * width}px`}"></div>
    <div :class="blockName | bemElement('front') | bemMods()" :style="{width: `${playProgress * width}px`}"></div>
    <div :class="blockName | bemElement('track') | bemMods()" :style="{left: `${playProgress * width}px`}"></div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { throttle } from '@/utils/decorators';

@Component
export default class Progress extends Vue {
  @Prop({ default: () => ({}) }) private mods!: Hash;
  @Prop({ default: () => 0 }) private cacheProgress!: number;
  @Prop({ default: () => 0 }) private playProgress!: number;

  private blockName: string = 'progress';
  private width: number = 0;
  private allowChangesOnMouseMove: boolean = false;

  private mounted() {
    this.width = this.$el.offsetWidth;
    this.mouseMove = this.mouseMove.bind(this);
    this.stopChanges = this.stopChanges.bind(this);
  }

  private click(event: any) {
    this.updateValue(event.offsetX / this.width);
  }

  private startChanges(event: any) {
    window.addEventListener('mousemove', this.mouseMove, { passive: true });
    window.addEventListener('mouseup', this.stopChanges, { passive: true });
  }

  private mouseMove(event: any) {
    this.updateValue((event.x - this.$el.getBoundingClientRect().left) / this.width);
  }

  private stopChanges() {
    window.removeEventListener('mousemove', this.mouseMove);
  }

  @throttle(32)
  private updateValue(value: number) {
    if (value < 0) value = 0;
    this.$emit('changed', value);
  }
}
</script>

<style scoped lang="stylus">
.progress
  position relative

  display grid

  padding 2px 0

  cursor pointer
  &__back
    width 100%
    height 4px
    border-radius 8px
    background linear-gradient(to bottom, hsla(120, 100%, 25%, 0.4) 0%,hsla(120,100%,25%,0.2) 50%,hsla(120, 100%, 25%, .4) 100%)
    box-shadow 0 0 4px 2px hsla(120,100%,25%,0.2)
  &__cache
    position absolute
    top 2px
    width 0
    height 4px
    border-radius 8px
    background hsla(200, 70%, 60%, 0.4)
  &__front
    position absolute
    top 2px
    width 0
    height 4px
    border-radius 8px
    background hsl(200, 60%, 50%)
  &__track
    position absolute
    top 0
    left 0
    transform translateX(-50%)
    width 24px
    height 8px
    border-radius 4px
    background hsl(200, 70%, 50%)
    pointer-events none

</style>
