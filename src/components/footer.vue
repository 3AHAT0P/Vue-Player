<template>
  <div :class="blockName | bemMods(mods)">
    <!-- Footer -->
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class Footer extends Vue {
  @Prop({ default: () => ({}) })
  private mods!: Hash;

  private blockName: string = 'footer';
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="stylus">
.footer
  height: 100%;
  width: 100%;

  // background: green
</style>
