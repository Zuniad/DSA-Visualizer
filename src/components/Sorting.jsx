import React, { useState, useEffect, useRef } from "react";

// ─── ALGORITHM METADATA ───────────────────────────────────────────────────────
const ALGO_META = {
  bubble: {
    name: "Bubble Sort", short: "Bubble",
    best: "O(n)", avg: "O(n²)", worst: "O(n²)", space: "O(1)",
    stable: true,
    desc: "Repeatedly compares adjacent elements and swaps them if they're in the wrong order. Each pass bubbles the largest unsorted element to its correct position at the end.",
    pseudo: `for i = 0 to n-1:
  for j = 0 to n-i-2:
    if arr[j] > arr[j+1]:
      swap(arr[j], arr[j+1])`,
    color: "#f59e0b",
  },
  selection: {
    name: "Selection Sort", short: "Selection",
    best: "O(n²)", avg: "O(n²)", worst: "O(n²)", space: "O(1)",
    stable: false,
    desc: "Divides the array into sorted and unsorted regions. Each iteration finds the minimum element from the unsorted region and moves it to the end of the sorted region.",
    pseudo: `for i = 0 to n-1:
  minIdx = i
  for j = i+1 to n:
    if arr[j] < arr[minIdx]:
      minIdx = j
  swap(arr[i], arr[minIdx])`,
    color: "#8b5cf6",
  },
  insertion: {
    name: "Insertion Sort", short: "Insertion",
    best: "O(n)", avg: "O(n²)", worst: "O(n²)", space: "O(1)",
    stable: true,
    desc: "Builds a sorted array one element at a time by inserting each new element into its correct position among the previously sorted elements.",
    pseudo: `for i = 1 to n-1:
  key = arr[i]
  j = i - 1
  while j >= 0 and arr[j] > key:
    arr[j+1] = arr[j]
    j = j - 1
  arr[j+1] = key`,
    color: "#06b6d4",
  },
  merge: {
    name: "Merge Sort", short: "Merge",
    best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(n)",
    stable: true,
    desc: "Divide-and-conquer algorithm that splits the array in half, recursively sorts each half, then merges the sorted halves back together.",
    pseudo: `mergeSort(arr, l, r):
  if l < r:
    mid = (l+r)/2
    mergeSort(arr, l, mid)
    mergeSort(arr, mid+1, r)
    merge(arr, l, mid, r)`,
    color: "#10b981",
  },
  quick: {
    name: "Quick Sort", short: "Quick",
    best: "O(n log n)", avg: "O(n log n)", worst: "O(n²)", space: "O(log n)",
    stable: false,
    desc: "Selects a pivot element and partitions the array around it so elements less than pivot come before it and greater come after. Recursively sorts sub-arrays.",
    pseudo: `quickSort(arr, low, high):
  if low < high:
    pi = partition(arr, low, high)
    quickSort(arr, low, pi-1)
    quickSort(arr, pi+1, high)`,
    color: "#ef4444",
  },
  heap: {
    name: "Heap Sort", short: "Heap",
    best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)", space: "O(1)",
    stable: false,
    desc: "Converts the array into a max-heap, then repeatedly extracts the maximum element and places it at the end, rebuilding the heap each time.",
    pseudo: `buildMaxHeap(arr)
for i = n-1 down to 1:
  swap(arr[0], arr[i])
  heapify(arr, 0, i)`,
    color: "#f97316",
  },
};

// ─── BAR STATES ──────────────────────────────────────────────────────────────
const STATE = { DEFAULT: "default", COMPARING: "comparing", SWAPPING: "swapping", SORTED: "sorted", PIVOT: "pivot", MIN: "min", KEY: "key", MERGING: "merging" };

const STATE_COLORS = {
  default:   { bar: "#1e3a5f", top: "#2563eb", label: "Unsorted" },
  comparing: { bar: "#92400e", top: "#fbbf24", label: "Comparing" },
  swapping:  { bar: "#7f1d1d", top: "#ef4444", label: "Swapping" },
  sorted:    { bar: "#064e3b", top: "#10b981", label: "Sorted" },
  pivot:     { bar: "#581c87", top: "#a855f7", label: "Pivot" },
  min:       { bar: "#1e1b4b", top: "#6366f1", label: "Minimum" },
  key:       { bar: "#164e63", top: "#22d3ee", label: "Key" },
  merging:   { bar: "#14532d", top: "#84cc16", label: "Merging" },
};

// ─── ALGORITHM GENERATORS ────────────────────────────────────────────────────
// Each returns array of "frames": { arr: number[], states: Record<idx,STATE>, msg: string, comparisons, swaps }

function bubbleSortFrames(input) {
  const arr = [...input];
  const n = arr.length;
  let comparisons = 0, swaps = 0;
  const sortedSet = new Set();
  const frames = [];

  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      const states = {};
      sortedSet.forEach(k => states[k] = STATE.SORTED);
      states[j] = STATE.COMPARING; states[j + 1] = STATE.COMPARING;
      frames.push({ arr: [...arr], states, msg: `Compare arr[${j}]=${arr[j]} and arr[${j+1}]=${arr[j+1]}`, comparisons, swaps });

      if (arr[j] > arr[j + 1]) {
        swaps++;
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        const s2 = {};
        sortedSet.forEach(k => s2[k] = STATE.SORTED);
        s2[j] = STATE.SWAPPING; s2[j + 1] = STATE.SWAPPING;
        frames.push({ arr: [...arr], states: s2, msg: `Swap! arr[${j}]=${arr[j]} ↔ arr[${j+1}]=${arr[j+1]}`, comparisons, swaps });
        swapped = true;
      }
    }
    sortedSet.add(n - 1 - i);
    if (!swapped) break;
  }
  const finalStates = {};
  for (let i = 0; i < n; i++) finalStates[i] = STATE.SORTED;
  frames.push({ arr: [...arr], states: finalStates, msg: "Array fully sorted!", comparisons, swaps });
  return frames;
}

