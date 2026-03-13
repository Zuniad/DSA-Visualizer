import { useState, useRef, useEffect, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { useSearchParams } from 'react-router-dom';
import {
  RotateCcw, Copy, Check, Download,
  Code2, Sun, Moon, ChevronDown,
  FileCode2, Maximize2, Minimize2,
  Play, Terminal, FlaskConical, CheckCircle2, XCircle,
  ExternalLink,
} from 'lucide-react';
import { QUESTIONS } from '../data/questions';

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
  { id: 'c', label: 'C', ext: 'c' },
  { id: 'python', label: 'Python', ext: 'py' },
  { id: 'javascript', label: 'JavaScript', ext: 'js' },
];

const BOILERPLATE = {
  c: `// C Solution
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}
`,
  python: `# Python Solution
print("Hello, World!")
`,
  javascript: `// JavaScript Solution
console.log("Hello, World!");
`,
};

const THEMES = [
  { id: 'vs-dark', label: 'Dark', icon: Moon },
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'hc-black', label: 'High Contrast', icon: Maximize2 },
];

const FONT_SIZES = [12, 14, 16, 18, 20, 22, 24];

export default function CodeEditorPage() {
  const [searchParams] = useSearchParams();
  const problemName = searchParams.get('problem') || '';
  const problemId = searchParams.get('pid');

  const [language, setLanguage] = useState('c');
  const [theme, setTheme] = useState('vs-dark');
  const [fontSize, setFontSize] = useState(16);
  const [code, setCode] = useState(
    problemName
      ? `// Problem: ${problemName}\n\n${BOILERPLATE.c}`
      : BOILERPLATE.c
  );
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef(null);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [onlineCompilerUrl, setOnlineCompilerUrl] = useState(null);
  const [stdin, setStdin] = useState('');
  const [showStdin, setShowStdin] = useState(false);

  // Look up current problem's test cases
  const currentProblem = useMemo(() => {
    if (problemId) return QUESTIONS.find(q => q.id === Number(problemId));
    if (problemName) return QUESTIONS.find(q => q.title === problemName);
    return null;
  }, [problemId, problemName]);

  // Suppress Monaco "ERR Canceled" errors
  useEffect(() => {
    const handler = (e) => {
      if (e.reason?.message === 'Canceled' || e.reason?.name === 'Canceled') {
        e.preventDefault();
      }
    };
    window.addEventListener('unhandledrejection', handler);
    return () => window.removeEventListener('unhandledrejection', handler);
  }, []);

  // Sync editor content when problem URL param changes
  const prevProblemRef = useRef(problemName);
  useEffect(() => {
    if (prevProblemRef.current !== problemName) {
      prevProblemRef.current = problemName;
      const bp = BOILERPLATE[language] || `// ${language}\n`;
      setCode(problemName ? `// Problem: ${problemName}\n\n${bp}` : bp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problemName]);

  const handleLanguageChange = (langId) => {
    setLanguage(langId);
    const bp = BOILERPLATE[langId] || `// ${langId}\n`;
    setCode(problemName ? `// Problem: ${problemName}\n\n${bp}` : bp);
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
    a.download = `solution.${lang?.ext || 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    const bp = BOILERPLATE[language] || `// ${language}\n`;
    setCode(problemName ? `// Problem: ${problemName}\n\n${bp}` : bp);
  };

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  const runCode = async () => {
    setShowOutput(true);
    setIsRunning(true);
    setOutput('');
    setTestResults(null);
    setOnlineCompilerUrl(null);

    if (language === 'javascript') {
      const logs = [];
      const fakeConsole = {
        log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
        error: (...args) => logs.push('\u274c ' + args.map(String).join(' ')),
        warn: (...args) => logs.push('\u26a0 ' + args.map(String).join(' ')),
        info: (...args) => logs.push('\u2139 ' + args.map(String).join(' ')),
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

  const runTests = async () => {
    if (!currentProblem?.testCases?.length) return;
    setShowOutput(true);
    setIsRunning(true);
    setOutput('Running test cases...');
    setTestResults(null);
    setOnlineCompilerUrl(null);

    const results = [];

    if (language === 'javascript') {
      for (const [idx, tc] of currentProblem.testCases.entries()) {
        try {
          const inputLines = tc.input ? tc.input.split('\n') : [];
          let lineIdx = 0;
          const logs = [];
          const fakeConsole = {
            log: (...args) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
            error: (...args) => logs.push('\u274c ' + args.map(String).join(' ')),
          };
          const readLine = () => inputLines[lineIdx++] ?? '';
          const fn = new Function('console', 'readLine', code);
          fn(fakeConsole, readLine);
          const got = logs.join('\n').trim();
          const passed = got === tc.output.trim();
          results.push({ idx: idx + 1, passed, expected: tc.output, got: got || '(no output)' });
        } catch (err) {
          results.push({ idx: idx + 1, passed: false, expected: tc.output, got: `${err.name}: ${err.message}` });
        }
      }
      const passCount = results.filter(r => r.passed).length;
      setTestResults(results);
      setOutput(`Test Results: ${passCount}/${results.length} passed`);
      setIsRunning(false);
      return;
    }

    for (const [idx, tc] of currentProblem.testCases.entries()) {
      try {
        let stdout = '';
        const wandboxCompiler = WANDBOX_COMPILERS[language];
        const result = await executeCode(wandboxCompiler, code, tc.input);
        if (!result.success) {
          const fallback = ONLINE_COMPILERS[language];
          setOnlineCompilerUrl(fallback?.url || null);
          setOutput(`\u274c Code execution failed (${result.error}).${fallback ? ` Try ${fallback.name} instead.` : ''}`);
          setIsRunning(false);
          return;
        }
        const data = result.data;
        if (data.compiler_error) {
          results.push({ idx: idx + 1, passed: false, expected: tc.output, got: data.compiler_error.trim() });
          continue;
        }
        if (data.program_error) {
          results.push({ idx: idx + 1, passed: false, expected: tc.output, got: data.program_error.trim() });
          continue;
        }
        stdout = (data.program_output || '').trim();

        const actualTrimmed = stdout.trim();
        const expectedTrimmed = tc.output.trim();
        const passed = actualTrimmed === expectedTrimmed;
        results.push({ idx: idx + 1, passed, expected: tc.output, got: actualTrimmed || '(no output)' });
      } catch (err) {
        results.push({ idx: idx + 1, passed: false, expected: tc.output, got: err.name === 'AbortError' ? 'Timed out' : err.message });
      }
    }

    const passCount = results.filter(r => r.passed).length;
    setTestResults(results);
    setOutput(`Test Results: ${passCount}/${results.length} passed`);
    setIsRunning(false);
  };

  const currentLang = LANGUAGES.find(l => l.id === language);

  return (
    <div className={`bg-slate-950 text-slate-200 ${isFullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'}`}>
      {/* Top Bar */}
      <div className="relative z-10 bg-slate-900 border-b border-slate-800">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Code2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Code Editor</h1>
              {problemName && (
                <p className="text-xs text-slate-500">Problem: {problemName}</p>
              )}
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2 ml-auto">
            {/* Language Selector */}
            <div className="relative flex items-center">
              <Code2 className="absolute left-2.5 w-4 h-4 text-blue-400 pointer-events-none z-10" />
              <select
                value={language}
                onChange={e => handleLanguageChange(e.target.value)}
                className="appearance-none bg-slate-800 border border-blue-500/40 rounded-lg pl-9 pr-8 py-2 text-sm text-white font-medium focus:outline-none focus:border-blue-500 cursor-pointer hover:border-blue-400 transition-colors"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.id} value={lang.id}>{lang.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400 pointer-events-none" />
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
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
            >
              {FONT_SIZES.map(s => (
                <option key={s} value={s}>{s}px</option>
              ))}
            </select>

            <div className="h-6 w-px bg-slate-700 mx-1 hidden sm:block" />

            {/* Action Buttons */}
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
            {/* Stdin Toggle */}
            <button
              onClick={() => setShowStdin(s => !s)}
              className={`p-2 rounded-lg transition-colors ${showStdin ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              title="Toggle Stdin Input"
            >
              <Terminal className="w-4 h-4" />
            </button>
            <button onClick={runCode} disabled={isRunning} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 rounded-lg text-white text-sm font-medium transition-colors" title="Run Code">
              <Play className="w-4 h-4" />
              {isRunning ? 'Running...' : 'Run'}
            </button>
            {currentProblem?.testCases?.length > 0 && (
              <button onClick={runTests} disabled={isRunning} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 rounded-lg text-white text-sm font-medium transition-colors" title="Run Test Cases">
                <FlaskConical className="w-4 h-4" />
                Tests
              </button>
            )}
            <button onClick={toggleFullscreen} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors" title="Toggle Fullscreen">
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex flex-col" style={{ height: isFullscreen ? 'calc(100vh - 72px)' : 'calc(100vh - 136px)' }}>
        {/* Tab bar + Test Cases strip */}
        <div className="bg-[#1e1e1e] border-b border-slate-800 px-4 flex items-center gap-1 justify-between">
          <div className="flex items-center gap-2 px-4 py-2 bg-[#252526] border-t-2 border-t-blue-500 text-sm">
            <FileCode2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-300">solution.{currentLang?.ext || 'txt'}</span>
          </div>
          {currentProblem && (
            <div className="flex items-center gap-2 text-xs text-slate-500 pr-2">
              <FlaskConical className="w-3 h-3 text-cyan-400" />
              <span className="text-cyan-400">{currentProblem.title}</span>
              <span>— {currentProblem.testCases?.length || 0} test cases</span>
            </div>
          )}
        </div>

        {/* Editor + Output split */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Stdin Input */}
          {showStdin && (
            <div className="bg-slate-900 border-b border-slate-700 px-4 py-2">
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
                    <div className="w-5 h-5 border-2 border-slate-600 border-t-blue-400 rounded-full animate-spin" />
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
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400 text-sm font-medium hover:bg-blue-600/30 hover:border-blue-500/50 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open in Online Compiler
                    </a>
                  </div>
                )}
                <pre className="p-4 text-sm font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                {output || 'Run your code to see output here...'}
                {testResults && (
                  <div className="mt-4 space-y-2">
                    {testResults.map(r => (
                      <div key={r.idx} className={`rounded-lg border p-3 ${r.passed ? 'border-emerald-700 bg-emerald-950/30' : 'border-red-700 bg-red-950/30'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {r.passed ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                          <span className={`font-semibold text-xs ${r.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                            Test {r.idx}: {r.passed ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                        {!r.passed && (
                          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                            <div><span className="text-slate-500">Expected:</span> <span className="text-emerald-300">{r.expected}</span></div>
                            <div><span className="text-slate-500">Got:</span> <span className="text-red-300">{r.got}</span></div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </pre>
              </div>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="bg-blue-600 px-4 py-1 flex items-center justify-between text-xs text-white/90">
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
