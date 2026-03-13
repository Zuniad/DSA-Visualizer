import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import {
  RotateCcw, Copy, Check, Download,
  Code2, Sun, Moon, ChevronDown,
  FileCode2, Maximize2, Minimize2,
  Play, Terminal, ExternalLink,
} from 'lucide-react';

const WANDBOX_COMPILERS = {
  c: 'gcc-head-c',
  python: 'cpython-3.12.0',
};

const ONLINE_COMPILERS = {
  python: { name: 'Programiz', url: 'https://www.programiz.com/python-programming/online-compiler/' },
  c: { name: 'Programiz', url: 'https://www.programiz.com/c-programming/online-compiler/' },
};

async function executeCode(compiler, code, stdin = '') {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    const res = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({ compiler, code, stdin, 'compiler-option-raw': '-O2' }),
    });
    clearTimeout(timeoutId);
    if (!res.ok) return { success: false, error: `HTTP ${res.status}` };
    return { success: true, data: await res.json() };
  } catch (err) {
    return { success: false, error: err.name === 'AbortError' ? 'Request timed out (30s)' : err.message };
  }
}

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', ext: 'js' },
  { id: 'python', label: 'Python', ext: 'py' },
  { id: 'c', label: 'C', ext: 'c' },
];

const BOILERPLATE = {
  javascript: `// JavaScript Playground
const greeting = "Hello, World!";
console.log(greeting);
`,
  python: `# Python Playground
print("Hello, World!")

name = input("Enter your name: ")
print(f"Hello, {name}!")
`,
  c: `// C Playground
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}
`,
};

const THEMES = [
  { id: 'vs-dark', label: 'Dark', icon: Moon },
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'hc-black', label: 'High Contrast', icon: Maximize2 },
];

const FONT_SIZES = [12, 14, 16, 18, 20, 22, 24];

