"use client";

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock3, Sparkles } from 'lucide-react';



function formatDate(value: Date) {
  const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(value);
  const day = new Intl.DateTimeFormat('en-GB', { day: '2-digit' }).format(value);
  const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(value);
  const year = new Intl.DateTimeFormat('en-US', { year: 'numeric' }).format(value);

  return `${weekday}, ${day} ${month} ${year}`;
}

function formatDigitalTimeParts(value: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(value);

  const hour = parts.find((part) => part.type === 'hour')?.value ?? '00';
  const minute = parts.find((part) => part.type === 'minute')?.value ?? '00';
  const dayPeriod = parts.find((part) => part.type === 'dayPeriod')?.value?.toUpperCase() ?? '';

  return {
    hourMinute: `${hour}:${minute}`,
    period: dayPeriod,
  };
}

function formatTimezoneLabel() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const shortZone = new Intl.DateTimeFormat('en-US', {
    timeZoneName: 'short',
  })
    .formatToParts(new Date())
    .find((part) => part.type === 'timeZoneName')?.value;

  const cityMap: Record<string, string> = {
    'Asia/Kolkata': 'Hyderabad, India',
    'Asia/Calcutta': 'Hyderabad, India',
    'America/New_York': 'New York, USA',
    'Europe/London': 'London, UK',
  };

  const city = cityMap[timezone] ?? timezone.split('/').slice(1).join(', ').replace(/_/g, ' ');

  return `${city} • ${shortZone ?? timezone}`;
}

export function RealTimeClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      const current = new Date();
      setNow(current);
    }, 50);

    return () => window.clearInterval(timer);
  }, []);

  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds() + now.getMilliseconds() / 1000;

  const hourRotation = ((hour % 12) + minute / 60) * 30;
  const minuteRotation = (minute + second / 60) * 6;
  const secondRotation = second * 6;
  const secondsProgress = second / 60;
  const digitalRingRadius = 43;
  const digitalRingCircumference = 2 * Math.PI * digitalRingRadius;
  const digitalRingOffset = digitalRingCircumference * (1 - secondsProgress);

  const dateLabel = useMemo(() => formatDate(now), [now]);
  const timeLabel = useMemo(() => formatDigitalTimeParts(now), [now]);
  const timezoneLabel = useMemo(() => formatTimezoneLabel(), []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 14, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      whileHover={{ scale: 1.01 }}
      className="relative overflow-hidden rounded-[1.8rem] border border-white/20 bg-slate-900/68 p-4 shadow-[0_22px_70px_-44px_rgba(79,70,229,0.65)] backdrop-blur-xl sm:p-5"
    >
      <div className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-violet-400/28 blur-3xl dark:bg-violet-500/26" />
      <div className="pointer-events-none absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-cyan-400/22 blur-3xl dark:bg-cyan-400/20" />

      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-300/30"
        animate={{ scale: [0.98, 1.04, 0.98], opacity: [0.25, 0.55, 0.25] }}
        transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative grid items-center gap-5 sm:gap-6 md:grid-cols-[160px_minmax(0,1fr)]">
        <div className="mx-auto flex w-full max-w-[170px] items-center justify-center md:max-w-[160px]">
          <div className="relative h-36 w-36 rounded-full border border-white/40 bg-gradient-to-br from-slate-200/90 via-slate-300/70 to-cyan-100/55 shadow-[0_0_45px_-22px_rgba(79,70,229,0.9)]">
            <div className="absolute inset-[10px] rounded-full border border-white/45" />

            {Array.from({ length: 12 }).map((_, index) => (
              <span
                key={index}
                className="absolute left-1/2 top-1/2 h-[44%] w-[2px] -translate-x-1/2 -translate-y-1/2"
                style={{ transform: `translate(-50%, -50%) rotate(${index * 30}deg)` }}
              >
                <span className="absolute left-1/2 top-[2px] h-2 w-[2px] -translate-x-1/2 rounded-full bg-zinc-500/65" />
              </span>
            ))}

            {Array.from({ length: 12 }).map((_, index) => {
              const value = index === 0 ? 12 : index;
              const angle = value * 30;

              return (
                <span
                  key={`number-${value}`}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-52px)`,
                  }}
                >
                  <span
                    className="block text-[10px] font-semibold text-zinc-700"
                    style={{ transform: `rotate(-${angle}deg)` }}
                  >
                    {value}
                  </span>
                </span>
              );
            })}

            <span
              className="absolute left-1/2 top-1/2 h-[24%] w-1 origin-bottom rounded-full bg-zinc-900"
              style={{ transform: `translate(-50%, -100%) rotate(${hourRotation}deg)` }}
            />

            <span
              className="absolute left-1/2 top-1/2 h-[33%] w-[3px] origin-bottom rounded-full bg-indigo-600"
              style={{ transform: `translate(-50%, -100%) rotate(${minuteRotation}deg)` }}
            />

            <span
              className="absolute left-1/2 top-1/2 h-[37%] w-[2px] origin-bottom rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
              style={{ transform: `translate(-50%, -100%) rotate(${secondRotation}deg)` }}
            />

          </div>
        </div>

        <div className="space-y-2.5 text-center md:text-left">

          <div className="flex justify-center md:justify-start">
            <div className="relative h-[6.7rem] w-[6.7rem] sm:h-[7.2rem] sm:w-[7.2rem]">
              <svg
                className="absolute inset-0 h-full w-full -rotate-90"
                viewBox="0 0 100 100"
                aria-hidden="true"
              >
                <circle
                  cx="50"
                  cy="50"
                  r={digitalRingRadius}
                  className="fill-none stroke-white/18"
                  strokeWidth="2.2"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r={digitalRingRadius}
                  className="fill-none stroke-cyan-300 drop-shadow-[0_0_7px_rgba(103,232,249,0.95)]"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeDasharray={digitalRingCircumference}
                  animate={{ strokeDashoffset: digitalRingOffset }}
                  transition={{ duration: 0.08, ease: 'linear' }}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="font-['Inter',system-ui,sans-serif] text-[1.35rem] leading-none font-semibold tracking-tight text-white tabular-nums sm:text-[1.5rem]">
                  {timeLabel.hourMinute}
                </p>
                <span className="mt-1 text-[0.65rem] font-semibold tracking-[0.14em] text-cyan-200/95 sm:text-[0.7rem]">
                  {timeLabel.period}
                </span>
              </div>

              <span className="sr-only">seconds circular progress indicator</span>
            </div>
          </div>

          <p className="text-sm text-zinc-200 sm:text-[1rem]">{dateLabel}</p>

        </div>
      </div>
    </motion.section>
  );
}
