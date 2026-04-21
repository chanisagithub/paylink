"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

export function SuccessCelebrationIcon() {
  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 16 }}
      className="relative"
    >
      <motion.div
        className="absolute inset-0 rounded-full bg-emerald-500/20"
        initial={{ scale: 0.7, opacity: 0.7 }}
        animate={{ scale: 1.4, opacity: 0 }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
      <div className="relative rounded-full bg-emerald-500/10 p-3 text-emerald-600">
        <CheckCircle2 className="h-8 w-8" />
      </div>
    </motion.div>
  );
}

