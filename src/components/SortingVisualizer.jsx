import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, SkipForward, RotateCcw, 
  Settings2, Activity, Shuffle, BarChart3,
  Code2, BookOpen, FastForward, SplitSquareHorizontal
} from 'lucide-react';

// --- CONSTANTS & DATA ---

const COLORS = {
  0: 'bg-indigo-500/80', // Default (Unsorted)
  1: 'bg-yellow-400',    // Comparing
  2: 'bg-red-500',       // Swapping / Moving
  3: 'bg-emerald-500',   // Sorted
  4: 'bg-purple-500'     // Pivot / Key
};

const ALGORITHMS = {
  bubble: {
    id: 'bubble', title: "Bubble Sort", time: "O(n²)", space: "O(1)",
    best: "O(n)", avg: "O(n²)", worst: "O(n²)",
    description: "Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
    code: {
      js: `function bubbleSort(arr) {\n  let n = arr.length;\n  for (let i = 0; i < n - 1; i++) {\n    for (let j = 0; j < n - i - 1; j++) {\n      if (arr[j] > arr[j + 1]) {\n        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];\n      }\n    }\n  }\n}`,
      py: `def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n - 1):\n        for j in range(n - i - 1):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]`
    }
  },
  selection: {
    id: 'selection', title: "Selection Sort", time: "O(n²)", space: "O(1)",
    best: "O(n²)", avg: "O(n²)", worst: "O(n²)",
    description: "Divides the list into a sorted and unsorted region. Repeatedly selects the minimum element from the unsorted region and moves it.",
    code: {
      js: `function selectionSort(arr) {\n  let n = arr.length;\n  for(let i = 0; i < n; i++) {\n    let minIdx = i;\n    for(let j = i + 1; j < n; j++) {\n      if(arr[j] < arr[minIdx]) minIdx = j;\n    }\n    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];\n  }\n}`,
      py: `def selection_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        min_idx = i\n        for j in range(i + 1, n):\n            if arr[j] < arr[min_idx]:\n                min_idx = j\n        arr[i], arr[min_idx] = arr[min_idx], arr[i]`
    }
  },
  insertion: {
    id: 'insertion', title: "Insertion Sort", time: "O(n²)", space: "O(1)",
    best: "O(n)", avg: "O(n²)", worst: "O(n²)",
    description: "Builds the final sorted array one item at a time. It takes each element and inserts it into its correct position in the already sorted part.",
    code: {
      js: `function insertionSort(arr) {\n  for (let i = 1; i < arr.length; i++) {\n    let key = arr[i];\n    let j = i - 1;\n    while (j >= 0 && arr[j] > key) {\n      arr[j + 1] = arr[j];\n      j = j - 1;\n    }\n    arr[j + 1] = key;\n  }\n}`,
      py: `def insertion_sort(arr):\n    for i in range(1, len(arr)):\n        key = arr[i]\n        j = i - 1\n        while j >= 0 and arr[j] > key:\n            arr[j + 1] = arr[j]\n            j -= 1\n        arr[j + 1] = key`
    }
  },
  merge: {
    id: 'merge', title: "Merge Sort", time: "O(n log n)", space: "O(n)",
    best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)",
    description: "Divide-and-conquer algorithm. Divides the array into halves, recursively sorts them, and then merges the sorted halves.",
    code: {
      js: `function mergeSort(arr, l, r) {\n  if (l >= r) return;\n  let m = l + parseInt((r - l) / 2);\n  mergeSort(arr, l, m);\n  mergeSort(arr, m + 1, r);\n  merge(arr, l, m, r);\n}`,
      py: `def merge_sort(arr):\n    if len(arr) > 1:\n        mid = len(arr)//2\n        L = arr[:mid]\n        R = arr[mid:]\n        merge_sort(L)\n        merge_sort(R)\n        # Merge L and R...`
    }
  },
  quick: {
    id: 'quick', title: "Quick Sort", time: "O(n log n)", space: "O(log n)",
    best: "O(n log n)", avg: "O(n log n)", worst: "O(n²)",
    description: "Divide-and-conquer. Picks a pivot element and partitions the array around the pivot, placing smaller elements before and larger after.",
    code: {
      js: `function quickSort(arr, low, high) {\n  if (low < high) {\n    let pi = partition(arr, low, high);\n    quickSort(arr, low, pi - 1);\n    quickSort(arr, pi + 1, high);\n  }\n}`,
      py: `def quick_sort(arr, low, high):\n    if low < high:\n        pi = partition(arr, low, high)\n        quick_sort(arr, low, pi - 1)\n        quick_sort(arr, pi + 1, high)`
    }
  },
  heap: {
    id: 'heap', title: "Heap Sort", time: "O(n log n)", space: "O(1)",
    best: "O(n log n)", avg: "O(n log n)", worst: "O(n log n)",
    description: "Based on Binary Heap data structure. Builds a max heap, then repeatedly extracts the maximum element and rebuilds the heap.",
    code: {
      js: `function heapSort(arr) {\n  let n = arr.length;\n  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(arr, n, i);\n  for (let i = n - 1; i > 0; i--) {\n    [arr[0], arr[i]] = [arr[i], arr[0]];\n    heapify(arr, i, 0);\n  }\n}`,
      py: `def heap_sort(arr):\n    n = len(arr)\n    for i in range(n//2 - 1, -1, -1):\n        heapify(arr, n, i)\n    for i in range(n-1, 0, -1):\n        arr[i], arr[0] = arr[0], arr[i]\n        heapify(arr, i, 0)`
    }
  }
};

