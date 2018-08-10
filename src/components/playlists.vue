<template>
  <div :class="blockName | bemMods(mods)">
    <div :class="blockName | bemElement('header') | bemMods()">
      <div
        v-for="(value, key, index) of playlists"
        :key="key"
        :class="blockName | bemElement('playlist-title') | bemMods({ state: activePlaylistId === key ? 'active' : 'default'})"
        @click="setActivePlaylist(value)"
      >
        <template v-if="activePlaylistId === key">
          <!-- {{index}}. <input :value="value.name" onInput="" /> -->
          {{index}}.
          <span
            :class="blockName | bemElement('playlist-title-input') | bemMods()"
            contenteditable="true"
            @blur="updateTitle"
          >{{value.name}}</span>
        </template>
        <template v-else >
          {{index}}.
          <span
            :class="blockName | bemElement('playlist-title-input') | bemMods()"
          >{{value.name}}</span>
        </template>
      </div>
      <div
        :class="blockName | bemElement('playlist-title') | bemMods({ type: 'create' })"
      >
        <Icon name="add" :size="20" />
        <span
          :class="blockName | bemElement('playlist-title-input') | bemMods()"
          contenteditable="true"
          @focus="clearAddButtonText"
          @blur="createNewPlaylist"
        >Add</span>
      </div>
    </div>
    <div :class="blockName | bemElement('body') | bemMods()">
      <Playlist
        :model="player.activePlaylist"
        :class="blockName | bemElement('playlist') | bemMods()"
      />
    </div>
    <div :class="blockName | bemElement('footer') | bemMods()"></div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { State, Mutation } from 'vuex-class';

import { Button, Icon } from '@/components/core';
import Playlist from '@/components/playlist.vue';

@Component({
  components: { Button, Icon, Playlist },
})
export default class Playlists extends Vue {
  @Prop({ default: () => ({}) }) private mods!: Hash;

  @State('player') private player: ITrackCollection;
  @State('playlists') private playlists: ITrackCollection;

  private blockName: string = 'playlists';

  get activePlaylistId() {
    if (this.player.activePlaylist == null) return null;
    return this.player.activePlaylist.id;
  }

  @Mutation('setTitleToPlaylist') private setTitleToPlaylist: MutationMethod;
  @Mutation('createPlaylist') private createPlaylist: MutationMethod;
  @Mutation('updateActivePlaylist') private updateActivePlaylist: MutationMethod;

  private setActivePlaylist(playlist: IPlaylistData) {
    if (this.activePlaylistId === playlist.id) return;
    this.updateActivePlaylist(playlist);
  }

  private updateTitle(event: Event) {
    const title = (event.target as HTMLSpanElement).textContent;
    if (this.player.activePlaylist.name === title) return;
    this.setTitleToPlaylist({
      id: this.activePlaylistId,
      title,
    });
  }

  private createNewPlaylist(event: Event) {
    const title = (event.target as HTMLSpanElement).textContent;
    (event.target as HTMLSpanElement).textContent = 'Add';
    if (title.trim().length === 0) return;
    this.createPlaylist({
      title,
    });
  }

  private clearAddButtonText(event: Event) {
    requestAnimationFrame(() => {
      (event.target as HTMLSpanElement).textContent = '';
    });
  }
}
</script>

<style scoped lang="stylus">
.playlists
  grid-column 2
  display grid
  grid-template-rows 32px 1fr
  grid-template-columns 1fr
  overflow hidden

  padding 4px
  border-radius 2px

  &__header
    display flex

    overflow auto
    &::-webkit-scrollbar
      display none

  &__playlist-title
    display flex
    justify-content flex-start
    align-items center
    white-space nowrap

    width fit-content
    padding 4px 8px
    border 1px solid transparent
    border-bottom none

    cursor pointer
    &:hover
      background hsla(190, 100%, 50%, .1)
      box-shadow 0 0 8px -2px hsla(190, 100%, 50%, .4)
    &--state-active
      border 1px solid hsla(190, 100%, 50%, .4)
      border-bottom none
      border-radius 8px 8px 0 0
      box-shadow 0px -3px 4px 0px hsla(190, 100%, 50%, .4)
      &:hover
        box-shadow 0px -3px 4px 0px hsla(190, 100%, 50%, .4)
    &--type-create
      margin-right 16px

  &__playlist-title-input
    margin 0 2px -1px 2px

    display inline-block

    padding 0 4px
    border none
    border-bottom 1px solid transparent

    background hsla(0, 0%, 0%, 0)
    color inherit
    font inherit
    outline none
    &:focus
      border-color hsl(0, 100%, 50%)

</style>
