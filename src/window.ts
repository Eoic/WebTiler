export abstract class Window {
    public readonly id: number;
    public readonly title: string;

    public abstract open(): void;
    public abstract close(): void;
    public abstract focus(): void;
    public abstract blur(): void;

    constructor(id: number, title: string) {
        this.id = id;
        this.title = title;
    }
}
