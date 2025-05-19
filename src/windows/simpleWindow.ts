import { Window } from '../window';

export class SimpleWindow extends Window {
    public focus() {
        super.focus();
        console.log(`Focusing on window: ${this.title}`);
    }

    public blur() {
        super.blur();
        console.log(`Blurring window: ${this.title}`);
    }
}
