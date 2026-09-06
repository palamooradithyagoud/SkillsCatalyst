"use client";

import React from "react";
import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import { BEGINNER_TREE_DATA } from "@/data/practice/dsaTreeData";
import { calculateNodeProgress } from "@/lib/practice/practiceHelpers";

interface BeginnerDSATreeProps {
  drawerSolved: Record<number, boolean>;
  onSelectTopic: (topicName: string) => void;
}

export function BeginnerDSATree({
  drawerSolved,
  onSelectTopic,
}: BeginnerDSATreeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-[28px] p-6 sm:p-10 bg-white border border-slate-100 shadow-xs overflow-hidden min-h-[620px]"
    >
      {/* Ambient Glow Aura behind Foundation */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-64 h-32 bg-cyan-500/15 blur-3xl rounded-full pointer-events-none" />

      {/* Top Foundation Root Node & Branching Tree Structure */}
      <div className="flex flex-col items-center justify-center relative z-10 mb-8">
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          className="px-8 py-3.5 rounded-full text-white font-black text-lg flex items-center gap-2.5 shadow-lg bg-gradient-to-r from-[#173e32] via-[#12362b] to-[#0d2a21] border border-emerald-400/40 cursor-pointer relative z-20"
        >
          <Layers className="w-5 h-5 text-emerald-300" />
          <span>Foundation</span>
        </motion.div>

        {/* Vertical trunk line below Foundation */}
        <div className="w-0.5 h-8 bg-emerald-700" />

        {/* Horizontal Branch Bar spreading across 4 columns (Desktop) */}
        <div className="hidden lg:block w-[75%] h-0.5 bg-gradient-to-r from-emerald-500 via-purple-500 to-sky-500 relative">
          <div className="absolute left-0 top-0 w-0.5 h-7 bg-emerald-600" />
          <div className="absolute left-0 top-7 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-emerald-600 shadow-xs" />

          <div className="absolute left-[33.33%] top-0 w-0.5 h-7 bg-purple-600" />
          <div className="absolute left-[33.33%] top-7 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-purple-600 shadow-xs" />

          <div className="absolute left-[66.66%] top-0 w-0.5 h-7 bg-amber-500" />
          <div className="absolute left-[66.66%] top-7 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-amber-500 shadow-xs" />

          <div className="absolute right-0 top-0 w-0.5 h-7 bg-sky-500" />
          <div className="absolute right-0 top-7 translate-x-1/2 w-2.5 h-2.5 rounded-full bg-sky-500 shadow-xs" />
        </div>
      </div>

      {/* 4 Category Columns Grid (Side-by-Side on Smartphones) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8 relative z-10 pt-4">
        {BEGINNER_TREE_DATA.map((cat, cIdx) => {
          const CategoryIcon = cat.icon;

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: cIdx * 0.1, duration: 0.4 }}
              className="space-y-4 flex flex-col items-center relative"
            >
              {/* Category Header Node */}
              <motion.div
                whileHover={{ scale: 1.04, y: -2 }}
                className={`w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r ${cat.gradient} text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer relative z-10 border border-white/20`}
              >
                <CategoryIcon className="w-4.5 h-4.5 text-white" />
                <span>{cat.title}</span>
              </motion.div>

              {/* Vertical Connector Line under Category Header */}
              <div className="flex flex-col items-center my-1 relative z-10">
                <div className="w-0.5 h-4" style={{ backgroundColor: cat.color }} />
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
              </div>

              {/* Sub-nodes Vertical Flow */}
              <div className="w-full space-y-3 relative z-10">
                {cat.nodes.map((node, nIdx) => {
                  const NodeIcon = node.icon;
                  const { solved, total, pct } = calculateNodeProgress(node.id, drawerSolved);

                  return (
                    <React.Fragment key={node.id}>
                      {nIdx > 0 && (
                        <div className="flex flex-col items-center my-1">
                          <div className="w-0.5 h-3" style={{ backgroundColor: `${cat.color}60` }} />
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                          <div className="w-0.5 h-3" style={{ backgroundColor: `${cat.color}60` }} />
                        </div>
                      )}

                      {/* Node Button — vibrant card styling */}
                      <motion.button
                        whileHover={{ scale: 1.03, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSelectTopic(node.title)}
                        className="w-full py-3.5 px-4 rounded-2xl text-xs font-bold border transition-all duration-200 flex items-center gap-3 shadow-sm hover:shadow-md relative overflow-hidden text-slate-900 cursor-pointer group"
                        style={{
                          background: `linear-gradient(135deg, ${cat.color}14 0%, #ffffff 85%)`,
                          borderTopColor: `${cat.color}45`,
                          borderRightColor: `${cat.color}45`,
                          borderBottomColor: `${cat.color}45`,
                          borderLeftColor: cat.color,
                          borderLeftWidth: "4px",
                        }}
                      >
                        {/* Color progress fill behind label */}
                        {pct > 0 && (
                          <motion.div
                            className="absolute inset-0 rounded-2xl pointer-events-none"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            style={{
                              background: `${cat.color}22`,
                            }}
                          />
                        )}

                        {/* Solid Brand Icon Badge */}
                        <div
                          className="w-7 h-7 rounded-xl flex items-center justify-center relative z-10 transition-transform group-hover:scale-110 shrink-0"
                          style={{
                            background: `linear-gradient(135deg, ${cat.color}, ${cat.color}dd)`,
                            color: "#ffffff",
                            boxShadow: `0 3px 10px ${cat.color}40`,
                          }}
                        >
                          <NodeIcon className="w-3.5 h-3.5 text-white" />
                        </div>

                        <span className="flex-1 text-left relative z-10 text-slate-900 font-extrabold group-hover:text-slate-950 text-xs">
                          {node.title}
                        </span>

                        {/* Progress counter badge */}
                        {total > 0 && (
                          <span
                            className="text-[10px] font-black px-2.5 py-0.5 rounded-full relative z-10 shrink-0 tabular-nums"
                            style={
                              pct > 0
                                ? {
                                    background: `linear-gradient(135deg, ${cat.color}, ${cat.color}ee)`,
                                    color: "#ffffff",
                                    boxShadow: `0 2px 8px ${cat.color}35`,
                                  }
                                : {
                                    backgroundColor: "#f1f5f9",
                                    color: "#475569",
                                    border: "1px solid #e2e8f0",
                                  }
                            }
                          >
                            {solved}/{total}
                          </span>
                        )}
                      </motion.button>
                    </React.Fragment>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
