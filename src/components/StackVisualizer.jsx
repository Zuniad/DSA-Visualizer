import { useState, useCallback, useRef, useEffect, useMemo } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#060810",
  surface: "#0b0e18",
  panel: "#0f1220",
  border: "#181d2e",
  accent: "#6366f1",
  green: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  cyan: "#22d3ee",
  pink: "#ec4899",
  text: "#e2e8f0",
  muted: "#4b5563",
  dim: "#131624",
};

// ─── COMPLEXITY ───────────────────────────────────────────────────────────────
const COMPLEXITY = {
  push:     { time: "O(1)", space: "O(1)" },
  pop:      { time: "O(1)", space: "O(1)" },
  peek:     { time: "O(1)", space: "O(1)" },
  isEmpty:  { time: "O(1)", space: "O(1)" },
  isFull:   { time: "O(1)", space: "O(1)" },
  traverse: { time: "O(n)", space: "O(1)" },
};

const ALGO_INFO = {
  push: {
    name: "Push",
    desc: "Adds a new element on top of the stack. Fails if the stack is full (overflow).",
    steps: ["Check if stack is full (top === maxSize-1)", "If full → Stack Overflow error", "Increment top pointer (top++)", "Insert element at stack[top]", "✓ Element pushed successfully"],
    pseudo: `push(value):
  if top == maxSize - 1:
    raise StackOverflow
  top = top + 1
  stack[top] = value`,
  },
  pop: {
    name: "Pop",
    desc: "Removes and returns the top element from the stack. Fails if the stack is empty (underflow).",
    steps: ["Check if stack is empty (top === -1)", "If empty → Stack Underflow error", "Store value at stack[top]", "Decrement top pointer (top--)", "✓ Element popped successfully"],
    pseudo: `pop():
  if top == -1:
    raise StackUnderflow
  value = stack[top]
  top = top - 1
  return value`,
  },
  peek: {
    name: "Peek",
    desc: "Returns the top element without removing it. The stack remains unchanged.",
    steps: ["Check if stack is empty (top === -1)", "If empty → return null", "Return stack[top]", "✓ Top element retrieved"],
    pseudo: `peek():
  if top == -1:
    return null
  return stack[top]`,
  },
  traverse: {
    name: "Traverse",
    desc: "Visits every element from top to bottom without modifying the stack.",
    steps: ["Start at index = top", "Read current element", "Move to index - 1", "Repeat until index < 0", "✓ Traversal complete"],
    pseudo: `traverse():
  for i = top downto 0:
    visit(stack[i])`,
  },
  isEmpty: {
    name: "isEmpty",
    desc: "Checks whether the stack contains any elements.",
    steps: ["Check if top == -1", "If yes → stack is empty", "If no → stack has elements", "✓ Result returned"],
    pseudo: `isEmpty():
  return top == -1`,
  },
  isFull: {
    name: "isFull",
    desc: "Checks whether the stack has reached its maximum capacity.",
    steps: ["Check if top == maxSize - 1", "If yes → stack is full", "If no → space available", "✓ Result returned"],
    pseudo: `isFull():
  return top == maxSize - 1`,
  },
};

