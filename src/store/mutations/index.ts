import PlayerMutations from './player';
import PlaylistMutations from './playlist';
import TrackMutations from './track';

export default {
  ...PlayerMutations,
  ...TrackMutations,
  ...PlaylistMutations,
};
