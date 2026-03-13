import { useState, useCallback, useRef, useEffect, useMemo } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#07080d",
  surface: "#0d0f16",
  panel: "#111420",
  border: "#1a1f2e",
  accent: "#3b82f6",
  green: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  purple: "#8b5cf6",
  cyan: "#06b6d4",
  text: "#e2e8f0",
  muted: "#475569",
  dim: "#1e2535",
};

// ─── COMPLEXITY DATA ──────────────────────────────────────────────────────────
const COMPLEXITY = {
  bubble:    { best:"O(n)", avg:"O(n²)", worst:"O(n²)", space:"O(1)" },
  selection: { best:"O(n²)", avg:"O(n²)", worst:"O(n²)", space:"O(1)" },
  insertion: { best:"O(n)", avg:"O(n²)", worst:"O(n²)", space:"O(1)" },
  merge:     { best:"O(n log n)", avg:"O(n log n)", worst:"O(n log n)", space:"O(n)" },
  quick:     { best:"O(n log n)", avg:"O(n log n)", worst:"O(n²)", space:"O(log n)" },
};

const ALGO_INFO = {
  bubble: {
    name: "Bubble Sort",
    desc: "Repeatedly compares adjacent elements and swaps them if they're in the wrong order. Each pass bubbles the largest unsorted element to its final position.",
    pseudo: `for i = 0 to n-1:
  for j = 0 to n-i-2:
    if arr[j] > arr[j+1]:
      swap(arr[j], arr[j+1])`,
  },
  selection: {
    name: "Selection Sort",
    desc: "Divides the array into sorted and unsorted regions. Repeatedly selects the minimum element from the unsorted region and moves it to the sorted region.",
    pseudo: `for i = 0 to n-1:
  minIdx = i
  for j = i+1 to n:
    if arr[j] < arr[minIdx]:
      minIdx = j
  swap(arr[i], arr[minIdx])`,
  },
  insertion: {
    name: "Insertion Sort",
    desc: "Builds a sorted array one element at a time by inserting each element into its correct position among the previously sorted elements.",
    pseudo: `for i = 1 to n-1:
  key = arr[i]
  j = i - 1
  while j >= 0 and arr[j] > key:
    arr[j+1] = arr[j]
    j = j - 1
  arr[j+1] = key`,
  },
  merge: {
    name: "Merge Sort",
    desc: "Divides the array in half recursively until single elements remain, then merges sorted halves back together in order.",
    pseudo: `mergeSort(arr, l, r):
  if l < r:
    mid = (l+r) / 2
    mergeSort(arr, l, mid)
    mergeSort(arr, mid+1, r)
    merge(arr, l, mid, r)`,
  },
  quick: {
    name: "Quick Sort",
    desc: "Selects a pivot element and partitions the array around it, so elements smaller than the pivot are on the left and larger on the right, then recursively sorts each partition.",
    pseudo: `quickSort(arr, low, high):
  if low < high:
    pi = partition(arr, low, high)
    quickSort(arr, low, pi-1)
    quickSort(arr, pi+1, high)`,
  },
};

const CODE = {
  javascript: {
    bubble: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
    selection: `function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    if (minIdx !== i)
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
  }
  return arr;
}`,
    insertion: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let key = arr[i], j = i - 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      j--;
    }
    arr[j + 1] = key;
  }
  return arr;
}`,
    merge: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}
function merge(l, r) {
  const res = [];
  let i = 0, j = 0;
  while (i < l.length && j < r.length)
    res.push(l[i] <= r[j] ? l[i++] : r[j++]);
  return [...res, ...l.slice(i), ...r.slice(j)];
}`,
    quick: `function quickSort(arr, low = 0, high = arr.length-1) {
  if (low < high) {
    const pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
  return arr;
}
function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i+1], arr[high]] = [arr[high], arr[i+1]];
  return i + 1;
}`,
  },
  python: {
    bubble: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
    selection: `def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr`,
    insertion: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr`,
    merge: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(l, r):
    res, i, j = [], 0, 0
    while i < len(l) and j < len(r):
        if l[i] <= r[j]: res.append(l[i]); i += 1
        else: res.append(r[j]); j += 1
    return res + l[i:] + r[j:]`,
    quick: `def quick_sort(arr, low=0, high=None):
    if high is None: high = len(arr) - 1
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)
    return arr

def partition(arr, low, high):
    pivot, i = arr[high], low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i+1], arr[high] = arr[high], arr[i+1]
    return i + 1`,
  },
  java: {
    bubble: `void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n-1; i++)
        for (int j = 0; j < n-i-1; j++)
            if (arr[j] > arr[j+1]) {
                int t = arr[j];
                arr[j] = arr[j+1];
                arr[j+1] = t;
            }
}`,
    selection: `void selectionSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n-1; i++) {
        int min = i;
        for (int j = i+1; j < n; j++)
            if (arr[j] < arr[min]) min = j;
        int t = arr[min];
        arr[min] = arr[i];
        arr[i] = t;
    }
}`,
    insertion: `void insertionSort(int[] arr) {
    for (int i = 1; i < arr.length; i++) {
        int key = arr[i], j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j+1] = arr[j]; j--;
        }
        arr[j+1] = key;
    }
}`,
    merge: `void mergeSort(int[] arr, int l, int r) {
    if (l < r) {
        int m = (l + r) / 2;
        mergeSort(arr, l, m);
        mergeSort(arr, m+1, r);
        merge(arr, l, m, r);
    }
}`,
    quick: `void quickSort(int[] arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi-1);
        quickSort(arr, pi+1, high);
    }
}`,
  },
  cpp: {
    bubble: `void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n-1; i++)
        for (int j = 0; j < n-i-1; j++)
            if (arr[j] > arr[j+1])
                swap(arr[j], arr[j+1]);
}`,
    selection: `void selectionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n-1; i++) {
        int minIdx = i;
        for (int j = i+1; j < n; j++)
            if (arr[j] < arr[minIdx]) minIdx = j;
        swap(arr[i], arr[minIdx]);
    }
}`,
    insertion: `void insertionSort(vector<int>& arr) {
    for (int i = 1; i < arr.size(); i++) {
        int key = arr[i], j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j+1] = arr[j]; j--;
        }
        arr[j+1] = key;
    }
}`,
    merge: `void mergeSort(vector<int>& arr, int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        mergeSort(arr, l, m);
        mergeSort(arr, m+1, r);
        merge(arr, l, m, r);
    }
}`,
    quick: `void quickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi-1);
        quickSort(arr, pi+1, high);
    }
}`,
  },
};

