import Vue from 'vue';

import { uuid } from '@/utils';

declare global {
  interface IPlaylistCreateMutationData {
    title: string;
    tracks?: ITrackData[];
    defer?: Defer;
  }
  interface IPlaylistSetTitleMutationData {
    id: string;
    title: string;
    defer?: Defer;
  }
  interface IPlaylistAddTracksMutationData {
    id: string;
    tracks: ITrackData[];
    defer?: Defer;
  }
  interface IPlaylistGetNextTrackMutationData {
    id: string;
    isRepeatList: boolean;
    isRandom: boolean;
    defer?: Defer;
  }
  interface IPlaylistGetPrevTrackMutationData {
    id: string;
    isRepeatList: boolean;
    isRandom: boolean;
    defer?: Defer;
  }
  interface IPlaylistUpdateCursorMutationData {
    id: string;
    node: ITrackNode;
    defer?: Defer;
  }
}

const generateListFromArray = (array: ITrackData[]) => {
  const list: ITrackList = {
    first: null,
    last: null,
  };

  return array.reduce((res: ITrackList, item: ITrackData, index: number) => {
    const node: ITrackNode = {
      prev: null,
      next: null,
      data: item,
    };

    if (res.first === null) {
      Vue.set(res, 'last', node);
      Vue.set(res, 'first', node);
    } else {
      Vue.set(node, 'prev', res.last);
      Vue.set(res.last, 'next', node);
      Vue.set(res, 'last', node);
    }
    return res;
  }, list);
};

export default {
  createPlaylist(state: IMainData, { title, tracks = [], defer = {} as Defer }: IPlaylistCreateMutationData): void {

    const trackList = generateListFromArray(tracks);

    const playlist: IPlaylistData = {
      trackList,
      id: uuid(),
      name: title,
      size: 0,
      count: tracks.length,
      duration: 0,
      cursor: null,
    };

    Vue.set(state.playlists, playlist.id, playlist);
    if (defer.resolve != null) defer.resolve(playlist);
  },
  setTitleToPlaylist(
    state: IMainData,
    {
      id,
      title,
      defer = {} as Defer,
    }: IPlaylistSetTitleMutationData,
  ): void {
    const playlist: IPlaylistData = state.playlists[id];
    Vue.set(playlist, 'name', title);
    if (defer.resolve != null) defer.resolve(playlist);
  },
  addTracksToPlaylist(
    state: IMainData,
    {
      id,
      tracks = [],
      defer = {} as Defer,
    }: IPlaylistAddTracksMutationData,
  ): void {
    const playlist: IPlaylistData = state.playlists[id];
    for (const track of tracks) {
      const node: ITrackNode = {
        prev: null,
        next: null,
        data: track,
      };
      if (playlist.trackList.first == null) {
        Vue.set(playlist.trackList, 'last', node);
        Vue.set(playlist.trackList, 'first', node);
      } else {
        Vue.set(node, 'prev', playlist.trackList.last);
        Vue.set(playlist.trackList.last, 'next', node);
        Vue.set(playlist.trackList, 'last', node);
      }
    }
    Vue.set(playlist, 'count', playlist.count + tracks.length);
    if (defer.resolve != null) defer.resolve(playlist);
  },
  getNextTrack(
    state: IMainData,
    {
      id,
      isRepeatList = false,
      isRandom = false,
      defer = {} as Defer,
    }: IPlaylistGetNextTrackMutationData,
  ): void {
    const playlist: IPlaylistData = state.playlists[id];
    if (playlist.cursor == null) playlist.cursor = playlist.trackList.first;
    else playlist.cursor = playlist.cursor.next;
    if (playlist.cursor == null) {
      if (isRepeatList) playlist.cursor = playlist.trackList.first;
      else playlist.cursor = playlist.trackList.last;
    }
    if (defer.resolve != null) defer.resolve(playlist.cursor && playlist.cursor.data);
  },
  getPrevTrack(
    state: IMainData,
    {
      id,
      isRepeatList = false,
      isRandom = false,
      defer = {} as Defer,
    }: IPlaylistGetPrevTrackMutationData,
  ): void {
    const playlist: IPlaylistData = state.playlists[id];
    if (playlist.cursor == null) playlist.cursor = playlist.trackList.last;
    else playlist.cursor = playlist.cursor.prev;
    if (playlist.cursor == null) {
      if (isRepeatList) playlist.cursor = playlist.trackList.last;
      else playlist.cursor = playlist.trackList.first;
    }
    if (defer.resolve != null) defer.resolve(playlist.cursor && playlist.cursor.data);
  },
  updateCursor(
    state: IMainData,
    {
      id,
      node,
      defer = {} as Defer,
    }: IPlaylistUpdateCursorMutationData,
  ): void {
    const playlist: IPlaylistData = state.playlists[id];
    playlist.cursor = node;
    if (defer.resolve != null) defer.resolve(playlist.cursor && playlist.cursor.data);
  },
};
