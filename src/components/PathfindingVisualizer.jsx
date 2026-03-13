import { useState, useCallback, useRef, useEffect, useMemo } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#05070d",
  surface: "#090c14",
  panel: "#0c0f1a",
  border: "#141928",
  accent: "#38bdf8",   // sky
  green: "#4ade80",
  amber: "#fbbf24",
  red: "#f87171",
  purple: "#a78bfa",
  orange: "#fb923c",
  text: "#e2e8f0",
  muted: "#4b5563",
  dim: "#0a0d18",
  wall: "#1e293b",
  visited_d: "#1d4ed8",
  visited_a: "#7c3aed",
  frontier: "#0ea5e9",
  path: "#4ade80",
  start: "#22c55e",
  target: "#ef4444",
};

// ─── ALGO INFO ─────────────────────────────────────────────────────────────────
const ALGO_INFO = {
  dijkstra: {
    name: "Dijkstra's Algorithm",
    desc: "Explores nodes in order of distance from start. Guarantees the shortest path in weighted graphs. Uses a priority queue to always expand the closest unvisited node.",
    steps: [
      "Initialize all distances to ∞, start = 0",
      "Add start node to priority queue",
      "Dequeue node with minimum distance",
      "For each neighbor: relax edge if shorter path found",
      "Mark current node as visited",
      "Repeat until target reached or queue empty",
      "✓ Reconstruct path via predecessors",
    ],
    pseudo: `dijkstra(grid, start, target):
  dist[start] = 0
  pq = MinPQ([(0, start)])
  prev = {}

  while pq not empty:
    (d, node) = pq.pop_min()
    if node == target: break
    if node in visited: continue
    visited.add(node)

    for each neighbor of node:
      newDist = dist[node] + weight(edge)
      if newDist < dist[neighbor]:
        dist[neighbor] = newDist
        prev[neighbor] = node
        pq.push((newDist, neighbor))

  return reconstruct(prev, target)`,
    complexity: { time: "O((V + E) log V)", space: "O(V)" },
    flow: ["Init distances", "Enqueue start", "Pop min node", "Relax neighbors", "Mark visited", "Found target?", "Reconstruct path"],
  },
  astar: {
    name: "A* Algorithm",
    desc: "Uses a heuristic h(n) = Manhattan distance to guide search toward the target. Faster than Dijkstra on grids. f(n) = g(n) + h(n) determines node priority.",
    steps: [
      "Initialize g(start)=0, h(start)=heuristic",
      "Add start to open set with f = g + h",
      "Dequeue node with minimum f(n)",
      "If target reached → done",
      "For each neighbor: compute g, h, f",
      "Update if better path found",
      "✓ Reconstruct optimal path",
    ],
    pseudo: `astar(grid, start, target):
  g[start] = 0
  h[start] = heuristic(start, target)
  f[start] = g[start] + h[start]
  open = MinPQ([(f[start], start)])
  prev = {}

  while open not empty:
    (f, node) = open.pop_min()
    if node == target: break
    if node in closed: continue
    closed.add(node)

    for each neighbor:
      newG = g[node] + 1
      if newG < g[neighbor]:
        g[neighbor] = newG
        h[neighbor] = manhattan(neighbor, target)
        f[neighbor] = newG + h[neighbor]
        prev[neighbor] = node
        open.push((f[neighbor], neighbor))

  return reconstruct(prev, target)`,
    complexity: { time: "O(E log V)", space: "O(V)" },
    flow: ["Compute h(n)", "Init open set", "Pop min f(n)", "Check target", "Update g,h,f", "Add to open", "Reconstruct"],
  },
};

