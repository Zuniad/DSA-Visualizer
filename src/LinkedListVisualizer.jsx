import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, SkipForward, RotateCcw, 
  Plus, Trash2, Search, Code2, BookOpen,
  ArrowRight, ArrowLeftRight, Activity, 
  Settings2, ChevronRight, Hash, Type
} from 'lucide-react';

// --- CONSTANTS & DATA ---

const TYPES = {
  SINGLY: 'singly',
  DOUBLY: 'doubly',
  CIRCULAR: 'circular'
};

const ALGORITHMS = {
  insertHead: {
    title: "Insert at Head",
    time: "O(1)",
    space: "O(1)",
    description: "Creates a new node and places it at the beginning of the list, updating the head pointer.",
    code: {
      js: `function insertHead(val) {\n  const newNode = new Node(val);\n  newNode.next = this.head;\n  this.head = newNode;\n}`,
      py: `def insert_head(self, val):\n    new_node = Node(val)\n    new_node.next = self.head\n    self.head = new_node`,
      cpp: `void insertHead(int val) {\n    Node* newNode = new Node(val);\n    newNode->next = head;\n    head = newNode;\n}`
    }
  },
  insertTail: {
    title: "Insert at Tail",
    time: "O(n)",
    space: "O(1)",
    description: "Traverses to the end of the list and adds the new node. (O(1) if tail pointer exists).",
    code: {
      js: `function insertTail(val) {\n  const newNode = new Node(val);\n  if (!this.head) { this.head = newNode; return; }\n  let curr = this.head;\n  while (curr.next) curr = curr.next;\n  curr.next = newNode;\n}`,
      py: `def insert_tail(self, val):\n    new_node = Node(val)\n    if not self.head:\n        self.head = new_node\n        return\n    curr = self.head\n    while curr.next:\n        curr = curr.next\n    curr.next = new_node`,
      cpp: `void insertTail(int val) {\n    Node* newNode = new Node(val);\n    if (!head) { head = newNode; return; }\n    Node* curr = head;\n    while (curr->next) curr = curr->next;\n    curr->next = newNode;\n}`
    }
  },
  insertPosition: {
    title: "Insert at Position",
    time: "O(n)",
    space: "O(1)",
    description: "Traverses to the specific position, updates the previous node's next pointer to the new node, and the new node's next to the following node.",
    code: {
      js: `function insertAt(val, pos) {\n  if (pos === 0) return this.insertHead(val);\n  const newNode = new Node(val);\n  let curr = this.head;\n  for (let i = 0; i < pos - 1 && curr; i++) curr = curr.next;\n  if (!curr) return;\n  newNode.next = curr.next;\n  curr.next = newNode;\n}`,
      py: `def insert_at(self, val, pos):\n    if pos == 0: return self.insert_head(val)\n    new_node = Node(val)\n    curr = self.head\n    for _ in range(pos - 1):\n        if not curr: return\n        curr = curr.next\n    if not curr: return\n    new_node.next = curr.next\n    curr.next = new_node`,
      cpp: `void insertAt(int val, int pos) {\n    if (pos == 0) { insertHead(val); return; }\n    Node* newNode = new Node(val);\n    Node* curr = head;\n    for(int i=0; i<pos-1 && curr; i++) curr = curr->next;\n    if(!curr) return;\n    newNode->next = curr->next;\n    curr->next = newNode;\n}`
    }
  },
  deleteHead: {
    title: "Delete Head",
    time: "O(1)",
    space: "O(1)",
    description: "Removes the first node by updating the head pointer to the second node.",
    code: {
      js: `function deleteHead() {\n  if (!this.head) return;\n  this.head = this.head.next;\n}`,
      py: `def delete_head(self):\n    if not self.head: return\n    self.head = self.head.next`,
      cpp: `void deleteHead() {\n    if (!head) return;\n    Node* temp = head;\n    head = head->next;\n    delete temp;\n}`
    }
  },
  deleteTail: {
    title: "Delete Tail",
    time: "O(n)",
    space: "O(1)",
    description: "Traverses to the second-to-last node and sets its next pointer to null.",
    code: {
      js: `function deleteTail() {\n  if (!this.head) return;\n  if (!this.head.next) { this.head = null; return; }\n  let curr = this.head;\n  while (curr.next.next) curr = curr.next;\n  curr.next = null;\n}`,
      py: `def delete_tail(self):\n    if not self.head: return\n    if not self.head.next:\n        self.head = None\n        return\n    curr = self.head\n    while curr.next.next:\n        curr = curr.next\n    curr.next = None`,
      cpp: `void deleteTail() {\n    if (!head) return;\n    if (!head->next) { delete head; head = nullptr; return; }\n    Node* curr = head;\n    while (curr->next->next) curr = curr->next;\n    delete curr->next;\n    curr->next = nullptr;\n}`
    }
  },
  deletePosition: {
    title: "Delete at Position",
    time: "O(n)",
    space: "O(1)",
    description: "Traverses to the node before the target position and bypasses the target node.",
    code: {
      js: `function deleteAt(pos) {\n  if (!this.head) return;\n  if (pos === 0) return this.deleteHead();\n  let curr = this.head;\n  for (let i = 0; i < pos - 1 && curr.next; i++) curr = curr.next;\n  if (!curr.next) return;\n  curr.next = curr.next.next;\n}`,
      py: `def delete_at(self, pos):\n    if not self.head: return\n    if pos == 0: return self.delete_head()\n    curr = self.head\n    for _ in range(pos - 1):\n        if not curr.next: return\n        curr = curr.next\n    if not curr.next: return\n    curr.next = curr.next.next`,
      cpp: `void deleteAt(int pos) {\n    if (!head) return;\n    if (pos == 0) { deleteHead(); return; }\n    Node* curr = head;\n    for(int i=0; i<pos-1 && curr->next; i++) curr = curr->next;\n    if(!curr->next) return;\n    Node* temp = curr->next;\n    curr->next = curr->next->next;\n    delete temp;\n}`
    }
  },
  search: {
    title: "Search Value",
    time: "O(n)",
    space: "O(1)",
    description: "Iterates through the list comparing each node's value to the target.",
    code: {
      js: `function search(val) {\n  let curr = this.head;\n  while (curr) {\n    if (curr.val === val) return true;\n    curr = curr.next;\n  }\n  return false;\n}`,
      py: `def search(self, val):\n    curr = self.head\n    while curr:\n        if curr.val == val: return True\n        curr = curr.next\n    return False`,
      cpp: `bool search(int val) {\n    Node* curr = head;\n    while(curr) {\n        if(curr->val == val) return true;\n        curr = curr->next;\n    }\n    return false;\n}`
    }
  },
  traverse: {
    title: "Traverse List",
    time: "O(n)",
    space: "O(1)",
    description: "Visits every node in the linked list sequentially from head to tail.",
    code: {
      js: `function traverse() {\n  let curr = this.head;\n  while (curr) {\n    console.log(curr.val);\n    curr = curr.next;\n  }\n}`,
      py: `def traverse(self):\n    curr = self.head\n    while curr:\n        print(curr.val)\n        curr = curr.next`,
      cpp: `void traverse() {\n    Node* curr = head;\n    while(curr) {\n        cout << curr->val << " ";\n        curr = curr->next;\n    }\n}`
    }
  }
};

