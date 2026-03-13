import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ─── ALGO META ────────────────────────────────────────────────────────────────
const ALGO_META = {
  bubble:    { name:"Bubble Sort",    short:"Bubble",    best:"O(n)",       avg:"O(n²)",      worst:"O(n²)",      space:"O(1)",      stable:true,  color:"#f59e0b", desc:"Repeatedly compares adjacent elements and swaps them if out of order. Each pass bubbles the largest unsorted element to the end.", pseudo:"for i = 0 to n-1:\n  for j = 0 to n-i-2:\n    if arr[j] > arr[j+1]:\n      swap(arr[j], arr[j+1])" },
  selection: { name:"Selection Sort", short:"Selection", best:"O(n²)",      avg:"O(n²)",      worst:"O(n²)",      space:"O(1)",      stable:false, color:"#8b5cf6", desc:"Finds the minimum element from the unsorted region and moves it to the beginning of the sorted region each pass.", pseudo:"for i = 0 to n-1:\n  minIdx = i\n  for j = i+1 to n:\n    if arr[j] < arr[minIdx]:\n      minIdx = j\n  swap(arr[i], arr[minIdx])" },
  insertion: { name:"Insertion Sort", short:"Insertion", best:"O(n)",       avg:"O(n²)",      worst:"O(n²)",      space:"O(1)",      stable:true,  color:"#06b6d4", desc:"Builds a sorted array one element at a time, inserting each new element into its correct position among previously sorted elements.", pseudo:"for i = 1 to n-1:\n  key = arr[i]\n  j = i - 1\n  while j >= 0 and arr[j] > key:\n    arr[j+1] = arr[j]\n    j = j - 1\n  arr[j+1] = key" },
  merge:     { name:"Merge Sort",     short:"Merge",     best:"O(n log n)", avg:"O(n log n)", worst:"O(n log n)", space:"O(n)",      stable:true,  color:"#10b981", desc:"Divide-and-conquer: splits the array in half, recursively sorts each half, then merges the sorted halves back together.", pseudo:"mergeSort(arr, l, r):\n  if l < r:\n    mid = (l+r)/2\n    mergeSort(arr, l, mid)\n    mergeSort(arr, mid+1, r)\n    merge(arr, l, mid, r)" },
  quick:     { name:"Quick Sort",     short:"Quick",     best:"O(n log n)", avg:"O(n log n)", worst:"O(n²)",      space:"O(log n)", stable:false, color:"#ef4444", desc:"Picks a pivot and partitions the array so elements less than pivot come before it. Recursively sorts sub-arrays.", pseudo:"quickSort(arr, low, high):\n  if low < high:\n    pi = partition(arr, low, high)\n    quickSort(arr, low, pi-1)\n    quickSort(arr, pi+1, high)" },
  heap:      { name:"Heap Sort",      short:"Heap",      best:"O(n log n)", avg:"O(n log n)", worst:"O(n log n)", space:"O(1)",      stable:false, color:"#f97316", desc:"Converts the array into a max-heap, then repeatedly extracts the maximum element and places it at the end, rebuilding the heap each time.", pseudo:"buildMaxHeap(arr)\nfor i = n-1 down to 1:\n  swap(arr[0], arr[i])\n  heapify(arr, 0, i)" },
};

const STATES = {
  DEFAULT:   { bar:"#1e3a5f", top:"#2563eb", label:"Unsorted"  },
  COMPARING: { bar:"#78350f", top:"#fbbf24", label:"Comparing" },
  SWAPPING:  { bar:"#7f1d1d", top:"#ef4444", label:"Swapping"  },
  SORTED:    { bar:"#064e3b", top:"#10b981", label:"Sorted"    },
  PIVOT:     { bar:"#4a1d96", top:"#a855f7", label:"Pivot"     },
  MIN:       { bar:"#1e1b4b", top:"#6366f1", label:"Minimum"   },
  KEY:       { bar:"#164e63", top:"#22d3ee", label:"Key"       },
  MERGING:   { bar:"#14532d", top:"#84cc16", label:"Merging"   },
};
const STATE_KEYS = Object.keys(STATES);

// ─── FRAME BUILDER ────────────────────────────────────────────────────────────
function buildFrames(algoKey, input) {
  const n = input.length;
  if (n === 0) return [];
  const frames = [];
  function push(arr, stateMap, msg, cmp, sw) {
    const colorIdxs = new Array(n).fill(0);
    for (const [idx, sk] of Object.entries(stateMap)) {
      const i = STATE_KEYS.indexOf(sk);
      if (i >= 0) colorIdxs[+idx] = i;
    }
    frames.push({ arr:[...arr], colorIdxs, msg, cmp, sw });
  }
  if (algoKey === "bubble") {
    const a=[...input]; let cmp=0,sw=0; const done=new Set();
    for (let i=0;i<n-1;i++) {
      let swapped=false;
      for (let j=0;j<n-i-1;j++) {
        cmp++; const m={}; done.forEach(k=>(m[k]="SORTED")); m[j]="COMPARING"; m[j+1]="COMPARING";
        push(a,m,`Compare [${j}]=${a[j]} vs [${j+1}]=${a[j+1]}`,cmp,sw);
        if (a[j]>a[j+1]) { sw++; [a[j],a[j+1]]=[a[j+1],a[j]]; const m2={}; done.forEach(k=>(m2[k]="SORTED")); m2[j]="SWAPPING"; m2[j+1]="SWAPPING"; push(a,m2,`Swap [${j}]=${a[j]} ↔ [${j+1}]=${a[j+1]}`,cmp,sw); swapped=true; }
      }
      done.add(n-1-i); if (!swapped) break;
    }
    const fm={}; for(let i=0;i<n;i++) fm[i]="SORTED"; push(a,fm,"Bubble Sort complete!",cmp,sw);
  } else if (algoKey === "selection") {
    const a=[...input]; let cmp=0,sw=0; const done=new Set();
    for (let i=0;i<n-1;i++) {
      let mi=i;
      for (let j=i+1;j<n;j++) { cmp++; const m={}; done.forEach(k=>(m[k]="SORTED")); m[i]="COMPARING"; m[mi]="MIN"; m[j]="COMPARING"; push(a,m,`Find min: [${j}]=${a[j]} vs min [${mi}]=${a[mi]}`,cmp,sw); if(a[j]<a[mi]) mi=j; }
      if (mi!==i) { sw++; [a[i],a[mi]]=[a[mi],a[i]]; const m2={}; done.forEach(k=>(m2[k]="SORTED")); m2[i]="SWAPPING"; m2[mi]="SWAPPING"; push(a,m2,`Swap min to position [${i}]`,cmp,sw); }
      done.add(i);
    }
    const fm={}; for(let i=0;i<n;i++) fm[i]="SORTED"; push(a,fm,"Selection Sort complete!",cmp,sw);
  } else if (algoKey === "insertion") {
    const a=[...input]; let cmp=0,sw=0;
    for (let i=1;i<n;i++) {
      const key=a[i]; let j=i-1; push(a,{[i]:"KEY"},`Pick key=[${i}]=${key}`,cmp,sw);
      while (j>=0&&a[j]>key) { cmp++; sw++; a[j+1]=a[j]; push(a,{[j]:"COMPARING",[j+1]:"SWAPPING"},`Shift [${j}]=${a[j]} right`,cmp,sw); j--; }
      cmp++; a[j+1]=key; push(a,{[j+1]:"KEY"},`Insert key=${key} at [${j+1}]`,cmp,sw);
    }
    const fm={}; for(let i=0;i<n;i++) fm[i]="SORTED"; push(a,fm,"Insertion Sort complete!",cmp,sw);
  } else if (algoKey === "merge") {
    const a=[...input]; let cmp=0,sw=0;
    function merge(l,mid,r) {
      const left=a.slice(l,mid+1),right=a.slice(mid+1,r+1); let i=0,j=0,k=l;
      while(i<left.length&&j<right.length) { cmp++; const m={}; for(let x=l;x<=r;x++) m[x]="MERGING"; m[k]="COMPARING"; push(a,m,`Merge: ${left[i]} vs ${right[j]}`,cmp,sw); if(left[i]<=right[j]) a[k++]=left[i++]; else { a[k++]=right[j++]; sw++; } }
      while(i<left.length) a[k++]=left[i++]; while(j<right.length) a[k++]=right[j++];
      const sm={}; for(let x=l;x<=r;x++) sm[x]="SORTED"; push(a,sm,`Merged [${l}..${r}]`,cmp,sw);
    }
    function ms(l,r) {
      if(l>=r) return; const mid=(l+r)>>1;
      const m={}; for(let x=l;x<=mid;x++) m[x]="COMPARING"; for(let x=mid+1;x<=r;x++) m[x]="MERGING";
      push(a,m,`Split [${l}..${r}] → [${l}..${mid}] & [${mid+1}..${r}]`,cmp,sw);
      ms(l,mid); ms(mid+1,r); merge(l,mid,r);
    }
    ms(0,n-1);
    const fm={}; for(let i=0;i<n;i++) fm[i]="SORTED"; push(a,fm,"Merge Sort complete!",cmp,sw);
  } else if (algoKey === "quick") {
    const a=[...input]; let cmp=0,sw=0; const done=new Set();
    function partition(lo,hi) {
      const pivot=a[hi]; let i=lo-1;
      for(let j=lo;j<hi;j++) { cmp++; const m={}; done.forEach(k=>(m[k]="SORTED")); m[hi]="PIVOT"; m[j]="COMPARING"; push(a,m,`Pivot=${pivot}, check [${j}]=${a[j]}`,cmp,sw); if(a[j]<pivot) { i++; sw++; [a[i],a[j]]=[a[j],a[i]]; const m2={}; done.forEach(k=>(m2[k]="SORTED")); m2[hi]="PIVOT"; m2[i]="SWAPPING"; m2[j]="SWAPPING"; push(a,m2,`Swap [${i}]↔[${j}]`,cmp,sw); } }
      sw++; [a[i+1],a[hi]]=[a[hi],a[i+1]]; return i+1;
    }
    function qs(lo,hi) {
      if(lo<hi) { const pi=partition(lo,hi); done.add(pi); const sm={}; done.forEach(k=>(sm[k]="SORTED")); push(a,sm,`Pivot ${a[pi]} placed at [${pi}]`,cmp,sw); qs(lo,pi-1); qs(pi+1,hi); } else if(lo===hi) done.add(lo);
    }
    qs(0,n-1); const fm={}; for(let i=0;i<n;i++) fm[i]="SORTED"; push(a,fm,"Quick Sort complete!",cmp,sw);
  } else if (algoKey === "heap") {
    const a=[...input]; let cmp=0,sw=0; const done=new Set();
    function heapify(size,root) {
      let lg=root; const l=2*root+1,r=2*root+2; cmp++;
      const m={}; done.forEach(k=>(m[k]="SORTED")); m[root]="PIVOT";
      if(l<size) m[l]="COMPARING"; if(r<size) m[r]="COMPARING";
      push(a,m,`Heapify root=${a[root]}`,cmp,sw);
      if(l<size&&a[l]>a[lg]) lg=l; if(r<size&&a[r]>a[lg]) { cmp++; lg=r; }
      if(lg!==root) { sw++; [a[root],a[lg]]=[a[lg],a[root]]; const m2={}; done.forEach(k=>(m2[k]="SORTED")); m2[root]="SWAPPING"; m2[lg]="SWAPPING"; push(a,m2,`Swap [${root}]↔[${lg}]`,cmp,sw); heapify(size,lg); }
    }
    for(let i=Math.floor(n/2)-1;i>=0;i--) heapify(n,i);
    push(a,{},"Max-heap built! Extracting...",cmp,sw);
    for(let i=n-1;i>0;i--) { sw++; [a[0],a[i]]=[a[i],a[0]]; done.add(i); const sm={}; done.forEach(k=>(sm[k]="SORTED")); sm[0]="SWAPPING"; push(a,sm,`Extract max ${a[i]} → pos ${i}`,cmp,sw); heapify(i,0); }
    const fm={}; for(let i=0;i<n;i++) fm[i]="SORTED"; push(a,fm,"Heap Sort complete!",cmp,sw);
  }
  return frames;
}

