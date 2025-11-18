import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-6 px-6 border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <BookOpen className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              Muse
            </h1>
            <p className="text-xs text-slate-400 font-sans tracking-wide uppercase">AI Ghostwriter</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-sm text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Powered by Gemini 3 Pro & Flash TTS</span>
        </div>
      </div>
    </header>
  );
};

export default Header;