const CODE = {
  javascript: {
    dijkstra: `function dijkstra(grid, start, end) {
  const rows = grid.length, cols = grid[0].length;
  const dist = Array.from({length: rows},
    () => Array(cols).fill(Infinity));
  const prev = {};
  const visited = new Set();
  const pq = [[0, start]]; // [dist, [r,c]]
  dist[start[0]][start[1]] = 0;

  while (pq.length) {
    pq.sort((a,b) => a[0]-b[0]);
    const [d, [r,c]] = pq.shift();
    const key = \`\${r},\${c}\`;
    if (visited.has(key)) continue;
    visited.add(key);
    if (r===end[0] && c===end[1]) break;

    for (const [nr,nc] of getNeighbors(r,c,grid)) {
      const nd = d + 1;
      if (nd < dist[nr][nc]) {
        dist[nr][nc] = nd;
        prev[\`\${nr},\${nc}\`] = [r,c];
        pq.push([nd, [nr,nc]]);
      }
    }
  }
  return reconstruct(prev, end);
}`,
    astar: `function astar(grid, start, end) {
  const h = (r,c) =>
    Math.abs(r-end[0]) + Math.abs(c-end[1]);
  const g = {[\`\${start}\`]: 0};
  const prev = {};
  const open = [[h(...start), start]];
  const closed = new Set();

  while (open.length) {
    open.sort((a,b) => a[0]-b[0]);
    const [, [r,c]] = open.shift();
    const key = \`\${r},\${c}\`;
    if (closed.has(key)) continue;
    closed.add(key);
    if (r===end[0] && c===end[1]) break;

    for (const [nr,nc] of getNeighbors(r,c,grid)) {
      const nk = \`\${nr},\${nc}\`;
      const ng = g[key] + 1;
      if (ng < (g[nk] ?? Infinity)) {
        g[nk] = ng;
        prev[nk] = [r,c];
        open.push([ng + h(nr,nc), [nr,nc]]);
      }
    }
  }
  return reconstruct(prev, end);
}`,
  },
  python: {
    dijkstra: `import heapq

def dijkstra(grid, start, end):
    rows, cols = len(grid), len(grid[0])
    dist = [[float('inf')]*cols for _ in range(rows)]
    prev = {}
    dist[start[0]][start[1]] = 0
    pq = [(0, start)]

    while pq:
        d, (r, c) = heapq.heappop(pq)
        if [r,c] == end: break
        for nr, nc in neighbors(r,c,grid):
            nd = d + 1
            if nd < dist[nr][nc]:
                dist[nr][nc] = nd
                prev[(nr,nc)] = (r,c)
                heapq.heappush(pq,(nd,(nr,nc)))

    return reconstruct(prev, end)`,
    astar: `import heapq

def astar(grid, start, end):
    def h(r,c):
        return abs(r-end[0])+abs(c-end[1])

    g = {tuple(start): 0}
    prev = {}
    open_set = [(h(*start), start)]

    while open_set:
        _, (r,c) = heapq.heappop(open_set)
        if [r,c] == end: break
        for nr, nc in neighbors(r,c,grid):
            ng = g[(r,c)] + 1
            if ng < g.get((nr,nc), float('inf')):
                g[(nr,nc)] = ng
                prev[(nr,nc)] = (r,c)
                f = ng + h(nr,nc)
                heapq.heappush(open_set,(f,(nr,nc)))

    return reconstruct(prev, end)`,
  },
  java: {
    dijkstra: `int[][] dijkstra(int[][] grid, int[] start, int[] end) {
    int rows = grid.length, cols = grid[0].length;
    int[][] dist = new int[rows][cols];
    for (int[] r : dist) Arrays.fill(r, Integer.MAX_VALUE);
    dist[start[0]][start[1]] = 0;
    PriorityQueue<int[]> pq = new PriorityQueue<>(
        Comparator.comparingInt(a -> a[0]));
    pq.offer(new int[]{0, start[0], start[1]});

    while (!pq.isEmpty()) {
        int[] cur = pq.poll();
        int d = cur[0], r = cur[1], c = cur[2];
        for (int[] nb : getNeighbors(r,c,grid)) {
            int nd = d + 1;
            if (nd < dist[nb[0]][nb[1]]) {
                dist[nb[0]][nb[1]] = nd;
                pq.offer(new int[]{nd,nb[0],nb[1]});
            }
        }
    }
    return dist;
}`,
    astar: `int[][] astar(int[][] grid, int[] start, int[] end) {
    PriorityQueue<int[]> open = new PriorityQueue<>(
        Comparator.comparingInt(a -> a[0]));
    int[][] g = new int[grid.length][grid[0].length];
    for (int[] r : g) Arrays.fill(r, Integer.MAX_VALUE);
    g[start[0]][start[1]] = 0;
    open.offer(new int[]{h(start,end),start[0],start[1]});

    while (!open.isEmpty()) {
        int[] cur = open.poll();
        if (cur[1]==end[0] && cur[2]==end[1]) break;
        for (int[] nb : getNeighbors(cur[1],cur[2],grid)) {
            int ng = g[cur[1]][cur[2]] + 1;
            if (ng < g[nb[0]][nb[1]]) {
                g[nb[0]][nb[1]] = ng;
                open.offer(new int[]{ng+h(nb,end),nb[0],nb[1]});
            }
        }
    }
    return g;
}`,
  },
  cpp: {
    dijkstra: `vector<pair<int,int>> dijkstra(
    vector<vector<int>>& grid,
    pair<int,int> start, pair<int,int> end) {

  int R = grid.size(), C = grid[0].size();
  vector<vector<int>> dist(R, vector<int>(C, INT_MAX));
  map<pair<int,int>, pair<int,int>> prev;
  priority_queue<tuple<int,int,int>,
    vector<tuple<int,int,int>>, greater<>> pq;

  dist[start.first][start.second] = 0;
  pq.push({0, start.first, start.second});

  while (!pq.empty()) {
    auto [d, r, c] = pq.top(); pq.pop();
    if (make_pair(r,c) == end) break;
    for (auto [nr,nc] : neighbors(r,c,grid)) {
      if (d+1 < dist[nr][nc]) {
        dist[nr][nc] = d+1;
        prev[{nr,nc}] = {r,c};
        pq.push({d+1,nr,nc});
      }
    }
  }
  return reconstruct(prev, end);
}`,
    astar: `vector<pair<int,int>> astar(
    vector<vector<int>>& grid,
    pair<int,int> start, pair<int,int> end) {

  auto h = [&](int r, int c) {
    return abs(r-end.first)+abs(c-end.second);
  };
  map<pair<int,int>,int> g;
  map<pair<int,int>,pair<int,int>> prev;
  priority_queue<tuple<int,int,int>,
    vector<tuple<int,int,int>>, greater<>> open;

  g[start] = 0;
  open.push({h(start.first,start.second), start.first, start.second});

  while (!open.empty()) {
    auto [f,r,c] = open.top(); open.pop();
    if (make_pair(r,c)==end) break;
    for (auto [nr,nc] : neighbors(r,c,grid)) {
      int ng = g[{r,c}] + 1;
      if (!g.count({nr,nc}) || ng < g[{nr,nc}]) {
        g[{nr,nc}] = ng;
        prev[{nr,nc}] = {r,c};
        open.push({ng+h(nr,nc),nr,nc});
      }
    }
  }
  return reconstruct(prev, end);
}`,
  },
};

