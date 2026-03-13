import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipForward, RotateCcw, 
  Plus, Trash2, Search, Code2, BookOpen,
  Activity, Settings2, Shuffle, Type, Hash,
  ArrowRightLeft, GitMerge, ChevronRight
} from 'lucide-react';

// --- CONSTANTS & ALGORITHM DATA ---

const ALGORITHMS = {
  traverse: {
    id: 'traverse',
    title: "Array Traversal",
    time: "O(n)", space: "O(1)",
    description: "Visits every element in the array sequentially from the first index to the last.",
    code: {
      js: `function traverse(arr) {\n  for(let i = 0; i < arr.length; i++) {\n    console.log(arr[i]);\n  }\n}`,
      py: `def traverse(arr):\n    for i in range(len(arr)):\n        print(arr[i])`,
      cpp: `void traverse(int arr[], int n) {\n    for(int i = 0; i < n; i++) {\n        cout << arr[i] << " ";\n    }\n}`
    }
  },
  search: {
    id: 'search',
    title: "Linear Search",
    time: "O(n)", space: "O(1)",
    description: "Iterates through the array comparing each element to the target value until it is found.",
    code: {
      js: `function search(arr, target) {\n  for(let i = 0; i < arr.length; i++) {\n    if(arr[i] === target) return i;\n  }\n  return -1;\n}`,
      py: `def search(arr, target):\n    for i in range(len(arr)):\n        if arr[i] == target: return i\n    return -1`,
      cpp: `int search(int arr[], int n, int target) {\n    for(int i = 0; i < n; i++) {\n        if(arr[i] == target) return i;\n    }\n    return -1;\n}`
    }
  },
  bubble: {
    id: 'bubble',
    title: "Bubble Sort",
    time: "O(n²)", space: "O(1)",
    description: "Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
    code: {
      js: `function bubbleSort(arr) {\n  let n = arr.length;\n  for (let i = 0; i < n - 1; i++) {\n    for (let j = 0; j < n - i - 1; j++) {\n      if (arr[j] > arr[j + 1]) {\n        [arr[j], arr[j+1]] = [arr[j+1], arr[j]];\n      }\n    }\n  }\n}`,
      py: `def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n - 1):\n        for j in range(n - i - 1):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]`,
      cpp: `void bubbleSort(int arr[], int n) {\n    for (int i = 0; i < n - 1; i++) {\n        for (int j = 0; j < n - i - 1; j++) {\n            if (arr[j] > arr[j + 1]) {\n                swap(arr[j], arr[j + 1]);\n            }\n        }\n    }\n}`
    }
  },
  selection: {
    id: 'selection',
    title: "Selection Sort",
    time: "O(n²)", space: "O(1)",
    description: "Divides the input list into two parts: a sorted sublist and an unsorted sublist. Repeatedly selects the minimum element from the unsorted sublist and moves it.",
    code: {
      js: `function selectionSort(arr) {\n  let n = arr.length;\n  for(let i = 0; i < n; i++) {\n    let minIdx = i;\n    for(let j = i + 1; j < n; j++) {\n      if(arr[j] < arr[minIdx]) minIdx = j;\n    }\n    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];\n  }\n}`,
      py: `def selection_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        min_idx = i\n        for j in range(i + 1, n):\n            if arr[j] < arr[min_idx]:\n                min_idx = j\n        arr[i], arr[min_idx] = arr[min_idx], arr[i]`,
      cpp: `void selectionSort(int arr[], int n) {\n    for (int i = 0; i < n; i++) {\n        int min_idx = i;\n        for (int j = i + 1; j < n; j++) {\n            if (arr[j] < arr[min_idx]) min_idx = j;\n        }\n        swap(arr[i], arr[min_idx]);\n    }\n}`
    }
  }
};

