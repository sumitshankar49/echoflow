"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type SkeletonWaveProps = {
  className?: string;
  delay?: number;
};

export function SkeletonWave({ className, delay = 0 }: SkeletonWaveProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/20 bg-white/10 dark:border-white/10 dark:bg-white/5",
        className,
      )}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent dark:via-white/15"
        initial={{ x: "-120%" }}
        animate={{ x: "120%" }}
        transition={{
          duration: 1.35,
          repeat: Infinity,
          ease: "linear",
          delay,
        }}
      />
    </div>
  );
}