export default function PlaygroundPage() {
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(16);
  const [code, setCode] = useState(BOILERPLATE.javascript);
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef(null);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [onlineCompilerUrl, setOnlineCompilerUrl] = useState(null);
  const [stdin, setStdin] = useState('');
  const [showStdin, setShowStdin] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (e.reason?.message === 'Canceled' || e.reason?.name === 'Canceled') {
        e.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', handler);
    return () => window.removeEventListener('unhandledrejection', handler);
  }, []);

  const handleLanguageChange = (langId) => {
    setLanguage(langId);
    setCode(BOILERPLATE[langId] || `// ${langId}\n`);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const lang = LANGUAGES.find(l => l.id === language);
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `playground.${lang?.ext || 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setCode(BOILERPLATE[language] || `// ${language}\n`);
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const currentLang = LANGUAGES.find(l => l.id === language);

  const runCode = async () => {
    setShowOutput(true);
    setIsRunning(true);
    setOutput('');
    setOnlineCompilerUrl(null);

    if (language === 'javascript') {
      const logs = [];
      const fakeConsole = {
        log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
        error: (...args) => logs.push('\u274c ' + args.map(String).join(' ')),
        warn: (...args) => logs.push('\u26a0 ' + args.map(String).join(' ')),
        info: (...args) => logs.push('\u2139 ' + args.map(String).join(' ')),
        table: (data) => logs.push(JSON.stringify(data, null, 2)),
        clear: () => { logs.length = 0; },
      };
      try {
        const fn = new Function('console', code);
        fn(fakeConsole);
        setOutput(logs.length > 0 ? logs.join('\n') : '\u2713 Code executed successfully (no output)');
      } catch (err) {
        setOutput(`\u274c ${err.name}: ${err.message}`);
      }
      setIsRunning(false);
      return;
    }

    const compiler = WANDBOX_COMPILERS[language];
    if (!compiler) {
      setOutput(`\u26a0 Execution not available for ${currentLang?.label}. Pick a supported language to run code.`);
      setIsRunning(false);
      return;
    }

    const result = await executeCode(compiler, code, stdin);
    if (!result.success) {
      const fallback = ONLINE_COMPILERS[language];
      setOnlineCompilerUrl(fallback?.url || null);
      setOutput(`\u274c Code execution failed (${result.error}).\nThe remote compiler may be temporarily down.${fallback ? `\n\n\ud83d\udca1 You can run your ${currentLang?.label} code on ${fallback.name}.` : ''}`);
      setIsRunning(false);
      return;
    }
    const data = result.data;
    const out = [data.program_output, data.program_error, data.compiler_error].filter(Boolean).join('\n').trim();
    setOutput(out || '\u2713 Code executed successfully (no output)');
    setIsRunning(false);
  };

  return (
    <div className={`bg-slate-950 text-slate-200 ${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'}`}>
      {/* Top Bar */}
      <div className="relative z-10 bg-slate-900 border-b border-slate-800">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-2 bg-violet-500/10 rounded-xl border border-violet-500/20">
              <Code2 className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Code Playground</h1>
              <p className="text-xs text-slate-500">Write &amp; run code in any language</p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 ml-auto">
            {/* Language Selector */}
            <div className="relative flex items-center">
              <Code2 className="absolute left-2.5 w-4 h-4 text-violet-400 pointer-events-none z-10" />
              <select
                value={language}
                onChange={e => handleLanguageChange(e.target.value)}
                className="appearance-none bg-slate-800 border border-violet-500/40 rounded-lg pl-9 pr-8 py-2 text-sm text-white font-medium focus:outline-none focus:border-violet-500 cursor-pointer hover:border-violet-400 transition-colors"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.id} value={lang.id}>{lang.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400 pointer-events-none" />
            </div>

            {/* Theme Selector */}
            <div className="flex bg-slate-800 rounded-lg border border-slate-700 p-0.5">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`p-2 rounded-md transition-colors ${
                    theme === t.id ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title={t.label}
                >
                  <t.icon className="w-4 h-4" />
                </button>
              ))}
            </div>

            {/* Font Size */}
            <select
              value={fontSize}
              onChange={e => setFontSize(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-violet-500"
            >
              {FONT_SIZES.map(s => (
                <option key={s} value={s}>{s}px</option>
              ))}
            </select>

            <div className="h-6 w-px bg-slate-700 mx-1 hidden sm:block" />

            <button onClick={handleCopy} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors" title="Copy Code">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button onClick={handleDownload} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors" title="Download">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={handleReset} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors" title="Reset Code">
              <RotateCcw className="w-4 h-4" />
            </button>

            <div className="h-6 w-px bg-slate-700 mx-1 hidden sm:block" />

            {language !== 'javascript' && WANDBOX_COMPILERS[language] && (
              <button
                onClick={() => setShowStdin(s => !s)}
                className={`p-2 rounded-lg transition-colors ${showStdin ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                title="Toggle Stdin Input"
              >
                <Terminal className="w-4 h-4" />
              </button>
            )}
            <button onClick={runCode} disabled={isRunning} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 rounded-lg text-white text-sm font-medium transition-colors" title="Run Code">
              <Play className="w-4 h-4" />
              {isRunning ? 'Running...' : 'Run'}
            </button>
            <button onClick={() => setIsFullscreen(prev => !prev)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors" title="Toggle Fullscreen">
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex flex-col" style={{ height: isFullscreen ? 'calc(100vh - 72px)' : 'calc(100vh - 136px)' }}>
        {/* Tab bar */}
        <div className="bg-[#1e1e1e] border-b border-slate-800 px-4 flex items-center gap-1">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#252526] border-t-2 border-t-violet-500 text-sm">
            <FileCode2 className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-slate-300">playground.{currentLang?.ext || 'txt'}</span>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Stdin Input */}
          {showStdin && language !== 'javascript' && WANDBOX_COMPILERS[language] && (
            <div className="bg-slate-900 border-b border-slate-700 px-4 py-2 shrink-0">
              <div className="flex items-center gap-2 mb-1">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-medium text-amber-400">Standard Input (stdin)</span>
                <span className="text-xs text-slate-500">— provide input for your program</span>
              </div>
              <textarea
                value={stdin}
                onChange={e => setStdin(e.target.value)}
                placeholder="Enter input here (e.g. numbers, text your program reads via scanf/cin/input)..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 resize-none"
                rows={3}
              />
            </div>
          )}

          {/* Monaco Editor */}
          <div className="min-h-0" style={{ height: showOutput ? '60%' : '100%' }}>
            <Editor
              height="100%"
              language={language}
              value={code}
              theme={theme}
              onChange={(val) => setCode(val || '')}
              onMount={handleEditorMount}
              options={{
                fontSize,
                fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', Consolas, monospace",
                fontLigatures: true,
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                padding: { top: 16 },
                renderLineHighlight: 'all',
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                bracketPairColorization: { enabled: true },
                suggest: { showKeywords: true, showSnippets: true },
                quickSuggestions: true,
              }}
              loading={
                <div className="flex items-center justify-center h-full bg-slate-950">
                  <div className="flex items-center gap-3 text-slate-500">
                    <div className="w-5 h-5 border-2 border-slate-600 border-t-violet-400 rounded-full animate-spin" />
                    Loading Editor...
                  </div>
                </div>
              }
            />
          </div>

          {/* Output Panel */}
          {showOutput && (
            <div className="flex flex-col min-h-0 border-t border-slate-700" style={{ height: '40%' }}>
              <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-sm font-medium text-slate-300">Output</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setOutput('')} className="text-xs text-slate-500 hover:text-slate-300 px-2 py-0.5 rounded hover:bg-slate-800 transition-colors">Clear</button>
                  <button onClick={() => setShowOutput(false)} className="text-slate-500 hover:text-slate-300 px-1.5 hover:bg-slate-800 rounded transition-colors">&times;</button>
                </div>
              </div>
              <div className="flex-1 overflow-auto bg-[#1e1e1e]">
                {onlineCompilerUrl && (
                  <div className="px-4 pt-3">
                    <a
                      href={onlineCompilerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600/20 border border-violet-500/30 rounded-lg text-violet-400 text-sm font-medium hover:bg-violet-600/30 hover:border-violet-500/50 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open in Online Compiler
                    </a>
                  </div>
                )}
                <pre className="p-4 text-sm font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {output || 'Run your code to see output here...'}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="bg-violet-600 px-4 py-1 flex items-center justify-between text-xs text-white/90">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <FileCode2 className="w-3 h-3" />
              {currentLang?.label}
            </span>
            <span>UTF-8</span>
            <span>Spaces: 2</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Ln 1, Col 1</span>
            <span>{code.split('\n').length} lines</span>
          </div>
        </div>
      </div>
    </div>
  );
}
