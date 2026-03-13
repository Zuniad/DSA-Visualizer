import { useState, useEffect, useRef, useCallback } from "react";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const ALGORITHMS = {
  bfs: {
    id: "bfs", title: "Breadth-First Search", time: "O(V + E)", space: "O(V)",
    description: "Explores level-by-level using a Queue. Finds shortest path in unweighted graphs.",
    code: {
      js: `function bfs(graph, start) {\n  let queue = [start];\n  let visited = new Set([start]);\n  while (queue.length > 0) {\n    let node = queue.shift();\n    console.log(node);\n    for (let nb of graph[node]) {\n      if (!visited.has(nb)) {\n        visited.add(nb);\n        queue.push(nb);\n      }\n    }\n  }\n}`,
      py: `def bfs(graph, start):\n    queue, visited = [start], {start}\n    while queue:\n        node = queue.pop(0)\n        print(node)\n        for nb in graph[node]:\n            if nb not in visited:\n                visited.add(nb)\n                queue.append(nb)`,
      java: `void bfs(Map<Integer,List<Integer>> g, int s) {\n    Queue<Integer> q = new LinkedList<>();\n    Set<Integer> vis = new HashSet<>();\n    q.add(s); vis.add(s);\n    while (!q.isEmpty()) {\n        int n = q.poll();\n        for (int nb : g.getOrDefault(n, List.of()))\n            if (vis.add(nb)) q.add(nb);\n    }\n}`,
    },
  },
  dfs: {
    id: "dfs", title: "Depth-First Search", time: "O(V + E)", space: "O(V)",
    description: "Explores as deep as possible before backtracking. Uses recursion/stack. Good for cycle detection.",
    code: {
      js: `function dfs(graph, node, visited = new Set()) {\n  visited.add(node);\n  console.log(node);\n  for (let nb of graph[node])\n    if (!visited.has(nb))\n      dfs(graph, nb, visited);\n}`,
      py: `def dfs(graph, node, visited=None):\n    if visited is None: visited = set()\n    visited.add(node)\n    print(node)\n    for nb in graph[node]:\n        if nb not in visited:\n            dfs(graph, nb, visited)`,
      java: `void dfs(Map<Integer,List<Integer>> g, int n, Set<Integer> vis) {\n    vis.add(n);\n    for (int nb : g.getOrDefault(n, List.of()))\n        if (!vis.contains(nb)) dfs(g, nb, vis);\n}`,
    },
  },
  dijkstra: {
    id: "dijkstra", title: "Dijkstra's Algorithm", time: "O(E log V)", space: "O(V)",
    description: "Shortest paths from source to all nodes in weighted graph. Requires non-negative weights.",
    code: {
      js: `function dijkstra(graph, start) {\n  const dist = {};\n  for (let n in graph) dist[n] = Infinity;\n  dist[start] = 0;\n  const pq = [[0, start]];\n  while (pq.length) {\n    pq.sort((a,b)=>a[0]-b[0]);\n    const [d, u] = pq.shift();\n    for (let [v, w] of graph[u]) {\n      if (d + w < dist[v]) {\n        dist[v] = d + w;\n        pq.push([dist[v], v]);\n      }\n    }\n  }\n  return dist;\n}`,
      py: `import heapq\ndef dijkstra(graph, start):\n    dist = {n: float('inf') for n in graph}\n    dist[start] = 0\n    pq = [(0, start)]\n    while pq:\n        d, u = heapq.heappop(pq)\n        if d > dist[u]: continue\n        for v, w in graph[u]:\n            if d+w < dist[v]:\n                dist[v] = d+w\n                heapq.heappush(pq,(dist[v],v))\n    return dist`,
      java: `Map<Integer,Integer> dijkstra(Graph g, int s) {\n    // standard PQ-based Dijkstra\n}`,
    },
  },
  kruskal: {
    id: "kruskal", title: "Kruskal's MST", time: "O(E log E)", space: "O(V)",
    description: "Minimum Spanning Tree by greedily picking smallest edges that don't form cycles via Union-Find.",
    code: {
      js: `function kruskal(edges, n) {\n  edges.sort((a,b)=>a.w-b.w);\n  const par = Array.from({length:n},(_,i)=>i);\n  const find = i => par[i]===i ? i : find(par[i]);\n  const mst = [];\n  for (let {u,v,w} of edges) {\n    const pu=find(u), pv=find(v);\n    if (pu!==pv) { par[pu]=pv; mst.push({u,v,w}); }\n  }\n  return mst;\n}`,
      py: `def kruskal(edges, n):\n    edges.sort(key=lambda e: e[2])\n    par = list(range(n))\n    def find(i): return i if par[i]==i else find(par[i])\n    mst = []\n    for u,v,w in edges:\n        pu,pv = find(u),find(v)\n        if pu!=pv: par[pu]=pv; mst.append((u,v,w))\n    return mst`,
      java: `List<int[]> kruskal(int[][] edges, int n) {\n    Arrays.sort(edges,(a,b)->a[2]-b[2]);\n    // Union-Find based MST\n}`,
    },
  },
};

