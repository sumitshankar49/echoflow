"use client";

import { AnimatePresence, motion } from "framer-motion";
import { type ReactNode } from "react";

type ContentRevealProps = {
  loading: boolean;
  loader: ReactNode;
  children: ReactNode;
};

export function ContentReveal({ loading, loader, children }: ContentRevealProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {loading ? (
        <motion.div
          key="loader"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
        >
          {loader}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
