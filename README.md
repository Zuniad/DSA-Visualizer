<div align="center">

<!-- ═══════════════════════════════════════════════════════════ -->
<!--   HEADER BANNER — GitHub-safe SMIL SVG (no CSS, no emoji)  -->
<!-- ═══════════════════════════════════════════════════════════ -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 220" width="100%">
  <defs>
    <linearGradient id="hdrGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#6EE7F7"/>
      <stop offset="50%"  stop-color="#A78BFA"/>
      <stop offset="100%" stop-color="#F472B6"/>
    </linearGradient>
    <!-- wave path -->
    <clipPath id="waveClip">
      <path d="M0,0 L900,0 L900,170 Q675,220 450,190 Q225,160 0,200 Z"/>
    </clipPath>
    <!-- fade-in animation -->
    <style>
      .hdr-title { animation: fadeUp 1s ease forwards; opacity: 0; }
      .hdr-sub   { animation: fadeUp 1s ease 0.4s forwards; opacity: 0; }
      @keyframes fadeUp {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }
    </style>
  </defs>
  <!-- gradient background with wave clip -->
  <rect width="900" height="220" fill="url(#hdrGrad)" clip-path="url(#waveClip)"/>
  <!-- bottom wave decoration -->
  <path d="M0,190 Q225,155 450,185 Q675,215 900,170 L900,220 L0,220 Z" fill="url(#hdrGrad)" opacity="0.35"/>
  <!-- title -->
  <text class="hdr-title" x="450" y="100"
        font-family="Segoe UI, Arial, sans-serif" font-size="52" font-weight="800"
        fill="white" text-anchor="middle" letter-spacing="2">
    🚀 DSA Visualizer
  </text>
  <!-- subtitle -->
  <text class="hdr-sub" x="450" y="148"
        font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="400"
        fill="rgba(255,255,255,0.9)" text-anchor="middle" letter-spacing="1">
    Interactive Data Structures &amp; Algorithms Platform
  </text>
</svg>

<!-- ═══════════════════════════════════════════════════════════ -->
<!--  FEATURE LINES — GitHub-safe SMIL SVG (no CSS, no emoji)   -->
<!-- ═══════════════════════════════════════════════════════════ -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 820 112" width="820">
  <defs>
    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#6EE7F7"/>
      <stop offset="100%" stop-color="#F472B6"/>
    </linearGradient>
  </defs>

  <!-- animated accent underline -->
  <rect x="260" y="108" width="0" height="2" fill="url(#lineGrad)" rx="1">
    <animate attributeName="width" from="0" to="300" dur="1s" begin="3.6s" fill="freeze"/>
    <animate attributeName="x"     from="410" to="260" dur="1s" begin="3.6s" fill="freeze"/>
  </rect>

  <!-- Line 1 -->
  <text x="410" y="22" font-family="Courier New, monospace" font-size="15" font-weight="700"
        fill="#A78BFA" text-anchor="middle" opacity="0">
    &#x25B6;  Step-by-step Algorithm Animations
    <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="0.2s" fill="freeze"/>
  </text>

  <!-- Line 2 -->
  <text x="410" y="46" font-family="Courier New, monospace" font-size="15" font-weight="700"
        fill="#A78BFA" text-anchor="middle" opacity="0">
    &#x25B6;  Built-in Monaco Code Editor (VS Code Engine)
    <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="1.0s" fill="freeze"/>
  </text>

  <!-- Line 3 -->
  <text x="410" y="70" font-family="Courier New, monospace" font-size="15" font-weight="700"
        fill="#A78BFA" text-anchor="middle" opacity="0">
    &#x25B6;  Multi-Language Execution &#x2014; C | Python | JavaScript
    <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="1.8s" fill="freeze"/>
  </text>

  <!-- Line 4 -->
  <text x="410" y="94" font-family="Courier New, monospace" font-size="15" font-weight="700"
        fill="#A78BFA" text-anchor="middle" opacity="0">
    &#x25B6;  Embedded 3D Spline Interactive Scenes
    <animate attributeName="opacity" from="0" to="1" dur="0.5s" begin="2.6s" fill="freeze"/>
  </text>
</svg>

<br/><br/>

