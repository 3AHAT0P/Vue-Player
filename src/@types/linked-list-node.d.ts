declare global {
  abstract class LinkedListNode<T, G = any> {
    public prev: T;
    public next: T;
    public data: G;
  }
}

export { };
