<template>
  <div :class="blockName | bemMods(mods)">
    <div :class="blockName | bemElement('track-info') | bemMods()">
      <template v-if="currentTrack != null">
        .:: {{currentTrack.duration | duration('s', 'MM:SS')}} ::
        - {{currentTrack.name}} ::
        {{currentTrack.type}} ::
        {{currentTrack.sampleRate}} kHz, {{currentTrack.bitrate}} kbps, {{currentTrack.size | fileSize}}
        ::.
      </template>
    </div>
    <div :class="blockName | bemElement('display') | bemMods()">
      {{state.currentSecond | duration('s', 'MM:SS')}}
      <Visualiser v-if="analyser != null" :analyser="analyser" :width="200" :height="30" :displayBins="64"/>
    </div>
    <div :class="blockName | bemElement('progress') | bemMods()">
      <Progress :cacheProgress="cacheProgress" :playProgress="playProgress" @changed="seekPercent"/>
    </div>
    <div :class="blockName | bemElement('controls') | bemMods()">
      <Button :icon="isPlaying ? 'pause' : 'play_arrow'" :mods="{hover: 'size', state: (currentTrack ? 'default' : 'non-active')}" @click="togglePlay"/>
      <Button icon="stop" :mods="{hover: 'size'}" @click="stop"/>
      <Button icon="skip_previous" :mods="{hover: 'size'}" @click="prev"/>
      <Button icon="skip_next" :mods="{hover: 'size'}" @click="next"/>
      <Button icon="shuffle" :mods="{hover: 'size', state: (state.isShuffle ? 'active' : 'non-active')}" @click="toggleShuffleMode"/>
      <Button
        :icon="state.isRepeat > 1 ? 'repeat_one' : 'repeat'"
        :mods="{hover: 'size', state: (state.isRepeat > 0 ? 'active' : 'non-active')}"
        @click="nextRepeatMode"
      />
      <Volume :value="state.volume" @changed="updateVolume"/>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { State, Getter, Mutation } from 'vuex-class';

import { Button } from '@/components/core';
import Progress from '@/components/progress.vue';
import Visualiser from '@/components/visualiser.vue';
import Volume from '@/components/volume.vue';
import playlist from '@/store/mutations/playlist';
import { promisify } from '@/utils';

@Component({
  components: { Button, Progress, Visualiser, Volume },
})
export default class Player extends Vue {
  @Prop({ default: () => ({}) }) private mods!: Hash;

  private blockName: string = 'player';

  private cacheProgress: number = 0;
  private isPlaying: boolean = false;

  private audio: HTMLAudioElement = null;
  private ctx: AudioContext = null;
  private analyser: AnalyserNode = null;
  private scriptProcessor: ScriptProcessorNode = null;
  private gainNode: GainNode = null;
  private source: MediaElementAudioSourceNode = null;

  @State('player') private state: IPlayerData;
  @State('playlists') private playlists: IPlaylistCollection;

  @Getter('Player::currentTrack') private currentTrack: ITrackData;

  get playProgress() {
    if (this.currentTrack == null) return 0;
    try {
      const progress = this.state.currentSecond / this.currentTrack.duration;
      return isNaN(progress) ? 0 : progress;
    } catch (e) {
      return 0;
    }
  }

  @Mutation('updateActivePlaylist') private updateActivePlaylist: MutationMethod;
  @Mutation('updateState') private updateState: MutationMethod;
  @Mutation('playingTick') private playingTick: MutationMethod;
  @Mutation('updateVolume') private updateVolume: MutationMethod;
  @Mutation('nextRepeatMode') private nextRepeatMode: MutationMethod;
  @Mutation('toggleShuffleMode') private toggleShuffleMode: MutationMethod;
  @Mutation('patchTrack') private patchTrack: MutationMethod;
  @Mutation('createPlaylist') private createPlaylist: MutationMethod;
  @Mutation('addTracksToPlaylist') private addTracksToPlaylist: MutationMethod;
  @Mutation('getNextTrack') private getNextTrack: MutationMethod;
  @Mutation('getPrevTrack') private getPrevTrack: MutationMethod;
  @Mutation('recalcSizeAndDuration') private recalcSizeAndDuration: MutationMethod;

  @Watch('state.volume')
  private onVolumeChange(value: number) {
    this.audio.volume = value;
  }

  @Watch('state.status')
  private onStatusChange(value: PlayerStatus) {
    this.isPlaying = value === 'isPlaying';
  }

  @Watch('currentTrack')
  private onTrackChange() {
    this.audio.src = this.currentTrack.source;
    this.play();
  }

