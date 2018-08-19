import TrackActions from './track';

declare global {
  interface IActionContext {
    state: IMainData;
    commit: (name: string, data: any) => void;
    dispatch: (name: string, data: any) => void;
  }
}

export default {
  ...TrackActions,
};
