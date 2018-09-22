<template>
  <canvas
    :width="width"
    :height="height"
    :class="blockName | bemMods(mods)"
    @click="changeType"
  />
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

@Component
export default class Visualiser extends Vue {
  @Prop({ default: () => ({}) }) private mods!: Hash;
  @Prop({ default: (): AnalyserNode => null, required: true }) private analyser!: AnalyserNode;
  @Prop({ default: () => false }) private isRun!: boolean;
  @Prop({ default: () => 100 }) private width!: number;
  @Prop({ default: () => 50 }) private height!: number;
  @Prop({ default: () => 32 }) private displayBins!: number;

  private blockName: string = 'visualiser';

  private ctx: CanvasRenderingContext2D = null;

  private drawCurved: boolean = false;
  private drawFilled: boolean = false;
  private binWidth: number = 0;

  private logLookupTable: number[] = null;
  private logBinLengths: number[] = null;

  private finalBins: number[] = null;

  private oneMoreSecond: number = 60;

  private mounted() {
    this.init();
  }

  private init() {
    this.ctx = (this.$el as HTMLCanvasElement).getContext('2d');
    this.ctx.strokeStyle = '#EC1A55';

    this.finalBins = new Array(this.displayBins);
    this.binWidth = Math.ceil(this.width / (this.displayBins - 1));

    // FFT node takes in 2 samples per bin, and we internally use 2 samples per bin
    this.analyser.fftSize = this.displayBins * 2;
    this.logLookupTable = [];
    this.logBinLengths = [];
    for (let i = 0; i < this.displayBins; i++) {
      this.logLookupTable.push(i);
    }

    requestAnimationFrame(this.paint.bind(this));
  }

  private paint() {
    if (this.isRun) requestAnimationFrame(this.paint.bind(this));
    else if (this.oneMoreSecond > 0) {
      this.oneMoreSecond--;
      requestAnimationFrame(this.paint.bind(this));
    }

    this.ctx.fillStyle = 'hsla(0, 0%, 0%, 1)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.fillStyle = 'hsla(0, 0%, 0%, 1)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.globalCompositeOperation = 'source-over';

    const frequencyBinCount = this.analyser.frequencyBinCount;
    const data = new Uint8Array(frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    this.ctx.fillStyle = '#EC1A55';

    this.updateBins(frequencyBinCount, this.logBinLengths, data);

    if (!this.drawCurved) {
      for (let i = 0; i < this.displayBins; i++) {
        this.paintSingleBin(i);
      }
    } else {
      this.ctx.fillStyle = '#EC1A55';
      this.ctx.beginPath();
      this.ctx.moveTo(0, this.height - this.getBinHeight(0));
      let i;
      for (i = 0; i < this.displayBins - 2;) {
        const thisX = i * this.binWidth;
        const nextX = (i + this.logBinLengths[i]) * this.binWidth; // First subbin of the next bin
        const x = (thisX + nextX) / 2;

        const thisY = this.height - this.getBinHeight(i);
        const nextY = this.height - this.getBinHeight(i + this.logBinLengths[i]);
        const y = (thisY + nextY) / 2;

        this.ctx.quadraticCurveTo(thisX, thisY, x, y);

        i += this.logBinLengths[i];
      }
      this.ctx.quadraticCurveTo(
        i * this.binWidth,
        this.height - this.getBinHeight(i),
        (i + 1) * this.binWidth,
        this.height - this.getBinHeight(i + 1),
      );
      if (this.drawFilled) {
        this.ctx.lineTo(this.width, this.height);
        this.ctx.lineTo(0, this.height);
        this.ctx.fill();
      } else {
        this.ctx.stroke();
      }
    }
  }

  // Inclusive lower, exclusive upper except with stop == start
  private averageRegion(data: Uint8Array, start: number, stop: number): number {
    if (stop <= start) return data[start];

    let sum = 0;
    for (let i = start; i < stop; i++) sum += data[i];

    return sum / (stop - start);
  }

  private updateBins(binsCount: number, binLengths: number[], data: Uint8Array) {
    const step = binsCount / this.displayBins;
    for (let i = 0; i < this.displayBins; i++) {
      const binValue = this.averageRegion(data, i * step, (i + 1) * step - 1);
      binLengths.push(1);
      this.finalBins[i] = binValue;
    }
  }

  private getBinHeight(i: number) {
    const binValue = this.finalBins[i];
    if (binValue == null || binValue === 0) return 1;
    return (binValue / 255) * this.height * 0.9;
  }

  private paintSingleBin(i: number) {
    const height = this.getBinHeight(i);
    this.ctx.fillRect(i * this.binWidth + 1, this.height - height, this.binWidth - 1, height);
  }

  private changeType() {
    this.drawCurved = !this.drawCurved;
  }

  @Watch('isRun')
  private onIsRunChange() {
    if (this.isRun) {
      this.oneMoreSecond = 60;
      requestAnimationFrame(this.paint.bind(this));
    }
  }
}
</script>

<style scoped lang="stylus">
.visualiser
  margin 0
</style>
