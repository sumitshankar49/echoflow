"use client";

import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

type ButtonLoaderProps = {
  label?: string;
  className?: string;
};

export function ButtonLoader({ label = "Processing...", className }: ButtonLoaderProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <motion.span
        className="inline-flex h-4 w-4 rounded-full border-2 border-current border-r-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
      />
      <span>{label}</span>
    </span>
  );
}
