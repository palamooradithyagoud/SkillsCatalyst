"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Plus, Edit3, ArrowUpRight, Check, Trash2, Calendar, X, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface HomeworkTask {
  id: string;
  title: string;
  deadline: string;
  progress: number; // 0, 35, 65, 100
  scheduledDay?: number; // 1-7
}

export interface NoteItem {
  id: string;
  text: string;
  day: number;
  date: string;
}

export default function UpcomingList({ items = [] }: { items?: any[] }) {
  const [viewMode, setViewMode] = useState<"weekly" | "monthly">("weekly");
  // Dynamic real-time date calculation starting from today
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());

  // Portal mount check for Next.js SSR
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Modals state
  const [isNewEventModalOpen, setIsNewEventModalOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);

  // Form inputs for new event/task
  const [newTitle, setNewTitle] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [newProgress, setNewProgress] = useState(0);

  // Form input for note
  const [noteText, setNoteText] = useState("");

  // Generate 7 days of the current week starting from Monday
  const days = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon...
    const distanceToMon = (dayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMon);

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return dayNames.map((name, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateNum = d.getDate();
      const isToday = d.toDateString() === now.toDateString();
      const monthStr = d.toLocaleDateString("en-US", { month: "short" });
      return {
        day: name,
        date: dateNum,
        month: monthStr,
        isToday,
        fullDateObj: d,
      };
    });
  }, []);

  // Format today's header strings dynamically
  const currentMonthYear = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const selectedDateObj = days.find((d) => d.date === selectedDay)?.fullDateObj || today;
  const formattedSelectedDate = selectedDateObj.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  // Initial homework items dynamically relative to today
  const INITIAL_TASKS: HomeworkTask[] = useMemo(() => {
    const d1 = new Date(today);
    d1.setDate(today.getDate() + 3);
    const d2 = new Date(today);
    d2.setDate(today.getDate() + 6);

    return [
      {
        id: "js-lesson-1",
        title: "JavaScript Lesson 1",
        deadline: `Deadline: ${d1.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        progress: 35,
        scheduledDay: today.getDate(),
      },
      {
        id: "html-lesson-13",
        title: "HTML Basics Lesson 13",
        deadline: `Deadline: ${d2.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        progress: 65,
        scheduledDay: today.getDate(),
      },
    ];
  }, []);

  const [tasks, setTasks] = useState<HomeworkTask[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);

  // Load from localStorage or initialize
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem("skillscatalyst_schedule_homework_tasks");
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      } else {
        setTasks(INITIAL_TASKS);
      }

      const savedNotes = localStorage.getItem("skillscatalyst_schedule_notes");
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      }
    } catch (e) {
      setTasks(INITIAL_TASKS);
    }
  }, [INITIAL_TASKS]);

  // Save to localStorage when tasks change
  const saveTasks = (updated: HomeworkTask[]) => {
    setTasks(updated);
    try {
      localStorage.setItem("skillscatalyst_schedule_homework_tasks", JSON.stringify(updated));
    } catch (e) {}
  };

  // Save notes to localStorage
  const saveNotes = (updated: NoteItem[]) => {
    setNotes(updated);
    try {
      localStorage.setItem("skillscatalyst_schedule_notes", JSON.stringify(updated));
    } catch (e) {}
  };

  // Add a new Homework / To-Do item (can start at 0%)
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const defaultDeadline = new Date(selectedDateObj);
    defaultDeadline.setDate(selectedDateObj.getDate() + 2);

    const newTask: HomeworkTask = {
      id: `task-${Date.now()}`,
      title: newTitle.trim(),
      deadline: newDeadline.trim()
        ? `Deadline: ${newDeadline.trim()}`
        : `Deadline: ${defaultDeadline.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      progress: newProgress,
      scheduledDay: selectedDay,
    };

    saveTasks([newTask, ...tasks]);
    setNewTitle("");
    setNewDeadline("");
    setNewProgress(0);
    setIsNewEventModalOpen(false);
  };

  // Add a note for the selected date
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      text: noteText.trim(),
      day: selectedDay,
      date: formattedSelectedDate,
    };

    saveNotes([newNote, ...notes]);
    setNoteText("");
    setIsAddNoteModalOpen(false);
  };

  // Cycle progress (0% -> 35% -> 65% -> 100% -> 0%)
  const cycleTaskProgress = (taskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        let nextProg = 35;
        if (t.progress === 0) nextProg = 35;
        else if (t.progress === 35) nextProg = 65;
        else if (t.progress === 65) nextProg = 100;
        else if (t.progress === 100) nextProg = 0;
        return { ...t, progress: nextProg };
      }
      return t;
    });
    saveTasks(updated);
  };

  // Delete a task
  const deleteTask = (taskId: string) => {
    saveTasks(tasks.filter((t) => t.id !== taskId));
  };

  // Delete a note
  const deleteNote = (noteId: string) => {
    saveNotes(notes.filter((n) => n.id !== noteId));
  };

  const notesForSelectedDay = notes.filter((n) => n.day === selectedDay);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="bg-white rounded-[28px] p-6 border border-slate-100 shadow-sm flex flex-col justify-between h-full space-y-6 select-none"
    >
      {/* ── Top Header Switcher ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="bg-slate-100 p-1 rounded-full flex gap-1 w-full max-w-[200px]">
            <button
              onClick={() => setViewMode("weekly")}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewMode === "weekly"
                  ? "bg-[#234B3B] text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setViewMode("monthly")}
              className={`flex-1 py-1.5 px-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
                viewMode === "monthly"
                  ? "bg-[#234B3B] text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* ── Date Title ── */}
        <div className="flex items-center justify-between my-2">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {formattedSelectedDate}
            </h2>
            <p className="text-[11px] text-emerald-800 font-extrabold flex items-center gap-1 mt-0.5">
              <Calendar className="w-3 h-3 text-emerald-700" />
              <span>Today: {today.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">
            {viewMode === "weekly" ? "Current Week" : currentMonthYear}
          </span>
        </div>

        {/* ── Curved Sage-Green Ribbon Date Strip ── */}
        <div className="bg-[#9baa86] rounded-[22px] p-3.5 my-3 text-white shadow-sm transition-all">
          <div className="grid grid-cols-7 gap-1 text-center">
            {days.map((d) => {
              const isSelected = selectedDay === d.date;
              return (
                <div key={d.day} className="flex flex-col items-center space-y-1 relative">
                  <span className="text-[11px] font-semibold text-white/90">
                    {d.day}
                  </span>
                  <button
                    onClick={() => setSelectedDay(d.date)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-all cursor-pointer ${
                      isSelected
                        ? "bg-white text-[#234B3B] shadow-md scale-110"
                        : "text-white hover:bg-white/20"
                    }`}
                  >
                    {d.date}
                  </button>
                  {d.isToday && (
                    <span className="text-[8px] font-black uppercase text-amber-200 tracking-tighter">
                      Today
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Notes List for Selected Date (if any) ── */}
        {notesForSelectedDay.length > 0 && (
          <div className="mb-3 space-y-1.5">
            {notesForSelectedDay.map((n) => (
              <div
                key={n.id}
                className="bg-amber-50 border border-amber-200/80 rounded-xl px-3 py-2 flex items-center justify-between text-xs text-amber-900"
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span className="font-medium">{n.text}</span>
                </div>
                <button
                  onClick={() => deleteNote(n.id)}
                  className="text-amber-500 hover:text-amber-800 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Action Triggers: Add a note & + New event ── */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setIsAddNoteModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 transition-colors group cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-slate-500 group-hover:text-[#234B3B] transition-colors" />
            <span>Add a note</span>
          </button>

          <button
            onClick={() => setIsNewEventModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#234B3B] text-white text-xs font-bold hover:bg-[#1b3b2e] shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New event</span>
          </button>
        </div>
      </div>

      {/* ── Homework Progress / To-Do Section ── */}
      <div className="space-y-4 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Homework progress
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const freshTask: HomeworkTask = {
                  id: `task-${Date.now()}`,
                  title: "New Assignment",
                  deadline: `Deadline: september ${selectedDay + 22}`,
                  progress: 0,
                  scheduledDay: selectedDay,
                };
                saveTasks([freshTask, ...tasks]);
              }}
              className="text-[11px] font-bold text-[#234B3B] hover:underline"
            >
              + Add Task
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={() => setTasks([])}
              className="text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/50">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600">No active homework tasks yet</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Click "+ New event" or "+ Add Task" to start tracking from 0% progress!
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 no-scrollbar">
            {tasks.map((task) => {
              // 3-Segment Pill progress logic (matching 2nd Image screenshot)
              // 0% -> 0 filled, 35% -> 1 filled, 65% -> 2 filled, 100% -> 3 filled
              let filledSegments = 0;
              if (task.progress > 0 && task.progress <= 35) filledSegments = 1;
              else if (task.progress > 35 && task.progress <= 70) filledSegments = 2;
              else if (task.progress > 70) filledSegments = 3;

              return (
                <div
                  key={task.id}
                  className="task-card card-morph bg-slate-50/90 rounded-[20px] p-4 border border-slate-100 hover:border-slate-200 space-y-3 group cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{task.title}</span>
                        {task.progress === 100 && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black">
                            DONE
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                        {task.deadline}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => cycleTaskProgress(task.id)}
                        title="Click to update progress"
                        className="text-slate-400 hover:text-[#234B3B] transition-colors p-1"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        title="Delete task"
                        className="text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* ── 3-Segment Pill Progress Bar (Exact Match to 2nd Image) ── */}
                  <div
                    onClick={() => cycleTaskProgress(task.id)}
                    className="flex items-center gap-3 cursor-pointer group/bar"
                    title="Click bar to advance progress (0% -> 35% -> 65% -> 100%)"
                  >
                    <div className="flex-1 flex gap-1.5">
                      {/* Segment 1 */}
                      <div
                        className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                          filledSegments >= 1 ? "bg-[#234B3B]" : "bg-slate-200/80"
                        }`}
                      />
                      {/* Segment 2 */}
                      <div
                        className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                          filledSegments >= 2 ? "bg-[#234B3B]" : "bg-slate-200/80"
                        }`}
                      />
                      {/* Segment 3 */}
                      <div
                        className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                          filledSegments >= 3 ? "bg-[#234B3B]" : "bg-slate-200/80"
                        }`}
                      />
                    </div>

                    <span className="text-[11px] font-bold text-slate-600 shrink-0 group-hover/bar:text-[#234B3B] transition-colors">
                      {task.progress}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modal 1: + New Event / Add Homework Task (Hoisted via Portal to document.body) ── */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isNewEventModalOpen && (
              <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="bg-white border border-slate-200 rounded-[28px] p-6 sm:p-7 w-full max-w-md shadow-2xl relative z-[100000] my-auto space-y-5"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#234B3B] flex items-center justify-center shrink-0">
                        <Plus className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900">Add Schedule Event</h3>
                        <p className="text-[11px] text-slate-500 font-medium">Create task for your homework progress</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsNewEventModalOpen(false)}
                      className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleAddEvent} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        Event / Task Title
                      </label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g. JavaScript lesson 1"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 font-medium placeholder-slate-400 focus:bg-white focus:border-[#234B3B] focus:ring-2 focus:ring-[#234B3B]/20 outline-none transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        Deadline (Optional)
                      </label>
                      <input
                        type="text"
                        value={newDeadline}
                        onChange={(e) => setNewDeadline(e.target.value)}
                        placeholder="e.g. september 24"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 font-medium placeholder-slate-400 focus:bg-white focus:border-[#234B3B] focus:ring-2 focus:ring-[#234B3B]/20 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        Initial Progress (Starting from 0%)
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[0, 35, 65, 100].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setNewProgress(val)}
                            className={`py-2.5 rounded-xl text-xs font-extrabold border transition-all ${
                              newProgress === val
                                ? "bg-[#234B3B] text-white border-[#234B3B] shadow-sm"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {val}%
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsNewEventModalOpen(false)}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-[#234B3B] text-white text-xs font-bold hover:bg-[#1b3b2e] shadow-md active:scale-95 transition-all"
                      >
                        Create Event
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* ── Modal 2: Add a Note (Hoisted via Portal to document.body) ── */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isAddNoteModalOpen && (
              <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="bg-white border border-slate-200 rounded-[28px] p-6 sm:p-7 w-full max-w-md shadow-2xl relative z-[100000] my-auto space-y-5"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                        <Edit3 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900">Add Note for Sept {selectedDay}</h3>
                        <p className="text-[11px] text-slate-500 font-medium">Record a quick daily schedule note</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsAddNoteModalOpen(false)}
                      className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleAddNote} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        Quick Note Text
                      </label>
                      <textarea
                        rows={3}
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Write a quick note for your schedule..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-900 font-medium placeholder-slate-400 focus:bg-white focus:border-[#234B3B] focus:ring-2 focus:ring-[#234B3B]/20 outline-none transition-all"
                        required
                      />
                    </div>

                    <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsAddNoteModalOpen(false)}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-[#234B3B] text-white text-xs font-bold hover:bg-[#1b3b2e] shadow-md active:scale-95 transition-all"
                      >
                        Save Note
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </motion.div>
  );
}