const generateId = () => Math.random().toString(36).substr(2, 9);

// --- MAIN COMPONENT ---

export default function LinkedListVisualizer() {
  // --- STATE ---
  const [listType, setListType] = useState(TYPES.SINGLY);
  const [nodes, setNodes] = useState([
    { id: generateId(), val: 10, state: 'default' },
    { id: generateId(), val: 20, state: 'default' },
    { id: generateId(), val: 30, state: 'default' },
    { id: generateId(), val: 40, state: 'default' }
  ]);
  
  // Animation/Step State
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStepMode, setIsStepMode] = useState(false);
  const [speed, setSpeed] = useState(1); // 0.5x, 1x, 2x
  
  // UI State
  const [inputValue, setInputValue] = useState('');
  const [posValue, setPosValue] = useState('');
  const [activeAlgorithm, setActiveAlgorithm] = useState(ALGORITHMS.traverse);
  const [codeLanguage, setCodeLanguage] = useState('js');

  // Computed state for rendering
  const displayNodes = steps.length > 0 ? steps[currentStep].nodes : nodes;
  const currentMessage = steps.length > 0 ? steps[currentStep].msg : "Ready.";

  // --- ANIMATION ENGINE ---
  
  useEffect(() => {
    let timer;
    if (isPlaying && steps.length > 0 && currentStep < steps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 1000 / speed);
    } else if (isPlaying && currentStep === steps.length - 1) {
      // Animation finished
      timer = setTimeout(() => {
        setIsPlaying(false);
        setNodes(steps[currentStep].nodes.map(n => ({ ...n, state: 'default' })));
        setSteps([]);
        setCurrentStep(0);
      }, 1000 / speed);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps, speed]);

  const startAnimation = (newSteps, algo) => {
    setActiveAlgorithm(algo);
    setSteps(newSteps);
    setCurrentStep(0);
    if (!isStepMode) setIsPlaying(true);
  };

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setNodes(steps[currentStep].nodes.map(n => ({ ...n, state: 'default' })));
      setSteps([]);
      setCurrentStep(0);
    }
  };

  // --- LINKED LIST OPERATIONS ---

  const copyNodes = (nodeList) => JSON.parse(JSON.stringify(nodeList));

  const insertHead = () => {
    if (!inputValue) return;
    const val = parseInt(inputValue, 10);
    let n = copyNodes(nodes);
    let newSteps = [];
    
    // Step 1: Create
    const newNode = { id: generateId(), val, state: 'highlight' };
    newSteps.push({ nodes: copyNodes(n), msg: `Create new node with value ${val}` });
    
    // Step 2: Insert
    n.unshift(newNode);
    newSteps.push({ nodes: copyNodes(n), msg: `Point new node's next to current head, update head` });
    
    // Step 3: Finish
    n[0].state = 'default';
    newSteps.push({ nodes: copyNodes(n), msg: `Insertion complete` });
    
    startAnimation(newSteps, ALGORITHMS.insertHead);
    setInputValue('');
  };

  const insertTail = () => {
    if (!inputValue) return;
    const val = parseInt(inputValue, 10);
    let n = copyNodes(nodes);
    let newSteps = [];
    
    const newNode = { id: generateId(), val, state: 'highlight' };
    
    if (n.length === 0) {
      n.push(newNode);
      newSteps.push({ nodes: copyNodes(n), msg: `List is empty, new node becomes head` });
    } else {
      newSteps.push({ nodes: copyNodes(n), msg: `Traverse to find the tail node...` });
      for (let i = 0; i < n.length; i++) {
        let temp = copyNodes(n);
        temp[i].state = 'active';
        newSteps.push({ nodes: temp, msg: `Checking node at index ${i}` });
      }
      n.push(newNode);
      newSteps.push({ nodes: copyNodes(n), msg: `Append new node to the tail` });
    }
    
    n[n.length - 1].state = 'default';
    newSteps.push({ nodes: copyNodes(n), msg: `Insertion complete` });
    
    startAnimation(newSteps, ALGORITHMS.insertTail);
    setInputValue('');
  };

  const insertAt = () => {
    if (!inputValue || !posValue) return;
    const val = parseInt(inputValue, 10);
    let pos = parseInt(posValue, 10);
    let n = copyNodes(nodes);
    pos = Math.max(0, Math.min(pos, n.length));
    
    if (pos === 0) return insertHead();
    if (pos === n.length) return insertTail();

    let newSteps = [];
    const newNode = { id: generateId(), val, state: 'highlight' };
    
    newSteps.push({ nodes: copyNodes(n), msg: `Traverse to position ${pos}...` });
    for (let i = 0; i < pos; i++) {
      let temp = copyNodes(n);
      temp[i].state = 'active';
      newSteps.push({ nodes: temp, msg: `Traversing at index ${i}` });
    }
    
    n.splice(pos, 0, newNode);
    newSteps.push({ nodes: copyNodes(n), msg: `Insert node at position ${pos}` });
    
    n[pos].state = 'default';
    newSteps.push({ nodes: copyNodes(n), msg: `Insertion complete` });
    
    startAnimation(newSteps, ALGORITHMS.insertPosition);
    setInputValue('');
    setPosValue('');
  };

  const deleteHead = () => {
    if (nodes.length === 0) return;
    let n = copyNodes(nodes);
    let newSteps = [];
    
    n[0].state = 'delete';
    newSteps.push({ nodes: copyNodes(n), msg: `Identify head node to delete` });
    
    n.shift();
    newSteps.push({ nodes: copyNodes(n), msg: `Update head pointer to next node and remove` });
    
    startAnimation(newSteps, ALGORITHMS.deleteHead);
  };

  const deleteTail = () => {
    if (nodes.length === 0) return;
    if (nodes.length === 1) return deleteHead();
    
    let n = copyNodes(nodes);
    let newSteps = [];
    
    newSteps.push({ nodes: copyNodes(n), msg: `Traverse to second-to-last node...` });
    for (let i = 0; i < n.length - 1; i++) {
      let temp = copyNodes(n);
      temp[i].state = 'active';
      newSteps.push({ nodes: temp, msg: `Traversing...` });
    }
    
    let temp = copyNodes(n);
    temp[temp.length - 1].state = 'delete';
    newSteps.push({ nodes: temp, msg: `Unlink the tail node` });
    
    n.pop();
    newSteps.push({ nodes: copyNodes(n), msg: `Deletion complete` });
    
    startAnimation(newSteps, ALGORITHMS.deleteTail);
  };

  const deleteAt = () => {
    if (nodes.length === 0 || !posValue) return;
    let pos = parseInt(posValue, 10);
    if (pos < 0 || pos >= nodes.length) return;
    
    if (pos === 0) return deleteHead();
    if (pos === nodes.length - 1) return deleteTail();

    let n = copyNodes(nodes);
    let newSteps = [];
    
    newSteps.push({ nodes: copyNodes(n), msg: `Traverse to node before position ${pos}...` });
    for (let i = 0; i < pos; i++) {
      let temp = copyNodes(n);
      temp[i].state = 'active';
      newSteps.push({ nodes: temp, msg: `Traversing...` });
    }
    
    let temp = copyNodes(n);
    temp[pos].state = 'delete';
    newSteps.push({ nodes: temp, msg: `Bypass node at position ${pos}` });
    
    n.splice(pos, 1);
    newSteps.push({ nodes: copyNodes(n), msg: `Deletion complete` });
    
    startAnimation(newSteps, ALGORITHMS.deletePosition);
    setPosValue('');
  };

  const searchVal = () => {
    if (!inputValue) return;
    const val = parseInt(inputValue, 10);
    let n = copyNodes(nodes);
    let newSteps = [];
    let found = false;
    
    newSteps.push({ nodes: copyNodes(n), msg: `Start search for value ${val}...` });
    
    for (let i = 0; i < n.length; i++) {
      let temp = copyNodes(n);
      temp[i].state = 'active';
      newSteps.push({ nodes: temp, msg: `Checking if ${n[i].val} == ${val}` });
      
      if (n[i].val === val) {
        temp[i].state = 'highlight';
        newSteps.push({ nodes: temp, msg: `Found ${val} at index ${i}!` });
        found = true;
        break;
      }
    }
    
    if (!found) {
      newSteps.push({ nodes: copyNodes(n), msg: `Value ${val} not found in the list.` });
    }
    
    startAnimation(newSteps, ALGORITHMS.search);
  };

  const traverseList = () => {
    let n = copyNodes(nodes);
    let newSteps = [];
    
    newSteps.push({ nodes: copyNodes(n), msg: `Starting traversal...` });
    
    for (let i = 0; i < n.length; i++) {
      let temp = copyNodes(n);
      temp[i].state = 'active';
      newSteps.push({ nodes: temp, msg: `Visiting node with value ${n[i].val}` });
    }
    
    newSteps.push({ nodes: copyNodes(n), msg: `Traversal complete.` });
    startAnimation(newSteps, ALGORITHMS.traverse);
  };

  const generateRandom = () => {
    const count = Math.floor(Math.random() * 4) + 3; // 3 to 6 nodes
    const newNodes = Array.from({ length: count }, () => ({
      id: generateId(),
      val: Math.floor(Math.random() * 99) + 1,
      state: 'default'
    }));
    setNodes(newNodes);
    setSteps([]);
    setIsPlaying(false);
  };

  const resetList = () => {
    setNodes([]);
    setSteps([]);
    setIsPlaying(false);
  };

  // --- RENDER HELPERS ---
  const getNodeColor = (state) => {
    switch(state) {
      case 'active': return 'bg-blue-600 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)]';
      case 'highlight': return 'bg-emerald-600 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.6)]';
      case 'delete': return 'bg-red-600 border-red-400 opacity-50 scale-90';
      default: return 'bg-slate-800 border-slate-600 hover:border-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 overflow-hidden flex flex-col">
      
      {/* HEADER */}
      <header className="px-6 py-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Activity className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Linked List Visualizer
          </h1>
        </div>

        {/* TYPE SELECTOR */}
        <div className="flex p-1 bg-slate-800/80 rounded-xl border border-slate-700">
          {Object.values(TYPES).map((type) => (
            <button
              key={type}
              onClick={() => {
                setListType(type);
                setSteps([]);
                setIsPlaying(false);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-300 ${
                listType === type 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden">
        
        {/* LEFT/MAIN AREA */}
        <div className="col-span-1 lg:col-span-3 flex flex-col relative overflow-hidden">
          
          {/* VISUALIZER CANVAS */}
          <div className="flex-1 relative flex flex-col items-center justify-center p-8 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] min-h-[400px] overflow-x-auto">
            
            {/* Status Message */}
            <div className="absolute top-6 max-w-xl text-center px-6 py-3 bg-slate-900/80 backdrop-blur-md border border-slate-700 rounded-full shadow-lg text-blue-300 font-medium z-10 animate-fade-in">
              {currentMessage}
            </div>

            {/* List Container */}
            <div className="relative inline-flex items-center min-w-max py-12 px-10">
              
              <AnimatePresence mode="popLayout">
                {displayNodes.map((node, index) => (
                  <motion.div
                    key={node.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: -30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 30 }}
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    className="flex items-center"
                  >
                    {/* Node */}
                    <div className={`relative flex rounded-xl border-2 transition-colors duration-300 shadow-xl overflow-hidden ${getNodeColor(node.state)}`}>
                      
                      {/* Prev Pointer (Doubly) */}
                      {listType === TYPES.DOUBLY && (
                        <div className="px-2 py-3 bg-slate-900/50 border-r border-slate-700/50 flex flex-col items-center justify-center text-[10px] text-slate-400">
                          <span className="opacity-70">prev</span>
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1"></div>
                        </div>
                      )}
                      
                      {/* Value */}
                      <div className="px-5 py-3 flex flex-col items-center justify-center min-w-[60px]">
                        <span className="text-xs text-slate-400 mb-0.5 font-mono">val</span>
                        <span className="font-mono text-xl font-bold text-white">{node.val}</span>
                      </div>
                      
                      {/* Next Pointer */}
                      <div className="px-2 py-3 bg-slate-900/50 border-l border-slate-700/50 flex flex-col items-center justify-center text-[10px] text-slate-400">
                        <span className="opacity-70">next</span>
                        <div className={`w-1.5 h-1.5 rounded-full mt-1 ${index === displayNodes.length - 1 && listType !== TYPES.CIRCULAR ? 'bg-red-400/50' : 'bg-slate-500'}`}></div>
                      </div>
                      
                      {/* Index Label */}
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-500 font-mono">
                        [{index}]
                      </div>
                    </div>

                    {/* Arrow to Next */}
                    {index < displayNodes.length - 1 && (
                      <motion.div layout className="flex items-center justify-center w-12 relative text-slate-600">
                        {listType === TYPES.DOUBLY ? (
                          <ArrowLeftRight className="w-6 h-6 stroke-[2.5]" />
                        ) : (
                          <ArrowRight className="w-6 h-6 stroke-[2.5]" />
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Empty State */}
              {displayNodes.length === 0 && (
                <div className="text-slate-500 flex flex-col items-center justify-center py-10">
                  <Activity className="w-12 h-12 mb-3 opacity-20" />
                  <p>List is empty. Insert a node to begin.</p>
                </div>
              )}

              {/* Circular Back-Pointer */}
              {listType === TYPES.CIRCULAR && displayNodes.length > 0 && (
                <div className="absolute top-[50%] left-[80px] right-[80px] h-20 border-b-2 border-l-2 border-r-2 border-dashed border-blue-500/40 rounded-b-3xl pointer-events-none z-0">
                  {/* Arrowhead back to first node */}
                  <div className="absolute bottom-[-6px] left-[-6px] w-3 h-3 border-t-2 border-l-2 border-blue-500/40 transform rotate-45 bg-slate-950" />
                  <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 px-2 bg-slate-950 text-[10px] text-blue-400/70 font-mono tracking-wider">
                    LOOPS TO HEAD
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CONTROLS PANEL */}
          <div className="bg-slate-900 border-t border-slate-800 p-6 z-10">
            <div className="flex flex-col xl:flex-row gap-6">
              
              {/* Inputs & Basic Actions */}
              <div className="flex-1 flex gap-3 flex-wrap">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Type className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Value"
                    className="w-28 bg-slate-950 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block pl-9 p-2.5 transition-colors"
                  />
                </div>
                
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="number"
                    value={posValue}
                    onChange={(e) => setPosValue(e.target.value)}
                    placeholder="Index"
                    className="w-28 bg-slate-950 border border-slate-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block pl-9 p-2.5 transition-colors"
                  />
                </div>

                <div className="h-10 w-px bg-slate-800 mx-1 hidden sm:block"></div>
                
                <div className="flex flex-wrap gap-2">
                  <button onClick={insertHead} disabled={isPlaying || (isStepMode && steps.length > 0)} className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Head
                  </button>
                  <button onClick={insertTail} disabled={isPlaying || (isStepMode && steps.length > 0)} className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Tail
                  </button>
                  <button onClick={insertAt} disabled={isPlaying || (isStepMode && steps.length > 0)} className="px-3 py-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Pos
                  </button>
                </div>

                <div className="h-10 w-px bg-slate-800 mx-1 hidden sm:block"></div>

                <div className="flex flex-wrap gap-2">
                  <button onClick={deleteHead} disabled={isPlaying || (isStepMode && steps.length > 0)} className="px-3 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                    <Trash2 className="w-4 h-4" /> Head
                  </button>
                  <button onClick={deleteTail} disabled={isPlaying || (isStepMode && steps.length > 0)} className="px-3 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                    <Trash2 className="w-4 h-4" /> Tail
                  </button>
                  <button onClick={deleteAt} disabled={isPlaying || (isStepMode && steps.length > 0)} className="px-3 py-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                    <Trash2 className="w-4 h-4" /> Pos
                  </button>
                </div>
                
                <div className="h-10 w-px bg-slate-800 mx-1 hidden sm:block"></div>

                <button onClick={searchVal} disabled={isPlaying || (isStepMode && steps.length > 0)} className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                  <Search className="w-4 h-4" /> Search
                </button>
                <button onClick={traverseList} disabled={isPlaying || (isStepMode && steps.length > 0)} className="px-3 py-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                  <ArrowRight className="w-4 h-4" /> Traverse
                </button>
              </div>

              {/* Execution Controls */}
              <div className="flex items-center gap-3 bg-slate-950/50 p-2 rounded-xl border border-slate-800 shrink-0">
                
                {/* Mode Toggle */}
                <div className="flex bg-slate-900 rounded-lg border border-slate-700 p-1">
                  <button 
                    onClick={() => { setIsStepMode(false); setIsPlaying(false); }}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold ${!isStepMode ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Auto
                  </button>
                  <button 
                    onClick={() => { setIsStepMode(true); setIsPlaying(false); }}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold ${isStepMode ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Step
                  </button>
                </div>

                {/* Playback */}
                {isStepMode ? (
                  <button 
                    onClick={handleNextStep} 
                    disabled={steps.length === 0}
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 rounded-lg text-white transition-colors"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)} 
                    disabled={steps.length === 0}
                    className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 rounded-lg text-white transition-colors"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                )}

                {/* Speed */}
                <select 
                  value={speed} 
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-lg focus:ring-indigo-500 p-2"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1.0x</option>
                  <option value={2}>2.0x</option>
                </select>

                <div className="h-6 w-px bg-slate-700 mx-1"></div>
                
                <button onClick={resetList} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors" title="Clear List">
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button onClick={generateRandom} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors" title="Generate Random">
                  <Settings2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT PANEL - EXPLANATION & CODE */}
        <div className="col-span-1 border-l border-slate-800 bg-slate-900 flex flex-col overflow-hidden max-h-full">
          
          <div className="p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0">
            <h2 className="text-lg font-bold flex items-center gap-2 text-white">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Algorithm Details
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
            
            {/* Header */}
            <div>
              <h3 className="text-xl font-semibold text-blue-400 mb-2">{activeAlgorithm.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {activeAlgorithm.description}
              </p>
            </div>

            {/* Complexity */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Time</span>
                <div className="text-lg font-mono text-emerald-400 mt-1">{activeAlgorithm.time}</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Space</span>
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
                <p className="text-sm text-slate-300 italic">
                  "{currentMessage}"
                </p>
              </div>
            )}

            {/* Code Viewer */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-slate-300">
                  <Code2 className="w-4 h-4" /> Implementation
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
              
              <div className="bg-[#0d1117] rounded-xl border border-slate-800 overflow-hidden">
                <div className="px-4 py-2 border-b border-slate-800 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                  </div>
                </div>
                <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto">
                  <code>
                    {activeAlgorithm.code[codeLanguage]}
                  </code>
                </pre>
              </div>
            </div>

          </div>
        </div>

      </div>
      
      {/* Basic Global Styles for Custom Scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}} />
    </div>
  );
}