const CODE = {
  javascript: {
    push: `class Stack {
  constructor(maxSize) {
    this.stack = [];
    this.top = -1;
    this.maxSize = maxSize;
  }

  push(value) {
    if (this.top === this.maxSize - 1) {
      throw new Error("Stack Overflow");
    }
    this.top++;
    this.stack[this.top] = value;
  }
}`,
    pop: `pop() {
  if (this.top === -1) {
    throw new Error("Stack Underflow");
  }
  const value = this.stack[this.top];
  this.top--;
  return value;
}`,
    peek: `peek() {
  if (this.top === -1) return null;
  return this.stack[this.top];
}`,
    traverse: `traverse() {
  if (this.top === -1) return [];
  const result = [];
  for (let i = this.top; i >= 0; i--) {
    result.push(this.stack[i]);
  }
  return result;
}`,
    isEmpty: `isEmpty() {
  return this.top === -1;
}`,
    isFull: `isFull() {
  return this.top === this.maxSize - 1;
}`,
  },
  python: {
    push: `class Stack:
    def __init__(self, max_size):
        self.stack = []
        self.top = -1
        self.max_size = max_size

    def push(self, value):
        if self.top == self.max_size - 1:
            raise Exception("Stack Overflow")
        self.top += 1
        self.stack.append(value)`,
    pop: `    def pop(self):
        if self.top == -1:
            raise Exception("Stack Underflow")
        value = self.stack[self.top]
        self.stack.pop()
        self.top -= 1
        return value`,
    peek: `    def peek(self):
        if self.top == -1:
            return None
        return self.stack[self.top]`,
    traverse: `    def traverse(self):
        result = []
        for i in range(self.top, -1, -1):
            result.append(self.stack[i])
        return result`,
    isEmpty: `    def is_empty(self):
        return self.top == -1`,
    isFull: `    def is_full(self):
        return self.top == self.max_size - 1`,
  },
  java: {
    push: `public class Stack {
    private int[] stack;
    private int top;
    private int maxSize;

    public Stack(int maxSize) {
        this.maxSize = maxSize;
        this.stack = new int[maxSize];
        this.top = -1;
    }

    public void push(int value) {
        if (top == maxSize - 1)
            throw new RuntimeException("Overflow");
        stack[++top] = value;
    }
}`,
    pop: `public int pop() {
    if (top == -1)
        throw new RuntimeException("Underflow");
    return stack[top--];
}`,
    peek: `public int peek() {
    if (top == -1)
        throw new RuntimeException("Empty");
    return stack[top];
}`,
    traverse: `public void traverse() {
    for (int i = top; i >= 0; i--)
        System.out.print(stack[i] + " ");
}`,
    isEmpty: `public boolean isEmpty() {
    return top == -1;
}`,
    isFull: `public boolean isFull() {
    return top == maxSize - 1;
}`,
  },
  cpp: {
    push: `class Stack {
    vector<int> stack;
    int top = -1;
    int maxSize;
public:
    Stack(int size) : maxSize(size) {}

    void push(int value) {
        if (top == maxSize - 1)
            throw overflow_error("Stack Overflow");
        stack.push_back(value);
        top++;
    }
};`,
    pop: `int pop() {
    if (top == -1)
        throw underflow_error("Stack Underflow");
    int val = stack[top];
    stack.pop_back();
    top--;
    return val;
}`,
    peek: `int peek() {
    if (top == -1)
        throw runtime_error("Empty Stack");
    return stack[top];
}`,
    traverse: `void traverse() {
    for (int i = top; i >= 0; i--)
        cout << stack[i] << " ";
}`,
    isEmpty: `bool isEmpty() {
    return top == -1;
}`,
    isFull: `bool isFull() {
    return top == maxSize - 1;
}`,
  },
};

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const G = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Fira+Code:wght@400;500;600&display=swap');

*{box-sizing:border-box;margin:0;padding:0;}
body{background:${T.bg};color:${T.text};font-family:'Outfit',sans-serif;}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:${T.surface};}
::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px;}

@keyframes dropIn{
  0%{opacity:0;transform:translateY(-60px) scale(0.85);}
  60%{transform:translateY(4px) scale(1.03);}
  100%{opacity:1;transform:translateY(0) scale(1);}
}
@keyframes liftOut{
  0%{opacity:1;transform:translateY(0) scale(1);}
  40%{transform:translateY(-10px) scale(1.05);}
  100%{opacity:0;transform:translateY(-70px) scale(0.8);}
}
@keyframes peekGlow{
  0%,100%{box-shadow:none;}
  50%{box-shadow:0 0 0 3px ${T.cyan}80,0 0 24px ${T.cyan}50;}
}
@keyframes traversePulse{
  0%,100%{background:${T.panel};}
  50%{background:${T.accent}22;}
}
@keyframes overflowShake{
  0%,100%{transform:translateX(0);}
  20%{transform:translateX(-8px);}
  40%{transform:translateX(8px);}
  60%{transform:translateX(-5px);}
  80%{transform:translateX(5px);}
}
@keyframes underflowPulse{
  0%,100%{opacity:1;}
  50%{opacity:0.3;}
}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
@keyframes topArrowBounce{
  0%,100%{transform:translateX(-50%) translateY(0);}
  50%{transform:translateX(-50%) translateY(-4px);}
}
@keyframes emptyPulse{
  0%,100%{border-color:${T.border};}
  50%{border-color:${T.red}60;}
}
@keyframes fullFlash{
  0%,100%{border-color:${T.border};}
  50%{border-color:${T.red}80;box-shadow:0 0 20px ${T.red}30;}
}

.el-enter{animation:dropIn 0.45s cubic-bezier(.34,1.56,.64,1) forwards;}
.el-exit{animation:liftOut 0.4s ease-in forwards;}
.el-peek{animation:peekGlow 0.8s ease-in-out;}
.el-traverse{animation:traversePulse 0.5s ease;}
.el-overflow{animation:overflowShake 0.5s ease;}
.el-underflow{animation:underflowPulse 0.6s ease 2;}

