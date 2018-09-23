import Vue from 'vue';

declare global {
  interface ITrackSetMutationData {
    track: ITrackData;
    defer?: IDefer;
  }
  interface ITrackPatchMutationData {
    id: string;
    data: ITrackData;
    defer?: IDefer;
  }
}

export default {
  setTrack(state: IMainData, { track, defer = {} as IDefer }: ITrackSetMutationData) {
    Vue.set(state.tracks, track.id, track);
    if (defer.resolve != null) defer.resolve(track);
  },
  patchTrack(state: IMainData, { id, data, defer = {} as IDefer }: ITrackPatchMutationData) {
    const track: Hash<any> = state.tracks[id];
    for (const [key, value] of Object.entries(data)) {
      track[key] = value;
    }
    if (defer.resolve != null) defer.resolve(track as ITrackData);
  },
};