function selectionSortFrames(input) {
  const arr = [...input];
  const n = arr.length;
  let comparisons = 0, swaps = 0;
  const sortedSet = new Set();
  const frames = [];

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      comparisons++;
      const states = {};
      sortedSet.forEach(k => states[k] = STATE.SORTED);
      states[i] = STATE.COMPARING; states[minIdx] = STATE.MIN; states[j] = STATE.COMPARING;
      frames.push({ arr: [...arr], states, msg: `Find min: comparing arr[${j}]=${arr[j]} with current min arr[${minIdx}]=${arr[minIdx]}`, comparisons, swaps });
      if (arr[j] < arr[minIdx]) { minIdx = j; }
    }
    if (minIdx !== i) {
      swaps++;
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      const s2 = {};
      sortedSet.forEach(k => s2[k] = STATE.SORTED);
      s2[i] = STATE.SWAPPING; s2[minIdx] = STATE.SWAPPING;
      frames.push({ arr: [...arr], states: s2, msg: `Swap min arr[${minIdx}] to position ${i}`, comparisons, swaps });
    }
    sortedSet.add(i);
  }
  const finalStates = {};
  for (let i = 0; i < n; i++) finalStates[i] = STATE.SORTED;
  frames.push({ arr: [...arr], states: finalStates, msg: "Array fully sorted!", comparisons, swaps });
  return frames;
}

function insertionSortFrames(input) {
  const arr = [...input];
  const n = arr.length;
  let comparisons = 0, swaps = 0;
  const frames = [];

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;
    const keyState = {}; keyState[i] = STATE.KEY;
    frames.push({ arr: [...arr], states: keyState, msg: `Pick key = arr[${i}] = ${key}`, comparisons, swaps });

    while (j >= 0 && arr[j] > key) {
      comparisons++;
      swaps++;
      arr[j + 1] = arr[j];
      const s = {}; s[j] = STATE.COMPARING; s[j + 1] = STATE.SWAPPING;
      frames.push({ arr: [...arr], states: s, msg: `Shift arr[${j}]=${arr[j]} right`, comparisons, swaps });
      j--;
    }
    comparisons++; // One final comparison that fails the loop condition (or j < 0)
    arr[j + 1] = key;
    const s2 = {}; s2[j + 1] = STATE.KEY;
    frames.push({ arr: [...arr], states: s2, msg: `Insert key=${key} at position ${j+1}`, comparisons, swaps });
  }
  const finalStates = {};
  for (let i = 0; i < n; i++) finalStates[i] = STATE.SORTED;
  frames.push({ arr: [...arr], states: finalStates, msg: "Array fully sorted!", comparisons, swaps });
  return frames;
}

function mergeSortFrames(input) {
  const arr = [...input];
  let comparisons = 0, swaps = 0;
  const frames = [];

  function merge(a, l, m, r) {
    const left = a.slice(l, m + 1), right = a.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    while (i < left.length && j < right.length) {
      comparisons++;
      const states = {};
      for (let x = l; x <= r; x++) states[x] = STATE.MERGING;
      states[k] = STATE.COMPARING;
      frames.push({ arr: [...a], states, msg: `Merge: comparing ${left[i]} and ${right[j]}`, comparisons, swaps });
      if (left[i] <= right[j]) { a[k++] = left[i++]; }
      else { a[k++] = right[j++]; swaps++; }
    }
    while (i < left.length) { a[k++] = left[i++]; }
    while (j < right.length) { a[k++] = right[j++]; }
    const s = {};
    for (let x = l; x <= r; x++) s[x] = STATE.SORTED;
    frames.push({ arr: [...a], states: s, msg: `Merged subarray [${l}..${r}]`, comparisons, swaps });
  }

  function mergeSort(a, l, r) {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    const s = {};
    for (let x = l; x <= m; x++) s[x] = STATE.COMPARING;
    for (let x = m + 1; x <= r; x++) s[x] = STATE.MERGING;
    frames.push({ arr: [...a], states: s, msg: `Split [${l}..${r}] → [${l}..${m}] & [${m+1}..${r}]`, comparisons, swaps });
    mergeSort(a, l, m);
    mergeSort(a, m + 1, r);
    merge(a, l, m, r);
  }

  mergeSort(arr, 0, arr.length - 1);
  const finalStates = {};
  for (let i = 0; i < arr.length; i++) finalStates[i] = STATE.SORTED;
  frames.push({ arr: [...arr], states: finalStates, msg: "Array fully sorted!", comparisons, swaps });
  return frames;
}

function quickSortFrames(input) {
  const arr = [...input];
  let comparisons = 0, swaps = 0;
  const sortedSet = new Set();
  const frames = [];

  function partition(a, low, high) {
    const pivot = a[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      comparisons++;
      const s = {};
      sortedSet.forEach(k => s[k] = STATE.SORTED);
      s[high] = STATE.PIVOT;
      for (let x = low; x <= high - 1; x++) if (!s[x]) s[x] = x <= i ? STATE.SORTED : STATE.COMPARING;
      s[j] = STATE.COMPARING;
      frames.push({ arr: [...a], states: s, msg: `Pivot=${pivot}, compare arr[${j}]=${a[j]}`, comparisons, swaps });
      if (a[j] < pivot) {
        i++;
        swaps++;
        [a[i], a[j]] = [a[j], a[i]];
        const s2 = {};
        sortedSet.forEach(k => s2[k] = STATE.SORTED);
        s2[high] = STATE.PIVOT; s2[i] = STATE.SWAPPING; s2[j] = STATE.SWAPPING;
        frames.push({ arr: [...a], states: s2, msg: `Swap arr[${i}]=${a[i]} ↔ arr[${j}]=${a[j]}`, comparisons, swaps });
      }
    }
    swaps++;
    [a[i + 1], a[high]] = [a[high], a[i + 1]];
    return i + 1;
  }

  function quickSort(a, low, high) {
    if (low < high) {
      const pi = partition(a, low, high);
      sortedSet.add(pi);
      
      const s = {}; 
      sortedSet.forEach(k => s[k] = STATE.SORTED);
      frames.push({ arr: [...a], states: s, msg: `Pivot ${a[pi]} placed at index ${pi}`, comparisons, swaps });
      
      quickSort(a, low, pi - 1);
      quickSort(a, pi + 1, high);
    } else if (low === high) sortedSet.add(low);
  }

  quickSort(arr, 0, arr.length - 1);
  const finalStates = {};
  for (let i = 0; i < arr.length; i++) finalStates[i] = STATE.SORTED;
  frames.push({ arr: [...arr], states: finalStates, msg: "Array fully sorted!", comparisons, swaps });
  return frames;
}