.btn{
  background:${T.panel};
  border:1px solid ${T.border};
  color:${T.muted};
  padding:8px 16px;
  border-radius:7px;
  cursor:pointer;
  font-family:'Outfit',sans-serif;
  font-weight:600;
  font-size:13px;
  transition:all .2s;
  white-space:nowrap;
}
.btn:hover{color:${T.text};border-color:${T.muted};}
.btn:disabled{opacity:.3;cursor:not-allowed;}
.btn-indigo{background:${T.accent}18;border-color:${T.accent}50;color:${T.accent};}
.btn-indigo:hover{background:${T.accent}28;border-color:${T.accent};box-shadow:0 0 14px ${T.accent}30;}
.btn-red{background:${T.red}18;border-color:${T.red}50;color:${T.red};}
.btn-red:hover{background:${T.red}28;border-color:${T.red};}
.btn-cyan{background:${T.cyan}18;border-color:${T.cyan}50;color:${T.cyan};}
.btn-cyan:hover{background:${T.cyan}28;border-color:${T.cyan};}
.btn-green{background:${T.green}18;border-color:${T.green}50;color:${T.green};}
.btn-green:hover{background:${T.green}28;border-color:${T.green};}
.btn-amber{background:${T.amber}18;border-color:${T.amber}50;color:${T.amber};}
.btn-amber:hover{background:${T.amber}28;border-color:${T.amber};}

.inp{
  background:${T.surface};
  border:1px solid ${T.border};
  color:${T.text};
  padding:8px 12px;
  border-radius:7px;
  font-family:'Fira Code',monospace;
  font-size:13px;
  outline:none;
  transition:border-color .2s;
  width:100%;
}
.inp:focus{border-color:${T.accent}70;}
.inp::placeholder{color:${T.muted};}

.panel{background:${T.panel};border:1px solid ${T.border};border-radius:12px;}
.mono{font-family:'Fira Code',monospace;}

.code-view{
  background:#040609;
  border:1px solid ${T.border};
  border-radius:8px;
  padding:14px;
  font-family:'Fira Code',monospace;
  font-size:11.5px;
  line-height:1.8;
  color:#8899b4;
  overflow:auto;
  white-space:pre;
  max-height:200px;
}

.tab-a{border-bottom:2px solid ${T.accent};color:${T.accent};background:${T.accent}10;}
.tab-i{border-bottom:2px solid transparent;color:${T.muted};}
.tab-i:hover{color:${T.text};}

.slider{
  -webkit-appearance:none;
  width:100%;height:3px;
  border-radius:2px;
  background:${T.border};
  outline:none;
}
.slider::-webkit-slider-thumb{
  -webkit-appearance:none;
  width:14px;height:14px;
  border-radius:50%;
  background:${T.accent};
  cursor:pointer;
  box-shadow:0 0 8px ${T.accent}60;
}

.toast{
  position:fixed;
  bottom:20px;right:20px;
  padding:10px 18px;
  border-radius:8px;
  font-family:'Fira Code',monospace;
  font-size:11px;
  z-index:999;
  animation:fadeUp .3s ease;
}

