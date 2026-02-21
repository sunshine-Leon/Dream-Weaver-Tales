import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  generateOptions,
  generateStory,
  generateIllustration,
  generateAudio,
  OptionItem,
  GeneratedStory
} from './services/gemini';
import { SelectionGrid } from './components/SelectionGrid';
import { Sparkles, BookOpen, Volume2, VolumeX, RefreshCw, ChevronRight, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

type AppState = 'loading_options' | 'selection' | 'generating_story' | 'reading';

export default function App() {
  const [state, setState] = useState<AppState>('loading_options');

  // Options state
  const [options, setOptions] = useState<{
    animals: OptionItem[];
    scenes: OptionItem[];
    items: OptionItem[];
    styles: OptionItem[];
  } | null>(null);

  // Selection state
  const [selectedAnimals, setSelectedAnimals] = useState<OptionItem[]>([]);
  const [selectedScenes, setSelectedScenes] = useState<OptionItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<OptionItem[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<OptionItem[]>([]);

  // Story state
  const [story, setStory] = useState<GeneratedStory | null>(null);
  const [illustrationUrl, setIllustrationUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize
  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    setState('loading_options');
    try {
      const data = await generateOptions();
      setOptions(data);
      setState('selection');
    } catch (err) {
      console.error(err);
      // Retry or show error
    }
  };

  const toggleSelection = (
    item: OptionItem,
    list: OptionItem[],
    setList: React.Dispatch<React.SetStateAction<OptionItem[]>>
  ) => {
    if (list.find(i => i.id === item.id)) {
      setList(list.filter(i => i.id !== item.id));
    } else {
      setList([...list, item]);
    }
  };

  const handleCreateStory = async () => {
    if (selectedAnimals.length === 0 && selectedScenes.length === 0 && selectedItems.length === 0) {
      alert("Please select at least one item!");
      return;
    }

    setState('generating_story');
    setStory(null);
    setIllustrationUrl(null);
    setAudioUrl(null);
    setIsAudioLoading(true);

    try {
      // 1. Generate Story Text
      const storyData = await generateStory({
        animals: selectedAnimals,
        scenes: selectedScenes,
        items: selectedItems,
        styles: selectedStyles
      });
      setStory(storyData);

      // 2. Generate Illustration & Audio in parallel
      // We don't await audio here to show the story faster
      generateIllustration(storyData.imagePrompt).then(setIllustrationUrl);
      generateAudio(storyData.content).then((url) => {
        setAudioUrl(url);
        setIsAudioLoading(false);
      });

      setState('reading');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

    } catch (err: any) {
      console.error(err);
      alert(`Something went wrong creating your story: ${err.message || 'Unknown error'}`);
      setState('selection');
      setIsAudioLoading(false);
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const reset = () => {
    setSelectedAnimals([]);
    setSelectedScenes([]);
    setSelectedItems([]);
    setSelectedStyles([]);
    setStory(null);
    setIllustrationUrl(null);
    setAudioUrl(null);
    setState('selection');
  };

  return (
    <div className="min-h-screen bg-[#FDF6E3] font-sans text-slate-800 selection:bg-amber-200">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-10 border-b border-amber-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center text-white shadow-sm">
              <BookOpen size={20} />
            </div>
            <h1 className="text-xl md:text-2xl font-serif font-bold text-amber-900 tracking-tight">
              DreamWeaver Tales
            </h1>
          </div>
          {state === 'reading' && (
            <button
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 rounded-full transition-colors"
            >
              <RefreshCw size={16} />
              New Story
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 pb-24">
        <AnimatePresence mode="wait">

          {/* LOADING STATE */}
          {state === 'loading_options' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh]"
            >
              <div className="relative">
                <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-2xl">✨</div>
              </div>
              <p className="mt-6 text-lg font-medium text-amber-800 animate-pulse">Summoning magical ingredients...</p>
            </motion.div>
          )}

          {/* SELECTION STATE */}
          {state === 'selection' && options && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4">
                  Let's Build a Story!
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
                  Pick your favorite ingredients below, and we'll weave them into a magical tale just for you.
                </p>
                <button
                  onClick={loadOptions}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-full text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-sm font-medium shadow-sm"
                >
                  <RefreshCw size={16} />
                  Shuffle Options
                </button>
              </div>

              <SelectionGrid
                title="Choose Animals"
                items={options.animals}
                selectedIds={selectedAnimals.map(i => i.id)}
                onToggle={(item) => toggleSelection(item, selectedAnimals, setSelectedAnimals)}
                colorClass="emerald"
              />

              <SelectionGrid
                title="Choose a Scene"
                items={options.scenes}
                selectedIds={selectedScenes.map(i => i.id)}
                onToggle={(item) => toggleSelection(item, selectedScenes, setSelectedScenes)}
                colorClass="sky"
              />

              <SelectionGrid
                title="Pick Some Items"
                items={options.items}
                selectedIds={selectedItems.map(i => i.id)}
                onToggle={(item) => toggleSelection(item, selectedItems, setSelectedItems)}
                colorClass="amber"
              />

              <SelectionGrid
                title="Story Style"
                items={options.styles}
                selectedIds={selectedStyles.map(i => i.id)}
                onToggle={(item) => toggleSelection(item, selectedStyles, setSelectedStyles)}
                colorClass="rose"
              />

              <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 flex justify-center z-20">
                <button
                  onClick={handleCreateStory}
                  disabled={selectedAnimals.length === 0 && selectedScenes.length === 0}
                  className="
                    flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full 
                    font-bold text-lg shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed
                    transform transition-all active:scale-95
                  "
                >
                  <Sparkles className="animate-pulse" />
                  Weave My Story
                  <ChevronRight />
                </button>
              </div>
            </motion.div>
          )}

          {/* GENERATING STATE */}
          {state === 'generating_story' && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            >
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6 relative overflow-hidden">
                <Sparkles className="text-indigo-600 w-10 h-10 animate-spin-slow" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">Writing your masterpiece...</h3>
              <p className="text-slate-500 max-w-md">
                Our magical quills are scribbling away. The illustrations are being painted.
                Almost there!
              </p>

              <div className="mt-8 flex gap-2">
                <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </motion.div>
          )}

          {/* READING STATE */}
          {state === 'reading' && story && (
            <motion.div
              key="reading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100"
            >
              {/* Illustration */}
              <div className="aspect-video w-full bg-slate-100 relative overflow-hidden group">
                {illustrationUrl ? (
                  <img
                    src={illustrationUrl}
                    alt={story.imagePrompt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Loader2 className="animate-spin mr-2" /> Generating illustration...
                  </div>
                )}

                {/* Audio Controls Overlay */}
                <div className="absolute bottom-4 right-4">
                  {audioUrl ? (
                    <button
                      onClick={toggleAudio}
                      className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur text-slate-900 rounded-full shadow-lg hover:bg-white transition-all font-medium"
                    >
                      {isPlaying ? <VolumeX size={20} /> : <Volume2 size={20} />}
                      {isPlaying ? 'Pause' : 'Read to Me'}
                    </button>
                  ) : isAudioLoading ? (
                    <div className="px-4 py-2 bg-black/50 backdrop-blur text-white rounded-full text-sm flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" /> Preparing audio...
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Story Content */}
              <div className="p-8 md:p-12">
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-6 text-center leading-tight">
                  {story.title}
                </h2>

                <div className="prose prose-lg prose-slate mx-auto font-serif leading-relaxed">
                  {story.content.split('\n').map((paragraph, idx) => (
                    paragraph.trim() && <p key={idx} className="mb-4 text-slate-700">{paragraph}</p>
                  ))}
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100 flex justify-center">
                  <p className="text-sm text-slate-400 italic">
                    Generated by DreamWeaver Tales AI
                  </p>
                </div>
              </div>

              {/* Hidden Audio Element */}
              {audioUrl && (
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
