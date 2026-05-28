'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Mic, Save, Square, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { notesQueryKeys } from '@/features/notes/shared/data/notes.query-keys';
import { notesService } from '@/features/notes/shared/data/notes.service';

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechResultLike = {
  isFinal: boolean;
  0: {
    transcript: string;
  };
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: SpeechResultLike[];
};

type SpeechRecognitionWindow = {
  SpeechRecognition?: new () => SpeechRecognitionLike;
  webkitSpeechRecognition?: new () => SpeechRecognitionLike;
};

function createVoiceTitle(transcript: string) {
  const firstChunk = transcript.replace(/\s+/g, ' ').trim().slice(0, 44);

  if (!firstChunk) {
    return 'Voice note';
  }

  return `Voice: ${firstChunk}${transcript.length > 44 ? '...' : ''}`;
}

export function GlobalVoiceNoteWidget() {
  const queryClient = useQueryClient();
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [transcript, setTranscript] = useState('');

  const createNoteMutation = useMutation({
    mutationFn: notesService.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: notesQueryKeys.all });
      toast.success('Voice note saved');
    },
    onError: () => {
      toast.error('Could not save voice note');
    },
  });

  const stopCapture = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      return;
    }

    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    recognition.abort();
    recognitionRef.current = null;
    setIsCapturing(false);
  };

  useEffect(() => {
    return () => {
      stopCapture();
    };
  }, []);

  const toggleCapture = () => {
    if (typeof window === 'undefined') {
      return;
    }

    const Recognition =
      (window as unknown as SpeechRecognitionWindow).SpeechRecognition ??
      (window as unknown as SpeechRecognitionWindow).webkitSpeechRecognition;

    if (!Recognition) {
      toast.info('Speech recognition is not available in this browser');
      return;
    }

    if (isCapturing) {
      stopCapture();
      return;
    }

    stopCapture();

    const recognition = new Recognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = true;

    recognitionRef.current = recognition;
    setIsCapturing(true);

    recognition.onresult = (event) => {
      const chunks: string[] = [];

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        if (event.results[i]?.isFinal) {
          chunks.push(event.results[i][0].transcript);
        }
      }

      const nextText = chunks.join(' ').trim();
      if (!nextText) {
        return;
      }

      setTranscript((current) => `${current}${current ? '\n' : ''}${nextText}`);
    };

    recognition.onerror = () => {
      setIsCapturing(false);
      recognitionRef.current = null;
      toast.error('Could not capture voice');
    };

    recognition.onend = () => {
      setIsCapturing(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch {
      setIsCapturing(false);
      recognitionRef.current = null;
      toast.error('Could not start voice capture. Try again.');
    }
  };

  const handleSave = async () => {
    const trimmed = transcript.trim();
    if (!trimmed) {
      toast.info('Record something first');
      return;
    }

    await createNoteMutation.mutateAsync({
      title: createVoiceTitle(trimmed),
      content: trimmed.replace(/\n/g, '<br/>'),
      tags: ['voice'],
      isFavorite: false,
    });

    stopCapture();
    setTranscript('');
    setIsOpen(false);
  };

  return (
    <>
      <div className="pointer-events-none fixed bottom-20 right-4 z-[60] sm:bottom-6 sm:right-6">
        <motion.button
          type="button"
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          aria-label="Open voice note"
          className="pointer-events-auto relative flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-white shadow-[0_16px_30px_-14px_rgba(6,182,212,0.9)] sm:h-14 sm:w-14"
        >
          <Mic className="h-5 w-5 sm:h-6 sm:w-6" />
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              stopCapture();
              setIsOpen(false);
            }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm sm:p-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 42, scale: 0.88, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(4px)' }}
              transition={{ type: 'spring', stiffness: 260, damping: 24, mass: 0.8 }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-[560px] rounded-3xl border border-cyan-200/40 bg-white p-5 shadow-[0_32px_90px_-40px_rgba(8,145,178,0.85)] sm:p-6"
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-cyan-700">Voice note</p>
                  <h3 className="text-lg font-semibold text-slate-900">Record and save to notes</h3>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    stopCapture();
                    setIsOpen(false);
                  }}
                  aria-label="Close voice note"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <textarea
                value={transcript}
                onChange={(event) => setTranscript(event.target.value)}
                placeholder="Your speech transcript appears here..."
                className="h-36 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none focus:border-cyan-400"
              />

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  onClick={toggleCapture}
                  className={isCapturing ? 'bg-red-500 hover:bg-red-600' : ''}
                >
                  {isCapturing ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  {isCapturing ? 'Stop' : 'Start'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSave}
                  disabled={createNoteMutation.isPending || !transcript.trim()}
                >
                  <Save className="h-4 w-4" />
                  Save note
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setTranscript('')}
                  disabled={!transcript.trim()}
                >
                  Clear
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}