function genArray(size, max) {
  return Array.from({length:size}, () => Math.floor(Math.random()*max)+1);
}

// ─── SORT PANEL ───────────────────────────────────────────────────────────────
function SortPanel({ algoKey, inputArray, speed, isCompareMode, globalPlaying, onMetricsUpdate, onDone, triggerPlay }) {
  const meta = ALGO_META[algoKey];
  const framesRef  = useRef([]);
  const timerRef   = useRef(null);
  const idxRef     = useRef(0);
  const playingRef = useRef(false);
  const t0Ref      = useRef(null);
  const speedRef   = useRef(speed);

  const [visArr,    setVisArr]    = useState([...inputArray]);
  const [visColors, setVisColors] = useState(() => new Array(inputArray.length).fill(0));
  const [msg,       setMsg]       = useState("Ready — press Play");
  const [cmp,       setCmp]       = useState(0);
  const [sw,        setSw]        = useState(0);
  const [elapsed,   setElapsed]   = useState("0.00");
  const [progress,  setProgress]  = useState(0);
  const [uiPlaying, setUiPlaying] = useState(false);
  const [uiDone,    setUiDone]    = useState(false);

  useEffect(() => { speedRef.current = speed; }, [speed]);

  function clearTimer() {
    if (timerRef.current !== null) { clearTimeout(timerRef.current); timerRef.current = null; }
  }

  useEffect(() => {
    clearTimer(); playingRef.current = false; idxRef.current = 0;
    framesRef.current = buildFrames(algoKey, inputArray);
    setVisArr([...inputArray]); setVisColors(new Array(inputArray.length).fill(0));
    setMsg("Ready — press Play"); setCmp(0); setSw(0); setElapsed("0.00"); setProgress(0);
    setUiPlaying(false); setUiDone(false);
  }, [inputArray, algoKey]); // eslint-disable-line

  const tick = useCallback(() => {
    timerRef.current = null;
    const frames = framesRef.current, idx = idxRef.current;
    if (!playingRef.current || idx >= frames.length) {
      if (idx >= frames.length) { playingRef.current = false; setUiPlaying(false); setUiDone(true); onDone && onDone(); }
      return;
    }
    const f = frames[idx]; idxRef.current = idx + 1;
    setVisArr(f.arr); setVisColors(f.colorIdxs); setMsg(f.msg); setCmp(f.cmp); setSw(f.sw);
    const t = t0Ref.current ? ((Date.now() - t0Ref.current) / 1000).toFixed(2) : "0.00";
    setElapsed(t); setProgress(framesRef.current.length > 0 ? idxRef.current / framesRef.current.length : 0);
    onMetricsUpdate && onMetricsUpdate({ comparisons: f.cmp, swaps: f.sw, time: t });
    if (playingRef.current) timerRef.current = setTimeout(tick, Math.max(8, Math.round(700 / (speedRef.current * 30))));
  }, [onDone, onMetricsUpdate]);

  const startPlay = useCallback(() => {
    if (idxRef.current >= framesRef.current.length) {
      idxRef.current = 0;
      setVisArr([...inputArray]); setVisColors(new Array(inputArray.length).fill(0));
      setCmp(0); setSw(0); setElapsed("0.00"); setProgress(0); setUiDone(false);
    }
    t0Ref.current = Date.now(); playingRef.current = true; setUiPlaying(true); clearTimer();
    timerRef.current = setTimeout(tick, Math.max(8, Math.round(700 / (speedRef.current * 30))));
  }, [inputArray, tick]);

  function pausePlay() { clearTimer(); playingRef.current = false; setUiPlaying(false); }
  function handlePlayPause() { if (uiDone) startPlay(); else if (uiPlaying) pausePlay(); else startPlay(); }

  // triggerPlay: bumped from parent when user clicks "▶ Sort Now"
  const prevTrigger = useRef(0);
  useEffect(() => {
    if (!triggerPlay || triggerPlay === prevTrigger.current) return;
    prevTrigger.current = triggerPlay;
    startPlay();
  }, [triggerPlay, startPlay]);

  // Compare mode global play
  const prevGlobal = useRef(undefined);
  useEffect(() => {
    if (globalPlaying === undefined) return;
    if (globalPlaying === prevGlobal.current) return;
    prevGlobal.current = globalPlaying;
    if (globalPlaying) startPlay(); else pausePlay();
  });

  useEffect(() => () => clearTimer(), []);
  const maxVal = useMemo(() => Math.max(...visArr, 1), [visArr]);

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100%", minHeight:0 }}>
      <div style={{ flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 14px", background:"#07101e", borderBottom:"1px solid #0a1525" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:meta.color, boxShadow:`0 0 8px ${meta.color}` }} />
          <span style={{ fontWeight:700, fontSize:12, color:"#f1f5f9" }}>{meta.name}</span>
          {uiDone && <span style={{ fontSize:8, padding:"1px 7px", background:"rgba(16,185,129,0.1)", border:"1px solid #10b981", borderRadius:999, color:"#34d399", letterSpacing:1 }}>DONE</span>}
        </div>
        {!isCompareMode && (
          <button onClick={handlePlayPause}
            style={{ padding:"4px 13px", borderRadius:5, border:`1px solid ${uiPlaying?"#450a0a":"#0f2040"}`, background:uiPlaying?"#2d0808":"#0a1c38", color:uiPlaying?"#fca5a5":"#93c5fd", fontSize:10, fontWeight:700, cursor:"pointer" }}>
            {uiDone?"↺ Restart":uiPlaying?"⏸ Pause":idxRef.current>0?"▶ Resume":"▶ Play"}
          </button>
        )}
      </div>
      <div style={{ flex:1, position:"relative", overflow:"hidden", background:"radial-gradient(ellipse at 50% 100%, #0c1d30 0%, #050d18 100%)", minHeight:0 }}>
        {[25,50,75].map(p=><div key={p} style={{ position:"absolute", bottom:`${p}%`, left:0, right:0, height:1, background:"rgba(255,255,255,0.035)", pointerEvents:"none" }} />)}
        <div style={{ position:"absolute", inset:"0 6px 0 6px", display:"flex", alignItems:"flex-end", gap:1 }}>
          {visArr.map((val,i)=>{
            const sk=STATE_KEYS[visColors[i]]||"DEFAULT", col=STATES[sk]||STATES.DEFAULT;
            const hp=Math.max(0.5,(val/maxVal)*95);
            return (
              <div key={i} style={{ flex:1, minWidth:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"flex-end", height:"100%" }}>
                {visArr.length<=20&&<span style={{ fontSize:7, color:col.top, marginBottom:1, opacity:0.85, fontFamily:"monospace", lineHeight:1 }}>{val}</span>}
                <div style={{ width:"100%", height:`${hp}%`, minHeight:2, background:`linear-gradient(to top,${col.bar} 0%,${col.top} 100%)`, borderRadius:"2px 2px 0 0", boxShadow:sk!=="DEFAULT"?`0 0 5px ${col.top}60`:"none", transition:"background 0.06s" }} />
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ flexShrink:0, padding:"4px 12px", background:"#06101c", borderTop:"1px solid #0a1525", fontSize:10, color:"#94a3b8", display:"flex", alignItems:"center", gap:5, minHeight:22, fontFamily:"monospace" }}>
        <span style={{ color:meta.color, flexShrink:0 }}>▸</span>
        <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{msg}</span>
      </div>
      <div style={{ flexShrink:0, display:"flex", borderTop:"1px solid #0a1525" }}>
        {[["Comparisons",cmp,"#fbbf24"],["Swaps",sw,"#f87171"],["Time (s)",elapsed,"#34d399"]].map(([label,val,color])=>(
          <div key={label} style={{ flex:1, padding:"4px 0", textAlign:"center", borderRight:"1px solid #0a1525" }}>
            <div style={{ fontSize:7, color:"#1e3a5f", textTransform:"uppercase", letterSpacing:1 }}>{label}</div>
            <div style={{ fontSize:13, fontWeight:700, color, fontFamily:"monospace" }}>{val}</div>
          </div>
        ))}
        <div style={{ flex:1, padding:"4px 8px", display:"flex", flexDirection:"column", justifyContent:"center", gap:2 }}>
          <div style={{ fontSize:7, color:"#1e3a5f", textTransform:"uppercase", letterSpacing:1 }}>Progress</div>
          <div style={{ height:4, background:"#040912", borderRadius:2, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${progress*100}%`, background:meta.color, borderRadius:2, transition:"width 0.12s" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PSEUDOCODE ───────────────────────────────────────────────────────────────
function PseudoCode({ code }) {
  return (
    <pre style={{ margin:0, padding:"10px 12px", background:"#030910", borderRadius:8, border:"1px solid #0a1525", fontSize:10, lineHeight:1.9, overflowX:"auto" }}>
      {code.split("\n").map((line,i)=>{
        const trimmed=line.trim(), indent=line.length-line.trimStart().length;
        const isKw=/^(for|while|if|swap|merge|build|extract|heapify|partition|mergeSort|quickSort)/i.test(trimmed);
        return <div key={i} style={{ paddingLeft:indent*10, color:isKw?"#c084fc":trimmed.includes("=")?"#fbbf24":"#7dd3fc", fontFamily:"'Fira Code',monospace" }}>{trimmed||"\u00a0"}</div>;
      })}
    </pre>
  );
}

// ─── COMPARE METRICS ─────────────────────────────────────────────────────────
function CompareMetrics({ a1, a2, m1, m2 }) {
  const rows=[["Comparisons","comparisons","#fbbf24"],["Swaps","swaps","#f87171"],["Time (s)","time","#34d399"]];
  return (
    <div style={{ background:"#050c19", borderTop:"2px solid #0a1525" }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr" }}>
        <div style={{ padding:"6px 12px", borderRight:"1px solid #0a1525", textAlign:"right" }}><span style={{ fontSize:11, fontWeight:700, color:ALGO_META[a1].color }}>{ALGO_META[a1].short}</span></div>
        <div style={{ padding:"6px 16px", textAlign:"center", fontSize:9, color:"#1e3a5f", letterSpacing:2, borderRight:"1px solid #0a1525", display:"flex", alignItems:"center" }}>VS</div>
        <div style={{ padding:"6px 12px" }}><span style={{ fontSize:11, fontWeight:700, color:ALGO_META[a2].color }}>{ALGO_META[a2].short}</span></div>
        {rows.map(([label,key,col])=>{
          const v1=parseFloat(m1[key]||0),v2=parseFloat(m2[key]||0);
          return [
            <div key={`a-${key}`} style={{ padding:"3px 12px", borderTop:"1px solid #0a1525", borderRight:"1px solid #0a1525", textAlign:"right" }}><span style={{ fontFamily:"monospace", fontSize:13, fontWeight:700, color:v1<=v2?col:"#1e3a5f" }}>{m1[key]||0}</span></div>,
            <div key={`b-${key}`} style={{ padding:"3px 0", borderTop:"1px solid #0a1525", borderRight:"1px solid #0a1525", textAlign:"center", fontSize:8, color:"#1e293b", textTransform:"uppercase", letterSpacing:1, display:"flex", alignItems:"center", justifyContent:"center" }}>{label}</div>,
            <div key={`c-${key}`} style={{ padding:"3px 12px", borderTop:"1px solid #0a1525" }}><span style={{ fontFamily:"monospace", fontSize:13, fontWeight:700, color:v2<=v1?col:"#1e3a5f" }}>{m2[key]||0}</span></div>,
          ];
        })}
      </div>
    </div>
  );
}

// ─── PARSE HELPER ─────────────────────────────────────────────────────────────
function parseRaw(raw) {
  if (!raw.trim()) return { nums:[], error:"" };
  const parts = raw.split(/[\s,;|]+/).filter(Boolean);
  const nums = parts.map(p=>parseInt(p,10));
  if (nums.some(isNaN))          return { nums:[], error:"Only whole numbers — separate with commas or spaces." };
  if (nums.length < 2)           return { nums:[], error:"Enter at least 2 values." };
  if (nums.length > 200)         return { nums:[], error:`Too many values (${nums.length}). Max 200.` };
  if (nums.some(n=>n<1||n>9999)) return { nums:[], error:"Values must be between 1 and 9999." };
  return { nums, error:"" };
}

const PRESETS = [
  { label:"Nearly Sorted", icon:"↑↑", fn:(n)=>Array.from({length:n},(_,i)=>i+1).map((v,i,a)=>Math.random()<0.1?a[Math.floor(Math.random()*a.length)]:v) },
  { label:"Reversed",      icon:"↓↓", fn:(n)=>Array.from({length:n},(_,i)=>n-i) },
  { label:"All Same",      icon:"==", fn:(n)=>Array(n).fill(50) },
  { label:"V-Shape",       icon:"∨",  fn:(n)=>Array.from({length:n},(_,i)=>i<n/2?n-i*2:i*2-n+2).map(v=>Math.max(1,v)) },
  { label:"Sawtooth",      icon:"∿",  fn:(n)=>Array.from({length:n},(_,i)=>((i%10)+1)*20) },
];

// ─── INLINE ARRAY INPUT BAR ───────────────────────────────────────────────────
function ArrayInputBar({ currentArray, selectedAlgo, onApply, onApplyAndSort }) {
  const [raw,        setRaw]        = useState("");
  const [parsedNums, setParsedNums] = useState([]);
  const [parseError, setParseError] = useState("");
  const [genSize,    setGenSize]    = useState(30);
  const [genMax,     setGenMax]     = useState(200);
  const [expanded,   setExpanded]   = useState(false);
  const inputRef = useRef(null);
  const meta = ALGO_META[selectedAlgo];

  function handleRawChange(v) {
    setRaw(v);
    if (!v.trim()) { setParsedNums([]); setParseError(""); return; }
    const { nums, error } = parseRaw(v);
    setParseError(error); setParsedNums(error ? [] : nums);
  }

  function handleLoad() {
    if (parsedNums.length >= 2) { onApply(parsedNums); setRaw(""); setParsedNums([]); setParseError(""); }
  }

  function handleSortNow() {
    const arr = parsedNums.length >= 2 ? parsedNums : currentArray;
    if (arr.length >= 2) onApplyAndSort(arr);
  }

  function handleGenerate() {
    const arr = genArray(genSize, genMax);
    onApply(arr); setRaw(""); setParsedNums([]); setParseError("");
  }

  function applyPreset(fn) {
    const arr = fn(genSize).map(v=>Math.max(1,Math.min(9999,Math.round(v))));
    onApply(arr); setRaw(""); setParsedNums([]); setParseError("");
  }

  const displayArr = parsedNums.length >= 2 ? parsedNums : currentArray;
  const displayMax = Math.max(...displayArr, 1);
  const valid = parsedNums.length >= 2;
  const canSort = displayArr.length >= 2;

  return (
    <div style={{ flexShrink:0, background:"#060e1b", borderBottom:"2px solid #0a1525" }}>

      {/* ── MAIN ROW ── */}
      <div style={{ display:"flex", alignItems:"stretch", minHeight:56 }}>

        {/* Label */}
        <div style={{ flexShrink:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"0 14px", background:"#030a14", borderRight:"1px solid #0a1525", minWidth:80 }}>
          <div style={{ fontSize:8, color:"#1e3a5f", textTransform:"uppercase", letterSpacing:2, marginBottom:2 }}>Array</div>
          <div style={{ fontSize:10, color:"#334155", fontFamily:"monospace", fontWeight:700 }}>{displayArr.length}</div>
          <div style={{ fontSize:7, color:"#0f1e30" }}>elements</div>
        </div>

        {/* Text input area */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"8px 12px", borderRight:"1px solid #0a1525" }}>
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            <div style={{ position:"relative", flex:1 }}>
              <input
                ref={inputRef}
                value={raw}
                onChange={e=>handleRawChange(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter"){ e.preventDefault(); handleSortNow(); } }}
                placeholder="✏  Type values: 64, 34, 25, 12, 22, 11, 90 ...  then press Enter or ▶ Sort"
                style={{ width:"100%", padding:"10px 34px 10px 12px", background:"#030910", border:`1.5px solid ${parseError?"#7f1d1d":valid?"#064e3b":"#0f1e30"}`, borderRadius:8, color:"#e2e8f0", fontSize:12, fontFamily:"'Fira Code',monospace", outline:"none", boxSizing:"border-box", transition:"border-color 0.15s" }}
              />
              {raw && (
                <button onClick={()=>{ setRaw(""); setParsedNums([]); setParseError(""); inputRef.current?.focus(); }}
                  style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#334155", cursor:"pointer", fontSize:14, lineHeight:1, padding:2 }}>✕</button>
              )}
            </div>
            {valid && (
              <button onClick={handleLoad}
                style={{ flexShrink:0, padding:"9px 14px", background:"#071a0b", border:"1.5px solid #16a34a", borderRadius:8, color:"#4ade80", fontSize:10, fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}
                onMouseEnter={e=>{e.currentTarget.style.background="#0d2e14";}}
                onMouseLeave={e=>{e.currentTarget.style.background="#071a0b";}}>
                ✓ Load
              </button>
            )}
          </div>
          <div style={{ marginTop:4, fontSize:9, minHeight:13 }}>
            {parseError
              ? <span style={{ color:"#f87171" }}>⚠ {parseError}</span>
              : valid
                ? <span style={{ color:"#4ade80" }}>✓ {parsedNums.length} values · min {Math.min(...parsedNums)} · max {Math.max(...parsedNums)} · avg {(parsedNums.reduce((a,b)=>a+b,0)/parsedNums.length).toFixed(1)} — press <kbd style={{ background:"#0a1628", border:"1px solid #1e3a5f", borderRadius:3, padding:"0 4px", fontSize:8, color:"#60a5fa" }}>Enter</kbd> to sort instantly</span>
                : <span style={{ color:"#1e3a5f" }}>Comma or space separated · max 200 values · range 1–9999 · press Enter to sort</span>
            }
          </div>
        </div>

        {/* Mini bar preview */}
        <div style={{ flexShrink:0, display:"flex", alignItems:"flex-end", gap:0.5, padding:"6px 8px 0", background:"#030910", borderRight:"1px solid #0a1525", minWidth:84, overflow:"hidden" }}>
          {displayArr.slice(0,50).map((v,i)=>{
            const hp=Math.max(2,(v/displayMax)*100);
            return <div key={i} style={{ flex:1, height:`${hp}%`, minWidth:1, background:`linear-gradient(to top,#1e3a5f,${valid?"#22c55e":"#3b82f6"})`, borderRadius:"1px 1px 0 0" }} />;
          })}
        </div>

        {/* ▶ SORT NOW */}
        <button
          onClick={handleSortNow}
          disabled={!canSort}
          style={{ flexShrink:0, width:80, background:canSort?`${meta.color}1a`:"#030910", border:"none", borderLeft:`2px solid ${canSort?meta.color+"60":"#0a1525"}`, color:canSort?meta.color:"#1e3a5f", fontSize:11, fontWeight:800, cursor:canSort?"pointer":"not-allowed", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:3, transition:"all .15s", letterSpacing:.3 }}
          onMouseEnter={e=>{ if(canSort) e.currentTarget.style.background=`${meta.color}30`; }}
          onMouseLeave={e=>{ if(canSort) e.currentTarget.style.background=`${meta.color}1a`; }}
        >
          <span style={{ fontSize:20, lineHeight:1 }}>▶</span>
          <span style={{ fontSize:8, letterSpacing:1 }}>SORT NOW</span>
        </button>

        {/* ▼ Expand */}
        <button
          onClick={()=>setExpanded(e=>!e)}
          style={{ flexShrink:0, width:36, background:"#030910", border:"none", borderLeft:"1px solid #0a1525", color:expanded?"#60a5fa":"#1e3a5f", fontSize:14, cursor:"pointer", transition:"color .15s" }}
          title={expanded?"Collapse":"Expand generator & presets"}>
          {expanded?"▲":"▼"}
        </button>
      </div>

      {/* ── EXPANDED SECTION ── */}
      {expanded && (
        <div style={{ display:"flex", alignItems:"center", gap:14, padding:"10px 14px", borderTop:"1px solid #0a1525", flexWrap:"wrap", background:"#040c17" }}>

          {/* Size + Max */}
          {[["Size",genSize,setGenSize,4,120,"#3b82f6"],["Max Val",genMax,setGenMax,10,500,"#8b5cf6"]].map(([lbl,val,setter,mn,mx,col])=>(
            <div key={lbl} style={{ display:"flex", flexDirection:"column", gap:2, minWidth:110 }}>
              <span style={{ fontSize:8, color:"#334155", textTransform:"uppercase", letterSpacing:1 }}>{lbl}: <span style={{ color:col, fontWeight:700 }}>{val}</span></span>
              <input type="range" min={mn} max={mx} value={val} onChange={e=>setter(+e.target.value)} style={{ accentColor:col, width:110 }} />
            </div>
          ))}

          <button onClick={handleGenerate}
            style={{ padding:"7px 16px", background:"#0a1628", border:"1.5px solid #1e3a5f60", borderRadius:7, color:"#60a5fa", fontSize:10, fontWeight:700, cursor:"pointer", transition:"all .15s" }}
            onMouseEnter={e=>{e.currentTarget.style.background="#0f2040";e.currentTarget.style.borderColor="#3b82f6";}}
            onMouseLeave={e=>{e.currentTarget.style.background="#0a1628";e.currentTarget.style.borderColor="#1e3a5f60";}}>
            ⊞ Random
          </button>

          <div style={{ width:1, height:28, background:"#0a1525", flexShrink:0 }} />

          <div style={{ display:"flex", gap:5, flexWrap:"wrap", alignItems:"center" }}>
            <span style={{ fontSize:8, color:"#1e3a5f", textTransform:"uppercase", letterSpacing:1, flexShrink:0 }}>Presets:</span>
            {PRESETS.map(({label,icon,fn})=>(
              <button key={label} onClick={()=>applyPreset(fn)}
                style={{ padding:"5px 10px", background:"#050d1a", border:"1px solid #0a1525", borderRadius:5, color:"#334155", fontSize:9, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:4, transition:"all .12s" }}
                onMouseEnter={e=>{e.currentTarget.style.background="#0a1628";e.currentTarget.style.borderColor="#3b82f680";e.currentTarget.style.color="#93c5fd";}}
                onMouseLeave={e=>{e.currentTarget.style.background="#050d1a";e.currentTarget.style.borderColor="#0a1525";e.currentTarget.style.color="#334155";}}>
                <span style={{ fontFamily:"monospace" }}>{icon}</span>{label}
              </button>
            ))}
          </div>

          <div style={{ width:1, height:28, background:"#0a1525", flexShrink:0 }} />

          <div style={{ display:"flex", gap:5 }}>
            {[["⟳ Shuffle",()=>onApply([...currentArray].sort(()=>Math.random()-0.5)),"#172417","#4ade80"],
              ["↑ Asc",    ()=>onApply([...currentArray].sort((a,b)=>a-b)),           "#0d1a30","#60a5fa"],
              ["↓ Desc",   ()=>onApply([...currentArray].sort((a,b)=>b-a)),           "#0d1a30","#818cf8"]].map(([lbl,fn,bg,col])=>(
              <button key={lbl} onClick={fn}
                style={{ padding:"5px 10px", background:bg, border:`1px solid ${col}40`, borderRadius:5, color:col, fontSize:9, fontWeight:600, cursor:"pointer", transition:"all .12s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=col;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=col+"40";}}>
                {lbl}
              </button>
            ))}
          </div>

          <button onClick={()=>document.dispatchEvent(new CustomEvent("openArrayEditor"))}
            style={{ marginLeft:"auto", padding:"6px 13px", background:"#0e1a10", border:"1.5px solid #22c55e60", borderRadius:7, color:"#4ade80", fontSize:9, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}
            onMouseEnter={e=>{e.currentTarget.style.background="#142214";e.currentTarget.style.borderColor="#22c55e";}}
            onMouseLeave={e=>{e.currentTarget.style.background="#0e1a10";e.currentTarget.style.borderColor="#22c55e60";}}>
            ✎ Full Editor
          </button>
        </div>
      )}
    </div>
  );
}

// ─── ARRAY EDITOR MODAL ───────────────────────────────────────────────────────
function ArrayEditor({ sourceArray, onApply, onClose }) {
  const [raw,        setRaw]        = useState(sourceArray.join(", "));
  const [cells,      setCells]      = useState([...sourceArray]);
  const [editIdx,    setEditIdx]    = useState(null);
  const [editVal,    setEditVal]    = useState("");
  const [presetN,    setPresetN]    = useState(12);
  const [parseError, setParseError] = useState("");
  const inputRef = useRef(null);

  function handleRawChange(v) {
    setRaw(v);
    const { nums, error } = parseRaw(v);
    setParseError(error);
    if (!error && nums.length >= 2) setCells(nums);
  }
  function applyPreset(fn) {
    const arr=fn(presetN).map(v=>Math.max(1,Math.min(9999,Math.round(v))));
    setCells(arr); setRaw(arr.join(", ")); setParseError(""); setEditIdx(null);
  }
  function startEdit(i) { setEditIdx(i); setEditVal(String(cells[i])); }
  function commitEdit(i) {
    const n=parseInt(editVal,10);
    if (!isNaN(n)&&n>=1&&n<=9999) { const next=[...cells]; next[i]=n; setCells(next); setRaw(next.join(", ")); }
    setEditIdx(null); setEditVal("");
  }
  function removeCell(i) {
    if (cells.length<=2) return;
    const next=cells.filter((_,j)=>j!==i); setCells(next); setRaw(next.join(", ")); setEditIdx(null);
  }
  function addCell(val) {
    if (cells.length>=200) return;
    const next=[...cells, val??Math.floor(Math.random()*100)+1]; setCells(next); setRaw(next.join(", "));
  }
  const canApply = cells.length>=2&&!parseError;
  const maxVal   = Math.max(...cells, 1);

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(6px)" }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ width:780, maxWidth:"96vw", maxHeight:"92vh", background:"#06101d", border:"1px solid #1e3a5f", borderRadius:16, display:"flex", flexDirection:"column", overflow:"hidden", boxShadow:"0 0 80px rgba(59,130,246,0.18),0 30px 60px rgba(0,0,0,0.6)" }}>
        <div style={{ flexShrink:0, padding:"13px 20px", borderBottom:"1px solid #0a1525", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:9, height:9, borderRadius:"50%", background:"#3b82f6", boxShadow:"0 0 10px #3b82f6" }} />
            <span style={{ fontWeight:700, fontSize:15, color:"#f1f5f9" }}>Array Editor</span>
            <span style={{ fontSize:9, padding:"2px 9px", background:"rgba(59,130,246,0.1)", border:"1px solid #1e3a5f40", borderRadius:999, color:"#60a5fa", letterSpacing:1 }}>{cells.length} element{cells.length!==1?"s":""}</span>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"#475569", fontSize:20, cursor:"pointer", lineHeight:1, padding:"0 4px" }}>✕</button>
        </div>
        <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column" }}>
          <div style={{ flexShrink:0, height:72, display:"flex", alignItems:"flex-end", gap:1, background:"#030910", borderBottom:"1px solid #0a1525", padding:"6px 12px 0", position:"relative" }}>
            {cells.map((v,i)=>{ const hp=Math.max(2,(v/maxVal)*100),isE=editIdx===i; return <div key={i} onClick={()=>startEdit(i)} style={{ flex:1, minWidth:1, height:`${hp}%`, background:isE?"#22d3ee":`linear-gradient(to top,#1e3a5f,#3b82f6)`, borderRadius:"2px 2px 0 0", cursor:"pointer", transition:"height 0.1s,background 0.1s", opacity:isE?1:0.85 }} title={`[${i}]=${v}`} />; })}
            <div style={{ position:"absolute", top:6, right:12, fontSize:8, color:"#1e3a5f", letterSpacing:2, textTransform:"uppercase" }}>Live Preview · Click bar to edit</div>
          </div>
          <div style={{ display:"flex", flex:1, minHeight:0 }}>
            <div style={{ flex:1, display:"flex", flexDirection:"column", borderRight:"1px solid #0a1525", overflow:"hidden" }}>
              <div style={{ flexShrink:0, padding:"12px 14px 10px", borderBottom:"1px solid #0a1525" }}>
                <div style={{ fontSize:8, color:"#334155", textTransform:"uppercase", letterSpacing:2, marginBottom:6 }}>Type or paste values <span style={{ textTransform:"none", letterSpacing:0, color:"#1e3a5f" }}>· commas/spaces · max 200 · range 1–9999</span></div>
                <div style={{ position:"relative" }}>
                  <input ref={inputRef} value={raw} onChange={e=>handleRawChange(e.target.value)}
                    onKeyDown={e=>{ if(e.key==="Enter"&&canApply){onApply(cells);onClose();} }}
                    placeholder="e.g.  64, 34, 25, 12, 22, 11, 90"
                    style={{ width:"100%", padding:"9px 36px 9px 12px", background:"#030910", border:`1.5px solid ${parseError?"#ef4444":canApply?"#22c55e40":"#1e3a5f"}`, borderRadius:8, color:"#e2e8f0", fontSize:12, fontFamily:"'Fira Code',monospace", outline:"none", boxSizing:"border-box" }} />
                  {raw&&<button onClick={()=>{setRaw("");setCells([]);setParseError("");inputRef.current?.focus();}} style={{ position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#334155",cursor:"pointer",fontSize:14,padding:2,lineHeight:1 }}>✕</button>}
                </div>
                {parseError ? <div style={{ marginTop:5,fontSize:9,color:"#f87171" }}>⚠ {parseError}</div>
                  : cells.length>=2 ? <div style={{ marginTop:5,fontSize:9,color:"#4ade80" }}>✓ {cells.length} values · min {Math.min(...cells)} · max {Math.max(...cells)} · avg {(cells.reduce((a,b)=>a+b,0)/cells.length).toFixed(1)}</div>
                  : <div style={{ marginTop:5,fontSize:9,color:"#1e3a5f" }}>Enter numbers or choose a preset →</div>}
              </div>
              <div style={{ flex:1, overflowY:"auto", padding:"10px 12px", display:"flex", flexWrap:"wrap", alignContent:"flex-start", gap:5 }}>
                {cells.map((v,i)=>(
                  <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:1 }}>
                    <span style={{ fontSize:7, color:"#1e293b", fontFamily:"monospace", lineHeight:1 }}>{i}</span>
                    {editIdx===i ? (
                      <input autoFocus type="number" min={1} max={9999} value={editVal}
                        onChange={e=>setEditVal(e.target.value)} onBlur={()=>commitEdit(i)}
                        onKeyDown={e=>{ if(e.key==="Enter") commitEdit(i); if(e.key==="Escape"){setEditIdx(null);setEditVal("");} if(e.key==="Tab"){e.preventDefault();commitEdit(i);setTimeout(()=>startEdit(Math.min(i+1,cells.length-1)),10);} }}
                        style={{ width:48,padding:"4px 2px",textAlign:"center",background:"#030910",border:"2px solid #22d3ee",borderRadius:6,color:"#22d3ee",fontSize:11,fontWeight:700,fontFamily:"monospace",outline:"none" }} />
                    ) : (
                      <div onClick={()=>startEdit(i)} style={{ width:48,padding:"5px 2px",textAlign:"center",background:"#0a1628",border:"1px solid #1e3a5f",borderRadius:6,color:"#93c5fd",fontSize:11,fontWeight:700,fontFamily:"monospace",cursor:"text",userSelect:"none",position:"relative" }}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor="#3b82f6";e.currentTarget.style.background="#0d1f40";}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor="#1e3a5f";e.currentTarget.style.background="#0a1628";}}>
                        {v}
                        <button onClick={ev=>{ev.stopPropagation();removeCell(i);}} style={{ position:"absolute",top:-5,right:-5,width:13,height:13,borderRadius:"50%",background:"#1a0a0a",border:"1px solid #7f1d1d",color:"#f87171",fontSize:7,cursor:"pointer",padding:0,display:"flex",alignItems:"center",justifyContent:"center",opacity:0,transition:"opacity 0.1s" }}
                          onMouseEnter={e=>{e.currentTarget.style.opacity="1";}} onMouseLeave={e=>{e.currentTarget.style.opacity="0";}}>✕</button>
                      </div>
                    )}
                  </div>
                ))}
                {cells.length<200&&(
                  <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:1 }}>
                    <span style={{ fontSize:7,color:"transparent",lineHeight:1 }}>+</span>
                    <button onClick={()=>addCell()}
                      style={{ width:48,height:31,borderRadius:6,border:"1.5px dashed #1e3a5f",background:"transparent",color:"#1e3a5f",fontSize:18,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.12s" }}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor="#4ade80";e.currentTarget.style.color="#4ade80";e.currentTarget.style.background="#0a1f0a";}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor="#1e3a5f";e.currentTarget.style.color="#1e3a5f";e.currentTarget.style.background="transparent";}}>+</button>
                  </div>
                )}
              </div>
            </div>
            <div style={{ width:190, flexShrink:0, display:"flex", flexDirection:"column", background:"#050d1a" }}>
              <div style={{ flexShrink:0, padding:"12px 14px 8px", borderBottom:"1px solid #0a1525" }}>
                <div style={{ fontSize:8, color:"#334155", textTransform:"uppercase", letterSpacing:2, marginBottom:8 }}>Presets</div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:9, color:"#1e3a5f", whiteSpace:"nowrap" }}>Size:</span>
                  <input type="range" min={4} max={64} value={presetN} onChange={e=>setPresetN(+e.target.value)} style={{ flex:1, accentColor:"#3b82f6" }} />
                  <span style={{ fontSize:10, color:"#3b82f6", fontWeight:700, fontFamily:"monospace", minWidth:20 }}>{presetN}</span>
                </div>
              </div>
              <div style={{ flex:1, overflowY:"auto", padding:"8px 10px", display:"flex", flexDirection:"column", gap:4 }}>
                {[{label:"Random",fn:(n)=>genArray(n,200)},...PRESETS].map(({label,fn})=>(
                  <button key={label} onClick={()=>applyPreset(fn)}
                    style={{ padding:"8px 10px",background:"#0a1628",border:"1px solid #1e3a5f",borderRadius:7,color:"#64748b",fontSize:10,fontWeight:600,cursor:"pointer",textAlign:"left",transition:"all 0.12s" }}
                    onMouseEnter={e=>{e.currentTarget.style.background="#0f2040";e.currentTarget.style.borderColor="#3b82f6";e.currentTarget.style.color="#93c5fd";}}
                    onMouseLeave={e=>{e.currentTarget.style.background="#0a1628";e.currentTarget.style.borderColor="#1e3a5f";e.currentTarget.style.color="#64748b";}}>
                    {label}
                  </button>
                ))}
                <div style={{ borderTop:"1px solid #0a1525", marginTop:4, paddingTop:10 }}>
                  <div style={{ fontSize:8, color:"#1e3a5f", textTransform:"uppercase", letterSpacing:2, marginBottom:6 }}>Quick Insert</div>
                  {[["+ Small (1–10)",()=>Math.floor(Math.random()*10)+1],["+ Medium (10–100)",()=>Math.floor(Math.random()*91)+10],["+ Large (100–500)",()=>Math.floor(Math.random()*401)+100]].map(([label,val])=>(
                    <button key={label} onClick={()=>addCell(val())} disabled={cells.length>=200}
                      style={{ display:"block",width:"100%",padding:"6px 8px",marginBottom:3,background:"transparent",border:"1px solid #0f172a",borderRadius:5,color:"#334155",fontSize:9,cursor:cells.length>=200?"not-allowed":"pointer",textAlign:"left",transition:"all 0.12s" }}
                      onMouseEnter={e=>{if(cells.length<200){e.currentTarget.style.color="#4ade80";e.currentTarget.style.borderColor="#14532d";}}}
                      onMouseLeave={e=>{e.currentTarget.style.color="#334155";e.currentTarget.style.borderColor="#0f172a";}}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ flexShrink:0, padding:"11px 18px", borderTop:"1px solid #0a1525", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, background:"#050c19" }}>
          <div style={{ display:"flex", gap:6 }}>
            {[["↑ Sort Asc",(c)=>[...c].sort((a,b)=>a-b)],["↓ Sort Desc",(c)=>[...c].sort((a,b)=>b-a)],["⟳ Shuffle",(c)=>[...c].sort(()=>Math.random()-0.5)]].map(([lbl,fn])=>(
              <button key={lbl} onClick={()=>{ const s=fn(cells); setCells(s); setRaw(s.join(", ")); }} disabled={cells.length<2}
                style={{ padding:"5px 11px",background:"transparent",border:"1px solid #1e3a5f",borderRadius:6,color:"#334155",fontSize:9,cursor:"pointer" }}
                onMouseEnter={e=>{e.currentTarget.style.color="#93c5fd";e.currentTarget.style.borderColor="#3b82f6";}}
                onMouseLeave={e=>{e.currentTarget.style.color="#334155";e.currentTarget.style.borderColor="#1e3a5f";}}>
                {lbl}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <button onClick={onClose} style={{ padding:"7px 16px",background:"transparent",border:"1px solid #1e3a5f",borderRadius:7,color:"#475569",fontSize:10,cursor:"pointer" }}>Cancel</button>
            <button onClick={()=>{ if(canApply){onApply(cells);onClose();} }} disabled={!canApply}
              style={{ padding:"8px 24px",background:canApply?"#0f2040":"#0a1525",border:`1.5px solid ${canApply?"#3b82f6":"#1e293b"}`,borderRadius:8,color:canApply?"#93c5fd":"#1e293b",fontSize:11,fontWeight:700,cursor:canApply?"pointer":"not-allowed",letterSpacing:.5,transition:"all 0.15s" }}>
              ✓ Apply ({cells.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function SortingVisualizer() {
  const [sourceArray,  setSourceArray]  = useState(() => genArray(30, 200));
  const [mode,         setMode]         = useState("single");
  const [selectedAlgo, setSelectedAlgo] = useState("bubble");
  const [cmpA1,        setCmpA1]        = useState("quick");
  const [cmpA2,        setCmpA2]        = useState("merge");
  const [speed,        setSpeed]        = useState(1);
  const [globalPlaying,setGlobalPlaying]= useState(false);
  const [panelKey,     setPanelKey]     = useState(0);
  const [triggerPlay,  setTriggerPlay]  = useState(0);
  const [infoTab,      setInfoTab]      = useState("desc");
  const [m1,           setM1]           = useState({comparisons:0,swaps:0,time:"0.00"});
  const [m2,           setM2]           = useState({comparisons:0,swaps:0,time:"0.00"});
  const [showEditor,   setShowEditor]   = useState(false);
  const doneCountRef = useRef(0);

  useEffect(() => {
    const h = () => setShowEditor(true);
    document.addEventListener("openArrayEditor", h);
    return () => document.removeEventListener("openArrayEditor", h);
  }, []);

  function resetPanels() {
    setPanelKey(k=>k+1); setGlobalPlaying(false); doneCountRef.current=0;
    setM1({comparisons:0,swaps:0,time:"0.00"}); setM2({comparisons:0,swaps:0,time:"0.00"});
    setTriggerPlay(0);
  }

  const handleApplyArray = useCallback((arr) => {
    setSourceArray(arr); resetPanels();
  }, []); // eslint-disable-line

  const handleApplyAndSort = useCallback((arr) => {
    setSourceArray(arr);
    setPanelKey(k=>k+1); setGlobalPlaying(false); doneCountRef.current=0;
    setM1({comparisons:0,swaps:0,time:"0.00"}); setM2({comparisons:0,swaps:0,time:"0.00"});
    setTriggerPlay(t=>t+1);
  }, []);

  const handleComparePlay = () => { doneCountRef.current=0; setGlobalPlaying(true); };
  const handleDone = useCallback(() => { doneCountRef.current+=1; if(doneCountRef.current>=2) setGlobalPlaying(false); }, []);
  const meta = ALGO_META[selectedAlgo];

  return (
    <div style={{ height:"100vh", display:"flex", flexDirection:"column", background:"#030910", color:"#e2e8f0", fontFamily:"'Fira Code',monospace", overflow:"hidden" }}>

      {showEditor && <ArrayEditor sourceArray={sourceArray} onApply={(arr)=>{setSourceArray(arr);resetPanels();}} onClose={()=>setShowEditor(false)} />}

      {/* HEADER */}
      <div style={{ flexShrink:0, background:"#060f1c", borderBottom:"1px solid #0a1525", padding:"9px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ display:"flex", alignItems:"flex-end", gap:2, padding:"4px 7px", background:"#0a1628", borderRadius:7, border:"1px solid #1e3a5f" }}>
            {[3,6,2,8,4,7,1,5].map((h,i)=><div key={i} style={{ width:4, height:h*4, background:`hsl(${190+i*18},75%,55%)`, borderRadius:"1px 1px 0 0" }} />)}
          </div>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:"#f1f5f9" }}>Sort<span style={{ color:"#3b82f6" }}>Viz</span></div>
            <div style={{ fontSize:7, color:"#1e3a5f", letterSpacing:3, textTransform:"uppercase" }}>Algorithm Visualizer</div>
          </div>
        </div>
        <div style={{ display:"flex", background:"#030910", border:"1px solid #0a1525", borderRadius:7, overflow:"hidden" }}>
          {[["single","Single"],["compare","Compare"]].map(([m,label])=>(
            <button key={m} onClick={()=>{setMode(m);setGlobalPlaying(false);resetPanels();}}
              style={{ padding:"5px 14px",fontSize:9,fontWeight:700,letterSpacing:1,textTransform:"uppercase",background:mode===m?"#0f2040":"transparent",color:mode===m?"#93c5fd":"#1e3a5f",border:"none",cursor:"pointer" }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
          <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
            <label style={{ fontSize:7, color:"#334155", textTransform:"uppercase", letterSpacing:2 }}>Speed: <span style={{ color:"#f59e0b" }}>{speed}x</span></label>
            <input type="range" min={0.25} max={8} step={0.25} value={speed} onChange={e=>setSpeed(+e.target.value)} style={{ width:90, accentColor:"#f59e0b" }} />
          </div>
          <div style={{ display:"flex", gap:3 }}>
            {[0.5,1,2,4,8].map(s=>(
              <button key={s} onClick={()=>setSpeed(s)} style={{ padding:"2px 6px",background:speed===s?"#162910":"#030910",border:`1px solid ${speed===s?"#4ade80":"#0a1525"}`,borderRadius:4,color:speed===s?"#4ade80":"#1e3a5f",fontSize:8,cursor:"pointer" }}>{s}x</button>
            ))}
          </div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {Object.entries(STATES).map(([k,v])=>(
              <div key={k} style={{ display:"flex", alignItems:"center", gap:3 }}>
                <div style={{ width:7, height:7, borderRadius:2, background:v.top }} />
                <span style={{ fontSize:7, color:"#334155" }}>{v.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── INLINE ARRAY INPUT BAR ── */}
      <ArrayInputBar
        currentArray={sourceArray}
        selectedAlgo={selectedAlgo}
        onApply={handleApplyArray}
        onApplyAndSort={handleApplyAndSort}
      />

      {/* BODY */}
      <div style={{ flex:1, display:"flex", overflow:"hidden", minHeight:0 }}>
        {mode === "compare" ? (
          <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
            <div style={{ flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 16px", background:"#050d1a", borderBottom:"1px solid #0a1525", flexWrap:"wrap", gap:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                {[[cmpA1,setCmpA1],[cmpA2,setCmpA2]].map(([val,setter],idx)=>(
                  <div key={idx} style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:ALGO_META[val].color }} />
                    <select value={val} onChange={e=>{setter(e.target.value);resetPanels();}} style={{ background:"#030910",border:"1px solid #0a1525",borderRadius:5,color:"#e2e8f0",fontSize:10,padding:"3px 7px",outline:"none",cursor:"pointer" }}>
                      {Object.entries(ALGO_META).map(([k,v])=><option key={k} value={k}>{v.name}</option>)}
                    </select>
                    {idx===0&&<span style={{ color:"#1e3a5f",fontWeight:900,fontSize:11 }}>VS</span>}
                  </div>
                ))}
              </div>
              <button onClick={handleComparePlay} disabled={globalPlaying}
                style={{ padding:"6px 18px",background:"#041408",border:"1px solid #16a34a",borderRadius:7,color:"#86efac",fontSize:10,fontWeight:700,cursor:globalPlaying?"not-allowed":"pointer",opacity:globalPlaying?0.6:1,letterSpacing:1 }}>
                {globalPlaying?"▶ Running...":"▶▶ Run Both"}
              </button>
            </div>
            <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 1fr", overflow:"hidden", minHeight:0 }}>
              <div style={{ borderRight:"1px solid #0a1525", display:"flex", flexDirection:"column", overflow:"hidden" }}>
                <SortPanel key={`c1-${panelKey}-${cmpA1}`} algoKey={cmpA1} inputArray={sourceArray} speed={speed} isCompareMode={true} globalPlaying={globalPlaying} onMetricsUpdate={setM1} onDone={handleDone} />
              </div>
              <div style={{ display:"flex", flexDirection:"column", overflow:"hidden" }}>
                <SortPanel key={`c2-${panelKey}-${cmpA2}`} algoKey={cmpA2} inputArray={sourceArray} speed={speed} isCompareMode={true} globalPlaying={globalPlaying} onMetricsUpdate={setM2} onDone={handleDone} />
              </div>
            </div>
            <div style={{ flexShrink:0 }}>
              <CompareMetrics a1={cmpA1} a2={cmpA2} m1={m1} m2={m2} />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", background:"#030910", borderTop:"1px solid #0a1525" }}>
                {[cmpA1,cmpA2].map((ak,idx)=>{ const m=ALGO_META[ak]; return (
                  <div key={ak} style={{ padding:"5px 12px",borderRight:idx===0?"1px solid #0a1525":"none",display:"flex",gap:10,flexWrap:"wrap",alignItems:"center" }}>
                    <span style={{ fontSize:9,color:m.color,fontWeight:700 }}>{m.short}</span>
                    {[["Avg",m.avg],["Worst",m.worst],["Space",m.space]].map(([l,v])=>(
                      <span key={l} style={{ fontSize:8,color:"#1e3a5f" }}>{l}: <span style={{ color:"#334155" }}>{v}</span></span>
                    ))}
                  </div>
                ); })}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minHeight:0 }}>
              <div style={{ flexShrink:0, display:"flex", alignItems:"center", gap:6, padding:"7px 14px", background:"#050d1a", borderBottom:"1px solid #0a1525", flexWrap:"wrap" }}>
                <span style={{ fontSize:7,color:"#1e3a5f",textTransform:"uppercase",letterSpacing:2,flexShrink:0 }}>Algorithm:</span>
                {Object.entries(ALGO_META).map(([key,m])=>(
                  <button key={key} onClick={()=>{setSelectedAlgo(key);resetPanels();}}
                    style={{ padding:"3px 10px",borderRadius:5,border:`1px solid ${selectedAlgo===key?m.color:"#0a1525"}`,background:selectedAlgo===key?`${m.color}15`:"transparent",color:selectedAlgo===key?m.color:"#1e3a5f",fontSize:9,fontWeight:700,cursor:"pointer",transition:"all 0.12s" }}>
                    {m.short}
                  </button>
                ))}
              </div>
              <div style={{ flex:1, minHeight:0, overflow:"hidden" }}>
                <SortPanel key={`s-${panelKey}-${selectedAlgo}`} algoKey={selectedAlgo} inputArray={sourceArray} speed={speed} isCompareMode={false} triggerPlay={triggerPlay} />
              </div>
            </div>

            {/* Right info panel */}
            <div style={{ width:270,flexShrink:0,background:"#060f1c",borderLeft:"1px solid #0a1525",display:"flex",flexDirection:"column",overflow:"hidden" }}>
              <div style={{ flexShrink:0,display:"flex",borderBottom:"1px solid #0a1525" }}>
                {[["desc","Info"],["code","Code"],["cplx","O(n)"]].map(([tab,label])=>(
                  <button key={tab} onClick={()=>setInfoTab(tab)}
                    style={{ flex:1,padding:"8px 0",fontSize:8,fontWeight:700,textTransform:"uppercase",letterSpacing:1,background:infoTab===tab?"#0a1628":"transparent",color:infoTab===tab?meta.color:"#1e3a5f",border:"none",borderBottom:`2px solid ${infoTab===tab?meta.color:"transparent"}`,cursor:"pointer" }}>
                    {label}
                  </button>
                ))}
              </div>
              <div style={{ flex:1,overflowY:"auto",padding:12 }}>
                {infoTab==="desc"&&(
                  <div style={{ display:"flex",flexDirection:"column",gap:11 }}>
                    <div>
                      <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:6 }}>
                        <div style={{ width:7,height:7,borderRadius:"50%",background:meta.color,boxShadow:`0 0 6px ${meta.color}` }} />
                        <span style={{ fontSize:12,fontWeight:700,color:"#f1f5f9" }}>{meta.name}</span>
                      </div>
                      <p style={{ margin:0,fontSize:10,color:"#475569",lineHeight:1.7 }}>{meta.desc}</p>
                    </div>
                    <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:5 }}>
                      {[["Stable",meta.stable?"Yes ✓":"No ✗",meta.stable?"#4ade80":"#f87171"],["Space",meta.space,"#c084fc"],["Best",meta.best,"#4ade80"],["Worst",meta.worst,"#f87171"]].map(([l,v,c])=>(
                        <div key={l} style={{ background:"#030910",border:"1px solid #0a1525",borderRadius:6,padding:"6px 8px" }}>
                          <div style={{ fontSize:7,color:"#1e3a5f",textTransform:"uppercase",letterSpacing:1 }}>{l}</div>
                          <div style={{ fontSize:11,fontWeight:700,color:c,marginTop:1 }}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div style={{ fontSize:7,color:"#1e3a5f",textTransform:"uppercase",letterSpacing:2,marginBottom:6 }}>Color Guide</div>
                      {Object.entries(STATES).map(([k,v])=>(
                        <div key={k} style={{ display:"flex",alignItems:"center",gap:6,padding:"2px 6px",marginBottom:2,background:"#030910",borderRadius:4 }}>
                          <div style={{ width:8,height:12,background:`linear-gradient(to top,${v.bar},${v.top})`,borderRadius:1,flexShrink:0 }} />
                          <span style={{ fontSize:9,color:v.top }}>{v.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {infoTab==="code"&&(
                  <div style={{ display:"flex",flexDirection:"column",gap:9 }}>
                    <div style={{ fontSize:7,color:"#1e3a5f",textTransform:"uppercase",letterSpacing:2 }}>Pseudocode</div>
                    <PseudoCode code={meta.pseudo} />
                    <div style={{ padding:"8px 10px",background:"#030910",border:"1px solid #0a1525",borderRadius:6,fontSize:9,color:"#475569",lineHeight:1.6 }}>
                      <span style={{ color:meta.color }}>Tip: </span>
                      {{"bubble":"Early termination when no swaps — best case O(n).","selection":"Always O(n²) comparisons, regardless of input order.","insertion":"Very fast on nearly-sorted data. Inner loop exits early.","merge":"Guaranteed O(n log n) but requires O(n) extra memory.","quick":"Pivot choice is critical — random pivot avoids O(n²) worst case.","heap":"Builds heap in O(n), then n×heapify in O(log n) each."}[selectedAlgo]}
                    </div>
                  </div>
                )}
                {infoTab==="cplx"&&(
                  <div style={{ display:"flex",flexDirection:"column",gap:7 }}>
                    <div style={{ fontSize:7,color:"#1e3a5f",textTransform:"uppercase",letterSpacing:2,marginBottom:3 }}>Complexity</div>
                    {[["Best",meta.best,"#4ade80"],["Average",meta.avg,"#fbbf24"],["Worst",meta.worst,"#f87171"],["Space",meta.space,"#c084fc"]].map(([l,v,c])=>(
                      <div key={l} style={{ background:"#030910",border:`1px solid ${c}18`,borderRadius:6,padding:"8px 10px",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                        <span style={{ fontSize:9,color:"#334155" }}>{l}</span>
                        <code style={{ fontSize:11,fontWeight:700,color:c }}>{v}</code>
                      </div>
                    ))}
                    <div style={{ marginTop:5 }}>
                      <div style={{ fontSize:7,color:"#1e3a5f",textTransform:"uppercase",letterSpacing:2,marginBottom:6 }}>All Algorithms</div>
                      {Object.entries(ALGO_META).map(([key,m])=>(
                        <button key={key} onClick={()=>{setSelectedAlgo(key);resetPanels();}}
                          style={{ display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"5px 8px",marginBottom:2,background:selectedAlgo===key?`${m.color}12`:"#030910",border:`1px solid ${selectedAlgo===key?m.color:"#0a1525"}`,borderRadius:5,cursor:"pointer",gap:6 }}>
                          <div style={{ display:"flex",alignItems:"center",gap:5 }}>
                            <div style={{ width:5,height:5,borderRadius:"50%",background:m.color }} />
                            <span style={{ fontSize:9,color:m.color,fontWeight:700 }}>{m.short}</span>
                          </div>
                          <span style={{ fontSize:8,color:"#1e3a5f" }}>{m.avg}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ flexShrink:0,background:"#030910",borderTop:"1px solid #0a1525",padding:"5px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:4 }}>
        <div style={{ display:"flex",gap:12,flexWrap:"wrap" }}>
          {Object.entries(ALGO_META).map(([k,m])=>(
            <div key={k} style={{ display:"flex",alignItems:"center",gap:3 }}>
              <div style={{ width:4,height:4,borderRadius:"50%",background:m.color }} />
              <span style={{ fontSize:7,color:"#0f172a" }}>{m.short}: {m.avg}</span>
            </div>
          ))}
        </div>
        <span style={{ fontSize:7,color:"#0f172a",letterSpacing:3 }}>SORTVIZ • DSA VISUALIZER</span>
      </div>
    </div>
  );
}