const PRESETS = {
  directed_weighted: {
    nodes: [
      { id: "A", x: 150, y: 130 }, { id: "B", x: 340, y: 80 },
      { id: "C", x: 100, y: 290 }, { id: "D", x: 310, y: 280 },
      { id: "E", x: 490, y: 200 }, { id: "F", x: 240, y: 420 },
    ],
    edges: [
      { id: "e1", u: "A", v: "B", w: 4 }, { id: "e2", u: "A", v: "C", w: 2 },
      { id: "e3", u: "B", v: "D", w: 1 }, { id: "e4", u: "B", v: "E", w: 6 },
      { id: "e5", u: "C", v: "D", w: 5 }, { id: "e6", u: "C", v: "F", w: 8 },
      { id: "e7", u: "D", v: "E", w: 3 }, { id: "e8", u: "D", v: "F", w: 2 },
    ],
    directed: true, weighted: true,
  },
  undirected_unweighted: {
    nodes: [
      { id: "A", x: 250, y: 90 }, { id: "B", x: 100, y: 220 },
      { id: "C", x: 400, y: 220 }, { id: "D", x: 170, y: 370 },
      { id: "E", x: 330, y: 370 }, { id: "F", x: 250, y: 480 },
    ],
    edges: [
      { id: "e1", u: "A", v: "B", w: 1 }, { id: "e2", u: "A", v: "C", w: 1 },
      { id: "e3", u: "B", v: "D", w: 1 }, { id: "e4", u: "C", v: "E", w: 1 },
      { id: "e5", u: "D", v: "E", w: 1 }, { id: "e6", u: "D", v: "F", w: 1 },
      { id: "e7", u: "E", v: "F", w: 1 },
    ],
    directed: false, weighted: false,
  },
};

const MODES = { MOVE: "move", ADD_NODE: "add_node", ADD_EDGE: "add_edge", ERASE: "erase" };
// Dynamic radius: single letter=22, two letters=28
function nodeR(id) { return id && id.length > 1 ? 28 : 22; }
const NODE_R = 22; // fallback default
let eid = 0;
const newEid = () => `e${++eid}`;
let nid = 0;
const newNid = () => `N${++nid}`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getNeighbors(nodeId, edges, directed) {
  const nb = [];
  edges.forEach((e) => {
    if (e.u === nodeId) nb.push({ id: e.v, w: e.w, eid: e.id });
    if (!directed && e.v === nodeId) nb.push({ id: e.u, w: e.w, eid: e.id });
  });
  return nb.sort((a, b) => a.id.localeCompare(b.id));
}

function midpoint(n1, n2) {
  return { x: (n1.x + n2.x) / 2, y: (n1.y + n2.y) / 2 };
}

function edgeEndpoints(src, tgt, directed) {
  const dx = tgt.x - src.x, dy = tgt.y - src.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / len, uy = dy / len;
  const rSrc = nodeR(src.id);
  const rTgt = nodeR(tgt.id);
  const offset = directed ? rTgt + 7 : rTgt + 2;
  return {
    x1: src.x + ux * (rSrc + 2), y1: src.y + uy * (rSrc + 2),
    x2: tgt.x - ux * offset, y2: tgt.y - uy * offset,
  };
}

// ─── ALGORITHM ENGINES ────────────────────────────────────────────────────────

function buildBFS(nodes, edges, directed, startId) {
  const steps = [];
  const visited = new Set([startId]);
  const queue = [startId];
  const push = (s) => steps.push({ ...s, visitedNodes: new Set(visited), frontier: new Set(queue) });

  push({ active: new Set([startId]), evalEdges: new Set(), pathEdges: new Set(), dist: {}, msg: `Start BFS from ${startId}`, stats: { v: 1, e: 0 } });

  let totalE = 0;
  while (queue.length) {
    const cur = queue.shift();
    push({ active: new Set([cur]), evalEdges: new Set(), pathEdges: new Set(), dist: {}, msg: `Dequeue ${cur}, explore neighbors`, stats: { v: visited.size, e: totalE } });
    for (const nb of getNeighbors(cur, edges, directed)) {
      totalE++;
      push({ active: new Set([cur]), evalEdges: new Set([nb.eid]), pathEdges: new Set(), dist: {}, msg: `Check edge → ${nb.id}`, stats: { v: visited.size, e: totalE } });
      if (!visited.has(nb.id)) {
        visited.add(nb.id);
        queue.push(nb.id);
        push({ active: new Set([cur]), evalEdges: new Set(), pathEdges: new Set([nb.eid]), dist: {}, msg: `${nb.id} unvisited → enqueue`, stats: { v: visited.size, e: totalE } });
      }
    }
  }
  push({ active: new Set(), evalEdges: new Set(), pathEdges: new Set(), dist: {}, msg: `BFS complete. Visited ${visited.size} nodes.`, stats: { v: visited.size, e: totalE } });
  return steps;
}

function buildDFS(nodes, edges, directed, startId) {
  const steps = [];
  const visited = new Set();
  let totalE = 0;

  function dfs(cur, prevEdge) {
    visited.add(cur);
    steps.push({ visitedNodes: new Set(visited), frontier: new Set(), active: new Set([cur]), evalEdges: new Set(), pathEdges: prevEdge ? new Set([prevEdge]) : new Set(), dist: {}, msg: `Visit ${cur}`, stats: { v: visited.size, e: totalE } });
    for (const nb of getNeighbors(cur, edges, directed)) {
      totalE++;
      steps.push({ visitedNodes: new Set(visited), frontier: new Set(), active: new Set([cur]), evalEdges: new Set([nb.eid]), pathEdges: new Set(), dist: {}, msg: `Check neighbor ${nb.id}`, stats: { v: visited.size, e: totalE } });
      if (!visited.has(nb.id)) {
        dfs(nb.id, nb.eid);
        steps.push({ visitedNodes: new Set(visited), frontier: new Set(), active: new Set([cur]), evalEdges: new Set(), pathEdges: new Set(), dist: {}, msg: `Backtrack to ${cur}`, stats: { v: visited.size, e: totalE } });
      }
    }
  }
  dfs(startId, null);
  steps.push({ visitedNodes: new Set(visited), frontier: new Set(), active: new Set(), evalEdges: new Set(), pathEdges: new Set(), dist: {}, msg: `DFS complete. Visited ${visited.size} nodes.`, stats: { v: visited.size, e: totalE } });
  return steps;
}