// --- ALGORITHM STEP GENERATORS ---
// Yields: { arr: [...], colors: [...], comps, swaps, msg }
// Color codes: 0=Default, 1=Comparing, 2=Swapping, 3=Sorted, 4=Pivot

const generateBubbleSort = (initialArr) => {
  let arr = [...initialArr];
  let n = arr.length;
  let steps = [];
  let comps = 0, swaps = 0;
  let colors = new Array(n).fill(0);

  const pushStep = (msg) => steps.push({ arr: [...arr], colors: [...colors], comps, swaps, msg });

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      comps++;
      colors[j] = 1; colors[j+1] = 1;
      pushStep(`Comparing elements at index ${j} and ${j+1}`);

      if (arr[j] > arr[j + 1]) {
        swaps++;
        colors[j] = 2; colors[j+1] = 2;
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        pushStep(`Swapping ${arr[j+1]} and ${arr[j]}`);
      }
      colors[j] = 0; colors[j+1] = 0;
    }
    colors[n - i - 1] = 3; // Mark sorted
    pushStep(`Element ${arr[n-i-1]} is in its final sorted position`);
  }
  colors[0] = 3;
  pushStep("Array is completely sorted!");
  return steps;
};

const generateSelectionSort = (initialArr) => {
  let arr = [...initialArr];
  let n = arr.length;
  let steps = [];
  let comps = 0, swaps = 0;
  let colors = new Array(n).fill(0);

  const pushStep = (msg) => steps.push({ arr: [...arr], colors: [...colors], comps, swaps, msg });

  for (let i = 0; i < n; i++) {
    let minIdx = i;
    colors[minIdx] = 4; // Pivot/Min
    pushStep(`Starting pass ${i}. Current minimum is at index ${minIdx}`);

    for (let j = i + 1; j < n; j++) {
      comps++;
      colors[j] = 1;
      pushStep(`Comparing with ${arr[j]}`);
      if (arr[j] < arr[minIdx]) {
        colors[minIdx] = 0;
        minIdx = j;
        colors[minIdx] = 4;
        pushStep(`Found new minimum: ${arr[minIdx]} at index ${minIdx}`);
      } else {
        colors[j] = 0;
      }
    }

    if (minIdx !== i) {
      swaps++;
      colors[i] = 2; colors[minIdx] = 2;
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      pushStep(`Swapping minimum element ${arr[i]} into sorted position ${i}`);
      colors[minIdx] = 0;
    }
    colors[i] = 3;
  }
  pushStep("Array is completely sorted!");
  return steps;
};

