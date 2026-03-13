import { useState, useCallback, useRef, useEffect, useMemo } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#060810",
  surface: "#0b0d16",
  panel: "#0e1119",
  border: "#171d2c",
  accent: "#8b5cf6",   // violet
  green: "#22d3ee",    // cyan-green
  amber: "#f59e0b",
  red: "#f43f5e",
  teal: "#10b981",
  orange: "#fb923c",
  text: "#e2e8f0",
  muted: "#4b5563",
  dim: "#0c0e18",
  nodeDefault: "#131624",
};

// ─── DATA ─────────────────────────────────────────────────────────────────────
const COMPLEXITY = {
  insert:    { time: "O(n)", space: "O(h)" },
  delete:    { time: "O(n)", space: "O(h)" },
  search:    { time: "O(n)", space: "O(h)" },
  preorder:  { time: "O(n)", space: "O(h)" },
  inorder:   { time: "O(n)", space: "O(h)" },
  postorder: { time: "O(n)", space: "O(h)" },
  levelorder:{ time: "O(n)", space: "O(n)" },
};

const ALGO_INFO = {
  insert: {
    name: "Insert Node",
    desc: "Inserts a new node as the left or right child of a target node.",
    steps: ["Check if tree is empty", "Find target parent node", "Check if desired child slot is free", "Create new node", "Attach node to parent", "✓ Node inserted"],
    pseudo: `insert(parent, value, side):
  if tree is empty:
    root = Node(value)
    return
  node = find(root, parent)
  if node is null: return
  newNode = Node(value)
  if side == "left":
    node.left = newNode
  else:
    node.right = newNode`,
  },
  delete: {
    name: "Delete Node",
    desc: "Removes a node and reattaches its subtree to maintain tree structure.",
    steps: ["Find node to delete", "Check if node has children", "If leaf: simply remove", "If one child: replace with child", "If two children: find in-order successor", "✓ Node deleted"],
    pseudo: `delete(root, value):
  if root is null: return null
  if value < root.val:
    root.left = delete(root.left, value)
  elif value > root.val:
    root.right = delete(root.right, value)
  else:
    if root.left is null: return root.right
    if root.right is null: return root.left
    successor = minNode(root.right)
    root.val = successor.val
    root.right = delete(root.right, successor.val)
  return root`,
  },
  search: {
    name: "Search Node",
    desc: "Searches for a value by traversing the tree from root.",
    steps: ["Start at root", "Compare with current node", "If match → found!", "Recurse into left subtree", "Recurse into right subtree", "Return null if not found"],
    pseudo: `search(node, value):
  if node is null: return null
  if node.val == value: return node
  left = search(node.left, value)
  if left: return left
  return search(node.right, value)`,
  },
  preorder: {
    name: "Preorder Traversal",
    desc: "Visit Root → Left subtree → Right subtree",
    steps: ["Visit root node", "Recurse left subtree", "Recurse right subtree", "Continue until all nodes visited", "✓ Traversal complete"],
    pseudo: `preorder(node):
  if node is null: return
  visit(node)          // Root
  preorder(node.left)  // Left
  preorder(node.right) // Right`,
  },
  inorder: {
    name: "Inorder Traversal",
    desc: "Visit Left subtree → Root → Right subtree. Produces sorted output for BST.",
    steps: ["Recurse left subtree", "Visit root node", "Recurse right subtree", "Continue until all nodes visited", "✓ Traversal complete"],
    pseudo: `inorder(node):
  if node is null: return
  inorder(node.left)   // Left
  visit(node)          // Root
  inorder(node.right)  // Right`,
  },
  postorder: {
    name: "Postorder Traversal",
    desc: "Visit Left subtree → Right subtree → Root. Used in tree deletion.",
    steps: ["Recurse left subtree", "Recurse right subtree", "Visit root node", "Continue until all nodes visited", "✓ Traversal complete"],
    pseudo: `postorder(node):
  if node is null: return
  postorder(node.left)  // Left
  postorder(node.right) // Right
  visit(node)           // Root`,
  },
  levelorder: {
    name: "Level Order Traversal",
    desc: "BFS — visits nodes level by level from root to leaves.",
    steps: ["Enqueue root", "Dequeue node, visit it", "Enqueue left child if exists", "Enqueue right child if exists", "Repeat until queue empty", "✓ Traversal complete"],
    pseudo: `levelOrder(root):
  queue = [root]
  while queue not empty:
    node = queue.dequeue()
    visit(node)
    if node.left: queue.enqueue(node.left)
    if node.right: queue.enqueue(node.right)`,
  },
};