// ─── SORTING STEP GENERATORS ──────────────────────────────────────────────────
function getBubbleSteps(arr) {
  const a = [...arr], steps = [];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({ type: "compare", indices: [j, j + 1], arr: [...a], desc: `Compare a[${j}]=${a[j]} and a[${j+1}]=${a[j+1]}` });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({ type: "swap", indices: [j, j + 1], arr: [...a], desc: `Swap a[${j}] and a[${j+1}]` });
      }
    }
    steps.push({ type: "sorted", indices: [n - 1 - i], arr: [...a], desc: `Element at index ${n-1-i} is sorted` });
  }
  steps.push({ type: "done", arr: [...a], desc: "Array fully sorted!" });
  return steps;
}

function getSelectionSteps(arr) {
  const a = [...arr], steps = [], sorted = [];
  for (let i = 0; i < a.length - 1; i++) {
    let min = i;
    steps.push({ type: "pivot", indices: [i], arr: [...a], sorted: [...sorted], desc: `Finding minimum from index ${i}` });
    for (let j = i + 1; j < a.length; j++) {
      steps.push({ type: "compare", indices: [j, min], arr: [...a], sorted: [...sorted], desc: `Compare a[${j}]=${a[j]} with min a[${min}]=${a[min]}` });
      if (a[j] < a[min]) min = j;
    }
    if (min !== i) {
      [a[i], a[min]] = [a[min], a[i]];
      steps.push({ type: "swap", indices: [i, min], arr: [...a], sorted: [...sorted], desc: `Swap a[${i}] and a[${min}]` });
    }
    sorted.push(i);
    steps.push({ type: "sorted", indices: [i], arr: [...a], sorted: [...sorted], desc: `a[${i}]=${a[i]} is in correct position` });
  }
  sorted.push(a.length - 1);
  steps.push({ type: "done", arr: [...a], sorted: [...sorted], desc: "Array fully sorted!" });
  return steps;
}

function getInsertionSteps(arr) {
  const a = [...arr], steps = [];
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    steps.push({ type: "key", indices: [i], arr: [...a], desc: `Key = a[${i}] = ${key}` });
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      steps.push({ type: "shift", indices: [j, j + 1], arr: [...a], desc: `Shift a[${j}]=${a[j+1]} right` });
      j--;
    }
    a[j + 1] = key;
    steps.push({ type: "place", indices: [j + 1], arr: [...a], desc: `Place key ${key} at index ${j+1}` });
  }
  steps.push({ type: "done", arr: [...a], desc: "Array fully sorted!" });
  return steps;
}

function getMergeSteps(arr) {
  const steps = [];
  const a = [...arr];
  function merge(arr, l, m, r) {
    const left = arr.slice(l, m + 1), right = arr.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    while (i < left.length && j < right.length) {
      steps.push({ type: "compare", indices: [l + i, m + 1 + j], arr: [...arr], desc: `Merge: compare ${left[i]} and ${right[j]}` });
      if (left[i] <= right[j]) { arr[k++] = left[i++]; }
      else { arr[k++] = right[j++]; }
      steps.push({ type: "place", indices: [k - 1], arr: [...arr], desc: `Place ${arr[k-1]} at index ${k-1}` });
    }
    while (i < left.length) { arr[k++] = left[i++]; steps.push({ type: "place", indices: [k - 1], arr: [...arr], desc: `Place ${arr[k-1]}` }); }
    while (j < right.length) { arr[k++] = right[j++]; steps.push({ type: "place", indices: [k - 1], arr: [...arr], desc: `Place ${arr[k-1]}` }); }
  }
  function msort(arr, l, r) {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    steps.push({ type: "divide", indices: [l, m, r], arr: [...arr], desc: `Divide [${l}..${r}] at mid=${m}` });
    msort(arr, l, m);
    msort(arr, m + 1, r);
    merge(arr, l, m, r);
    steps.push({ type: "merged", indices: Array.from({ length: r - l + 1 }, (_, i) => l + i), arr: [...arr], desc: `Merged [${l}..${r}]` });
  }
  msort(a, 0, a.length - 1);
  steps.push({ type: "done", arr: [...a], desc: "Array fully sorted!" });
  return steps;
}

