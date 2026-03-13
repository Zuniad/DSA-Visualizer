import { useState, useCallback, useRef, useEffect, useMemo } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#070a0f",
  surface: "#0c0f18",
  panel: "#101520",
  border: "#191f30",
  accent: "#0ea5e9",   // sky blue
  green: "#22c55e",
  amber: "#f59e0b",
  red: "#f43f5e",
  purple: "#a855f7",
  teal: "#14b8a6",
  text: "#e2e8f0",
  muted: "#475569",
  dim: "#0f1420",
};

// ─── DATA ─────────────────────────────────────────────────────────────────────
const COMPLEXITY = {
  enqueue:  { time: "O(1)", space: "O(1)" },
  dequeue:  { time: "O(1)", space: "O(1)" },
  peek:     { time: "O(1)", space: "O(1)" },
  isEmpty:  { time: "O(1)", space: "O(1)" },
  isFull:   { time: "O(1)", space: "O(1)" },
  traverse: { time: "O(n)", space: "O(1)" },
};

const ALGO_INFO = {
  enqueue: {
    name: "Enqueue",
    desc: "Adds a new element at the REAR of the queue. Raises overflow if the queue is full.",
    steps: [
      "Check if queue is full (rear === maxSize-1)",
      "If full → Queue Overflow error",
      "Increment rear pointer (rear++)",
      "Insert element at queue[rear]",
      "✓ Element enqueued successfully",
    ],
    pseudo: `enqueue(value):
  if rear == maxSize - 1:
    raise QueueOverflow
  rear = rear + 1
  queue[rear] = value`,
    flow: ["Start", "Queue Full?", "rear++", "queue[rear]=val", "End"],
  },
  dequeue: {
    name: "Dequeue",
    desc: "Removes and returns the element at the FRONT of the queue. Raises underflow if empty.",
    steps: [
      "Check if queue is empty (front > rear)",
      "If empty → Queue Underflow error",
      "Store value at queue[front]",
      "Increment front pointer (front++)",
      "✓ Element dequeued successfully",
    ],
    pseudo: `dequeue():
  if front > rear:
    raise QueueUnderflow
  value = queue[front]
  front = front + 1
  return value`,
    flow: ["Start", "Queue Empty?", "val=queue[front]", "front++", "Return val"],
  },
  peek: {
    name: "Peek",
    desc: "Returns the front element without removing it. Queue remains unchanged.",
    steps: [
      "Check if queue is empty (front > rear)",
      "If empty → return null",
      "Return queue[front]",
      "✓ Front element retrieved",
    ],
    pseudo: `peek():
  if front > rear:
    return null
  return queue[front]`,
    flow: ["Start", "Queue Empty?", "Return queue[front]", "End"],
  },
  traverse: {
    name: "Traverse",
    desc: "Visits every element from FRONT to REAR sequentially without modifying the queue.",
    steps: [
      "Start at index = front",
      "Visit current element",
      "Move to index + 1",
      "Repeat until index > rear",
      "✓ Traversal complete",
    ],
    pseudo: `traverse():
  for i = front to rear:
    visit(queue[i])`,
    flow: ["Start", "i = front", "Visit queue[i]", "i++", "i > rear? End"],
  },
  isEmpty: {
    name: "isEmpty",
    desc: "Checks whether the queue has any elements.",
    steps: [
      "Check if front > rear",
      "If yes → queue is empty",
      "If no → queue has elements",
      "✓ Result returned",
    ],
    pseudo: `isEmpty():
  return front > rear`,
    flow: ["Start", "front > rear?", "Return bool", "End"],
  },
  isFull: {
    name: "isFull",
    desc: "Checks whether the queue has reached maximum capacity.",
    steps: [
      "Check if rear == maxSize - 1",
      "If yes → queue is full",
      "If no → space available",
      "✓ Result returned",
    ],
    pseudo: `isFull():
  return rear == maxSize - 1`,
    flow: ["Start", "rear==maxSize-1?", "Return bool", "End"],
  },
};