  private created() {
    this.onTimeUpdate = this.onTimeUpdate.bind(this);
    this.onDurationChange = this.onDurationChange.bind(this);
    this.onAudioEnd = this.onAudioEnd.bind(this);
  }

  private async mounted() {
    this.initAudio();

    const mainPlaylist = Object.values(this.playlists).pop() ||
      await promisify(this.createPlaylist, { title: 'default' });

    if (this.state.activePlaylist == null) this.updateActivePlaylist(mainPlaylist);
  }

  private initAudio() {
    this.audio = document.createElement('audio');
    this.audio.preload = 'metadata';
    this.ctx = new AudioContext();

    this.source = this.ctx.createMediaElementSource(this.audio);
    this.scriptProcessor = this.ctx.createScriptProcessor(16 * 1024, 1, 1);
    this.gainNode = this.ctx.createGain();

    this.analyser = this.ctx.createAnalyser();

    this.source.connect(this.analyser);
    // this.source.connect(this.scriptProcessor);
    this.analyser.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.ctx.destination);
    // this.gainNode.connect(this.ctx.destination);
    this.source.connect(this.ctx.destination);
    // this.analyser.connect(this.ctx.destination);

    // this.scriptProcessor.addEventListener('audioprocess', this.onAudioProcess)
    this.audio.addEventListener('timeupdate', this.onTimeUpdate);
    this.audio.addEventListener('ended', this.onAudioEnd);
    if (this.currentTrack != null) {
      this.audio.src = this.currentTrack.source;
      this.audio.currentTime = this.state.currentSecond;
    }
  }

  private onTimeUpdate(event: Event) {
    const time = Math.round(this.audio.currentTime);
    if (this.state.currentSecond !== time) this.playingTick(time);
  }

  private async onAudioEnd(event: Event) {
    if (this.state.isRepeat === 2) {
      this.audio.currentTime = 0;
      this.play();
    } else {
      this.next();
    }
  }

  private async play() {
    if (this.audio.src != null) {
      this.audio.play();
      if (this.state.status !== 'isPlaying') this.updateState('isPlaying');
    }
  }

  private async togglePlay() {
    if (this.audio.src != null) {
      if (this.isPlaying) {
        this.audio.pause();
        this.updateState('isPaused');
      } else {
        this.play();
      }
    }
  }

  private stop() {
    this.audio.pause();
    this.updateState('isStopped');
    this.audio.currentTime = 0;
  }

  private seekPercent(percent: number) {
    this.audio.currentTime = percent * this.currentTrack.duration;
  }

  private async next() {
    const track = await promisify(
      this.getNextTrack,
      {
        id: this.state.activePlaylist.id,
        isRepeatList: this.state.isRepeat === 1,
        isRandom: this.state.isShuffle,
      },
    );
    if (track == null) {
      this.stop();
    } else if (this.state.status === 'isPlaying') {
      this.audio.src = track.source;
      this.audio.play();
    }
  }

  private async prev() {
    const track = await promisify(
      this.getPrevTrack,
      {
        id: this.state.activePlaylist.id,
        isRepeatList: this.state.isRepeat === 1,
        isRandom: this.state.isShuffle,
      },
    );
    if (this.state.status === 'isPlaying') {
      this.audio.src = track.source;
      this.audio.play();
    }
  }
}
</script>

<style scoped lang="stylus">
.player
  position relative
  grid-column 2

  display grid
  grid-template-rows 16px 30px 8px 32px
  grid-template-columns 100%
  overflow hidden

  padding 4px
  // border 1px solid hsla(240, 100%, 50%, .4)
  border-radius 16px

  background hsla(0, 0%, 0%, .4)
  cursor default
  user-select none

  &__track-info
    display grid
    align-items center
    justify-content flex-start
    white-space nowrap

    width fit-content

    font-size 12px

    animation-duration 6s
    animation-name slidein
    animation-iteration-count infinite
    animation-timing-function linear
    animation-direction alternate
  
  &__controls
    display grid
    grid-template-rows 100%
    grid-auto-flow column
  
  &__display
    font-family "digital-7-mono"
    font-size 32px
    justify-content space-between
    align-items center
    display grid
    grid-template-columns auto auto
    grid-template-rows 100%
    padding 4px
  
  &__progress
    display grid
    padding 0 8px

@keyframes slidein {
  0% {
    transform translateX(0)
  }

  20% {
    transform translateX(0)
  }

  80% {
    transform translateX(calc(-100% + 300px - 8px))
  }

  100% {
    transform translateX(calc(-100% + 300px - 8px))
  }
}
</style>
