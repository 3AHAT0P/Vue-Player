<template>
  <i :class="blockName | bemMods({library, size})">{{name}}</i>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Icon extends Vue {
  @Prop({ default: () => ({}) })
  private mods!: Hash;

  @Prop({ default: () => 'mdi' })
  private library!: string;

  @Prop({ default: (): string => null })
  private name!: string;

  @Prop({ default: () => 24 })
  private size!: number;

  private blockName: string = 'icon';

}
</script>

<style scoped lang="stylus">
.icon
  font-weight normal
  font-style normal
  font-size 24px  /* Preferred icon size */
  display inline-block
  line-height 1
  text-transform none
  letter-spacing normal
  word-wrap normal
  white-space nowrap
  direction ltr

  /* Support for all WebKit browsers. */
  -webkit-font-smoothing antialiased
  /* Support for Safari and Chrome. */
  text-rendering optimizeLegibility

  /* Support for Firefox. */
  -moz-osx-font-smoothing grayscale

  /* Support for IE. */
  font-feature-settings 'liga'
  &--library-mdi
    font-family 'Material Icons'
  &--size-
    &20
      font-size 20px
    &24
      font-size 24px
    &48
      font-size 48px


</style>