<!-- ═══════════════════════════════════════════════════════════ -->
<!--                      BADGE ROW 1                           -->
<!-- ═══════════════════════════════════════════════════════════ -->
<a href="https://reactjs.org/"><img src="https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React"/></a>&nbsp;
<a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-7.3.1-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/></a>&nbsp;
<a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-3.4.19-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind"/></a>&nbsp;
<a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge&logo=opensourceinitiative&logoColor=white" alt="License"/></a>

<!-- BADGE ROW 2 -->
<a href="https://greensock.com/gsap/"><img src="https://img.shields.io/badge/GSAP-ScrollTrigger-88CE02?style=for-the-badge&logo=greensock&logoColor=white" alt="GSAP"/></a>&nbsp;
<a href="https://microsoft.github.io/monaco-editor/"><img src="https://img.shields.io/badge/Monaco_Editor-VS_Code_Engine-007ACC?style=for-the-badge&logo=visualstudiocode&logoColor=white" alt="Monaco"/></a>&nbsp;
<a href="https://www.framer.com/motion/"><img src="https://img.shields.io/badge/Framer_Motion-Transitions-EF4179?style=for-the-badge&logo=framer&logoColor=white" alt="Framer"/></a>&nbsp;
<a href="https://github.com/your-username/dsa-visualizer/stargazers"><img src="https://img.shields.io/github/stars/your-username/dsa-visualizer?style=for-the-badge&logo=github&color=FBBF24&logoColor=white" alt="Stars"/></a>

<br/><br/>

> 📸 **Replace the line below with your own demo GIF / screenshot!**
>
> `![DSA Visualizer Demo](./public/demo.gif)`

<br/>

---

</div>

## 🌟 What is DSA Visualizer?

> **DSA Visualizer** bridges the gap between abstract theory and hands-on implementation. Instead of static whiteboard diagrams, users manipulate data structures in real-time — watching memory, pointers, and states transform through buttery-smooth **GSAP** and **Framer Motion** animations.

<div align="center">

| 🧮 | 🎬 | 💻 | 🧩 |
|:---:|:---:|:---:|:---:|
| **8 Interactive Visualizers** | **Step-by-Step Animations** | **Monaco Code Editor** | **50+ Practice Problems** |
| Linked List, Array, Stack, Queue, Tree, Graph, Sorting, Pathfinding | Watch every operation manually or on auto-play | VS Code engine with full syntax highlighting | Curated DSA questions by topic & difficulty |

| 🌐 | ⏱️ | 🎲 | 🕸️ |
|:---:|:---:|:---:|:---:|
| **Multi-Language Execution** | **Complexity Reference** | **3D Spline Scenes** | **DS Hierarchy Flowchart** |
| Run C, Python & JavaScript in-browser | Full Time & Space Complexity tables | Interactive 3D data visualizations | `@xyflow/react` graph of DS classifications |

</div>

---

## 🛠️ Tech Stack

<div align="center">

---

### ⚛️ Core & UI Framework

<table>
  <tr>
    <td align="center" width="130">
      <a href="https://reactjs.org/">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="55" height="55" alt="React"/><br/>
        <b>React 19</b>
      </a><br/>
      <sub>UI Framework</sub>
    </td>
    <td align="center" width="130">
      <a href="https://vitejs.dev/">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" width="55" height="55" alt="Vite"/><br/>
        <b>Vite 7</b>
      </a><br/>
      <sub>Build Tool & Dev Server</sub>
    </td>
    <td align="center" width="130">
      <a href="https://tailwindcss.com/">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" width="55" height="55" alt="Tailwind"/><br/>
        <b>Tailwind CSS</b>
      </a><br/>
      <sub>Utility-first Styling</sub>
    </td>
    <td align="center" width="130">
      <a href="https://reactrouter.com/">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/reactrouter/reactrouter-original.svg" width="55" height="55" alt="React Router"/><br/>
        <b>React Router</b>
      </a><br/>
      <sub>Client-side Routing</sub>
    </td>
    <td align="center" width="130">
      <a href="https://lucide.dev/">
        <img src="https://lucide.dev/logo.dark.svg" width="55" height="55" alt="Lucide"/><br/>
        <b>Lucide React</b>
      </a><br/>
      <sub>Iconography</sub>
    </td>
  </tr>
</table>

---

