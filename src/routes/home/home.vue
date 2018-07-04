<template>
  <div :class="blockName">
    <Player/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { Player } from '@/components';

@Component({
  components: {
    Player,
  },
})
export default class Home extends Vue {
  private blockName: string = 'home-page';
}
</script>

<style scoped lang="stylus">
.home-page
  display grid
  grid-template-columns 1fr 300px 1fr
  // grid-template-rows 200px 100px
  align-items center

</style>

