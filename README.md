<p align="center">
<img src="https://www.google.com/search?q=https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Desktop%2520Computer.png" alt="Desktop Computer" width="100" height="100" />
</p>

<h1 align="center">🚀 DSA Visualizer & Code Execution Platform</h1>

<p align="center">
<b>An immersive, interactive, browser-based platform for mastering Data Structures & Algorithms.</b>




<i>Featuring step-by-step animations, 3D Spline scenes, a built-in code editor, and curated practice problems.</i>
</p>

<p align="center">
<img src="https://www.google.com/search?q=https://img.shields.io/badge/React-19.2.0-61DAFB%3Fstyle%3Dfor-the-badge%26logo%3Dreact%26logoColor%3Dwhite" alt="React" />
<img src="https://www.google.com/search?q=https://img.shields.io/badge/Vite-7.3.1-646CFF%3Fstyle%3Dfor-the-badge%26logo%3Dvite%26logoColor%3Dwhite" alt="Vite" />
<img src="https://www.google.com/search?q=https://img.shields.io/badge/Tailwind_CSS-3.4.19-38B2AC%3Fstyle%3Dfor-the-badge%26logo%3Dtailwind-css%26logoColor%3Dwhite" alt="Tailwind" />
<img src="https://www.google.com/search?q=https://img.shields.io/badge/License-MIT-success%3Fstyle%3Dfor-the-badge" alt="License" />
</p>

🌟 Overview

DSA Visualizer is a full-featured React application designed to bridge the gap between abstract theory and practical implementation. Instead of staring at static whiteboard diagrams, users can manipulate data structures in real-time—inserting, deleting, and searching while watching exactly how memory, pointers, and states change through buttery-smooth GSAP and Framer Motion animations.

✨ Pro Tip: Drop a GIF or video here showing your 3D Spline animations and GSAP scroll effects!

[Place your animated demo GIF here: ![DSA Visualizer Demo](./public/demo.gif)]

✨ Live Features

Feature

Description

🧮 8 Interactive Visualizers

Linked List, Array, Stack, Queue, Tree, Graph, Sorting, Pathfinding.

🎬 Step-by-Step Animation

Watch every operation unfold manually, or sit back and use auto-play.

💻 Built-in Code Editor

Monaco-based editor (VS Code engine) with syntax highlighting.

🌐 Multi-Language Execution

Execute C, Python, and JavaScript directly from the browser.

🧩 50+ Practice Problems

Curated DSA questions organized by topic and difficulty.

⏱️ Complexity Reference

Full Time & Space Complexity tables for all DS operations.

🎲 3D Spline Scenes

Interactive 3D data visualization embeds on the landing page.

🕸️ DS Hierarchy Flowchart

Interactive @xyflow/react graph showing data structure classifications.

🛠️ Tech Stack & Tools

<p align="center">
<a href="https://skillicons.dev">
<img src="https://www.google.com/search?q=https://skillicons.dev/icons%3Fi%3Dreact,vite,tailwind,js,py,c,redux,html,css,vscode,github%26perline%3D11" alt="Tech Stack Logos" />
</a>
</p>

⚛️ Core & UI

React (v19) - UI framework

Vite (v7) - Ultra-fast build tool & dev server

Tailwind CSS - Utility-first styling

React Router DOM - Client-side routing

Lucide React - Beautiful, consistent iconography

🎢 Visualizations, 3D & Animation

GSAP + ScrollTrigger - High-performance landing page scroll animations

Framer Motion - Fluid component-level transitions and layout animations

Spline (@splinetool/react-spline) - Embedded interactive 3D web scenes

React Flow (@xyflow/react) - Node-based interactive hierarchy flowcharts

📝 Code Execution & State

Monaco Editor - VS Code-powered in-browser editor

Wandbox API - Cloud execution engine for C and Python (CPython 3.12 / GCC)

Zustand & Redux Toolkit - Lightweight local and robust global state management

