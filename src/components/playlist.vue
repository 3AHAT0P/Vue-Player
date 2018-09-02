<template>
  <div :class="blockName | bemMods(mods)">
    <div :class="blockName | bemElement('header') | bemMods()">
      <div :class="blockName | bemElement('total-count') | bemMods()">{{count}}</div>
      <div :class="blockName | bemElement('total-duration') | bemMods()">{{duration | duration('s', 'DD:HH:MM:SS')}}</div>
      <div :class="blockName | bemElement('total-size') | bemMods()">{{size | fileSize}}</div>
    </div>
    <div :class="blockName | bemElement('track-list') | bemMods()">
      <template v-if="model != null">
        <Track
          v-for="(value, index) in tracks"
          :key="value.data.id"
          :index="index + 1"
          :model="value.data"
          :class="blockName | bemElement('track-item') | bemMods()"
          :mods="{state: (currentTrack != null && currentTrack.id === value.data.id) ? 'active' : 'default'}"
          @click="selectTrack(value)"
          @delete="removeTrack(value)"
        />
      </template>
    </div>
    <div :class="blockName | bemElement('footer') | bemMods()">
      <Button icon="add" :mods="{hover: 'size'}" @click="load"/>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { State, Getter, Mutation, Action } from 'vuex-class';

import { Button } from '@/components/core';
import Track from '@/components/track.vue';
import { promisify } from '@/utils';

@Component({
  components: { Button, Track },
})
export default class Playlist extends Vue {
  @Prop({ default: () => ({}) }) private model: IPlaylistData;
  @Prop({ default: () => ({}) }) private mods!: Hash;

  @State('player') private player: IPlayerData;

  private blockName: string = 'playlist';

  @Getter('Player::currentTrack') private currentTrack: ITrackData;

  private get tracks() {
    if (this.model.trackList.first == null) return [];
    let node = this.model.trackList.first;
    const res = [node];
    while (node.next != null) {
      res.push(node.next);
      node = node.next;
    }
    return res;
  }

  @Action('createTrack') private createTrack: MutationMethod;
  @Mutation('addTracksToPlaylist') private addTracksToPlaylist: MutationMethod;
  @Mutation('removeTracksFromPlaylist') private removeTracksFromPlaylist: MutationMethod;
  @Mutation('updateCursor') private updateCursor: MutationMethod;
  @Mutation('updateActivePlaylist') private updateActivePlaylist: MutationMethod;

  private async load() {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'audio/*';
    input.onchange = async (event) => {
      const tracks = [];
      for (const file of (event.target as any).files) {
        tracks.push(await promisify(this.createTrack, { file }));
      }
      this.addTracksToPlaylist({ id: this.model.id, tracks });
    };
    input.click();
  }

  private selectTrack(node: ITrackNode) {
    if (
      this.player.activePlaylist != null &&
      this.player.activePlaylist.id !== this.model.id
    ) this.updateActivePlaylist(this.model);
    this.updateCursor({id: this.model.id, node});
  }

  private removeTrack(node: ITrackNode) {
    this.removeTracksFromPlaylist({id: this.model.id, node});
  }

  get count() {
    if (this.model == null) return 0;
    return this.model.count;
  }

  get duration() {
    if (this.model == null) return 0;
    return this.model.duration;
  }

  get size() {
    if (this.model == null) return 0;
    return this.model.size;
  }
}
</script>

<style scoped lang="stylus">
.playlist
  display grid
  grid-template-rows 16px minmax(48px, 1fr) 32px
  grid-template-columns 100%
  overflow hidden

  max-height 100%
  padding 4px
  border-radius 4px

  background hsla(0, 0%, 0%, .4)
  &__header
    position relative

    display flex

    font-size 12px
    box-shadow inset 0px 22px 16px -20px hsla(0, 0%, 100%, 0.2), inset 0px -22px 16px -20px hsla(0, 0%, 100%, 0.2)
    &:after
      // content ''

      position absolute
      right 0
      bottom -4px
      left 0

      width 100%
      height 4px
      border-radius 4px

      background hsla(0, 100%, 100%, .2)
      box-shadow inset 0px 1px 2px 0px hsla(0, 0%, 0%, .4)
  
  &__track-list
    overflow auto

  &__total-count
  &__total-duration
  &__total-size
    padding 0 4px


</style>
