<template>
  <div :class="blockName | bemMods(mods)">
    <div :class="blockName | bemElement('track-info') | bemMods()">
      <template v-if="fileMetaData">
        .:: {{durationMinutes}}:{{durationSeconds}} ::
        - {{fileMetaData.name}} ::
        {{fileMetaData.type}} ::
        {{fileMetaData.sampleRate}} kHz, {{fileMetaData.bitrate}} kbps, {{fileMetaData.size}} Mb
        ::.
      </template>
    </div>
    <div :class="blockName | bemElement('display') | bemMods()">
      {{currentMinutes}}:{{currentSeconds}}
      <Visualiser v-if="analyser != null" :analyser="analyser" :width="200" :height="30" :displayBins="64"/>
    </div>
    <div :class="blockName | bemElement('progress') | bemMods()">
      <Progress :cacheProgress="cacheProgress" :playProgress="playProgress" @changed="seekPercent"/>
    </div>
    <div :class="blockName | bemElement('controls') | bemMods()">
      <Button icon="eject" :mods="{hover: 'size'}" @click="load"/>
      <Button :icon="isPlaying ? 'pause' : 'play_arrow'" :mods="{hover: 'size'}" @click="togglePlay"/>
      <Button icon="stop" :mods="{hover: 'size'}" @click="stop"/>
      <Button icon="skip_previous" :mods="{hover: 'size'}"/>
      <Button icon="skip_next" :mods="{hover: 'size'}"/>
      <Button icon="shuffle" :mods="{hover: 'size', state: (shuffled ? 'active' : 'non-active')}" @click="changeShuffledState"/>
      <Button :icon="repeatType" :mods="{hover: 'size', state: (repeat ? 'active' : 'non-active')}" @click="changeRepeatState"/>
      <Volume :value="volume" @changed="updateVolume"/>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

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
  private currentTimeRaw: number = 0;
  private duration: number = 0;
  private volume: number = 1;
  private isPlaying: boolean = false;
  private shuffled: boolean = false;
  private repeat: boolean = false;
  private repeatType: 'repeat'|'repeat_one' = 'repeat';

  private audio: HTMLAudioElement = null;
  private ctx: AudioContext = null;
  private analyser: AnalyserNode = null;
  private scriptProcessor: ScriptProcessorNode = null;
  private gainNode: GainNode = null;
  private source: MediaElementAudioSourceNode = null;
  private file: File = null;
  private src: string = null;

  get currentMinutes(): string {
    return Math.trunc(this.currentTimeRaw / 60).toString().padStart(2, '0');
  }

  get currentSeconds(): string {
    return Math.trunc(this.currentTimeRaw - Number(this.currentMinutes) * 60).toString().padStart(2, '0');
  }

  get durationMinutes(): string {
    return Math.trunc(this.duration / 60).toString().padStart(2, '0');
  }

  get durationSeconds(): string {
    return Math.trunc(this.duration - Number(this.durationMinutes) * 60).toString().padStart(2, '0');
  }

  get fileMetaData() {
    if (this.file == null) return null;
    return {
      name: this.file.name.replace(/\..*$/, ''),
      type: this.file.type.replace(/^.*\//, ''),
      size: Math.round(this.file.size / (1024 * 1024) * 10) / 10,
      sampleRate: this.ctx.sampleRate / 1000,
      bitrate: Math.round((this.file.size / 1024 ) * 8 / this.duration),
    };
  }

  get playProgress() {
    try {
      const progress = this.currentTimeRaw / this.duration;
      return isNaN(progress) ? 0 : progress;
    } catch (e) {
      return 0;
    }
  }

  private updateVolume(value: number) {
    this.volume = value;
    this.audio.volume = this.volume;
    // this.gainNode.gain.value = this.volume * 10;
    // this.gainNode.gain.setValueAtTime(this.volume*100, this.audio.currentTime);
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

    this.scriptProcessor.onaudioprocess = (e) => this.currentTimeRaw = this.audio.currentTime;
    this.audio.onplaying = (e) => this.duration = (this.audio.duration || 0);
    this.audio.onended = (e) => {
      this.isPlaying = false;
      if (this.repeat) {
        if (this.repeatType === 'repeat') {
          ;
        } else {
          this.currentTimeRaw = 0;
          this.audio.currentTime = 0;
        }
        this.togglePlay();
      }
    };
  }

  private async load() {
    const input = document.createElement('input');
    input.type = 'file';
    this.src = await new Promise<string>(
      (resolve) => {
        input.onchange = (event) =>
          resolve(URL.createObjectURL(this.file = (event.target as any).files[0]));
        input.click();
      },
    );
    this.audio.src = this.src;
    const vol = this.audio.volume;
    this.audio.volume = 0;
    await new Promise((resolve) => {
      const cb = () => {
        this.audio.removeEventListener('playing', cb);
        this.audio.pause();
        this.audio.volume = vol;
        this.audio.currentTime = 0;
      };
      this.audio.addEventListener('playing', cb);
      this.audio.play();
    });
  }

  private togglePlay() {
    if (this.src != null) {
      if (this.isPlaying) {
        this.audio.pause();
        this.isPlaying = false;
      } else {
        this.audio.play();
        this.isPlaying = true;
      }
    }
  }

  private stop() {
    this.audio.pause();
    this.isPlaying = false;
    this.audio.currentTime = 0;
    this.currentTimeRaw = 0;
  }

  private seekPercent(percent: number) {
    this.audio.currentTime = percent * this.duration;
  }

  private changeRepeatState() {
    if (!this.repeat) return this.repeat = true;
    else if (this.repeatType === 'repeat') return this.repeatType = 'repeat_one';
    else if (this.repeatType === 'repeat_one') {
      this.repeat = false;
      return this.repeatType = 'repeat';
    }
  }

  private changeShuffledState() {
    this.shuffled = !this.shuffled;
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
