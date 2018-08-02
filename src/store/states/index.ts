import PlayerState from './player';
import TrackCollection from './track-collection';

declare global {
  interface IMainData {
    player: IPlayerData;
    tracks: ITrackCollection;
  }
}

export default {
  player: PlayerState,
  tracks: TrackCollection,
} as IMainData;
