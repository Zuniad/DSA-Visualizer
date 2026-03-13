import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipForward, RotateCcw, 
  Plus, Trash2, Search, Code2, BookOpen,
  Activity, Settings2, Shuffle, Type, 
  ArrowDownToLine, ArrowUpFromLine, Maximize, AlertCircle, Layers
} from 'lucide-react';

// --- CONSTANTS & ALGORITHM DATA ---

const ALGORITHMS = {
  push: {
    id: 'push',
    title: "Push Operation",
    time: "O(1)", space: "O(1)",
    description: "Adds an element to the top of the stack. If the stack is full, a Stack Overflow condition occurs.",
    code: {
      js: `class Stack {\n  push(val) {\n    if (this.top === this.maxSize - 1) {\n      throw new Error("Stack Overflow");\n    }\n    this.top++;\n    this.items[this.top] = val;\n  }\n}`,
      py: `class Stack:\n    def push(self, val):\n        if self.top == self.max_size - 1:\n            raise Exception("Stack Overflow")\n        self.top += 1\n        self.items[self.top] = val`,
      java: `class Stack {\n    void push(int val) {\n        if (top == maxSize - 1) {\n            System.out.println("Stack Overflow");\n            return;\n        }\n        items[++top] = val;\n    }\n}`,
      cpp: `void push(int val) {\n    if (top == maxSize - 1) {\n        cout << "Stack Overflow" << endl;\n        return;\n    }\n    items[++top] = val;\n}`
    },
    flowNodes: [
      { id: '1', label: 'Start Push(val)' },
      { id: '2', label: 'Is Stack Full?' },
      { id: '3', label: 'Increment Top' },
      { id: '4', label: 'Insert at Top' }
    ]
  },
  pop: {
    id: 'pop',
    title: "Pop Operation",
    time: "O(1)", space: "O(1)",
    description: "Removes and returns the top element of the stack. If the stack is empty, a Stack Underflow condition occurs.",
    code: {
      js: `class Stack {\n  pop() {\n    if (this.top === -1) {\n      throw new Error("Stack Underflow");\n    }\n    const val = this.items[this.top];\n    this.top--;\n    return val;\n  }\n}`,
      py: `class Stack:\n    def pop(self):\n        if self.top == -1:\n            raise Exception("Stack Underflow")\n        val = self.items[self.top]\n        self.top -= 1\n        return val`,
      java: `class Stack {\n    int pop() {\n        if (top == -1) {\n            throw new EmptyStackException();\n        }\n        return items[top--];\n    }\n}`,
      cpp: `int pop() {\n    if (top == -1) {\n        cout << "Stack Underflow" << endl;\n        return -1;\n    }\n    return items[top--];\n}`
    },
    flowNodes: [
      { id: '1', label: 'Start Pop()' },
      { id: '2', label: 'Is Stack Empty?' },
      { id: '3', label: 'Access Top Element' },
      { id: '4', label: 'Decrement Top' }
    ]
  },
  peek: {
    id: 'peek',
    title: "Peek Operation",
    time: "O(1)", space: "O(1)",
    description: "Returns the top element of the stack without removing it. Useful for checking the next element to be processed.",
    code: {
      js: `class Stack {\n  peek() {\n    if (this.top === -1) return null;\n    return this.items[this.top];\n  }\n}`,
      py: `class Stack:\n    def peek(self):\n        if self.top == -1: return None\n        return self.items[self.top]`,
      java: `class Stack {\n    int peek() {\n        if (top == -1) throw new EmptyStackException();\n        return items[top];\n    }\n}`,
      cpp: `int peek() {\n    if (top == -1) return -1;\n    return items[top];\n}`
    },
    flowNodes: [
      { id: '1', label: 'Start Peek()' },
      { id: '2', label: 'Is Stack Empty?' },
      { id: '3', label: 'Return items[top]' }
    ]
  },
  traverse: {
    id: 'traverse',
    title: "Traverse Stack",
    time: "O(n)", space: "O(1)",
    description: "Visits every element in the stack from top to bottom. (Note: standard stacks don't typically support random access traversal, but it's useful for visualization).",
    code: {
      js: `class Stack {\n  traverse() {\n    for (let i = this.top; i >= 0; i--) {\n      console.log(this.items[i]);\n    }\n  }\n}`,
      py: `class Stack:\n    def traverse(self):\n        for i in range(self.top, -1, -1):\n            print(self.items[i])`,
      java: `class Stack {\n    void traverse() {\n        for (int i = top; i >= 0; i--) {\n            System.out.println(items[i]);\n        }\n    }\n}`,
      cpp: `void traverse() {\n    for (int i = top; i >= 0; i--) {\n        cout << items[i] << endl;\n    }\n}`
    },
    flowNodes: [
      { id: '1', label: 'Start Traversal' },
      { id: '2', label: 'Set i = top' },
      { id: '3', label: 'Visit items[i]' },
      { id: '4', label: 'Decrement i until 0' }
    ]
  }
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// --- MAIN COMPONENT ---

export default function StackVisualizer() {
  // --- STATE ---
  const [maxSize, setMaxSize] = useState(8);
  const [stack, setStack] = useState([
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
  const [activeAlgorithm, setActiveAlgorithm] = useState(ALGORITHMS.push);
  const [codeLanguage, setCodeLanguage] = useState('js');

  // Computed state for rendering
  const displayStack = steps.length > 0 ? steps[currentStep].stack : stack;
  const currentMessage = steps.length > 0 ? steps[currentStep].msg : "Ready. Select a stack operation.";
  const isErrorStep = steps.length > 0 ? steps[currentStep].isError : false;
  const currentTopIndex = displayStack.length - 1;

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
      // Commit final state, strip special highlight states
      const finalStack = steps[steps.length - 1].stack.map(item => ({ ...item, state: 'default' }));
      setStack(finalStack);
    }
    setSteps([]);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // --- STACK INITIALIZATION ---
  const handleCreateStack = () => {
    stopAnimationAndCommit();
    setStack([]);
  };

  const generateRandomStack = () => {
    stopAnimationAndCommit();
    const count = Math.floor(Math.random() * (maxSize - 1)) + 1;
    const newStack = Array.from({ length: count }, () => ({
      id: generateId(),
      val: Math.floor(Math.random() * 99) + 1,
      state: 'default'
    }));
    setStack(newStack);
  };

  // --- ALGORITHM STEP GENERATORS ---
  const copyStack = (stk) => stk.map(item => ({ ...item }));

  const pushElement = () => {
    if (!inputValue) return;
    const val = parseInt(inputValue, 10);
    let newSteps = [];
    let currentStk = copyStack(displayStack);
    
    // Check Overflow
    newSteps.push({ stack: copyStack(currentStk), msg: `Checking if stack is full (Top === MaxSize - 1)` });
    
    if (currentStk.length >= maxSize) {
      newSteps.push({ 
        stack: copyStack(currentStk), 
        msg: `Stack Overflow! Cannot push ${val}. Stack has reached max size of ${maxSize}.`, 
        isError: true 
      });
      startAnimation(newSteps, ALGORITHMS.push);
      setInputValue('');
      return;
    }

    // Push process
    const newItem = { id: generateId(), val, state: 'highlight' };
    newSteps.push({ stack: copyStack(currentStk), msg: `Stack is not full. Preparing to increment top and insert ${val}.` });
    
    currentStk.push(newItem);
    newSteps.push({ stack: copyStack(currentStk), msg: `Inserted ${val} at new Top.` });
    
    currentStk[currentStk.length - 1].state = 'default';
    newSteps.push({ stack: copyStack(currentStk), msg: `Push operation complete.` });

    startAnimation(newSteps, ALGORITHMS.push);
    setInputValue('');
  };

  const popElement = () => {
    let newSteps = [];
    let currentStk = copyStack(displayStack);
    
    // Check Underflow
    newSteps.push({ stack: copyStack(currentStk), msg: `Checking if stack is empty (Top === -1)` });
    
    if (currentStk.length === 0) {
      newSteps.push({ 
        stack: copyStack(currentStk), 
        msg: `Stack Underflow! Cannot pop from an empty stack.`, 
        isError: true 
      });
      startAnimation(newSteps, ALGORITHMS.pop);
      return;
    }

    // Pop process
    currentStk[currentStk.length - 1].state = 'delete';
    newSteps.push({ stack: copyStack(currentStk), msg: `Accessing Top element (${currentStk[currentStk.length - 1].val}) to remove.` });
    
    const poppedVal = currentStk.pop().val;
    newSteps.push({ stack: copyStack(currentStk), msg: `Popped element ${poppedVal}. Top pointer decremented.` });

    startAnimation(newSteps, ALGORITHMS.pop);
  };

  const peekElement = () => {
    let newSteps = [];
    let currentStk = copyStack(displayStack);
    
    newSteps.push({ stack: copyStack(currentStk), msg: `Checking if stack is empty...` });
    
    if (currentStk.length === 0) {
      newSteps.push({ stack: copyStack(currentStk), msg: `Stack is empty. Peek returns null/undefined.` });
    } else {
      currentStk[currentStk.length - 1].state = 'active';
      newSteps.push({ stack: copyStack(currentStk), msg: `Top element is ${currentStk[currentStk.length - 1].val}. Returning value without removing.` });
      
      currentStk[currentStk.length - 1].state = 'default';
      newSteps.push({ stack: copyStack(currentStk), msg: `Peek complete.` });
    }

    startAnimation(newSteps, ALGORITHMS.peek);
  };

  const traverseStack = () => {
    let newSteps = [];
    let currentStk = copyStack(displayStack);

    if (currentStk.length === 0) {
      newSteps.push({ stack: copyStack(currentStk), msg: `Stack is empty. Nothing to traverse.` });
      startAnimation(newSteps, ALGORITHMS.traverse);
      return;
    }

    newSteps.push({ stack: copyStack(currentStk), msg: `Starting traversal from Top to Bottom.` });

    let traversalResult = [];
    for (let i = currentStk.length - 1; i >= 0; i--) {
      currentStk = currentStk.map(item => ({ ...item, state: 'default' }));
      currentStk[i].state = 'active';
      traversalResult.push(currentStk[i].val);
      
      newSteps.push({ 
        stack: copyStack(currentStk), 
        msg: `Visiting index ${i} (Value: ${currentStk[i].val}). Current output: [${traversalResult.join(' → ')}]` 
      });
    }
    
    currentStk[0].state = 'default';
    newSteps.push({ stack: copyStack(currentStk), msg: `Traversal complete. Result: ${traversalResult.join(' → ')}` });
    
    startAnimation(newSteps, ALGORITHMS.traverse);
  };

  const checkEmpty = () => {
    let newSteps = [];
    const isEmpty = displayStack.length === 0;
    newSteps.push({ 
      stack: copyStack(displayStack), 
      msg: `isEmpty() Check: Stack length is ${displayStack.length}. Result: ${isEmpty ? 'True' : 'False'}.` 
    });
    startAnimation(newSteps, ALGORITHMS.peek); // Reuse peek algorithm view
  };

  const checkFull = () => {
    let newSteps = [];
    const isFull = displayStack.length >= maxSize;
    newSteps.push({ 
      stack: copyStack(displayStack), 
      msg: `isFull() Check: Stack length is ${displayStack.length}, Max is ${maxSize}. Result: ${isFull ? 'True' : 'False'}.` 
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
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20 shadow-inner">
            <Layers className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent leading-tight">
              Stack Visualizer
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase mt-0.5">LIFO Data Structure</p>
          </div>
        </div>

        {/* Stack Generation Controls */}
        <div className="flex flex-wrap items-center gap-4 bg-slate-950/50 p-2 rounded-xl border border-slate-800">
          <div className="flex items-center gap-3 px-2">
            <span className="text-xs text-slate-400 font-medium">Max Size: {maxSize}</span>
            <input 
              type="range" min="3" max="20" 
              value={maxSize} onChange={(e) => {
                setMaxSize(Number(e.target.value));
                if (stack.length > Number(e.target.value)) setStack(stack.slice(0, Number(e.target.value)));
              }}
              disabled={isPlaying}
              className="w-24 accent-indigo-500"
            />
          </div>
          <div className="w-px h-6 bg-slate-800 hidden sm:block"></div>
          <div className="flex gap-2">
            <button 
              onClick={handleCreateStack} disabled={isPlaying}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-md transition-colors border border-slate-700 shadow-sm"
            >
              Reset Empty
            </button>
            <button 
              onClick={generateRandomStack} disabled={isPlaying}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-md transition-colors shadow-sm"
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
          <div className="flex-1 relative flex flex-col items-center justify-end py-12 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] overflow-hidden">
            
            {/* Dynamic Status Message */}
            <div className={`absolute top-8 max-w-2xl text-center px-6 py-3 backdrop-blur-md border rounded-full shadow-2xl font-medium z-30 animate-fade-in flex items-center gap-2 transition-colors duration-300 ${
              isErrorStep ? 'bg-red-900/90 border-red-500 text-red-200' : 'bg-slate-900/90 border-slate-700 text-indigo-300'
            }`}>
              {isErrorStep ? <AlertCircle className="w-4 h-4 text-red-400" /> : (
                <span className="relative flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPlaying ? 'bg-indigo-400' : 'bg-slate-500'}`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${isPlaying ? 'bg-indigo-500' : 'bg-slate-500'}`}></span>
                </span>
              )}
              {currentMessage}
            </div>

            {/* STACK BUCKET */}
            <div className="relative flex flex-col items-center">
              
              {/* Max Size Indicator Line */}
              <div className="absolute w-64 border-t-2 border-dashed border-slate-700/50 flex justify-between px-2 text-[10px] text-slate-500 font-mono tracking-widest" style={{ bottom: `${maxSize * 3.5}rem` }}>
                <span>MAX</span>
                <span>SIZE</span>
              </div>

              {/* Stack Container */}
              <div className="flex flex-col-reverse items-center w-40 sm:w-48 border-x-4 border-b-4 border-slate-600/50 rounded-b-2xl pb-2 relative min-h-[100px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] bg-slate-900/20 backdrop-blur-sm z-10" style={{ height: `${Math.max(5, maxSize) * 3.5}rem` }}>
                
                {/* Index Guides (Y-axis) */}
                <div className="absolute -left-12 bottom-2 flex flex-col-reverse items-end justify-start h-full text-slate-600 font-mono text-xs">
                  {Array.from({ length: maxSize }).map((_, i) => (
                    <div key={i} className="h-14 flex items-center pr-2">{i}</div>
                  ))}
                </div>

                <AnimatePresence mode="popLayout">
                  {displayStack.map((item, index) => (
                    <motion.div
                      layout
                      key={item.id}
                      initial={{ opacity: 0, y: -100, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -100, scale: 1.1, filter: "blur(4px)" }}
                      transition={{ 
                        type: "spring", stiffness: 300, damping: 20, mass: 0.8
                      }}
                      className="relative w-full px-4 h-14 flex items-center justify-center my-0"
                    >
                      {/* Stack Node */}
                      <div className={`
                        w-full h-[52px] flex items-center justify-center rounded-xl border-2 transition-all duration-300 
                        font-mono font-bold text-xl shadow-md ${getCellColor(item.state)}
                      `}>
                        {item.val}
                      </div>
                      
                      {/* TOP Pointer Arrow */}
                      {index === currentTopIndex && (
                        <motion.div 
                          layoutId="topPointer"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="absolute -right-28 flex items-center gap-2 text-indigo-400 font-bold font-mono text-sm tracking-wider"
                        >
                          <div className="w-0 h-0 border-y-8 border-y-transparent border-r-[12px] border-r-indigo-500"></div>
                          TOP
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {displayStack.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 opacity-50 z-0 pointer-events-none">
                    <Activity className="w-12 h-12 mb-2" />
                    <span className="text-xs uppercase tracking-widest font-semibold">Empty</span>
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
                  onKeyDown={(e) => e.key === 'Enter' && pushElement()}
                  placeholder="Value"
                  disabled={isPlaying}
                  className="w-32 bg-slate-950 border border-slate-700 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block pl-9 p-2.5 transition-colors disabled:opacity-50"
                />
              </div>

              <div className="h-8 w-px bg-slate-700 hidden sm:block"></div>

              {/* Main Operations */}
              <div className="flex flex-wrap gap-2">
                <button onClick={pushElement} disabled={isPlaying} className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50">
                  <ArrowDownToLine className="w-4 h-4" /> Push
                </button>
                <button onClick={popElement} disabled={isPlaying} className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50">
                  <ArrowUpFromLine className="w-4 h-4" /> Pop
                </button>
                <button onClick={peekElement} disabled={isPlaying} className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50">
                  <Search className="w-4 h-4" /> Peek
                </button>
                <button onClick={traverseStack} disabled={isPlaying} className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50">
                  <Maximize className="w-4 h-4" /> Traverse
                </button>
              </div>

              <div className="h-8 w-px bg-slate-700 hidden lg:block"></div>

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

                <button onClick={stopAnimationAndCommit} className="p-2.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors" title="Stop & Commit">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Speed Slider */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg">
                <Settings2 className="w-3.5 h-3.5 text-slate-500" />
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

        {/* RIGHT PANEL - EXPLANATION, FLOW, CODE */}
        <div className="col-span-1 border-l border-slate-800 bg-slate-900 flex flex-col overflow-hidden max-h-screen">
          
          <div className="p-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-10 shadow-sm">
            <h2 className="text-base font-bold flex items-center gap-2 text-white">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Algorithm Insights
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
            
            {/* Header & Desc */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold text-indigo-400">{activeAlgorithm.title}</h3>
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
              <div className={`border rounded-xl p-4 transition-colors duration-300 ${isErrorStep ? 'bg-red-900/10 border-red-900/30' : 'bg-indigo-900/10 border-indigo-900/30'}`}>
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-sm font-semibold ${isErrorStep ? 'text-red-300' : 'text-indigo-300'}`}>Execution Step</span>
                  <span className={`text-xs font-mono px-2 py-1 rounded ${isErrorStep ? 'text-red-400 bg-red-900/40' : 'text-indigo-400 bg-indigo-900/40'}`}>
                    {currentStep + 1} / {steps.length}
                  </span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mb-3 overflow-hidden">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-300 ease-out ${isErrorStep ? 'bg-red-500' : 'bg-indigo-500'}`} 
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  ></div>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-slate-300 font-mono leading-relaxed">
                  <span className="text-indigo-500 mr-2">{'>'}</span> 
                  {currentMessage}
                </div>
              </div>
            )}

            {/* Operation Flow Diagram */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 flex flex-col">
              <div className="px-3 py-2 border-b border-slate-800 flex items-center gap-2 bg-slate-900">
                <Activity className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">Logic Flow</span>
              </div>
              <div className="flex-1 relative flex flex-col items-center justify-center py-6 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]">
                {activeAlgorithm.flowNodes.map((node, i) => (
                  <React.Fragment key={node.id}>
                    <div className="bg-[#1e293b] text-indigo-100 border border-[#334155] rounded-lg p-2 px-4 text-xs font-medium z-10 shadow-md min-w-[140px] text-center">
                      {node.label}
                    </div>
                    {i < activeAlgorithm.flowNodes.length - 1 && (
                      <div className="h-4 w-px bg-indigo-500/50 relative my-0.5">
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-r-[3px] border-t-[5px] border-l-transparent border-r-transparent border-t-indigo-500/50"></div>
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
                  <span className="ml-2 text-[10px] text-slate-500 font-mono">stack.{codeLanguage}</span>
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