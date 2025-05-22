type HotkeyAction = 
    'split-horizontal' |
    'split-vertical' |
    'close' |
    'focus-next' |
    'focus-prev';

export interface HotkeyConfig {
    [action: string]: string;
}

export type HotkeyCallback = (action: HotkeyAction, event: KeyboardEvent) => void;

const DEFAULT_HOTKEYS: HotkeyConfig = {
    'close': 'Shift+W',
    'focus-prev': 'Shift+Enter',
    'focus-next': 'Shift+Tab',
    'split-horizontal': 'Shift+Enter',
    'split-vertical': 'Shift+Alt+Enter',
};

function parseKeyCombo(combo: string): Set<string> {
    return new Set(combo.toLowerCase().split('+').map((key) => key.trim()));
}

function eventMatchesCombo(event: KeyboardEvent, combo: string): boolean {
    const keys = parseKeyCombo(combo);

    if (keys.has('ctrl') !== event.ctrlKey)
        return false;

    if (keys.has('shift') !== event.shiftKey)
        return false;

    if (keys.has('alt') !== event.altKey)
        return false;

    if (keys.has('meta') !== event.metaKey)
        return false;

    const nonMods = Array.from(keys).filter((key) => !['ctrl','shift','alt','meta'].includes(key));

    if (nonMods.length !== 1)
        return false;

    return event.key.toLowerCase() === nonMods[0];
}

export class KeyboardManager {
    private hotkeys: HotkeyConfig;
    private callback: HotkeyCallback | null = null;
    private handleKeyDown: (event: KeyboardEvent) => void;

    constructor(hotkeys: Partial<HotkeyConfig> = {}) {
        this.hotkeys = { ...DEFAULT_HOTKEYS, };

        for (const key in hotkeys)
            if (hotkeys[key])
                this.hotkeys[key] = hotkeys[key]!;

        this.handleKeyDown = (event: KeyboardEvent) => {
            for (const action in this.hotkeys) 
                if (eventMatchesCombo(event, this.hotkeys[action])) {
                    event.preventDefault();
                    event.stopPropagation();

                    if (this.callback)
                        this.callback(action as HotkeyAction, event);

                    break;
                }
            
        };
    }

    public enable() {
        window.addEventListener('keydown', this.handleKeyDown);
    }

    public disable() {
        window.removeEventListener('keydown', this.handleKeyDown);
    }

    public setHotkey(action: HotkeyAction, combo: string) {
        this.hotkeys[action] = combo;
    }

    public getHotkey(action: HotkeyAction): string {
        return this.hotkeys[action];
    }

    public onAction(callback: HotkeyCallback) {
        this.callback = callback;
    }
}
