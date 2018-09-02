<template>
  <div :class="blockName | bemMods(mods)" @click="$emit('click', $event)">
    <Icon v-if="icon" :library="iconNS" :name="icon"/>
    <span v-if="label" :class="blockName | bemElement('label') | bemMods()">{{label}}</span>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import Icon from './icon.vue';

@Component({
  components: { Icon },
})
export default class Button extends Vue {
  @Prop({ default: () => ({}) })
  private mods!: Hash;

  @Prop({ default: () => 'mdi' })
  private iconNS!: string;

  @Prop({ default: (): string => null })
  private icon!: string;

  @Prop({ default: (): string => null })
  private label!: string;

  private blockName: string = 'button';

}
</script>

<style scoped lang="stylus">
.button
  display grid
  grid-template-columns 1fr
  grid-template-rows 1fr
  justify-content center
  align-items center
  transform-origin center

  width 32px
  height 32px
  border-radius 100%

  cursor pointer

  &--hover-size
    transform scale(.8)
    transition transform .2s linear 0s
    &:hover
      transform scale(1)

  &--hover-bg
    transition background .4s linear 0s
    &:hover
      background hsla(0, 0%, 0%, .1)
  
  &--state-non-active
    opacity .6
  
  &--state-disabled
    opacity .6
    pointer-events none
  
  &--state-active
    opacity 1

  &__label
    font-size 14px


</style>