const generateInsertionSort = (initialArr) => {
  let arr = [...initialArr];
  let n = arr.length;
  let steps = [];
  let comps = 0, swaps = 0;
  let colors = new Array(n).fill(0);

  const pushStep = (msg) => steps.push({ arr: [...arr], colors: [...colors], comps, swaps, msg });

  colors[0] = 3;
  pushStep("First element is trivially sorted.");

  for (let i = 1; i < n; i++) {
    let key = arr[i];
    let j = i - 1;
    colors[i] = 4; // Key
    pushStep(`Selected key ${key} to insert into sorted portion.`);

    while (j >= 0) {
      comps++;
      colors[j] = 1;
      pushStep(`Comparing key ${key} with ${arr[j]}`);
      
      if (arr[j] > key) {
        swaps++;
        colors[j] = 2; colors[j+1] = 2;
        arr[j + 1] = arr[j];
        pushStep(`Moving ${arr[j]} to the right.`);
        colors[j+1] = 3; 
        colors[j] = 3;
        j = j - 1;
      } else {
        colors[j] = 3;
        break;
      }
    }
    arr[j + 1] = key;
    colors[j+1] = 3;
    for(let k=0; k<=i; k++) colors[k] = 3;
    pushStep(`Inserted key ${key} into position ${j+1}`);
  }
  pushStep("Array is completely sorted!");
  return steps;
};

const generateMergeSort = (initialArr) => {
  let arr = [...initialArr];
  let n = arr.length;
  let steps = [];
  let comps = 0, swaps = 0;
  let colors = new Array(n).fill(0);

  const pushStep = (msg) => steps.push({ arr: [...arr], colors: [...colors], comps, swaps, msg });

  const merge = (l, m, r) => {
    let n1 = m - l + 1;
    let n2 = r - m;
    let L = new Array(n1);
    let R = new Array(n2);
    for (let i = 0; i < n1; i++) L[i] = arr[l + i];
    for (let j = 0; j < n2; j++) R[j] = arr[m + 1 + j];

    let i = 0, j = 0, k = l;
    
    for(let x=l; x<=r; x++) colors[x] = 4;
    pushStep(`Merging subarrays: [${l}..${m}] and [${m+1}..${r}]`);

    while (i < n1 && j < n2) {
      comps++;
      colors[l+i] = 1; colors[m+1+j] = 1;
      pushStep(`Comparing ${L[i]} and ${R[j]}`);
      
      if (L[i] <= R[j]) {
        arr[k] = L[i];
        swaps++; // Array writes count as operations here
        colors[k] = 2;
        pushStep(`Overwriting index ${k} with ${L[i]}`);
        colors[k] = 3;
        i++;
      } else {
        arr[k] = R[j];
        swaps++;
        colors[k] = 2;
        pushStep(`Overwriting index ${k} with ${R[j]}`);
        colors[k] = 3;
        j++;
      }
      k++;
    }

    while (i < n1) {
      arr[k] = L[i];
      swaps++;
      colors[k] = 2;
      pushStep(`Copying remaining left element ${L[i]} to index ${k}`);
      colors[k] = 3;
      i++; k++;
    }

    while (j < n2) {
      arr[k] = R[j];
      swaps++;
      colors[k] = 2;
      pushStep(`Copying remaining right element ${R[j]} to index ${k}`);
      colors[k] = 3;
      j++; k++;
    }
  };

  const mergeSortRec = (l, r) => {
    if (l >= r) return;
    let m = l + Math.floor((r - l) / 2);
    mergeSortRec(l, m);
    mergeSortRec(m + 1, r);
    merge(l, m, r);
  };

  mergeSortRec(0, n - 1);
  for(let i=0; i<n; i++) colors[i] = 3;
  pushStep("Array is completely sorted!");
  return steps;
};

