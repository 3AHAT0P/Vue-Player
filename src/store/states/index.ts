import PlayerState from './player';
import PlaylistCollection from './playlist-collection';
import TrackCollection from './track-collection';

declare global {
  interface IMainData {
    player: IPlayerData;
    tracks: ITrackCollection;
    playlists: IPlaylistCollection;
  }
}

export default {
  player: PlayerState,
  tracks: TrackCollection,
  playlists: PlaylistCollection,
} as IMainData;