### 🎢 Animation, 3D & Visualization

<table>
  <tr>
    <td align="center" width="140">
      <a href="https://greensock.com/gsap/">
        <img src="https://cdn.worldvectorlogo.com/logos/gsap-greensock.svg" width="55" height="55" alt="GSAP"/><br/>
        <b>GSAP</b>
      </a><br/>
      <sub>+ ScrollTrigger · Scroll Animations</sub>
    </td>
    <td align="center" width="140">
      <a href="https://www.framer.com/motion/">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/framermotion/framermotion-original.svg" width="55" height="55" alt="Framer Motion"/><br/>
        <b>Framer Motion</b>
      </a><br/>
      <sub>Layout Animations</sub>
    </td>
    <td align="center" width="140">
      <a href="https://spline.design/">
        <img src="https://spline.design/static/spline-logo.svg" width="55" height="55" alt="Spline"/><br/>
        <b>Spline 3D</b>
      </a><br/>
      <sub>Interactive 3D Scenes</sub>
    </td>
    <td align="center" width="140">
      <a href="https://reactflow.dev/">
        <img src="https://reactflow.dev/img/logo.svg" width="55" height="55" alt="React Flow"/><br/>
        <b>React Flow</b>
      </a><br/>
      <sub>DS Hierarchy Graphs</sub>
    </td>
  </tr>
</table>

---

### 📝 Code Execution & State Management

<table>
  <tr>
    <td align="center" width="140">
      <a href="https://microsoft.github.io/monaco-editor/">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" width="55" height="55" alt="Monaco Editor"/><br/>
        <b>Monaco Editor</b>
      </a><br/>
      <sub>VS Code Engine · In-browser IDE</sub>
    </td>
    <td align="center" width="140">
      <a href="https://wandbox.org/">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/gnu/gnu-original.svg" width="55" height="55" alt="Wandbox"/><br/>
        <b>Wandbox API</b>
      </a><br/>
      <sub>CPython 3.12 / GCC Cloud Exec</sub>
    </td>
    <td align="center" width="140">
      <a href="https://zustand-demo.pmnd.rs/">
        <img src="https://repository-images.githubusercontent.com/180328715/fca49300-e7f1-11ea-9f51-cfd949b31560" width="55" height="55" alt="Zustand"/><br/>
        <b>Zustand</b>
      </a><br/>
      <sub>Lightweight Local State</sub>
    </td>
    <td align="center" width="140">
      <a href="https://redux-toolkit.js.org/">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg" width="55" height="55" alt="Redux"/><br/>
        <b>Redux Toolkit</b>
      </a><br/>
      <sub>Robust Global State</sub>
    </td>
  </tr>
</table>

---

### 🌐 Language Support

<table>
  <tr>
    <td align="center" width="140">
      <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" width="55" height="55" alt="JavaScript"/><br/>
        <b>JavaScript</b>
      </a><br/>
      <sub>Instant in-browser execution</sub>
    </td>
    <td align="center" width="140">
      <a href="https://www.python.org/">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" width="55" height="55" alt="Python"/><br/>
        <b>Python 3.12</b>
      </a><br/>
      <sub>via Wandbox (CPython)</sub>
    </td>
    <td align="center" width="140">
      <a href="https://en.wikipedia.org/wiki/C_(programming_language)">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg" width="55" height="55" alt="C"/><br/>
        <b>C / GCC</b>
      </a><br/>
      <sub>via Wandbox (GCC)</sub>
    </td>
  </tr>
</table>

---

### 🧰 Developer Tools

<table>
  <tr>
    <td align="center" width="130">
      <a href="https://code.visualstudio.com/">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" width="50" height="50" alt="VS Code"/><br/>
        <b>VS Code</b>
      </a><br/><sub>IDE</sub>
    </td>
    <td align="center" width="130">
      <a href="https://github.com/">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" width="50" height="50" alt="GitHub"/><br/>
        <b>GitHub</b>
      </a><br/><sub>Version Control</sub>
    </td>
    <td align="center" width="130">
      <a href="https://nodejs.org/">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="50" height="50" alt="Node.js"/><br/>
        <b>Node.js v18+</b>
      </a><br/><sub>Runtime</sub>
    </td>
    <td align="center" width="130">
      <a href="https://www.npmjs.com/">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/npm/npm-original-wordmark.svg" width="50" height="50" alt="npm"/><br/>
        <b>npm v9+</b>
      </a><br/><sub>Package Manager</sub>
    </td>
    <td align="center" width="130">
      <a href="https://eslint.org/">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/eslint/eslint-original.svg" width="50" height="50" alt="ESLint"/><br/>
        <b>ESLint</b>
      </a><br/><sub>Code Quality</sub>
    </td>
  </tr>
