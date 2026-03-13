import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipForward, RotateCcw, 
  ArrowRightToLine, ArrowRightFromLine, Search, Code2, BookOpen,
  Activity, Settings2, Shuffle, Type, Maximize,
  AlertCircle, FastForward, Info
} from 'lucide-react';

// --- CONSTANTS & ALGORITHM DATA ---

const ALGORITHMS = {
  enqueue: {
    id: 'enqueue',
    title: "Enqueue Operation",
    time: "O(1)", space: "O(1)",
    description: "Adds an element to the rear of the queue. If the queue has reached its maximum capacity, a Queue Overflow occurs.",
    code: {
      js: `class Queue {\n  enqueue(val) {\n    if (this.queue.length === this.maxSize) {\n      throw new Error("Queue Overflow");\n    }\n    this.queue.push(val);\n  }\n}`,
      py: `class Queue:\n    def enqueue(self, val):\n        if len(self.queue) == self.max_size:\n            raise Exception("Queue Overflow")\n        self.queue.append(val)`,
      java: `class Queue {\n    void enqueue(int val) {\n        if (rear == maxSize - 1) {\n            System.out.println("Queue Overflow");\n            return;\n        }\n        queue[++rear] = val;\n    }\n}`,
      cpp: `void enqueue(int val) {\n    if (rear == maxSize - 1) {\n        cout << "Queue Overflow" << endl;\n        return;\n    }\n    queue[++rear] = val;\n}`
    },
    flowNodes: [
      { id: '1', label: 'Start Enqueue(val)' },
      { id: '2', label: 'Is Queue Full?' },
      { id: '3', label: 'Increment Rear' },
      { id: '4', label: 'Insert at Rear' }
    ]
  },
  dequeue: {
    id: 'dequeue',
    title: "Dequeue Operation",
    time: "O(n)", space: "O(1)",
    description: "Removes and returns the front element. In this array-based shifting implementation, remaining elements shift left (O(n)). In a circular or pointer-based queue, it's O(1).",
    code: {
      js: `class Queue {\n  dequeue() {\n    if (this.queue.length === 0) {\n      throw new Error("Queue Underflow");\n    }\n    return this.queue.shift(); // Shifts elements left\n  }\n}`,
      py: `class Queue:\n    def dequeue(self):\n        if len(self.queue) == 0:\n            raise Exception("Queue Underflow")\n        return self.queue.pop(0)`,
      java: `class Queue {\n    int dequeue() {\n        if (front > rear) throw new UnderflowException();\n        int val = queue[front++];\n        return val;\n    }\n}`,
      cpp: `int dequeue() {\n    if (front > rear) {\n        cout << "Queue Underflow" << endl;\n        return -1;\n    }\n    return queue[front++];\n}`
    },
    flowNodes: [
      { id: '1', label: 'Start Dequeue()' },
      { id: '2', label: 'Is Queue Empty?' },
      { id: '3', label: 'Remove Front Element' },
      { id: '4', label: 'Shift Elements Left' }
    ]
  },
  peek: {
    id: 'peek',
    title: "Peek Operation",
    time: "O(1)", space: "O(1)",
    description: "Returns the front element without removing it. Useful for checking which element is next in line to be processed.",
    code: {
      js: `class Queue {\n  peek() {\n    if (this.queue.length === 0) return null;\n    return this.queue[0];\n  }\n}`,
      py: `class Queue:\n    def peek(self):\n        if len(self.queue) == 0: return None\n        return self.queue[0]`,
      java: `class Queue {\n    int peek() {\n        if (front > rear) throw new UnderflowException();\n        return queue[front];\n    }\n}`,
      cpp: `int peek() {\n    if (front > rear) return -1;\n    return queue[front];\n}`
    },
    flowNodes: [
      { id: '1', label: 'Start Peek()' },
      { id: '2', label: 'Is Queue Empty?' },
      { id: '3', label: 'Return queue[front]' }
    ]
  },
  traverse: {
    id: 'traverse',
    title: "Traverse Queue",
    time: "O(n)", space: "O(1)",
    description: "Visits every element in the queue from Front to Rear sequentially.",
    code: {
      js: `class Queue {\n  traverse() {\n    for (let i = 0; i < this.queue.length; i++) {\n      console.log(this.queue[i]);\n    }\n  }\n}`,
      py: `class Queue:\n    def traverse(self):\n        for i in range(len(self.queue)):\n            print(self.queue[i])`,
      java: `class Queue {\n    void traverse() {\n        for (int i = front; i <= rear; i++) {\n            System.out.println(queue[i]);\n        }\n    }\n}`,
      cpp: `void traverse() {\n    for (int i = front; i <= rear; i++) {\n        cout << queue[i] << " ";\n    }\n}`
    },
    flowNodes: [
      { id: '1', label: 'Start Traversal' },
      { id: '2', label: 'Set i = Front' },
      { id: '3', label: 'Visit queue[i]' },
      { id: '4', label: 'Increment i until Rear' }
    ]
  }
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// --- MAIN COMPONENT ---

export default function QueueVisualizer() {
  // --- STATE ---
  const [maxSize, setMaxSize] = useState(8);
  const [queue, setQueue] = useState([
    { id: generateId(), val: 10, state: 'default' },
    { id: generateId(), val: 20, state: 'default' },
    { id: generateId(), val: 30, state: 'default' }
  ]);
  
  // Animation Player State
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStepMode, setIsStepMode] = useState(false);
  const [speed, setSpeed] = useState(1); 
  
  // UI State
  const [inputValue, setInputValue] = useState('');
  const [activeAlgorithm, setActiveAlgorithm] = useState(ALGORITHMS.enqueue);
  const [codeLanguage, setCodeLanguage] = useState('js');

  // Computed state
  const displayQueue = steps.length > 0 ? steps[currentStep].queue : queue;
  const currentMessage = steps.length > 0 ? steps[currentStep].msg : "Ready. Select a queue operation.";
  const isErrorStep = steps.length > 0 ? steps[currentStep].isError : false;
  
  // Pointers
  const frontIndex = 0;
  const rearIndex = displayQueue.length - 1;

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
      const finalQueue = steps[steps.length - 1].queue.map(item => ({ ...item, state: 'default' }));
      setQueue(finalQueue);
    }
    setSteps([]);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // --- QUEUE INITIALIZATION ---
  const handleCreateQueue = () => {
    stopAnimationAndCommit();
    setQueue([]);
  };

  const generateRandomQueue = () => {
    stopAnimationAndCommit();
    const count = Math.floor(Math.random() * (maxSize - 2)) + 2; // 2 to maxSize
    const newQueue = Array.from({ length: count }, () => ({
      id: generateId(),
      val: Math.floor(Math.random() * 99) + 1,
      state: 'default'
    }));
    setQueue(newQueue);
  };

  // --- ALGORITHM STEP GENERATORS ---
  const copyQueue = (q) => q.map(item => ({ ...item }));

  const enqueueElement = () => {
    if (!inputValue) return;
    const val = parseInt(inputValue, 10);
    let newSteps = [];
    let currentQ = copyQueue(displayQueue);
    
    newSteps.push({ queue: copyQueue(currentQ), msg: `Checking if queue is full (Rear === MaxSize - 1)` });
    
    if (currentQ.length >= maxSize) {
      newSteps.push({ 
        queue: copyQueue(currentQ), 
        msg: `Queue Overflow! Cannot enqueue ${val}. Queue has reached max capacity of ${maxSize}.`, 
        isError: true 
      });
      startAnimation(newSteps, ALGORITHMS.enqueue);
      setInputValue('');
      return;
    }

    const newItem = { id: generateId(), val, state: 'highlight' };
    newSteps.push({ queue: copyQueue(currentQ), msg: `Queue is not full. Preparing to insert ${val} at Rear.` });
    
    currentQ.push(newItem);
    newSteps.push({ queue: copyQueue(currentQ), msg: `Enqueued ${val}. Rear pointer moves right.` });
    
    currentQ[currentQ.length - 1].state = 'default';
    newSteps.push({ queue: copyQueue(currentQ), msg: `Enqueue operation complete.` });

    startAnimation(newSteps, ALGORITHMS.enqueue);
    setInputValue('');
  };

  const dequeueElement = () => {
    let newSteps = [];
    let currentQ = copyQueue(displayQueue);
    
    newSteps.push({ queue: copyQueue(currentQ), msg: `Checking if queue is empty (Front > Rear)` });
    
    if (currentQ.length === 0) {
      newSteps.push({ 
        queue: copyQueue(currentQ), 
        msg: `Queue Underflow! Cannot dequeue from an empty queue.`, 
        isError: true 
      });
      startAnimation(newSteps, ALGORITHMS.dequeue);
      return;
    }

    currentQ[0].state = 'delete';
    newSteps.push({ queue: copyQueue(currentQ), msg: `Accessing Front element (${currentQ[0].val}) to remove.` });
    
    const dequeuedVal = currentQ.shift().val; // Remove first element
    newSteps.push({ queue: copyQueue(currentQ), msg: `Dequeued ${dequeuedVal}. Remaining elements shift left.` });

    startAnimation(newSteps, ALGORITHMS.dequeue);
  };

  const peekElement = () => {
    let newSteps = [];
    let currentQ = copyQueue(displayQueue);
    
    newSteps.push({ queue: copyQueue(currentQ), msg: `Checking if queue is empty...` });
    
    if (currentQ.length === 0) {
      newSteps.push({ queue: copyQueue(currentQ), msg: `Queue is empty. Peek returns null/undefined.` });
    } else {
      currentQ[0].state = 'highlight';
      newSteps.push({ queue: copyQueue(currentQ), msg: `Front element is ${currentQ[0].val}. Returning value without removing.` });
      
      currentQ[0].state = 'default';
      newSteps.push({ queue: copyQueue(currentQ), msg: `Peek complete.` });
    }

    startAnimation(newSteps, ALGORITHMS.peek);
  };

  const traverseQueue = () => {
    let newSteps = [];
    let currentQ = copyQueue(displayQueue);

    if (currentQ.length === 0) {
      newSteps.push({ queue: copyQueue(currentQ), msg: `Queue is empty. Nothing to traverse.` });
      startAnimation(newSteps, ALGORITHMS.traverse);
      return;
    }

    newSteps.push({ queue: copyQueue(currentQ), msg: `Starting traversal from Front to Rear.` });

    let traversalResult = [];
    for (let i = 0; i < currentQ.length; i++) {
      currentQ = currentQ.map(item => ({ ...item, state: 'default' }));
      currentQ[i].state = 'active';
      traversalResult.push(currentQ[i].val);
      
      newSteps.push({ 
        queue: copyQueue(currentQ), 
        msg: `Visiting index ${i} (Value: ${currentQ[i].val}). Current output: [${traversalResult.join(' → ')}]` 
      });
    }
    
    currentQ[currentQ.length - 1].state = 'default';
    newSteps.push({ queue: copyQueue(currentQ), msg: `Traversal complete. Result: ${traversalResult.join(' → ')}` });
    
    startAnimation(newSteps, ALGORITHMS.traverse);
  };

  const checkEmpty = () => {
    let newSteps = [];
    const isEmpty = displayQueue.length === 0;
    newSteps.push({ 
      queue: copyQueue(displayQueue), 
      msg: `isEmpty() Check: Queue length is ${displayQueue.length}. Result: ${isEmpty ? 'True' : 'False'}.` 
    });
    startAnimation(newSteps, ALGORITHMS.peek); 
  };

  const checkFull = () => {
    let newSteps = [];
    const isFull = displayQueue.length >= maxSize;
    newSteps.push({ 
      queue: copyQueue(displayQueue), 
      msg: `isFull() Check: Queue length is ${displayQueue.length}, Max is ${maxSize}. Result: ${isFull ? 'True' : 'False'}.` 
    });
    startAnimation(newSteps, ALGORITHMS.peek);
  };

  // --- RENDERING HELPERS ---
  const getCellColor = (state) => {
    switch(state) {
      case 'active': return 'bg-blue-600 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.6)] text-white z-10 scale-105';
      case 'highlight': return 'bg-emerald-600 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.6)] text-white z-10 scale-105';
      case 'delete': return 'bg-red-600 border-red-400 opacity-80 scale-110 z-20 text-white shadow-[0_0_20px_rgba(239,68,68,0.6)]';
      default: return 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700/80';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden flex flex-col">
      
      {/* HEADER & INITIALIZATION PANEL */}
      <header className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 z-20 relative">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 shadow-inner">
            <ArrowRightToLine className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent leading-tight">
              Queue Visualizer
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase mt-0.5">FIFO Data Structure</p>
          </div>
        </div>

        {/* Generation Controls */}
        <div className="flex flex-wrap items-center gap-4 bg-slate-950/50 p-2 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3 px-2">
            <span className="text-xs text-slate-400 font-medium">Max Size: {maxSize}</span>
            <input 
              type="range" min="4" max="15" 
              value={maxSize} onChange={(e) => {
                setMaxSize(Number(e.target.value));
                if (queue.length > Number(e.target.value)) setQueue(queue.slice(0, Number(e.target.value)));
              }}
              disabled={isPlaying}
              className="w-24 accent-emerald-500"
            />
          </div>
          <div className="w-px h-6 bg-slate-800 hidden sm:block"></div>
          <div className="flex gap-2">
            <button 
              onClick={handleCreateQueue} disabled={isPlaying}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-md transition-colors border border-slate-700 shadow-sm"
            >
              Reset Empty
            </button>
            <button 
              onClick={generateRandomQueue} disabled={isPlaying}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-md transition-colors shadow-sm"
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
          <div className="flex-1 relative flex flex-col items-center justify-center p-8 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] overflow-hidden">
            
            {/* Dynamic Status Message */}
            <div className={`absolute top-8 max-w-2xl text-center px-6 py-3 backdrop-blur-md border rounded-full shadow-2xl font-medium z-30 animate-fade-in flex items-center gap-2 transition-colors duration-300 ${
              isErrorStep ? 'bg-red-900/90 border-red-500 text-red-200' : 'bg-slate-900/90 border-slate-700 text-emerald-300'
            }`}>
              {isErrorStep ? <AlertCircle className="w-4 h-4 text-red-400" /> : (
                <span className="relative flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPlaying ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${isPlaying ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                </span>
              )}
              {currentMessage}
            </div>

            {/* QUEUE CONTAINER */}
            <div className="relative w-full max-w-4xl flex flex-col items-center justify-center mt-12">
              
              {/* Pointers Container */}
              <div className="w-full flex justify-between px-10 mb-4 h-8 relative">
                {displayQueue.length > 0 && (
                  <>
                    <motion.div 
                      layoutId="frontPointer"
                      className="absolute flex flex-col items-center text-emerald-400 font-bold font-mono text-sm tracking-wider"
                      style={{ left: '2.5rem' }} // Fixed left for front in shifting queue
                    >
                      FRONT
                      <div className="w-0 h-0 border-x-8 border-x-transparent border-t-[12px] border-t-emerald-500 mt-1"></div>
                    </motion.div>
                    
                    <motion.div 
                      layoutId="rearPointer"
                      className="absolute flex flex-col items-center text-blue-400 font-bold font-mono text-sm tracking-wider transition-all duration-300"
                      style={{ left: `calc(2.5rem + ${rearIndex * (4.5)}rem)` }} // Dynamic positioning based on item width + gap
                    >
                      REAR
                      <div className="w-0 h-0 border-x-8 border-x-transparent border-t-[12px] border-t-blue-500 mt-1"></div>
                    </motion.div>
                  </>
                )}
              </div>

              {/* Queue Track */}
              <div className="flex items-center w-full overflow-x-auto pb-8 pt-2 px-10 custom-scrollbar relative min-h-[120px]">
                
                {/* Visual Max Capacity Boundary */}
                <div 
                  className={`absolute top-0 bottom-8 right-10 border-r-4 border-dashed transition-colors duration-300 ${isErrorStep && displayQueue.length >= maxSize ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'border-slate-700/50'}`}
                  style={{ left: `calc(2.5rem + ${maxSize * 4.5}rem - 0.5rem)` }}
                >
                  <span className="absolute -bottom-6 -right-6 text-[10px] text-slate-500 font-mono tracking-widest bg-slate-950 px-2 rounded-full">MAX_CAPACITY</span>
                </div>

                <AnimatePresence mode="popLayout">
                  {displayQueue.map((item, index) => (
                    <motion.div
                      layout
                      key={item.id}
                      initial={{ opacity: 0, x: 50, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -50, scale: 0.8, filter: "blur(4px)" }}
                      transition={{ 
                        type: "spring", stiffness: 400, damping: 25, mass: 0.8
                      }}
                      className="relative flex-shrink-0 mr-2"
                      style={{ width: '4rem' }}
                    >
                      {/* Queue Node */}
                      <div className={`
                        w-16 h-16 flex items-center justify-center rounded-xl border-2 transition-all duration-300 
                        font-mono font-bold text-xl shadow-md ${getCellColor(item.state)}
                      `}>
                        {item.val}
                      </div>
                      
                      {/* Index Label */}
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 font-mono">
                        [{index}]
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {displayQueue.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 opacity-50 z-0 pointer-events-none pb-8">
                    <Activity className="w-10 h-10 mb-2" />
                    <span className="text-xs uppercase tracking-widest font-semibold">Queue is Empty</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* OPERATIONS CONTROL PANEL */}
          <div className="bg-slate-900 border-t border-slate-800 z-20 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
            
            {/* Top row: Inputs & Actions */}
            <div className="p-4 border-b border-slate-800/50 flex flex-wrap gap-4 items-center">
              
              {/* Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Type className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && enqueueElement()}
                  placeholder="Value"
                  disabled={isPlaying}
                  className="w-32 bg-slate-950 border border-slate-700 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block pl-9 p-2.5 transition-colors disabled:opacity-50"
                />
              </div>

              <div className="h-8 w-px bg-slate-700 hidden sm:block"></div>

              {/* Main Operations */}
              <div className="flex flex-wrap gap-2">
                <button onClick={enqueueElement} disabled={isPlaying} className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50">
                  <ArrowRightToLine className="w-4 h-4" /> Enqueue
                </button>
                <button onClick={dequeueElement} disabled={isPlaying} className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50">
                  <ArrowRightFromLine className="w-4 h-4" /> Dequeue
                </button>
                <button onClick={peekElement} disabled={isPlaying} className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50">
                  <Search className="w-4 h-4" /> Peek
                </button>
                <button onClick={traverseQueue} disabled={isPlaying} className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50">
                  <Maximize className="w-4 h-4" /> Traverse
                </button>
              </div>

              <div className="h-8 w-px bg-slate-700 hidden xl:block"></div>

              {/* Utility Queries */}
              <div className="flex gap-2">
                <button onClick={checkEmpty} disabled={isPlaying} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
                  isEmpty?
                </button>
                <button onClick={checkFull} disabled={isPlaying} className="px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
                  isFull?
                </button>
              </div>
            </div>

            {/* Bottom row: Execution Controls */}
            <div className="p-3 bg-slate-950 flex flex-wrap justify-between items-center gap-4">
              
              {/* Playback & Mode Controls */}
              <div className="flex items-center gap-3">
                
                <div className="flex bg-slate-900 rounded-lg border border-slate-800 p-1 shadow-inner">
                  <button 
                    onClick={() => { setIsStepMode(false); setIsPlaying(false); }}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${!isStepMode ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Auto Run
                  </button>
                  <button 
                    onClick={() => { setIsStepMode(true); setIsPlaying(false); }}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${isStepMode ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Step Mode
                  </button>
                </div>

                {isStepMode ? (
                  <button 
                    onClick={() => currentStep < steps.length - 1 && setCurrentStep(c => c + 1)} 
                    disabled={steps.length === 0 || currentStep >= steps.length - 1}
                    className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:hover:bg-emerald-600 rounded-lg text-white transition-colors shadow-md flex items-center gap-2 text-xs font-bold"
                  >
                    Next Step <SkipForward className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)} 
                    disabled={steps.length === 0 && currentStep === 0}
                    className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:hover:bg-emerald-600 rounded-lg text-white transition-colors shadow-md"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                )}

                <button onClick={stopAnimationAndCommit} className="p-2.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors" title="Stop & Commit">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Speed Slider */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg">
                <FastForward className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mr-1">Speed</span>
                <input 
                  type="range" min="0.25" max="3" step="0.25" 
                  value={speed} onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-24 accent-emerald-500"
                />
                <span className="text-[10px] text-slate-300 font-mono w-6 text-right">{speed}x</span>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT PANEL - EXPLANATION, FLOW, CODE */}
        <div className="col-span-1 border-l border-slate-800 bg-slate-900 flex flex-col overflow-hidden max-h-screen">
          
          <div className="p-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-10 shadow-sm flex justify-between items-center">
            <h2 className="text-base font-bold flex items-center gap-2 text-white">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              Algorithm Insights
            </h2>
            <Info className="w-4 h-4 text-slate-500 hover:text-emerald-400 cursor-pointer transition-colors" title="Queue Logic Info" />
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
            
            {/* Header & Desc */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-emerald-400">{activeAlgorithm.title}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">O(1)</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                {activeAlgorithm.description}
              </p>
            </div>

            {/* Complexity */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 shadow-inner">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Time</span>
                <div className="text-lg font-mono text-emerald-400 mt-1">{activeAlgorithm.time}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 shadow-inner">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Space</span>
                <div className="text-lg font-mono text-amber-400 mt-1">{activeAlgorithm.space}</div>
              </div>
            </div>

            {/* Progress / Steps info */}
            {steps.length > 0 && (
              <div className={`border rounded-xl p-4 transition-colors duration-300 ${isErrorStep ? 'bg-red-900/10 border-red-900/30' : 'bg-emerald-900/10 border-emerald-900/30'}`}>
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-sm font-semibold ${isErrorStep ? 'text-red-300' : 'text-emerald-300'}`}>Execution Step</span>
                  <span className={`text-xs font-mono px-2 py-1 rounded ${isErrorStep ? 'text-red-400 bg-red-900/40' : 'text-emerald-400 bg-emerald-900/40'}`}>
                    {currentStep + 1} / {steps.length}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3 overflow-hidden">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ease-out ${isErrorStep ? 'bg-red-500' : 'bg-emerald-500'}`} 
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  ></div>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-slate-300 font-mono leading-relaxed">
                  <span className="text-emerald-500 mr-2">{'>'}</span> 
                  {currentMessage}
                </div>
              </div>
            )}

            {/* Custom Operation Flow Diagram (React Flow Fallback) */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 flex flex-col">
              <div className="px-3 py-2 border-b border-slate-800 flex items-center gap-2 bg-slate-900">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">Logic Flow</span>
              </div>
              <div className="flex-1 relative flex flex-col items-center justify-center py-6 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]">
                {activeAlgorithm.flowNodes.map((node, i) => (
                  <React.Fragment key={node.id}>
                    <div className="bg-[#1e293b] text-emerald-100 border border-[#334155] rounded-lg p-2 px-4 text-xs font-medium z-10 shadow-md min-w-[140px] text-center">
                      {node.label}
                    </div>
                    {i < activeAlgorithm.flowNodes.length - 1 && (
                      <div className="h-4 w-px bg-emerald-500/50 relative my-0.5">
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-r-[3px] border-t-[5px] border-l-transparent border-r-transparent border-t-emerald-500/50"></div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

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
                  <span className="ml-2 text-[10px] text-slate-500 font-mono">queue.{codeLanguage}</span>
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