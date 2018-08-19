<template>
  <div :class="blockName | bemMods(mods)">
    <div  :class="blockName | bemElement('header') | bemMods(headerMods)">
      <slot name="header"></slot>
    </div>
    <div  :class="blockName | bemElement('body') | bemMods(bodyMods)">
      <slot></slot>
    </div>
    <div  :class="blockName | bemElement('footer') | bemMods(footerMods)">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Layout extends Vue {
  @Prop({ default: () => ({}) })
  private mods!: Hash;

  @Prop({ default: () => ({}) })
  private headerMods!: Hash;

  @Prop({ default: () => ({}) })
  private bodyMods!: Hash;

  @Prop({ default: () => ({}) })
  private footerMods!: Hash;

  private blockName: string = 'layout';
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
.layout
  display grid
  grid-template-rows 64px 1fr 64px

  height 100%
  width 100%

  overflow hidden
  &__header
    display grid
  &__body
    display grid

    overflow hidden
  &__footer
    display grid

</style>
