import { Pencil, Eraser, MousePointer, Volume2, Trash2 } from 'lucide-react';

export default function QuickToolbar({
  activeTool,
  setActiveTool,
  clearActiveTrack
}) {
  const tools = [
    { id: 'draw', label: 'Draw Notes (D)', icon: Pencil },
    { id: 'erase', label: 'Erase Notes (E)', icon: Eraser },
    { id: 'select', label: 'Select Notes (S)', icon: MousePointer },
    { id: 'velocity', label: 'Velocity (V)', icon: Volume2 }
  ];

  return (
    <div className="absolute top-3 right-6 z-30 flex items-center gap-1.5 bg-black/85 backdrop-blur-2xl px-2.5 py-1.5 rounded-lg border border-white/10 shadow-[0_12px_36px_rgba(0,0,0,0.7)]">
      {tools.map(tool => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer active:scale-95 border ${
              isActive
                ? 'bg-white text-black border-white shadow-[0_0_14px_rgba(255,255,255,0.35)]'
                : 'bg-white/[0.03] text-slate-400 border-transparent hover:text-white hover:bg-white/10'
            }`}
            title={tool.label}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{tool.id}</span>
          </button>
        );
      })}

      <div className="w-px h-5 bg-white/10 mx-1" />

      <button
        onClick={clearActiveTrack}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider text-rose-400 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer active:scale-95"
        title="Clear Current Track Notes"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Clear</span>
      </button>
    </div>
  );
}
