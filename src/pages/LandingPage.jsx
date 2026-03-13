import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Spline from '@splinetool/react-spline';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  ArrowRight, Activity, BarChart3, Code2, BookOpen,
  Layers, GitBranch, Network, Binary, Cpu, Zap, Sparkles,
  TreePine, ListOrdered, Hash, Database, Box, CircleDot,
  TrendingUp, Clock, ChevronDown, ChevronUp,
  Table2, Sigma, FunctionSquare, Terminal,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// ─── Data Structure Cards ────────────────────────────────────────────────────
const DS_CARDS = [
  { title: 'Arrays', icon: BarChart3, color: 'from-blue-500 to-cyan-400', desc: 'Linear indexed collections', link: '/visualizer?ds=array' },
  { title: 'Linked Lists', icon: GitBranch, color: 'from-violet-500 to-purple-400', desc: 'Node-chained sequences', link: '/visualizer?ds=linkedlist' },
  { title: 'Stacks', icon: Layers, color: 'from-amber-500 to-orange-400', desc: 'LIFO operations', link: '/visualizer?ds=stack' },
  { title: 'Queues', icon: ArrowRight, color: 'from-emerald-500 to-green-400', desc: 'FIFO operations', link: '/visualizer?ds=queue' },
  { title: 'Trees', icon: Network, color: 'from-rose-500 to-pink-400', desc: 'Hierarchical structures', link: '/visualizer?ds=tree' },
  { title: 'Graphs', icon: Binary, color: 'from-indigo-500 to-blue-400', desc: 'Vertex-edge networks', link: '/visualizer?ds=graph' },
  { title: 'Sorting', icon: BarChart3, color: 'from-teal-500 to-cyan-400', desc: 'Sorting algorithms', link: '/visualizer?ds=sorting' },
  { title: 'Pathfinding', icon: Cpu, color: 'from-fuchsia-500 to-violet-400', desc: 'Graph traversal algos', link: '/visualizer?ds=pathfinding' },
];

// ─── DS Classification Data ──────────────────────────────────────────────────
const DS_CLASSIFICATION = [
  {
    category: 'Linear Data Structures',
    color: 'from-blue-500 to-cyan-400',
    borderColor: 'border-blue-500/30',
    icon: ListOrdered,
    desc: 'Elements arranged in a sequential order where each element has a unique predecessor and successor.',
    items: [
      { name: 'Array', detail: 'Fixed-size, contiguous memory. O(1) access by index.', icon: BarChart3 },
      { name: 'Linked List', detail: 'Dynamic nodes connected via pointers. O(1) insert/delete at head.', icon: GitBranch },
      { name: 'Stack', detail: 'LIFO (Last-In, First-Out). Push/Pop in O(1).', icon: Layers },
      { name: 'Queue', detail: 'FIFO (First-In, First-Out). Enqueue/Dequeue in O(1).', icon: ArrowRight },
    ],
  },
  {
    category: 'Non-Linear Data Structures',
    color: 'from-violet-500 to-purple-400',
    borderColor: 'border-violet-500/30',
    icon: Network,
    desc: 'Elements arranged in a hierarchical or network structure with no fixed sequence.',
    items: [
      { name: 'Binary Tree', detail: 'Each node has at most 2 children. Basis of BST, AVL, Heaps.', icon: TreePine },
      { name: 'Binary Search Tree', detail: 'Left < Root < Right. O(log n) average search.', icon: TreePine },
      { name: 'Heap', detail: 'Complete binary tree. Min/Max extraction in O(log n).', icon: TrendingUp },
      { name: 'Graph', detail: 'Vertices + Edges. Directed/Undirected, Weighted/Unweighted.', icon: Network },
      { name: 'Trie', detail: 'Prefix tree for strings. O(m) search where m = key length.', icon: GitBranch },
    ],
  },
  {
    category: 'Hash-Based Structures',
    color: 'from-emerald-500 to-green-400',
    borderColor: 'border-emerald-500/30',
    icon: Hash,
    desc: 'Use hash functions to map keys to indices for near-constant time operations.',
    items: [
      { name: 'Hash Table', detail: 'Key-value store. O(1) average insert/search/delete.', icon: Database },
      { name: 'Hash Set', detail: 'Unique elements. O(1) average membership test.', icon: CircleDot },
      { name: 'Hash Map', detail: 'Associative array. Handles collisions via chaining or probing.', icon: Box },
    ],
  },
];

// ─── Time Complexity Data ────────────────────────────────────────────────────
const COMPLEXITY_TABLE = [
  { ds: 'Array', access: 'O(1)', search: 'O(n)', insert: 'O(n)', delete: 'O(n)', space: 'O(n)' },
  { ds: 'Linked List', access: 'O(n)', search: 'O(n)', insert: 'O(1)', delete: 'O(1)', space: 'O(n)' },
  { ds: 'Stack', access: 'O(n)', search: 'O(n)', insert: 'O(1)', delete: 'O(1)', space: 'O(n)' },
  { ds: 'Queue', access: 'O(n)', search: 'O(n)', insert: 'O(1)', delete: 'O(1)', space: 'O(n)' },
  { ds: 'Hash Table', access: '\u2014', search: 'O(1)*', insert: 'O(1)*', delete: 'O(1)*', space: 'O(n)' },
  { ds: 'BST (balanced)', access: 'O(log n)', search: 'O(log n)', insert: 'O(log n)', delete: 'O(log n)', space: 'O(n)' },
  { ds: 'Heap', access: '\u2014', search: 'O(n)', insert: 'O(log n)', delete: 'O(log n)', space: 'O(n)' },
  { ds: 'Trie', access: '\u2014', search: 'O(m)', insert: 'O(m)', delete: 'O(m)', space: 'O(n\u00b7m)' },
];

