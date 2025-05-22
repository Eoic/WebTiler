import { Window } from '../window';

type Orientation = 'vertical' | 'horizontal';

interface SplitNode {
  type: 'split';
  fraction: number;
  parent: SplitNode | null;
  orientation: Orientation;
  children: [LayoutNode, LayoutNode];
  element: HTMLElement | null;
}

interface LeafNode<T extends Window = Window> {
  type: 'leaf';
  parent: SplitNode | null;
  window: T | null;
}

type LayoutNode = SplitNode | LeafNode;

export class LayoutTree<T extends Window = Window> {
    public root: LayoutNode | null = null;
    public focused: LeafNode | null = null;

    public openFirst(window: T) {
        this.root = {
            type: 'leaf',
            parent: null,
            window,
        };

        if (!this.root.window)
            throw new Error('Window element is null');

        document.body.appendChild(this.root.window.element);

        this.root.window.element.parentElement!.addEventListener('click', (event) => {
            if (!event.target)
                return;

            const windowElement = (event.target as HTMLElement).closest('.window');

            if (!windowElement)
                return;

            const windowId = windowElement.getAttribute('data-window-id');

            if (!windowId)
                return;

            this.focus(windowId);
            this.focused?.window?.focus();
        });
    }

    public findLeafById(windowId: string, node: LayoutNode | null = this.root): LeafNode | null {
        if (!node)
            return null;

        if (node.type === 'leaf')
            return node.window?.id === windowId ? node : null;

        return this.findLeafById(windowId, node.children[0]) || this.findLeafById(windowId, node.children[1]);
    }

    public findLeaf(node: LayoutNode | null = this.root): LeafNode | null {
        if (!node)
            return null;

        if (node.type === 'leaf')
            return node;

        const leftLeaf = this.findLeaf(node.children[0]);

        if (leftLeaf)
            return leftLeaf;

        return this.findLeaf(node.children[1]);
    }

    public findLastLeaf(node: LayoutNode | null = this.root): LeafNode | null {
        if (!node)
            return null;

        if (node.type === 'leaf')
            return node;

        const rightLeaf = this.findLastLeaf(node.children[1]);
            
        if (rightLeaf)
            return rightLeaf;

        return this.findLastLeaf(node.children[0]);
    }

    public splitLeaf(
        leaf: LeafNode,
        orientation: Orientation,
        newWindow: T,
        fraction = 0.5
    ) {
        const newLeaf: LeafNode = {
            type: 'leaf',
            parent: null,
            window: newWindow,
        };

        const splitElement = document.createElement('div');
        splitElement.className = `grid ${orientation}-split`;

        const split: SplitNode = {
            type: 'split',
            orientation,
            fraction,
            children: [leaf, newLeaf],
            parent: leaf.parent,
            element: splitElement,
        };

        if (leaf.window?.element?.parentElement) 
            leaf.window.element.parentElement.replaceChild(splitElement, leaf.window.element);
    
        leaf.parent = split;
        newLeaf.parent = split;
        split.element?.appendChild(leaf.window!.element);
        split.element?.appendChild(newLeaf.window!.element);

        if (!split.parent) 
            this.root = split;
        else {
            const { children, } = split.parent;

            if (children[0] === leaf)
                children[0] = split;
            else children[1] = split;
        }
    }

    public removeLeaf(leaf: LeafNode) {
        const parent = leaf.parent;
        if (!parent) { this.root = null; return; }

        const sibling = parent.children[0] === leaf ? parent.children[1] : parent.children[0];
        sibling.parent = parent.parent;

        if (!parent.parent) 
            this.root = sibling;
        else {
            const grandparent = parent.parent;

            if (grandparent.children[0] === parent)
                grandparent.children[0] = sibling;
            else grandparent.children[1] = sibling;
        }
    }

    public splitFocused(
        orientation: Orientation,
        newWindow: T,
        fraction = 0.5
    ) {
        if (!this.focused)
            return;

        this.splitLeaf(this.focused, orientation, newWindow, fraction);
        const newLeaf = this.findLeafById(newWindow.id);

        if (newLeaf)
            this.focused = newLeaf;
    }

    public removeFocused() {
        if (!this.focused)
            return;

        const toRemove = this.focused;
        const parent = toRemove.parent;
        const sibling = parent
            ? parent.children[0] === toRemove
                ? parent.children[1]
                : parent.children[0]
            : null;

        this.removeLeaf(toRemove);
        this.focused = sibling && sibling.type === 'leaf' ? sibling : null;
    }

    public focus(windowId: string) {
        if (this.focused)
            this.focused.window?.blur();

        const leaf = this.findLeafById(windowId);

        if (leaf) {
            this.focused = leaf;
            this.focused.window?.focus();
        }
    }

    public focusNext() {
        if (this.focused?.parent?.children[0] === this.focused) {
            const nextLeaf = this.findLeaf(this.focused.parent.children[1]);

            if (nextLeaf && nextLeaf.window)
                this.focus(nextLeaf.window.id);
        } else {
            const nextLeaf = this.findLeaf(this.root);

            if (nextLeaf && nextLeaf.window)
                this.focus(nextLeaf.window?.id);
        }
    }

    public focusPrev() {
        if (this.focused?.parent?.children[1] === this.focused) {
            const prevLeaf = this.findLeaf(this.focused.parent.children[0]);

            if (prevLeaf && prevLeaf.window)
                this.focus(prevLeaf.window.id);
        } else {
            const grandparent = this.focused?.parent?.parent;

            if (grandparent) {
                const prevLeaf = this.findLeaf(grandparent.children[0]);

                if (prevLeaf && prevLeaf.window)
                    this.focus(prevLeaf.window.id);
            } else {
                const lastLeaf = this.findLastLeaf(this.root);

                if (lastLeaf && lastLeaf.window)
                    this.focus(lastLeaf.window.id);
            }
        }
    }

    public traverse(callback: (leaf: LeafNode) => void) {
        this._traverse(this.root, callback);
    }

    private _traverse(node: LayoutNode | null, callback: (leaf: LeafNode) => void) {
        if (!node)
            return;

        if (node.type === 'leaf') 
            callback(node);
        else {
            this._traverse(node.children[0], callback);
            this._traverse(node.children[1], callback);
        }
    }
}