const CODE = {
  javascript: {
    insert: `class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

function insert(root, parentVal, val, side) {
  if (!root) return new TreeNode(val);
  const parent = find(root, parentVal);
  if (!parent) return root;
  const node = new TreeNode(val);
  if (side === "left" && !parent.left)
    parent.left = node;
  else if (side === "right" && !parent.right)
    parent.right = node;
  return root;
}`,
    search: `function search(node, val) {
  if (!node) return null;
  if (node.val === val) return node;
  return search(node.left, val)
    || search(node.right, val);
}`,
    inorder: `function inorder(node, result = []) {
  if (!node) return result;
  inorder(node.left, result);
  result.push(node.val);
  inorder(node.right, result);
  return result;
}`,
    preorder: `function preorder(node, result = []) {
  if (!node) return result;
  result.push(node.val);
  preorder(node.left, result);
  preorder(node.right, result);
  return result;
}`,
    postorder: `function postorder(node, result = []) {
  if (!node) return result;
  postorder(node.left, result);
  postorder(node.right, result);
  result.push(node.val);
  return result;
}`,
    levelorder: `function levelOrder(root) {
  if (!root) return [];
  const result = [], queue = [root];
  while (queue.length) {
    const node = queue.shift();
    result.push(node.val);
    if (node.left) queue.push(node.left);
    if (node.right) queue.push(node.right);
  }
  return result;
}`,
    delete: `function deleteNode(root, val) {
  if (!root) return null;
  if (val < root.val)
    root.left = deleteNode(root.left, val);
  else if (val > root.val)
    root.right = deleteNode(root.right, val);
  else {
    if (!root.left) return root.right;
    if (!root.right) return root.left;
    let succ = root.right;
    while (succ.left) succ = succ.left;
    root.val = succ.val;
    root.right = deleteNode(root.right, succ.val);
  }
  return root;
}`,
  },
  python: {
    insert: `class TreeNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def insert(root, parent_val, val, side):
    if not root:
        return TreeNode(val)
    parent = find(root, parent_val)
    if not parent:
        return root
    node = TreeNode(val)
    if side == "left" and not parent.left:
        parent.left = node
    elif side == "right" and not parent.right:
        parent.right = node
    return root`,
    search: `def search(node, val):
    if not node:
        return None
    if node.val == val:
        return node
    return search(node.left, val) or \
           search(node.right, val)`,
    inorder: `def inorder(node, result=None):
    if result is None: result = []
    if not node: return result
    inorder(node.left, result)
    result.append(node.val)
    inorder(node.right, result)
    return result`,
    preorder: `def preorder(node, result=None):
    if result is None: result = []
    if not node: return result
    result.append(node.val)
    preorder(node.left, result)
    preorder(node.right, result)
    return result`,
    postorder: `def postorder(node, result=None):
    if result is None: result = []
    if not node: return result
    postorder(node.left, result)
    postorder(node.right, result)
    result.append(node.val)
    return result`,
    levelorder: `from collections import deque
def level_order(root):
    if not root: return []
    result, queue = [], deque([root])
    while queue:
        node = queue.popleft()
        result.append(node.val)
        if node.left: queue.append(node.left)
        if node.right: queue.append(node.right)
    return result`,
    delete: `def delete(root, val):
    if not root: return None
    if val < root.val:
        root.left = delete(root.left, val)
    elif val > root.val:
        root.right = delete(root.right, val)
    else:
        if not root.left: return root.right
        if not root.right: return root.left
        succ = root.right
        while succ.left: succ = succ.left
        root.val = succ.val
        root.right = delete(root.right, succ.val)
    return root`,
  },
  java: {
    insert: `class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}

TreeNode insert(TreeNode root, int parentVal,
                int val, String side) {
    if (root == null) return new TreeNode(val);
    TreeNode parent = find(root, parentVal);
    if (parent == null) return root;
    TreeNode node = new TreeNode(val);
    if ("left".equals(side) && parent.left == null)
        parent.left = node;
    else if ("right".equals(side) && parent.right == null)
        parent.right = node;
    return root;
}`,
    inorder: `void inorder(TreeNode node, List<Integer> res) {
    if (node == null) return;
    inorder(node.left, res);
    res.add(node.val);
    inorder(node.right, res);
}`,
    search: `TreeNode search(TreeNode node, int val) {
    if (node == null) return null;
    if (node.val == val) return node;
    TreeNode left = search(node.left, val);
    return left != null ? left : search(node.right, val);
}`,
    preorder: `void preorder(TreeNode node, List<Integer> res) {
    if (node == null) return;
    res.add(node.val);
    preorder(node.left, res);
    preorder(node.right, res);
}`,
    postorder: `void postorder(TreeNode node, List<Integer> res) {
    if (node == null) return;
    postorder(node.left, res);
    postorder(node.right, res);
    res.add(node.val);
}`,
    levelorder: `List<Integer> levelOrder(TreeNode root) {
    List<Integer> res = new ArrayList<>();
    if (root == null) return res;
    Queue<TreeNode> q = new LinkedList<>();
    q.offer(root);
    while (!q.isEmpty()) {
        TreeNode n = q.poll();
        res.add(n.val);
        if (n.left != null) q.offer(n.left);
        if (n.right != null) q.offer(n.right);
    }
    return res;
}`,
    delete: `TreeNode delete(TreeNode root, int val) {
    if (root == null) return null;
    if (val < root.val) root.left = delete(root.left, val);
    else if (val > root.val) root.right = delete(root.right, val);
    else {
        if (root.left == null) return root.right;
        if (root.right == null) return root.left;
        TreeNode succ = root.right;
        while (succ.left != null) succ = succ.left;
        root.val = succ.val;
        root.right = delete(root.right, succ.val);
    }
    return root;
}`,
  },
  cpp: {
    insert: `struct TreeNode {
    int val;
    TreeNode *left, *right;
    TreeNode(int v): val(v), left(nullptr), right(nullptr){}
};

TreeNode* insert(TreeNode* root, int parentVal,
                 int val, string side) {
    if (!root) return new TreeNode(val);
    TreeNode* parent = find(root, parentVal);
    if (!parent) return root;
    TreeNode* node = new TreeNode(val);
    if (side == "left" && !parent->left)
        parent->left = node;
    else if (side == "right" && !parent->right)
        parent->right = node;
    return root;
}`,
    inorder: `void inorder(TreeNode* node, vector<int>& res) {
    if (!node) return;
    inorder(node->left, res);
    res.push_back(node->val);
    inorder(node->right, res);
}`,
    search: `TreeNode* search(TreeNode* node, int val) {
    if (!node) return nullptr;
    if (node->val == val) return node;
    TreeNode* l = search(node->left, val);
    return l ? l : search(node->right, val);
}`,
    preorder: `void preorder(TreeNode* node, vector<int>& res) {
    if (!node) return;
    res.push_back(node->val);
    preorder(node->left, res);
    preorder(node->right, res);
}`,
    postorder: `void postorder(TreeNode* node, vector<int>& res) {
    if (!node) return;
    postorder(node->left, res);
    postorder(node->right, res);
    res.push_back(node->val);
}`,
    levelorder: `vector<int> levelOrder(TreeNode* root) {
    vector<int> res;
    if (!root) return res;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        TreeNode* n = q.front(); q.pop();
        res.push_back(n->val);
        if (n->left) q.push(n->left);
        if (n->right) q.push(n->right);
    }
    return res;
}`,
    delete: `TreeNode* del(TreeNode* root, int val) {
    if (!root) return nullptr;
    if (val < root->val) root->left = del(root->left, val);
    else if (val > root->val) root->right = del(root->right, val);
    else {
        if (!root->left) return root->right;
        if (!root->right) return root->left;
        TreeNode* succ = root->right;
        while (succ->left) succ = succ->left;
        root->val = succ->val;
        root->right = del(root->right, succ->val);
    }
    return root;
}`,
  },
};