function getQuickSteps(arr) {
  const steps = [], a = [...arr];
  function partition(arr, low, high) {
    const pivot = arr[high];
    steps.push({ type: "pivot", indices: [high], arr: [...arr], desc: `Pivot = ${pivot} at index ${high}` });
    let i = low - 1;
    for (let j = low; j < high; j++) {
      steps.push({ type: "compare", indices: [j, high], arr: [...arr], desc: `Compare a[${j}]=${arr[j]} with pivot ${pivot}` });
      if (arr[j] <= pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        if (i !== j) steps.push({ type: "swap", indices: [i, j], arr: [...arr], desc: `Swap a[${i}] and a[${j}]` });
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    steps.push({ type: "place", indices: [i + 1], arr: [...arr], desc: `Pivot ${pivot} placed at index ${i+1}` });
    return i + 1;
  }
  function qs(arr, low, high) {
    if (low < high) {
      const pi = partition(arr, low, high);
      qs(arr, low, pi - 1);
      qs(arr, pi + 1, high);
    }
  }
  qs(a, 0, a.length - 1);
  steps.push({ type: "done", arr: [...a], desc: "Array fully sorted!" });
  return steps;
}

const STEP_GENERATORS = { bubble: getBubbleSteps, selection: getSelectionSteps, insertion: getInsertionSteps, merge: getMergeSteps, quick: getQuickSteps };

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const G = `
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;500;600;700;800&display=swap');

*{box-sizing:border-box;margin:0;padding:0;}
body{background:${T.bg};color:${T.text};font-family:'Syne',sans-serif;}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:${T.surface};}
::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px;}

@keyframes cellIn{from{opacity:0;transform:scaleY(0) translateY(-20px);}to{opacity:1;transform:scaleY(1) translateY(0);}}
@keyframes cellOut{from{opacity:1;transform:scale(1);}to{opacity:0;transform:scale(0.3) translateY(30px);}}
@keyframes swapBounce{0%{transform:translateY(0);}30%{transform:translateY(-18px);}60%{transform:translateY(-18px);}100%{transform:translateY(0);}}
@keyframes compareGlow{0%,100%{box-shadow:none;}50%{box-shadow:0 0 0 3px ${T.amber}80,0 0 20px ${T.amber}40;}}
@keyframes foundPop{0%{transform:scale(1);}40%{transform:scale(1.3);}70%{transform:scale(0.95);}100%{transform:scale(1.1);}}
@keyframes traverseStep{0%,100%{background:${T.panel};}50%{background:${T.cyan}25;}}
@keyframes scanLine{0%{left:-60px;}100%{left:100%}}
@keyframes barRise{from{height:0;opacity:0;}to{opacity:1;}}
@keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}

.cell-enter{animation:cellIn 0.35s cubic-bezier(.34,1.56,.64,1) forwards;}
.cell-exit{animation:cellOut 0.3s ease-in forwards;}
.cell-swap{animation:swapBounce 0.5s ease-in-out;}
.cell-compare{animation:compareGlow 0.5s ease-in-out;}
.cell-traverse{animation:traverseStep 0.5s ease;}
.cell-found{animation:foundPop 0.6s ease forwards;}

.btn{
  background:${T.panel};
  border:1px solid ${T.border};
  color:${T.muted};
  padding:7px 14px;
  border-radius:6px;
  cursor:pointer;
  font-family:'Syne',sans-serif;
  font-weight:600;
  font-size:12px;
  letter-spacing:.3px;
  transition:all .2s;
  white-space:nowrap;
}
.btn:hover{color:${T.text};border-color:${T.muted};}
.btn-blue{
  background:${T.accent}18;
  border-color:${T.accent}50;
  color:${T.accent};
}
.btn-blue:hover{background:${T.accent}28;border-color:${T.accent};box-shadow:0 0 12px ${T.accent}30;}
.btn-red{background:${T.red}18;border-color:${T.red}50;color:${T.red};}
.btn-red:hover{background:${T.red}28;border-color:${T.red};}
.btn-green{background:${T.green}18;border-color:${T.green}50;color:${T.green};}
.btn-green:hover{background:${T.green}28;border-color:${T.green};}
.btn-amber{background:${T.amber}18;border-color:${T.amber}50;color:${T.amber};}
.btn-amber:hover{background:${T.amber}28;border-color:${T.amber};}
.btn-purple{background:${T.purple}18;border-color:${T.purple}50;color:${T.purple};}
.btn-purple:hover{background:${T.purple}28;border-color:${T.purple};}
.btn:disabled{opacity:.3;cursor:not-allowed;}

.inp{
  background:${T.surface};
  border:1px solid ${T.border};
  color:${T.text};
  padding:7px 10px;
  border-radius:6px;
  font-family:'Space Mono',monospace;
  font-size:12px;
  outline:none;
  transition:border-color .2s;
}
.inp:focus{border-color:${T.accent}80;}
.inp::placeholder{color:${T.muted};}

.panel{background:${T.panel};border:1px solid ${T.border};border-radius:10px;}
.mono{font-family:'Space Mono',monospace;}

.tab-a{border-bottom:2px solid ${T.accent};color:${T.accent};}
.tab-i{border-bottom:2px solid transparent;color:${T.muted};}
.tab-i:hover{color:${T.text};}

.code-view{
  background:#040508;
  border:1px solid ${T.border};
  border-radius:8px;
  padding:12px;
  font-family:'Space Mono',monospace;
  font-size:11px;
  line-height:1.75;
  color:#94a3b8;
  overflow:auto;
  white-space:pre;
  max-height:220px;
}

.slider{
  -webkit-appearance:none;
  width:100%;
  height:3px;
  border-radius:2px;
  background:${T.border};
  outline:none;
}
.slider::-webkit-slider-thumb{
  -webkit-appearance:none;
  width:13px;height:13px;
  border-radius:50%;
  background:${T.accent};
  cursor:pointer;
  box-shadow:0 0 6px ${T.accent}60;
}

.metric-box{
  text-align:center;
  padding:8px 12px;
  border-radius:6px;
  flex:1;
}

.toast{
  position:fixed;
  bottom:20px;right:20px;
  padding:10px 16px;
  border-radius:8px;
  font-family:'Space Mono',monospace;
  font-size:11px;
  z-index:999;
  animation:fadeUp .3s ease;
}
`;

// ─── ARRAY CELL ───────────────────────────────────────────────────────────────
function ArrayCell({ value, index, state, maxVal }) {
  const stateMap = {
    default:  { bg: T.panel,    border: T.border,  color: T.text,  label: T.muted },
    compare:  { bg: `${T.amber}20`, border: T.amber, color: T.amber, label: T.amber },
    swap:     { bg: `${T.purple}20`, border: T.purple, color: T.purple, label: T.purple },
    pivot:    { bg: `${T.red}20`, border: T.red, color: T.red, label: T.red },
    sorted:   { bg: `${T.green}20`, border: T.green, color: T.green, label: T.green },
    key:      { bg: `${T.cyan}20`, border: T.cyan, color: T.cyan, label: T.cyan },
    found:    { bg: `${T.green}30`, border: T.green, color: T.green, label: T.green },
    traverse: { bg: `${T.accent}20`, border: T.accent, color: T.accent, label: T.accent },
    new:      { bg: `${T.accent}15`, border: T.accent, color: T.text, label: T.muted },
    deleted:  { bg: `${T.red}10`, border: T.red, color: T.red, label: T.red },
    place:    { bg: `${T.cyan}20`, border: T.cyan, color: T.cyan, label: T.cyan },
    shift:    { bg: `${T.purple}15`, border: T.purple, color: T.purple, label: T.purple },
    divide:   { bg: `${T.amber}15`, border: T.amber, color: T.amber, label: T.amber },
    merged:   { bg: `${T.green}20`, border: T.green, color: T.green, label: T.green },
  };

  const s = stateMap[state] || stateMap.default;
  const barH = Math.max(8, Math.round((value / (maxVal || 100)) * 60));
  const cellW = 52;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: cellW }}>
      {/* Index */}
      <div className="mono" style={{ fontSize: 9, color: s.label, fontWeight: 700 }}>{index}</div>

      {/* Bar */}
      <div style={{
        width: cellW - 8,
        height: barH,
        background: `linear-gradient(180deg, ${s.border}80, ${s.border}40)`,
        borderRadius: "3px 3px 0 0",
        transition: "height .3s ease, background .3s",
        alignSelf: "flex-end",
        marginBottom: -1,
      }} />

      {/* Cell box */}
      <div
        className={`cell-${state === "compare" ? "compare" : state === "swap" ? "swap" : state === "traverse" ? "traverse" : state === "found" ? "found" : ""}`}
        style={{
          width: cellW - 2,
          background: s.bg,
          border: `1.5px solid ${s.border}`,
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background .3s, border-color .3s",
          boxShadow: state !== "default" ? `0 0 12px ${s.border}40` : "none",
          minHeight: 38,
        }}
      >
        <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{value}</span>
      </div>
    </div>
  );
}