const CODE = {
  javascript: {
    enqueue: `class Queue {
  constructor(maxSize) {
    this.queue = [];
    this.front = 0;
    this.rear = -1;
    this.maxSize = maxSize;
  }
  enqueue(value) {
    if (this.rear === this.maxSize - 1)
      throw new Error("Queue Overflow");
    this.rear++;
    this.queue[this.rear] = value;
  }
}`,
    dequeue: `dequeue() {
  if (this.front > this.rear)
    throw new Error("Queue Underflow");
  const value = this.queue[this.front];
  this.front++;
  return value;
}`,
    peek: `peek() {
  if (this.front > this.rear)
    return null;
  return this.queue[this.front];
}`,
    traverse: `traverse() {
  const result = [];
  for (let i = this.front; i <= this.rear; i++)
    result.push(this.queue[i]);
  return result;
}`,
    isEmpty: `isEmpty() {
  return this.front > this.rear;
}`,
    isFull: `isFull() {
  return this.rear === this.maxSize - 1;
}`,
  },
  python: {
    enqueue: `class Queue:
    def __init__(self, max_size):
        self.queue = []
        self.front = 0
        self.rear = -1
        self.max_size = max_size

    def enqueue(self, value):
        if self.rear == self.max_size - 1:
            raise Exception("Queue Overflow")
        self.rear += 1
        self.queue.append(value)`,
    dequeue: `    def dequeue(self):
        if self.front > self.rear:
            raise Exception("Queue Underflow")
        value = self.queue[self.front]
        self.front += 1
        return value`,
    peek: `    def peek(self):
        if self.front > self.rear:
            return None
        return self.queue[self.front]`,
    traverse: `    def traverse(self):
        result = []
        for i in range(self.front, self.rear + 1):
            result.append(self.queue[i])
        return result`,
    isEmpty: `    def is_empty(self):
        return self.front > self.rear`,
    isFull: `    def is_full(self):
        return self.rear == self.max_size - 1`,
  },
  java: {
    enqueue: `public class Queue {
    private int[] queue;
    private int front, rear, maxSize;

    public Queue(int maxSize) {
        this.maxSize = maxSize;
        queue = new int[maxSize];
        front = 0;
        rear = -1;
    }
    public void enqueue(int value) {
        if (rear == maxSize - 1)
            throw new RuntimeException("Overflow");
        queue[++rear] = value;
    }
}`,
    dequeue: `public int dequeue() {
    if (front > rear)
        throw new RuntimeException("Underflow");
    return queue[front++];
}`,
    peek: `public int peek() {
    if (front > rear)
        throw new RuntimeException("Empty");
    return queue[front];
}`,
    traverse: `public void traverse() {
    for (int i = front; i <= rear; i++)
        System.out.print(queue[i] + " ");
}`,
    isEmpty: `public boolean isEmpty() {
    return front > rear;
}`,
    isFull: `public boolean isFull() {
    return rear == maxSize - 1;
}`,
  },
  cpp: {
    enqueue: `class Queue {
    vector<int> queue;
    int front = 0, rear = -1, maxSize;
public:
    Queue(int size) : maxSize(size) {}

    void enqueue(int value) {
        if (rear == maxSize - 1)
            throw overflow_error("Queue Overflow");
        queue.push_back(value);
        rear++;
    }
};`,
    dequeue: `int dequeue() {
    if (front > rear)
        throw underflow_error("Queue Underflow");
    int val = queue[front];
    front++;
    return val;
}`,
    peek: `int peek() {
    if (front > rear)
        throw runtime_error("Empty Queue");
    return queue[front];
}`,
    traverse: `void traverse() {
    for (int i = front; i <= rear; i++)
        cout << queue[i] << " ";
}`,
    isEmpty: `bool isEmpty() {
    return front > rear;
}`,
    isFull: `bool isFull() {
    return rear == maxSize - 1;
}`,
  },
};

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const G = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

*{box-sizing:border-box;margin:0;padding:0;}
body{background:${T.bg};color:${T.text};font-family:'DM Sans',sans-serif;}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:${T.surface};}
::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px;}

@keyframes slideFromRight{
  0%{opacity:0;transform:translateX(60px) scale(0.85);}
  65%{transform:translateX(-4px) scale(1.03);}
  100%{opacity:1;transform:translateX(0) scale(1);}
}
@keyframes liftFade{
  0%{opacity:1;transform:translateY(0) scale(1);}
  40%{transform:translateY(-12px) scale(1.06);}
  100%{opacity:0;transform:translateY(-60px) scale(0.7);}
}
@keyframes peekGlow{
  0%,100%{box-shadow:none;}
  50%{box-shadow:0 0 0 3px ${T.teal}90,0 0 24px ${T.teal}50;}
}
@keyframes traverseLight{
  0%,100%{background:${T.panel};}
  50%{background:${T.accent}25;}
}
@keyframes shakeX{
  0%,100%{transform:translateX(0);}
  20%{transform:translateX(-8px);}
  40%{transform:translateX(8px);}
  60%{transform:translateX(-5px);}
  80%{transform:translateX(4px);}
}
@keyframes rearFlash{
  0%,100%{border-color:${T.border};}
  50%{border-color:${T.red};box-shadow:0 0 18px ${T.red}40;}
}
@keyframes frontPop{
  0%{transform:scale(1);}
  40%{transform:scale(1.08);}
  100%{transform:scale(1);}
}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
@keyframes ptrBounce{
  0%,100%{transform:translateY(0);}
  50%{transform:translateY(-4px);}
}
@keyframes circularSpin{
  0%{stroke-dashoffset:300;}
  100%{stroke-dashoffset:0;}
}
@keyframes newEl{
  0%{opacity:0;transform:translateX(50px) scale(0.7);}
  100%{opacity:1;transform:translateX(0) scale(1);}
}

.el-enter{animation:slideFromRight 0.42s cubic-bezier(.34,1.56,.64,1) forwards;}
.el-exit{animation:liftFade 0.38s ease-in forwards;}
.el-peek{animation:peekGlow 0.8s ease-in-out;}
.el-traverse{animation:traverseLight 0.5s ease;}
.el-shake{animation:shakeX 0.45s ease;}
.el-front{animation:frontPop 0.4s ease;}

