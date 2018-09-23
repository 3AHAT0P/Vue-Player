import { uuid } from '@/utils';

declare global {
  interface ITrackCreateActionData {
    file: File;
    defer?: Defer;
  }
}

export default {
  async createTrack(
    { state, commit, dispatch }: IActionContext,
    { file, defer = {} as Defer }: ITrackCreateActionData,
  ) {
    console.log('Track::Mutation:create - arg file', file);
    const track: ITrackData = {
      id: uuid(),
      name: file.name.replace(/^(.*)\..{1,5}$/ig, '$1'),
      type: file.type.replace(/^.*\//, ''),
      size: file.size,
      source: URL.createObjectURL(file),
      duration: 0,
      sampleRate: 44.1,
      bitrate: 0,
      originFile: file,
      relatedPlaylists: [],
    };
    console.log('Track::Mutation:create - track', track);

    const audio = document.createElement('audio');
    audio.preload = 'metadata';
    track.duration = await new Promise<number>((resolve) => {
      audio.addEventListener('durationchange', () => {
        resolve(Math.round(audio.duration));
      });
      audio.src = track.source;
    });

    track.bitrate = Math.round((track.size / 1024) * 8 / track.duration);

    commit('setTrack', { track });

    if (defer.resolve != null) defer.resolve(track);
  },
};
