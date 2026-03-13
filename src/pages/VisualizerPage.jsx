
import { useSearchParams, Link } from 'react-router-dom';
import {
  Activity, ArrowLeft, BarChart3, GitBranch,
  Layers, ArrowRight, Network, Binary, Cpu,
} from 'lucide-react';

import LinkedListVisualizer from '../LinkedListVisualizer';
import ArrayVisualizer from '../ArrayVisualizer';
import StackVisualizer from '../StackVisualizer';
import QueueVisualizer from '../QueueVisualizer';
import TreeVisualizer from '../TreeVisualizer';
import GraphVisualizer from '../components/GraphVisualizer';
import SortingVisualizer from '../components/SortingVisualizer';
import PathfindingVisualizer from '../components/PathfindingVisualizer';

const VISUALIZERS = [
  { id: 'linkedlist', title: 'Linked List', icon: GitBranch, color: 'from-violet-500 to-purple-400', component: LinkedListVisualizer },
  { id: 'array', title: 'Array', icon: BarChart3, color: 'from-blue-500 to-cyan-400', component: ArrayVisualizer },
  { id: 'stack', title: 'Stack', icon: Layers, color: 'from-amber-500 to-orange-400', component: StackVisualizer },
  { id: 'queue', title: 'Queue', icon: ArrowRight, color: 'from-emerald-500 to-green-400', component: QueueVisualizer },
  { id: 'tree', title: 'Tree', icon: Network, color: 'from-rose-500 to-pink-400', component: TreeVisualizer },
  { id: 'graph', title: 'Graph', icon: Binary, color: 'from-indigo-500 to-blue-400', component: GraphVisualizer },
  { id: 'sorting', title: 'Sorting', icon: BarChart3, color: 'from-teal-500 to-cyan-400', component: SortingVisualizer },
  { id: 'pathfinding', title: 'Pathfinding', icon: Cpu, color: 'from-fuchsia-500 to-violet-400', component: PathfindingVisualizer },
];

export default function VisualizerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeDs = searchParams.get('ds');

  const activeVis = VISUALIZERS.find(v => v.id === activeDs);

  // If a visualizer is selected, render it full screen
  if (activeVis) {
    const Component = activeVis.component;
    return (
      <div className="min-h-screen bg-slate-950">
        {/* Back bar */}
        <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center gap-4">
          <button
            onClick={() => setSearchParams({})}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <activeVis.icon className="w-5 h-5 text-blue-400" />
            <span className="font-semibold text-white">{activeVis.title} Visualizer</span>
          </div>
        </div>
        <Component />
      </div>
    );
  }

  // Hub view — show all visualizer cards
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <Activity className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Visualizers</h1>
        </div>
        <p className="text-slate-400 mb-10 ml-14">
          Choose a data structure or algorithm to visualize interactively.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {VISUALIZERS.map(({ id, title, icon: VizIcon, color }) => (
            <button
              key={id}
              onClick={() => setSearchParams({ ds: id })}
              className="group text-left bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl"
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${color} mb-4`}>
                <VizIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {title}
              </h3>
              <p className="text-sm text-slate-500">Click to open interactive visualizer</p>
              <ArrowRight className="mt-4 w-5 h-5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
