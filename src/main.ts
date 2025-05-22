import '../styles/main.scss';
import { KeyboardManager } from './keyboard';
import { LayoutTree } from './tree/tree';
import { SimpleWindow } from './windows/simpleWindow';

const tree = new LayoutTree();

const w1Window = new SimpleWindow('1', 'w1');
tree.openFirst(w1Window);
const w1Leaf = tree.findLeafById(w1Window.id);

if (!w1Leaf) 
    throw new Error('Leaf not found');

const w2Window = new SimpleWindow('2', 'w2');
tree.splitLeaf(w1Leaf, 'horizontal', w2Window);

const w2Leaf = tree.findLeafById(w2Window.id);

if (!w2Leaf) 
    throw new Error('Leaf not found');

const w3Window = new SimpleWindow('3', 'w3');
tree.splitLeaf(w2Leaf, 'vertical', w3Window);

const w3Leaf = tree.findLeafById(w3Window.id);

if (!w3Leaf) 
    throw new Error('Leaf not found');

const w4Window = new SimpleWindow('4', 'w4');
tree.splitLeaf(w3Leaf, 'horizontal', w4Window);

const manager = new KeyboardManager();

manager.onAction((action, _event) => {
    switch (action) {
    case 'split-horizontal':
        break;
    case 'split-vertical':
        break;
    case 'close':
        break;
    case 'focus-next':
        tree.focusNext();
        break;
    case 'focus-prev':
        tree.focusPrev();
        break;
    }
});

manager.enable();