// ─── ALGORITHM IMPLEMENTATIONS ────────────────────────────────────────────────
function getNeighbors(r, c, rows, cols, walls, diagonal = false) {
  const dirs = [[0,1],[1,0],[0,-1],[-1,0]];
  if (diagonal) dirs.push(...[[1,1],[1,-1],[-1,1],[-1,-1]]);
  const result = [];
  for (const [dr, dc] of dirs) {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !walls.has(`${nr},${nc}`)) {
      result.push([nr, nc]);
    }
  }
  return result;
}

function runDijkstra(rows, cols, start, target, walls, diagonal) {
  const dist = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
  const prev = {};
  const visited = [];
  const pq = [[0, start[0], start[1]]];
  dist[start[0]][start[1]] = 0;
  const vis = new Set();

  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, r, c] = pq.shift();
    const key = `${r},${c}`;
    if (vis.has(key)) continue;
    vis.add(key);
    visited.push([r, c]);
    if (r === target[0] && c === target[1]) break;
    for (const [nr, nc] of getNeighbors(r, c, rows, cols, walls, diagonal)) {
      const nd = d + 1;
      if (nd < dist[nr][nc]) {
        dist[nr][nc] = nd;
        prev[`${nr},${nc}`] = [r, c];
        pq.push([nd, nr, nc]);
      }
    }
  }
  return { visited, prev };
}

function runAstar(rows, cols, start, target, walls, diagonal) {
  const h = (r, c) => Math.abs(r - target[0]) + Math.abs(c - target[1]);
  const g = {};
  const prev = {};
  const visited = [];
  const open = [[h(start[0], start[1]), start[0], start[1]]];
  const key0 = `${start[0]},${start[1]}`;
  g[key0] = 0;
  const closed = new Set();

  while (open.length) {
    open.sort((a, b) => a[0] - b[0]);
    const [, r, c] = open.shift();
    const key = `${r},${c}`;
    if (closed.has(key)) continue;
    closed.add(key);
    visited.push([r, c]);
    if (r === target[0] && c === target[1]) break;
    for (const [nr, nc] of getNeighbors(r, c, rows, cols, walls, diagonal)) {
      const nk = `${nr},${nc}`;
      const ng = (g[key] ?? Infinity) + 1;
      if (ng < (g[nk] ?? Infinity)) {
        g[nk] = ng;
        prev[nk] = [r, c];
        open.push([ng + h(nr, nc), nr, nc]);
      }
    }
  }
  return { visited, prev };
}

function reconstructPath(prev, target) {
  const path = [];
  let cur = `${target[0]},${target[1]}`;
  while (prev[cur]) {
    const [r, c] = prev[cur];
    path.unshift([r, c]);
    cur = `${r},${c}`;
  }
  path.push(target);
  return path;
}