.flow-node{
  padding:8px 14px;
  border-radius:7px;
  font-size:11px;
  font-family:'Fira Code',monospace;
  font-weight:500;
  text-align:center;
  transition:all .3s;
}
`;

// ─── STACK ELEMENT ─────────────────────────────────────────────────────────────
function StackElement({ value, isTop, state, index, maxSize }) {
  const stateStyles = {
    default:  { bg: T.panel,         border: T.border,  color: T.text,  glow: "none" },
    peek:     { bg: `${T.cyan}20`,   border: T.cyan,    color: T.cyan,  glow: `0 0 18px ${T.cyan}50` },
    traverse: { bg: `${T.accent}20`, border: T.accent,  color: T.accent,glow: `0 0 12px ${T.accent}40` },
    new:      { bg: `${T.green}15`,  border: T.green,   color: T.green, glow: `0 0 14px ${T.green}40` },
    popped:   { bg: `${T.red}15`,    border: T.red,     color: T.red,   glow: `0 0 14px ${T.red}40` },
    found:    { bg: `${T.amber}20`,  border: T.amber,   color: T.amber, glow: `0 0 14px ${T.amber}40` },
  };

  const s = stateStyles[state] || stateStyles.default;
  const fillPct = ((index + 1) / maxSize) * 100;

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Top pointer */}
      {isTop && (
        <div style={{
          position: "absolute",
          left: "50%",
          top: -22,
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          animation: "topArrowBounce 1.5s ease-in-out infinite",
          zIndex: 10,
        }}>
          <span style={{ fontFamily: "Fira Code", fontSize: 9, color: T.cyan, fontWeight: 600, letterSpacing: 1, background: `${T.cyan}15`, padding: "1px 6px", borderRadius: 3, border: `1px solid ${T.cyan}30` }}>TOP</span>
          <div style={{ width: 1.5, height: 8, background: T.cyan }} />
          <div style={{ width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: `7px solid ${T.cyan}` }} />
        </div>
      )}

      <div
        className={`el-${state === "peek" ? "peek" : state === "traverse" ? "traverse" : ""}`}
        style={{
          width: "100%",
          background: s.bg,
          border: `1.5px solid ${s.border}`,
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          boxShadow: s.glow,
          transition: "all .3s",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Fill bar */}
        <div style={{
          position: "absolute",
          left: 0, top: 0, bottom: 0,
          width: `${fillPct}%`,
          background: `linear-gradient(90deg, ${s.border}15, transparent)`,
          borderRadius: "8px 0 0 8px",
          transition: "width .3s",
        }} />

        <div style={{ display: "flex", alignItems: "center", gap: 10, zIndex: 1 }}>
          <span style={{ fontFamily: "Fira Code", fontSize: 9, color: T.muted, background: T.dim, padding: "2px 6px", borderRadius: 3 }}>[{index}]</span>
          <span className="mono" style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{value}</span>
        </div>

        {isTop && (
          <span style={{ fontFamily: "Fira Code", fontSize: 9, color: T.cyan, background: `${T.cyan}15`, padding: "2px 8px", borderRadius: 3, border: `1px solid ${T.cyan}30`, zIndex: 1, letterSpacing: 1 }}>↑ TOP</span>
        )}
      </div>
    </div>
  );
}

// ─── STACK CANVAS ──────────────────────────────────────────────────────────────
function StackCanvas({ stack, maxSize, cellStates, exitIdx, overflow, underflow, traversalResult }) {
  const emptySlots = Math.max(0, maxSize - stack.length);

  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", justifyContent: "center" }}>
      {/* Main stack column */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 240 }}>
        {/* Overflow zone */}
        <div style={{
          width: "100%",
          padding: "8px 14px",
          borderRadius: 8,
          border: `1.5px dashed ${overflow ? T.red : T.border}`,
          background: overflow ? `${T.red}10` : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 38,
          transition: "all .3s",
          animation: overflow ? "fullFlash 0.5s ease" : "none",
        }}>
          {overflow ? (
            <span style={{ fontFamily: "Fira Code", fontSize: 11, color: T.red, fontWeight: 600 }}>⚠ STACK OVERFLOW</span>
          ) : (
            <span style={{ fontFamily: "Fira Code", fontSize: 9, color: T.muted }}>← push zone</span>
          )}
        </div>

        {/* Capacity indicator */}
        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", padding: "2px 4px" }}>
          <span style={{ fontFamily: "Fira Code", fontSize: 9, color: T.muted }}>capacity: {maxSize}</span>
          <span style={{ fontFamily: "Fira Code", fontSize: 9, color: stack.length === maxSize ? T.red : T.green }}>
            {stack.length}/{maxSize} filled
          </span>
        </div>

        {/* Stack wall + elements */}
        <div style={{
          width: "100%",
          border: `2px solid ${T.border}`,
          borderRadius: 10,
          padding: 10,
          display: "flex",
          flexDirection: "column",
          gap: 6,
          background: T.surface,
          position: "relative",
          minHeight: Math.max(80, maxSize * 52),
          animation: underflow ? "emptyPulse 0.6s ease 2" : "none",
        }}>
          {/* Wall decoration */}
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: `linear-gradient(180deg, ${T.accent}80, ${T.accent}20)`, borderRadius: "10px 0 0 10px" }} />
          <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: 3, background: `linear-gradient(180deg, ${T.accent}80, ${T.accent}20)`, borderRadius: "0 10px 10px 0" }} />

          {/* Empty slots (top) */}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <div key={`empty-${i}`} style={{
              width: "100%",
              height: 42,
              border: `1px dashed ${T.border}`,
              borderRadius: 7,
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <span style={{ fontFamily: "Fira Code", fontSize: 9, color: T.muted, opacity: .4 }}>—</span>
            </div>
          ))}

          {/* Stack elements (top to bottom display = array reversed) */}
          {[...stack].reverse().map((val, ri) => {
            const realIdx = stack.length - 1 - ri;
            const isTop = realIdx === stack.length - 1;
            const isExiting = exitIdx === realIdx;
            const state = cellStates[realIdx] || "default";
            return (
              <div
                key={`${realIdx}-${val}`}
                className={isExiting ? "el-exit" : isTop && state === "new" ? "el-enter" : ""}
                style={{ width: "100%", paddingTop: isTop ? 20 : 0 }}
              >
                <StackElement
                  value={val}
                  isTop={isTop}
                  state={state}
                  index={realIdx}
                  maxSize={maxSize}
                />
              </div>
            );
          })}

          {/* Empty label */}
          {stack.length === 0 && (
            <div style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              animation: underflow ? "underflowPulse 0.6s ease 2" : "none",
            }}>
              <div style={{ fontSize: 28, opacity: .2 }}>⬡</div>
              <span style={{ fontFamily: "Fira Code", fontSize: 11, color: underflow ? T.red : T.muted }}>
                {underflow ? "⚠ Stack Underflow" : "Stack Empty"}
              </span>
            </div>
          )}
        </div>

        {/* Base */}
        <div style={{
          width: "90%",
          height: 6,
          background: `linear-gradient(90deg, transparent, ${T.border}, transparent)`,
          borderRadius: 3,
        }} />
        <div style={{ fontFamily: "Fira Code", fontSize: 9, color: T.muted, letterSpacing: 1 }}>BOTTOM (index 0)</div>
      </div>

      {/* Right: traversal + fill meter */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, minWidth: 120 }}>
        {/* Fill meter */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
          <span style={{ fontFamily: "Fira Code", fontSize: 9, color: T.muted, letterSpacing: 1 }}>FILL</span>
          <div style={{
            width: 18,
            height: Math.max(80, maxSize * 52),
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 9,
            overflow: "hidden",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
          }}>
            <div style={{
              width: "100%",
              height: `${(stack.length / maxSize) * 100}%`,
              background: stack.length === maxSize
                ? `linear-gradient(180deg, ${T.red}, ${T.red}80)`
                : `linear-gradient(180deg, ${T.accent}, ${T.accent}60)`,
              transition: "height .4s ease",
              borderRadius: "0 0 9px 9px",
            }} />
          </div>
          <span style={{ fontFamily: "Fira Code", fontSize: 10, color: stack.length === maxSize ? T.red : T.accent, fontWeight: 700 }}>
            {Math.round((stack.length / maxSize) * 100)}%
          </span>
        </div>

        {/* Traversal result */}
        {traversalResult.length > 0 && (
          <div style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 8,
            padding: "8px 10px",
          }}>
            <div style={{ fontFamily: "Fira Code", fontSize: 9, color: T.muted, marginBottom: 6, letterSpacing: 1 }}>TRAVERSAL</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {traversalResult.map((v, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {i > 0 && <div style={{ width: 1, height: 8, background: T.border, marginLeft: 8 }} />}
                  <span className="mono" style={{ fontSize: 12, color: T.cyan, background: `${T.cyan}10`, padding: "2px 8px", borderRadius: 4 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── OPERATION FLOW ───────────────────────────────────────────────────────────
function OperationFlow({ operation, currentStep }) {
  const flows = {
    push:     ["Start", "Check Full?", "top++", "stack[top]=val", "End"],
    pop:      ["Start", "Check Empty?", "val=stack[top]", "top--", "Return val"],
    peek:     ["Start", "Check Empty?", "Return stack[top]", "End"],
    traverse: ["Start", "i = top", "Visit stack[i]", "i--", "i < 0? End"],
    isEmpty:  ["Start", "top == -1?", "Return bool", "End"],
    isFull:   ["Start", "top==maxSize-1?", "Return bool", "End"],
  };

  const steps = flows[operation] || [];
  if (!steps.length) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
          <div className="flow-node" style={{
            background: currentStep === i ? `${T.accent}25` : T.dim,
            border: `1.5px solid ${currentStep === i ? T.accent : T.border}`,
            color: currentStep === i ? T.accent : T.muted,
            boxShadow: currentStep === i ? `0 0 12px ${T.accent}30` : "none",
            minWidth: 130,
          }}>
            {step}
          </div>
          {i < steps.length - 1 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
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
  const [stack, setStack] = useState([10, 20, 30]);
  const [maxSize, setMaxSize] = useState(7);
  const [sizeInput, setSizeInput] = useState("7");
  const [randSize, setRandSize] = useState(4);

  const [value, setValue] = useState("");
  const [cellStates, setCellStates] = useState({});
  const [exitIdx, setExitIdx] = useState(null);
  const [overflow, setOverflow] = useState(false);
  const [underflow, setUnderflow] = useState(false);

  const [operation, setOperation] = useState(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [stepDesc, setStepDesc] = useState("");

  const [traversalResult, setTraversalResult] = useState([]);
  const [speed, setSpeed] = useState(1);
  const [mode, setMode] = useState("auto");

  const [codeTab, setCodeTab] = useState("javascript");
  const [infoTab, setInfoTab] = useState("steps"); // steps | pseudo | flow | complexity

  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const delay = useCallback((ms) => new Promise(r => setTimeout(r, ms)), []);
  const animDelay = useCallback(() => delay(Math.round(600 / speed)), [delay, speed]);

  const setStep = useCallback((i, op) => {
    setCurrentStep(i);
    if (op && ALGO_INFO[op]) setStepDesc(ALGO_INFO[op].steps[i] || "");
  }, []);

  const clearStates = useCallback(() => {
    setCellStates({});
    setCurrentStep(-1);
    setStepDesc("");
    setOverflow(false);
    setUnderflow(false);
  }, []);

  // ── Create / Reset ──
  const handleCreate = useCallback(() => {
    const s = parseInt(sizeInput, 10);
    if (isNaN(s) || s < 1 || s > 20) { showToast("Enter size between 1 and 20", "error"); return; }
    setMaxSize(s);
    setStack([]);
    clearStates();
    setTraversalResult([]);
    showToast(`Stack created with max size ${s}`);
  }, [sizeInput, clearStates, showToast]);

  const handleReset = useCallback(() => {
    setStack([10, 20, 30]);
    setMaxSize(7);
    setSizeInput("7");
    clearStates();
    setTraversalResult([]);
    setOperation(null);
    showToast("Stack reset");
  }, [clearStates, showToast]);

  const handleRandom = useCallback(() => {
    const vals = Array.from({ length: randSize }, () => Math.floor(Math.random() * 90) + 10);
    const newMax = Math.max(randSize + 2, 7);
    setStack(vals);
    setMaxSize(newMax);
    setSizeInput(String(newMax));
    clearStates();
    setTraversalResult([]);
    showToast(`Generated stack with ${randSize} elements`);
  }, [randSize, clearStates, showToast]);

  // ── Push ──
  const handlePush = useCallback(async () => {
    const v = parseInt(value, 10);
    if (isNaN(v)) { showToast("Enter a valid integer", "error"); return; }

    setOperation("push");
    setStep(0, "push");
    await animDelay();

    if (stack.length >= maxSize) {
      setOverflow(true);
      setStep(1, "push");
      showToast("Stack Overflow! Cannot push.", "error");
      await animDelay();
      setOverflow(false);
      setCurrentStep(-1);
      return;
    }

    setStep(2, "push");
    await animDelay();
    setStep(3, "push");

    const newStack = [...stack, v];
    setStack(newStack);
    setCellStates({ [newStack.length - 1]: "new" });
    await animDelay();

    setStep(4, "push");
    setTimeout(() => { setCellStates({}); setCurrentStep(-1); setStepDesc(""); }, 800);
    setValue("");
    showToast(`Pushed ${v} onto stack`);
  }, [value, stack, maxSize, animDelay, setStep, showToast]);

  // ── Pop ──
  const handlePop = useCallback(async () => {
    setOperation("pop");
    setStep(0, "pop");
    await animDelay();

    if (stack.length === 0) {
      setUnderflow(true);
      setStep(1, "pop");
      showToast("Stack Underflow! Cannot pop.", "error");
      await animDelay();
      setUnderflow(false);
      setCurrentStep(-1);
      return;
    }

    const topIdx = stack.length - 1;
    const topVal = stack[topIdx];

    setStep(2, "pop");
    setCellStates({ [topIdx]: "popped" });
    await animDelay();

    setExitIdx(topIdx);
    setStep(3, "pop");
    await animDelay();

    setStack(s => s.slice(0, -1));
    setExitIdx(null);
    setCellStates({});
    setStep(4, "pop");

    setTimeout(() => { setCurrentStep(-1); setStepDesc(""); }, 600);
    showToast(`Popped ${topVal} from stack`);
  }, [stack, animDelay, setStep, showToast]);

  // ── Peek ──
  const handlePeek = useCallback(async () => {
    setOperation("peek");
    setStep(0, "peek");
    await animDelay();

    if (stack.length === 0) {
      setStep(1, "peek");
      showToast("Stack is empty — nothing to peek", "warn");
      await animDelay();
      setCurrentStep(-1);
      return;
    }

    const topIdx = stack.length - 1;
    setCellStates({ [topIdx]: "peek" });
    setStep(2, "peek");
    showToast(`Top element is ${stack[topIdx]}`);
    await delay(1400);
    setCellStates({});
    setStep(3, "peek");
    setTimeout(() => { setCurrentStep(-1); setStepDesc(""); }, 400);
  }, [stack, animDelay, delay, setStep, showToast]);

  // ── Traverse ──
  const handleTraverse = useCallback(async () => {
    if (stack.length === 0) { showToast("Stack is empty", "warn"); return; }
    setOperation("traverse");
    const result = [];

    for (let i = stack.length - 1; i >= 0; i--) {
      setStep(i === stack.length - 1 ? 0 : 2, "traverse");
      setCellStates({ [i]: "traverse" });
      result.push(stack[i]);
      await animDelay();
      setCellStates({});
      setStep(3, "traverse");
      await delay(100);
    }

    setTraversalResult([...result]);
    setStep(4, "traverse");
    setTimeout(() => { setCurrentStep(-1); setStepDesc(""); }, 600);
    showToast("Traversal complete");
  }, [stack, animDelay, delay, setStep, showToast]);

  // ── isEmpty / isFull ──
  const handleIsEmpty = useCallback(async () => {
    setOperation("isEmpty");
    setStep(0, "isEmpty");
    await animDelay();
    setStep(1, "isEmpty");
    const empty = stack.length === 0;
    await animDelay();
    setStep(2, "isEmpty");
    showToast(empty ? "Stack IS empty" : "Stack is NOT empty", empty ? "warn" : "success");
    setTimeout(() => { setCurrentStep(-1); setStepDesc(""); }, 800);
  }, [stack, animDelay, setStep, showToast]);

  const handleIsFull = useCallback(async () => {
    setOperation("isFull");
    setStep(0, "isFull");
    await animDelay();
    const full = stack.length >= maxSize;
    setStep(1, "isFull");
    if (full) setOverflow(true);
    await animDelay();
    setStep(2, "isFull");
    showToast(full ? "Stack IS full (overflow risk!)" : "Stack is NOT full", full ? "error" : "success");
    setTimeout(() => { setCurrentStep(-1); setStepDesc(""); setOverflow(false); }, 1000);
  }, [stack, maxSize, animDelay, setStep, showToast]);

  const algoCodeKey = operation || "push";

  return (
    <>
      <style>{G}</style>
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", fontFamily: "'Outfit',sans-serif" }}>

        {/* ── HEADER ── */}
        <header style={{ background: T.panel, borderBottom: `1px solid ${T.border}`, height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 28, height: 28, background: `linear-gradient(135deg, ${T.accent}, ${T.pink})`, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900 }}>S</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: .5 }}>DSA Visualizer</div>
              <div className="mono" style={{ fontSize: 9, color: T.muted, marginTop: -2 }}>Stack Explorer — LIFO</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className="mono" style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: `${T.accent}15`, border: `1px solid ${T.accent}30`, color: T.accent }}>{stack.length}/{maxSize} filled</span>
            <span className="mono" style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: `${stack.length === 0 ? T.red : T.green}15`, border: `1px solid ${stack.length === 0 ? T.red : T.green}30`, color: stack.length === 0 ? T.red : T.green }}>
              {stack.length === 0 ? "EMPTY" : stack.length === maxSize ? "FULL" : "OK"}
            </span>
          </div>
        </header>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 14, gap: 12, overflow: "hidden" }}>

          {/* ── INIT PANEL ── */}
          <div className="panel" style={{ padding: 14, flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div style={{ flex: "0 1 140px" }}>
                <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 5 }}>MAX SIZE</label>
                <input className="inp" type="number" min={1} max={20} value={sizeInput} onChange={e => setSizeInput(e.target.value)} placeholder="7" />
              </div>
              <div style={{ flex: "1 1 160px" }}>
                <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 5 }}>
                  RANDOM SIZE: <span style={{ color: T.accent }}>{randSize}</span>
                </label>
                <input type="range" min={2} max={10} value={randSize} onChange={e => setRandSize(+e.target.value)} className="slider" />
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="btn btn-indigo" onClick={handleCreate}>Create</button>
                <button className="btn btn-amber" onClick={handleRandom}>Random</button>
                <button className="btn" onClick={handleReset}>Reset</button>
              </div>
              <div style={{ flex: "1 1 160px", marginLeft: "auto" }}>
                <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 5 }}>
                  SPEED: <span style={{ color: T.accent }}>{speed}x</span>
                </label>
                <input type="range" min={0.25} max={3} step={0.25} value={speed} onChange={e => setSpeed(+e.target.value)} className="slider" />
              </div>
              <div style={{ display: "flex", gap: 5 }}>
                <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, alignSelf: "center" }}>MODE</label>
                <button className={`btn${mode === "auto" ? " btn-indigo" : ""}`} style={{ fontSize: 11, padding: "5px 10px" }} onClick={() => setMode("auto")}>Auto</button>
                <button className={`btn${mode === "step" ? " btn-indigo" : ""}`} style={{ fontSize: 11, padding: "5px 10px" }} onClick={() => setMode("step")}>Step</button>
              </div>
            </div>
          </div>

          {/* ── MAIN ── */}
          <div style={{ flex: 1, display: "flex", gap: 14, overflow: "hidden", minHeight: 0 }}>

            {/* CENTER */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, overflow: "auto", minWidth: 0 }}>

              {/* Canvas */}
              <div className="panel" style={{ padding: 20 }}>
                <StackCanvas
                  stack={stack}
                  maxSize={maxSize}
                  cellStates={cellStates}
                  exitIdx={exitIdx}
                  overflow={overflow}
                  underflow={underflow}
                  traversalResult={traversalResult}
                />
              </div>

              {/* Operations */}
              <div className="panel" style={{ padding: 14 }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                  {/* Value input */}
                  <div style={{ flex: "0 1 140px" }}>
                    <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 5 }}>VALUE</label>
                    <input className="inp" type="number" value={value} onChange={e => setValue(e.target.value)} onKeyDown={e => e.key === "Enter" && handlePush()} placeholder="e.g. 42" />
                  </div>
                  {/* Primary ops */}
                  <div>
                    <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 5 }}>STACK OPS</label>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-indigo" onClick={handlePush}>Push</button>
                      <button className="btn btn-red" onClick={handlePop}>Pop</button>
                      <button className="btn btn-cyan" onClick={handlePeek}>Peek</button>
                      <button className="btn btn-green" onClick={handleTraverse}>Traverse</button>
                    </div>
                  </div>
                  {/* Check ops */}
                  <div>
                    <label style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, display: "block", marginBottom: 5 }}>CHECKS</label>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-amber" onClick={handleIsEmpty}>isEmpty</button>
                      <button className="btn btn-amber" onClick={handleIsFull}>isFull</button>
                    </div>
                  </div>
                </div>

                {/* Step description */}
                {stepDesc && (
                  <div style={{ marginTop: 10, padding: "7px 14px", background: `${T.accent}10`, border: `1px solid ${T.accent}25`, borderRadius: 7 }}>
                    <span className="mono" style={{ fontSize: 11, color: T.accent }}>▶ {stepDesc}</span>
                  </div>
                )}
              </div>

              {/* Real-world use cases */}
              <div className="panel" style={{ padding: 14 }}>
                <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 10 }}>REAL-WORLD USES</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    { label: "Undo / Redo", icon: "↩", color: T.accent },
                    { label: "Browser History", icon: "⬅", color: T.cyan },
                    { label: "Call Stack", icon: "ƒ()", color: T.pink },
                    { label: "Postfix Eval", icon: "∑", color: T.amber },
                    { label: "Backtracking", icon: "⟳", color: T.green },
                  ].map(({ label, icon, color }) => (
                    <div key={label} style={{
                      background: `${color}10`,
                      border: `1px solid ${color}30`,
                      borderRadius: 7,
                      padding: "6px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}>
                      <span style={{ fontSize: 13, color }}>{icon}</span>
                      <span style={{ fontSize: 11, color: T.muted }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div style={{ width: 295, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12, overflow: "auto" }}>

              {/* Algorithm info */}
              <div className="panel" style={{ padding: 14 }}>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 3 }}>
                  {operation ? ALGO_INFO[operation]?.name : "Select an Operation"}
                </div>
                <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.6, marginBottom: 12 }}>
                  {operation ? ALGO_INFO[operation]?.desc : "Run a stack operation to see the algorithm explanation here."}
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", borderBottom: `1px solid ${T.border}`, marginBottom: 10 }}>
                  {["steps", "pseudo", "flow", "complexity"].map(t => (
                    <button key={t} onClick={() => setInfoTab(t)}
                      className={infoTab === t ? "tab-a" : "tab-i"}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "4px 9px", fontSize: 9, fontWeight: 700, letterSpacing: .5, fontFamily: "Outfit" }}>
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>

                {infoTab === "steps" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {(operation ? ALGO_INFO[operation].steps : ["Push", "Pop", "Peek", "Traverse", "isEmpty", "isFull"].map(op => `Run ${op} to see steps`)).map((step, i) => (
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
                          fontSize: 8, fontFamily: "Fira Code",
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
                  <div style={{ display: "flex", justifyContent: "center", padding: "8px 0" }}>
                    <OperationFlow operation={operation || "push"} currentStep={currentStep} />
                  </div>
                )}

                {infoTab === "complexity" && (
                  <div>
                    {operation ? (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {[
                          { label: "TIME", val: COMPLEXITY[operation]?.time, color: T.accent },
                          { label: "SPACE", val: COMPLEXITY[operation]?.space, color: T.purple || T.pink },
                        ].map(({ label, val, color }) => (
                          <div key={label} style={{ textAlign: "center", padding: "10px 8px", background: `${color}10`, border: `1px solid ${color}25`, borderRadius: 8 }}>
                            <div style={{ fontSize: 9, color: T.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>{label}</div>
                            <div className="mono" style={{ fontSize: 20, fontWeight: 700, color }}>{val}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {Object.entries(COMPLEXITY).map(([op, c]) => (
                          <div key={op} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 8px", background: T.dim, borderRadius: 6 }}>
                            <span style={{ fontFamily: "Fira Code", fontSize: 11, color: T.muted }}>{op}</span>
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
                <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${T.border}`, marginBottom: 8 }}>
                  {["javascript", "python", "java", "cpp"].map(l => (
                    <button key={l} onClick={() => setCodeTab(l)}
                      className={codeTab === l ? "tab-a" : "tab-i"}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "3px 9px", fontSize: 9, fontWeight: 700, letterSpacing: .5, fontFamily: "Fira Code" }}>
                      {l === "cpp" ? "C++" : l === "javascript" ? "JS" : l.charAt(0).toUpperCase() + l.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="code-view">{CODE[codeTab][algoCodeKey] || CODE[codeTab].push}</div>
              </div>

              {/* Legend */}
              <div className="panel" style={{ padding: 14 }}>
                <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>LEGEND</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                  {[
                    { color: T.cyan,   label: "Peek" },
                    { color: T.accent, label: "Traverse" },
                    { color: T.green,  label: "Pushed" },
                    { color: T.red,    label: "Popped" },
                    { color: T.amber,  label: "Found" },
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