// ─── TREE NODE STRUCTURE ──────────────────────────────────────────────────────
let nodeCounter = 0;
function makeNode(val) {
  return { id: `n${++nodeCounter}`, val, left: null, right: null };
}

function buildFromArray(values) {
  if (!values.length) return null;
  const root = makeNode(values[0]);
  const queue = [root];
  let i = 1;
  while (i < values.length && queue.length) {
    const node = queue.shift();
    if (i < values.length) { node.left = makeNode(values[i++]); queue.push(node.left); }
    if (i < values.length) { node.right = makeNode(values[i++]); queue.push(node.right); }
  }
  return root;
}

function cloneTree(node) {
  if (!node) return null;
  return { ...node, id: node.id, left: cloneTree(node.left), right: cloneTree(node.right) };
}

function findNode(root, val) {
  if (!root) return null;
  if (root.val === val) return root;
  return findNode(root.left, val) || findNode(root.right, val);
}

function deleteNode(root, val) {
  if (!root) return null;
  if (root.val === val) {
    if (!root.left) return root.right;
    if (!root.right) return root.left;
    let succ = root.right;
    while (succ.left) succ = succ.left;
    root.val = succ.val;
    root.right = deleteNode(root.right, succ.val);
    return root;
  }
  root.left = deleteNode(root.left, val);
  root.right = deleteNode(root.right, val);
  return root;
}

function getPreorder(node, result = []) {
  if (!node) return result;
  result.push(node.val);
  getPreorder(node.left, result);
  getPreorder(node.right, result);
  return result;
}
function getInorder(node, result = []) {
  if (!node) return result;
  getInorder(node.left, result);
  result.push(node.val);
  getInorder(node.right, result);
  return result;
}
function getPostorder(node, result = []) {
  if (!node) return result;
  getPostorder(node.left, result);
  getPostorder(node.right, result);
  result.push(node.val);
  return result;
}
function getLevelOrder(root) {
  if (!root) return [];
  const result = [], queue = [root];
  while (queue.length) {
    const n = queue.shift();
    result.push(n.val);
    if (n.left) queue.push(n.left);
    if (n.right) queue.push(n.right);
  }
  return result;
}

function getSearchPath(root, val) {
  const path = [];
  function dfs(node) {
    if (!node) return false;
    path.push(node.val);
    if (node.val === val) return true;
    if (dfs(node.left) || dfs(node.right)) return true;
    path.pop();
    return false;
  }
  dfs(root);
  return path;
}

function getTreeStats(root) {
  if (!root) return { depth: 0, total: 0, leaves: 0, internal: 0 };
  function height(n) { return !n ? 0 : 1 + Math.max(height(n.left), height(n.right)); }
  function count(n) { return !n ? 0 : 1 + count(n.left) + count(n.right); }
  function leaves(n) { return !n ? 0 : (!n.left && !n.right) ? 1 : leaves(n.left) + leaves(n.right); }
  const total = count(root);
  const l = leaves(root);
  return { depth: height(root), total, leaves: l, internal: total - l };
}

// ─── LAYOUT COMPUTATION ───────────────────────────────────────────────────────
function computeLayout(root) {
  const positions = {};
  const H_GAP = 64, V_GAP = 80;

  function assignX(node, lo, hi) {
    if (!node) return;
    const mid = (lo + hi) / 2;
    positions[node.id] = { x: mid };
    assignX(node.left, lo, mid);
    assignX(node.right, mid, hi);
  }

  function getDepth(n) { return !n ? 0 : 1 + Math.max(getDepth(n.left), getDepth(n.right)); }
  const d = getDepth(root);
  const totalWidth = Math.pow(2, d) * H_GAP;

  assignX(root, 0, totalWidth);

  function assignY(node, level = 0) {
    if (!node) return;
    positions[node.id].y = level * V_GAP;
    assignY(node.left, level + 1);
    assignY(node.right, level + 1);
  }
  assignY(root);

  return positions;
}