function generateMaze(rows, cols) {
  const walls = new Set();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r % 2 === 0 && c % 2 === 0) continue;
      if (Math.random() < 0.3) walls.add(`${r},${c}`);
    }
  }
  return walls;
}

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const G = `
@import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:${T.bg};color:${T.text};font-family:'Exo 2',sans-serif;}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:${T.surface};}
::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
@keyframes cellVisit{0%{transform:scale(0.3);opacity:0;}60%{transform:scale(1.2);}100%{transform:scale(1);opacity:1;}}
@keyframes pathReveal{0%{transform:scale(0.5);opacity:0;}100%{transform:scale(1);opacity:1;}}
@keyframes pulseGlow{0%,100%{opacity:.7;}50%{opacity:1;}}
.panel{background:${T.panel};border:1px solid ${T.border};border-radius:11px;}
.mono{font-family:'JetBrains Mono',monospace;}
.btn{background:${T.panel};border:1px solid ${T.border};color:${T.muted};padding:7px 13px;border-radius:7px;cursor:pointer;font-family:'Exo 2',sans-serif;font-weight:600;font-size:12px;transition:all .2s;white-space:nowrap;}
.btn:hover{color:${T.text};border-color:${T.muted};}
.btn:disabled{opacity:.3;cursor:not-allowed;}
.btn-sky{background:${T.accent}18;border-color:${T.accent}50;color:${T.accent};}
.btn-sky:hover{background:${T.accent}28;border-color:${T.accent};box-shadow:0 0 12px ${T.accent}30;}
.btn-green{background:${T.green}18;border-color:${T.green}50;color:${T.green};}
.btn-green:hover{background:${T.green}28;border-color:${T.green};}
.btn-red{background:${T.red}18;border-color:${T.red}50;color:${T.red};}
.btn-red:hover{background:${T.red}28;border-color:${T.red};}
.btn-amber{background:${T.amber}18;border-color:${T.amber}50;color:${T.amber};}
.btn-amber:hover{background:${T.amber}28;border-color:${T.amber};}
.btn-purple{background:${T.purple}18;border-color:${T.purple}50;color:${T.purple};}
.btn-purple:hover{background:${T.purple}28;border-color:${T.purple};}
.btn-active{border-color:${T.accent};color:${T.accent};background:${T.accent}18;}
.inp{background:${T.surface};border:1px solid ${T.border};color:${T.text};padding:7px 10px;border-radius:7px;font-family:'JetBrains Mono',monospace;font-size:12px;outline:none;transition:border-color .2s;}
.inp:focus{border-color:${T.accent}70;}
select.inp{cursor:pointer;width:100%;}
.code-view{background:#030508;border:1px solid ${T.border};border-radius:8px;padding:12px;font-family:'JetBrains Mono',monospace;font-size:10.5px;line-height:1.8;color:#6b88a8;overflow:auto;white-space:pre;max-height:200px;}
.tab-a{border-bottom:2px solid ${T.accent};color:${T.accent};background:${T.accent}10;}
.tab-i{border-bottom:2px solid transparent;color:${T.muted};}
.tab-i:hover{color:${T.text};}
.slider{-webkit-appearance:none;height:3px;border-radius:2px;background:${T.border};outline:none;}
.slider::-webkit-slider-thumb{-webkit-appearance:none;width:13px;height:13px;border-radius:50%;background:${T.accent};cursor:pointer;box-shadow:0 0 6px ${T.accent}60;}
.tool-btn{padding:6px 10px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:700;transition:all .2s;border:1.5px solid transparent;font-family:'Exo 2';}
.tool-active{border-color:${T.accent}!important;color:${T.accent}!important;background:${T.accent}18!important;}
`;

// ─── CELL COLORS ──────────────────────────────────────────────────────────────
function getCellStyle(state, algoType) {
  switch (state) {
    case "start":   return { bg: T.start,   border: "#16a34a", glow: `0 0 8px ${T.start}80` };
    case "target":  return { bg: T.target,  border: "#dc2626", glow: `0 0 8px ${T.target}80` };
    case "wall":    return { bg: T.wall,    border: "#0f172a", glow: "none" };
    case "path":    return { bg: T.path,    border: "#16a34a", glow: `0 0 6px ${T.path}80`, anim: "pathReveal .3s ease forwards" };
    case "visited": return {
      bg: algoType === "astar" ? "#4c1d95" : "#1e3a8a",
      border: algoType === "astar" ? "#7c3aed" : "#1d4ed8",
      glow: "none",
      anim: "cellVisit .4s ease forwards",
    };
    case "frontier": return { bg: `${T.frontier}40`, border: T.frontier, glow: "none" };
    default:        return { bg: "transparent", border: T.border, glow: "none" };
  }
}

