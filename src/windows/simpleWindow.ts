import { Window } from '../window';

export class SimpleWindow extends Window {
    constructor(id: number, title: string) {
        super(id, title);
    }

    // public create(): HTMLElement {
    //     const element = document.createElement('div');
    //     element.className = 'simple-window';
    //     element.innerText = this.title;
    //     return element;
    // }

    public focus() {
        super.focus();
        console.log(`Focusing on window: ${this.title}`);
    }

    public blur() {
        super.blur();
        console.log(`Blurring window: ${this.title}`);
    }
}
