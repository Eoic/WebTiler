type Orientation = 'vertical' | 'horizontal';

interface SplitNode {
  type: 'split';
  fraction: number;
  parent: SplitNode | null;
  orientation: Orientation;
  children: [LayoutNode, LayoutNode];
}

interface LeafNode {
  type: 'leaf';
  windowId: string;
  parent: SplitNode | null;
}

type LayoutNode = SplitNode | LeafNode;

export class LayoutTree {
    public root: LayoutNode | null = null;
    public focused: LeafNode | null = null;

    public openFirst(windowId: string) {
        this.root = {
            type: 'leaf',
            windowId,
            parent: null,
        };
    }

    public findLeaf(windowId: string, node: LayoutNode | null = this.root): LeafNode | null {
        if (!node) return null;
        if (node.type === 'leaf') return node.windowId === windowId ? node : null;
        return this.findLeaf(windowId, node.children[0]) || this.findLeaf(windowId, node.children[1]);
    }

    public splitLeaf(
        leaf: LeafNode,
        orientation: Orientation,
        newWindowId: string,
        fraction = 0.5
    ) {
        const newLeaf: LeafNode = { type: 'leaf', windowId: newWindowId, parent: null, };

        const split: SplitNode = {
            type: 'split',
            orientation,
            fraction,
            children: [leaf, newLeaf],
            parent: leaf.parent,
        };

        leaf.parent = split;
        newLeaf.parent = split;

        if (!split.parent) 
            this.root = split;
        else {
            const { children, } = split.parent;
            if (children[0] === leaf) children[0] = split;
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
        newWindowId: string,
        fraction = 0.5
    ) {
        if (!this.focused)
            return;

        this.splitLeaf(this.focused, orientation, newWindowId, fraction);
        const newLeaf = this.findLeaf(newWindowId);

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
        const leaf = this.findLeaf(windowId);
        if (leaf) this.focused = leaf;
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