// ─── FLOW DIAGRAM ─────────────────────────────────────────────────────────────
function AlgoFlow({ algo, currentStep }) {
  const nodes = ALGO_INFO[algo].flow;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
      {nodes.map((n, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{
            padding: "6px 12px", borderRadius: 6, minWidth: 150, textAlign: "center",
            fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: 500,
            background: currentStep === i ? `${T.accent}22` : T.dim,
            border: `1.5px solid ${currentStep === i ? T.accent : T.border}`,
            color: currentStep === i ? T.accent : T.muted,
            boxShadow: currentStep === i ? `0 0 10px ${T.accent}30` : "none",
            transition: "all .3s",
          }}>{n}</div>
          {i < nodes.length - 1 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 1.5, height: 7, background: T.border }} />
              <div style={{ width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: `5px solid ${T.border}` }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null;
  const c = type === "error" ? T.red : type === "warn" ? T.amber : T.green;
  return (
    <div style={{ position: "fixed", bottom: 20, right: 20, padding: "10px 16px", borderRadius: 8, background: `${c}18`, border: `1px solid ${c}50`, color: c, fontFamily: "JetBrains Mono", fontSize: 11, zIndex: 999, animation: "fadeUp .3s ease" }}>
      {type === "error" ? "⚠ " : "✓ "}{msg}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const DEFAULT_ROWS = 20, DEFAULT_COLS = 35;
const DEFAULT_START = [3, 3], DEFAULT_TARGET = [DEFAULT_ROWS - 4, DEFAULT_COLS - 4];

export default function App() {
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [cols, setCols] = useState(DEFAULT_COLS);
  const [startNode, setStartNode] = useState(DEFAULT_START);
  const [targetNode, setTargetNode] = useState(DEFAULT_TARGET);
  const [walls, setWalls] = useState(new Set());
  const [cellStates, setCellStates] = useState({});

  const [algo, setAlgo] = useState("dijkstra");
  const [tool, setTool] = useState("wall"); // wall | erase | start | target
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [diagonal, setDiagonal] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [mode, setMode] = useState("auto");

  const [currentStep, setCurrentStep] = useState(-1);
  const [metrics, setMetrics] = useState({ visited: 0, pathLen: 0, time: 0 });
  const [toast, setToast] = useState(null);
  const [codeTab, setCodeTab] = useState("javascript");
  const [infoTab, setInfoTab] = useState("steps");
  const [stepDesc, setStepDesc] = useState("");

  const [mouseDown, setMouseDown] = useState(false);
  const pauseRef = useRef(false);
  const stopRef = useRef(false);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const delay = useCallback((ms) => new Promise(r => {
    const check = () => {
      if (stopRef.current) { r(); return; }
      if (pauseRef.current) { setTimeout(check, 50); return; }
      r();
    };
    setTimeout(check, ms);
  }), []);
  const animDelay = useCallback(() => delay(Math.round(30 / speed)), [delay, speed]);

  // ── Cell state helpers ──
  const getCellDisplayState = useCallback((r, c) => {
    const key = `${r},${c}`;
    if (r === startNode[0] && c === startNode[1]) return "start";
    if (r === targetNode[0] && c === targetNode[1]) return "target";
    if (walls.has(key)) return "wall";
    return cellStates[key] || "empty";
  }, [startNode, targetNode, walls, cellStates]);

  // ── Grid interactions ──
  const handleCellInteract = useCallback((r, c) => {
    if (running) return;
    const key = `${r},${c}`;
    const isStart = r === startNode[0] && c === startNode[1];
    const isTarget = r === targetNode[0] && c === targetNode[1];
    if (isStart || isTarget) return;

    if (tool === "start") { setStartNode([r, c]); setCellStates({}); }
    else if (tool === "target") { setTargetNode([r, c]); setCellStates({}); }
    else if (tool === "wall") {
      setWalls(w => { const nw = new Set(w); nw.add(key); return nw; });
    } else if (tool === "erase") {
      setWalls(w => { const nw = new Set(w); nw.delete(key); return nw; });
    }
  }, [running, tool, startNode, targetNode]);

  const handleMouseEnter = useCallback((r, c) => {
    if (!mouseDown) return;
    if (tool === "wall" || tool === "erase") handleCellInteract(r, c);
  }, [mouseDown, tool, handleCellInteract]);

  // ── Visualization ──
  const visualize = useCallback(async () => {
    if (running) return;
    stopRef.current = false;
    pauseRef.current = false;
    setRunning(true);
    setPaused(false);
    setCellStates({});
    setMetrics({ visited: 0, pathLen: 0, time: 0 });

    const t0 = performance.now();
    const { visited, prev } = algo === "dijkstra"
      ? runDijkstra(rows, cols, startNode, targetNode, walls, diagonal)
      : runAstar(rows, cols, startNode, targetNode, walls, diagonal);

    // Animate visited nodes
    for (let i = 0; i < visited.length; i++) {
      if (stopRef.current) break;
      const [r, c] = visited[i];
      if ((r === startNode[0] && c === startNode[1]) || (r === targetNode[0] && c === targetNode[1])) continue;
      setCellStates(s => ({ ...s, [`${r},${c}`]: "visited" }));
      setCurrentStep(Math.min(Math.floor(i / visited.length * 5), 5));
      setMetrics(m => ({ ...m, visited: i + 1 }));
      await animDelay();
    }

    if (stopRef.current) { setRunning(false); return; }

    // Reconstruct path
    const targetKey = `${targetNode[0]},${targetNode[1]}`;
    if (!prev[targetKey]) {
      showToast("No path found!", "error");
      setRunning(false); return;
    }
    const path = reconstructPath(prev, targetNode);
    setCurrentStep(6);

    for (const [r, c] of path) {
      if (stopRef.current) break;
      if ((r === startNode[0] && c === startNode[1]) || (r === targetNode[0] && c === targetNode[1])) continue;
      setCellStates(s => ({ ...s, [`${r},${c}`]: "path" }));
      await delay(50 / speed);
    }

    const t1 = performance.now();
    setMetrics({ visited: visited.length, pathLen: path.length, time: ((t1 - t0) / 1000).toFixed(3) });
    setRunning(false);
    showToast(`Path found! Length: ${path.length}`);
  }, [running, algo, rows, cols, startNode, targetNode, walls, diagonal, animDelay, delay, showToast]);

  const handlePause = () => {
    pauseRef.current = !pauseRef.current;
    setPaused(p => !p);
  };
  const handleStop = () => { stopRef.current = true; setRunning(false); setPaused(false); };

  const clearPath = useCallback(() => {
    setCellStates(s => {
      const n = {};
      Object.entries(s).forEach(([k, v]) => { if (v !== "visited" && v !== "path") n[k] = v; });
      return n;
    });
    setMetrics({ visited: 0, pathLen: 0, time: 0 });
    setCurrentStep(-1);
  }, []);

  const clearWalls = useCallback(() => { setWalls(new Set()); clearPath(); }, [clearPath]);
  const resetGrid = useCallback(() => {
    setWalls(new Set()); setCellStates({}); setStartNode(DEFAULT_START);
    setTargetNode([rows - 4, cols - 4]);
    setMetrics({ visited: 0, pathLen: 0, time: 0 }); setCurrentStep(-1);
    showToast("Grid reset");
  }, [rows, cols, showToast]);

  const handleMaze = useCallback(() => {
    clearPath();
    const m = generateMaze(rows, cols);
    m.delete(`${startNode[0]},${startNode[1]}`);
    m.delete(`${targetNode[0]},${targetNode[1]}`);
    setWalls(m);
    showToast("Maze generated");
  }, [rows, cols, startNode, targetNode, clearPath, showToast]);

  const handleResize = useCallback(() => {
    resetGrid();
  }, [resetGrid]);

  // Cell size based on grid
  const cellSize = useMemo(() => Math.max(14, Math.min(28, Math.floor(580 / cols))), [cols]);

  const TOOLS = [
    { id: "wall",   label: "🧱 Wall",   color: T.muted },
    { id: "erase",  label: "✏ Erase",  color: T.amber },
    { id: "start",  label: "🟢 Start",  color: T.green },
    { id: "target", label: "🔴 Target", color: T.red },
  ];

  return (
    <>
      <style>{G}</style>
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column" }}
        onMouseUp={() => setMouseDown(false)}
        onMouseLeave={() => setMouseDown(false)}
      >
        {/* ── HEADER ── */}
        <header style={{ background: T.panel, borderBottom: `1px solid ${T.border}`, height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 26, height: 26, background: `linear-gradient(135deg, ${T.accent}, ${T.purple})`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900 }}>⬡</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: .5 }}>DSA Visualizer</div>
              <div className="mono" style={{ fontSize: 9, color: T.muted, marginTop: -2 }}>Pathfinding Explorer</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {[
              { label: `${rows}×${cols}`, color: T.accent },
              { label: `${metrics.visited} visited`, color: algo === "astar" ? T.purple : T.accent },
              { label: `len: ${metrics.pathLen}`, color: T.green },
              { label: `${metrics.time}s`, color: T.amber },
            ].map(({ label, color }) => (
              <span key={label} className="mono" style={{ fontSize: 9, padding: "2px 7px", borderRadius: 4, background: `${color}15`, border: `1px solid ${color}30`, color }}>{label}</span>
            ))}
          </div>
        </header>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 12, gap: 10, overflow: "hidden" }}>

          {/* ── CONTROLS TOP ── */}
          <div className="panel" style={{ padding: 12, flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
              {/* Grid size */}
              <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flex: "1 1 220px" }}>
                {[{ label: "ROWS", val: rows, set: setRows, min: 10, max: 30 }, { label: "COLS", val: cols, set: setCols, min: 15, max: 50 }].map(({ label, val, set, min, max }) => (
                  <div key={label} style={{ flex: 1 }}>
                    <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 4 }}>{label}: <span style={{ color: T.accent }}>{val}</span></label>
                    <input type="range" min={min} max={max} value={val} onChange={e => set(+e.target.value)} onMouseUp={handleResize} className="slider" style={{ width: "100%" }} />
                  </div>
                ))}
              </div>

              {/* Algorithm */}
              <div style={{ flex: "0 1 180px" }}>
                <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 4 }}>ALGORITHM</label>
                <select className="inp" value={algo} onChange={e => setAlgo(e.target.value)}>
                  <option value="dijkstra">Dijkstra</option>
                  <option value="astar">A* (A-Star)</option>
                </select>
              </div>

              {/* Speed */}
              <div style={{ flex: "1 1 120px" }}>
                <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 4 }}>SPEED: <span style={{ color: T.accent }}>{speed}x</span></label>
                <input type="range" min={0.5} max={8} step={0.5} value={speed} onChange={e => setSpeed(+e.target.value)} className="slider" style={{ width: "100%" }} />
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                <button className="btn btn-sky" onClick={visualize} disabled={running}>▶ Run</button>
                <button className="btn btn-amber" onClick={handlePause} disabled={!running}>{paused ? "▶ Resume" : "⏸ Pause"}</button>
                <button className="btn btn-red" onClick={handleStop} disabled={!running}>■ Stop</button>
                <button className="btn" onClick={clearPath} disabled={running}>Clear Path</button>
                <button className="btn" onClick={clearWalls} disabled={running}>Clear Walls</button>
                <button className="btn btn-purple" onClick={handleMaze} disabled={running}>Generate Maze</button>
                <button className="btn" onClick={resetGrid} disabled={running}>Reset</button>
              </div>

              {/* Diagonal toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button className={`btn ${diagonal ? "btn-active" : ""}`} style={{ fontSize: 11, padding: "5px 10px" }} onClick={() => setDiagonal(d => !d)}>
                  {diagonal ? "8-dir" : "4-dir"}
                </button>
              </div>
            </div>
          </div>

          {/* ── MAIN ── */}
          <div style={{ flex: 1, display: "flex", gap: 12, overflow: "hidden", minHeight: 0 }}>

            {/* GRID AREA */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, overflow: "hidden", minWidth: 0 }}>

              {/* Tools */}
              <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
                {TOOLS.map(t2 => (
                  <button key={t2.id} className={`tool-btn ${tool === t2.id ? "tool-active" : ""}`}
                    style={{ background: T.panel, border: `1.5px solid ${T.border}`, color: T.muted }}
                    onClick={() => setTool(t2.id)}>
                    {t2.label}
                  </button>
                ))}
                <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
                  {[
                    { color: T.start,   label: "Start" },
                    { color: T.target,  label: "Target" },
                    { color: T.wall,    label: "Wall" },
                    { color: algo === "astar" ? "#4c1d95" : "#1e3a8a", border: algo === "astar" ? T.purple : T.accent, label: "Visited" },
                    { color: T.path,    label: "Path" },
                  ].map(({ color, border, label }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 3 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: color, border: `1px solid ${border || color}` }} />
                      <span style={{ fontSize: 9, color: T.muted, fontFamily: "JetBrains Mono" }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid Canvas */}
              <div style={{
                flex: 1, overflow: "auto",
                background: T.bg,
                backgroundImage: `radial-gradient(ellipse at 50% 30%, ${T.accent}04 0%, transparent 60%)`,
                border: `1px solid ${T.border}`, borderRadius: 10,
                padding: 12,
                display: "flex", alignItems: "flex-start", justifyContent: "flex-start",
              }}>
                <div
                  style={{ display: "inline-grid", gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`, gap: 1, userSelect: "none" }}
                  onMouseDown={() => setMouseDown(true)}
                >
                  {Array.from({ length: rows }, (_, r) =>
                    Array.from({ length: cols }, (_, c) => {
                      const state = getCellDisplayState(r, c);
                      const s = getCellStyle(state, algo);
                      return (
                        <div
                          key={`${r},${c}`}
                          onMouseDown={() => { setMouseDown(true); handleCellInteract(r, c); }}
                          onMouseEnter={() => handleMouseEnter(r, c)}
                          style={{
                            width: cellSize, height: cellSize,
                            background: s.bg,
                            border: `1px solid ${state === "empty" ? T.border : s.border}`,
                            borderRadius: 2,
                            cursor: running ? "default" : "pointer",
                            boxShadow: s.glow,
                            transition: state === "empty" || state === "wall" ? "none" : "background .2s",
                            animation: s.anim || "none",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          {state === "start" && <span style={{ fontSize: cellSize * 0.5, lineHeight: 1 }}>▶</span>}
                          {state === "target" && <span style={{ fontSize: cellSize * 0.45, lineHeight: 1 }}>◉</span>}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div style={{ width: 285, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10, overflow: "auto" }}>

              {/* Algo info */}
              <div className="panel" style={{ padding: 13 }}>
                <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 3, color: algo === "astar" ? T.purple : T.accent }}>
                  {ALGO_INFO[algo].name}
                </div>
                <div style={{ fontSize: 10.5, color: T.muted, lineHeight: 1.6, marginBottom: 10 }}>
                  {ALGO_INFO[algo].desc}
                </div>

                <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, marginBottom: 8 }}>
                  {["steps", "pseudo", "flow", "complexity"].map(t => (
                    <button key={t} onClick={() => setInfoTab(t)} className={infoTab === t ? "tab-a" : "tab-i"}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "3px 8px", fontSize: 8.5, fontWeight: 700, letterSpacing: .5, fontFamily: "Exo 2" }}>
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>

                {infoTab === "steps" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {ALGO_INFO[algo].steps.map((step, i) => (
                      <div key={i} style={{
                        display: "flex", gap: 7, alignItems: "flex-start",
                        padding: "4px 7px", borderRadius: 5,
                        background: currentStep === i ? `${T.accent}15` : currentStep > i ? `${T.green}08` : "transparent",
                        border: `1px solid ${currentStep === i ? T.accent + "40" : "transparent"}`,
                        transition: "all .3s",
                      }}>
                        <div style={{
                          width: 16, height: 16, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                          background: currentStep > i ? `${T.green}25` : currentStep === i ? `${T.accent}25` : T.dim,
                          border: `1.5px solid ${currentStep > i ? T.green : currentStep === i ? T.accent : T.border}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 7, fontFamily: "JetBrains Mono",
                          color: currentStep > i ? T.green : currentStep === i ? T.accent : T.muted, fontWeight: 700,
                        }}>{currentStep > i ? "✓" : i + 1}</div>
                        <span style={{ fontSize: 10, color: currentStep === i ? T.text : currentStep > i ? T.green : T.muted, lineHeight: 1.4 }}>{step}</span>
                      </div>
                    ))}
                  </div>
                )}

                {infoTab === "pseudo" && <div className="code-view">{ALGO_INFO[algo].pseudo}</div>}

                {infoTab === "flow" && (
                  <div style={{ display: "flex", justifyContent: "center", paddingTop: 4 }}>
                    <AlgoFlow algo={algo} currentStep={currentStep} />
                  </div>
                )}

                {infoTab === "complexity" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      { label: "TIME", val: ALGO_INFO[algo].complexity.time, color: T.accent },
                      { label: "SPACE", val: ALGO_INFO[algo].complexity.space, color: T.purple },
                    ].map(({ label, val, color }) => (
                      <div key={label} style={{ textAlign: "center", padding: "8px", background: `${color}10`, border: `1px solid ${color}25`, borderRadius: 7 }}>
                        <div style={{ fontSize: 8, color: T.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>{label}</div>
                        <div className="mono" style={{ fontSize: 12, fontWeight: 700, color }}>{val}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Metrics */}
              <div className="panel" style={{ padding: 13 }}>
                <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>METRICS</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {[
                    { label: "VISITED", val: metrics.visited, color: algo === "astar" ? T.purple : T.accent },
                    { label: "PATH LEN", val: metrics.pathLen, color: T.green },
                    { label: "TIME", val: `${metrics.time}s`, color: T.amber },
                    { label: "GRID", val: `${rows}×${cols}`, color: T.orange },
                  ].map(({ label, val, color }) => (
                    <div key={label} style={{ textAlign: "center", padding: "8px 6px", background: `${color}10`, border: `1px solid ${color}25`, borderRadius: 7 }}>
                      <div style={{ fontSize: 8, color: T.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>{label}</div>
                      <div className="mono" style={{ fontSize: 17, fontWeight: 700, color }}>{val || "—"}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code viewer */}
              <div className="panel" style={{ padding: 13 }}>
                <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 7 }}>CODE</div>
                <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, marginBottom: 7 }}>
                  {["javascript", "python", "java", "cpp"].map(l => (
                    <button key={l} onClick={() => setCodeTab(l)} className={codeTab === l ? "tab-a" : "tab-i"}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "3px 7px", fontSize: 8.5, fontWeight: 700, letterSpacing: .5, fontFamily: "JetBrains Mono" }}>
                      {l === "cpp" ? "C++" : l === "javascript" ? "JS" : l.charAt(0).toUpperCase() + l.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="code-view">{CODE[codeTab][algo]}</div>
              </div>

              {/* Algo comparison note */}
              <div className="panel" style={{ padding: 13 }}>
                <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>ALGORITHM COMPARISON</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {[
                    { algo: "Dijkstra", color: T.accent,  props: ["Explores all directions", "Guaranteed shortest path", "No heuristic"] },
                    { algo: "A*",       color: T.purple,  props: ["Guided by heuristic", "Faster on open grids", "f = g + h"] },
                  ].map(({ algo: a, color, props }) => (
                    <div key={a} style={{ padding: "8px 10px", background: `${color}10`, border: `1px solid ${color}25`, borderRadius: 7 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 4 }}>{a}</div>
                      {props.map(p => (
                        <div key={p} style={{ fontSize: 10, color: T.muted, display: "flex", gap: 5, alignItems: "center" }}>
                          <span style={{ color }}>›</span>{p}
                        </div>
                      ))}
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