.btn{
  background:${T.panel};border:1px solid ${T.border};color:${T.muted};
  padding:8px 16px;border-radius:7px;cursor:pointer;
  font-family:'DM Sans',sans-serif;font-weight:600;font-size:13px;
  transition:all .2s;white-space:nowrap;
}
.btn:hover{color:${T.text};border-color:${T.muted};}
.btn:disabled{opacity:.3;cursor:not-allowed;}
.btn-sky{background:${T.accent}18;border-color:${T.accent}50;color:${T.accent};}
.btn-sky:hover{background:${T.accent}28;border-color:${T.accent};box-shadow:0 0 14px ${T.accent}30;}
.btn-red{background:${T.red}18;border-color:${T.red}50;color:${T.red};}
.btn-red:hover{background:${T.red}28;border-color:${T.red};}
.btn-teal{background:${T.teal}18;border-color:${T.teal}50;color:${T.teal};}
.btn-teal:hover{background:${T.teal}28;border-color:${T.teal};}
.btn-green{background:${T.green}18;border-color:${T.green}50;color:${T.green};}
.btn-green:hover{background:${T.green}28;border-color:${T.green};}
.btn-amber{background:${T.amber}18;border-color:${T.amber}50;color:${T.amber};}
.btn-amber:hover{background:${T.amber}28;border-color:${T.amber};}
.btn-purple{background:${T.purple}18;border-color:${T.purple}50;color:${T.purple};}
.btn-purple:hover{background:${T.purple}28;border-color:${T.purple};}

.inp{
  background:${T.surface};border:1px solid ${T.border};color:${T.text};
  padding:8px 12px;border-radius:7px;
  font-family:'IBM Plex Mono',monospace;font-size:13px;
  outline:none;transition:border-color .2s;width:100%;
}
.inp:focus{border-color:${T.accent}70;}
.inp::placeholder{color:${T.muted};}

.panel{background:${T.panel};border:1px solid ${T.border};border-radius:12px;}
.mono{font-family:'IBM Plex Mono',monospace;}

.code-view{
  background:#040608;border:1px solid ${T.border};border-radius:8px;
  padding:14px;font-family:'IBM Plex Mono',monospace;font-size:11px;
  line-height:1.8;color:#7d94b5;overflow:auto;white-space:pre;max-height:210px;
}
.tab-a{border-bottom:2px solid ${T.accent};color:${T.accent};background:${T.accent}10;}
.tab-i{border-bottom:2px solid transparent;color:${T.muted};}
.tab-i:hover{color:${T.text};}

.slider{-webkit-appearance:none;width:100%;height:3px;border-radius:2px;background:${T.border};outline:none;}
.slider::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:${T.accent};cursor:pointer;box-shadow:0 0 8px ${T.accent}60;}

