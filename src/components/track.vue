<template>
  <div v-if="model != null" :class="blockName | bemMods(mods)" @click="onClick">
    <span v-if="mods.state === 'active'" :class="blockName | bemElement('background') | bemMods()"></span>
    <div :class="blockName | bemElement('index') | bemMods()">{{index}}.</div>
    <div :class="blockName | bemElement('title') | bemMods()">
      <template v-if="model.author != null">
        {{model.author}}&nbsp;-&nbsp;
      </template>
      {{model.name}}
    </div>
    <div :class="blockName | bemElement('duration') | bemMods()">{{model.duration | duration('s', 'MM:SS')}}</div>
    <Button
      :class="blockName | bemElement('delete') | bemMods()"
      :icon="'close'"
      :mods="{hover: 'size'}"
      @click.stop.prevent="onDelete" 
    />
    <div :class="blockName | bemElement('info') | bemMods()">
      {{model.type}} :: {{model.sampleRate}} kHz, {{model.bitrate}} kbps, {{model.size | fileSize}}
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { Button } from '@/components/core';

@Component({
  components: { Button },
})
export default class Track extends Vue {
  @Prop({ default: -1 }) private index: number;
  @Prop({ default: null }) private model: ITrackData;
  @Prop({ default: () => ({}) }) private mods!: Hash;

  private blockName: string = 'track';

  private onClick() {
    this.$emit('click');
  }

  private onDelete() {
    this.$emit('delete');
  }
}
</script>

<style scoped lang="stylus">
.track
  position relative
  display grid
  grid-template-rows 24px 16px
  grid-template-columns auto 1fr 1fr 1fr 1fr
  justify-items start
  align-items center
  overflow hidden

  padding 4px

  cursor pointer
  background hsla(0, 0%, 0%, .4)
  transition background .2s linear 0s, box-shadow .1s linear 0s

  &:hover
    background hsla(190, 100%, 50%, .1)
    box-shadow 0 0 8px -2px hsla(190, 100%, 50%, .4)

    .track__duration
      display none
    .track__delete
      display grid
  
  &__background
    position absolute
    top 50%
    left 50%
    transform translate(-50%, -50%)
    z-index 0

    width 20px
    height 20px
    border-radius 100%

    pointer-events none

    --pulseColor hsla(110, 100%, 50%, .4)
    --pulseColorAfter hsla(0, 100%, 50%, 0)

    animation-duration 2s
    animation-name radial-pulse
    animation-iteration-count infinite
    animation-timing-function linear
    animation-direction alternate

    &:after
      content ''
      position absolute
      top 50%
      left 50%
      transform translate(-50%, -50%)

      width 4px
      height 4px
      border-radius 100%

      --pulseColor hsla(250, 100%, 50%, 0.4)
      --pulseColorAfter hsla(0, 100%, 50%, 0)

      animation-duration 2s
      animation-delay .4s
      animation-name radial-pulse
      animation-iteration-count infinite
      animation-timing-function linear
      animation-direction alternate

  &__index
    padding-right 4px

  &__delete
    display none
    justify-self end

    opacity .6

    color hsl(0, 100%, 50%)
    transition-property opacity, transform
    &:hover
      opacity 1

  &__title
    grid-column-start 2
    grid-column-end 5

    overflow hidden
    text-overflow ellipsis

    max-width 100%
  
  &__duration
    justify-self end

  &__info
    grid-column-start 1
    grid-column-end 6

    font-size 12px

@keyframes radial-pulse
  0%
    width 0px
    height 0px
    box-shadow 0 0 10px 0px var(--pulseColor), inset 0 0 10px 0px var(--pulseColor)

  100%
    width 200px
    height 200px
    box-shadow 0 0 100px 100px var(--pulseColorAfter), inset 0 0 100px 100px var(--pulseColorAfter)


</style>
