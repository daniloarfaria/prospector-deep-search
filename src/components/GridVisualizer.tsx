/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";

interface GridVisualizerProps {
  points: { lat: number, lng: number }[];
  currentIdx: number;
}

export function GridVisualizer({ points, currentIdx }: GridVisualizerProps) {
  if (points.length === 0) return (
    <div className="grid grid-cols-6 gap-1 mt-3">
      {Array(36).fill(null).map((_, i) => (
        <div key={i} className="aspect-square rounded-[4px] bg-[#F1F5F9] border border-border-subtle" />
      ))}
    </div>
  );

  const side = Math.ceil(Math.sqrt(points.length));
  
  return (
    <div 
      className="grid gap-1 mt-3"
      style={{ 
        gridTemplateColumns: `repeat(${side}, minmax(0, 1fr))`,
      }}
    >
      {points.map((_, i) => (
        <motion.div
          key={i}
          initial={false}
          animate={{
            backgroundColor: i < currentIdx ? "#10B981" : (i === currentIdx ? "#F59E0B" : "#F1F5F9"),
            scale: i === currentIdx ? [1, 1.1, 1] : 1,
            opacity: i === currentIdx ? 1 : (i < currentIdx ? 0.8 : 1)
          }}
          transition={{
            duration: i === currentIdx ? 1.5 : 0.2,
            repeat: i === currentIdx ? Infinity : 0
          }}
          className="aspect-square rounded-[4px] border border-border-subtle"
        />
      ))}
    </div>
  );
}