function buildDijkstra(nodes, edges, directed, weighted, startId) {
  const steps = [];
  const dist = {};
  const prev = {};
  const unvisited = new Set(nodes.map((n) => n.id));
  const visited = new Set();
  nodes.forEach((n) => (dist[n.id] = Infinity));
  dist[startId] = 0;
  let totalE = 0;

  steps.push({ visitedNodes: new Set(), frontier: new Set(unvisited), active: new Set(), evalEdges: new Set(), pathEdges: new Set(), dist: { ...dist }, msg: `Init: source ${startId}=0, others=∞`, stats: { v: 0, e: 0 } });

  while (unvisited.size) {
    let cur = null, minD = Infinity;
    for (const id of unvisited) if (dist[id] < minD) { minD = dist[id]; cur = id; }
    if (!cur) break;
    unvisited.delete(cur);
    visited.add(cur);

    const pathEdges = new Set();
    for (const id of visited) { if (prev[id]) { const ed = edges.find((e) => (e.u === id && e.v === prev[id]) || (e.v === id && e.u === prev[id])); if (ed) pathEdges.add(ed.id); } }

    steps.push({ visitedNodes: new Set(visited), frontier: new Set(unvisited), active: new Set([cur]), evalEdges: new Set(), pathEdges: new Set(pathEdges), dist: { ...dist }, msg: `Select ${cur} (dist=${minD})`, stats: { v: visited.size, e: totalE } });

    for (const nb of getNeighbors(cur, edges, directed)) {
      if (visited.has(nb.id)) continue;
      totalE++;
      const w = weighted ? nb.w : 1;
      steps.push({ visitedNodes: new Set(visited), frontier: new Set(unvisited), active: new Set([cur]), evalEdges: new Set([nb.eid]), pathEdges: new Set(pathEdges), dist: { ...dist }, msg: `Relax edge → ${nb.id} (w=${w})`, stats: { v: visited.size, e: totalE } });
      const alt = dist[cur] + w;
      if (alt < dist[nb.id]) {
        dist[nb.id] = alt; prev[nb.id] = cur;
        steps.push({ visitedNodes: new Set(visited), frontier: new Set(unvisited), active: new Set([cur]), evalEdges: new Set(), pathEdges: new Set([...pathEdges, nb.eid]), dist: { ...dist }, msg: `Updated dist[${nb.id}]=${alt}`, stats: { v: visited.size, e: totalE } });
      }
    }
  }
  const finalPath = new Set();
  for (const id of visited) { if (prev[id]) { const ed = edges.find((e) => (e.u === id && e.v === prev[id]) || (e.v === id && e.u === prev[id])); if (ed) finalPath.add(ed.id); } }
  steps.push({ visitedNodes: new Set(visited), frontier: new Set(), active: new Set(), evalEdges: new Set(), pathEdges: finalPath, dist: { ...dist }, msg: `Dijkstra complete!`, stats: { v: visited.size, e: totalE } });
  return steps;
}

