export class Window {
    public readonly id: number;
    public readonly title: string;
    public readonly element: HTMLElement;

    private _isFocused: boolean = false;

    public focus() {
        this._isFocused = true;
        this.element.classList.add('focused');
    }

    public blur() {
        this._isFocused = false;
        this.element.classList.remove('focused');
    }

    constructor(id: number, title: string) {
        this.id = id;
        this.title = title;
        this.element = this.create();

        // this.element.addEventListener('click', () => {
        //     if (this._isFocused) 
        //         this.blur();
        //     else 
        //         this.focus();
        // });
    }

    public create(): HTMLElement {
        const element = document.createElement('div');
        element.className = 'window';
        element.innerText = this.title;
        return element;
    }
}
