<template>
  <div :class="blockName | bemMods(mods)">
    <div :class="blockName | bemElement('track-info') | bemMods()">.:: 02:03 :: - Track Name :: Type :: 44.1 kHz, Bitrate kbps, Size Mb ::.</div>
    <div :class="blockName | bemElement('display') | bemMods()"></div>
    <div :class="blockName | bemElement('progress') | bemMods()"></div>
    <div :class="blockName | bemElement('controls') | bemMods()">
      <Button icon='play_arrow'/>
      <Button icon='pause'/>
      <Button icon='stop'/>
      <Button icon='skip_previous'/>
      <Button icon='skip_next'/>
      <Button icon='shuffle'/>
      <Button icon='repeat'/>
      <Button icon='repeat_one'/>
      <Button icon='volume_up'/>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import { Button } from '@/components/core';

@Component({
  components: { Button },
})
export default class Player extends Vue {
  @Prop({ default: () => ({}) }) private mods!: Hash;

  private blockName: string = 'player';
}
</script>

<style scoped lang="stylus">
.playlist
  grid-column: 2
  display grid
  grid-template-rows 16px 1fr 12px 32px
  grid-template-columns 100%
  overflow hidden

  padding 4px
  border-radius 16px

  &__track-info
    display grid
    align-items center
    justify-content flex-start
    white-space nowrap

    width fit-content

    font-size 12px

    animation-duration 6s
    animation-name slidein
    animation-iteration-count infinite
    animation-timing-function linear
    animation-direction alternate
  
  &__controls
    display grid
    grid-template-rows 100%
    grid-auto-flow column

@keyframes slidein {
  0% {
    transform translateX(0)
  }

  20% {
    transform translateX(0)
  }

  80% {
    transform translateX(calc(-100% + 400px - 8px))
  }

  100% {
    transform translateX(calc(-100% + 400px - 8px))
  }
}
</style>
