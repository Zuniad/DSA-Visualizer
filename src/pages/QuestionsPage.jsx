import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Search, ChevronRight, Code2,
  Filter, Tag, BarChart3, CheckCircle2,
  Circle, Star, ExternalLink,
} from 'lucide-react';
import { QUESTIONS, DIFFICULTIES, TOPICS } from '../data/questions';

const difficultyColor = {
  Easy: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  Medium: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  Hard: 'text-red-400 bg-red-400/10 border-red-400/20',
};

export default function QuestionsPage() {
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [completed, setCompleted] = useState(new Set());

  const toggleComplete = (id) => {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = QUESTIONS.filter(q => {
    if (selectedTopic !== 'All' && q.topic !== selectedTopic) return false;
    if (selectedDifficulty !== 'All' && q.difficulty !== selectedDifficulty) return false;
    if (search && !q.title.toLowerCase().includes(search.toLowerCase()) && !q.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: QUESTIONS.length,
    easy: QUESTIONS.filter(q => q.difficulty === 'Easy').length,
    medium: QUESTIONS.filter(q => q.difficulty === 'Medium').length,
    hard: QUESTIONS.filter(q => q.difficulty === 'Hard').length,
    done: completed.size,
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <BookOpen className="w-6 h-6 text-amber-400" />
            </div>
            <h1 className="text-3xl font-bold text-white">Practice Problems</h1>
          </div>
          <p className="text-slate-400 mb-8 max-w-2xl">
            Curated DSA problems organized by topic and difficulty. Expand to see hints. 
            Mark as complete to track your progress.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="bg-slate-800/60 rounded-xl px-5 py-3 border border-slate-700">
              <span className="text-2xl font-bold text-white">{stats.total}</span>
              <span className="text-slate-500 text-sm ml-2">Total</span>
            </div>
            <div className="bg-emerald-900/20 rounded-xl px-5 py-3 border border-emerald-800/30">
              <span className="text-2xl font-bold text-emerald-400">{stats.easy}</span>
              <span className="text-emerald-600 text-sm ml-2">Easy</span>
            </div>
            <div className="bg-amber-900/20 rounded-xl px-5 py-3 border border-amber-800/30">
              <span className="text-2xl font-bold text-amber-400">{stats.medium}</span>
              <span className="text-amber-600 text-sm ml-2">Medium</span>
            </div>
            <div className="bg-red-900/20 rounded-xl px-5 py-3 border border-red-800/30">
              <span className="text-2xl font-bold text-red-400">{stats.hard}</span>
              <span className="text-red-600 text-sm ml-2">Hard</span>
            </div>
            <div className="bg-blue-900/20 rounded-xl px-5 py-3 border border-blue-800/30">
              <span className="text-2xl font-bold text-blue-400">{stats.done}</span>
              <span className="text-blue-600 text-sm ml-2">Completed</span>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search problems..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={selectedTopic}
                onChange={e => setSelectedTopic(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Topics</option>
                {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>

              <select
                value={selectedDifficulty}
                onChange={e => setSelectedDifficulty(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Levels</option>
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="space-y-3">
          {filtered.map((q) => {
            const isExpanded = expandedId === q.id;
            const isDone = completed.has(q.id);
            return (
              <div
                key={q.id}
                className={`bg-slate-900/60 border rounded-xl transition-all duration-200 ${
                  isDone ? 'border-emerald-800/40 bg-emerald-950/10' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Row */}
                <div
                  className="flex items-center gap-4 px-5 py-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : q.id)}
                >
                  {/* Complete toggle */}
                  <button
                    onClick={e => { e.stopPropagation(); toggleComplete(q.id); }}
                    className="shrink-0"
                  >
                    {isDone
                      ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      : <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400 transition-colors" />
                    }
                  </button>

                  {/* Number */}
                  <span className="text-slate-600 font-mono text-sm w-8 shrink-0">{q.id}.</span>

                  {/* Title */}
                  <span className={`flex-1 font-medium ${isDone ? 'text-slate-500 line-through' : 'text-white'}`}>
                    {q.title}
                  </span>

                  {/* Topic tag */}
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 rounded-md text-xs text-slate-400 border border-slate-700">
                    <Tag className="w-3 h-3" />
                    {q.topic}
                  </span>

                  {/* Difficulty */}
                  <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${difficultyColor[q.difficulty]}`}>
                    {q.difficulty}
                  </span>

                  {/* Chevron */}
                  <ChevronRight className={`w-4 h-4 text-slate-600 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-0 ml-14 border-t border-slate-800/50 mt-0 pt-4">
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">{q.description}</p>

                    {/* Test Cases */}
                    {q.testCases && q.testCases.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-xs text-cyan-400 font-semibold uppercase tracking-wider mb-3">Test Cases</h4>
                        <div className="space-y-2">
                          {q.testCases.map((tc, idx) => (
                            <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <span className="text-[10px] text-slate-600 uppercase font-semibold">Input</span>
                                <pre className="text-xs text-slate-300 font-mono mt-0.5 whitespace-pre-wrap">{tc.input}</pre>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-600 uppercase font-semibold">Expected Output</span>
                                <pre className="text-xs text-emerald-400 font-mono mt-0.5 whitespace-pre-wrap">{tc.output}</pre>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex items-start gap-3">
                      <Star className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Hint</span>
                        <p className="text-slate-300 text-sm mt-1">{q.hint}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <Link
                        to={`/editor?problem=${encodeURIComponent(q.title)}&pid=${q.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Code2 className="w-4 h-4" />
                        Solve in Editor
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No problems match your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