.toast{position:fixed;bottom:20px;right:20px;padding:10px 18px;border-radius:8px;font-family:'IBM Plex Mono',monospace;font-size:11px;z-index:999;animation:fadeUp .3s ease;}
.flow-node{padding:7px 13px;border-radius:7px;font-size:10px;font-family:'IBM Plex Mono',monospace;font-weight:500;text-align:center;min-width:120px;transition:all .3s;}
`;

// ─── QUEUE ELEMENT CELL ───────────────────────────────────────────────────────
function QueueCell({ value, index, state, isFront, isRear, isCircularQueue, total }) {
  const stateMap = {
    default:  { bg: T.panel,         border: T.border,  color: T.text,   shadow: "none" },
    enqueue:  { bg: `${T.green}18`,  border: T.green,   color: T.green,  shadow: `0 0 14px ${T.green}40` },
    dequeue:  { bg: `${T.red}18`,    border: T.red,     color: T.red,    shadow: `0 0 14px ${T.red}40` },
    peek:     { bg: `${T.teal}18`,   border: T.teal,    color: T.teal,   shadow: `0 0 18px ${T.teal}50` },
    traverse: { bg: `${T.accent}18`, border: T.accent,  color: T.accent, shadow: `0 0 12px ${T.accent}40` },
    found:    { bg: `${T.amber}18`,  border: T.amber,   color: T.amber,  shadow: `0 0 14px ${T.amber}40` },
  };

  const s = stateMap[state] || stateMap.default;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, position: "relative" }}>
      {/* Front/Rear labels */}
      <div style={{ height: 18, display: "flex", alignItems: "center", justifyContent: "center", gap: 3, marginBottom: 2 }}>
        {isFront && (
          <span style={{
            fontFamily: "IBM Plex Mono", fontSize: 8, color: T.green, background: `${T.green}15`,
            padding: "1px 5px", borderRadius: 3, border: `1px solid ${T.green}30`,
            animation: "ptrBounce 1.5s ease-in-out infinite", letterSpacing: 1,
          }}>FRONT</span>
        )}
        {isRear && (
          <span style={{
            fontFamily: "IBM Plex Mono", fontSize: 8, color: T.red, background: `${T.red}15`,
            padding: "1px 5px", borderRadius: 3, border: `1px solid ${T.red}30`,
            animation: "ptrBounce 1.5s ease-in-out infinite 0.3s", letterSpacing: 1,
          }}>REAR</span>
        )}
        {!isFront && !isRear && <div style={{ height: 16 }} />}
      </div>

      {/* Cell */}
      <div
        className={state === "peek" ? "el-peek" : state === "traverse" ? "el-traverse" : ""}
        style={{
          width: 58, minHeight: 58,
          background: s.bg, border: `1.5px solid ${s.border}`,
          borderRadius: 8, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 2,
          boxShadow: s.shadow, transition: "all .3s", position: "relative", overflow: "hidden",
        }}
      >
        {/* Fill bar */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: `${Math.min(100, ((index + 1) / total) * 80)}%`,
          background: `linear-gradient(180deg, transparent, ${s.border}18)`,
        }} />
        <span className="mono" style={{ fontSize: 16, fontWeight: 700, color: s.color, zIndex: 1 }}>{value}</span>
        <span style={{ fontFamily: "IBM Plex Mono", fontSize: 8, color: T.muted, zIndex: 1 }}>[{index}]</span>
      </div>
    </div>
  );
}

// ─── POINTER ARROW ────────────────────────────────────────────────────────────
function Ptr({ label, color, dir = "right" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, padding: "0 8px" }}>
      <span style={{ fontFamily: "IBM Plex Mono", fontSize: 9, color, letterSpacing: 1, fontWeight: 600 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center" }}>
        {dir === "right" && <>
          <div style={{ width: 20, height: 1.5, background: color }} />
          <div style={{ width: 0, height: 0, borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderLeft: `8px solid ${color}` }} />
        </>}
        {dir === "left" && <>
          <div style={{ width: 0, height: 0, borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderRight: `8px solid ${color}` }} />
          <div style={{ width: 20, height: 1.5, background: color }} />
        </>}
      </div>
    </div>
  );
}

// ─── CANVAS ───────────────────────────────────────────────────────────────────
function QueueCanvas({ queue, maxSize, cellStates, exitIdx, overflow, underflow, traversalResult, isCircular, shaking }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [queue.length]);

  const emptyCount = Math.max(0, maxSize - queue.length);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Main track */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* FRONT label */}
        <Ptr label="FRONT" color={T.green} dir="right" />

        {/* Queue track */}
        <div
          ref={scrollRef}
          className={shaking ? "el-shake" : ""}
          style={{
            flex: 1, overflowX: "auto",
            background: T.surface,
            border: `2px solid ${overflow ? T.red : T.border}`,
            borderRadius: 12,
            padding: "12px 14px 8px",
            display: "flex",
            alignItems: "flex-end",
            gap: 6,
            minHeight: 110,
            position: "relative",
            transition: "border-color .3s",
            animation: overflow ? "rearFlash 0.5s ease" : "none",
          }}
        >
          {/* Overflow banner */}
          {overflow && (
            <div style={{
              position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)",
              background: `${T.red}20`, border: `1px solid ${T.red}50`,
              color: T.red, padding: "2px 10px", borderRadius: 4,
              fontFamily: "IBM Plex Mono", fontSize: 10, fontWeight: 600,
              zIndex: 5, whiteSpace: "nowrap",
            }}>⚠ QUEUE OVERFLOW</div>
          )}
          {underflow && (
            <div style={{
              position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)",
              background: `${T.amber}18`, border: `1px solid ${T.amber}40`,
              color: T.amber, padding: "2px 10px", borderRadius: 4,
              fontFamily: "IBM Plex Mono", fontSize: 10, fontWeight: 600,
              zIndex: 5, whiteSpace: "nowrap",
            }}>⚠ QUEUE UNDERFLOW</div>
          )}

          {/* Rail decoration */}
          <div style={{ position: "absolute", bottom: 8, left: 14, right: 14, height: 2, background: `linear-gradient(90deg, ${T.green}60, ${T.border}, ${T.red}60)`, borderRadius: 1 }} />

          {/* Elements */}
          {queue.length === 0 ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 70, color: T.muted }}>
              <span style={{ fontSize: 24, opacity: .2 }}>[ ]</span>
              <span className="mono" style={{ fontSize: 11 }}>Empty Queue</span>
            </div>
          ) : (
            queue.map((val, i) => (
              <div
                key={`${i}-${val}`}
                className={
                  i === queue.length - 1 && cellStates[i] === "enqueue" ? "el-enter" :
                  exitIdx === i ? "el-exit" : ""
                }
              >
                <QueueCell
                  value={val}
                  index={i}
                  state={cellStates[i] || "default"}
                  isFront={i === 0}
                  isRear={i === queue.length - 1}
                  isCircularQueue={isCircular}
                  total={queue.length}
                />
              </div>
            ))
          )}

          {/* Empty slots */}
          {queue.length > 0 && Array.from({ length: emptyCount }).map((_, i) => (
            <div key={`empty-${i}`} style={{
              width: 58, minHeight: 58,
              border: `1.5px dashed ${T.border}`, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <span style={{ fontFamily: "IBM Plex Mono", fontSize: 9, color: T.muted, opacity: .4 }}>—</span>
            </div>
          ))}
        </div>

        {/* REAR label */}
        <Ptr label="REAR" color={T.red} dir="left" />
      </div>

      {/* Circular arc (cosmetic) */}
      {isCircular && queue.length > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{
            position: "relative",
            width: "80%",
            height: 30,
            border: `1.5px dashed ${T.purple}50`,
            borderTop: "none",
            borderRadius: "0 0 60px 60px",
          }}>
            <div style={{ position: "absolute", left: -6, top: -5, width: 0, height: 0, borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderRight: `7px solid ${T.purple}60` }} />
            <div style={{ position: "absolute", right: -6, top: -5, width: 0, height: 0, borderTop: "5px solid transparent", borderBottom: "5px solid transparent", borderLeft: `7px solid ${T.purple}60` }} />
            <span style={{ position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)", fontFamily: "IBM Plex Mono", fontSize: 9, color: T.purple, letterSpacing: 1 }}>← circular connection →</span>
          </div>
        </div>
      )}

      {/* Fill progress bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className="mono" style={{ fontSize: 9, color: T.muted, width: 60 }}>FILL</span>
        <div style={{ flex: 1, height: 4, background: T.border, borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${(queue.length / maxSize) * 100}%`,
            background: queue.length === maxSize
              ? `linear-gradient(90deg, ${T.red}80, ${T.red})`
              : `linear-gradient(90deg, ${T.accent}80, ${T.accent})`,
            borderRadius: 2,
            transition: "width .4s ease",
          }} />
        </div>
        <span className="mono" style={{ fontSize: 10, color: queue.length === maxSize ? T.red : T.accent, width: 50, textAlign: "right" }}>
          {queue.length}/{maxSize}
        </span>
      </div>

      {/* Traversal result */}
      {traversalResult.length > 0 && (
        <div className="panel" style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1 }}>TRAVERSAL</span>
          <div className="mono" style={{ fontSize: 11, color: T.teal }}>
            {traversalResult.join(" → ")}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── OPERATION FLOW ───────────────────────────────────────────────────────────