</table>

</div>

---

## 🗂️ Project Structure

```
📦 DSA_Visualizer
├── 📂 public/              # Static assets and Spline 3D exports
├── 📂 src/
│   ├── 📂 assets/          # Images, icons, global styles
│   ├── 📂 components/      # Reusable visualizer components (Array, Tree, Graph …)
│   ├── 📂 data/            # 50+ curated DSA problems (questions.js)
│   ├── 📂 layouts/         # App shell, Navbar, Responsive wrappers
│   ├── 📂 pages/           # Route views — Landing, Visualizer, Questions, Editor, Playground
│   ├── 📄 App.jsx          # React Router configuration
│   ├── 📄 main.jsx         # Application entry point
│   └── 📄 index.css        # Tailwind directives & custom scrollbars
├── 📄 tailwind.config.js   # Tailwind theme, plugins, and safelist
└── 📄 package.json         # Dependencies and scripts
```

---

## 🗺️ Routes & Navigation

<div align="center">

```
🏠 /             →  Animated hero · DS Hierarchy · Spline 3D Embeds · Asymptotic Notations
👁️ /visualizer   →  Core playground — select & interact with 8 data structures
📚 /questions    →  Browse · filter by difficulty / topic · track 50+ problem progress
👨‍💻 /editor       →  IDE tailored for solving problems  (supports ?problem=<id>)
🧪 /playground   →  Free-form sandbox for testing snippets without constraints
```

</div>

---

## 🔬 Interactive Visualizers

<div align="center">

| Visualizer | Operations |
|:---|:---|
| 🔗 **Linked List** | Insert Head / Tail / Position · Delete · Search · Traverse |
| 📦 **Array** | Insert · Delete · Search · Sort · Random Fill |
| 🥞 **Stack** | Push · Pop · Peek · Overflow / Underflow States |
| 🚶 **Queue** | Enqueue · Dequeue · Peek · Circular Variants |
| 🌳 **Binary Tree** | Insert · Delete · Inorder / Preorder / Postorder / Level-Order |
| 🕸️ **Graph** | Add / Remove Vertices & Edges · Directed · Weighted · BFS · DFS · Dijkstra · Kruskal's |
| 📊 **Sorting** | Bubble · Selection · Insertion · Merge · Quick · Heap Sort with Comparison Racing |
| 🗺️ **Pathfinding** | Grid-based BFS / DFS with interactive wall drawing |

</div>

---

## 👨‍💻 Code Editor & Playground

<div align="center">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" width="40" alt="Monaco"/>&nbsp;&nbsp;
  <b>Monaco Editor — Desktop-grade IDE, right in your browser</b>
</div>

<br/>

- ✅ &nbsp;**JavaScript** — instant in-browser execution via `new Function()`
- ✅ &nbsp;**Python & C** — cloud execution via the **Wandbox API** (CPython 3.12 / GCC)
- ✅ &nbsp;**Theme toggling, font sizing, STDIN support, Fullscreen mode**
- ✅ &nbsp;**One-click code reset & download**
- ✅ &nbsp;**Automatic test-case validation** when a problem is loaded

---

## 🚀 Getting Started

### Prerequisites

<div align="center">
  <a href="https://nodejs.org/">
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="40" alt="Node.js"/>
    &nbsp;<img src="https://img.shields.io/badge/Node.js-v18+-339933?style=flat-square&logo=nodedotjs&logoColor=white" alt="Node Badge"/>
  </a>
  &nbsp;&nbsp;&nbsp;
  <a href="https://www.npmjs.com/">
    <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/npm/npm-original-wordmark.svg" width="40" alt="npm"/>
    &nbsp;<img src="https://img.shields.io/badge/npm-v9+-CB3837?style=flat-square&logo=npm&logoColor=white" alt="npm Badge"/>
  </a>
