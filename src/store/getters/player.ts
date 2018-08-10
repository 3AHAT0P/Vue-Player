import { safeGet } from '@/utils';

export default {
  ['Player::currentTrack']: (state: IMainData) => safeGet(state, 'player.activePlaylist.cursor.data', null),
};
