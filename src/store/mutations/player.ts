export default {
  updateTrack(state: IMainData, track: ITrackData) {
    state.player.track = track;
  },
  playingTick(state: IMainData, currentSecond: number) {
    state.player.currentSecond = Math.round(currentSecond);
  },
  updateCacheProgress(state: IMainData, cachedSeconds: number) {
    state.player.cachedSeconds = cachedSeconds;
  },
  updateVolume(state: IMainData, volume: number) {
    state.player.volume = volume;
  },
  toggleShuffleMode(state: IMainData) {
    state.player.isShuffle = !state.player.isShuffle;
  },
  nextRepeatMode(state: IMainData) {
    ++state.player.isRepeat;
    if (state.player.isRepeat >= 3) state.player.isRepeat = 0;
  },
  updateState(state: IMainData, status: PlayerStatus) {
    state.player.status = status;
  },
};
