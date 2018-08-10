declare global {
  interface ITrackNode extends LinkedListNode<ITrackNode, ITrackData> { }

  interface ITrackList extends LinkedList<ITrackNode> { }

  interface IPlaylistData {
    id: string;
    name: string;
    size: number;
    count: number;
    duration: number;
    source?: any;
    originFile?: File;
    trackList: ITrackList;
    cursor: ITrackNode;
  }

  interface IPlaylistCollection extends Hash<IPlaylistData> {}
}

export default {} as IPlaylistCollection;
