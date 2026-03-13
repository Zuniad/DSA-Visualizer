import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipForward, RotateCcw, 
  Search, Code2, BookOpen, Activity, 
  Settings2, Shuffle, Type, Network, 
  Plus, Trash2, ListTree, Info, FastForward, ChevronDown
} from 'lucide-react';

// --- CONSTANTS & ALGORITHM DATA ---

const RED = true;
const BLACK = false;

const ALGORITHMS = {
  insert: {
    id: 'insert', title: "Tree Insertion", time: "O(log n) avg, O(n) worst", space: "O(1)",
    description: "Inserts a new node into the tree. In self-balancing trees (AVL/Red-Black), a rebalancing phase occurs after the insertion to guarantee O(log n) depth.",
    code: {
      js: `function insert(root, val) {\n  if (!root) return new Node(val);\n  if (val < root.val) root.left = insert(root.left, val);\n  else root.right = insert(root.right, val);\n  return root;\n}`,
      py: `def insert(root, val):\n    if not root: return Node(val)\n    if val < root.val:\n        root.left = insert(root.left, val)\n    else:\n        root.right = insert(root.right, val)\n    return root`,
      java: `Node insert(Node root, int val) {\n    if (root == null) return new Node(val);\n    if (val < root.val) root.left = insert(root.left, val);\n    else root.right = insert(root.right, val);\n    return root;\n}`,
      cpp: `Node* insert(Node* root, int val) {\n    if (!root) return new Node(val);\n    if (val < root->val) root->left = insert(root->left, val);\n    else root->right = insert(root->right, val);\n    return root;\n}`
    }
  },
  search: {
    id: 'search', title: "Tree Search", time: "O(log n) avg, O(n) worst", space: "O(1)",
    description: "Searches for a value. Starts at the root, comparing the target value to the current node, moving left if smaller, and right if larger.",
    code: {
      js: `function search(root, val) {\n  if (!root || root.val === val) return root;\n  if (val < root.val) return search(root.left, val);\n  return search(root.right, val);\n}`,
      py: `def search(root, val):\n    if not root or root.val == val: return root\n    if val < root.val: return search(root.left, val)\n    return search(root.right, val)`,
      java: `Node search(Node root, int val) {\n    if (root == null || root.val == val) return root;\n    if (val < root.val) return search(root.left, val);\n    return search(root.right, val);\n}`,
      cpp: `Node* search(Node* root, int val) {\n    if (!root || root->val == val) return root;\n    if (val < root->val) return search(root->left, val);\n    return search(root->right, val);\n}`
    }
  },
  preorder: {
    id: 'preorder', title: "Preorder Traversal", time: "O(n)", space: "O(h)",
    description: "Visits nodes in the order: Root → Left → Right. Useful for creating a copy of the tree or prefix notation.",
    code: {
      js: `function preorder(root) {\n  if (!root) return;\n  console.log(root.val);\n  preorder(root.left);\n  preorder(root.right);\n}`,
      py: `def preorder(root):\n    if not root: return\n    print(root.val)\n    preorder(root.left)\n    preorder(root.right)`,
      java: `void preorder(Node root) {\n    if (root == null) return;\n    System.out.println(root.val);\n    preorder(root.left);\n    preorder(root.right);\n}`,
      cpp: `void preorder(Node* root) {\n    if (!root) return;\n    cout << root->val << " ";\n    preorder(root->left);\n    preorder(root->right);\n}`
    }
  },
  inorder: {
    id: 'inorder', title: "Inorder Traversal", time: "O(n)", space: "O(h)",
    description: "Visits nodes in the order: Left → Root → Right. In a BST, this traversal retrieves the keys in ascending sorted order.",
    code: {
      js: `function inorder(root) {\n  if (!root) return;\n  inorder(root.left);\n  console.log(root.val);\n  inorder(root.right);\n}`,
      py: `def inorder(root):\n    if not root: return\n    inorder(root.left)\n    print(root.val)\n    inorder(root.right)`,
      java: `void inorder(Node root) {\n    if (root == null) return;\n    inorder(root.left);\n    System.out.println(root.val);\n    inorder(root.right);\n}`,
      cpp: `void inorder(Node* root) {\n    if (!root) return;\n    inorder(root->left);\n    cout << root->val << " ";\n    inorder(root->right);\n}`
    }
  },
  postorder: {
    id: 'postorder', title: "Postorder Traversal", time: "O(n)", space: "O(h)",
    description: "Visits nodes in the order: Left → Right → Root. Useful for deleting a tree, as it processes children before parents.",
    code: {
      js: `function postorder(root) {\n  if (!root) return;\n  postorder(root.left);\n  postorder(root.right);\n  console.log(root.val);\n}`,
      py: `def postorder(root):\n    if not root: return\n    postorder(root.left)\n    postorder(root.right)\n    print(root.val)`,
      java: `void postorder(Node root) {\n    if (root == null) return;\n    postorder(root.left);\n    postorder(root.right);\n    System.out.println(root.val);\n}`,
      cpp: `void postorder(Node* root) {\n    if (!root) return;\n    postorder(root->left);\n    postorder(root->right);\n    cout << root->val << " ";\n}`
    }
  },
  levelorder: {
    id: 'levelorder', title: "Level Order Traversal", time: "O(n)", space: "O(n)",
    description: "Breadth-First Search (BFS) for a tree. Visits nodes level by level from top to bottom, left to right. Requires a Queue.",
    code: {
      js: `function levelOrder(root) {\n  if (!root) return;\n  const queue = [root];\n  while (queue.length > 0) {\n    const node = queue.shift();\n    console.log(node.val);\n    if (node.left) queue.push(node.left);\n    if (node.right) queue.push(node.right);\n  }\n}`,
      py: `def level_order(root):\n    if not root: return\n    queue = [root]\n    while queue:\n        node = queue.pop(0)\n        print(node.val)\n        if node.left: queue.append(node.left)\n        if node.right: queue.append(node.right)`,
      java: `void levelOrder(Node root) {\n    if (root == null) return;\n    Queue<Node> q = new LinkedList<>();\n    q.add(root);\n    while (!q.isEmpty()) {\n        Node node = q.poll();\n        System.out.println(node.val);\n        if (node.left != null) q.add(node.left);\n        if (node.right != null) q.add(node.right);\n    }\n}`,
      cpp: `void levelOrder(Node* root) {\n    if (!root) return;\n    queue<Node*> q;\n    q.push(root);\n    while (!q.empty()) {\n        Node* node = q.front(); q.pop();\n        cout << node->val << " ";\n        if (node->left) q.push(node->left);\n        if (node->right) q.push(node->right);\n    }\n}`
    }
  }
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// --- TREE DATA STRUCTURE ---
class TreeNode {
  constructor(val) {
    this.id = generateId();
    this.val = val;
    this.left = null;
    this.right = null;
    this.height = 1; // Used for AVL
    this.color = RED; // Used for Red-Black Tree
  }
}

const cloneTree = (root) => {
  if (!root) return null;
  const newNode = new TreeNode(root.val);
  newNode.id = root.id; 
  newNode.height = root.height;
  newNode.color = root.color;
  newNode.left = cloneTree(root.left);
  newNode.right = cloneTree(root.right);
  return newNode;
};

// --- DATA STRUCTURE ALGORITHMS ---

// 1. Regular Binary Tree (Level-Order Insert)
const insertBT = (root, val) => {
  if (!root) return new TreeNode(val);
  const queue = [root];
  while (queue.length > 0) {
    let temp = queue.shift();
    if (!temp.left) { temp.left = new TreeNode(val); break; } 
    else queue.push(temp.left);
    if (!temp.right) { temp.right = new TreeNode(val); break; } 
    else queue.push(temp.right);
  }
  return root;
};

// 2. Binary Search Tree
const insertBST = (root, val) => {
  if (!root) return new TreeNode(val);
  if (val < root.val) root.left = insertBST(root.left, val);
  else if (val > root.val) root.right = insertBST(root.right, val);
  return root;
};

// 3. AVL Tree (Self-Balancing)
const getHeight = (n) => n ? n.height : 0;
const getBalance = (n) => n ? getHeight(n.left) - getHeight(n.right) : 0;
const rightRotate = (y) => {
  let x = y.left; let T2 = x.right;
  x.right = y; y.left = T2;
  y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;
  x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;
  return x;
};
const leftRotate = (x) => {
  let y = x.right; let T2 = y.left;
  y.left = x; x.right = T2;
  x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;
  y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;
  return y;
};
const insertAVL = (node, val) => {
  if (!node) return new TreeNode(val);
  if (val < node.val) node.left = insertAVL(node.left, val);
  else if (val > node.val) node.right = insertAVL(node.right, val);
  else return node; // No duplicates
  node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
  let balance = getBalance(node);
  if (balance > 1 && val < node.left.val) return rightRotate(node);
  if (balance < -1 && val > node.right.val) return leftRotate(node);
  if (balance > 1 && val > node.left.val) { node.left = leftRotate(node.left); return rightRotate(node); }
  if (balance < -1 && val < node.right.val) { node.right = rightRotate(node.right); return leftRotate(node); }
  return node;
};

// 4. Red-Black Tree (LLRB Implementation)
const isRed = (node) => node ? node.color === RED : false;
const rotateLeftRB = (h) => {
  let x = h.right; h.right = x.left; x.left = h;
  x.color = h.color; h.color = RED; return x;
};
const rotateRightRB = (h) => {
  let x = h.left; h.left = x.right; x.right = h;
  x.color = h.color; h.color = RED; return x;
};
const flipColors = (h) => {
  h.color = RED;
  if(h.left) h.left.color = BLACK;
  if(h.right) h.right.color = BLACK;
};
const insertLLRB = (h, val) => {
  if (!h) return new TreeNode(val);
  if (val < h.val) h.left = insertLLRB(h.left, val);
  else if (val > h.val) h.right = insertLLRB(h.right, val);
  else return h;
  
  if (isRed(h.right) && !isRed(h.left)) h = rotateLeftRB(h);
  if (isRed(h.left) && isRed(h.left.left)) h = rotateRightRB(h);
  if (isRed(h.left) && isRed(h.right)) flipColors(h);
  return h;
};

// Master Insert Function
const _insertNode = (node, val, type) => {
  if (type === 'BT') return insertBT(node, val);
  if (type === 'AVL') return insertAVL(node, val);
  if (type === 'RBT') {
    let root = insertLLRB(node, val);
    root.color = BLACK; // Root is always black
    return root;
  }
  return insertBST(node, val); // Default BST
};

// --- MAIN COMPONENT ---

export default function BinaryTreeVisualizer() {
  // --- STATE ---
  const [treeType, setTreeType] = useState('BST'); // 'BT', 'BST', 'AVL', 'RBT'
  const [treeRoot, setTreeRoot] = useState(null);
  
  // Player State
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStepMode, setIsStepMode] = useState(false);
  const [speed, setSpeed] = useState(1); 
  
  // UI State
  const [inputValue, setInputValue] = useState('');
  const [initValue, setInitValue] = useState('10, 5, 15, 2, 7, 12, 20');
  const [activeAlgorithm, setActiveAlgorithm] = useState(ALGORITHMS.insert);
  const [codeLanguage, setCodeLanguage] = useState('js');
  const [traversalResult, setTraversalResult] = useState([]);

  // Computed state with fallbacks to prevent undefined access
  const currentTreeState = steps.length > 0 ? steps[currentStep].tree : treeRoot;
  const currentActiveNodes = steps.length > 0 ? (steps[currentStep].active || []) : [];
  const currentHighlightNodes = steps.length > 0 ? (steps[currentStep].highlight || []) : [];
  const currentMessage = steps.length > 0 ? (steps[currentStep].msg || "") : `Ready. Build a ${treeType} or run an algorithm.`;
  const currentResult = steps.length > 0 ? (steps[currentStep].result || []) : [];

  // --- ANIMATION ENGINE ---
  useEffect(() => {
    let timer;
    if (isPlaying && steps.length > 0 && currentStep < steps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1000 / speed);
    } else if (isPlaying && currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps, speed]);

  const startAnimation = (newSteps, algo) => {
    if(algo) setActiveAlgorithm(algo);
    setSteps(newSteps);
    setCurrentStep(0);
    setTraversalResult([]);
    if (!isStepMode) setIsPlaying(true);
  };

  const stopAndCommit = () => {
    if (steps.length > 0) {
      setTreeRoot(cloneTree(steps[steps.length - 1].tree));
    }
    setSteps([]);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const changeTreeType = (type) => {
    stopAndCommit();
    setTreeType(type);
    setTreeRoot(null); // Clear tree on type change to enforce new rules
  };

  // --- TREE LAYOUT ENGINE ---
  const getLayout = (root) => {
    const nodes = [];
    const edges = [];
    const HORIZONTAL_SPACING = 240;
    const VERTICAL_SPACING = 80;

    const traverse = (node, x, y, levelOffset) => {
      if (!node) return;
      nodes.push({ ...node, x, y });
      
      if (node.left) {
        edges.push({ id: `${node.id}-${node.left.id}`, source: { x, y }, target: { x: x - levelOffset, y: y + VERTICAL_SPACING } });
        traverse(node.left, x - levelOffset, y + VERTICAL_SPACING, levelOffset / 2);
      }
      if (node.right) {
        edges.push({ id: `${node.id}-${node.right.id}`, source: { x, y }, target: { x: x + levelOffset, y: y + VERTICAL_SPACING } });
        traverse(node.right, x + levelOffset, y + VERTICAL_SPACING, levelOffset / 2);
      }
    };

    traverse(root, 400, 40, HORIZONTAL_SPACING); // Assuming canvas center X ~ 400
    return { nodes, edges };
  };

  const { nodes: renderNodes, edges: renderEdges } = getLayout(currentTreeState);

  // --- TREE OPERATIONS (Generating Steps) ---
  
  const generateTreeFromInput = () => {
    stopAndCommit();
    const values = initValue.split(',').map(v => parseInt(v.trim())).filter(v => !isNaN(v));
    let root = null;
    values.forEach(val => { root = _insertNode(root, val, treeType); });
    setTreeRoot(root);
  };

  const generateRandomTree = () => {
    stopAndCommit();
    const count = Math.floor(Math.random() * 8) + 5; // 5 to 12 nodes
    let root = null;
    const used = new Set();
    for(let i=0; i<count; i++){
      let val;
      do { val = Math.floor(Math.random() * 99) + 1; } while(used.has(val));
      used.add(val);
      root = _insertNode(root, val, treeType);
    }
    setTreeRoot(root);
  };

  const insertAnimated = () => {
    if (!inputValue) return;
    const val = parseInt(inputValue, 10);
    let newSteps = [];
    let currentTree = cloneTree(treeRoot);

    newSteps.push({ tree: cloneTree(currentTree), active: [], highlight: [], msg: `Starting insertion of ${val}.` });

    if (!currentTree) {
      currentTree = _insertNode(null, val, treeType);
      newSteps.push({ tree: cloneTree(currentTree), active: [], highlight: [currentTree.id], msg: `Tree was empty. Inserted ${val} as Root.` });
      startAnimation(newSteps, ALGORITHMS.insert);
      setInputValue('');
      return;
    }

    if (treeType === 'BT') {
      // BT level-order insertion animation
      let queue = [currentTree];
      let path = [];
      let inserted = false;
      while (queue.length > 0 && !inserted) {
        let curr = queue.shift();
        path.push(curr.id);
        newSteps.push({ tree: cloneTree(currentTree), active: [...path], highlight: [], msg: `Checking node ${curr.val}.` });
        
        if (!curr.left) {
          curr.left = new TreeNode(val);
          newSteps.push({ tree: cloneTree(currentTree), active: [...path], highlight: [curr.left.id], msg: `Inserted ${val} as left child of ${curr.val}.` });
          inserted = true;
        } else {
          queue.push(curr.left);
          if (!curr.right) {
            curr.right = new TreeNode(val);
            newSteps.push({ tree: cloneTree(currentTree), active: [...path], highlight: [curr.right.id], msg: `Inserted ${val} as right child of ${curr.val}.` });
            inserted = true;
          } else {
            queue.push(curr.right);
          }
        }
      }
    } else {
      // BST, AVL, RBT search path
      let curr = currentTree;
      let path = [];
      let inserted = false;
      
      while (curr && !inserted) {
        path.push(curr.id);
        newSteps.push({ tree: cloneTree(currentTree), active: [...path], highlight: [], msg: `Comparing ${val} with ${curr.val}.` });
        
        if (val === curr.val) {
          newSteps.push({ tree: cloneTree(currentTree), active: [...path], highlight: [curr.id], msg: `Value ${val} already exists.` });
          startAnimation(newSteps, ALGORITHMS.insert);
          setInputValue('');
          return;
        }

        if (val < curr.val) {
          if (!curr.left) {
            curr.left = new TreeNode(val);
            if(treeType === 'RBT') curr.left.color = RED;
            newSteps.push({ tree: cloneTree(currentTree), active: [...path], highlight: [curr.left.id], msg: `${val} < ${curr.val}, left child is null. Inserting here.` });
            inserted = true;
          } else {
            newSteps.push({ tree: cloneTree(currentTree), active: [...path], highlight: [], msg: `${val} < ${curr.val}, moving to left child.` });
            curr = curr.left;
          }
        } else {
          if (!curr.right) {
            curr.right = new TreeNode(val);
            if(treeType === 'RBT') curr.right.color = RED;
            newSteps.push({ tree: cloneTree(currentTree), active: [...path], highlight: [curr.right.id], msg: `${val} > ${curr.val}, right child is null. Inserting here.` });
            inserted = true;
          } else {
            newSteps.push({ tree: cloneTree(currentTree), active: [...path], highlight: [], msg: `${val} > ${curr.val}, moving to right child.` });
            curr = curr.right;
          }
        }
      }

      // If AVL or RBT, apply structural rebalancing for final step
      if (treeType === 'AVL' || treeType === 'RBT') {
        newSteps.push({ tree: cloneTree(currentTree), active: [], highlight: [], msg: `Applying ${treeType} structural rebalancing...` });
        
        // Rebuild from scratch guarantees perfect structural accuracy 
        let allVals = [];
        const extract = (n) => { if(n){ extract(n.left); allVals.push(n.val); extract(n.right); } };
        extract(treeRoot); // old values
        allVals.push(val); // new value
        
        let newRoot = null;
        allVals.forEach(v => { newRoot = _insertNode(newRoot, v, treeType); });
        currentTree = newRoot;
        
        newSteps.push({ tree: cloneTree(currentTree), active: [], highlight: [], msg: `${treeType} rebalancing complete.` });
      }
    }
    
    startAnimation(newSteps, ALGORITHMS.insert);
    setInputValue('');
  };

  const searchAnimated = () => {
    if (!inputValue || !treeRoot) return;
    const val = parseInt(inputValue, 10);
    let newSteps = [];
    let curr = treeRoot;
    let path = [];

    newSteps.push({ tree: treeRoot, active: [], highlight: [], msg: `Searching for ${val}.` });

    if (treeType === 'BT') {
      // Level order search for BT
      let queue = [curr];
      let found = false;
      while (queue.length > 0 && !found) {
        let temp = queue.shift();
        newSteps.push({ tree: treeRoot, active: [temp.id], highlight: [], msg: `Visiting node ${temp.val}.` });
        if (temp.val === val) {
          newSteps.push({ tree: treeRoot, active: [temp.id], highlight: [temp.id], msg: `Found ${val}!` });
          found = true;
        } else {
          if (temp.left) queue.push(temp.left);
          if (temp.right) queue.push(temp.right);
        }
      }
      if (!found) newSteps.push({ tree: treeRoot, active: [], highlight: [], msg: `${val} not found in tree.` });
    } else {
      // BST Search for BST, AVL, RBT
      while (curr) {
        path.push(curr.id);
        newSteps.push({ tree: treeRoot, active: [...path], highlight: [], msg: `Visiting node ${curr.val}.` });
        
        if (val === curr.val) {
          newSteps.push({ tree: treeRoot, active: [...path], highlight: [curr.id], msg: `Found ${val}!` });
          startAnimation(newSteps, ALGORITHMS.search);
          setInputValue('');
          return;
        }
        
        if (val < curr.val) {
          newSteps.push({ tree: treeRoot, active: [...path], highlight: [], msg: `${val} < ${curr.val}. Moving left.` });
          curr = curr.left;
        } else {
          newSteps.push({ tree: treeRoot, active: [...path], highlight: [], msg: `${val} > ${curr.val}. Moving right.` });
          curr = curr.right;
        }
      }
      newSteps.push({ tree: treeRoot, active: [...path], highlight: [], msg: `Reached leaf. ${val} not found in tree.` });
    }

    startAnimation(newSteps, ALGORITHMS.search);
    setInputValue('');
  };

  // Traversals
  const animateTraversal = (algoId) => {
    if (!treeRoot) return;
    let newSteps = [];
    let res = [];
    
    const pre = (node) => {
      if (!node) return;
      res.push(node.val);
      newSteps.push({ tree: treeRoot, active: [node.id], highlight: [], result: [...res], msg: `Visiting ${node.val}` });
      pre(node.left);
      pre(node.right);
    };

    const inord = (node) => {
      if (!node) return;
      inord(node.left);
      res.push(node.val);
      newSteps.push({ tree: treeRoot, active: [node.id], highlight: [], result: [...res], msg: `Visiting ${node.val}` });
      inord(node.right);
    };

    const post = (node) => {
      if (!node) return;
      post(node.left);
      post(node.right);
      res.push(node.val);
      newSteps.push({ tree: treeRoot, active: [node.id], highlight: [], result: [...res], msg: `Visiting ${node.val}` });
    };

    const level = () => {
      let q = [treeRoot];
      while(q.length > 0) {
        let node = q.shift();
        res.push(node.val);
        newSteps.push({ tree: treeRoot, active: [node.id], highlight: [], result: [...res], msg: `Visiting ${node.val}` });
        if(node.left) q.push(node.left);
        if(node.right) q.push(node.right);
      }
    };

    newSteps.push({ tree: treeRoot, active: [], highlight: [], result: [], msg: `Starting ${ALGORITHMS[algoId].title}...` });
    
    if (algoId === 'preorder') pre(treeRoot);
    else if (algoId === 'inorder') inord(treeRoot);
    else if (algoId === 'postorder') post(treeRoot);
    else if (algoId === 'levelorder') level();

    newSteps.push({ tree: treeRoot, active: [], highlight: [], result: [...res], msg: `Traversal Complete.` });
    
    startAnimation(newSteps, ALGORITHMS[algoId]);
  };

  // Metrics
  const getMetrics = () => {
    let depth = 0;
    let leaves = 0;
    let total = 0;
    
    const traverse = (node, d) => {
      if (!node) return;
      total++;
      if (d > depth) depth = d;
      if (!node.left && !node.right) leaves++;
      traverse(node.left, d + 1);
      traverse(node.right, d + 1);
    };
    
    traverse(treeRoot, 1);
    return { depth, leaves, total };
  };
  const metrics = getMetrics();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 flex flex-col overflow-hidden">
      
      {/* HEADER & INITIALIZATION PANEL */}
      <header className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex flex-col lg:flex-row items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 shadow-inner">
            <Network className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
              Tree Visualizer
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase mt-0.5">Interactive Graph Canvas</p>
          </div>
        </div>

        {/* Tree Type Selector */}
        <div className="flex bg-slate-900 rounded-lg border border-slate-700 p-1 shadow-inner">
          {['BT', 'BST', 'AVL', 'RBT'].map(type => (
            <button 
              key={type}
              onClick={() => changeTreeType(type)}
              disabled={isPlaying}
              className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 ${treeType === type ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              title={type === 'BT' ? 'Binary Tree' : type === 'BST' ? 'Binary Search Tree' : type === 'AVL' ? 'AVL Tree (Self Balancing)' : 'Red-Black Tree'}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Init Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-950/50 p-2 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <ListTree className="w-4 h-4 text-slate-500 ml-2" />
            <input
              type="text" value={initValue} onChange={(e) => setInitValue(e.target.value)}
              placeholder="e.g. 10, 5, 15"
              className="w-32 bg-transparent border-b border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 p-1 transition-colors"
            />
            <button 
              onClick={generateTreeFromInput} disabled={isPlaying}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded transition-colors border border-slate-700"
            >
              Build
            </button>
          </div>
          <div className="w-px h-6 bg-slate-800"></div>
          <div className="flex gap-2">
            <button 
              onClick={() => {stopAndCommit(); setTreeRoot(null);}} disabled={isPlaying}
              className="px-3 py-1 bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 text-xs font-medium rounded transition-colors"
            >
              Clear
            </button>
            <button 
              onClick={generateRandomTree} disabled={isPlaying}
              className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded transition-colors shadow-sm"
            >
              <Shuffle className="w-3.5 h-3.5" /> Random
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden relative">
        
        {/* LEFT/MAIN AREA */}
        <div className="col-span-1 lg:col-span-3 flex flex-col relative bg-slate-950">
          
          {/* VISUALIZER CANVAS */}
          <div className="flex-1 relative flex flex-col items-center justify-start overflow-auto bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px]">
            
            {/* Status Message Overlay */}
            <div className={`fixed top-24 left-1/2 -translate-x-1/2 max-w-2xl text-center px-6 py-3 backdrop-blur-md border rounded-full shadow-2xl font-medium z-30 flex items-center gap-3 transition-all duration-300 bg-slate-900/90 border-slate-700 text-indigo-300`}>
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPlaying ? 'bg-indigo-400' : 'bg-slate-500'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isPlaying ? 'bg-indigo-500' : 'bg-slate-500'}`}></span>
              </span>
              {currentMessage}
            </div>

            {/* Traversal Result Overlay */}
            {currentResult.length > 0 && (
              <div className="fixed top-40 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur border border-slate-700 px-6 py-3 rounded-xl shadow-xl z-20 flex items-center gap-3 max-w-[90%] overflow-x-auto custom-scrollbar">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">Output:</span>
                <div className="flex gap-2">
                  {currentResult.map((val, i) => (
                    <motion.span 
                      key={i} 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-indigo-600/30 text-indigo-200 border border-indigo-500/50 px-2 py-1 rounded text-sm font-mono font-bold whitespace-nowrap"
                    >
                      {val}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {/* Metrics HUD */}
            <div className="fixed bottom-36 left-8 flex flex-col gap-2 z-20 pointer-events-none opacity-80">
              <div className="bg-slate-900/60 backdrop-blur px-3 py-2 rounded-lg border border-slate-800 flex items-center justify-between w-32 shadow-lg">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Depth</span>
                <span className="text-sm font-mono text-white font-bold">{metrics.depth}</span>
              </div>
              <div className="bg-slate-900/60 backdrop-blur px-3 py-2 rounded-lg border border-slate-800 flex items-center justify-between w-32 shadow-lg">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Nodes</span>
                <span className="text-sm font-mono text-white font-bold">{metrics.total}</span>
              </div>
              <div className="bg-slate-900/60 backdrop-blur px-3 py-2 rounded-lg border border-slate-800 flex items-center justify-between w-32 shadow-lg">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Leaves</span>
                <span className="text-sm font-mono text-white font-bold">{metrics.leaves}</span>
              </div>
            </div>

            {/* Custom Tree SVG & Nodes Canvas */}
            <div className="relative min-w-[800px] min-h-[600px] mt-24">
              
              {/* Edges Layer (SVG) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <AnimatePresence>
                  {renderEdges.map((edge) => (
                    <motion.line
                      key={edge.id}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      x1={edge.source.x} y1={edge.source.y}
                      x2={edge.target.x} y2={edge.target.y}
                      stroke="#475569" strokeWidth="2"
                    />
                  ))}
                </AnimatePresence>
              </svg>

              {/* Nodes Layer (HTML) */}
              <AnimatePresence>
                {renderNodes.map((node) => {
                  const isActive = currentActiveNodes.includes(node.id);
                  const isHighlight = currentHighlightNodes.includes(node.id);
                  
                  // Base Styles dependent on Tree Type
                  let bgColor = 'bg-slate-800';
                  let borderColor = 'border-slate-600';
                  let textColor = 'text-slate-200';
                  let shadow = 'shadow-md';
                  
                  if (treeType === 'RBT') {
                    bgColor = node.color === RED ? 'bg-red-600' : 'bg-slate-900';
                    borderColor = node.color === RED ? 'border-red-500' : 'border-slate-700';
                    textColor = 'text-white';
                    shadow = node.color === RED ? 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'shadow-md';
                  }

                  // Active / Highlight Overrides
                  if (isActive) {
                    bgColor = 'bg-blue-600'; borderColor = 'border-blue-400'; textColor = 'text-white';
                    shadow = 'shadow-[0_0_20px_rgba(59,130,246,0.8)]';
                  } else if (isHighlight) {
                    bgColor = 'bg-emerald-600'; borderColor = 'border-emerald-400'; textColor = 'text-white';
                    shadow = 'shadow-[0_0_20px_rgba(16,185,129,0.8)]';
                  }

                  return (
                    <motion.div
                      key={node.id}
                      layout
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: isActive || isHighlight ? 1.15 : 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={`absolute flex items-center justify-center w-12 h-12 -ml-6 -mt-6 rounded-full border-2 font-mono font-bold text-lg z-10 transition-colors duration-300 ${bgColor} ${borderColor} ${textColor} ${shadow}`}
                      style={{ left: node.x, top: node.y }}
                    >
                      {node.val}
                    </motion.div>
                  )
                })}
              </AnimatePresence>

              {renderNodes.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 opacity-50 z-0 pointer-events-none">
                  <Network className="w-16 h-16 mb-4 opacity-30" />
                  <span className="text-sm uppercase tracking-widest font-semibold">{treeType} is Empty</span>
                </div>
              )}

            </div>
          </div>

          {/* OPERATIONS CONTROL PANEL */}
          <div className="bg-slate-900 border-t border-slate-800 z-20 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
            
            {/* Top row: CRUD & Traversals */}
            <div className="p-4 border-b border-slate-800/50 flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* CRUD */}
              <div className="flex gap-3 items-center">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Type className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && insertAnimated()}
                    placeholder="Value"
                    disabled={isPlaying}
                    className="w-28 bg-slate-950 border border-slate-700 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block pl-9 p-2 transition-colors disabled:opacity-50"
                  />
                </div>
                <div className="flex gap-2 bg-slate-950 p-1 rounded-lg border border-slate-800">
                  <button onClick={insertAnimated} disabled={isPlaying} className="px-3 py-1.5 hover:bg-indigo-600/20 text-indigo-400 rounded text-xs font-bold transition-colors flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Insert
                  </button>
                  <button onClick={searchAnimated} disabled={isPlaying} className="px-3 py-1.5 hover:bg-emerald-600/20 text-emerald-400 rounded text-xs font-bold transition-colors flex items-center gap-1">
                    <Search className="w-3.5 h-3.5" /> Search
                  </button>
                  <button disabled={true} title="Deletion animation coming soon" className="px-3 py-1.5 text-slate-600 rounded text-xs font-bold transition-colors flex items-center gap-1 cursor-not-allowed">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>

              {/* Traversals */}
              <div className="flex flex-wrap gap-2">
                {['preorder', 'inorder', 'postorder', 'levelorder'].map(t => (
                  <button 
                    key={t} onClick={() => animateTraversal(t)} disabled={isPlaying}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 capitalize"
                  >
                    {t.replace('order', ' Order')}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom row: Execution Controls */}
            <div className="p-3 bg-slate-950 flex flex-wrap justify-between items-center gap-4">
              
              <div className="flex items-center gap-3">
                <div className="flex bg-slate-900 rounded-lg border border-slate-800 p-1 shadow-inner">
                  <button 
                    onClick={() => { setIsStepMode(false); setIsPlaying(false); }}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${!isStepMode ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Auto Run
                  </button>
                  <button 
                    onClick={() => { setIsStepMode(true); setIsPlaying(false); }}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${isStepMode ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Step Mode
                  </button>
                </div>

                {isStepMode ? (
                  <button 
                    onClick={() => currentStep < steps.length - 1 && setCurrentStep(c => c + 1)} 
                    disabled={steps.length === 0 || currentStep >= steps.length - 1}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 rounded-lg text-white transition-colors shadow-md flex items-center gap-2 text-xs font-bold"
                  >
                    Next Step <SkipForward className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)} 
                    disabled={steps.length === 0 && currentStep === 0}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 rounded-lg text-white transition-colors shadow-md"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                )}

                <button onClick={stopAndCommit} className="p-2.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors" title="Stop & Commit">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg">
                <FastForward className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mr-1">Speed</span>
                <input 
                  type="range" min="0.25" max="3" step="0.25" 
                  value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-24 accent-indigo-500"
                />
                <span className="text-[10px] text-slate-300 font-mono w-6 text-right">{speed}x</span>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT PANEL - EXPLANATION & CODE */}
        <div className="col-span-1 border-l border-slate-800 bg-slate-900 flex flex-col overflow-hidden max-h-screen">
          
          <div className="p-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-10 shadow-sm flex justify-between items-center">
            <h2 className="text-base font-bold flex items-center gap-2 text-white">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Algorithm Insights
            </h2>
            <Info className="w-4 h-4 text-slate-500 hover:text-indigo-400 cursor-pointer transition-colors" title="Binary Tree Logic" />
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
            
            {/* Header & Desc */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-indigo-400">{activeAlgorithm.title}</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                {activeAlgorithm.description}
              </p>
            </div>

            {/* Complexity */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 shadow-inner flex flex-col items-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Time</span>
                <div className="text-sm font-mono text-emerald-400 mt-1">{activeAlgorithm.time}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 shadow-inner flex flex-col items-center">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Space</span>
                <div className="text-sm font-mono text-amber-400 mt-1">{activeAlgorithm.space}</div>
              </div>
            </div>

            {/* Progress / Steps info */}
            {steps.length > 0 && (
              <div className={`border rounded-xl p-4 transition-colors duration-300 bg-indigo-900/10 border-indigo-900/30`}>
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-sm font-semibold text-indigo-300`}>Execution Step</span>
                  <span className={`text-xs font-mono px-2 py-1 rounded text-indigo-400 bg-indigo-900/40`}>
                    {currentStep + 1} / {steps.length}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3 overflow-hidden">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ease-out bg-indigo-500`} 
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  ></div>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-slate-300 font-mono leading-relaxed">
                  <span className="text-indigo-500 mr-2">{'>'}</span> 
                  {currentMessage}
                </div>
              </div>
            )}

            {/* Code Viewer */}
            <div className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-slate-300">
                  <Code2 className="w-4 h-4" /> Implementation
                </h4>
                <div className="flex bg-slate-950 rounded-md border border-slate-800 overflow-hidden">
                  {['js', 'py', 'java', 'cpp'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => setCodeLanguage(lang)}
                      className={`px-2 py-1 text-[10px] font-mono uppercase transition-colors ${
                        codeLanguage === lang ? 'bg-slate-800 text-white font-bold' : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="bg-[#0d1117] rounded-xl border border-slate-800 overflow-hidden shadow-inner">
                <div className="px-4 py-2 border-b border-slate-800/50 flex items-center gap-2 bg-[#161b22]">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                  </div>
                  <span className="ml-2 text-[10px] text-slate-500 font-mono">tree.{codeLanguage}</span>
                </div>
                <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
                  <code>
                    {activeAlgorithm.code[codeLanguage]}
                  </code>
                </pre>
              </div>
            </div>

          </div>
        </div>

      </div>
      
      {/* Scrollbar Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { height: 8px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}} />
    </div>
  );
}