// ─── TREE CANVAS ─────────────────────────────────────────────────────────────
function TreeCanvas({ root, highlightedVals, foundVals, newNodeVal, deletedVals }) {
  const canvasRef = useRef(null);

  const { nodes, edges, positions } = useMemo(() => {
    if (!root) return { nodes: [], edges: [], positions: {} };
    const positions = computeLayout(root);
    const nodesArr = [];
    const edgesArr = [];

    function traverse(node) {
      if (!node) return;
      nodesArr.push({ id: node.id, val: node.val, pos: positions[node.id] });
      if (node.left) {
        edgesArr.push({ from: node.id, to: node.left.id, fromPos: positions[node.id], toPos: positions[node.left.id], label: "L" });
        traverse(node.left);
      }
      if (node.right) {
        edgesArr.push({ from: node.id, to: node.right.id, fromPos: positions[node.id], toPos: positions[node.right.id], label: "R" });
        traverse(node.right);
      }
    }
    traverse(root);
    return { nodes: nodesArr, edges: edgesArr, positions };
  }, [root]);

  if (!root) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: T.bg, borderRadius: 12, border: `1px solid ${T.border}`, minHeight: 250,
      backgroundImage: `radial-gradient(circle at 30% 40%, ${T.accent}06 0%, transparent 50%), radial-gradient(circle at 70% 60%, ${T.teal}06 0%, transparent 50%)` }}>
      <div style={{ textAlign: "center", color: T.muted }}>
        <div style={{ fontSize: 36, opacity: .15, marginBottom: 10 }}>⬡</div>
        <div className="mono" style={{ fontSize: 12 }}>Empty Tree</div>
        <div style={{ fontSize: 11, marginTop: 4 }}>Create or insert nodes to begin</div>
      </div>
    </div>
  );

  const xs = nodes.map(n => n.pos.x);
  const ys = nodes.map(n => n.pos.y);
  const minX = Math.min(...xs) - 50;
  const maxX = Math.max(...xs) + 50;
  const minY = Math.min(...ys) - 30;
  const maxY = Math.max(...ys) + 50;
  const w = maxX - minX;
  const h = maxY - minY;

  const NODE_R = 22;

  return (
    <div ref={canvasRef} style={{
      flex: 1, overflowX: "auto", overflowY: "auto",
      background: T.bg,
      backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 39px,${T.border}18 39px,${T.border}18 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,${T.border}18 39px,${T.border}18 40px),radial-gradient(ellipse at 50% 30%,${T.accent}05 0%,transparent 60%)`,
      borderRadius: 12, border: `1px solid ${T.border}`,
      minHeight: 250,
    }}>
      <svg width={Math.max(600, w + 40)} height={Math.max(280, h + 60)} style={{ display: "block", margin: "0 auto" }}>
        <defs>
          <filter id="nodeGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {edges.map((e, i) => {
          const x1 = e.fromPos.x - minX + 20;
          const y1 = e.fromPos.y - minY + 30;
          const x2 = e.toPos.x - minX + 20;
          const y2 = e.toPos.y - minY + 30;
          const isHighlighted = highlightedVals && nodes.find(n => n.id === e.to)?.val !== undefined &&
            highlightedVals.includes(nodes.find(n => n.id === e.to)?.val);
          return (
            <g key={i}>
              <line x1={x1} y1={y1 + NODE_R} x2={x2} y2={y2 - NODE_R}
                stroke={isHighlighted ? T.accent : T.border}
                strokeWidth={isHighlighted ? 2 : 1.5}
                strokeDasharray={isHighlighted ? "none" : "none"}
                style={{ transition: "stroke .3s" }}
              />
              <text x={(x1 + x2) / 2 + (e.label === "L" ? -8 : 8)} y={(y1 + y2) / 2}
                fill={T.muted} fontSize={9} fontFamily="IBM Plex Mono" textAnchor="middle">{e.label}</text>
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map(node => {
          const cx = node.pos.x - minX + 20;
          const cy = node.pos.y - minY + 30;
          const isHigh = highlightedVals?.includes(node.val);
          const isFound = foundVals?.includes(node.val);
          const isNew = newNodeVal === node.val;
          const isDel = deletedVals?.includes(node.val);
          const isRoot = node.id === root?.id;

          let fill = T.nodeDefault;
          let stroke = T.border;
          let textColor = T.text;
          let glow = false;

          if (isFound) { fill = `${T.teal}30`; stroke = T.teal; textColor = T.teal; glow = true; }
          else if (isHigh) { fill = `${T.accent}30`; stroke = T.accent; textColor = T.accent; glow = true; }
          else if (isNew) { fill = `${T.green}25`; stroke = T.green; textColor = T.green; glow = true; }
          else if (isDel) { fill = `${T.red}25`; stroke = T.red; textColor = T.red; glow = true; }
          else if (isRoot) { fill = `${T.amber}18`; stroke = T.amber; textColor = T.amber; }

          return (
            <g key={node.id} filter={glow ? "url(#nodeGlow)" : ""} style={{ transition: "all .3s" }}>
              {/* Outer ring for root */}
              {isRoot && <circle cx={cx} cy={cy} r={NODE_R + 5} fill="none" stroke={T.amber} strokeWidth={1} strokeDasharray="4 3" opacity={0.5} />}
              <circle cx={cx} cy={cy} r={NODE_R} fill={fill} stroke={stroke} strokeWidth={1.5} style={{ transition: "fill .3s, stroke .3s" }} />
              <text x={cx} y={cy + 5} fill={textColor} fontSize={13} fontFamily="IBM Plex Mono" fontWeight="700" textAnchor="middle" style={{ transition: "fill .3s" }}>{node.val}</text>
              {isRoot && <text x={cx} y={cy - NODE_R - 8} fill={T.amber} fontSize={8} fontFamily="IBM Plex Mono" textAnchor="middle" letterSpacing={1}>ROOT</text>}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── ALGO FLOW ────────────────────────────────────────────────────────────────
function AlgoFlow({ operation, currentStep }) {
  const info = ALGO_INFO[operation];
  if (!info) return <div style={{ color: T.muted, fontSize: 11 }}>Select an operation</div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {info.steps.map((step, i) => (
        <div key={i} style={{
          display: "flex", gap: 8, alignItems: "flex-start",
          padding: "6px 8px", borderRadius: 6,
          background: currentStep === i ? `${T.accent}18` : currentStep > i ? `${T.teal}08` : "transparent",
          border: `1px solid ${currentStep === i ? T.accent + "40" : "transparent"}`,
          transition: "all .3s",
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 1,
            background: currentStep > i ? `${T.teal}25` : currentStep === i ? `${T.accent}25` : T.dim,
            border: `1.5px solid ${currentStep > i ? T.teal : currentStep === i ? T.accent : T.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 8, fontFamily: "IBM Plex Mono",
            color: currentStep > i ? T.teal : currentStep === i ? T.accent : T.muted, fontWeight: 700,
          }}>{currentStep > i ? "✓" : i + 1}</div>
          <span style={{ fontSize: 11, color: currentStep === i ? T.text : currentStep > i ? T.teal : T.muted, lineHeight: 1.5 }}>{step}</span>
        </div>
      ))}
    </div>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null;
  const c = type === "error" ? T.red : type === "warn" ? T.amber : T.teal;
  return (
    <div style={{
      position: "fixed", bottom: 20, right: 20,
      padding: "10px 18px", borderRadius: 8,
      background: `${c}15`, border: `1px solid ${c}50`, color: c,
      fontFamily: "IBM Plex Mono", fontSize: 11, zIndex: 999,
      animation: "fadeUp .3s ease",
    }}>
      {type === "error" ? "⚠ " : type === "warn" ? "⚡ " : "✓ "}{msg}
    </div>
  );
}

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const G = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:${T.bg};color:${T.text};font-family:'Plus Jakarta Sans',sans-serif;}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:${T.surface};}
::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
@keyframes nodeIn{from{opacity:0;transform:scale(0);}to{opacity:1;transform:scale(1);}}
.panel{background:${T.panel};border:1px solid ${T.border};border-radius:12px;}
.mono{font-family:'IBM Plex Mono',monospace;}
.btn{background:${T.panel};border:1px solid ${T.border};color:${T.muted};padding:7px 14px;border-radius:7px;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-size:12px;transition:all .2s;white-space:nowrap;}
.btn:hover{color:${T.text};border-color:${T.muted};}
.btn:disabled{opacity:.3;cursor:not-allowed;}
.btn-violet{background:${T.accent}18;border-color:${T.accent}50;color:${T.accent};}
.btn-violet:hover{background:${T.accent}28;border-color:${T.accent};box-shadow:0 0 14px ${T.accent}30;}
.btn-teal{background:${T.teal}18;border-color:${T.teal}50;color:${T.teal};}
.btn-teal:hover{background:${T.teal}28;border-color:${T.teal};}
.btn-red{background:${T.red}18;border-color:${T.red}50;color:${T.red};}
.btn-red:hover{background:${T.red}28;border-color:${T.red};}
.btn-amber{background:${T.amber}18;border-color:${T.amber}50;color:${T.amber};}
.btn-amber:hover{background:${T.amber}28;border-color:${T.amber};}
.btn-green{background:${T.green}18;border-color:${T.green}50;color:${T.green};}
.btn-green:hover{background:${T.green}28;border-color:${T.green};}
.btn-orange{background:${T.orange}18;border-color:${T.orange}50;color:${T.orange};}
.btn-orange:hover{background:${T.orange}28;border-color:${T.orange};}
.inp{background:${T.surface};border:1px solid ${T.border};color:${T.text};padding:7px 11px;border-radius:7px;font-family:'IBM Plex Mono',monospace;font-size:12px;outline:none;transition:border-color .2s;width:100%;}
.inp:focus{border-color:${T.accent}70;}
.inp::placeholder{color:${T.muted};}
select.inp{cursor:pointer;}
.code-view{background:#040507;border:1px solid ${T.border};border-radius:8px;padding:13px;font-family:'IBM Plex Mono',monospace;font-size:11px;line-height:1.8;color:#7d91ad;overflow:auto;white-space:pre;max-height:210px;}
.tab-a{border-bottom:2px solid ${T.accent};color:${T.accent};background:${T.accent}10;}
.tab-i{border-bottom:2px solid transparent;color:${T.muted};}
.tab-i:hover{color:${T.text};}
.slider{-webkit-appearance:none;width:100%;height:3px;border-radius:2px;background:${T.border};outline:none;}
.slider::-webkit-slider-thumb{-webkit-appearance:none;width:13px;height:13px;border-radius:50%;background:${T.accent};cursor:pointer;box-shadow:0 0 7px ${T.accent}60;}
`;

// ─── DEFAULT TREE ──────────────────────────────────────────────────────────────
function buildDefaultTree() {
  return buildFromArray([10, 20, 30, 40, 50, 60]);
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [root, setRoot] = useState(buildDefaultTree);
  const [manualInput, setManualInput] = useState("10,20,30,40,50,60");
  const [randDepth, setRandDepth] = useState(3);

  const [nodeVal, setNodeVal] = useState("");
  const [targetVal, setTargetVal] = useState("");
  const [insertSide, setInsertSide] = useState("left");

  const [highlightedVals, setHighlightedVals] = useState([]);
  const [foundVals, setFoundVals] = useState([]);
  const [newNodeVal, setNewNodeVal] = useState(null);
  const [deletedVals, setDeletedVals] = useState([]);

  const [operation, setOperation] = useState(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [traversalResult, setTraversalResult] = useState([]);
  const [stepDesc, setStepDesc] = useState("");

  const [speed, setSpeed] = useState(1);
  const [mode, setMode] = useState("auto");
  const [codeTab, setCodeTab] = useState("javascript");
  const [infoTab, setInfoTab] = useState("steps");
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const delay = useCallback((ms) => new Promise(r => setTimeout(r, ms)), []);
  const animDelay = useCallback(() => delay(Math.round(600 / speed)), [delay, speed]);

  const setStep = useCallback((i, op) => {
    setCurrentStep(i);
    if (op && ALGO_INFO[op]) setStepDesc(ALGO_INFO[op].steps[i] || "");
  }, []);

  const stats = useMemo(() => getTreeStats(root), [root]);

  // ── Create ──
  const handleCreate = useCallback(() => {
    const vals = manualInput.split(",").map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    if (!vals.length) { showToast("Enter valid comma-separated values", "error"); return; }
    setRoot(buildFromArray(vals));
    setHighlightedVals([]); setFoundVals([]); setTraversalResult([]); setOperation(null); setCurrentStep(-1);
    showToast(`Tree created with ${vals.length} nodes`);
  }, [manualInput, showToast]);

  const handleReset = useCallback(() => {
    setRoot(buildDefaultTree());
    setManualInput("10,20,30,40,50,60");
    setHighlightedVals([]); setFoundVals([]); setTraversalResult([]); setOperation(null); setCurrentStep(-1);
    showToast("Tree reset to default");
  }, [showToast]);

  const handleRandom = useCallback(() => {
    function buildRandom(depth, min = 1, max = 99) {
      if (depth <= 0) return null;
      const val = Math.floor(Math.random() * (max - min + 1)) + min;
      const node = makeNode(val);
      if (depth > 1) {
        if (Math.random() > 0.25) node.left = buildRandom(depth - 1);
        if (Math.random() > 0.25) node.right = buildRandom(depth - 1);
      }
      return node;
    }
    const newRoot = buildRandom(randDepth);
    setRoot(newRoot);
    setHighlightedVals([]); setFoundVals([]); setTraversalResult([]); setOperation(null);
    showToast("Random tree generated");
  }, [randDepth, showToast]);

  // ── Insert ──
  const handleInsert = useCallback(async () => {
    const v = parseInt(nodeVal, 10);
    if (isNaN(v)) { showToast("Enter a valid integer value", "error"); return; }
    setOperation("insert");

    if (!root) {
      setStep(0, "insert");
      await animDelay();
      setRoot(makeNode(v));
      setNewNodeVal(v);
      setStep(5, "insert");
      setTimeout(() => { setNewNodeVal(null); setCurrentStep(-1); }, 1200);
      showToast(`Created root node ${v}`);
      setNodeVal("");
      return;
    }

    const tv = parseInt(targetVal, 10);
    if (isNaN(tv)) { showToast("Enter target parent value", "error"); return; }
    setStep(1, "insert");
    await animDelay();

    const parent = findNode(root, tv);
    if (!parent) { showToast(`Node ${tv} not found`, "error"); setCurrentStep(-1); return; }

    if (insertSide === "left" && parent.left) { showToast(`Node ${tv} already has a left child`, "error"); setCurrentStep(-1); return; }
    if (insertSide === "right" && parent.right) { showToast(`Node ${tv} already has a right child`, "error"); setCurrentStep(-1); return; }

    setStep(2, "insert");
    await animDelay();
    setStep(3, "insert");
    await animDelay();

    const newRoot = cloneTree(root);
    const p2 = findNode(newRoot, tv);
    const newN = makeNode(v);
    if (insertSide === "left") p2.left = newN;
    else p2.right = newN;

    setRoot(newRoot);
    setNewNodeVal(v);
    setStep(4, "insert");
    await animDelay();
    setStep(5, "insert");
    setTimeout(() => { setNewNodeVal(null); setCurrentStep(-1); setStepDesc(""); }, 1000);
    setNodeVal("");
    showToast(`Inserted ${v} as ${insertSide} child of ${tv}`);
  }, [nodeVal, targetVal, insertSide, root, animDelay, setStep, showToast]);

  // ── Delete ──
  const handleDelete = useCallback(async () => {
    const v = parseInt(nodeVal, 10);
    if (isNaN(v)) { showToast("Enter a value to delete", "error"); return; }
    setOperation("delete");
    setStep(0, "delete");
    await animDelay();

    const found = findNode(root, v);
    if (!found) { showToast(`Node ${v} not found in tree`, "error"); setCurrentStep(-1); return; }

    setDeletedVals([v]);
    setStep(1, "delete");
    await animDelay();
    setStep(2, "delete");
    await animDelay();

    const newRoot = cloneTree(root);
    setRoot(deleteNode(newRoot, v));
    setDeletedVals([]);
    setStep(5, "delete");
    setTimeout(() => { setCurrentStep(-1); setStepDesc(""); }, 600);
    setNodeVal("");
    showToast(`Deleted node ${v}`);
  }, [nodeVal, root, animDelay, setStep, showToast]);

  // ── Search ──
  const handleSearch = useCallback(async () => {
    const v = parseInt(nodeVal, 10);
    if (isNaN(v)) { showToast("Enter a value to search", "error"); return; }
    setOperation("search");
    setFoundVals([]);
    const path = getSearchPath(root, v);
    setStep(0, "search");
    await animDelay();

    for (let i = 0; i < path.length; i++) {
      setHighlightedVals(path.slice(0, i + 1));
      setStep(i === 0 ? 1 : 3, "search");
      await animDelay();
      if (path[i] === v) {
        setFoundVals([v]);
        setStep(2, "search");
        showToast(`Found node ${v} at depth ${i + 1}`);
        await delay(1400);
        break;
      }
    }

    if (!path.includes(v)) { showToast(`Value ${v} not found`, "error"); setStep(5, "search"); }
    setTimeout(() => { setHighlightedVals([]); setFoundVals([]); setCurrentStep(-1); setStepDesc(""); }, 800);
  }, [nodeVal, root, animDelay, delay, setStep, showToast]);

  // ── Traversals ──
  const runTraversal = useCallback(async (type) => {
    if (!root) { showToast("Tree is empty", "warn"); return; }
    setOperation(type);
    setTraversalResult([]);
    setHighlightedVals([]);
    setCurrentStep(0);

    let order;
    if (type === "preorder") order = getPreorder(root);
    else if (type === "inorder") order = getInorder(root);
    else if (type === "postorder") order = getPostorder(root);
    else order = getLevelOrder(root);

    for (let i = 0; i < order.length; i++) {
      setHighlightedVals([order[i]]);
      setCurrentStep(Math.min(i, 3));
      await animDelay();
    }
    setTraversalResult([...order]);
    setHighlightedVals([]);
    setCurrentStep(4);
    setTimeout(() => { setCurrentStep(-1); setStepDesc(""); }, 600);
    showToast(`${type} traversal complete`);
  }, [root, animDelay, showToast]);

  const opCodeKey = (operation === "preorder" || operation === "inorder" || operation === "postorder" || operation === "levelorder")
    ? operation : operation || "inorder";

  return (
    <>
      <style>{G}</style>
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column" }}>

        {/* ── HEADER ── */}
        <header style={{ background: T.panel, borderBottom: `1px solid ${T.border}`, height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 28, height: 28, background: `linear-gradient(135deg, ${T.accent}, ${T.teal})`, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900 }}>⬡</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: .5 }}>DSA Visualizer</div>
              <div className="mono" style={{ fontSize: 9, color: T.muted, marginTop: -2 }}>Binary Tree Explorer</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {[
              { label: `Depth: ${stats.depth}`, color: T.accent },
              { label: `Nodes: ${stats.total}`, color: T.teal },
              { label: `Leaves: ${stats.leaves}`, color: T.amber },
            ].map(({ label, color }) => (
              <span key={label} className="mono" style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: `${color}15`, border: `1px solid ${color}30`, color }}>{label}</span>
            ))}
          </div>
        </header>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 14, gap: 12, overflow: "hidden" }}>

          {/* ── INIT PANEL ── */}
          <div className="panel" style={{ padding: 14, flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: "2 1 200px" }}>
                <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 5 }}>NODE VALUES (comma-separated)</label>
                <input className="inp" value={manualInput} onChange={e => setManualInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCreate()} placeholder="e.g. 10,20,30,40,50,60" />
              </div>
              <div style={{ flex: "1 1 130px" }}>
                <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 5 }}>RANDOM DEPTH: <span style={{ color: T.accent }}>{randDepth}</span></label>
                <input type="range" min={1} max={5} value={randDepth} onChange={e => setRandDepth(+e.target.value)} className="slider" />
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-violet" onClick={handleCreate}>Create</button>
                <button className="btn btn-amber" onClick={handleRandom}>Random</button>
                <button className="btn" onClick={handleReset}>Reset</button>
              </div>
              <div style={{ flex: "1 1 130px" }}>
                <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 5 }}>SPEED: <span style={{ color: T.accent }}>{speed}x</span></label>
                <input type="range" min={0.25} max={3} step={0.25} value={speed} onChange={e => setSpeed(+e.target.value)} className="slider" />
              </div>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1 }}>MODE</label>
                <button className={`btn${mode === "auto" ? " btn-violet" : ""}`} style={{ fontSize: 11, padding: "5px 10px" }} onClick={() => setMode("auto")}>Auto</button>
                <button className={`btn${mode === "step" ? " btn-violet" : ""}`} style={{ fontSize: 11, padding: "5px 10px" }} onClick={() => setMode("step")}>Step</button>
              </div>
            </div>
          </div>

          {/* ── MAIN ── */}
          <div style={{ flex: 1, display: "flex", gap: 14, overflow: "hidden", minHeight: 0 }}>

            {/* CENTER */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, overflow: "hidden", minWidth: 0 }}>

              {/* Canvas */}
              <div style={{ flex: 1, minHeight: 250, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <TreeCanvas
                  root={root}
                  highlightedVals={highlightedVals}
                  foundVals={foundVals}
                  newNodeVal={newNodeVal}
                  deletedVals={deletedVals}
                />
              </div>

              {/* Traversal result */}
              {traversalResult.length > 0 && (
                <div className="panel" style={{ padding: "8px 14px", flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1 }}>{(operation || "").toUpperCase()}</span>
                    <div className="mono" style={{ fontSize: 11, color: T.accent }}>
                      {traversalResult.join(" → ")}
                    </div>
                  </div>
                </div>
              )}

              {/* Ops + Traversal panel */}
              <div style={{ display: "flex", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
                {/* Operations */}
                <div className="panel" style={{ padding: 14, flex: "1 1 300px" }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
                    <div style={{ flex: "1 1 90px" }}>
                      <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 4 }}>NODE VALUE</label>
                      <input className="inp" type="number" value={nodeVal} onChange={e => setNodeVal(e.target.value)} placeholder="42" onKeyDown={e => e.key === "Enter" && handleInsert()} />
                    </div>
                    <div style={{ flex: "1 1 90px" }}>
                      <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 4 }}>PARENT VALUE</label>
                      <input className="inp" type="number" value={targetVal} onChange={e => setTargetVal(e.target.value)} placeholder="parent" />
                    </div>
                    <div style={{ flex: "0 1 100px" }}>
                      <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 4 }}>SIDE</label>
                      <select className="inp" value={insertSide} onChange={e => setInsertSide(e.target.value)}>
                        <option value="left">Left Child</option>
                        <option value="right">Right Child</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                      <button className="btn btn-violet" onClick={handleInsert}>Insert</button>
                      <button className="btn btn-red" onClick={handleDelete}>Delete</button>
                      <button className="btn btn-teal" onClick={handleSearch}>Search</button>
                    </div>
                  </div>
                  {stepDesc && (
                    <div style={{ marginTop: 10, padding: "6px 12px", background: `${T.accent}10`, border: `1px solid ${T.accent}25`, borderRadius: 6 }}>
                      <span className="mono" style={{ fontSize: 11, color: T.accent }}>▶ {stepDesc}</span>
                    </div>
                  )}
                </div>

                {/* Traversals */}
                <div className="panel" style={{ padding: 14, flexShrink: 0 }}>
                  <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 8 }}>TRAVERSALS</label>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <button className="btn btn-amber" onClick={() => runTraversal("preorder")}>Preorder</button>
                    <button className="btn btn-green" onClick={() => runTraversal("inorder")}>Inorder</button>
                    <button className="btn btn-orange" onClick={() => runTraversal("postorder")}>Postorder</button>
                    <button className="btn btn-teal" onClick={() => runTraversal("levelorder")}>Level Order</button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div style={{ width: 292, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12, overflow: "auto" }}>

              {/* Algo info */}
              <div className="panel" style={{ padding: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 3 }}>
                  {operation ? ALGO_INFO[operation]?.name : "Select an Operation"}
                </div>
                <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.6, marginBottom: 12 }}>
                  {operation ? ALGO_INFO[operation]?.desc : "Run insert, delete, search or a traversal to see the algorithm explanation."}
                </div>

                <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, marginBottom: 10 }}>
                  {["steps", "pseudo", "complexity"].map(t => (
                    <button key={t} onClick={() => setInfoTab(t)} className={infoTab === t ? "tab-a" : "tab-i"}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 9px", fontSize: 9, fontWeight: 700, letterSpacing: .5, fontFamily: "'Plus Jakarta Sans'" }}>
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>

                {infoTab === "steps" && <AlgoFlow operation={operation} currentStep={currentStep} />}

                {infoTab === "pseudo" && (
                  <div className="code-view">{operation ? ALGO_INFO[operation].pseudo : "// Select an operation"}</div>
                )}

                {infoTab === "complexity" && (
                  <div>
                    {operation ? (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {[
                          { label: "TIME", val: COMPLEXITY[operation]?.time, color: T.accent },
                          { label: "SPACE", val: COMPLEXITY[operation]?.space, color: T.teal },
                        ].map(({ label, val, color }) => (
                          <div key={label} style={{ textAlign: "center", padding: "10px 8px", background: `${color}10`, border: `1px solid ${color}25`, borderRadius: 8 }}>
                            <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>{label}</div>
                            <div className="mono" style={{ fontSize: 18, fontWeight: 700, color }}>{val}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {Object.entries(COMPLEXITY).map(([op, c]) => (
                          <div key={op} style={{ display: "flex", justifyContent: "space-between", padding: "5px 8px", background: T.dim, borderRadius: 6 }}>
                            <span className="mono" style={{ fontSize: 11, color: T.muted }}>{op}</span>
                            <div style={{ display: "flex", gap: 6 }}>
                              <span className="mono" style={{ fontSize: 11, color: T.accent }}>{c.time}</span>
                              <span className="mono" style={{ fontSize: 10, color: T.muted }}>/ {c.space}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tree stats */}
              <div className="panel" style={{ padding: 14 }}>
                <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>TREE PROPERTIES</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { label: "HEIGHT", val: stats.depth, color: T.accent },
                    { label: "TOTAL NODES", val: stats.total, color: T.teal },
                    { label: "LEAF NODES", val: stats.leaves, color: T.amber },
                    { label: "INTERNAL", val: stats.internal, color: T.orange },
                  ].map(({ label, val, color }) => (
                    <div key={label} style={{ textAlign: "center", padding: "8px", background: `${color}10`, border: `1px solid ${color}25`, borderRadius: 7 }}>
                      <div style={{ fontSize: 8, color: T.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>{label}</div>
                      <div className="mono" style={{ fontSize: 20, fontWeight: 700, color }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code viewer */}
              <div className="panel" style={{ padding: 14 }}>
                <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>CODE</div>
                <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, marginBottom: 8 }}>
                  {["javascript", "python", "java", "cpp"].map(l => (
                    <button key={l} onClick={() => setCodeTab(l)} className={codeTab === l ? "tab-a" : "tab-i"}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "3px 8px", fontSize: 9, fontWeight: 700, letterSpacing: .5, fontFamily: "IBM Plex Mono" }}>
                      {l === "cpp" ? "C++" : l === "javascript" ? "JS" : l.charAt(0).toUpperCase() + l.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="code-view">{CODE[codeTab][opCodeKey] || CODE[codeTab].inorder}</div>
              </div>

              {/* Legend */}
              <div className="panel" style={{ padding: 14 }}>
                <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>NODE LEGEND</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                  {[
                    { color: T.amber,  label: "Root" },
                    { color: T.accent, label: "Visiting" },
                    { color: T.teal,   label: "Found" },
                    { color: T.green,  label: "Inserted" },
                    { color: T.red,    label: "Deleted" },
                  ].map(({ color, label }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 12, height: 12, borderRadius: "50%", background: `${color}30`, border: `1.5px solid ${color}` }} />
                      <span style={{ fontSize: 10, color: T.muted }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {toast && <Toast msg={toast.msg} type={toast.type} />}
      </div>
    </>
  );
}
