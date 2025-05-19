export class Node<T> {
    public left: Node<T> | null = null;
    public right: Node<T> | null = null;

    constructor(public value: T) {}
}
