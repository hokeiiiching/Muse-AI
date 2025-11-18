import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import StoryCard from './components/StoryCard';
import { generateStoryFromImage, generateSpeechFromText } from './services/geminiService';
import { decodeBase64, decodeAudioData, fileToBase64 } from './utils/audioUtils';

function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // AI States
  const [story, setStory] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio Playback State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null); // Cache the decoded buffer

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
      } catch (e) {
        // Ignore errors if already stopped
      }
      sourceNodeRef.current = null;
    }
    setIsPlayingAudio(false);
  };

  const handleImageSelected = async (file: File) => {
    // Reset previous states
    setError(null);
    setStory(null);
    setImageFile(file);
    stopAudio();
    audioBufferRef.current = null;

    // Create local preview
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);

    setIsAnalyzing(true);

    try {
      // 1. Convert file to Base64
      const base64Image = await fileToBase64(file);
      
      // 2. Call Gemini Vision to generate story
      const generatedStory = await generateStoryFromImage(base64Image, file.type);
      setStory(generatedStory);

    } catch (err: any) {
      console.error(err);
      setError("Failed to generate story. Please try a different image or check your connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePlayAudio = async () => {
    if (!story) return;
    
    try {
      // Initialize AudioContext if not present (must be user initiated)
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }

      // Resume context if suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // If we already have the buffer, just play it
      if (audioBufferRef.current) {
        playBuffer(audioBufferRef.current);
        return;
      }

      setIsGeneratingAudio(true);

      // 1. Fetch raw audio PCM (base64 encoded) from Gemini TTS
      // Using 'Kore' voice for a deep, storytelling tone, or 'Puck' for lighter.
      // Let's use 'Fenrir' if available for epicness, or 'Zephyr'.
      // We'll stick to the service default or pass one.
      const base64Audio = await generateSpeechFromText(story);

      // 2. Decode base64 to bytes
      const audioBytes = decodeBase64(base64Audio);

      // 3. Decode raw PCM to AudioBuffer
      // Important: Gemini TTS returns 24kHz sample rate raw PCM usually.
      const audioBuffer = await decodeAudioData(audioBytes, audioContextRef.current, 24000, 1);
      audioBufferRef.current = audioBuffer;

      // 4. Play
      playBuffer(audioBuffer);

    } catch (err) {
      console.error("Audio playback failed", err);
      setError("Failed to generate audio speech.");
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const playBuffer = (buffer: AudioBuffer) => {
    if (!audioContextRef.current) return;

    // Stop any currently playing audio
    stopAudio();

    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    
    source.onended = () => {
      setIsPlayingAudio(false);
      sourceNodeRef.current = null;
    };

    sourceNodeRef.current = source;
    source.start();
    setIsPlayingAudio(true);
  };

  const handleReset = () => {
    stopAudio();
    setImageFile(null);
    setImagePreview(null);
    setStory(null);
    setError(null);
    audioBufferRef.current = null;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10 pb-24">
        {/* Introduction / Empty State */}
        {!imagePreview && !isAnalyzing ? (
          <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-white tracking-tight">
                Every picture tells a story.
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                Upload an image to unlock its hidden narrative. Our AI will analyze the mood,
                compose a unique story opening, and narrate it to you.
              </p>
            </div>
            
            <div className="bg-slate-900/50 p-1 rounded-3xl shadow-2xl shadow-indigo-500/10 border border-slate-800">
              <ImageUploader 
                onImageSelected={handleImageSelected} 
                isAnalyzing={isAnalyzing} 
              />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center pt-8">
              <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/50">
                <div className="text-indigo-400 font-bold text-xl mb-1">1</div>
                <div className="text-sm text-slate-400">Upload Image</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/50">
                <div className="text-purple-400 font-bold text-xl mb-1">2</div>
                <div className="text-sm text-slate-400">AI Writes Story</div>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/50">
                <div className="text-pink-400 font-bold text-xl mb-1">3</div>
                <div className="text-sm text-slate-400">Listen to Narration</div>
              </div>
            </div>
          </div>
        ) : (
          // Results State
          <div className="space-y-8">
             {/* Error Banner */}
             {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-lg flex items-center justify-between animate-fade-in">
                <span>{error}</span>
                <button onClick={() => setError(null)} className="text-sm hover:underline">Dismiss</button>
              </div>
            )}

            {/* Content Area */}
            {(isAnalyzing || story) && imagePreview && (
              <StoryCard 
                story={story || "The Muse is gathering thoughts..."} 
                imagePreview={imagePreview}
                isGeneratingAudio={isGeneratingAudio}
                isPlayingAudio={isPlayingAudio}
                onPlayAudio={handlePlayAudio}
                onStopAudio={stopAudio}
                onReset={handleReset}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;