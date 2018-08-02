declare global {
  type PlayerStatus = 'isPlaying' | 'isPaused' | 'isStopped' | 'isDataWaiting';
  interface IPlayerData {
    track: ITrackData;
    currentSecond: number;
    cachedSeconds: number;
    volume: number;
    isShuffle: boolean;
    isRepeat: 0 | 1 | 2;
    status: PlayerStatus;
  }
}

export default {
  track: null,
  currentSecond: 0,
  cachedSeconds: 0,
  volume: 1,
  isShuffle: false,
  isRepeat: 0,
  status: 'isDataWaiting',
} as IPlayerData;
