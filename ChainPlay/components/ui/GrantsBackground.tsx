"use client";

import React from "react";
import { motion } from "framer-motion";

interface FuturisticBackgroundProps {
  children: React.ReactNode;
}

export default function FuturisticBackground({
  children,
}: FuturisticBackgroundProps) {
  return (
    <div className="relative w-full min-h-[92vh] overflow-hidden bg-gradient-to-br from-green-900 to-cyan-900">
      <motion.div
        className="absolute inset-0"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 200,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {/* Animated circles */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full mix-blend-screen filter blur-xl opacity-70"
            animate={{
              scale: [1, 2, 2, 1, 1],
              opacity: [0.1, 0.2, 0.4, 0.2, 0.1],
              x: [0, 100, 200, 100, 0],
              y: [0, -100, 0, 100, 0],
              transition: {
                duration: Math.random() * 5 + 5,
                repeat: Infinity,
                repeatType: "reverse",
              },
            }}
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              backgroundColor: Math.random() > 0.5 ? "#00ff00" : "#00ffff",
            }}
          />
        ))}
      </motion.div>

      {/* Content */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}