const SORTING_COMPLEXITY = [
  { algo: 'Bubble Sort', best: 'O(n)', avg: 'O(n\u00b2)', worst: 'O(n\u00b2)', space: 'O(1)', stable: 'Yes' },
  { algo: 'Selection Sort', best: 'O(n\u00b2)', avg: 'O(n\u00b2)', worst: 'O(n\u00b2)', space: 'O(1)', stable: 'No' },
  { algo: 'Insertion Sort', best: 'O(n)', avg: 'O(n\u00b2)', worst: 'O(n\u00b2)', space: 'O(1)', stable: 'Yes' },
  { algo: 'Merge Sort', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(n)', stable: 'Yes' },
  { algo: 'Quick Sort', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n\u00b2)', space: 'O(log n)', stable: 'No' },
  { algo: 'Heap Sort', best: 'O(n log n)', avg: 'O(n log n)', worst: 'O(n log n)', space: 'O(1)', stable: 'No' },
  { algo: 'Radix Sort', best: 'O(nk)', avg: 'O(nk)', worst: 'O(nk)', space: 'O(n+k)', stable: 'Yes' },
];

// ─── Asymptotic Notations ────────────────────────────────────────────────────
const ASYMPTOTIC_NOTATIONS = [
  {
    symbol: 'O (Big-O)',
    formal: 'f(n) \u2264 c\u00b7g(n) for n \u2265 n\u2080',
    meaning: 'Upper Bound',
    desc: 'Describes the worst-case scenario. Gives the maximum time/space an algorithm can take.',
    color: 'from-red-500 to-rose-400',
    bgColor: 'bg-red-500/10 border-red-500/20',
    example: 'Linear search is O(n) \u2014 checks at most n elements.',
  },
  {
    symbol: '\u03a9 (Big-Omega)',
    formal: 'f(n) \u2265 c\u00b7g(n) for n \u2265 n\u2080',
    meaning: 'Lower Bound',
    desc: 'Describes the best-case scenario. Gives the minimum time an algorithm must take.',
    color: 'from-emerald-500 to-green-400',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    example: 'Comparison-based sorting is \u03a9(n log n) \u2014 cannot be beaten.',
  },
  {
    symbol: '\u0398 (Big-Theta)',
    formal: 'c\u2081\u00b7g(n) \u2264 f(n) \u2264 c\u2082\u00b7g(n)',
    meaning: 'Tight Bound',
    desc: 'When upper and lower bounds match. Gives the exact growth rate.',
    color: 'from-blue-500 to-cyan-400',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
    example: 'Merge Sort is \u0398(n log n) in all cases.',
  },
  {
    symbol: 'o (Little-o)',
    formal: 'f(n) < c\u00b7g(n) for all c > 0',
    meaning: 'Strict Upper Bound',
    desc: 'f(n) grows strictly slower than g(n). Not a tight bound.',
    color: 'from-amber-500 to-yellow-400',
    bgColor: 'bg-amber-500/10 border-amber-500/20',
    example: 'n is o(n\u00b2) \u2014 linear grows strictly slower than quadratic.',
  },
  {
    symbol: '\u03c9 (Little-omega)',
    formal: 'f(n) > c\u00b7g(n) for all c > 0',
    meaning: 'Strict Lower Bound',
    desc: 'f(n) grows strictly faster than g(n).',
    color: 'from-fuchsia-500 to-violet-400',
    bgColor: 'bg-fuchsia-500/10 border-fuchsia-500/20',
    example: 'n\u00b2 is \u03c9(n) \u2014 quadratic grows strictly faster than linear.',
  },
];

const COMPLEXITY_CLASSES = [
  { name: 'O(1)', label: 'Constant', color: '#22c55e', desc: 'Independent of input size. Hash table lookups.' },
  { name: 'O(log n)', label: 'Logarithmic', color: '#3b82f6', desc: 'Halves problem each step. Binary search.' },
  { name: 'O(n)', label: 'Linear', color: '#eab308', desc: 'Grows proportionally. Simple traversals.' },
  { name: 'O(n log n)', label: 'Linearithmic', color: '#f97316', desc: 'Efficient sorting. Merge Sort, Heap Sort.' },
  { name: 'O(n\u00b2)', label: 'Quadratic', color: '#ef4444', desc: 'Nested loops. Bubble Sort, naive checks.' },
  { name: 'O(2\u207f)', label: 'Exponential', color: '#dc2626', desc: 'Doubles each step. Recursive Fibonacci.' },
  { name: 'O(n!)', label: 'Factorial', color: '#991b1b', desc: 'All permutations. Traveling Salesman brute force.' },
];

// ─── ReactFlow: DS Hierarchy Nodes & Edges ───────────────────────────────────
const INITIAL_NODES = [
  { id: 'ds', position: { x: 400, y: 0 }, data: { label: '\ud83d\udcca Data Structures' }, type: 'default', style: { background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 24px', fontWeight: 700, fontSize: 15, boxShadow: '0 8px 32px rgba(59,130,246,0.3)' } },
  { id: 'linear', position: { x: 150, y: 100 }, data: { label: '\ud83d\udccb Linear' }, style: { background: '#1e293b', color: '#93c5fd', border: '1px solid #3b82f6', borderRadius: 10, padding: '8px 18px', fontWeight: 600 } },
  { id: 'nonlinear', position: { x: 600, y: 100 }, data: { label: '\ud83c\udf33 Non-Linear' }, style: { background: '#1e293b', color: '#c4b5fd', border: '1px solid #8b5cf6', borderRadius: 10, padding: '8px 18px', fontWeight: 600 } },
  { id: 'array', position: { x: 0, y: 210 }, data: { label: '\u25a6 Array' }, style: { background: '#0f172a', color: '#67e8f9', border: '1px solid #06b6d4', borderRadius: 8, padding: '6px 14px', fontSize: 13 } },
  { id: 'linkedlist', position: { x: 130, y: 210 }, data: { label: '\ud83d\udd17 Linked List' }, style: { background: '#0f172a', color: '#67e8f9', border: '1px solid #06b6d4', borderRadius: 8, padding: '6px 14px', fontSize: 13 } },
  { id: 'stack', position: { x: 270, y: 210 }, data: { label: '\ud83d\udcda Stack' }, style: { background: '#0f172a', color: '#67e8f9', border: '1px solid #06b6d4', borderRadius: 8, padding: '6px 14px', fontSize: 13 } },
  { id: 'queue', position: { x: 380, y: 210 }, data: { label: '\ud83d\udeb6 Queue' }, style: { background: '#0f172a', color: '#67e8f9', border: '1px solid #06b6d4', borderRadius: 8, padding: '6px 14px', fontSize: 13 } },
  { id: 'tree', position: { x: 520, y: 210 }, data: { label: '\ud83c\udf32 Tree' }, style: { background: '#0f172a', color: '#d8b4fe', border: '1px solid #a855f7', borderRadius: 8, padding: '6px 14px', fontSize: 13 } },
  { id: 'graph', position: { x: 680, y: 210 }, data: { label: '\ud83d\udd78\ufe0f Graph' }, style: { background: '#0f172a', color: '#d8b4fe', border: '1px solid #a855f7', borderRadius: 8, padding: '6px 14px', fontSize: 13 } },
  { id: 'hashtable', position: { x: 830, y: 210 }, data: { label: '#\ufe0f\u20e3 Hash Table' }, style: { background: '#0f172a', color: '#d8b4fe', border: '1px solid #a855f7', borderRadius: 8, padding: '6px 14px', fontSize: 13 } },
  { id: 'bst', position: { x: 440, y: 310 }, data: { label: 'BST' }, style: { background: '#0f172a', color: '#fbbf24', border: '1px solid #f59e0b', borderRadius: 8, padding: '4px 12px', fontSize: 12 } },
  { id: 'avl', position: { x: 520, y: 310 }, data: { label: 'AVL' }, style: { background: '#0f172a', color: '#fbbf24', border: '1px solid #f59e0b', borderRadius: 8, padding: '4px 12px', fontSize: 12 } },
  { id: 'heap', position: { x: 590, y: 310 }, data: { label: 'Heap' }, style: { background: '#0f172a', color: '#fbbf24', border: '1px solid #f59e0b', borderRadius: 8, padding: '4px 12px', fontSize: 12 } },
  { id: 'trie', position: { x: 665, y: 310 }, data: { label: 'Trie' }, style: { background: '#0f172a', color: '#fbbf24', border: '1px solid #f59e0b', borderRadius: 8, padding: '4px 12px', fontSize: 12 } },
  { id: 'directed', position: { x: 740, y: 310 }, data: { label: 'Directed' }, style: { background: '#0f172a', color: '#fb923c', border: '1px solid #f97316', borderRadius: 8, padding: '4px 12px', fontSize: 12 } },
  { id: 'undirected', position: { x: 840, y: 310 }, data: { label: 'Undirected' }, style: { background: '#0f172a', color: '#fb923c', border: '1px solid #f97316', borderRadius: 8, padding: '4px 12px', fontSize: 12 } },
  { id: 'weighted', position: { x: 790, y: 390 }, data: { label: 'Weighted' }, style: { background: '#0f172a', color: '#fb923c', border: '1px solid #f97316', borderRadius: 8, padding: '4px 10px', fontSize: 11 } },
];

const INITIAL_EDGES = [
  { id: 'e1', source: 'ds', target: 'linear', animated: true, style: { stroke: '#3b82f6' } },
  { id: 'e2', source: 'ds', target: 'nonlinear', animated: true, style: { stroke: '#8b5cf6' } },
  { id: 'e3', source: 'linear', target: 'array', style: { stroke: '#06b6d4' } },
  { id: 'e4', source: 'linear', target: 'linkedlist', style: { stroke: '#06b6d4' } },
  { id: 'e5', source: 'linear', target: 'stack', style: { stroke: '#06b6d4' } },
  { id: 'e6', source: 'linear', target: 'queue', style: { stroke: '#06b6d4' } },
  { id: 'e7', source: 'nonlinear', target: 'tree', style: { stroke: '#a855f7' } },
  { id: 'e8', source: 'nonlinear', target: 'graph', style: { stroke: '#a855f7' } },
  { id: 'e9', source: 'nonlinear', target: 'hashtable', style: { stroke: '#a855f7' } },
  { id: 'e10', source: 'tree', target: 'bst', style: { stroke: '#f59e0b' } },
  { id: 'e11', source: 'tree', target: 'avl', style: { stroke: '#f59e0b' } },
  { id: 'e12', source: 'tree', target: 'heap', style: { stroke: '#f59e0b' } },
  { id: 'e13', source: 'tree', target: 'trie', style: { stroke: '#f59e0b' } },
  { id: 'e14', source: 'graph', target: 'directed', style: { stroke: '#f97316' } },
  { id: 'e15', source: 'graph', target: 'undirected', style: { stroke: '#f97316' } },
  { id: 'e16', source: 'directed', target: 'weighted', style: { stroke: '#f97316' } },
  { id: 'e17', source: 'undirected', target: 'weighted', style: { stroke: '#f97316' } },
];

// ─── Floating 3D Particle ────────────────────────────────────────────────────
function FloatingNode({ index }) {
  const ref = useRef(null);
  const [size] = useState(() => 6 + Math.random() * 14);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    gsap.set(el, { left: `${x}%`, top: `${y}%`, scale: 0 });
    gsap.to(el, { scale: 1, opacity: 0.6, duration: 0.8, delay: index * 0.08, ease: 'back.out(1.7)' });
    gsap.to(el, { y: 'random(-60, 60)', x: 'random(-40, 40)', rotation: 'random(-180, 180)', duration: 'random(4, 8)', repeat: -1, yoyo: true, ease: 'sine.inOut', delay: index * 0.1 });
  }, [index]);

  const colors = ['bg-blue-500/30', 'bg-violet-500/30', 'bg-cyan-500/30', 'bg-emerald-500/30', 'bg-amber-500/20'];
  const color = colors[index % colors.length];

  return (
    <div ref={ref} className={`absolute rounded-full ${color} blur-sm pointer-events-none`} style={{ width: size, height: size }} />
  );
}

// ─── Connection Lines (decorative) ──────────────────────────────────────────
function ConnectionLines() {
  const svgRef = useRef(null);
  useEffect(() => {
    const paths = svgRef.current?.querySelectorAll('path');
    if (!paths) return;
    paths.forEach((p, i) => {
      const length = p.getTotalLength();
      gsap.set(p, { strokeDasharray: length, strokeDashoffset: length });
      gsap.to(p, { strokeDashoffset: 0, duration: 2, delay: 1 + i * 0.3, ease: 'power2.inOut', repeat: -1, yoyo: true });
    });
  }, []);

  return (
    <svg ref={svgRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 1000 600" preserveAspectRatio="none">
      <path d="M100,300 Q300,100 500,300 T900,300" fill="none" stroke="url(#grad1)" strokeWidth="1" />
      <path d="M50,400 Q250,200 500,350 T950,200" fill="none" stroke="url(#grad2)" strokeWidth="1" />
      <path d="M200,100 Q400,400 700,200 T1000,400" fill="none" stroke="url(#grad3)" strokeWidth="1" />
      <defs>
        <linearGradient id="grad1"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#8b5cf6" /></linearGradient>
        <linearGradient id="grad2"><stop offset="0%" stopColor="#06b6d4" /><stop offset="100%" stopColor="#22c55e" /></linearGradient>
        <linearGradient id="grad3"><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#ef4444" /></linearGradient>
      </defs>
    </svg>
  );
}

// ─── ReactFlow DS Hierarchy Component ────────────────────────────────────────
function DSHierarchyFlow() {
  const [nodes] = useNodesState(INITIAL_NODES);
  const [edges] = useEdgesState(INITIAL_EDGES);
  const onInit = useCallback((instance) => {
    setTimeout(() => instance.fitView({ padding: 0.2 }), 100);
  }, []);

  return (
    <div className="w-full h-[480px] rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/80">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onInit={onInit}
        fitView
        panOnDrag
        zoomOnScroll
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'transparent' }}
      >
        <Background color="#334155" gap={24} size={1} />
        <Controls
          showInteractive={false}
          style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
        />
      </ReactFlow>
    </div>
  );
}