const generateQuickSort = (initialArr) => {
  let arr = [...initialArr];
  let n = arr.length;
  let steps = [];
  let comps = 0, swaps = 0;
  let colors = new Array(n).fill(0);

  const pushStep = (msg) => steps.push({ arr: [...arr], colors: [...colors], comps, swaps, msg });

  const partition = (low, high) => {
    let pivot = arr[high];
    colors[high] = 4;
    pushStep(`Selected pivot ${pivot} at index ${high}`);
    
    let i = low - 1;
    for (let j = low; j <= high - 1; j++) {
      comps++;
      colors[j] = 1;
      pushStep(`Comparing ${arr[j]} with pivot ${pivot}`);
      
      if (arr[j] < pivot) {
        i++;
        swaps++;
        colors[i] = 2; colors[j] = 2;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        pushStep(`Swapping ${arr[i]} and ${arr[j]}`);
        colors[i] = 0; colors[j] = 0;
      } else {
        colors[j] = 0;
      }
    }
    swaps++;
    colors[i + 1] = 2; colors[high] = 2;
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    pushStep(`Moving pivot ${pivot} to its correct position ${i+1}`);
    colors[i + 1] = 3; 
    return i + 1;
  };

  const quickSortRec = (low, high) => {
    if (low < high) {
      let pi = partition(low, high);
      quickSortRec(low, pi - 1);
      quickSortRec(pi + 1, high);
    } else if (low === high) {
      colors[low] = 3; // base case single element is sorted
    }
  };

  quickSortRec(0, n - 1);
  for(let i=0; i<n; i++) colors[i] = 3;
  pushStep("Array is completely sorted!");
  return steps;
};

const generateHeapSort = (initialArr) => {
  let arr = [...initialArr];
  let n = arr.length;
  let steps = [];
  let comps = 0, swaps = 0;
  let colors = new Array(n).fill(0);

  const pushStep = (msg) => steps.push({ arr: [...arr], colors: [...colors], comps, swaps, msg });

  const heapify = (N, i) => {
    let largest = i;
    let l = 2 * i + 1;
    let r = 2 * i + 2;

    if (l < N) {
      comps++;
      colors[l] = 1; colors[largest] = 1;
      pushStep(`Comparing left child ${arr[l]} with parent ${arr[largest]}`);
      if (arr[l] > arr[largest]) largest = l;
      colors[l] = 0; colors[largest] = 0;
    }

    if (r < N) {
      comps++;
      colors[r] = 1; colors[largest] = 1;
      pushStep(`Comparing right child ${arr[r]} with current max ${arr[largest]}`);
      if (arr[r] > arr[largest]) largest = r;
      colors[r] = 0; colors[largest] = 0;
    }

    if (largest !== i) {
      swaps++;
      colors[i] = 2; colors[largest] = 2;
      [arr[i], arr[largest]] = [arr[largest], arr[i]];
      pushStep(`Swapping parent ${arr[i]} with larger child ${arr[largest]}`);
      colors[i] = 0; colors[largest] = 0;
      heapify(N, largest);
    }
  };

  pushStep("Building Max Heap...");
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i);
  }

  for (let i = n - 1; i > 0; i--) {
    swaps++;
    colors[0] = 4; colors[i] = 2;
    pushStep(`Extracting max element ${arr[0]} to the end of array`);
    [arr[0], arr[i]] = [arr[i], arr[0]];
    colors[i] = 3; // Sorted at end
    colors[0] = 0;
    
    heapify(i, 0);
  }
  colors[0] = 3;
  pushStep("Array is completely sorted!");
  return steps;
};

const GENERATORS = {
  bubble: generateBubbleSort,
  selection: generateSelectionSort,
  insertion: generateInsertionSort,
  merge: generateMergeSort,
  quick: generateQuickSort,
  heap: generateHeapSort
};


// --- MAIN COMPONENT ---

