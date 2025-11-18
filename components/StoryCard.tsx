import React, { useEffect, useState } from 'react';
import { Volume2, Square, RefreshCw, Download } from 'lucide-react';
import { VoiceName } from '../types';

interface StoryCardProps {
  story: string;
  imagePreview: string;
  isGeneratingAudio: boolean;
  isPlayingAudio: boolean;
  onPlayAudio: () => void;
  onStopAudio: () => void;
  onReset: () => void;
}

const StoryCard: React.FC<StoryCardProps> = ({
  story,
  imagePreview,
  isGeneratingAudio,
  isPlayingAudio,
  onPlayAudio,
  onStopAudio,
  onReset
}) => {
  // Simulate typing effect for the story text
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let index = 0;
    const speed = 15; // ms per char
    
    // Reset when story changes
    setDisplayedText('');
    
    const intervalId = setInterval(() => {
      if (index < story.length) {
        setDisplayedText((prev) => prev + story.charAt(index));
        index++;
      } else {
        clearInterval(intervalId);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [story]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full animate-fade-in">
      {/* Image Column */}
      <div className="relative group rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900 aspect-[4/3] lg:aspect-auto lg:h-full max-h-[600px]">
        <img 
          src={imagePreview} 
          alt="Inspiration" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
           <span className="text-xs font-mono text-white/50 bg-black/30 backdrop-blur-sm px-2 py-1 rounded">
             GEMINI 3 PRO VISION
           </span>
        </div>
      </div>

      {/* Story Column */}
      <div className="flex flex-col justify-center p-6 lg:p-10 bg-slate-900/40 border border-slate-800 rounded-2xl backdrop-blur-sm shadow-xl">
        <div className="mb-6">
          <h2 className="font-serif text-3xl text-slate-100 mb-4 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              The Muse Speaks
            </span>
          </h2>
          <div className="prose prose-invert prose-lg max-w-none">
            <p className="font-serif leading-relaxed text-slate-300 whitespace-pre-wrap">
              {displayedText}
              {displayedText.length < story.length && (
                <span className="inline-block w-2 h-5 ml-1 bg-indigo-400 animate-pulse align-middle"></span>
              )}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-auto pt-8 border-t border-slate-800 flex flex-wrap items-center gap-4">
          {isPlayingAudio ? (
            <button 
              onClick={onStopAudio}
              className="flex items-center gap-2 px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/30 rounded-full hover:bg-red-500/20 transition-all"
            >
              <Square className="w-5 h-5 fill-current" />
              <span className="font-medium">Stop Narration</span>
            </button>
          ) : (
            <button 
              onClick={onPlayAudio}
              disabled={isGeneratingAudio || displayedText.length < story.length}
              className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all shadow-lg shadow-indigo-900/20
                ${isGeneratingAudio || displayedText.length < story.length
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:shadow-indigo-600/30 hover:-translate-y-0.5'
                }`}
            >
              {isGeneratingAudio ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
              <span className="font-medium">
                {isGeneratingAudio ? "Synthesizing Voice..." : "Read Aloud"}
              </span>
            </button>
          )}

          <div className="flex-grow"></div>

          <button 
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>New Story</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryCard;