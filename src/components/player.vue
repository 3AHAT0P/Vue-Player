<template>
  <div :class="blockName | bemMods(mods)">
    <div :class="blockName | bemElement('track-info') | bemMods()">
      <template v-if="state.track">
        .:: {{state.track.duration | duration('s', 'MM:SS')}} ::
        - {{state.track.name}} ::
        {{state.track.type}} ::
        {{state.track.sampleRate}} kHz, {{state.track.bitrate}} kbps, {{state.track.size}} Mb
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
      <Button icon="eject" :mods="{hover: 'size'}" @click="load"/>
      <Button :icon="isPlaying ? 'pause' : 'play_arrow'" :mods="{hover: 'size', state: (state.track ? 'default' : 'non-active')}" @click="togglePlay"/>
      <Button icon="stop" :mods="{hover: 'size'}" @click="stop"/>
      <Button icon="skip_previous" :mods="{hover: 'size'}"/>
      <Button icon="skip_next" :mods="{hover: 'size'}"/>
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
import { MutationMethod } from 'vuex';
import { State, Mutation } from 'vuex-class';

import { Button } from '@/components/core';
import Progress from '@/components/progress.vue';
import Visualiser from '@/components/visualiser.vue';
import Volume from '@/components/volume.vue';

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

  get playProgress() {
    if (this.state.track == null) return 0;
    try {
      const progress = this.state.currentSecond / this.state.track.duration;
      return isNaN(progress) ? 0 : progress;
    } catch (e) {
      return 0;
    }
  }

  @Mutation('updateTrack') private updateTrack: MutationMethod;
  @Mutation('updateState') private updateState: MutationMethod;
  @Mutation('playingTick') private playingTick: MutationMethod;
  @Mutation('updateVolume') private updateVolume: MutationMethod;
  @Mutation('nextRepeatMode') private nextRepeatMode: MutationMethod;
  @Mutation('toggleShuffleMode') private toggleShuffleMode: MutationMethod;
  @Mutation('createTrack') private createTrack: MutationMethod;
  @Mutation('patchTrack') private patchTrack: MutationMethod;

  @Watch('state.volume')
  private onVolumeChange(value: number) {
    this.audio.volume = value;
  }

  @Watch('state.status')
  private onStatusChange(value: PlayerStatus) {
    this.isPlaying = value === 'isPlaying';
  }

  private created() {
    this.onTimeUpdate = this.onTimeUpdate.bind(this);
    this.onDurationChange = this.onDurationChange.bind(this);
    this.onAudioEnd = this.onAudioEnd.bind(this);
  }

  private mounted() {
    this.initAudio();
  }

  private initAudio() {
    this.audio = document.createElement('audio');
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
    this.audio.addEventListener('durationchange', this.onDurationChange);
    this.audio.addEventListener('ended', this.onAudioEnd);
    if (this.state.track !== null) {
      this.audio.src = this.state.track.source;
      this.audio.currentTime = this.state.currentSecond;
    }
  }

  private onTimeUpdate(event: Event) {
    const time = Math.round(this.audio.currentTime);
    if (this.state.currentSecond !== time) this.playingTick(time);
  }

  private onDurationChange(event: Event) {
    this.patchTrack({
      id: this.state.track.id,
      data: {
        duration: Math.round(this.audio.duration),
        sampleRate: this.ctx.sampleRate / 1000,
        bitrate: Math.round((this.state.track.originFile.size / 1024 ) * 8 / this.audio.duration),
      },
    });
  }

  private onAudioEnd(event: Event) {
    this.updateState('isPaused');
    if (this.state.isRepeat > 0) {
      if (this.state.isRepeat === 1) {
        ;
      } else {
        this.audio.currentTime = 0;
      }
      this.togglePlay();
    }
  }

  private async load() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept='audio/*';
    const track = await new Promise<ITrackData>(
      (resolve, reject) => {
        input.onchange = (event) => {
          this.updateState('isDataWaiting');
          this.createTrack({file: (event.target as any).files[0], defer: {resolve, reject}});
        };
        input.click();
      },
    );
    this.updateTrack(track);
    this.audio.src = track.source;
    this.updateState('isPaused');
  }

  private togglePlay() {
    if (this.audio.src != null) {
      if (this.isPlaying) {
        this.audio.pause();
        this.updateState('isPaused');
      } else {
        this.audio.play();
        this.updateState('isPlaying');
      }
    }
  }

  private stop() {
    this.audio.pause();
    this.updateState('isStopped');
    this.audio.currentTime = 0;
  }

  private seekPercent(percent: number) {
    this.audio.currentTime = percent * this.state.track.duration;
  }
}
</script>

<style scoped lang="stylus">
.player
  position relative
  top -100px
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
