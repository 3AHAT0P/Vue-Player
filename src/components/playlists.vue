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
          {{index}}.
          <span
            :class="blockName | bemElement('playlist-title-input') | bemMods()"
            contenteditable="true"
            @keydown.stop.prevent.enter="$event.target.blur()"
            @blur="updateTitle"
          >{{value.name}}</span>
        </template>
        <template v-else >
          {{index}}.
          <span
            :class="blockName | bemElement('playlist-title-input') | bemMods()"
            contenteditable="false"
          >{{value.name}}</span>
        </template>
      </div>
      <div
        :class="blockName | bemElement('playlist-title') | bemMods({ type: 'create' })"
        @click="focusSpan"
      >
        <Icon name="add" :size="20" />
        <span
          :class="blockName | bemElement('playlist-title-input') | bemMods()"
          contenteditable="true"
          @focus="clearAddButtonText"
          @blur="createNewPlaylist"
          @keydown.stop.prevent.enter="$event.target.blur()"
        >Add</span>
      </div>
    </div>
    <div :class="blockName | bemElement('body') | bemMods()">
      <Playlist
        :model="openedPlaylist"
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
import { promisify } from '@/utils';

@Component({
  components: { Button, Icon, Playlist },
})
export default class Playlists extends Vue {
  @Prop({ default: () => ({}) }) private mods!: Hash;

  @State('player') private player: IPlayerData;
  @State('playlists') private playlists: ITrackCollection;

  private blockName: string = 'playlists';

  private openedPlaylist: IPlaylistData = null;

  private get activePlaylistId() {
    if (this.openedPlaylist != null) return this.openedPlaylist.id;
    if (this.player.activePlaylist == null) return null;
    this.openedPlaylist = this.player.activePlaylist;
    return this.openedPlaylist.id;
  }

  @Mutation('setTitleToPlaylist') private setTitleToPlaylist: MutationMethod;
  @Mutation('createPlaylist') private createPlaylist: MutationMethod;
  @Mutation('updateActivePlaylist') private updateActivePlaylist: MutationMethod;

  private setActivePlaylist(playlist: IPlaylistData) {
    if (this.activePlaylistId === playlist.id) return;
    this.openedPlaylist = playlist;
    // this.updateActivePlaylist(playlist);
  }

  private updateTitle(event: Event) {
    const title = (event.target as HTMLSpanElement).textContent;
    if (this.player.activePlaylist.name === title) return;
    this.setTitleToPlaylist({
      id: this.activePlaylistId,
      title,
    });
  }

  private async createNewPlaylist(event: Event) {
    const title = (event.target as HTMLSpanElement).textContent;
    (event.target as HTMLSpanElement).textContent = 'Add';
    if (title.trim().length === 0) return;
    const playlist = await promisify(this.createPlaylist, {
      title,
    });
    this.setActivePlaylist(playlist);
  }

  private clearAddButtonText(event: Event) {
    requestAnimationFrame(() => {
      (event.target as HTMLSpanElement).textContent = '';
    });
  }

  private focusSpan(event: Event) {
    ((event.currentTarget as HTMLElement).lastElementChild as HTMLElement).focus();
  }
}
</script>

<style scoped lang="stylus">
.playlists
  grid-column 2
  display grid
  grid-template-rows 32px 1fr 32px
  grid-template-columns 1fr
  overflow hidden

  max-height 100%
  padding 4px
  border-radius 2px

  &__header
    z-index 2

    display flex

    overflow auto
    transform translate(0, 1px)
    &::-webkit-scrollbar
      display none
  
  &__body
    overflow hidden

    border 1px solid hsla(190, 100%, 50%, 0.4)

  &__playlist-title
    display flex
    justify-content flex-start
    align-items center
    white-space nowrap

    width fit-content
    padding 4px 8px
    border 1px solid transparent

    cursor pointer
    &:hover
      background hsla(190, 100%, 50%, .1)
      box-shadow 0 0 8px -2px hsla(190, 100%, 50%, .4)
    &--state-active
      border 1px solid hsla(190, 100%, 50%, .4)
      border-bottom-color hsl(0, 0%, 0%)
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