// Flowchart templates for algorithms
const FLOW_NODES = {
  bubble: [
    { id: '1', data: { label: 'Start Loop' } },
    { id: '2', data: { label: 'Compare A[j], A[j+1]' } },
    { id: '3', data: { label: 'Swap if A[j] > A[j+1]' } },
    { id: '4', data: { label: 'Next Pair / End Loop' } },
  ]
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// --- MAIN COMPONENT ---

export default function ArrayVisualizer() {
  // --- STATE ---
  const [array, setArray] = useState([
    { id: generateId(), val: 34, state: 'default' },
    { id: generateId(), val: 12, state: 'default' },
    { id: generateId(), val: 45, state: 'default' },
    { id: generateId(), val: 23, state: 'default' },
    { id: generateId(), val: 67, state: 'default' }
  ]);
  
  // Player State
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStepMode, setIsStepMode] = useState(false);
  const [speed, setSpeed] = useState(1); 
  
  // UI State
  const [inputValue, setInputValue] = useState('');
  const [indexValue, setIndexValue] = useState('');
  const [activeAlgorithm, setActiveAlgorithm] = useState(ALGORITHMS.traverse);
  const [codeLanguage, setCodeLanguage] = useState('js');
  const [arraySize, setArraySize] = useState(10);

  // Computed state for rendering
  const displayArray = steps.length > 0 ? steps[currentStep].array : array;
  const currentMessage = steps.length > 0 ? steps[currentStep].msg : "Ready. Select an operation or algorithm.";
  
  // Metrics
  const metrics = steps.length > 0 ? steps[currentStep].metrics : { comps: 0, swaps: 0 };

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
    if (!isStepMode) setIsPlaying(true);
  };

  const stopAnimationAndCommit = () => {
    if (steps.length > 0) {
      // Commit the final state of the animation to the actual array
      const finalArray = steps[steps.length - 1].array.map(item => ({ ...item, state: 'default' }));
      setArray(finalArray);
    }
    setSteps([]);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // --- ARRAY GENERATION ---
  const generateRandomArray = (size = arraySize) => {
    stopAnimationAndCommit();
    const newArr = Array.from({ length: size }, () => ({
      id: generateId(),
      val: Math.floor(Math.random() * 99) + 1,
      state: 'default'
    }));
    setArray(newArr);
  };

  const handleManualInput = (e) => {
    if (e.key === 'Enter' && inputValue.includes(',')) {
      stopAnimationAndCommit();
      const newArr = inputValue.split(',').map(v => ({
        id: generateId(),
        val: parseInt(v.trim(), 10) || 0,
        state: 'default'
      })).slice(0, 50); // Limit size for safety
      setArray(newArr);
      setInputValue('');
    }
  };

  // --- ALGORITHM STEP GENERATORS ---
  const copyArr = (arr) => arr.map(item => ({ ...item }));

  const insertAt = (position = 'end') => {
    if (!inputValue) return;
    const val = parseInt(inputValue, 10);
    let idx = position === 'start' ? 0 : position === 'end' ? displayArray.length : parseInt(indexValue, 10);
    if (isNaN(idx) || idx < 0) idx = 0;
    if (idx > displayArray.length) idx = displayArray.length;

    let newSteps = [];
    let currentArr = copyArr(displayArray);
    
    // Step 1: Create new node element logically
    const newItem = { id: generateId(), val, state: 'highlight' };
    
    // Step 2: Show shifting if needed
    if (idx < currentArr.length) {
       newSteps.push({ array: copyArr(currentArr), msg: `Preparing to insert ${val} at index ${idx}. Shifting elements right...`, metrics: { comps: 0, swaps: 0 } });
    }
    
    currentArr.splice(idx, 0, newItem);
    newSteps.push({ array: copyArr(currentArr), msg: `Inserted ${val} at index ${idx}.`, metrics: { comps: 0, swaps: 0 } });
    
    currentArr[idx].state = 'default';
    newSteps.push({ array: copyArr(currentArr), msg: `Insertion complete.`, metrics: { comps: 0, swaps: 0 } });

    startAnimation(newSteps, ALGORITHMS.traverse);
    setInputValue('');
  };

  const deleteAt = (position = 'end') => {
    if (displayArray.length === 0) return;
    let idx = position === 'start' ? 0 : position === 'end' ? displayArray.length - 1 : parseInt(indexValue, 10);
    if (isNaN(idx) || idx < 0 || idx >= displayArray.length) return;

    let newSteps = [];
    let currentArr = copyArr(displayArray);
    
    currentArr[idx].state = 'delete';
    newSteps.push({ array: copyArr(currentArr), msg: `Marked element at index ${idx} for deletion.`, metrics: { comps: 0, swaps: 0 } });
    
    currentArr.splice(idx, 1);
    newSteps.push({ array: copyArr(currentArr), msg: `Deleted element. Shifting remaining elements left.`, metrics: { comps: 0, swaps: 0 } });
    
    startAnimation(newSteps, ALGORITHMS.traverse);
  };

  const updateValue = () => {
    if (!inputValue || !indexValue) return;
    const val = parseInt(inputValue, 10);
    const idx = parseInt(indexValue, 10);
    if (idx < 0 || idx >= displayArray.length) return;

    let newSteps = [];
    let currentArr = copyArr(displayArray);
    
    currentArr[idx].state = 'highlight';
    newSteps.push({ array: copyArr(currentArr), msg: `Targeting index ${idx} for update.`, metrics: { comps: 0, swaps: 0 } });
    
    currentArr[idx].val = val;
    newSteps.push({ array: copyArr(currentArr), msg: `Updated value at index ${idx} to ${val}.`, metrics: { comps: 0, swaps: 0 } });
    
    currentArr[idx].state = 'default';
    newSteps.push({ array: copyArr(currentArr), msg: `Update complete.`, metrics: { comps: 0, swaps: 0 } });

    startAnimation(newSteps, ALGORITHMS.traverse);
    setInputValue('');
  };

  const searchElement = () => {
    if (!inputValue) return;
    const target = parseInt(inputValue, 10);
    let newSteps = [];
    let currentArr = copyArr(displayArray);
    let found = false;
    let comps = 0;

    for (let i = 0; i < currentArr.length; i++) {
      comps++;
      currentArr = currentArr.map(item => ({ ...item, state: item.state === 'sorted' ? 'sorted' : 'default' })); // Reset previous active
      currentArr[i].state = 'active';
      newSteps.push({ array: copyArr(currentArr), msg: `Comparing element at index ${i} (${currentArr[i].val}) with target ${target}.`, metrics: { comps, swaps: 0 } });
      
      if (currentArr[i].val === target) {
        currentArr[i].state = 'highlight';
        newSteps.push({ array: copyArr(currentArr), msg: `Element ${target} found at index ${i}!`, metrics: { comps, swaps: 0 } });
        found = true;
        break;
      }
    }
    
    if (!found) {
      newSteps.push({ array: copyArr(currentArr), msg: `Element ${target} not found in the array.`, metrics: { comps, swaps: 0 } });
    }
    
    startAnimation(newSteps, ALGORITHMS.search);
  };

  const traverseArray = () => {
    let newSteps = [];
    let currentArr = copyArr(displayArray);

    for (let i = 0; i < currentArr.length; i++) {
      currentArr = currentArr.map(item => ({ ...item, state: item.state === 'sorted' ? 'sorted' : 'default' }));
      currentArr[i].state = 'active';
      newSteps.push({ array: copyArr(currentArr), msg: `Visiting element at index ${i}: ${currentArr[i].val}`, metrics: { comps: 0, swaps: 0 } });
    }
    
    currentArr[currentArr.length - 1].state = 'default';
    newSteps.push({ array: copyArr(currentArr), msg: `Traversal complete.`, metrics: { comps: 0, swaps: 0 } });
    
    startAnimation(newSteps, ALGORITHMS.traverse);
  };

  const bubbleSort = () => {
    let newSteps = [];
    let currentArr = copyArr(displayArray);
    let n = currentArr.length;
    let comps = 0;
    let swaps = 0;

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        // Reset colors
        currentArr = currentArr.map((item, idx) => ({
          ...item, state: idx >= n - i ? 'sorted' : 'default'
        }));
        
        currentArr[j].state = 'active';
        currentArr[j+1].state = 'active';
        comps++;
        newSteps.push({ array: copyArr(currentArr), msg: `Comparing ${currentArr[j].val} and ${currentArr[j+1].val}`, metrics: { comps, swaps } });
        
        if (currentArr[j].val > currentArr[j+1].val) {
          currentArr[j].state = 'highlight';
          currentArr[j+1].state = 'highlight';
          swaps++;
          newSteps.push({ array: copyArr(currentArr), msg: `Swapping ${currentArr[j].val} and ${currentArr[j+1].val}`, metrics: { comps, swaps } });
          
          // Actual Swap (swap entire objects so IDs move for Framer Motion)
          [currentArr[j], currentArr[j+1]] = [currentArr[j+1], currentArr[j]];
          newSteps.push({ array: copyArr(currentArr), msg: `Swapped.`, metrics: { comps, swaps } });
        }
      }
      currentArr[n - i - 1].state = 'sorted';
    }
    currentArr[0].state = 'sorted'; // Last one
    newSteps.push({ array: copyArr(currentArr), msg: `Array is fully sorted!`, metrics: { comps, swaps } });
    
    startAnimation(newSteps, ALGORITHMS.bubble);
  };

  const selectionSort = () => {
    let newSteps = [];
    let currentArr = copyArr(displayArray);
    let n = currentArr.length;
    let comps = 0;
    let swaps = 0;

    for (let i = 0; i < n; i++) {
      let minIdx = i;
      currentArr = currentArr.map((item, idx) => ({
        ...item, state: idx < i ? 'sorted' : 'default'
      }));
      
      currentArr[minIdx].state = 'highlight'; // highlight current min
      
      for (let j = i + 1; j < n; j++) {
        currentArr[j].state = 'active';
        comps++;
        newSteps.push({ array: copyArr(currentArr), msg: `Finding minimum: Comparing ${currentArr[j].val} with current min ${currentArr[minIdx].val}`, metrics: { comps, swaps } });
        
        if (currentArr[j].val < currentArr[minIdx].val) {
          currentArr[minIdx].state = 'default';
          minIdx = j;
          currentArr[minIdx].state = 'highlight';
          newSteps.push({ array: copyArr(currentArr), msg: `New minimum found: ${currentArr[minIdx].val} at index ${minIdx}`, metrics: { comps, swaps } });
        } else {
          currentArr[j].state = 'default';
        }
      }
      
      if (minIdx !== i) {
        currentArr[i].state = 'active'; // Mark swap target
        swaps++;
        newSteps.push({ array: copyArr(currentArr), msg: `Swapping minimum ${currentArr[minIdx].val} into sorted position index ${i}`, metrics: { comps, swaps } });
        [currentArr[i], currentArr[minIdx]] = [currentArr[minIdx], currentArr[i]];
        newSteps.push({ array: copyArr(currentArr), msg: `Swapped.`, metrics: { comps, swaps } });
      }
      currentArr[i].state = 'sorted';
    }
    newSteps.push({ array: copyArr(currentArr), msg: `Array is fully sorted!`, metrics: { comps, swaps } });
    
    startAnimation(newSteps, ALGORITHMS.selection);
  };

  // --- RENDERING HELPERS ---
  const getCellColor = (state) => {
    switch(state) {
      case 'active': return 'bg-blue-600 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)] text-white z-10 scale-105';
      case 'highlight': return 'bg-emerald-600 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.6)] text-white z-10 scale-105';
      case 'delete': return 'bg-red-600 border-red-400 opacity-50 scale-90 z-0 text-white';
      case 'sorted': return 'bg-purple-600/50 border-purple-400/50 text-purple-100';
      default: return 'bg-slate-800 border-slate-600 text-slate-200 hover:border-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 overflow-hidden flex flex-col">
      
      {/* HEADER & INITIALIZATION PANEL */}
      <header className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex flex-col xl:flex-row items-center justify-between gap-4 z-20 relative">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <Activity className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent leading-tight">
              Array Visualizer
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">Interactive DSA Learning</p>
          </div>
        </div>

        {/* Array Generation Controls */}
        <div className="flex flex-wrap items-center gap-4 bg-slate-950/50 p-2 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-slate-500 ml-2" />
            <input
              type="text"
              placeholder="e.g. 10,20,30,40"
              onKeyDown={handleManualInput}
              className="w-40 bg-transparent border-b border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 p-1 transition-colors"
              title="Press Enter to generate from comma-separated list"
            />
          </div>
          <div className="w-px h-6 bg-slate-800"></div>
          <div className="flex items-center gap-3 px-2">
            <span className="text-xs text-slate-400">Size: {arraySize}</span>
            <input 
              type="range" min="5" max="50" 
              value={arraySize} onChange={(e) => setArraySize(Number(e.target.value))}
              className="w-24 accent-indigo-500"
            />
            <button 
              onClick={() => generateRandomArray()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-md transition-colors shadow-sm"
            >
              <Shuffle className="w-3.5 h-3.5" /> Random
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden relative">
        
        {/* LEFT/MAIN AREA */}
        <div className="col-span-1 lg:col-span-3 flex flex-col relative">
          
          {/* VISUALIZER CANVAS */}
          <div className="flex-1 relative flex flex-col items-center justify-center p-8 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] overflow-hidden">
            
            {/* Dynamic Status Message */}
            <div className="absolute top-6 max-w-2xl text-center px-6 py-3 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-full shadow-lg text-indigo-300 font-medium z-10 animate-fade-in flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPlaying ? 'bg-indigo-400' : 'bg-slate-500'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isPlaying ? 'bg-indigo-500' : 'bg-slate-500'}`}></span>
              </span>
              {currentMessage}
            </div>

            {/* Metrics HUD */}
            {(metrics.comps > 0 || metrics.swaps > 0) && (
              <div className="absolute top-6 right-6 flex gap-3 z-10">
                <div className="bg-slate-900/80 backdrop-blur border border-slate-700 px-3 py-1.5 rounded-lg flex flex-col items-center shadow-lg">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest">Comparisons</span>
                  <span className="text-lg font-mono text-blue-400 font-bold leading-none">{metrics.comps}</span>
                </div>
                <div className="bg-slate-900/80 backdrop-blur border border-slate-700 px-3 py-1.5 rounded-lg flex flex-col items-center shadow-lg">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest">Swaps</span>
                  <span className="text-lg font-mono text-emerald-400 font-bold leading-none">{metrics.swaps}</span>
                </div>
              </div>
            )}

            {/* Array Container */}
            <div className="relative w-full h-full flex items-center justify-center overflow-auto px-10 py-20 custom-scrollbar">
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-full">
                <AnimatePresence mode="popLayout">
                  {displayArray.map((item, index) => (
                    <motion.div
                      layout
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.5, y: -20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0, y: 20 }}
                      transition={{ 
                        type: "spring", 
                        stiffness: 400, 
                        damping: 25,
                        mass: 0.8
                      }}
                      className="flex flex-col items-center gap-2 group"
                    >
                      {/* Array Cell */}
                      <div className={`
                        relative flex items-center justify-center rounded-xl border-2 transition-all duration-300 
                        ${displayArray.length > 20 ? 'w-10 h-10 text-sm' : 'w-16 h-16 text-xl'} 
                        font-mono font-bold shadow-md ${getCellColor(item.state)}
                      `}>
                        {item.val}
                      </div>
                      {/* Index Label */}
                      <div className="text-[10px] text-slate-500 font-mono bg-slate-900/50 px-1.5 rounded opacity-70 group-hover:opacity-100 transition-opacity">
                        {index}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {displayArray.length === 0 && (
                  <div className="text-slate-500 flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-700 rounded-2xl">
                    <Activity className="w-12 h-12 mb-3 opacity-20" />
                    <p>Array is empty. Create one to begin.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* OPERATIONS & SORTING CONTROL PANEL */}
          <div className="bg-slate-900 border-t border-slate-800 z-20 flex flex-col">
            
            {/* Top row: Value/Index Inputs and Basic Operations */}
            <div className="p-4 border-b border-slate-800 flex flex-wrap gap-4 items-center">
              
              {/* Inputs */}
              <div className="flex gap-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <Type className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <input
                    type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Value"
                    className="w-24 bg-slate-950 border border-slate-700 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block pl-8 p-2 transition-colors"
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <Hash className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <input
                    type="number" value={indexValue} onChange={(e) => setIndexValue(e.target.value)}
                    placeholder="Index"
                    className="w-24 bg-slate-950 border border-slate-700 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block pl-8 p-2 transition-colors"
                  />
                </div>
              </div>

              <div className="h-8 w-px bg-slate-700 hidden sm:block"></div>

              {/* CRUD Operations */}
              <div className="flex flex-wrap gap-2">
                <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                  <button onClick={() => insertAt('start')} disabled={isPlaying} className="px-2.5 py-1 hover:bg-blue-600/20 text-blue-400 text-xs font-medium rounded transition-colors border-r border-slate-800">+ Start</button>
                  <button onClick={() => insertAt('end')} disabled={isPlaying} className="px-2.5 py-1 hover:bg-blue-600/20 text-blue-400 text-xs font-medium rounded transition-colors border-r border-slate-800">+ End</button>
                  <button onClick={() => insertAt('index')} disabled={isPlaying} className="px-2.5 py-1 hover:bg-blue-600/20 text-blue-400 text-xs font-medium rounded transition-colors">+ Idx</button>
                </div>

                <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800">
                  <button onClick={() => deleteAt('start')} disabled={isPlaying} className="px-2.5 py-1 hover:bg-red-600/20 text-red-400 text-xs font-medium rounded transition-colors border-r border-slate-800">- Start</button>
                  <button onClick={() => deleteAt('end')} disabled={isPlaying} className="px-2.5 py-1 hover:bg-red-600/20 text-red-400 text-xs font-medium rounded transition-colors border-r border-slate-800">- End</button>
                  <button onClick={() => deleteAt('index')} disabled={isPlaying} className="px-2.5 py-1 hover:bg-red-600/20 text-red-400 text-xs font-medium rounded transition-colors">- Idx</button>
                </div>

                <button onClick={updateValue} disabled={isPlaying} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-lg text-xs font-medium transition-colors">
                  Update
                </button>
                <button onClick={searchElement} disabled={isPlaying} className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1">
                  <Search className="w-3.5 h-3.5" /> Search
                </button>
                <button onClick={traverseArray} disabled={isPlaying} className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1">
                  <ArrowRightLeft className="w-3.5 h-3.5" /> Traverse
                </button>
              </div>
            </div>

            {/* Bottom row: Algorithms & Playback Controls */}
            <div className="p-4 bg-slate-900 flex flex-wrap justify-between items-center gap-4">
              
              {/* Algorithm Selectors */}
              <div className="flex flex-wrap gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest mr-2 flex items-center">Algorithms</span>
                <button onClick={bubbleSort} disabled={isPlaying} className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 rounded-lg text-sm font-medium transition-all shadow-sm">
                  Bubble Sort
                </button>
                <button onClick={selectionSort} disabled={isPlaying} className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 rounded-lg text-sm font-medium transition-all shadow-sm">
                  Selection Sort
                </button>
                <button disabled className="px-4 py-2 bg-slate-800 text-slate-500 border border-slate-700 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed" title="Coming soon">
                  Insertion Sort
                </button>
              </div>

              {/* Execution Controls */}
              <div className="flex items-center gap-3 bg-slate-950/50 p-1.5 rounded-xl border border-slate-800 shrink-0">
                
                {/* Mode Toggle */}
                <div className="flex bg-slate-900 rounded-lg border border-slate-700 p-0.5">
                  <button 
                    onClick={() => { setIsStepMode(false); setIsPlaying(false); }}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${!isStepMode ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Auto
                  </button>
                  <button 
                    onClick={() => { setIsStepMode(true); setIsPlaying(false); }}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${isStepMode ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Step
                  </button>
                </div>

                {/* Playback */}
                {isStepMode ? (
                  <button 
                    onClick={() => currentStep < steps.length - 1 && setCurrentStep(c => c + 1)} 
                    disabled={steps.length === 0 || currentStep >= steps.length - 1}
                    className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 rounded-lg text-white transition-colors"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)} 
                    disabled={steps.length === 0 && currentStep === 0}
                    className="p-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 rounded-lg text-white transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                )}

                <button onClick={stopAnimationAndCommit} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors" title="Stop & Commit">
                  <RotateCcw className="w-4 h-4" />
                </button>

                <div className="h-6 w-px bg-slate-700 mx-1"></div>
                
                {/* Speed Slider */}
                <div className="flex items-center gap-2 px-2">
                  <Settings2 className="w-3.5 h-3.5 text-slate-500" />
                  <input 
                    type="range" min="0.25" max="3" step="0.25" 
                    value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-20 accent-blue-500"
                    title={`Speed: ${speed}x`}
                  />
                  <span className="text-[10px] text-slate-400 font-mono w-6">{speed}x</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT PANEL - EXPLANATION, FLOW, CODE */}
        <div className="col-span-1 border-l border-slate-800 bg-slate-900 flex flex-col overflow-hidden max-h-screen">
          
          <div className="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
            <h2 className="text-base font-bold flex items-center gap-2 text-white">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Algorithm Details
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
            
            {/* Header & Desc */}
            <div>
              <h3 className="text-xl font-bold text-indigo-400 mb-2">{activeAlgorithm.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {activeAlgorithm.description}
              </p>
            </div>

            {/* Complexity */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 shadow-inner">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Time</span>
                <div className="text-lg font-mono text-emerald-400 mt-1">{activeAlgorithm.time}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 shadow-inner">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Space</span>
                <div className="text-lg font-mono text-amber-400 mt-1">{activeAlgorithm.space}</div>
              </div>
            </div>

            {/* Progress / Steps info */}
            {steps.length > 0 && (
              <div className="bg-blue-900/10 border border-blue-900/30 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-blue-300">Execution Progress</span>
                  <span className="text-xs font-mono text-blue-400 bg-blue-900/40 px-2 py-1 rounded">
                    Step {currentStep + 1} / {steps.length}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3 overflow-hidden">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300 ease-out" 
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  ></div>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-xs text-slate-300 font-mono">
                  {'>'} {currentMessage}
                </div>
              </div>
            )}

            {/* React Flow Diagram (Mini) */}
            {activeAlgorithm.id === 'bubble' && (
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 h-64 flex flex-col">
                <div className="px-3 py-2 border-b border-slate-800 flex items-center gap-2 bg-slate-900">
                  <GitMerge className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-300">Algorithm Flow</span>
                </div>
                <div className="flex-1 relative flex flex-col items-center justify-center p-4 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]">
                  {FLOW_NODES.bubble.map((node, i) => (
                    <React.Fragment key={node.id}>
                      <div className="bg-[#1e293b] text-white border border-[#334155] rounded-lg p-2.5 text-xs z-10 shadow-md min-w-[140px] text-center">
                        {node.data.label}
                      </div>
                      {i < FLOW_NODES.bubble.length - 1 && (
                        <div className="h-5 w-px bg-[#334155] relative my-0.5">
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#334155]"></div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            )}

            {/* Code Viewer */}
            <div className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-slate-300">
                  <Code2 className="w-4 h-4" /> Code
                </h4>
                <div className="flex bg-slate-950 rounded-md border border-slate-800 overflow-hidden">
                  {['js', 'py', 'cpp'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => setCodeLanguage(lang)}
                      className={`px-2.5 py-1 text-xs font-mono uppercase transition-colors ${
                        codeLanguage === lang ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
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
                  <span className="ml-2 text-[10px] text-slate-500 font-mono">implementation.{codeLanguage}</span>
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
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}} />
    </div>
  );
}