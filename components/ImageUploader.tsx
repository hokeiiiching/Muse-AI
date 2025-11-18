import React, { useCallback, useState } from 'react';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  isAnalyzing: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, isAnalyzing }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageSelected(e.dataTransfer.files[0]);
    }
  }, [onImageSelected]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onImageSelected(e.target.files[0]);
    }
  };

  return (
    <div 
      className={`relative group cursor-pointer transition-all duration-300 ease-in-out rounded-2xl border-2 border-dashed 
        ${dragActive ? 'border-indigo-400 bg-indigo-500/10' : 'border-slate-700 bg-slate-900/30 hover:border-slate-500 hover:bg-slate-800/50'}
        flex flex-col items-center justify-center p-12 h-80 w-full overflow-hidden`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
        onChange={handleChange}
        accept="image/*"
        disabled={isAnalyzing}
      />
      
      {isAnalyzing ? (
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
          <p className="text-indigo-300 font-medium">Analyzing scene & mood...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 text-center z-0">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
            <ImageIcon className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-200">Drop an image to begin</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">
              Upload a photo or artwork. The Muse will interpret it and begin writing.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
            <Upload className="w-3 h-3" />
            <span>Supports JPG, PNG, WebP</span>
          </div>
        </div>
      )}
      
      {/* Decorative background glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </div>
  );
};

export default ImageUploader;