// ─── Complexity color helper ─────────────────────────────────────────────────
function complexityColor(val) {
  if (!val || val === '\u2014') return 'text-slate-500';
  if (val.includes('1)') && !val.includes('n')) return 'text-emerald-400';
  if (val.includes('log n)') && !val.includes('n log')) return 'text-blue-400';
  if (val.includes('n log n')) return 'text-amber-400';
  if (val.includes('n\u00b2') || val.includes('n!)') || val.includes('2\u207f')) return 'text-red-400';
  if (val.includes('(n)') || val.includes('(m)')) return 'text-yellow-400';
  if (val.includes('*')) return 'text-emerald-400';
  return 'text-slate-300';
}

// ─── Main Landing Page ──────────────────────────────────────────────────────
export default function LandingPage() {
  const heroRef = useRef(null);
  const cardsRef = useRef(null);
  const featuresRef = useRef(null);
  const classificationRef = useRef(null);
  const complexityRef = useRef(null);
  const notationsRef = useRef(null);
  const particleContainer = useRef(null);
  const [expandedNotation, setExpandedNotation] = useState(null);
  const [showSortingTable, setShowSortingTable] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-badge', { opacity: 0, y: -30, rotationX: -90, duration: 0.8, ease: 'back.out(1.7)' });
      gsap.from('.hero-title', { opacity: 0, y: 60, rotationX: 30, scale: 0.9, duration: 1, delay: 0.2, ease: 'power3.out', transformPerspective: 600, transformOrigin: 'center bottom' });
      gsap.from('.hero-subtitle', { opacity: 0, y: 40, duration: 0.8, delay: 0.5, ease: 'power2.out' });
      gsap.from('.hero-buttons > *', { opacity: 0, y: 30, scale: 0.8, duration: 0.6, stagger: 0.15, delay: 0.8, ease: 'back.out(1.7)' });
      gsap.from('.stat-item', { opacity: 0, y: 40, rotationY: 45, duration: 0.7, stagger: 0.12, delay: 1.2, ease: 'power3.out', transformPerspective: 800 });
      gsap.from('.ds-card', { y: 30, scale: 0.95, duration: 0.8, stagger: 0.1, delay: 0.2, ease: 'power3.out', scrollTrigger: { trigger: cardsRef.current, start: 'top 85%' } });
      gsap.from('.feature-card', { y: 30, x: -15, duration: 0.7, stagger: 0.12, delay: 0.2, ease: 'power2.out', scrollTrigger: { trigger: featuresRef.current, start: 'top 85%' } });
      gsap.from('.hierarchy-section', { y: 40, duration: 0.8, delay: 0.2, ease: 'power2.out', scrollTrigger: { trigger: classificationRef.current, start: 'top 85%' } });
      gsap.from('.classification-card', { y: 30, duration: 0.6, stagger: 0.15, delay: 0.3, ease: 'power3.out', scrollTrigger: { trigger: classificationRef.current, start: 'top 85%' } });
      gsap.from('.complexity-table', { y: 20, duration: 0.6, delay: 0.2, ease: 'power2.out', scrollTrigger: { trigger: complexityRef.current, start: 'top 85%' } });
      gsap.from('.notation-card', { y: 20, x: -15, duration: 0.5, stagger: 0.1, delay: 0.2, ease: 'power2.out', scrollTrigger: { trigger: notationsRef.current, start: 'top 85%' } });
      gsap.from('.growth-pill', { opacity: 0, scale: 0, duration: 0.4, stagger: 0.06, delay: 1, ease: 'back.out(2)' });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="relative overflow-hidden">

      {/* ─── HERO SECTION ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen py-12 sm:py-20 flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.08)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
        <div ref={particleContainer} className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <FloatingNode key={i} index={i} />
          ))}
        </div>
        <ConnectionLines />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Interactive Data Structures &amp; Algorithms
          </div>
          <h1 className="hero-title text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black leading-tight mb-6" style={{ perspective: '600px' }}>
            <span className="block bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">Master DSA</span>
            <span className="block bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text text-transparent mt-2">With Visualization</span>
          </h1>
          <p className="hero-subtitle text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop memorizing &mdash; start <span className="text-blue-400 font-semibold">understanding</span>.
            Watch algorithms come alive with step-by-step animations,
            practice with curated problems, and code in our built-in editor.
          </p>
          <div className="hero-buttons flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/visualizer" className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 rounded-xl text-white font-semibold text-lg shadow-2xl shadow-blue-500/25 transition-all duration-300 hover:scale-105 hover:shadow-blue-500/40">
              <Activity className="w-5 h-5" />Start Visualizing<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/editor" className="flex items-center gap-3 px-8 py-4 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-slate-600 rounded-xl text-slate-200 font-semibold text-lg transition-all duration-300 hover:scale-105">
              <Code2 className="w-5 h-5 text-emerald-400" />Code Editor
            </Link>
            <Link to="/questions" className="flex items-center gap-3 px-8 py-4 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-slate-600 rounded-xl text-slate-200 font-semibold text-lg transition-all duration-300 hover:scale-105">
              <BookOpen className="w-5 h-5 text-amber-400" />Practice Problems
            </Link>
          </div>
          <div className="mt-8 mx-auto w-full max-w-5xl rounded-2xl border border-slate-700/60 bg-slate-900/40 backdrop-blur-sm overflow-hidden shadow-2xl">
            <iframe
              src="https://my.spline.design/datavisualizationcopycopy-SarM0YTNsp4bw7TOFINultSc-Rj8/"
              title="Spline Data Visualization"
              frameBorder="0"
              allowFullScreen
              loading="lazy"
              className="w-full h-[360px] sm:h-[460px] md:h-[560px] lg:h-[620px]"
            />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
      </section>

      {/* ─── STATS BAR ────────────────────────────────────────────────── */}
      <section className="relative mt-8 z-10 max-w-5xl mx-auto px-6 mb-14 sm:mb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Data Structures', value: '8+', icon: Layers },
            { label: 'Algorithms', value: '15+', icon: Cpu },
            { label: 'Practice Problems', value: '50+', icon: BookOpen },
            { label: 'Languages', value: '3', icon: Code2 },
          ].map(({ label, value, icon: StatIcon }) => (
            <div key={label} className="stat-item bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-5 text-center hover:border-blue-500/30 transition-colors group" style={{ perspective: '800px' }}>
              <StatIcon className="w-6 h-6 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-3xl font-black bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">{value}</div>
              <div className="text-sm text-slate-500 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── INTERACTIVE DS HIERARCHY (ReactFlow) ─────────────────────── */}
      <section ref={classificationRef} className="max-w-7xl mx-auto px-6 mb-16 sm:mb-32">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-sm font-medium mb-6">
            <Network className="w-4 h-4" />
            How Data Structures Are Organized
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Data Structure Hierarchy</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Explore the taxonomy of data structures &mdash; from linear to non-linear, primitive to advanced. Drag, zoom, and interact with the flow diagram below.
          </p>
        </div>
        <div className="hierarchy-section">
          <DSHierarchyFlow />
          <p className="text-center text-slate-600 text-sm mt-3">Drag to pan, scroll to zoom, click nodes to explore</p>
        </div>
      </section>

      {/* ─── DS CLASSIFICATION DETAIL ─────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 mb-16 sm:mb-32">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium mb-6">
            <Database className="w-4 h-4" />
            Types &amp; Classifications
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">How Data Structures Are Divided</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Data structures are broadly classified into three families based on how elements are stored and accessed.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {DS_CLASSIFICATION.map(({ category, color, borderColor, icon: CatIcon, desc, items }) => (
            <div key={category} className={`classification-card bg-slate-900/60 border ${borderColor} rounded-2xl p-6 hover:bg-slate-900/80 transition-all`}>
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${color} mb-4`}>
                <CatIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{category}</h3>
              <p className="text-slate-400 text-sm mb-5 leading-relaxed">{desc}</p>
              <div className="space-y-3">
                {items.map(({ name, detail, icon: ItemIcon }) => (
                  <div key={name} className="flex items-start gap-3 bg-slate-950/60 rounded-xl p-3 border border-slate-800/50">
                    <ItemIcon className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-white font-semibold text-sm">{name}</span>
                      <p className="text-slate-500 text-xs mt-0.5">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── DATA STRUCTURES GRID ─────────────────────────────────────── */}
      <section ref={cardsRef} className="max-w-7xl mx-auto px-6 mb-16 sm:mb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Explore Data Structures</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Each visualization is interactive &mdash; insert, delete, search, and watch the algorithm execute step-by-step.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DS_CARDS.map(({ title, icon: CardIcon, color, desc, link }) => (
            <Link key={title} to={link} className="ds-card group relative bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl" style={{ perspective: '1000px' }}>
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${color} bg-opacity-10 mb-4`}>
                <CardIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{title}</h3>
              <p className="text-sm text-slate-500">{desc}</p>
              <ArrowRight className="absolute bottom-6 right-6 w-5 h-5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </section>

      {/* ─── ASYMPTOTIC NOTATIONS ─────────────────────────────────────── */}
      <section ref={notationsRef} className="max-w-7xl mx-auto px-6 mb-16 sm:mb-32">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm font-medium mb-6">
            <Sigma className="w-4 h-4" />
            Asymptotic Analysis
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Asymptotic Notations</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Asymptotic notations describe how an algorithm&apos;s running time or space grows as input size approaches infinity.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {ASYMPTOTIC_NOTATIONS.map((n, i) => (
            <button
              key={n.symbol}
              onClick={() => setExpandedNotation(expandedNotation === i ? null : i)}
              className={`notation-card text-left ${n.bgColor} border rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xl font-black text-white">{n.symbol}</h3>
                  <span className={`text-xs font-semibold bg-gradient-to-r ${n.color} bg-clip-text text-transparent`}>{n.meaning}</span>
                </div>
                {expandedNotation === i ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </div>
              <p className="text-slate-400 text-sm mb-2">{n.desc}</p>
              <code className="text-xs text-slate-500 font-mono bg-slate-950/50 rounded px-2 py-1">{n.formal}</code>
              {expandedNotation === i && (
                <div className="mt-4 pt-4 border-t border-slate-800">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-slate-300 text-sm">{n.example}</p>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Complexity Growth Scale */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            Complexity Growth Classes
          </h3>
          <p className="text-slate-500 text-sm mb-6">From fastest to slowest &mdash; how common complexities compare as n grows.</p>
          <div className="relative">
            <div className="h-3 rounded-full bg-slate-800 overflow-hidden mb-6">
              <div className="h-full w-full bg-gradient-to-r from-emerald-500 via-yellow-500 via-orange-500 to-red-700 rounded-full" />
            </div>
            <div className="flex flex-wrap gap-3">
              {COMPLEXITY_CLASSES.map((c) => (
                <div key={c.name} className="growth-pill group relative flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 hover:border-slate-600 transition-colors cursor-default">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: c.color }} />
                  <div>
                    <span className="text-white font-mono font-bold text-sm">{c.name}</span>
                    <span className="text-slate-500 text-xs ml-2">{c.label}</span>
                  </div>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 whitespace-nowrap shadow-xl">{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TIME COMPLEXITY TABLE ────────────────────────────────────── */}
      <section ref={complexityRef} className="max-w-7xl mx-auto px-6 mb-16 sm:mb-32">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-6">
            <Clock className="w-4 h-4" />
            Quick Reference
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Time &amp; Space Complexity</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Average-case complexities for common data structure operations. <span className="text-slate-500">(*) = amortized</span>
          </p>
        </div>
        <div className="complexity-table overflow-x-auto mb-8">
          <div className="inline-block min-w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800">
                  <th className="text-left px-5 py-4 text-slate-400 font-semibold text-sm">Data Structure</th>
                  <th className="px-5 py-4 text-slate-400 font-semibold text-sm">Access</th>
                  <th className="px-5 py-4 text-slate-400 font-semibold text-sm">Search</th>
                  <th className="px-5 py-4 text-slate-400 font-semibold text-sm">Insertion</th>
                  <th className="px-5 py-4 text-slate-400 font-semibold text-sm">Deletion</th>
                  <th className="px-5 py-4 text-slate-400 font-semibold text-sm">Space</th>
                </tr>
              </thead>
              <tbody>
                {COMPLEXITY_TABLE.map((row, i) => (
                  <tr key={row.ds} className={`border-b border-slate-800/50 ${i % 2 === 0 ? 'bg-slate-950/40' : 'bg-slate-900/30'} hover:bg-slate-800/40 transition-colors`}>
                    <td className="px-5 py-3.5 text-white font-semibold text-sm">{row.ds}</td>
                    <td className={`px-5 py-3.5 text-center font-mono text-sm ${complexityColor(row.access)}`}>{row.access}</td>
                    <td className={`px-5 py-3.5 text-center font-mono text-sm ${complexityColor(row.search)}`}>{row.search}</td>
                    <td className={`px-5 py-3.5 text-center font-mono text-sm ${complexityColor(row.insert)}`}>{row.insert}</td>
                    <td className={`px-5 py-3.5 text-center font-mono text-sm ${complexityColor(row.delete)}`}>{row.delete}</td>
                    <td className={`px-5 py-3.5 text-center font-mono text-sm ${complexityColor(row.space)}`}>{row.space}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="text-center mb-6">
          <button
            onClick={() => setShowSortingTable(!showSortingTable)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 rounded-xl text-slate-300 font-semibold transition-all hover:scale-105"
          >
            <Table2 className="w-4 h-4" />
            {showSortingTable ? 'Hide' : 'Show'} Sorting Algorithm Complexities
            {showSortingTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
        {showSortingTable && (
          <div className="complexity-table overflow-x-auto">
            <div className="inline-block min-w-full">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800">
                    <th className="text-left px-5 py-4 text-slate-400 font-semibold text-sm">Algorithm</th>
                    <th className="px-5 py-4 text-slate-400 font-semibold text-sm">Best</th>
                    <th className="px-5 py-4 text-slate-400 font-semibold text-sm">Average</th>
                    <th className="px-5 py-4 text-slate-400 font-semibold text-sm">Worst</th>
                    <th className="px-5 py-4 text-slate-400 font-semibold text-sm">Space</th>
                    <th className="px-5 py-4 text-slate-400 font-semibold text-sm">Stable</th>
                  </tr>
                </thead>
                <tbody>
                  {SORTING_COMPLEXITY.map((row, i) => (
                    <tr key={row.algo} className={`border-b border-slate-800/50 ${i % 2 === 0 ? 'bg-slate-950/40' : 'bg-slate-900/30'} hover:bg-slate-800/40 transition-colors`}>
                      <td className="px-5 py-3.5 text-white font-semibold text-sm">{row.algo}</td>
                      <td className={`px-5 py-3.5 text-center font-mono text-sm ${complexityColor(row.best)}`}>{row.best}</td>
                      <td className={`px-5 py-3.5 text-center font-mono text-sm ${complexityColor(row.avg)}`}>{row.avg}</td>
                      <td className={`px-5 py-3.5 text-center font-mono text-sm ${complexityColor(row.worst)}`}>{row.worst}</td>
                      <td className={`px-5 py-3.5 text-center font-mono text-sm ${complexityColor(row.space)}`}>{row.space}</td>
                      <td className="px-5 py-3.5 text-center text-sm">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${row.stable === 'Yes' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>{row.stable}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* ─── SPLINE 3D SCENE ──────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 mb-16 sm:mb-32">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Interactive 3D
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Explore in 3D</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Interact with the scene below — drag, scroll, and explore.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 backdrop-blur-sm overflow-hidden shadow-2xl h-[400px] sm:h-[500px] md:h-[580px] lg:h-[640px]">
          <Spline scene="https://prod.spline.design/1Ph2SwrkrFFqrKO1/scene.splinecode" className="w-full h-full" />
        </div>
      </section>

      {/* ─── HOW DS WORK — VISUAL EXPLAINER ───────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 mb-16 sm:mb-32">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-medium mb-6">
            <FunctionSquare className="w-4 h-4" />
            Under the Hood
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">How Data Structures Work</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            A quick visual breakdown of how the core data structures store and access data internally.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Array */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-white">Array &mdash; Contiguous Memory</h3>
            </div>
            <div className="flex gap-1 mb-3">
              {[10, 20, 30, 40, 50, 60, 70].map((v, i) => (
                <div key={i} className="flex-1 bg-cyan-500/15 border border-cyan-500/30 rounded-lg p-2 text-center">
                  <div className="text-cyan-400 font-mono font-bold text-sm">{v}</div>
                  <div className="text-slate-600 text-[10px] font-mono mt-1">[{i}]</div>
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-xs">Elements stored at consecutive memory addresses. Access any element in O(1) using its index.</p>
          </div>
          {/* Linked List */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <GitBranch className="w-5 h-5 text-violet-400" />
              <h3 className="text-lg font-bold text-white">Linked List &mdash; Pointer Chain</h3>
            </div>
            <div className="flex items-center gap-0 mb-3 overflow-x-auto">
              {['A', 'B', 'C', 'D', 'E'].map((v, i, arr) => (
                <div key={v} className="flex items-center shrink-0">
                  <div className="bg-violet-500/15 border border-violet-500/30 rounded-lg px-3 py-2 text-center min-w-[48px]">
                    <div className="text-violet-400 font-mono font-bold text-sm">{v}</div>
                    <div className="text-slate-600 text-[10px]">node</div>
                  </div>
                  {i < arr.length - 1 && <div className="text-violet-500/60 mx-1">&rarr;</div>}
                </div>
              ))}
              <div className="text-slate-600 text-xs ml-2 shrink-0">null</div>
            </div>
            <p className="text-slate-500 text-xs">Each node stores data and a pointer to the next node. O(1) insert/delete at known position.</p>
          </div>
          {/* Stack */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Layers className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">Stack &mdash; LIFO Principle</h3>
            </div>
            <div className="flex flex-col-reverse gap-1 mb-3">
              {['fn_main()', 'fn_sort()', 'fn_swap()', 'fn_compare()'].map((v, i) => (
                <div key={v} className={`bg-amber-500/15 border border-amber-500/30 rounded-lg px-4 py-2 text-center ${i === 3 ? 'ring-2 ring-amber-400/50' : ''}`}>
                  <span className="text-amber-400 font-mono text-sm">{v}</span>
                  {i === 3 && <span className="text-amber-300 text-[10px] ml-2">&larr; TOP</span>}
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-xs">Last-In, First-Out. Used in function call stacks, undo operations, expression evaluation.</p>
          </div>
          {/* Binary Tree */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <TreePine className="w-5 h-5 text-rose-400" />
              <h3 className="text-lg font-bold text-white">Binary Search Tree &mdash; Ordered Hierarchy</h3>
            </div>
            <div className="flex flex-col items-center gap-1 mb-3">
              <div className="bg-rose-500/15 border border-rose-500/30 rounded-full w-10 h-10 flex items-center justify-center">
                <span className="text-rose-400 font-mono font-bold text-sm">50</span>
              </div>
              <div className="flex items-center gap-16">
                <div className="bg-rose-500/15 border border-rose-500/30 rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="text-rose-400 font-mono font-bold text-sm">30</span>
                </div>
                <div className="bg-rose-500/15 border border-rose-500/30 rounded-full w-10 h-10 flex items-center justify-center">
                  <span className="text-rose-400 font-mono font-bold text-sm">70</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {[20, 40, 60, 80].map((v) => (
                  <div key={v} className="bg-rose-500/10 border border-rose-500/20 rounded-full w-9 h-9 flex items-center justify-center">
                    <span className="text-rose-400/70 font-mono text-xs">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-slate-500 text-xs">Left subtree &lt; Root &lt; Right subtree. Enables O(log n) search in balanced trees.</p>
          </div>
          {/* Hash Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Hash className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Hash Table &mdash; Key&rarr;Index Mapping</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                { key: '"name"', hash: 'h(k)\u21922', val: '"Alice"' },
                { key: '"age"', hash: 'h(k)\u21925', val: '25' },
                { key: '"city"', hash: 'h(k)\u21921', val: '"NYC"' },
                { key: '"role"', hash: 'h(k)\u21927', val: '"Dev"' },
              ].map(({ key, hash, val }) => (
                <div key={key} className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
                  <span className="text-emerald-300 font-mono text-xs">{key}</span>
                  <span className="text-slate-600 text-[10px]">{hash}</span>
                  <span className="text-slate-500">&rarr;</span>
                  <span className="text-emerald-400 font-mono text-xs">{val}</span>
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-xs">Hash function maps keys to array indices. O(1) average lookup, insert, and delete.</p>
          </div>
          {/* Graph */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Network className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">Graph &mdash; Vertex &amp; Edge Network</h3>
            </div>
            <div className="relative h-32 mb-3">
              <svg className="w-full h-full" viewBox="0 0 300 120">
                <line x1="50" y1="30" x2="150" y2="20" stroke="#818cf8" strokeWidth="1.5" opacity="0.5" />
                <line x1="50" y1="30" x2="100" y2="90" stroke="#818cf8" strokeWidth="1.5" opacity="0.5" />
                <line x1="150" y1="20" x2="250" y2="40" stroke="#818cf8" strokeWidth="1.5" opacity="0.5" />
                <line x1="150" y1="20" x2="100" y2="90" stroke="#818cf8" strokeWidth="1.5" opacity="0.5" />
                <line x1="100" y1="90" x2="200" y2="100" stroke="#818cf8" strokeWidth="1.5" opacity="0.5" />
                <line x1="250" y1="40" x2="200" y2="100" stroke="#818cf8" strokeWidth="1.5" opacity="0.5" />
                {[
                  { x: 50, y: 30, label: 'A' },
                  { x: 150, y: 20, label: 'B' },
                  { x: 250, y: 40, label: 'C' },
                  { x: 100, y: 90, label: 'D' },
                  { x: 200, y: 100, label: 'E' },
                ].map(({ x, y, label }) => (
                  <g key={label}>
                    <circle cx={x} cy={y} r="16" fill="#312e81" stroke="#818cf8" strokeWidth="1.5" />
                    <text x={x} y={y + 5} textAnchor="middle" fill="#a5b4fc" fontSize="12" fontWeight="bold" fontFamily="monospace">{label}</text>
                  </g>
                ))}
              </svg>
            </div>
            <p className="text-slate-500 text-xs">Vertices connected by edges. Can be directed/undirected, weighted/unweighted. BFS, DFS, Dijkstra.</p>
          </div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ─────────────────────────────────────────── */}
      <section ref={featuresRef} className="max-w-6xl mx-auto px-6 mb-16 sm:mb-32">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Why DSA Visualizer?</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">Everything you need to learn, practice, and master data structures &amp; algorithms.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { icon: Activity, title: 'Step-by-Step Animation', desc: 'Watch each operation unfold with auto-play or manual stepping. See exactly how pointers move, nodes appear, and structures change.', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
            { icon: Code2, title: 'Built-in Code Editor', desc: 'Write, run, and test code in C, Python, or JavaScript with our Monaco-powered editor. Syntax highlighting, auto-complete, and multiple themes.', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
            { icon: BookOpen, title: 'Curated Problems', desc: 'Practice with hand-picked DSA problems organized by topic and difficulty. Each comes with hints and solution approaches.', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
            { icon: Terminal, title: 'Code Playground', desc: 'Freely experiment in C, Python, or JavaScript without problem constraints. Perfect for quick testing, learning, and exploring ideas.', color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
          ].map(({ icon: FeatureIcon, title, desc, color }) => (
            <div key={title} className="feature-card bg-slate-900/60 border border-slate-800 rounded-2xl p-6 md:p-8 hover:border-slate-700 transition-all duration-300">
              <div className={`inline-flex p-3 rounded-xl border ${color} mb-5`}>
                <FeatureIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
              <p className="text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA FOOTER ───────────────────────────────────────────────── */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-violet-600/10 to-purple-600/10" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <Zap className="w-10 h-10 text-amber-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Ready to Start Learning?</h2>
          <p className="text-slate-400 text-lg mb-8">Jump into any visualizer and see algorithms in action. It&apos;s free, interactive, and runs right in your browser.</p>
          <Link to="/visualizer" className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 rounded-xl text-white font-bold text-lg shadow-2xl shadow-blue-500/25 transition-all duration-300 hover:scale-105">
            Get Started <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Activity className="w-4 h-4" />
            DSA Visualizer &mdash; Learn by seeing.
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-600">
            <Link to="/visualizer" className="hover:text-slate-300 transition-colors">Visualizers</Link>
            <Link to="/questions" className="hover:text-slate-300 transition-colors">Questions</Link>
            <Link to="/editor" className="hover:text-slate-300 transition-colors">Code Editor</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}