// ─── CANVAS ───────────────────────────────────────────────────────────────────
function Canvas({ arr, cellStates, maxVal, traversalResult, newIdx, deletedIdx }) {
  const scrollRef = useRef(null);
  useEffect(() => {
    if (scrollRef.current && newIdx !== null) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [arr.length, newIdx]);

  if (arr.length === 0) return (
    <div style={{
      flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
      background: T.bg,
      backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 29px,${T.border}20 29px,${T.border}20 30px),repeating-linear-gradient(90deg,transparent,transparent 29px,${T.border}20 29px,${T.border}20 30px)`,
      borderRadius: 12, border: `1px solid ${T.border}`, minHeight: 180,
    }}>
      <div style={{ textAlign: "center", color: T.muted }}>
        <div style={{ fontSize: 36, opacity: .2, marginBottom: 8 }}>[ ]</div>
        <div className="mono" style={{ fontSize: 12 }}>Empty Array</div>
        <div style={{ fontSize: 11, marginTop: 4 }}>Create or generate an array above</div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        ref={scrollRef}
        style={{
          overflowX: "auto", overflowY: "visible",
          background: T.bg,
          backgroundImage: `repeating-linear-gradient(0deg,transparent,transparent 29px,${T.border}18 29px,${T.border}18 30px),repeating-linear-gradient(90deg,transparent,transparent 29px,${T.border}18 29px,${T.border}18 30px)`,
          borderRadius: 12, border: `1px solid ${T.border}`,
          padding: "16px 20px 12px",
          display: "flex", alignItems: "flex-end", gap: 6,
          minHeight: 160,
          position: "relative",
        }}
      >
        {arr.map((val, i) => (
          <ArrayCell
            key={`${i}-${val}`}
            value={val}
            index={i}
            state={cellStates[i] || "default"}
            maxVal={maxVal}
          />
        ))}
      </div>

      {/* Traversal result */}
      {traversalResult.length > 0 && (
        <div className="panel" style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 10, color: T.muted, fontWeight: 600, letterSpacing: 1 }}>TRAVERSAL</span>
          <div className="mono" style={{ fontSize: 11, color: T.cyan }}>
            {traversalResult.join(" → ")}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── METRICS ─────────────────────────────────────────────────────────────────
function Metrics({ comparisons, swaps, iterations }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {[
        { label: "COMPARISONS", val: comparisons, color: T.amber },
        { label: "SWAPS", val: swaps, color: T.purple },
        { label: "ITERATIONS", val: iterations, color: T.cyan },
      ].map(m => (
        <div key={m.label} className="metric-box" style={{ background: `${m.color}10`, border: `1px solid ${m.color}30` }}>
          <div style={{ fontSize: 8, color: m.color, fontWeight: 700, letterSpacing: 1, marginBottom: 3 }}>{m.label}</div>
          <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: m.color }}>{m.val}</div>
        </div>
      ))}
    </div>
  );
}

// ─── COMPLEXITY TABLE ─────────────────────────────────────────────────────────
function ComplexityTable({ algo }) {
  if (!algo) return <div style={{ color: T.muted, fontSize: 12 }}>Select an algorithm</div>;
  const c = COMPLEXITY[algo];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
      {[
        { label: "Best Case", val: c.best, color: T.green },
        { label: "Average", val: c.avg, color: T.amber },
        { label: "Worst Case", val: c.worst, color: T.red },
        { label: "Space", val: c.space, color: T.purple },
      ].map(r => (
        <div key={r.label} style={{ background: `${r.color}10`, border: `1px solid ${r.color}25`, borderRadius: 6, padding: "6px 10px" }}>
          <div style={{ fontSize: 9, color: T.muted, fontWeight: 600, letterSpacing: .5, marginBottom: 2 }}>{r.label.toUpperCase()}</div>
          <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: r.color }}>{r.val}</div>
        </div>
      ))}
    </div>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null;
  const c = type === "error" ? T.red : T.green;
  return (
    <div className="toast" style={{ background: `${c}18`, border: `1px solid ${c}50`, color: c }}>
      {type === "error" ? "⚠ " : "✓ "}{msg}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [arr, setArr] = useState([38, 27, 43, 3, 9, 82, 10]);
  const [cellStates, setCellStates] = useState({});
  const [manualInput, setManualInput] = useState("38,27,43,3,9,82,10");
  const [randSize, setRandSize] = useState(10);
  const [randMax, setRandMax] = useState(99);

  const [value, setValue] = useState("");
  const [index, setIndex] = useState("");

  const [algo, setAlgo] = useState("bubble");
  const [sortSteps, setSortSteps] = useState([]);
  const [stepIdx, setStepIdx] = useState(-1);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState("auto");
  const [speed, setSpeed] = useState(1);

  const [codeTab, setCodeTab] = useState("javascript");
  const [algoTab, setAlgoTab] = useState("steps"); // steps | pseudo | complexity

  const [traversalResult, setTraversalResult] = useState([]);
  const [sortedIndices, setSortedIndices] = useState([]);
  const [currentStepDesc, setCurrentStepDesc] = useState("");

  const [comparisons, setComparisons] = useState(0);
  const [swaps, setSwaps] = useState(0);
  const [iterations, setIterations] = useState(0);

  const [toast, setToast] = useState(null);
  const [newIdx, setNewIdx] = useState(null);

  const runRef = useRef(false);

  const maxVal = useMemo(() => Math.max(...arr, 1), [arr]);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const delay = useCallback((ms) => new Promise(r => setTimeout(r, ms)), []);
  const animDelay = useCallback(() => delay(Math.round(700 / speed)), [delay, speed]);

  const resetStates = useCallback(() => {
    setCellStates({});
    setSortedIndices([]);
    setCurrentStepDesc("");
  }, []);

  // ── Array creation ──
  const handleCreate = useCallback(() => {
    const vals = manualInput.split(",").map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    if (vals.length === 0) { showToast("Enter valid comma-separated integers", "error"); return; }
    setArr(vals); resetStates(); setTraversalResult([]);
    setComparisons(0); setSwaps(0); setIterations(0);
    showToast(`Array created with ${vals.length} elements`);
  }, [manualInput, resetStates, showToast]);

  const handleRandom = useCallback(() => {
    const vals = Array.from({ length: randSize }, () => Math.floor(Math.random() * randMax) + 1);
    setArr(vals); setManualInput(vals.join(",")); resetStates(); setTraversalResult([]);
    setComparisons(0); setSwaps(0); setIterations(0);
    showToast(`Generated ${randSize} random elements`);
  }, [randSize, randMax, resetStates, showToast]);

  const handleReset = useCallback(() => {
    setArr([38, 27, 43, 3, 9, 82, 10]);
    setManualInput("38,27,43,3,9,82,10");
    resetStates(); setTraversalResult([]);
    setComparisons(0); setSwaps(0); setIterations(0);
    showToast("Array reset");
  }, [resetStates, showToast]);

  // ── Operations ──
  const parseVal = () => { const v = parseInt(value, 10); if (isNaN(v)) { showToast("Enter a valid integer", "error"); return null; } return v; };
  const parseIdx = () => { const i = parseInt(index, 10); return i; };

  const markNew = useCallback(async (idx) => {
    setNewIdx(idx);
    setCellStates(s => ({ ...s, [idx]: "new" }));
    await delay(600);
    setCellStates(s => { const c = { ...s }; delete c[idx]; return c; });
    setNewIdx(null);
  }, [delay]);

  const handleInsertStart = useCallback(async () => {
    const v = parseVal(); if (v === null) return;
    setArr(a => [v, ...a]);
    await markNew(0);
    setValue(""); showToast(`Inserted ${v} at start`);
  }, [value, markNew, showToast]);

  const handleInsertEnd = useCallback(async () => {
    const v = parseVal(); if (v === null) return;
    setArr(a => { markNew(a.length); return [...a, v]; });
    setValue(""); showToast(`Inserted ${v} at end`);
  }, [value, markNew, showToast]);

  const handleInsertAt = useCallback(async () => {
    const v = parseVal(); if (v === null) return;
    const i = parseIdx();
    if (isNaN(i) || i < 0 || i > arr.length) { showToast("Invalid index", "error"); return; }
    setArr(a => { const c = [...a]; c.splice(i, 0, v); return c; });
    await markNew(i);
    setValue(""); setIndex(""); showToast(`Inserted ${v} at index ${i}`);
  }, [value, index, arr.length, markNew, showToast]);

  const handleDelStart = useCallback(async () => {
    if (!arr.length) { showToast("Array is empty", "error"); return; }
    setCellStates({ 0: "deleted" });
    await delay(400);
    setArr(a => a.slice(1)); setCellStates({});
    showToast("Deleted from start");
  }, [arr, delay, showToast]);

  const handleDelEnd = useCallback(async () => {
    if (!arr.length) { showToast("Array is empty", "error"); return; }
    setCellStates({ [arr.length - 1]: "deleted" });
    await delay(400);
    setArr(a => a.slice(0, -1)); setCellStates({});
    showToast("Deleted from end");
  }, [arr, delay, showToast]);

  const handleDelAt = useCallback(async () => {
    const i = parseIdx();
    if (isNaN(i) || i < 0 || i >= arr.length) { showToast("Invalid index", "error"); return; }
    setCellStates({ [i]: "deleted" });
    await delay(400);
    setArr(a => a.filter((_, idx) => idx !== i)); setCellStates({});
    setIndex(""); showToast(`Deleted element at index ${i}`);
  }, [index, arr, delay, showToast]);

  const handleUpdate = useCallback(async () => {
    const v = parseVal(); if (v === null) return;
    const i = parseIdx();
    if (isNaN(i) || i < 0 || i >= arr.length) { showToast("Invalid index", "error"); return; }
    setCellStates({ [i]: "key" });
    await delay(300);
    setArr(a => { const c = [...a]; c[i] = v; return c; });
    await delay(400);
    setCellStates({});
    setValue(""); setIndex(""); showToast(`Updated index ${i} to ${v}`);
  }, [value, index, arr, delay, showToast]);

  const handleSearch = useCallback(async () => {
    const v = parseVal(); if (v === null) return;
    let found = false;
    for (let i = 0; i < arr.length; i++) {
      setCellStates({ [i]: "traverse" });
      setCurrentStepDesc(`Checking index ${i}: arr[${i}] = ${arr[i]}`);
      await animDelay();
      if (arr[i] === v) {
        setCellStates({ [i]: "found" });
        setCurrentStepDesc(`Found ${v} at index ${i}!`);
        showToast(`Found ${v} at index ${i}`);
        found = true;
        await delay(1200);
        break;
      }
    }
    if (!found) { setCellStates({}); setCurrentStepDesc(""); showToast(`${v} not found in array`, "error"); }
    else setCellStates({});
  }, [value, arr, animDelay, delay, showToast]);

  const handleTraverse = useCallback(async () => {
    const result = [];
    for (let i = 0; i < arr.length; i++) {
      setCellStates({ [i]: "traverse" });
      setCurrentStepDesc(`Visiting index ${i}: ${arr[i]}`);
      result.push(arr[i]);
      await animDelay();
    }
    setCellStates({});
    setCurrentStepDesc("Traversal complete");
    setTraversalResult([...result]);
    showToast("Traversal complete");
  }, [arr, animDelay, showToast]);

  // ── Sorting ──
  const prepareSortSteps = useCallback(() => {
    const steps = STEP_GENERATORS[algo]([...arr]);
    setSortSteps(steps);
    setStepIdx(-1);
    resetStates();
    setComparisons(0); setSwaps(0); setIterations(0);
    return steps;
  }, [algo, arr, resetStates]);

  const applyStep = useCallback((step, steps, idx) => {
    setCurrentStepDesc(step.desc);
    setArr(step.arr);

    const newStates = {};
    if (step.indices) step.indices.forEach(i => { newStates[i] = step.type; });
    if (step.sorted) step.sorted.forEach(i => { newStates[i] = "sorted"; });
    setCellStates(newStates);

    if (step.type === "compare") setComparisons(c => c + 1);
    if (step.type === "swap") setSwaps(s => s + 1);
    setIterations(idx + 1);

    if (step.type === "done") {
      const finalStates = {};
      step.arr.forEach((_, i) => { finalStates[i] = "sorted"; });
      setCellStates(finalStates);
      setCurrentStepDesc("✓ " + step.desc);
    }
  }, []);

  const runAutoSort = useCallback(async (steps) => {
    runRef.current = true;
    setRunning(true);
    for (let i = 0; i < steps.length; i++) {
      if (!runRef.current) break;
      setStepIdx(i);
      applyStep(steps[i], steps, i);
      await animDelay();
    }
    setRunning(false);
    runRef.current = false;
  }, [applyStep, animDelay]);

  const handleRunSort = useCallback(() => {
    if (running) { runRef.current = false; setRunning(false); return; }
    const steps = prepareSortSteps();
    if (mode === "auto") runAutoSort(steps);
    else { setStepIdx(0); applyStep(steps[0], steps, 0); }
  }, [running, mode, prepareSortSteps, runAutoSort, applyStep]);

  const handleNextStep = useCallback(() => {
    if (sortSteps.length === 0) {
      const steps = prepareSortSteps();
      setStepIdx(0); applyStep(steps[0], steps, 0); return;
    }
    const next = stepIdx + 1;
    if (next >= sortSteps.length) return;
    setStepIdx(next);
    applyStep(sortSteps[next], sortSteps, next);
  }, [sortSteps, stepIdx, prepareSortSteps, applyStep]);

  const stopSort = () => { runRef.current = false; setRunning(false); };

  const algoNames = { bubble: "Bubble Sort", selection: "Selection Sort", insertion: "Insertion Sort", merge: "Merge Sort", quick: "Quick Sort" };

  return (
    <>
      <style>{G}</style>
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", fontFamily: "'Syne', sans-serif" }}>

        {/* ── HEADER ── */}
        <header style={{ background: T.panel, borderBottom: `1px solid ${T.border}`, height: 52, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 26, height: 26, background: `linear-gradient(135deg, ${T.accent}, ${T.purple})`, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900 }}>[]</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: .5 }}>DSA Visualizer</div>
              <div className="mono" style={{ fontSize: 9, color: T.muted, marginTop: -2 }}>Array Explorer</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span className="mono" style={{ fontSize: 10, color: T.accent, background: `${T.accent}15`, border: `1px solid ${T.accent}30`, padding: "2px 8px", borderRadius: 4 }}>{arr.length} elements</span>
            <span className="mono" style={{ fontSize: 10, color: T.purple, background: `${T.purple}15`, border: `1px solid ${T.purple}30`, padding: "2px 8px", borderRadius: 4 }}>{algoNames[algo]}</span>
          </div>
        </header>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 14, gap: 12, overflow: "hidden" }}>

          {/* ── INIT PANEL ── */}
          <div className="panel" style={{ padding: 14, flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
              {/* Manual */}
              <div style={{ flex: "2 1 220px" }}>
                <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 5 }}>MANUAL INPUT (comma-separated)</label>
                <input className="inp" style={{ width: "100%" }} value={manualInput} onChange={e => setManualInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCreate()} placeholder="e.g. 10, 25, 7, 44, 3" />
              </div>
              {/* Random size */}
              <div style={{ flex: "1 1 120px" }}>
                <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 5 }}>
                  SIZE: <span style={{ color: T.accent }}>{randSize}</span>
                </label>
                <input type="range" min={5} max={30} value={randSize} onChange={e => setRandSize(+e.target.value)} className="slider" />
              </div>
              {/* Random range */}
              <div style={{ flex: "1 1 120px" }}>
                <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 5 }}>
                  MAX VALUE: <span style={{ color: T.accent }}>{randMax}</span>
                </label>
                <input type="range" min={10} max={200} value={randMax} onChange={e => setRandMax(+e.target.value)} className="slider" />
              </div>
              {/* Buttons */}
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-blue" onClick={handleCreate}>Create</button>
                <button className="btn btn-amber" onClick={handleRandom}>Random</button>
                <button className="btn" onClick={handleReset}>Reset</button>
              </div>
            </div>
          </div>

          {/* ── MAIN AREA ── */}
          <div style={{ flex: 1, display: "flex", gap: 12, overflow: "hidden", minHeight: 0 }}>

            {/* LEFT COLUMN */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, overflow: "hidden", minWidth: 0 }}>

              {/* Canvas */}
              <Canvas arr={arr} cellStates={cellStates} maxVal={maxVal} traversalResult={traversalResult} newIdx={newIdx} />

              {/* Metrics */}
              <Metrics comparisons={comparisons} swaps={swaps} iterations={iterations} />

              {/* Operations */}
              <div className="panel" style={{ padding: 14, flexShrink: 0 }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                  {/* Inputs */}
                  <div style={{ display: "flex", gap: 8, flex: "1 1 160px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 4 }}>VALUE</label>
                      <input className="inp" style={{ width: "100%" }} type="number" value={value} onChange={e => setValue(e.target.value)} placeholder="42" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 4 }}>INDEX</label>
                      <input className="inp" style={{ width: "100%" }} type="number" value={index} onChange={e => setIndex(e.target.value)} placeholder="0" />
                    </div>
                  </div>
                  {/* Insert */}
                  <div>
                    <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 4 }}>INSERT</label>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button className="btn btn-blue" onClick={handleInsertStart}>Start</button>
                      <button className="btn btn-blue" onClick={handleInsertEnd}>End</button>
                      <button className="btn btn-blue" onClick={handleInsertAt}>At Index</button>
                    </div>
                  </div>
                  {/* Delete */}
                  <div>
                    <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 4 }}>DELETE</label>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button className="btn btn-red" onClick={handleDelStart}>Start</button>
                      <button className="btn btn-red" onClick={handleDelEnd}>End</button>
                      <button className="btn btn-red" onClick={handleDelAt}>At Index</button>
                    </div>
                  </div>
                  {/* Update / Search / Traverse */}
                  <div>
                    <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 4 }}>OTHER</label>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button className="btn btn-amber" onClick={handleUpdate}>Update</button>
                      <button className="btn" onClick={handleSearch}>Search</button>
                      <button className="btn" onClick={handleTraverse}>Traverse</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sorting panel */}
              <div className="panel" style={{ padding: 14, flexShrink: 0 }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                  {/* Algorithm select */}
                  <div>
                    <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 4 }}>ALGORITHM</label>
                    <select
                      value={algo}
                      onChange={e => { setAlgo(e.target.value); stopSort(); resetStates(); }}
                      className="inp"
                    >
                      <option value="bubble">Bubble Sort</option>
                      <option value="selection">Selection Sort</option>
                      <option value="insertion">Insertion Sort</option>
                      <option value="merge">Merge Sort</option>
                      <option value="quick">Quick Sort</option>
                    </select>
                  </div>
                  {/* Speed */}
                  <div style={{ flex: "1 1 140px" }}>
                    <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 4 }}>
                      SPEED <span style={{ color: T.accent }}>{speed}x</span>
                    </label>
                    <input type="range" min={0.25} max={4} step={0.25} value={speed} onChange={e => setSpeed(+e.target.value)} className="slider" />
                  </div>
                  {/* Mode */}
                  <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                    <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1 }}>MODE</label>
                    <button className={`btn${mode === "auto" ? " btn-blue" : ""}`} style={{ fontSize: 11, padding: "5px 10px" }} onClick={() => setMode("auto")}>Auto</button>
                    <button className={`btn${mode === "step" ? " btn-blue" : ""}`} style={{ fontSize: 11, padding: "5px 10px" }} onClick={() => setMode("step")}>Step</button>
                  </div>
                  {/* Run / Stop / Next */}
                  <div style={{ display: "flex", gap: 5 }}>
                    <button className={`btn ${running ? "btn-red" : "btn-green"}`} onClick={handleRunSort} disabled={arr.length === 0}>
                      {running ? "Stop" : "Run Sort"}
                    </button>
                    {mode === "step" && (
                      <button className="btn btn-amber" onClick={handleNextStep} disabled={running}>
                        Next Step →
                      </button>
                    )}
                  </div>
                </div>

                {/* Current step description */}
                {currentStepDesc && (
                  <div style={{ marginTop: 10, padding: "6px 12px", background: `${T.accent}10`, border: `1px solid ${T.accent}25`, borderRadius: 6 }}>
                    <span className="mono" style={{ fontSize: 11, color: T.accent }}>▶ {currentStepDesc}</span>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div style={{ width: 290, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12, overflow: "auto" }}>

              {/* Algorithm info */}
              <div className="panel" style={{ padding: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: T.text, marginBottom: 4 }}>{ALGO_INFO[algo].name}</div>
                <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.6, marginBottom: 12 }}>{ALGO_INFO[algo].desc}</div>

                {/* Tabs */}
                <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, marginBottom: 10 }}>
                  {["steps", "pseudo", "complexity"].map(t => (
                    <button key={t} onClick={() => setAlgoTab(t)} className={algoTab === t ? "tab-a" : "tab-i"} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 10px", fontSize: 10, fontWeight: 700, letterSpacing: .5, fontFamily: "'Syne'" }}>
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>

                {algoTab === "steps" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {(ALGO_INFO[algo].pseudo.split("\n")).map((line, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ width: 16, height: 16, borderRadius: "50%", background: T.dim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: T.muted, flexShrink: 0, marginTop: 1, fontFamily: "Space Mono" }}>{i + 1}</span>
                        <span className="mono" style={{ fontSize: 10, color: T.muted, lineHeight: 1.5 }}>{line}</span>
                      </div>
                    ))}
                  </div>
                )}
                {algoTab === "pseudo" && (
                  <div className="code-view" style={{ maxHeight: 160 }}>{ALGO_INFO[algo].pseudo}</div>
                )}
                {algoTab === "complexity" && <ComplexityTable algo={algo} />}
              </div>

              {/* Code viewer */}
              <div className="panel" style={{ padding: 14, flex: 1 }}>
                <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>CODE</div>
                <div style={{ display: "flex", gap: 0, marginBottom: 8, borderBottom: `1px solid ${T.border}` }}>
                  {["javascript", "python", "java", "cpp"].map(l => (
                    <button key={l} onClick={() => setCodeTab(l)} className={codeTab === l ? "tab-a" : "tab-i"} style={{ background: "none", border: "none", cursor: "pointer", padding: "3px 9px", fontSize: 9, fontWeight: 700, letterSpacing: .5, fontFamily: "Space Mono" }}>
                      {l === "cpp" ? "C++" : l === "javascript" ? "JS" : l.charAt(0).toUpperCase() + l.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="code-view">{CODE[codeTab][algo]}</div>
              </div>

              {/* Legend */}
              <div className="panel" style={{ padding: 14 }}>
                <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>LEGEND</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                  {[
                    { color: T.amber, label: "Comparing" },
                    { color: T.purple, label: "Swapping" },
                    { color: T.red, label: "Pivot" },
                    { color: T.green, label: "Sorted" },
                    { color: T.cyan, label: "Key / Traverse" },
                    { color: T.accent, label: "New / Place" },
                  ].map(({ color, label }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: `${color}40`, border: `1.5px solid ${color}` }} />
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