function heapSortFrames(input) {
  const arr = [...input];
  const n = arr.length;
  let comparisons = 0, swaps = 0;
  const sortedSet = new Set();
  const frames = [];

  function heapify(a, size, root) {
    let largest = root, l = 2 * root + 1, r = 2 * root + 2;
    comparisons++;
    const s = {};
    sortedSet.forEach(k => s[k] = STATE.SORTED);
    s[root] = STATE.PIVOT; if (l < size) s[l] = STATE.COMPARING; if (r < size) s[r] = STATE.COMPARING;
    frames.push({ arr: [...a], states: s, msg: `Heapify: root=${a[root]}, left=${l < size ? a[l] : 'N/A'}, right=${r < size ? a[r] : 'N/A'}`, comparisons, swaps });
    if (l < size && a[l] > a[largest]) largest = l;
    if (r < size && a[r] > a[largest]) { comparisons++; largest = r; }
    if (largest !== root) {
      swaps++;
      [a[root], a[largest]] = [a[largest], a[root]];
      const s2 = {};
      sortedSet.forEach(k => s2[k] = STATE.SORTED);
      s2[root] = STATE.SWAPPING; s2[largest] = STATE.SWAPPING;
      frames.push({ arr: [...a], states: s2, msg: `Swap arr[${root}]=${a[root]} with arr[${largest}]=${a[largest]}`, comparisons, swaps });
      heapify(a, size, largest);
    }
  }

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(arr, n, i);
  frames.push({ arr: [...arr], states: {}, msg: "Max heap built! Now extracting...", comparisons, swaps });

  for (let i = n - 1; i > 0; i--) {
    swaps++;
    [arr[0], arr[i]] = [arr[i], arr[0]];
    sortedSet.add(i);
    const s = {};
    sortedSet.forEach(k => s[k] = STATE.SORTED);
    s[0] = STATE.SWAPPING;
    frames.push({ arr: [...arr], states: s, msg: `Extract max ${arr[i]} to position ${i}`, comparisons, swaps });
    heapify(arr, i, 0);
  }
  const finalStates = {};
  for (let i = 0; i < n; i++) finalStates[i] = STATE.SORTED;
  frames.push({ arr: [...arr], states: finalStates, msg: "Array fully sorted!", comparisons, swaps });
  return frames;
}

const GENERATORS = { 
  bubble: bubbleSortFrames, 
  selection: selectionSortFrames, 
  insertion: insertionSortFrames, 
  merge: mergeSortFrames, 
  quick: quickSortFrames, 
  heap: heapSortFrames 
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function genArray(size, max) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * max) + 1);
}

