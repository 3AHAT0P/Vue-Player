<template>
  <div :class="blockName">
    <Player />
    <Playlists />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { Player, Playlists } from '@/components';

@Component({
  components: {
    Player, Playlists,
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
  grid-template-rows auto 1fr
  justify-items stretch
  align-items start

</style>

