declare global {
  interface ITrackData {
    id: string;
    name: string;
    type: string;
    size: number;
    source: any;
    duration: number;
    sampleRate: number;
    bitrate: number;
    originFile: File;
  }

  interface ITrackCollection extends Hash<ITrackData> {}
}

export default {} as ITrackCollection;