function buildKruskal(nodes, edges, weighted) {
  const steps = [];
  const mst = new Set();
  const sorted = [...edges].sort((a, b) => (weighted ? a.w : 1) - (weighted ? b.w : 1));
  const par = {};
  nodes.forEach((n) => (par[n.id] = n.id));
  const find = (i) => (par[i] === i ? i : find(par[i]));
  let totalE = 0;

  steps.push({ visitedNodes: new Set(), frontier: new Set(), active: new Set(), evalEdges: new Set(), pathEdges: new Set(), dist: {}, msg: `Edges sorted by weight. Starting Kruskal.`, stats: { v: 0, e: 0 } });

  for (const edge of sorted) {
    totalE++;
    steps.push({ visitedNodes: new Set(), frontier: new Set(), active: new Set([edge.u, edge.v]), evalEdges: new Set([edge.id]), pathEdges: new Set(mst), dist: {}, msg: `Check edge ${edge.u}–${edge.v} (w=${weighted ? edge.w : 1})`, stats: { v: 0, e: totalE } });
    const pu = find(edge.u), pv = find(edge.v);
    if (pu !== pv) {
      par[pu] = pv; mst.add(edge.id);
      steps.push({ visitedNodes: new Set(), frontier: new Set(), active: new Set(), evalEdges: new Set(), pathEdges: new Set(mst), dist: {}, msg: `No cycle → added to MST`, stats: { v: 0, e: totalE } });
    } else {
      steps.push({ visitedNodes: new Set(), frontier: new Set(), active: new Set(), evalEdges: new Set(), pathEdges: new Set(mst), dist: {}, msg: `Forms cycle → discarded`, stats: { v: 0, e: totalE } });
    }
  }
  steps.push({ visitedNodes: new Set(nodes.map((n) => n.id)), frontier: new Set(), active: new Set(), evalEdges: new Set(), pathEdges: new Set(mst), dist: {}, msg: `Kruskal's MST complete! ${mst.size} edges.`, stats: { v: nodes.length, e: totalE } });
  return steps;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Generates labels: A-Z, then AA-AZ, BA-BZ, ... ZA-ZZ, then AAA...
function generateAllLabels() {
  const labels = [];
  // Single letters A-Z
  for (const l of LETTERS) labels.push(l);
  // Double letters AA-ZZ
  for (const l1 of LETTERS) for (const l2 of LETTERS) labels.push(l1 + l2);
  return labels;
}
const ALL_LABELS = generateAllLabels();

function nextLabel(nodes) {
  const usedIds = new Set(nodes.map((n) => n.id));
  for (const label of ALL_LABELS) {
    if (!usedIds.has(label)) return label;
  }
  return `N${nodes.length}`;
}

export default function GraphVisualizer() {
  const canvasRef = useRef(null);

  // Graph state
  const [nodes, setNodes] = useState(PRESETS.directed_weighted.nodes);
  const [edges, setEdges] = useState(PRESETS.directed_weighted.edges);
  const [directed, setDirected] = useState(true);
  const [weighted, setWeighted] = useState(true);

  // UI state
  const [mode, setMode] = useState(MODES.MOVE);
  const [startId, setStartId] = useState("A");
  const [algo, setAlgo] = useState("dijkstra");
  const [lang, setLang] = useState("js");

  // Interaction state
  const [dragging, setDragging] = useState(null); // { id, ox, oy }
  const [edgeSrc, setEdgeSrc] = useState(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // Manual builder
  const [mSrc, setMSrc] = useState("");
  const [mTgt, setMTgt] = useState("");
  const [mW, setMW] = useState(1);

  // Animation state
  const [steps, setSteps] = useState([]);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [stepMode, setStepMode] = useState(false);
  const [speed, setSpeed] = useState(1);

  const ss = steps.length > 0 && step < steps.length
    ? steps[step]
    : { visitedNodes: new Set(), frontier: new Set(), active: new Set(), evalEdges: new Set(), pathEdges: new Set(), dist: {}, msg: "Ready. Load a template or build your own graph.", stats: { v: 0, e: 0 } };

  // ── playback timer ──
  useEffect(() => {
    if (!playing || steps.length === 0) return;
    if (step >= steps.length - 1) { setPlaying(false); return; }
    const t = setTimeout(() => setStep((s) => s + 1), 900 / speed);
    return () => clearTimeout(t);
  }, [playing, step, steps, speed]);

  const stopAnim = () => { setSteps([]); setStep(0); setPlaying(false); };

  const runAlgo = useCallback(() => {
    if (nodes.length === 0) return;
    let s = [];
    if (algo === "bfs") s = buildBFS(nodes, edges, directed, startId);
    else if (algo === "dfs") s = buildDFS(nodes, edges, directed, startId);
    else if (algo === "dijkstra") s = buildDijkstra(nodes, edges, directed, weighted, startId);
    else if (algo === "kruskal") s = buildKruskal(nodes, edges, weighted);
    setSteps(s);
    setStep(0);
    setMode(MODES.MOVE);
    setEdgeSrc(null);
    if (!stepMode) setPlaying(true);
  }, [nodes, edges, directed, weighted, startId, algo, stepMode]);

  // ── template loader ──
  const loadPreset = (key) => {
    stopAnim();
    const p = PRESETS[key];
    setNodes(p.nodes);
    setEdges(p.edges);
    setDirected(p.directed);
    setWeighted(p.weighted);
    setStartId(p.nodes[0].id);
    if (p.directed && algo === "kruskal") setAlgo("bfs");
  };

  // ── canvas events ──
  const getSVGPos = (e) => {
    const svg = canvasRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onSVGMouseMove = (e) => {
    const pos = getSVGPos(e);
    setMouse(pos);
    if (dragging && mode === MODES.MOVE && steps.length === 0) {
      setNodes((ns) => ns.map((n) => n.id === dragging ? { ...n, x: pos.x, y: pos.y } : n));
    }
  };

  const onSVGMouseUp = () => setDragging(null);

  const onSVGClick = (e) => {
    if (mode === MODES.ADD_NODE) {
      const pos = getSVGPos(e);
      const label = nextLabel(nodes);
      const newNode = { id: label, x: pos.x, y: pos.y };
      setNodes((ns) => [...ns, newNode]);
      if (!startId) setStartId(label);
    }
    if (mode === MODES.ADD_EDGE && edgeSrc) setEdgeSrc(null);
  };

  const onNodeMouseDown = (nodeId, e) => {
    e.stopPropagation();
    if (playing || steps.length > 0) return;
    if (mode === MODES.MOVE) {
      setDragging(nodeId);
    } else if (mode === MODES.ERASE) {
      setNodes((ns) => ns.filter((n) => n.id !== nodeId));
      setEdges((es) => es.filter((e) => e.u !== nodeId && e.v !== nodeId));
      if (startId === nodeId) setStartId(nodes.find((n) => n.id !== nodeId)?.id || "");
    } else if (mode === MODES.ADD_EDGE) {
      if (!edgeSrc) {
        setEdgeSrc(nodeId);
        const nd = nodes.find((n) => n.id === nodeId);
        setMouse({ x: nd.x, y: nd.y });
      } else {
        if (edgeSrc !== nodeId) {
          const exists = edges.find((e) =>
            (e.u === edgeSrc && e.v === nodeId) || (!directed && e.v === edgeSrc && e.u === nodeId)
          );
          if (!exists) {
            const w = weighted ? Math.floor(Math.random() * 9) + 1 : 1;
            setEdges((es) => [...es, { id: newEid(), u: edgeSrc, v: nodeId, w }]);
          }
        }
        setEdgeSrc(null);
      }
    }
  };

  const onEdgeClick = (edgeId, e) => {
    e.stopPropagation();
    if (playing || steps.length > 0) return;
    if (mode === MODES.ERASE) setEdges((es) => es.filter((e) => e.id !== edgeId));
    if (mode === MODES.MOVE && weighted) {
      const edge = edges.find((e) => e.id === edgeId);
      const val = prompt("New weight:", edge.w);
      if (val && !isNaN(+val)) setEdges((es) => es.map((e) => e.id === edgeId ? { ...e, w: +val } : e));
    }
  };

  const manualAddNode = () => {
    const label = nextLabel(nodes);
    const newNode = { id: label, x: 100 + Math.random() * 400, y: 100 + Math.random() * 300 };
    setNodes((ns) => [...ns, newNode]);
    if (!startId) setStartId(label);
  };

  const manualAddEdge = () => {
    if (!mSrc || !mTgt || mSrc === mTgt) return;
    const exists = edges.find((e) =>
      (e.u === mSrc && e.v === mTgt) || (!directed && e.v === mSrc && e.u === mTgt)
    );
    if (!exists) setEdges((es) => [...es, { id: newEid(), u: mSrc, v: mTgt, w: weighted ? mW : 1 }]);
  };

  // ── node colour ──
  const nodeColor = (id) => {
    if (ss.active.has(id)) return { fill: "#3b82f6", stroke: "#93c5fd", textFill: "#fff", glow: "0 0 16px rgba(59,130,246,0.8)" };
    if (ss.visitedNodes.has(id)) return { fill: "#059669", stroke: "#6ee7b7", textFill: "#fff", glow: "0 0 10px rgba(16,185,129,0.5)" };
    if (ss.frontier.has(id)) return { fill: "#d97706", stroke: "#fcd34d", textFill: "#1e293b", glow: "none" };
    if (id === startId) return { fill: "#1e293b", stroke: "#818cf8", textFill: "#c7d2fe", glow: "none" };
    return { fill: "#0f172a", stroke: "#475569", textFill: "#cbd5e1", glow: "none" };
  };

  // ── edge colour ──
  const edgeColor = (id) => {
    if (ss.pathEdges.has(id)) return { stroke: "#34d399", width: 3, opacity: 1 };
    if (ss.evalEdges.has(id)) return { stroke: "#fbbf24", width: 3, opacity: 1 };
    return { stroke: "#334155", width: 2, opacity: 0.7 };
  };

  const srcNode = edgeSrc ? nodes.find((n) => n.id === edgeSrc) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#020817", color: "#cbd5e1", fontFamily: "'JetBrains Mono', 'Fira Code', monospace", display: "flex", flexDirection: "column", userSelect: "none" }}>

      {/* ── HEADER ── */}
      <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "12px 24px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, zIndex: 30 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⬡</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, background: "linear-gradient(90deg,#818cf8,#22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Graph Algorithm Visualizer</div>
            <div style={{ fontSize: 10, color: "#475569", letterSpacing: 2 }}>INTERACTIVE CANVAS</div>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: 2 }}>Templates:</span>
          {[["directed_weighted", "Directed / Weighted"], ["undirected_unweighted", "Undirected / Unweighted"]].map(([k, label]) => (
            <button key={k} onClick={() => loadPreset(k)} disabled={playing}
              style={{ padding: "6px 14px", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", fontSize: 12, cursor: "pointer" }}>
              {label}
            </button>
          ))}
          <button onClick={() => { setNodes([]); setEdges([]); stopAnim(); setStartId(""); }}
            style={{ padding: "6px 14px", background: "#450a0a", border: "1px solid #7f1d1d", borderRadius: 8, color: "#fca5a5", fontSize: 12, cursor: "pointer" }}>
            Clear All
          </button>
        </div>
      </div>

      {/* ── SETTINGS BAR ── */}
      <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "10px 24px", display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", zIndex: 20 }}>
        {/* directed/undirected toggle */}
        {[["Undirected", false], ["Directed", true]].map(([label, val]) => (
          <button key={label} onClick={() => { setDirected(val); stopAnim(); if (val && algo === "kruskal") setAlgo("bfs"); }}
            style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #334155", background: directed === val ? "#4f46e5" : "#1e293b", color: directed === val ? "#fff" : "#94a3b8", fontSize: 12, cursor: "pointer", fontWeight: directed === val ? 700 : 400 }}>
            {label}
          </button>
        ))}
        <div style={{ width: 1, height: 24, background: "#1e293b" }} />
        {[["Unweighted", false], ["Weighted", true]].map(([label, val]) => (
          <button key={label} onClick={() => { setWeighted(val); stopAnim(); }}
            style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid #334155", background: weighted === val ? "#4f46e5" : "#1e293b", color: weighted === val ? "#fff" : "#94a3b8", fontSize: 12, cursor: "pointer", fontWeight: weighted === val ? 700 : 400 }}>
            {label}
          </button>
        ))}
        <div style={{ width: 1, height: 24, background: "#1e293b" }} />
        <button onClick={manualAddNode} disabled={playing}
          style={{ padding: "6px 14px", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          ＋ Add Node
          <span style={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 4, padding: "1px 6px", fontSize: 10, color: "#6366f1", fontWeight: 700, fontFamily: "monospace" }}>
            next: {nextLabel(nodes)}
          </span>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#020817", border: "1px solid #1e293b", borderRadius: 8, padding: "4px 10px" }}>
          <select value={mSrc} onChange={(e) => setMSrc(e.target.value)} style={{ background: "transparent", border: "none", color: "#e2e8f0", fontSize: 12, outline: "none", cursor: "pointer" }}>
            <option value="">Source</option>
            {nodes.map((n) => <option key={n.id} value={n.id}>{n.id}</option>)}
          </select>
          <span style={{ color: "#475569" }}>→</span>
          <select value={mTgt} onChange={(e) => setMTgt(e.target.value)} style={{ background: "transparent", border: "none", color: "#e2e8f0", fontSize: 12, outline: "none", cursor: "pointer" }}>
            <option value="">Target</option>
            {nodes.map((n) => <option key={n.id} value={n.id}>{n.id}</option>)}
          </select>
          {weighted && (
            <input type="number" value={mW} onChange={(e) => setMW(+e.target.value)} min={1} max={99}
              style={{ width: 44, background: "#0f172a", border: "1px solid #334155", borderRadius: 6, color: "#e2e8f0", fontSize: 12, padding: "2px 6px", textAlign: "center", outline: "none" }} />
          )}
          <button onClick={manualAddEdge} disabled={playing}
            style={{ padding: "4px 12px", background: "#065f46", border: "1px solid #059669", borderRadius: 6, color: "#6ee7b7", fontSize: 12, cursor: "pointer", fontWeight: 700 }}>
            Add Edge
          </button>
        </div>
      </div>

      {/* ── MAIN BODY ── */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 300px", minHeight: 0 }}>

        {/* ── LEFT: CANVAS ── */}
        <div style={{ display: "flex", flexDirection: "column", position: "relative", background: "#020817" }}>

          {/* Mode toolbar */}
          <div style={{ position: "absolute", top: 16, left: 16, zIndex: 20, display: "flex", flexDirection: "column", gap: 6, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 8 }}>
            {[
              { m: MODES.MOVE, icon: "✥", tip: "Move / Edit weights" },
              { m: MODES.ADD_NODE, icon: "⊕", tip: "Add node (click canvas)" },
              { m: MODES.ADD_EDGE, icon: "⟶", tip: "Add edge (click two nodes)" },
              { m: MODES.ERASE, icon: "⌫", tip: "Erase node/edge" },
            ].map(({ m, icon, tip }) => (
              <button key={m} onClick={() => { if (!playing) { setMode(m); setEdgeSrc(null); } }} title={tip}
                style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid", borderColor: mode === m ? "#6366f1" : "#334155", background: mode === m ? "#312e81" : "transparent", color: mode === m ? "#a5b4fc" : "#64748b", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {icon}
              </button>
            ))}
          </div>

          {/* Status bar */}
          <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", zIndex: 20, background: "rgba(15,23,42,0.92)", border: "1px solid #1e293b", borderRadius: 999, padding: "8px 20px", fontSize: 12, color: "#a5b4fc", display: "flex", alignItems: "center", gap: 8, backdropFilter: "blur(8px)", maxWidth: "70%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: playing ? "#6366f1" : "#334155", boxShadow: playing ? "0 0 8px #6366f1" : "none", flexShrink: 0 }} />
            {ss.msg}
          </div>

          {/* Traversal path */}
          {steps.length > 0 && algo !== "kruskal" && ss.visitedNodes.size > 0 && (
            <div style={{ position: "absolute", top: 60, left: "50%", transform: "translateX(-50%)", zIndex: 20, background: "rgba(15,23,42,0.92)", border: "1px solid #1e293b", borderRadius: 12, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8, flexWrap: "nowrap", overflowX: "auto", maxWidth: "80%", backdropFilter: "blur(8px)" }}>
              <span style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: 2, whiteSpace: "nowrap" }}>Path:</span>
              {Array.from(ss.visitedNodes).map((id, i) => (
                <span key={id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 700, color: "#c7d2fe" }}>{id}</span>
                  {i < ss.visitedNodes.size - 1 && <span style={{ color: "#334155" }}>→</span>}
                </span>
              ))}
            </div>
          )}

          {/* MST edges */}
          {steps.length > 0 && algo === "kruskal" && ss.pathEdges.size > 0 && (
            <div style={{ position: "absolute", top: 60, left: "50%", transform: "translateX(-50%)", zIndex: 20, background: "rgba(15,23,42,0.92)", border: "1px solid #1e293b", borderRadius: 12, padding: "8px 16px", display: "flex", alignItems: "center", gap: 8, flexWrap: "nowrap", overflowX: "auto", maxWidth: "80%", backdropFilter: "blur(8px)" }}>
              <span style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: 2, whiteSpace: "nowrap" }}>MST:</span>
              {Array.from(ss.pathEdges).map((eid) => {
                const ed = edges.find((e) => e.id === eid);
                if (!ed) return null;
                return <span key={eid} style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)", borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 700, color: "#6ee7b7" }}>{ed.u}–{ed.v}</span>;
              })}
            </div>
          )}

          {/* Metrics */}
          <div style={{ position: "absolute", bottom: 16, left: 16, zIndex: 20, display: "flex", flexDirection: "column", gap: 6 }}>
            {[["Visited", ss.stats.v, "#34d399"], ["Edges Proc.", ss.stats.e, "#fbbf24"]].map(([label, val, color]) => (
              <div key={label} style={{ background: "rgba(15,23,42,0.85)", border: "1px solid #1e293b", borderRadius: 10, padding: "6px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, minWidth: 160 }}>
                <span style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: 1 }}>{label}</span>
                <span style={{ fontWeight: 700, color, fontSize: 14 }}>{val}</span>
              </div>
            ))}
          </div>

          {/* SVG Canvas */}
          <svg
            ref={canvasRef}
            style={{ flex: 1, width: "100%", cursor: mode === MODES.ADD_NODE ? "crosshair" : mode === MODES.ERASE ? "not-allowed" : "default" }}
            onMouseMove={onSVGMouseMove}
            onMouseUp={onSVGMouseUp}
            onMouseLeave={onSVGMouseUp}
            onClick={onSVGClick}
          >
            {/* Grid dots */}
            <defs>
              <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="#1e293b" />
              </pattern>
              <marker id="arr" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <path d="M0,0 L8,3 L0,6 Z" fill="#475569" />
              </marker>
              <marker id="arr-path" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <path d="M0,0 L8,3 L0,6 Z" fill="#34d399" />
              </marker>
              <marker id="arr-eval" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <path d="M0,0 L8,3 L0,6 Z" fill="#fbbf24" />
              </marker>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Edges */}
            {edges.map((edge) => {
              const src = nodes.find((n) => n.id === edge.u);
              const tgt = nodes.find((n) => n.id === edge.v);
              if (!src || !tgt) return null;
              const ep = edgeEndpoints(src, tgt, directed);
              const ec = edgeColor(edge.id);
              const mid = midpoint(src, tgt);
              const markerId = ss.pathEdges.has(edge.id) ? "url(#arr-path)" : ss.evalEdges.has(edge.id) ? "url(#arr-eval)" : "url(#arr)";
              return (
                <g key={edge.id} onClick={(e) => onEdgeClick(edge.id, e)} style={{ cursor: mode === MODES.ERASE ? "pointer" : mode === MODES.MOVE && weighted ? "pointer" : "default" }}>
                  {/* Hit area */}
                  <line x1={ep.x1} y1={ep.y1} x2={ep.x2} y2={ep.y2} stroke="transparent" strokeWidth={16} />
                  {/* Visible line */}
                  <line x1={ep.x1} y1={ep.y1} x2={ep.x2} y2={ep.y2}
                    stroke={ec.stroke} strokeWidth={ec.width} opacity={ec.opacity}
                    markerEnd={directed ? markerId : ""}
                    style={{ transition: "stroke 0.3s, stroke-width 0.3s", filter: ss.pathEdges.has(edge.id) ? "drop-shadow(0 0 6px rgba(52,211,153,0.8))" : ss.evalEdges.has(edge.id) ? "drop-shadow(0 0 6px rgba(251,191,36,0.8))" : "none" }}
                  />
                  {/* Weight label */}
                  {weighted && (
                    <text x={mid.x} y={mid.y - 6} textAnchor="middle" fontSize={11} fontFamily="monospace" fontWeight={700}
                      fill={ec.stroke} style={{ pointerEvents: "none" }}>
                      {edge.w}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Pending edge */}
            {edgeSrc && srcNode && (
              <line x1={srcNode.x} y1={srcNode.y} x2={mouse.x} y2={mouse.y}
                stroke="#6366f1" strokeWidth={2} strokeDasharray="6,4" opacity={0.7} style={{ pointerEvents: "none" }} />
            )}

            {/* Nodes */}
            {nodes.map((node) => {
              const nc = nodeColor(node.id);
              const isStart = node.id === startId;
              const isDijkstra = steps.length > 0 && algo === "dijkstra" && ss.dist[node.id] !== undefined;
              const r = nodeR(node.id);
              const fontSize = node.id.length > 1 ? 11 : 14;
              return (
                <g key={node.id} onMouseDown={(e) => onNodeMouseDown(node.id, e)} style={{ cursor: mode === MODES.MOVE ? "grab" : mode === MODES.ERASE ? "pointer" : "pointer" }}>
                  {/* Dijkstra distance badge */}
                  {isDijkstra && (
                    <text x={node.x} y={node.y - r - 8} textAnchor="middle" fontSize={11} fontWeight={700} fontFamily="monospace"
                      fill={ss.dist[node.id] === Infinity ? "#475569" : "#34d399"}>
                      {ss.dist[node.id] === Infinity ? "∞" : ss.dist[node.id]}
                    </text>
                  )}
                  {/* Glow */}
                  {nc.glow !== "none" && (
                    <circle cx={node.x} cy={node.y} r={r + 8} fill="none" stroke={nc.stroke} strokeWidth={1} opacity={0.3} />
                  )}
                  {/* Circle */}
                  <circle cx={node.x} cy={node.y} r={r}
                    fill={nc.fill} stroke={nc.stroke} strokeWidth={2}
                    style={{ transition: "fill 0.25s, stroke 0.25s", filter: nc.glow !== "none" ? `drop-shadow(0 0 8px ${nc.stroke})` : "none" }}
                  />
                  {/* Label */}
                  <text x={node.x} y={node.y + 5} textAnchor="middle" fontSize={fontSize} fontWeight={700} fontFamily="monospace"
                    fill={nc.textFill} style={{ pointerEvents: "none" }}>
                    {node.id}
                  </text>
                  {/* Start marker */}
                  {isStart && (
                    <circle cx={node.x + r - 5} cy={node.y - r + 5} r={6} fill="#4f46e5" stroke="#020817" strokeWidth={1.5} style={{ pointerEvents: "none" }} />
                  )}
                  {/* Add-edge highlight */}
                  {edgeSrc === node.id && (
                    <circle cx={node.x} cy={node.y} r={r + 5} fill="none" stroke="#818cf8" strokeWidth={2} strokeDasharray="4,3" />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ background: "#0f172a", borderLeft: "1px solid #1e293b", display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Panel header */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #1e293b", fontWeight: 700, fontSize: 13, color: "#e2e8f0", display: "flex", alignItems: "center", gap: 8 }}>
            📖 Algorithm Details
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>

            {/* Algorithm info */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#818cf8", marginBottom: 6 }}>{ALGORITHMS[algo].title}</div>
              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>{ALGORITHMS[algo].description}</div>
            </div>

            {/* Complexity */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              {[["Time", ALGORITHMS[algo].time, "#34d399"], ["Space", ALGORITHMS[algo].space, "#fbbf24"]].map(([label, val, color]) => (
                <div key={label} style={{ background: "#020817", border: "1px solid #1e293b", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                  <div style={{ fontSize: 9, color: "#475569", textTransform: "uppercase", letterSpacing: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color, marginTop: 4 }}>{val}</div>
                </div>
              ))}
            </div>

            {/* Step progress */}
            {steps.length > 0 && (
              <div style={{ background: "rgba(79,70,229,0.08)", border: "1px solid rgba(79,70,229,0.2)", borderRadius: 12, padding: 14, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}>
                  <span style={{ color: "#a5b4fc", fontWeight: 600 }}>Step</span>
                  <span style={{ color: "#6366f1", fontFamily: "monospace" }}>{step + 1} / {steps.length}</span>
                </div>
                <div style={{ background: "#1e293b", borderRadius: 999, height: 4, overflow: "hidden", marginBottom: 10 }}>
                  <div style={{ height: "100%", background: "#6366f1", borderRadius: 999, width: `${((step + 1) / steps.length) * 100}%`, transition: "width 0.3s" }} />
                </div>
                <div style={{ background: "#020817", border: "1px solid #1e293b", borderRadius: 8, padding: "10px 12px", fontSize: 11, color: "#94a3b8", lineHeight: 1.6 }}>
                  <span style={{ color: "#6366f1", marginRight: 6 }}>{">"}</span>{ss.msg}
                </div>
              </div>
            )}

            {/* Code */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>💻 Implementation</span>
                <div style={{ display: "flex", background: "#020817", border: "1px solid #1e293b", borderRadius: 6, overflow: "hidden" }}>
                  {["js", "py", "java"].map((l) => (
                    <button key={l} onClick={() => setLang(l)}
                      style={{ padding: "4px 10px", fontSize: 10, fontFamily: "monospace", textTransform: "uppercase", background: lang === l ? "#1e293b" : "transparent", color: lang === l ? "#e2e8f0" : "#475569", border: "none", cursor: "pointer", fontWeight: lang === l ? 700 : 400 }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ background: "#0d1117", border: "1px solid #1e293b", borderRadius: 10, overflow: "hidden" }}>
                <div style={{ background: "#161b22", borderBottom: "1px solid #1e293b", padding: "8px 12px", display: "flex", alignItems: "center", gap: 6 }}>
                  {["#ef4444", "#f59e0b", "#22c55e"].map((c) => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.7 }} />)}
                  <span style={{ fontSize: 10, color: "#475569", marginLeft: 6, fontFamily: "monospace" }}>graph.{lang}</span>
                </div>
                <pre style={{ padding: 14, margin: 0, fontSize: 10, lineHeight: 1.7, color: "#94a3b8", overflowX: "auto", whiteSpace: "pre", fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}>
                  <code>{ALGORITHMS[algo].code[lang]}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM CONTROLS ── */}
      <div style={{ background: "#0f172a", borderTop: "1px solid #1e293b", padding: "12px 24px", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between", zIndex: 30 }}>

        {/* Left: algo + start */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <select value={algo} onChange={(e) => { setAlgo(e.target.value); stopAnim(); }} disabled={playing}
            style={{ background: "#020817", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", fontSize: 13, padding: "6px 12px", outline: "none", cursor: "pointer" }}>
            {Object.values(ALGORITHMS).map((a) => (
              <option key={a.id} value={a.id} disabled={directed && a.id === "kruskal"}>{a.title}{directed && a.id === "kruskal" ? " (undirected only)" : ""}</option>
            ))}
          </select>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: 1 }}>Start</span>
            <select value={startId} onChange={(e) => { stopAnim(); setStartId(e.target.value); }} disabled={playing || algo === "kruskal"}
              style={{ background: "#020817", border: "1px solid #334155", borderRadius: 8, color: "#e2e8f0", fontSize: 13, padding: "6px 12px", outline: "none", cursor: "pointer" }}>
              {nodes.map((n) => <option key={n.id} value={n.id}>{n.id}</option>)}
            </select>
          </div>
        </div>

        {/* Center: run controls */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Step/Auto toggle */}
          <div style={{ display: "flex", background: "#020817", border: "1px solid #1e293b", borderRadius: 8, overflow: "hidden" }}>
            {[["Auto", false], ["Step", true]].map(([label, val]) => (
              <button key={label} onClick={() => { setStepMode(val); setPlaying(false); }}
                style={{ padding: "6px 16px", fontSize: 12, fontWeight: 700, background: stepMode === val ? "#312e81" : "transparent", color: stepMode === val ? "#a5b4fc" : "#475569", border: "none", cursor: "pointer" }}>
                {label}
              </button>
            ))}
          </div>

          {stepMode ? (
            <button onClick={() => {
              if (steps.length === 0) runAlgo();
              else if (step < steps.length - 1) setStep((s) => s + 1);
            }} disabled={steps.length > 0 && step >= steps.length - 1}
              style={{ padding: "8px 20px", background: "#4f46e5", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              {steps.length === 0 ? "▶ Start" : "Next ▷"}
            </button>
          ) : (
            <button onClick={() => {
              if (steps.length === 0) runAlgo();
              else if (step >= steps.length - 1) { setStep(0); setPlaying(true); }
              else setPlaying(!playing);
            }} disabled={nodes.length === 0}
              style={{ padding: "8px 24px", background: "#4f46e5", border: "none", borderRadius: 8, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              {steps.length === 0 ? "▶ Run" : playing ? "⏸ Pause" : "▶ Resume"}
            </button>
          )}

          <button onClick={stopAnim} disabled={steps.length === 0}
            style={{ padding: "8px 12px", background: "#1e293b", border: "1px solid #334155", borderRadius: 8, color: steps.length === 0 ? "#334155" : "#94a3b8", fontSize: 13, cursor: steps.length === 0 ? "not-allowed" : "pointer" }}
            title="Reset">↺</button>
        </div>

        {/* Speed */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#020817", border: "1px solid #1e293b", borderRadius: 8, padding: "6px 14px" }}>
          <span style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: 1 }}>Speed</span>
          <input type="range" min={0.25} max={4} step={0.25} value={speed} onChange={(e) => setSpeed(+e.target.value)}
            style={{ width: 80, accentColor: "#6366f1" }} />
          <span style={{ fontSize: 12, color: "#a5b4fc", fontFamily: "monospace", minWidth: 30 }}>{speed}x</span>
        </div>
      </div>
    </div>
  );
}
