import '../styles/main.scss';
import { LayoutTree } from './tree/tree';

const tree = new LayoutTree();

tree.openFirst('w1');
const w1Leaf = tree.findLeaf('w1');

if (!w1Leaf) 
    throw new Error('Leaf not found');

document.body.appendChild(w1Leaf.element!);
tree.splitLeaf(w1Leaf, 'horizontal', 'w2');

const w2Leaf = tree.findLeaf('w2');

if (!w2Leaf) 
    throw new Error('Leaf not found');

tree.splitLeaf(w2Leaf, 'vertical', 'w3');

const w3Leaf = tree.findLeaf('w3');

if (!w3Leaf) 
    throw new Error('Leaf not found');

tree.splitLeaf(w3Leaf, 'horizontal', 'w4');