function OperationFlow({ operation, currentStep }) {
  const op = ALGO_INFO[operation];
  if (!op) return <div style={{ color: T.muted, fontSize: 11 }}>Run an operation</div>;
  const nodes = op.flow;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {nodes.map((node, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="flow-node" style={{
            background: currentStep === i ? `${T.accent}22` : T.dim,
            border: `1.5px solid ${currentStep === i ? T.accent : T.border}`,
            color: currentStep === i ? T.accent : T.muted,
            boxShadow: currentStep === i ? `0 0 12px ${T.accent}30` : "none",
          }}>{node}</div>
          {i < nodes.length - 1 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: 1.5, height: 8, background: T.border }} />
              <div style={{ width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: `6px solid ${T.border}` }} />
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
    <div className="toast" style={{ background: `${c}15`, border: `1px solid ${c}50`, color: c }}>
      {type === "error" ? "⚠ " : type === "warn" ? "⚡ " : "✓ "}{msg}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [queue, setQueue] = useState([10, 20, 30, 40]);
  const [maxSize, setMaxSize] = useState(8);
  const [sizeInput, setSizeInput] = useState("8");
  const [randSize, setRandSize] = useState(4);
  const [isCircular, setIsCircular] = useState(false);

  const [value, setValue] = useState("");
  const [cellStates, setCellStates] = useState({});
  const [exitIdx, setExitIdx] = useState(null);
  const [overflow, setOverflow] = useState(false);
  const [underflow, setUnderflow] = useState(false);
  const [shaking, setShaking] = useState(false);

  const [operation, setOperation] = useState(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [stepDesc, setStepDesc] = useState("");
  const [traversalResult, setTraversalResult] = useState([]);

  const [speed, setSpeed] = useState(1);
  const [mode, setMode] = useState("auto");
  const [codeTab, setCodeTab] = useState("javascript");
  const [infoTab, setInfoTab] = useState("steps");
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const delay = useCallback((ms) => new Promise(r => setTimeout(r, ms)), []);
  const animDelay = useCallback(() => delay(Math.round(580 / speed)), [delay, speed]);

  const setStep = useCallback((i, op) => {
    setCurrentStep(i);
    if (op && ALGO_INFO[op]) setStepDesc(ALGO_INFO[op].steps[i] || "");
  }, []);

  const clearAll = useCallback(() => {
    setCellStates({});
    setCurrentStep(-1);
    setStepDesc("");
    setOverflow(false);
    setUnderflow(false);
    setShaking(false);
  }, []);

  // ── Create / Reset / Random ──
  const handleCreate = useCallback(() => {
    const s = parseInt(sizeInput, 10);
    if (isNaN(s) || s < 1 || s > 20) { showToast("Enter size between 1 and 20", "error"); return; }
    setMaxSize(s); setQueue([]); clearAll(); setTraversalResult([]);
    showToast(`Queue created with max size ${s}`);
  }, [sizeInput, clearAll, showToast]);

  const handleReset = useCallback(() => {
    setQueue([10, 20, 30, 40]); setMaxSize(8); setSizeInput("8");
    clearAll(); setTraversalResult([]); setOperation(null);
    showToast("Queue reset to default");
  }, [clearAll, showToast]);

  const handleRandom = useCallback(() => {
    const vals = Array.from({ length: randSize }, () => Math.floor(Math.random() * 90) + 10);
    const newMax = Math.max(randSize + 3, 8);
    setQueue(vals); setMaxSize(newMax); setSizeInput(String(newMax));
    clearAll(); setTraversalResult([]);
    showToast(`Generated ${randSize} random elements`);
  }, [randSize, clearAll, showToast]);

  // ── Enqueue ──
  const handleEnqueue = useCallback(async () => {
    const v = parseInt(value, 10);
    if (isNaN(v)) { showToast("Enter a valid integer", "error"); return; }
    setOperation("enqueue");
    setStep(0, "enqueue");
    await animDelay();

    if (queue.length >= maxSize) {
      setOverflow(true);
      setStep(1, "enqueue");
      showToast("Queue Overflow! Cannot enqueue.", "error");
      await animDelay();
      setTimeout(() => { setOverflow(false); setCurrentStep(-1); setStepDesc(""); }, 800);
      return;
    }

    setStep(2, "enqueue");
    await animDelay();
    setStep(3, "enqueue");

    const newQ = [...queue, v];
    setQueue(newQ);
    setCellStates({ [newQ.length - 1]: "enqueue" });
    await animDelay();

    setStep(4, "enqueue");
    setTimeout(() => { setCellStates({}); setCurrentStep(-1); setStepDesc(""); }, 800);
    setValue("");
    showToast(`Enqueued ${v} at rear`);
  }, [value, queue, maxSize, animDelay, setStep, showToast]);

  // ── Dequeue ──
  const handleDequeue = useCallback(async () => {
    setOperation("dequeue");
    setStep(0, "dequeue");
    await animDelay();

    if (queue.length === 0) {
      setUnderflow(true);
      setShaking(true);
      setStep(1, "dequeue");
      showToast("Queue Underflow! Cannot dequeue.", "error");
      await animDelay();
      setTimeout(() => { setUnderflow(false); setShaking(false); setCurrentStep(-1); setStepDesc(""); }, 800);
      return;
    }

    const frontVal = queue[0];
    setCellStates({ 0: "dequeue" });
    setStep(2, "dequeue");
    await animDelay();

    setExitIdx(0);
    setStep(3, "dequeue");
    await animDelay();

    setQueue(q => q.slice(1));
    setExitIdx(null);
    setCellStates({});
    setStep(4, "dequeue");
    setTimeout(() => { setCurrentStep(-1); setStepDesc(""); }, 600);
    showToast(`Dequeued ${frontVal} from front`);
  }, [queue, animDelay, setStep, showToast]);

  // ── Peek ──
  const handlePeek = useCallback(async () => {
    setOperation("peek");
    setStep(0, "peek");
    await animDelay();

    if (queue.length === 0) {
      setStep(1, "peek");
      showToast("Queue is empty — nothing to peek", "warn");
      setTimeout(() => { setCurrentStep(-1); setStepDesc(""); }, 800);
      return;
    }

    setCellStates({ 0: "peek" });
    setStep(2, "peek");
    showToast(`Front element is ${queue[0]}`);
    await delay(1400);
    setCellStates({});
    setStep(3, "peek");
    setTimeout(() => { setCurrentStep(-1); setStepDesc(""); }, 400);
  }, [queue, animDelay, delay, setStep, showToast]);

  // ── Traverse ──
  const handleTraverse = useCallback(async () => {
    if (queue.length === 0) { showToast("Queue is empty", "warn"); return; }
    setOperation("traverse");
    const result = [];
    for (let i = 0; i < queue.length; i++) {
      setStep(i === 0 ? 0 : 2, "traverse");
      setCellStates({ [i]: "traverse" });
      result.push(queue[i]);
      await animDelay();
      setCellStates({});
      await delay(80);
    }
    setTraversalResult([...result]);
    setStep(4, "traverse");
    setTimeout(() => { setCurrentStep(-1); setStepDesc(""); }, 600);
    showToast("Traversal complete");
  }, [queue, animDelay, delay, setStep, showToast]);

  // ── isEmpty / isFull ──
  const handleIsEmpty = useCallback(async () => {
    setOperation("isEmpty");
    setStep(0, "isEmpty");
    await animDelay();
    const empty = queue.length === 0;
    setStep(1, "isEmpty");
    await animDelay();
    setStep(2, "isEmpty");
    showToast(empty ? "Queue IS empty" : "Queue is NOT empty", empty ? "warn" : "success");
    setTimeout(() => { setCurrentStep(-1); setStepDesc(""); }, 800);
  }, [queue, animDelay, setStep, showToast]);

  const handleIsFull = useCallback(async () => {
    setOperation("isFull");
    setStep(0, "isFull");
    await animDelay();
    const full = queue.length >= maxSize;
    if (full) setOverflow(true);
    setStep(1, "isFull");
    await animDelay();
    setStep(2, "isFull");
    showToast(full ? "Queue IS full — overflow risk!" : "Queue is NOT full", full ? "error" : "success");
    setTimeout(() => { setCurrentStep(-1); setStepDesc(""); setOverflow(false); }, 1000);
  }, [queue, maxSize, animDelay, setStep, showToast]);

  const opCodeKey = operation || "enqueue";

  return (
    <>
      <style>{G}</style>
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column" }}>

        {/* ── HEADER ── */}
        <header style={{ background: T.panel, borderBottom: `1px solid ${T.border}`, height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 28, height: 28, background: `linear-gradient(135deg, ${T.accent}, ${T.teal})`, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900 }}>Q</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: .5 }}>DSA Visualizer</div>
              <div className="mono" style={{ fontSize: 9, color: T.muted, marginTop: -2 }}>Queue Explorer — FIFO</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={() => setIsCircular(c => !c)}
              className={`btn ${isCircular ? "btn-purple" : ""}`}
              style={{ fontSize: 11, padding: "4px 12px" }}
            >
              {isCircular ? "⟳ Circular" : "→ Linear"}
            </button>
            <span className="mono" style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: `${T.accent}15`, border: `1px solid ${T.accent}30`, color: T.accent }}>{queue.length}/{maxSize}</span>
            <span className="mono" style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: `${queue.length === 0 ? T.red : T.green}15`, border: `1px solid ${queue.length === 0 ? T.red : T.green}30`, color: queue.length === 0 ? T.red : T.green }}>
              {queue.length === 0 ? "EMPTY" : queue.length === maxSize ? "FULL" : "OK"}
            </span>
          </div>
        </header>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 14, gap: 12, overflow: "hidden" }}>

          {/* ── INIT PANEL ── */}
          <div className="panel" style={{ padding: 14, flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: "0 1 130px" }}>
                <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 5 }}>MAX SIZE</label>
                <input className="inp" type="number" min={1} max={20} value={sizeInput} onChange={e => setSizeInput(e.target.value)} placeholder="8" />
              </div>
              <div style={{ flex: "1 1 150px" }}>
                <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 5 }}>
                  RANDOM SIZE: <span style={{ color: T.accent }}>{randSize}</span>
                </label>
                <input type="range" min={2} max={10} value={randSize} onChange={e => setRandSize(+e.target.value)} className="slider" />
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-sky" onClick={handleCreate}>Create</button>
                <button className="btn btn-amber" onClick={handleRandom}>Random</button>
                <button className="btn" onClick={handleReset}>Reset</button>
              </div>
              <div style={{ flex: "1 1 140px", marginLeft: "auto" }}>
                <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 5 }}>
                  SPEED: <span style={{ color: T.accent }}>{speed}x</span>
                </label>
                <input type="range" min={0.25} max={3} step={0.25} value={speed} onChange={e => setSpeed(+e.target.value)} className="slider" />
              </div>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1 }}>MODE</label>
                <button className={`btn${mode === "auto" ? " btn-sky" : ""}`} style={{ fontSize: 11, padding: "5px 10px" }} onClick={() => setMode("auto")}>Auto</button>
                <button className={`btn${mode === "step" ? " btn-sky" : ""}`} style={{ fontSize: 11, padding: "5px 10px" }} onClick={() => setMode("step")}>Step</button>
              </div>
            </div>
          </div>

          {/* ── MAIN ── */}
          <div style={{ flex: 1, display: "flex", gap: 14, overflow: "hidden", minHeight: 0 }}>

            {/* CENTER */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, overflow: "auto", minWidth: 0 }}>

              {/* Canvas */}
              <div className="panel" style={{ padding: 18 }}>
                <QueueCanvas
                  queue={queue}
                  maxSize={maxSize}
                  cellStates={cellStates}
                  exitIdx={exitIdx}
                  overflow={overflow}
                  underflow={underflow}
                  traversalResult={traversalResult}
                  isCircular={isCircular}
                  shaking={shaking}
                />
              </div>

              {/* Operations */}
              <div className="panel" style={{ padding: 14 }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                  <div style={{ flex: "0 1 130px" }}>
                    <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 5 }}>VALUE</label>
                    <input className="inp" type="number" value={value} onChange={e => setValue(e.target.value)} onKeyDown={e => e.key === "Enter" && handleEnqueue()} placeholder="e.g. 42" />
                  </div>
                  <div>
                    <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 5 }}>QUEUE OPS</label>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-sky" onClick={handleEnqueue}>Enqueue</button>
                      <button className="btn btn-red" onClick={handleDequeue}>Dequeue</button>
                      <button className="btn btn-teal" onClick={handlePeek}>Peek</button>
                      <button className="btn btn-green" onClick={handleTraverse}>Traverse</button>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 5 }}>CHECKS</label>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-amber" onClick={handleIsEmpty}>isEmpty</button>
                      <button className="btn btn-amber" onClick={handleIsFull}>isFull</button>
                    </div>
                  </div>
                </div>

                {stepDesc && (
                  <div style={{ marginTop: 10, padding: "7px 14px", background: `${T.accent}10`, border: `1px solid ${T.accent}25`, borderRadius: 7 }}>
                    <span className="mono" style={{ fontSize: 11, color: T.accent }}>▶ {stepDesc}</span>
                  </div>
                )}
              </div>

              {/* Real-world uses */}
              <div className="panel" style={{ padding: 14 }}>
                <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>REAL-WORLD USES</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    { label: "Printer Queue",    icon: "🖨", color: T.accent },
                    { label: "Task Scheduling",  icon: "📋", color: T.teal },
                    { label: "CPU Processes",    icon: "⚙",  color: T.purple },
                    { label: "Customer Service", icon: "🎫", color: T.amber },
                    { label: "BFS Traversal",    icon: "🕸",  color: T.green },
                    { label: "Async Messages",   icon: "📨", color: T.red },
                  ].map(({ label, icon, color }) => (
                    <div key={label} style={{ background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 7, padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 13 }}>{icon}</span>
                      <span style={{ fontSize: 11, color: T.muted }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div style={{ width: 292, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12, overflow: "auto" }}>

              {/* Algorithm info */}
              <div className="panel" style={{ padding: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 3 }}>
                  {operation ? ALGO_INFO[operation]?.name : "Select an Operation"}
                </div>
                <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.6, marginBottom: 12 }}>
                  {operation ? ALGO_INFO[operation]?.desc : "Perform a queue operation to see the step-by-step algorithm."}
                </div>

                <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, marginBottom: 10 }}>
                  {["steps", "pseudo", "flow", "complexity"].map(t => (
                    <button key={t} onClick={() => setInfoTab(t)} className={infoTab === t ? "tab-a" : "tab-i"}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 9px", fontSize: 9, fontWeight: 700, letterSpacing: .5, fontFamily: "'DM Sans'" }}>
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>

                {infoTab === "steps" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {(operation ? ALGO_INFO[operation].steps : ["Run an operation to see steps"]).map((step, i) => (
                      <div key={i} style={{
                        display: "flex", gap: 8, alignItems: "flex-start",
                        padding: "5px 8px", borderRadius: 6,
                        background: currentStep === i ? `${T.accent}15` : currentStep > i ? `${T.green}08` : "transparent",
                        border: `1px solid ${currentStep === i ? T.accent + "40" : "transparent"}`,
                        transition: "all .3s",
                      }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                          background: currentStep > i ? `${T.green}25` : currentStep === i ? `${T.accent}25` : T.dim,
                          border: `1.5px solid ${currentStep > i ? T.green : currentStep === i ? T.accent : T.border}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 8, fontFamily: "IBM Plex Mono",
                          color: currentStep > i ? T.green : currentStep === i ? T.accent : T.muted,
                          fontWeight: 700,
                        }}>
                          {currentStep > i ? "✓" : i + 1}
                        </div>
                        <span style={{ fontSize: 11, color: currentStep === i ? T.text : currentStep > i ? T.green : T.muted, lineHeight: 1.4 }}>{step}</span>
                      </div>
                    ))}
                  </div>
                )}

                {infoTab === "pseudo" && (
                  <div className="code-view">{operation ? ALGO_INFO[operation].pseudo : "// Run an operation to see pseudocode"}</div>
                )}

                {infoTab === "flow" && (
                  <div style={{ display: "flex", justifyContent: "center", padding: "6px 0" }}>
                    <OperationFlow operation={operation || "enqueue"} currentStep={currentStep} />
                  </div>
                )}

                {infoTab === "complexity" && (
                  <div>
                    {operation ? (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {[
                          { label: "TIME", val: COMPLEXITY[operation]?.time, color: T.accent },
                          { label: "SPACE", val: COMPLEXITY[operation]?.space, color: T.purple },
                        ].map(({ label, val, color }) => (
                          <div key={label} style={{ textAlign: "center", padding: "10px", background: `${color}10`, border: `1px solid ${color}25`, borderRadius: 8 }}>
                            <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>{label}</div>
                            <div className="mono" style={{ fontSize: 20, fontWeight: 700, color }}>{val}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {Object.entries(COMPLEXITY).map(([op, c]) => (
                          <div key={op} style={{ display: "flex", justifyContent: "space-between", padding: "5px 8px", background: T.dim, borderRadius: 6 }}>
                            <span className="mono" style={{ fontSize: 11, color: T.muted }}>{op}</span>
                            <span className="mono" style={{ fontSize: 11, color: T.accent }}>{c.time}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Code viewer */}
              <div className="panel" style={{ padding: 14 }}>
                <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>CODE</div>
                <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, marginBottom: 8 }}>
                  {["javascript", "python", "java", "cpp"].map(l => (
                    <button key={l} onClick={() => setCodeTab(l)} className={codeTab === l ? "tab-a" : "tab-i"}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "3px 9px", fontSize: 9, fontWeight: 700, letterSpacing: .5, fontFamily: "IBM Plex Mono" }}>
                      {l === "cpp" ? "C++" : l === "javascript" ? "JS" : l.charAt(0).toUpperCase() + l.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="code-view">{CODE[codeTab][opCodeKey] || CODE[codeTab].enqueue}</div>
              </div>

              {/* Legend */}
              <div className="panel" style={{ padding: 14 }}>
                <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>LEGEND</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                  {[
                    { color: T.green,  label: "Enqueued" },
                    { color: T.red,    label: "Dequeued" },
                    { color: T.teal,   label: "Peek" },
                    { color: T.accent, label: "Traverse" },
                    { color: T.amber,  label: "Found" },
                    { color: T.purple, label: "Circular" },
                  ].map(({ color, label }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: `${color}35`, border: `1.5px solid ${color}` }} />
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
