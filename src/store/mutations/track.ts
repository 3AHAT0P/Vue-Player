import { uuid } from '@/utils';

declare global {
  interface ITrackCreateMutationData {
    file: File;
    defer?: Defer;
  }
  interface ITrackPatchMutationData {
    id: string;
    data: ITrackData;
    defer?: Defer;
  }
}

export default {
  createTrack(state: IMainData, { file, defer = {} as Defer }: ITrackCreateMutationData) {
    const track: ITrackData = {
      id: uuid(),
      name: file.name.replace(/\..*$/, ''),
      type: file.type.replace(/^.*\//, ''),
      size: Math.round(file.size / (1024 * 1024) * 10) / 10,
      source: URL.createObjectURL(file),
      duration: 0,
      sampleRate: 0,
      bitrate: 0,
      originFile: file,
    };

    // sampleRate: this.ctx.sampleRate / 1000,
    // bitrate: Math.round((this.file.size / 1024) * 8 / this.duration),
    state.tracks.set(track.id, track);
    if (defer.resolve != null) defer.resolve(track);
  },
  patchTrack(state: IMainData, { id, data, defer = {} as Defer }: ITrackPatchMutationData) {
    const track: Hash = state.tracks.get(id);
    for (const [key, value] of Object.entries(data)) {
      track[key] = value;
    }
    if (defer.resolve != null) defer.resolve(track as ITrackData);
  },
};
