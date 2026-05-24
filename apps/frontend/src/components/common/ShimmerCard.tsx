"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

import { SkeletonWave } from "./SkeletonWave";

type ShimmerCardProps = {
  className?: string;
  lineCount?: number;
  showAvatar?: boolean;
  delay?: number;
};

export function ShimmerCard({
  className,
  lineCount = 3,
  showAvatar = false,
  delay = 0,
}: ShimmerCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, delay }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/20 bg-white/15 p-4 shadow-[0_18px_44px_-34px_rgba(15,23,42,0.85)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5",
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-cyan-300/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-violet-300/20 blur-2xl" />

      <div className="relative space-y-3">
        {showAvatar ? (
          <div className="flex items-center gap-3">
            <SkeletonWave className="h-10 w-10 rounded-full" delay={delay + 0.05} />
            <SkeletonWave className="h-4 w-28" delay={delay + 0.1} />
          </div>
        ) : null}

        {Array.from({ length: lineCount }).map((_, index) => (
          <SkeletonWave
            key={index}
            delay={delay + index * 0.08}
            className={cn(
              "h-3",
              index === 0 ? "w-10/12" : index === lineCount - 1 ? "w-6/12" : "w-full",
            )}
          />
        ))}
      </div>
    </motion.div>
  );
}