🗂️ Project Structure

📦 DSA_Visualizer
├── 📂 public/              # Static assets and Spline 3D exports
├── 📂 src/
│   ├── 📂 assets/          # Images, icons, global styles
│   ├── 📂 components/      # Reusable visualizer components (Array, Tree, Graph, etc.)
│   ├── 📂 data/            # 50+ curated DSA problems (questions.js)
│   ├── 📂 layouts/         # App shell, Navbar, Responsive wrappers
│   ├── 📂 pages/           # Route views (Landing, Visualizer, Questions, Editor, Playground)
│   ├── 📄 App.jsx          # React Router configuration
│   ├── 📄 main.jsx         # Application entry point
│   └── 📄 index.css        # Tailwind directives & custom scrollbars
├── 📄 tailwind.config.js   # Tailwind theme, plugins, and safelist
└── 📄 package.json         # Dependencies and scripts


🗺️ Navigation & Routes

🏠 / Landing Page: Animated hero, DS hierarchy, asymptotic notations, Spline 3D embeds.

👁️ /visualizer Visualizer: The core playground to select and interact with 8 different data structures.

📚 /questions Problem Bank: Browse, filter (by difficulty/topic), and track progress on 50+ problems.

👨‍💻 /editor Code Editor: IDE tailored for solving specific problems (supports ?problem=<id>).

🧪 /playground Sandbox: Free-form coding area to test snippets without problem constraints.

🔬 Interactive Visualizers

Navigate to /visualizer to experience algorithms visually.

🔗 Linked List: Insert head/tail/position, Delete, Search, Traverse.

📦 Array: Insert, Delete, Search, Sort, Random fill.

🥞 Stack: Push, Pop, Peek, Overflow/Underflow states.

🚶 Queue: Enqueue, Dequeue, Peek, Circular variants.

🌳 Binary Tree: Insert, Delete, Traversal (Inorder, Preorder, Postorder, Level-order).

🕸️ Graph: Add/Remove vertices and edges, Directed/Undirected, Weighted, BFS, DFS, Dijkstra, Kruskal's.

📊 Sorting: Bubble, Selection, Insertion, Merge, Quick, Heap Sort with comparison racing.

🗺️ Pathfinding: Grid-based BFS / DFS pathfinding with interactive wall drawing.

👨‍💻 Code Editor & Playground

Our custom integration with the Monaco Editor provides a desktop-grade coding experience right in your browser.

JavaScript: Instant in-browser execution (new Function()).

Python & C: Cloud execution via the Wandbox API.

Features: Theme toggling, font sizing, STDIN support, Fullscreen mode, and one-click code reset/download.

Testing: Automatic validation against hidden test cases when a problem is loaded.

🚀 Getting Started

Follow these steps to set up the project locally on your machine.

Prerequisites

Node.js (v18 or higher)

npm (v9 or higher)

Installation

Clone the repository

git clone [https://github.com/your-username/dsa-visualizer.git](https://github.com/your-username/dsa-visualizer.git)
cd dsa-visualizer


Install dependencies

npm install


Start the development server

npm run dev


Open http://localhost:5173 in your browser! ✨

Note: Code execution relies on the public Wandbox API for C and Python. No API keys are required, though execution is subject to their server availability.

💻 Available Scripts

Command

Description

npm run dev

Starts the Vite development server with HMR.

npm run build

Compiles the app for production into the dist/ folder.

npm run preview

Boots a local static server to preview the production build.

npm run lint

Runs ESLint to check for code quality and formatting issues.

📱 Responsiveness & Compatibility

The platform is meticulously optimized for:

🖥️ Desktop (Chrome, Edge, Firefox, Safari)

📱 Mobile & Tablet (Fully responsive UI, stacking flex layouts, optimized touch targets down to ~390px viewport width).

🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License

Distributed under the MIT License. See LICENSE for more information.

<p align="center">





<i>Built with ❤️ for the developer community.</i>
</p>