function useInterval(cb, delay) {
  const ref = useRef(cb);
  useEffect(() => { ref.current = cb; }, [cb]);
  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => ref.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

// ─── SINGLE VISUALIZER PANEL ─────────────────────────────────────────────────
function SortPanel({ algoKey, initialArray, speed, isCompareMode, onMetricsUpdate, globalPlaying, onDone }) {
  const [arr, setArr] = useState([...initialArray]);
  const [states, setStates] = useState({});
  const [msg, setMsg] = useState("Ready to sort");
  const [metrics, setMetrics] = useState({ comparisons: 0, swaps: 0, time: 0 });
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const [frameIdx, setFrameIdx] = useState(0);
  const framesRef = useRef([]);
  const startTimeRef = useRef(null);
  const meta = ALGO_META[algoKey];

  // Build frames when array changes
  useEffect(() => {
    const frames = GENERATORS[algoKey](initialArray);
    framesRef.current = frames;
    setArr([...initialArray]);
    setStates({});
    setMsg("Ready — press Play");
    setMetrics({ comparisons: 0, swaps: 0, time: 0 });
    setPlaying(false);
    setDone(false);
    setFrameIdx(0);
  }, [initialArray, algoKey]);

  // Sync with global play
  useEffect(() => {
    if (globalPlaying !== undefined) {
      if (globalPlaying && !done) {
        startTimeRef.current = Date.now();
        setPlaying(true);
      } else {
        setPlaying(false);
      }
    }
  }, [globalPlaying, done]);

  const delay = speed <= 0 ? null : Math.max(10, Math.round(1000 / (speed * 30)));

  useInterval(() => {
    if (!playing || frameIdx >= framesRef.current.length) {
      if (frameIdx >= framesRef.current.length && playing) {
        setPlaying(false);
        setDone(true);
        onDone && onDone();
      }
      return;
    }
    const frame = framesRef.current[frameIdx];
    if (frame) {
        setArr([...frame.arr]);
        setStates(frame.states);
        setMsg(frame.msg);
        const elapsed = startTimeRef.current ? ((Date.now() - startTimeRef.current) / 1000).toFixed(2) : 0;
        const m = { comparisons: frame.comparisons, swaps: frame.swaps, time: elapsed };
        setMetrics(m);
        onMetricsUpdate && onMetricsUpdate(m);
    }
    setFrameIdx(f => f + 1);
  }, playing ? delay : null);

  const handlePlay = () => {
    if (done || frameIdx >= framesRef.current.length) {
      setFrameIdx(0); setDone(false);
      setArr([...initialArray]); setStates({}); setMetrics({ comparisons: 0, swaps: 0, time: 0 });
      setTimeout(() => { startTimeRef.current = Date.now(); setPlaying(true); }, 50);
    } else {
      if (!playing) startTimeRef.current = Date.now();
      setPlaying(p => !p);
    }
  };

  const maxVal = Math.max(...arr, 1);
  const showLabels = arr.length <= 30;
  const barMinW = isCompareMode ? Math.max(2, Math.floor(560 / arr.length) - 1) : Math.max(2, Math.floor(700 / arr.length) - 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: 0 }}>
      {/* Algo Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", background: "#0a0f1a", borderBottom: "1px solid #1e293b" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: meta.color, boxShadow: `0 0 8px ${meta.color}` }} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 14, color: "#f1f5f9" }}>{meta.name}</span>
          {done && <span style={{ fontSize: 10, padding: "2px 8px", background: "rgba(16,185,129,0.15)", border: "1px solid #10b981", borderRadius: 999, color: "#34d399" }}>DONE</span>}
        </div>
        {!isCompareMode && (
          <button onClick={handlePlay}
            style={{ padding: "5px 16px", borderRadius: 6, border: "none", background: playing ? "#7f1d1d" : "#1e3a5f", color: playing ? "#fca5a5" : "#93c5fd", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "monospace" }}>
            {done ? "↺ Restart" : playing ? "⏸ Pause" : frameIdx > 0 ? "▶ Resume" : "▶ Play"}
          </button>
        )}
      </div>

      {/* Canvas */}
      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 1, padding: "8px 12px 0", background: "radial-gradient(ellipse at bottom, #0d1b2e 0%, #060c16 100%)", overflow: "hidden", position: "relative" }}>
        
        {/* Numerical Preview Overlay */}
        <div style={{ position: "absolute", top: 12, left: 16, right: 16, zIndex: 10, display: "flex", gap: 4, overflowX: "auto", paddingBottom: 4, opacity: 0.85 }}>
          {arr.map((val, i) => {
            const st = states[i] || STATE.DEFAULT;
            const colors = STATE_COLORS[st];
            return (
              <div key={`txt-${i}`} style={{ flexShrink: 0, padding: "2px 5px", background: colors.bar, border: `1px solid ${colors.top}`, borderRadius: 4, fontSize: 10, color: "#fff", fontFamily: "monospace" }}>
                {val}
              </div>
            );
          })}
        </div>

        {/* Y-axis grid lines */}
        {[25, 50, 75, 100].map(pct => (
          <div key={pct} style={{ position: "absolute", bottom: `${pct}%`, left: 0, right: 0, borderTop: "1px solid rgba(255,255,255,0.04)", pointerEvents: "none" }} />
        ))}
        {arr.map((val, i) => {
          const st = states[i] || STATE.DEFAULT;
          const colors = STATE_COLORS[st];
          const heightPct = (val / maxVal) * 100;
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, maxWidth: barMinW + 4, minWidth: barMinW, alignSelf: "flex-end", transition: `height 0.08s ease`, position: "relative" }}>
              {showLabels && arr.length <= 20 && (
                <span style={{ fontSize: 8, color: colors.top, marginBottom: 1, fontFamily: "monospace", opacity: 0.8 }}>{val}</span>
              )}
              <div style={{
                width: "100%", height: `${heightPct}%`,
                background: `linear-gradient(to top, ${colors.bar}, ${colors.top})`,
                borderRadius: "2px 2px 0 0",
                boxShadow: st !== STATE.DEFAULT ? `0 0 8px ${colors.top}60, inset 0 0 4px ${colors.top}30` : "none",
                transition: "background 0.1s, box-shadow 0.1s, height 0.06s",
                minHeight: 2,
              }} />
            </div>
          );
        })}
      </div>

      {/* Step message */}
      <div style={{ padding: "6px 16px", background: "#070d1a", borderTop: "1px solid #0f172a", fontFamily: "monospace", fontSize: 11, color: "#64748b", minHeight: 28, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: meta.color, flexShrink: 0 }}>▸</span>
        <span style={{ color: "#94a3b8" }}>{msg}</span>
      </div>

      {/* Metrics row */}
      <div style={{ display: "flex", gap: 0, borderTop: "1px solid #0f172a" }}>
        {[["Comparisons", metrics.comparisons, "#fbbf24"], ["Swaps", metrics.swaps, "#f87171"], ["Time (s)", metrics.time, "#34d399"]].map(([label, val, col]) => (
          <div key={label} style={{ flex: 1, padding: "6px 0", textAlign: "center", borderRight: "1px solid #0f172a" }}>
            <div style={{ fontSize: 9, color: "#334155", textTransform: "uppercase", letterSpacing: 1, fontFamily: "monospace" }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: col, fontFamily: "monospace" }}>{val}</div>
          </div>
        ))}
        {/* Progress */}
        <div style={{ flex: 1, padding: "6px 8px", textAlign: "center" }}>
          <div style={{ fontSize: 9, color: "#334155", textTransform: "uppercase", letterSpacing: 1, fontFamily: "monospace" }}>Progress</div>
          <div style={{ height: 4, background: "#0f172a", borderRadius: 2, marginTop: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${framesRef.current.length ? (frameIdx / framesRef.current.length * 100) : 0}%`, background: meta.color, borderRadius: 2, transition: "width 0.1s" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LEGEND ──────────────────────────────────────────────────────────────────
function Legend() {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
      {Object.entries(STATE_COLORS).map(([key, val]) => (
        <div key={key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 10, height: 10, borderRadius: 2, background: val.top }} />
          <span style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>{val.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── PSEUDO CODE VIEWER ──────────────────────────────────────────────────────
function PseudoCode({ code }) {
  return (
    <pre style={{ margin: 0, padding: "12px 14px", background: "#060c16", borderRadius: 8, border: "1px solid #0f172a", fontSize: 11, lineHeight: 1.8, color: "#7dd3fc", fontFamily: "'DM Mono', 'Fira Code', monospace", overflowX: "auto" }}>
      {code.split('\n').map((line, i) => {
        const indentMatch = line.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[1].length : 0;
        const isKeyword = /^(for|while|if|return|function|def|swap|merge|build|extract|partition|heapify)/i.test(line.trim());
        return (
          <div key={i} style={{ paddingLeft: indent * 8, color: isKeyword ? "#c084fc" : line.includes('=') ? "#fbbf24" : "#7dd3fc" }}>
            {line.trim() || ' '}
          </div>
        );
      })}
    </pre>
  );
}

// ─── COMPARISON METRICS TABLE ─────────────────────────────────────────────────
function CompareMetricsTable({ algo1, algo2, m1, m2 }) {
  const keys = [["Comparisons", "comparisons", "#fbbf24"], ["Swaps", "swaps", "#f87171"], ["Time (s)", "time", "#34d399"]];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 2, alignItems: "center", padding: "8px 16px", background: "#07101f", borderTop: "1px solid #0f172a" }}>
      {keys.map(([label, key, color]) => {
        const v1 = m1[key] || 0, v2 = m2[key] || 0;
        const better1 = v1 <= v2, better2 = v2 <= v1;
        return (
          <div key={key} style={{ display: "contents" }}>
            <div style={{ textAlign: "right", padding: "3px 10px" }}>
              <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: better1 ? color : "#334155" }}>{v1}</span>
            </div>
            <div style={{ textAlign: "center", fontSize: 9, color: "#1e293b", textTransform: "uppercase", letterSpacing: 1, fontFamily: "monospace" }}>{label}</div>
            <div style={{ padding: "3px 10px" }}>
              <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: better2 ? color : "#334155" }}>{v2}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function SortingVisualizer() {
  // Array controls
  const [arraySize, setArraySize] = useState(40);
  const [valueRange, setValueRange] = useState(300);
  const [originalArray, setOriginalArray] = useState(() => genArray(40, 300));
  const [displayArray, setDisplayArray] = useState([...originalArray]);

  // Input states
  const [manualInput, setManualInput] = useState("");
  const [insertVal, setInsertVal] = useState("");
  const [insertIdx, setInsertIdx] = useState("");

  // Algorithm & mode
  const [selectedAlgo, setSelectedAlgo] = useState("bubble");
  const [compareMode, setCompareMode] = useState(false);
  const [compareAlgo1, setCompareAlgo1] = useState("quick");
  const [compareAlgo2, setCompareAlgo2] = useState("merge");

  // Playback
  const [speed, setSpeed] = useState(1);
  const [globalPlaying, setGlobalPlaying] = useState(false);
  const [compareKey, setCompareKey] = useState(0); 
  const [singleKey, setSingleKey] = useState(0);
  const [doneCount, setDoneCount] = useState(0);

  // Info panel tab
  const [infoTab, setInfoTab] = useState("desc");

  // Compare metrics
  const [m1, setM1] = useState({ comparisons: 0, swaps: 0, time: 0 });
  const [m2, setM2] = useState({ comparisons: 0, swaps: 0, time: 0 });

  const handleGenerate = () => {
    const a = genArray(arraySize, valueRange);
    setOriginalArray(a);
    setDisplayArray([...a]);
    setSingleKey(k => k + 1);
    setCompareKey(k => k + 1);
    setGlobalPlaying(false);
    setDoneCount(0);
  };

  const handleShuffle = () => {
    const a = [...originalArray].sort(() => Math.random() - 0.5);
    setOriginalArray(a);
    setDisplayArray([...a]);
    setSingleKey(k => k + 1);
    setCompareKey(k => k + 1);
    setGlobalPlaying(false);
    setDoneCount(0);
  };

  const handleReset = () => {
    setDisplayArray([...originalArray]);
    setSingleKey(k => k + 1);
    setCompareKey(k => k + 1);
    setGlobalPlaying(false);
    setDoneCount(0);
  };

  const handleComparePlay = () => {
    setDoneCount(0);
    setGlobalPlaying(true);
  };

  const handleCompareDone = () => {
    setDoneCount(c => {
      const next = c + 1;
      if (next >= 2) setGlobalPlaying(false);
      return next;
    });
  };

  const handleManualSubmit = () => {
    const parsed = manualInput.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n) && n > 0);
    if (parsed.length > 0) {
      const safeArray = parsed.slice(0, 200);
      setOriginalArray(safeArray);
      setDisplayArray([...safeArray]);
      setArraySize(safeArray.length);
      setSingleKey(k => k + 1);
      setCompareKey(k => k + 1);
      setGlobalPlaying(false);
      setDoneCount(0);
      setManualInput("");
    }
  };

  const handleInsert = () => {
    const val = parseInt(insertVal, 10);
    if (isNaN(val) || val <= 0) return;
    
    let idx = parseInt(insertIdx, 10);
    if (isNaN(idx) || idx < 0) idx = originalArray.length;
    if (idx > originalArray.length) idx = originalArray.length;
    
    const newArr = [...originalArray];
    newArr.splice(idx, 0, val);
    
    // Prevent array from getting excessively large and crashing the layout
    if (newArr.length > 200) newArr.pop(); 
    
    setOriginalArray(newArr);
    setDisplayArray([...newArr]);
    setArraySize(newArr.length);
    
    setSingleKey(k => k + 1);
    setCompareKey(k => k + 1);
    setGlobalPlaying(false);
    setDoneCount(0);
    setInsertVal("");
    setInsertIdx("");
  };

  const meta = ALGO_META[selectedAlgo];

  return (
    <div style={{ minHeight: "100vh", background: "#040912", color: "#e2e8f0", display: "flex", flexDirection: "column", fontFamily: "'DM Mono', 'Fira Code', monospace" }}>

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div style={{ background: "#06101e", borderBottom: "1px solid #0f172a", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, zIndex: 30 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ position: "relative" }}>
            <div style={{ width: 40, height: 40, display: "flex", alignItems: "flex-end", gap: 2, padding: "4px 6px", background: "#0d1b2e", borderRadius: 10, border: "1px solid #1e3a5f" }}>
              {[3, 5, 2, 7, 4, 6, 1].map((h, i) => (
                <div key={i} style={{ flex: 1, height: `${h * 13}%`, background: `hsl(${200 + i * 20}, 80%, 60%)`, borderRadius: "1px 1px 0 0" }} />
              ))}
            </div>
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, letterSpacing: -0.5, color: "#f1f5f9" }}>
              Sort<span style={{ color: "#3b82f6" }}>Viz</span>
            </h1>
            <p style={{ margin: 0, fontSize: 9, color: "#334155", letterSpacing: 3, textTransform: "uppercase" }}>Algorithm Visualizer</p>
          </div>
        </div>

        {/* Mode toggle */}
        <div style={{ display: "flex", background: "#0a1628", border: "1px solid #1e293b", borderRadius: 8, overflow: "hidden" }}>
          <button onClick={() => { setCompareMode(false); setGlobalPlaying(false); }}
            style={{ padding: "7px 18px", fontSize: 11, fontWeight: 700, background: !compareMode ? "#1e3a5f" : "transparent", color: !compareMode ? "#93c5fd" : "#334155", border: "none", cursor: "pointer", letterSpacing: 1 }}>
            SINGLE
          </button>
          <button onClick={() => { setCompareMode(true); setGlobalPlaying(false); }}
            style={{ padding: "7px 18px", fontSize: 11, fontWeight: 700, background: compareMode ? "#1e3a5f" : "transparent", color: compareMode ? "#93c5fd" : "#334155", border: "none", cursor: "pointer", letterSpacing: 1 }}>
            COMPARE
          </button>
        </div>

        {/* Legend */}
        <Legend />
      </div>

      {/* ── CONTROLS BAR ────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", background: "#060f1c", borderBottom: "1px solid #0f172a" }}>
        
        {/* Row 1: Sliders and Base Controls */}
        <div style={{ padding: "10px 24px", display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
          {/* Array size */}
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <label style={{ fontSize: 9, color: "#334155", textTransform: "uppercase", letterSpacing: 2 }}>Array Size: <span style={{ color: "#3b82f6" }}>{arraySize}</span></label>
            <input type="range" min={5} max={200} value={arraySize} onChange={e => setArraySize(+e.target.value)} disabled={globalPlaying}
              style={{ width: 120, accentColor: "#3b82f6" }} />
          </div>

          {/* Value range */}
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <label style={{ fontSize: 9, color: "#334155", textTransform: "uppercase", letterSpacing: 2 }}>Max Value: <span style={{ color: "#3b82f6" }}>{valueRange}</span></label>
            <input type="range" min={10} max={500} value={valueRange} onChange={e => setValueRange(+e.target.value)} disabled={globalPlaying}
              style={{ width: 120, accentColor: "#3b82f6" }} />
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              ["⊞ Generate", handleGenerate, "#1e3a5f", "#93c5fd"],
              ["⟳ Shuffle", handleShuffle, "#1e2a1e", "#4ade80"],
              ["↺ Reset", handleReset, "#1a1a2e", "#a78bfa"],
            ].map(([label, fn, bg, col]) => (
              <button key={label} onClick={fn} disabled={globalPlaying}
                style={{ padding: "7px 16px", background: bg, border: `1px solid ${col}30`, borderRadius: 7, color: col, fontSize: 11, fontWeight: 700, cursor: "pointer", letterSpacing: 1, opacity: globalPlaying ? 0.5 : 1 }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ width: 1, height: 28, background: "#0f172a" }} />

          {/* Speed */}
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <label style={{ fontSize: 9, color: "#334155", textTransform: "uppercase", letterSpacing: 2 }}>Speed: <span style={{ color: "#f59e0b" }}>{speed}x</span></label>
            <input type="range" min={0.25} max={8} step={0.25} value={speed} onChange={e => setSpeed(+e.target.value)}
              style={{ width: 100, accentColor: "#f59e0b" }} />
          </div>

          {/* Speed presets */}
          <div style={{ display: "flex", gap: 4 }}>
            {[0.25, 0.5, 1, 2, 5, 8].map(s => (
              <button key={s} onClick={() => setSpeed(s)}
                style={{ padding: "4px 8px", background: speed === s ? "#1a2e1a" : "#060f1c", border: `1px solid ${speed === s ? "#4ade80" : "#1e293b"}`, borderRadius: 5, color: speed === s ? "#4ade80" : "#334155", fontSize: 10, cursor: "pointer" }}>
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Manual Array Construction */}
        <div style={{ padding: "8px 24px", borderTop: "1px dashed #0f172a", display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", background: "#030811" }}>
          
          {/* Set Array Manually */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 9, color: "#334155", textTransform: "uppercase", letterSpacing: 1 }}>Set Array:</label>
            <input 
              value={manualInput} 
              onChange={e => setManualInput(e.target.value)} 
              placeholder="e.g. 50, 10, 30, 20" 
              disabled={globalPlaying}
              style={{ background: "#0a1628", border: "1px solid #1e293b", color: "#e2e8f0", padding: "4px 8px", borderRadius: 4, fontSize: 11, width: 140, outline: "none" }} 
            />
            <button onClick={handleManualSubmit} disabled={globalPlaying || !manualInput} style={{ padding: "4px 10px", background: "#1e3a5f", border: "none", borderRadius: 4, color: "#93c5fd", fontSize: 10, fontWeight: 700, cursor: "pointer", opacity: (globalPlaying || !manualInput) ? 0.5 : 1 }}>Set</button>
          </div>

          <div style={{ width: 1, height: 16, background: "#1e293b" }} />

          {/* Insert Single Element */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 9, color: "#334155", textTransform: "uppercase", letterSpacing: 1 }}>Insert Element:</label>
            <input 
              value={insertVal} 
              onChange={e => setInsertVal(e.target.value)} 
              placeholder="Val" 
              type="number" 
              disabled={globalPlaying}
              style={{ background: "#0a1628", border: "1px solid #1e293b", color: "#e2e8f0", padding: "4px 8px", borderRadius: 4, fontSize: 11, width: 60, outline: "none" }} 
            />
            <span style={{color: "#334155", fontSize: 10}}>@</span>
            <input 
              value={insertIdx} 
              onChange={e => setInsertIdx(e.target.value)} 
              placeholder="Idx" 
              type="number" 
              disabled={globalPlaying}
              style={{ background: "#0a1628", border: "1px solid #1e293b", color: "#e2e8f0", padding: "4px 8px", borderRadius: 4, fontSize: 11, width: 50, outline: "none" }} 
            />
            <button onClick={handleInsert} disabled={globalPlaying || !insertVal} style={{ padding: "4px 10px", background: "#1e2a1e", border: "none", borderRadius: 4, color: "#4ade80", fontSize: 10, fontWeight: 700, cursor: "pointer", opacity: (globalPlaying || !insertVal) ? 0.5 : 1 }}>+ Add</button>
          </div>

        </div>

      </div>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

        {compareMode ? (
          /* ── COMPARE MODE ─────────────────────────────────────────── */
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* Compare selector */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", background: "#060f1c", borderBottom: "1px solid #0f172a", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                {[["compareAlgo1", compareAlgo1, setCompareAlgo1], ["compareAlgo2", compareAlgo2, setCompareAlgo2]].map(([id, val, setter], idx) => (
                  <div key={id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: ALGO_META[val].color }} />
                    <select value={val} onChange={e => { setter(e.target.value); setCompareKey(k => k + 1); setGlobalPlaying(false); }}
                      style={{ background: "#0a1628", border: "1px solid #1e293b", borderRadius: 6, color: "#e2e8f0", fontSize: 12, padding: "5px 10px", outline: "none", cursor: "pointer" }}>
                      {Object.entries(ALGO_META).map(([k, v]) => (
                        <option key={k} value={k}>{v.name}</option>
                      ))}
                    </select>
                    {idx === 0 && <span style={{ color: "#334155", fontWeight: 700 }}>VS</span>}
                  </div>
                ))}
              </div>
              <button onClick={handleComparePlay} disabled={globalPlaying}
                style={{ padding: "8px 24px", background: globalPlaying ? "#0f2a0f" : "#052e16", border: `1px solid ${globalPlaying ? "#16532d" : "#22c55e"}`, borderRadius: 8, color: globalPlaying ? "#4ade80" : "#86efac", fontSize: 12, fontWeight: 700, cursor: globalPlaying ? "not-allowed" : "pointer", letterSpacing: 1 }}>
                {globalPlaying ? "▶ Running..." : "▶▶ Run Both"}
              </button>
            </div>

            {/* Two panels */}
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", overflow: "hidden" }}>
              <div style={{ display: "flex", flexDirection: "column", borderRight: "1px solid #0f172a" }}>
                <SortPanel key={`c1-${compareKey}`} algoKey={compareAlgo1} initialArray={displayArray} speed={speed}
                  isCompareMode globalPlaying={globalPlaying} onMetricsUpdate={setM1} onDone={handleCompareDone} />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <SortPanel key={`c2-${compareKey}`} algoKey={compareAlgo2} initialArray={displayArray} speed={speed}
                  isCompareMode globalPlaying={globalPlaying} onMetricsUpdate={setM2} onDone={handleCompareDone} />
              </div>
            </div>

            {/* Comparison metrics */}
            <div style={{ background: "#06101e", borderTop: "2px solid #0f172a" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "6px", background: "#040a14" }}>
                <span style={{ fontSize: 10, color: "#334155", textTransform: "uppercase", letterSpacing: 2 }}>Performance Comparison</span>
              </div>
              <CompareMetricsTable algo1={compareAlgo1} algo2={compareAlgo2} m1={m1} m2={m2} />

              {/* Complexity side-by-side */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, borderTop: "1px solid #0f172a" }}>
                {[compareAlgo1, compareAlgo2].map(ak => {
                  const m = ALGO_META[ak];
                  return (
                    <div key={ak} style={{ padding: "8px 16px", background: "#04090f", display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontSize: 10, color: m.color, fontWeight: 700 }}>{m.name}</span>
                      {[["Best", m.best], ["Avg", m.avg], ["Worst", m.worst], ["Space", m.space]].map(([l, v]) => (
                        <span key={l} style={{ fontSize: 10, color: "#334155" }}>{l}: <span style={{ color: "#94a3b8" }}>{v}</span></span>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* ── SINGLE MODE ──────────────────────────────────────────── */
          <>
            {/* Left: canvas + controls */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

              {/* Algo selector */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", background: "#060f1c", borderBottom: "1px solid #0f172a", flexWrap: "wrap" }}>
                <span style={{ fontSize: 9, color: "#334155", textTransform: "uppercase", letterSpacing: 2 }}>Algorithm:</span>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {Object.entries(ALGO_META).map(([key, m]) => (
                    <button key={key} onClick={() => { setSelectedAlgo(key); setSingleKey(k => k + 1); }}
                      style={{ padding: "5px 14px", borderRadius: 6, border: `1px solid ${selectedAlgo === key ? m.color : "#1e293b"}`, background: selectedAlgo === key ? `${m.color}18` : "transparent", color: selectedAlgo === key ? m.color : "#475569", fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.15s" }}>
                      {m.short}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort panel */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <SortPanel key={`s-${singleKey}-${selectedAlgo}`} algoKey={selectedAlgo} initialArray={displayArray} speed={speed} isCompareMode={false} />
              </div>
            </div>

            {/* ── RIGHT PANEL ─────────────────────────────────────────── */}
            <div style={{ width: 300, background: "#060f1c", borderLeft: "1px solid #0f172a", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>

              {/* Tabs */}
              <div style={{ display: "flex", borderBottom: "1px solid #0f172a" }}>
                {[["desc", "Info"], ["code", "Pseudo"], ["complexity", "O(n)"]].map(([tab, label]) => (
                  <button key={tab} onClick={() => setInfoTab(tab)}
                    style={{ flex: 1, padding: "10px 0", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, background: infoTab === tab ? "#0a1628" : "transparent", color: infoTab === tab ? meta.color : "#334155", border: "none", borderBottom: infoTab === tab ? `2px solid ${meta.color}` : "2px solid transparent", cursor: "pointer" }}>
                    {label}
                  </button>
                ))}
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>

                {infoTab === "desc" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: meta.color, boxShadow: `0 0 8px ${meta.color}` }} />
                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{meta.name}</h3>
                      </div>
                      <p style={{ margin: 0, fontSize: 11, color: "#64748b", lineHeight: 1.7 }}>{meta.desc}</p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      {[["Stable", meta.stable ? "Yes" : "No", meta.stable ? "#4ade80" : "#f87171"], ["Space", meta.space, "#c084fc"]].map(([l, v, c]) => (
                        <div key={l} style={{ background: "#040912", border: "1px solid #0f172a", borderRadius: 8, padding: "8px 10px" }}>
                          <div style={{ fontSize: 9, color: "#334155", textTransform: "uppercase", letterSpacing: 1 }}>{l}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: c, marginTop: 2 }}>{v}</div>
                        </div>
                      ))}
                    </div>

                    {/* State legend */}
                    <div>
                      <div style={{ fontSize: 9, color: "#334155", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>Bar States</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {Object.entries(STATE_COLORS).map(([key, val]) => (
                          <div key={key} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", background: "#040912", borderRadius: 5 }}>
                            <div style={{ width: 12, height: 16, background: `linear-gradient(to top, ${val.bar}, ${val.top})`, borderRadius: 2, flexShrink: 0 }} />
                            <span style={{ fontSize: 11, color: val.top }}>{val.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {infoTab === "code" && (
                  <div>
                    <div style={{ fontSize: 9, color: "#334155", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>Pseudocode</div>
                    <PseudoCode code={meta.pseudo} />
                    <div style={{ marginTop: 14, padding: "10px 12px", background: "#040912", border: "1px solid #0f172a", borderRadius: 8, fontSize: 10, color: "#64748b", lineHeight: 1.6 }}>
                      <span style={{ color: meta.color }}>Tip: </span>
                      {selectedAlgo === "bubble" && "Early termination when no swaps occur in a pass — best case O(n)."}
                      {selectedAlgo === "selection" && "Always O(n²) comparisons regardless of input — no early exit."}
                      {selectedAlgo === "insertion" && "Very fast on nearly-sorted arrays. Inner loop breaks early."}
                      {selectedAlgo === "merge" && "Guaranteed O(n log n) but needs O(n) extra memory for merging."}
                      {selectedAlgo === "quick" && "Pivot choice matters! Random pivot avoids worst-case O(n²)."}
                      {selectedAlgo === "heap" && "Builds max-heap in O(n) then extracts n times in O(log n) each."}
                    </div>
                  </div>
                )}

                {infoTab === "complexity" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ fontSize: 9, color: "#334155", textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>Time & Space Complexity</div>

                    {[["Best Case", meta.best, "#4ade80"], ["Average", meta.avg, "#fbbf24"], ["Worst Case", meta.worst, "#f87171"], ["Space", meta.space, "#c084fc"]].map(([label, val, color]) => (
                      <div key={label} style={{ background: "#040912", border: `1px solid ${color}20`, borderRadius: 8, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: "#64748b" }}>{label}</span>
                        <code style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "monospace" }}>{val}</code>
                      </div>
                    ))}

                    {/* All algorithms comparison */}
                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontSize: 9, color: "#334155", textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>All Algorithms</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {Object.entries(ALGO_META).map(([key, m]) => (
                          <button key={key} onClick={() => { setSelectedAlgo(key); setSingleKey(k => k + 1); }}
                            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 10px", background: selectedAlgo === key ? `${m.color}15` : "#040912", border: `1px solid ${selectedAlgo === key ? m.color : "#0f172a"}`, borderRadius: 6, cursor: "pointer", transition: "all 0.15s", gap: 8 }}>
                            <span style={{ fontSize: 11, color: m.color, fontWeight: 700, minWidth: 70, textAlign: "left" }}>{m.short}</span>
                            <span style={{ fontSize: 10, color: "#475569" }}>{m.avg}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <div style={{ background: "#04090f", borderTop: "1px solid #0a1220", padding: "8px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {Object.entries(ALGO_META).map(([key, m]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: m.color }} />
              <span style={{ fontSize: 9, color: "#1e293b" }}>{m.short}: {m.avg}</span>
            </div>
          ))}
        </div>
        <span style={{ fontSize: 9, color: "#1e293b", letterSpacing: 2 }}>SORT VIZ • DSA VISUALIZER</span>
      </div>
    </div>
  );
}