</div>

<br/>

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/dsa-visualizer.git
cd dsa-visualizer

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open **[http://localhost:5173](http://localhost:5173)** in your browser ✨

> **Note:** C and Python execution relies on the free public **Wandbox API** — no API key required. Speed depends on their server availability.

---

## 💻 Available Scripts

| Command | Description |
|:---|:---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Compile the app for production → `dist/` |
| `npm run preview` | Boot a local static server to preview the production build |
| `npm run lint` | Run ESLint for code quality & formatting issues |

---

## 📱 Responsiveness & Compatibility

<div align="center">

<table>
  <tr>
    <td align="center" width="260">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/chrome/chrome-original.svg" width="35" alt="Chrome"/>
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firefox/firefox-original.svg" width="35" alt="Firefox"/>
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/safari/safari-original.svg" width="35" alt="Safari"/>
      <br/><b>🖥️ Desktop</b><br/>
      <sub>Chrome · Edge · Firefox · Safari</sub>
    </td>
    <td align="center" width="260">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/android/android-original.svg" width="35" alt="Android"/>
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg" width="35" alt="iOS"/>
      <br/><b>📱 Mobile & Tablet</b><br/>
      <sub>Fully responsive down to ~390px viewport</sub>
    </td>
  </tr>
</table>

</div>

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

<div align="center">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" width="35" alt="Git"/>
  &nbsp;
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" width="35" alt="GitHub"/>
</div>

<br/>

```bash
# 1. Fork the Project

# 2. Create your Feature Branch
git checkout -b feature/AmazingFeature

# 3. Commit your Changes
git commit -m 'Add some AmazingFeature'

# 4. Push to the Branch
git push origin feature/AmazingFeature

# 5. Open a Pull Request 🎉
```

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">

<!-- ═══════════════════════════════════════════════════════════ -->
<!--   FOOTER WAVE — GitHub-safe SMIL SVG (no CSS, no emoji)    -->
<!-- ═══════════════════════════════════════════════════════════ -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 110" width="100%">
  <defs>
    <linearGradient id="ftrGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#F472B6"/>
      <stop offset="50%"  stop-color="#A78BFA"/>
      <stop offset="100%" stop-color="#6EE7F7"/>
    </linearGradient>
  </defs>
  <!-- back wave layer — fades in first -->
  <path d="M0,60 Q225,20 450,50 Q675,80 900,30 L900,110 L0,110 Z"
        fill="url(#ftrGrad)" opacity="0">
    <animate attributeName="opacity" from="0" to="0.45" dur="0.8s" begin="0.1s" fill="freeze"/>
  </path>
  <!-- front wave layer — fades in second -->
  <path d="M0,40 Q225,0 450,30 Q675,60 900,10 L900,110 L0,110 Z"
        fill="url(#ftrGrad)" opacity="0">
    <animate attributeName="opacity" from="0" to="1" dur="0.8s" begin="0.5s" fill="freeze"/>
  </path>
</svg>

<br/>

**Built with ❤️ for the developer community**

<br/>

<a href="https://github.com/your-username/dsa-visualizer">
  <img src="https://img.shields.io/badge/⭐ Star this repo-181717?style=for-the-badge&logo=github&logoColor=white" alt="Star"/>
</a>
&nbsp;
<a href="https://github.com/your-username/dsa-visualizer/issues">
  <img src="https://img.shields.io/badge/🐛 Report a Bug-EA4335?style=for-the-badge&logo=github&logoColor=white" alt="Issues"/>
</a>
&nbsp;
<a href="https://github.com/your-username/dsa-visualizer/pulls">
  <img src="https://img.shields.io/badge/🤝 Contribute-22C55E?style=for-the-badge&logo=github&logoColor=white" alt="PRs"/>
</a>

<br/><br/>

<!-- Tech logo strip at the bottom -->
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" width="28"/>&nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" width="28"/>&nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg" width="28"/>&nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" width="28"/>&nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" width="28"/>&nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg" width="28"/>&nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redux/redux-original.svg" width="28"/>&nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" width="28"/>&nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" width="28"/>&nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" width="28"/>&nbsp;
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/npm/npm-original-wordmark.svg" width="28"/>

</div>
