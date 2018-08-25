<template>
  <div :class="blockName | bemMods(mods)">
    <!-- HEADER -->
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Header extends Vue {
  @Prop({ default: () => ({}) })
  private mods!: Hash;

  private blockName: string = 'header';
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
.header
  height: 100%;
  width: 100%;

  // background: green
</style>
