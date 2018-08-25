<template>
  <span
    contenteditable="true"
    :class="blockName | bemMods(mods)"
    @input="onInput"
    @blur="onBlur"
  >{{value}}</span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Input extends Vue {
  @Prop({ default: () => ({}) })
  private mods!: Hash;

  @Prop({ default: (): string => null })
  private value!: string;

  private blockName: string = 'input';

  private onInput(event: Event) {
    this.$emit('input', (event.target as HTMLSpanElement).textContent);
  }

  private onBlur(event: Event) {
    this.$emit('blur', event);
    this.$emit('changed', (event.target as HTMLSpanElement).textContent);
  }

}
</script>

<style scoped lang="stylus">
.input
  display inline-block

  padding 0 4px
  border none
  border-bottom 1px solid transparent

  background hsla(0, 0%, 0%, 0)
  outline none
  &:focus
    border-color hsl(0, 100%, 50%)


</style>