export default function SortingVisualizer() {
  // Config State
  const [arraySize, setArraySize] = useState(30);
  const [maxVal, setMaxVal] = useState(200);
  const [baseArray, setBaseArray] = useState([]);
  const [manualInput, setManualInput] = useState('');
  
  // App Mode State
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [algo1, setAlgo1] = useState(ALGORITHMS.quick);
  const [algo2, setAlgo2] = useState(ALGORITHMS.merge);
  const [codeLang, setCodeLang] = useState('js');

  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); 
  
  // Track 1 State
  const [steps1, setSteps1] = useState([]);
  const [currentStep1, setCurrentStep1] = useState(0);
  
  // Track 2 State (Comparison)
  const [steps2, setSteps2] = useState([]);
  const [currentStep2, setCurrentStep2] = useState(0);

  // Initialize Array
  const generateArray = () => {
    setIsPlaying(false);
    const newArr = Array.from({ length: arraySize }, () => Math.floor(Math.random() * maxVal) + 5);
    setBaseArray(newArr);
    
    // Pre-calculate steps
    const newSteps1 = GENERATORS[algo1.id](newArr);
    setSteps1(newSteps1);
    setCurrentStep1(0);

    if (isCompareMode) {
      const newSteps2 = GENERATORS[algo2.id](newArr);
      setSteps2(newSteps2);
      setCurrentStep2(0);
    }
  };

  // Handle Manual Array Input
  const handleManualArraySubmit = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      const parsedArray = manualInput
        .split(',')
        .map(num => parseInt(num.trim(), 10))
        .filter(num => !isNaN(num) && num > 0);

      if (parsedArray.length > 0) {
        setIsPlaying(false);
        // Limit array size to prevent browser crash, update state
        const safeArray = parsedArray.slice(0, 200);
        setArraySize(safeArray.length);
        setMaxVal(Math.max(...safeArray, 10)); // Adjust max value for chart scaling
        setBaseArray(safeArray);

        setSteps1(GENERATORS[algo1.id](safeArray));
        setCurrentStep1(0);

        if (isCompareMode) {
          setSteps2(GENERATORS[algo2.id](safeArray));
          setCurrentStep2(0);
        }
        setManualInput(''); // Clear input after success
      }
    }
  };

  // Re-generate if size changes
  useEffect(() => { generateArray(); }, [arraySize]);

  // Re-calculate steps if algorithm changes without regenerating array
  useEffect(() => {
    if (baseArray.length > 0) {
      setIsPlaying(false);
      setSteps1(GENERATORS[algo1.id](baseArray));
      setCurrentStep1(0);
      if (isCompareMode) {
        setSteps2(GENERATORS[algo2.id](baseArray));
        setCurrentStep2(0);
      }
    }
  }, [algo1, algo2, isCompareMode]);

  // Playback Loop
  useEffect(() => {
    let timer;
    if (isPlaying) {
      const done1 = currentStep1 >= steps1.length - 1;
      const done2 = !isCompareMode || currentStep2 >= steps2.length - 1;
      
      if (done1 && done2) {
        setIsPlaying(false);
      } else {
        // Base delay inversely proportional to size and speed
        let delay = (1000 / speed);
        if (arraySize > 50) delay /= 2;
        if (arraySize > 100) delay /= 4;

        timer = setTimeout(() => {
          if (!done1) setCurrentStep1(c => c + 1);
          if (!done2) setCurrentStep2(c => c + 1);
        }, delay);
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep1, currentStep2, steps1, steps2, speed, isCompareMode, arraySize]);

  // Computed Render State
  const renderData1 = steps1[currentStep1] || { arr: baseArray, colors: new Array(arraySize).fill(0), comps:0, swaps:0, msg: 'Ready' };
  const renderData2 = steps2[currentStep2] || { arr: baseArray, colors: new Array(arraySize).fill(0), comps:0, swaps:0, msg: 'Ready' };

  // Helper to render a bar chart
  const Canvas = ({ data, algo, id }) => {
    return (
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900/50 rounded-2xl border border-slate-800 p-4 relative overflow-hidden shadow-inner">
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
          <span className="text-sm font-bold text-indigo-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-700 backdrop-blur">{algo.title}</span>
          <div className="text-[10px] text-slate-400 font-mono bg-slate-900/80 px-2 py-1 rounded border border-slate-700 backdrop-blur flex gap-2">
            <span>Comps: <span className="text-emerald-400">{data.comps}</span></span>
            <span>Swaps: <span className="text-amber-400">{data.swaps}</span></span>
          </div>
        </div>
        
        <div className="absolute top-4 right-4 z-10">
          <div className="text-[10px] text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-700 max-w-[200px] truncate backdrop-blur">
            {data.msg}
          </div>
        </div>

        {/* Array Values Preview Overlay */}
        <div className="absolute top-16 left-4 right-4 z-10 flex gap-1 overflow-x-auto custom-scrollbar pb-1 opacity-70 hover:opacity-100 transition-opacity">
          {data.arr.map((val, idx) => (
             <div 
               key={`val-${idx}`} 
               className={`text-[9px] font-mono px-1.5 py-0.5 rounded flex-shrink-0 ${COLORS[data.colors[idx]]} ${data.colors[idx] === 0 ? 'bg-slate-800 border-slate-700' : 'text-white'}`}
             >
               {val}
             </div>
          ))}
        </div>

        <div className="flex-1 flex items-end justify-center gap-[1px] mt-20 w-full">
          {data.arr.map((val, idx) => (
            <div 
              key={idx}
              className={`w-full rounded-t-sm transition-all ${arraySize > 100 ? 'duration-0' : 'duration-100'} ${COLORS[data.colors[idx]]}`}
              style={{ height: `${(val / maxVal) * 100}%` }}
              title={`Value: ${val}`}
            ></div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 flex flex-col overflow-hidden">
      
      {/* HEADER */}
      <header className="px-6 py-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md flex flex-col xl:flex-row items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 shadow-inner">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
              Sorting Visualizer
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase mt-0.5">High-Performance Engine</p>
          </div>
        </div>

        {/* Array Generation Controls */}
        <div className="flex flex-wrap items-center gap-4 bg-slate-950/50 p-2 rounded-xl border border-slate-800 shadow-inner">
          
          {/* Manual Input */}
          <div className="flex items-center gap-2 px-2 border-r border-slate-800">
            <input 
              type="text" 
              placeholder="e.g. 50, 10, 30, 20"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              onKeyDown={handleManualArraySubmit}
              disabled={isPlaying}
              className="bg-transparent text-sm font-mono text-slate-300 outline-none w-40 border-b border-slate-700 focus:border-indigo-500 transition-colors disabled:opacity-50"
            />
            <button 
              onClick={handleManualArraySubmit}
              disabled={isPlaying || !manualInput}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 disabled:opacity-50 px-2"
            >
              Set
            </button>
          </div>

          <div className="flex flex-col px-2 w-24 sm:w-32">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Size</span>
              <span className="text-xs font-mono font-bold text-indigo-300">{arraySize}</span>
            </div>
            <input 
              type="range" min="5" max="200" step="5"
              value={arraySize} onChange={(e) => setArraySize(Number(e.target.value))}
              disabled={isPlaying}
              className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div className="w-px h-8 bg-slate-800"></div>

          <button 
            onClick={() => setIsCompareMode(!isCompareMode)} disabled={isPlaying}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded transition-colors ${isCompareMode ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'}`}
          >
            <SplitSquareHorizontal className="w-3.5 h-3.5"/> Compare Mode
          </button>
          
          <button 
            onClick={generateArray} disabled={isPlaying}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 text-xs font-bold rounded transition-colors"
          >
            <Shuffle className="w-3.5 h-3.5" /> Shuffle
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden relative">
        
        {/* LEFT AREA: CANVAS & CONTROLS */}
        <div className="col-span-1 lg:col-span-3 flex flex-col relative bg-slate-950 p-4 gap-4 overflow-hidden">
          
          {/* Canvases */}
          <div className={`flex-1 flex flex-col gap-4 min-h-0 ${isCompareMode ? '' : 'h-full'}`}>
            <Canvas data={renderData1} algo={algo1} id="1" />
            {isCompareMode && <Canvas data={renderData2} algo={algo2} id="2" />}
          </div>

          {/* Controls Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-xl mt-auto z-10 shrink-0">
            
            {/* Algo Selectors */}
            <div className="flex gap-2">
              <div className="flex flex-col gap-1">
                {isCompareMode && <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest px-1">Algo 1</span>}
                <select 
                  value={algo1.id} onChange={(e) => setAlgo1(ALGORITHMS[e.target.value])} disabled={isPlaying}
                  className="bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-slate-200 outline-none px-3 py-2 cursor-pointer disabled:opacity-50"
                >
                  {Object.values(ALGORITHMS).map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                </select>
              </div>
              
              {isCompareMode && (
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest px-1">Algo 2</span>
                  <select 
                    value={algo2.id} onChange={(e) => setAlgo2(ALGORITHMS[e.target.value])} disabled={isPlaying}
                    className="bg-slate-950 border border-slate-800 rounded-lg text-xs font-bold text-slate-200 outline-none px-3 py-2 cursor-pointer disabled:opacity-50"
                  >
                    {Object.values(ALGORITHMS).map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                  </select>
                </div>
              )}
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 shadow-inner">
              <button 
                onClick={() => {
                  setCurrentStep1(0); 
                  if(isCompareMode) setCurrentStep2(0);
                  setIsPlaying(false);
                }} 
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors" title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              
              <button 
                onClick={() => setIsPlaying(!isPlaying)} 
                disabled={currentStep1 >= steps1.length - 1 && (!isCompareMode || currentStep2 >= steps2.length - 1)}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 rounded-lg text-white transition-colors shadow-md flex items-center gap-2 font-bold text-sm"
              >
                {isPlaying ? <><Pause className="w-4 h-4 fill-current" /> Pause</> : <><Play className="w-4 h-4 fill-current" /> Sort!</>}
              </button>

              <button 
                onClick={() => {
                  if(currentStep1 < steps1.length - 1) setCurrentStep1(c=>c+1);
                  if(isCompareMode && currentStep2 < steps2.length - 1) setCurrentStep2(c=>c+1);
                }} 
                disabled={isPlaying || (currentStep1 >= steps1.length - 1 && (!isCompareMode || currentStep2 >= steps2.length - 1))}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors disabled:opacity-30" title="Step Forward"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Speed & Progress */}
            <div className="flex flex-col gap-2 w-48">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest flex items-center gap-1"><FastForward className="w-3 h-3"/> Speed</span>
                <span className="text-[10px] font-mono font-bold text-indigo-300">{speed}x</span>
              </div>
              <input 
                type="range" min="0.25" max="5" step="0.25" 
                value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
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
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
            
            {/* Header & Desc */}
            <div>
              <h3 className="text-xl font-bold text-indigo-400 mb-2">{algo1.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {algo1.description}
              </p>
            </div>

            {/* Complexity */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Best', val: algo1.best, color: 'text-emerald-400' },
                { label: 'Avg', val: algo1.avg, color: 'text-amber-400' },
                { label: 'Worst', val: algo1.worst, color: 'text-red-400' }
              ].map(c => (
                <div key={c.label} className="bg-slate-950 p-2 rounded-xl border border-slate-800/80 shadow-inner flex flex-col items-center text-center">
                  <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">{c.label}</span>
                  <div className={`text-xs font-mono mt-1 ${c.color}`}>{c.val}</div>
                </div>
              ))}
            </div>
            
            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80 shadow-inner flex justify-center items-center gap-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Space Complexity:</span>
                <div className={`text-xs font-mono text-purple-400`}>{algo1.space}</div>
            </div>

            {/* Legend */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest block mb-2">Color Legend</span>
              <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-300">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-indigo-500"></div> Unsorted</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-yellow-400"></div> Comparing</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-red-500"></div> Swapping</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-sm bg-emerald-500"></div> Sorted</div>
                <div className="flex items-center gap-2 col-span-2"><div className="w-3 h-3 rounded-sm bg-purple-500"></div> Pivot / Target</div>
              </div>
            </div>

            {/* Code Viewer */}
            <div className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-slate-300">
                  <Code2 className="w-4 h-4" /> Implementation
                </h4>
                <div className="flex bg-slate-950 rounded-md border border-slate-800 overflow-hidden">
                  {['js', 'py'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => setCodeLang(lang)}
                      className={`px-2 py-1 text-[10px] font-mono uppercase transition-colors ${
                        codeLang === lang ? 'bg-slate-800 text-white font-bold' : 'text-slate-500 hover:text-slate-300'
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
                  <span className="ml-2 text-[10px] text-slate-500 font-mono">{algo1.id}_sort.{codeLang}</span>
                </div>
                <pre className="p-4 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
                  <code>
                    {algo1.code[codeLang]}
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