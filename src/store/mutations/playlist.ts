import Vue from 'vue';

import {
  uuid,
  getRandomArbitraryInt,
} from '@/utils';

declare global {
  interface IPlaylistCreateMutationData {
    title: string;
    tracks?: ITrackData[];
    defer?: IDefer;
  }
  interface IPlaylistDeleteMutationData {
    id: string;
    defer?: IDefer;
  }
  interface IPlaylistSetTitleMutationData {
    id: string;
    title: string;
    defer?: IDefer;
  }
  interface IPlaylistAddTracksMutationData {
    id: string;
    tracks: ITrackData[];
    defer?: IDefer;
  }
  interface IPlaylistRemoveTrackMutationData {
    id: string;
    node: ITrackNode;
    defer?: IDefer;
  }
  interface IPlaylistGetNextTrackMutationData {
    id: string;
    isRepeatList: boolean;
    isRandom: boolean;
    defer?: IDefer;
  }
  interface IPlaylistGetPrevTrackMutationData {
    id: string;
    isRepeatList: boolean;
    isRandom: boolean;
    defer?: IDefer;
  }
  interface IPlaylistUpdateCursorMutationData {
    id: string;
    node: ITrackNode;
    defer?: IDefer;
  }
  interface IPlaylistRecalcMutationData {
    id: string;
    defer?: IDefer;
  }
}

const generateListFromArray = (array: ITrackData[], playlist: IPlaylistData) => {
  const list: ITrackList = {
    first: null,
    last: null,
  };

  let size = 0;
  let duration = 0;

  const result = array.reduce((res: ITrackList, item: ITrackData, index: number) => {
    item.relatedPlaylists.push(playlist);
    const node: ITrackNode = {
      prev: null,
      next: null,
      data: item,
    };

    size += item.size;
    duration += item.duration;

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

  playlist.size = size;
  playlist.duration = duration;

  return result;
};

export default {
  createPlaylist(state: IMainData, { title, tracks = [], defer = {} as IDefer }: IPlaylistCreateMutationData): void {

    const playlist: IPlaylistData = {
      trackList: {
        first: null,
        last: null,
      },
      id: uuid(),
      name: title,
      size: 0,
      count: tracks.length,
      duration: 0,
      cursor: null,
    };

    Vue.set(playlist, 'trackList', generateListFromArray(tracks, playlist));

    Vue.set(state.playlists, playlist.id, playlist);
    if (defer.resolve != null) defer.resolve(playlist);
  },
  deletePlaylist(state: IMainData, { id, defer = {} as IDefer }: IPlaylistDeleteMutationData): void {
    Vue.delete(state.playlists, id);
    if (defer.resolve != null) defer.resolve();
  },
  setTitleToPlaylist(
    state: IMainData,
    {
      id,
      title,
      defer = {} as IDefer,
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
      defer = {} as IDefer,
    }: IPlaylistAddTracksMutationData,
  ): void {
    const playlist: IPlaylistData = state.playlists[id];
    for (const track of tracks) {
      track.relatedPlaylists.push(playlist);
      const node: ITrackNode = {
        prev: null,
        next: null,
        data: track,
      };
      playlist.size += track.size;
      playlist.duration += track.duration;
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
  removeTracksFromPlaylist(
    state: IMainData,
    {
      id,
      node,
      defer = {} as IDefer,
    }: IPlaylistRemoveTrackMutationData,
  ): void {
    const playlist: IPlaylistData = state.playlists[id];
    if (node.prev != null) Vue.set(node.prev, 'next', node.next);
    else playlist.trackList.first = node.next;
    if (node.next != null) Vue.set(node.next, 'prev', node.prev);
    else playlist.trackList.last = node.prev;
    Vue.set(playlist, 'size', playlist.size - node.data.size);
    Vue.set(playlist, 'duration', playlist.duration - node.data.duration);
    Vue.set(playlist, 'count', playlist.count - 1);
    if (defer.resolve != null) defer.resolve();
  },
  getNextTrack(
    state: IMainData,
    {
      id,
      isRepeatList = false,
      isRandom = false,
      defer = {} as IDefer,
    }: IPlaylistGetNextTrackMutationData,
  ): void {
    const playlist: IPlaylistData = state.playlists[id];
    if (playlist.cursor == null) playlist.cursor = playlist.trackList.first;
    else if (isRandom) {
      let cursor = playlist.cursor;
      for (let counter = getRandomArbitraryInt(1, playlist.count); counter > 0; --counter) {
        cursor = cursor.next;
        if (cursor == null) cursor = playlist.trackList.first;
      }
      playlist.cursor = cursor;
    } else playlist.cursor = playlist.cursor.next;

    if (playlist.cursor == null) {
      if (isRepeatList) playlist.cursor = playlist.trackList.first;
      else {
        playlist.cursor = playlist.trackList.last;
        if (defer.resolve != null) defer.resolve(null);
        return;
      }
    }
    if (defer.resolve != null) defer.resolve(playlist.cursor && playlist.cursor.data);
  },
  getPrevTrack(
    state: IMainData,
    {
      id,
      isRepeatList = false,
      isRandom = false,
      defer = {} as IDefer,
    }: IPlaylistGetPrevTrackMutationData,
  ): void {
    const playlist: IPlaylistData = state.playlists[id];
    if (playlist.cursor == null) playlist.cursor = playlist.trackList.last;
    else if (isRandom) {
      let cursor = playlist.cursor;
      for (let counter = getRandomArbitraryInt(1, playlist.count); counter > 0; --counter) {
        cursor = cursor.prev;
        if (cursor == null) cursor = playlist.trackList.last;
      }
      playlist.cursor = cursor;
    } else playlist.cursor = playlist.cursor.prev;

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
      defer = {} as IDefer,
    }: IPlaylistUpdateCursorMutationData,
  ): void {
    const playlist: IPlaylistData = state.playlists[id];
    playlist.cursor = node;
    if (defer.resolve != null) defer.resolve(playlist.cursor && playlist.cursor.data);
  },
};
