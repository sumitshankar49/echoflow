'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type TimerPhase = 'focus' | 'shortBreak' | 'longBreak';

interface UseFocusTimerOptions {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartSessions: boolean;
  onSessionComplete?: (durationMinutes: number, wasCompleted: boolean) => void;
}

function phaseSeconds(phase: TimerPhase, options: UseFocusTimerOptions): number {
  if (phase === 'focus') return options.focusDuration * 60;
  if (phase === 'shortBreak') return options.shortBreakDuration * 60;
  return options.longBreakDuration * 60;
}

export function useFocusTimer(options: UseFocusTimerOptions) {
  const [phase, setPhase] = useState<TimerPhase>('focus');
  const [secondsLeft, setSecondsLeft] = useState(options.focusDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalFocusSeconds, setTotalFocusSeconds] = useState(0);

  const phaseRef = useRef(phase);
  const secondsLeftRef = useRef(secondsLeft);
  const isRunningRef = useRef(isRunning);
  const completedSessionsRef = useRef(completedSessions);
  const optionsRef = useRef(options);

  phaseRef.current = phase;
  secondsLeftRef.current = secondsLeft;
  isRunningRef.current = isRunning;
  completedSessionsRef.current = completedSessions;
  optionsRef.current = options;

  const totalSeconds = phaseSeconds(phase, options);
  const progress = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0;

  const advancePhase = useCallback(() => {
    const currentPhase = phaseRef.current;
    const currentCompleted = completedSessionsRef.current;
    const opts = optionsRef.current;

    if (currentPhase === 'focus') {
      const nextCompleted = currentCompleted + 1;
      setCompletedSessions(nextCompleted);
      setTotalFocusSeconds((prev) => prev + opts.focusDuration * 60);
      opts.onSessionComplete?.(opts.focusDuration, true);

      const isLongBreak = nextCompleted % opts.sessionsUntilLongBreak === 0;
      const nextPhase: TimerPhase = isLongBreak ? 'longBreak' : 'shortBreak';
      setPhase(nextPhase);
      setSecondsLeft(phaseSeconds(nextPhase, opts));
      setIsRunning(opts.autoStartBreaks);
    } else {
      setPhase('focus');
      setSecondsLeft(phaseSeconds('focus', opts));
      setIsRunning(opts.autoStartSessions);
    }
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          advancePhase();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, advancePhase]);

  // Sync timer when settings change and timer is not running
  useEffect(() => {
    if (!isRunningRef.current) {
      setSecondsLeft(phaseSeconds(phaseRef.current, options));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.focusDuration, options.shortBreakDuration, options.longBreakDuration]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setSecondsLeft(phaseSeconds(phaseRef.current, optionsRef.current));
  }, []);

  const switchPhase = useCallback((nextPhase: TimerPhase) => {
    setIsRunning(false);
    setPhase(nextPhase);
    setSecondsLeft(phaseSeconds(nextPhase, optionsRef.current));
  }, []);

  const skipPhase = useCallback(() => {
    advancePhase();
  }, [advancePhase]);

  return {
    phase,
    secondsLeft,
    totalSeconds,
    progress,
    isRunning,
    completedSessions,
    totalFocusSeconds,
    start,
    pause,
    reset,
    switchPhase,
    skipPhase,
  };
}
