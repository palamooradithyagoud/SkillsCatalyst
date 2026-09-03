"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { Plus, Edit3, ArrowUpRight, Trash2, Calendar, X, FileText, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

export interface TodoTask {
  id: string;
  title: string;
  deadline: string;
  progress: number; // 0, 35, 65, 100
  scheduledDay?: number; // 1-31
}

export type HomeworkTask = TodoTask;

export interface NoteItem {
  id: string;
  text: string;
  day: number;
  date: string;
}

const STORAGE_KEY_TASKS = "skillscatalyst_schedule_todos";
const STORAGE_KEY_NOTES = "skillscatalyst_schedule_notes";

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

  // Tasks and notes state - NO PREDEFINED DATA
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Load from Supabase (with localStorage fallback) and purge legacy hardcoded tasks
  useEffect(() => {
    let isMounted = true;

    async function loadUserData() {
      try {
        // 1. First check local storage and purge any old predefined mock data
        const localTasksRaw = localStorage.getItem(STORAGE_KEY_TASKS) || localStorage.getItem("skillscatalyst_schedule_homework_tasks");
        if (localTasksRaw) {
          try {
            const parsed: TodoTask[] = JSON.parse(localTasksRaw);
            const filtered = parsed.filter(
              (t) =>
                t.id !== "js-lesson-1" &&
                t.id !== "html-lesson-13" &&
                !t.title?.includes("JavaScript Lesson 1") &&
                !t.title?.includes("HTML Basics Lesson 13")
            );
            if (isMounted) setTasks(filtered);
            localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(filtered));
          } catch {}
        } else {
          // Explicitly empty by default — NO predefined data
          if (isMounted) setTasks([]);
        }

        const localNotesRaw = localStorage.getItem(STORAGE_KEY_NOTES);
        if (localNotesRaw && isMounted) {
          try {
            setNotes(JSON.parse(localNotesRaw));
          } catch {}
        }

        // 2. Query Supabase for authenticated user's real todos & notes
        const { data: { user } } = await supabase.auth.getUser();
        if (user && isMounted) {
          const { data: dbTasks, error: taskErr } = await supabase
            .from("user_todos")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (!taskErr && dbTasks) {
            const mapped: TodoTask[] = dbTasks.map((row: any) => ({
              id: row.id,
              title: row.title,
              deadline: row.deadline || "",
              progress: row.progress || 0,
              scheduledDay: row.scheduled_day,
            }));
            if (isMounted) {
              setTasks(mapped);
              localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(mapped));
            }
          }

          const { data: dbNotes, error: notesErr } = await supabase
            .from("user_schedule_notes")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (!notesErr && dbNotes) {
            const mappedNotes: NoteItem[] = dbNotes.map((row: any) => ({
              id: row.id,
              text: row.text,
              day: row.day,
              date: row.date,
            }));
            if (isMounted) {
              setNotes(mappedNotes);
              localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(mappedNotes));
            }
          }
        }
      } catch (err) {
        console.warn("Error loading user todos/notes:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Save tasks state and sync to Supabase & localStorage
  const saveTasks = useCallback((updated: TodoTask[]) => {
    setTasks(updated);
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(updated));
    } catch {}
  }, []);

  // Save notes state and sync to localStorage
  const saveNotes = useCallback((updated: NoteItem[]) => {
    setNotes(updated);
    try {
      localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(updated));
    } catch {}
  }, []);

  // Add a new To-Do item
  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const defaultDeadline = new Date(selectedDateObj);
    defaultDeadline.setDate(selectedDateObj.getDate() + 2);

    const newTask: TodoTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: newTitle.trim(),
      deadline: newDeadline.trim()
        ? `Deadline: ${newDeadline.trim()}`
        : `Deadline: ${defaultDeadline.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      progress: newProgress,
      scheduledDay: selectedDay,
    };

    const updated = [newTask, ...tasks];
    saveTasks(updated);

    // Sync to Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("user_todos").insert({
          id: newTask.id,
          user_id: user.id,
          title: newTask.title,
          deadline: newTask.deadline,
          progress: newTask.progress,
          scheduled_day: newTask.scheduledDay,
        });
      }
    } catch (err) {
      console.warn("Supabase todo insert error:", err);
    }

    setNewTitle("");
    setNewDeadline("");
    setNewProgress(0);
    setIsNewEventModalOpen(false);
  };

  // Add a note for the selected date
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const newNote: NoteItem = {
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      text: noteText.trim(),
      day: selectedDay,
      date: formattedSelectedDate,
    };

    const updated = [newNote, ...notes];
    saveNotes(updated);

    // Sync to Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("user_schedule_notes").insert({
          id: newNote.id,
          user_id: user.id,
          text: newNote.text,
          day: newNote.day,
          date: newNote.date,
        });
      }
    } catch (err) {
      console.warn("Supabase note insert error:", err);
    }

    setNoteText("");
    setIsAddNoteModalOpen(false);
  };

  // Cycle progress (0% -> 35% -> 65% -> 100% -> 0%)
  const cycleTaskProgress = async (taskId: string) => {
    let nextProgressVal = 35;
    const updated = tasks.map((t) => {
      if (t.id === taskId) {
        let nextProg = 35;
        if (t.progress === 0) nextProg = 35;
        else if (t.progress === 35) nextProg = 65;
        else if (t.progress === 65) nextProg = 100;
        else if (t.progress === 100) nextProg = 0;
        nextProgressVal = nextProg;
        return { ...t, progress: nextProg };
      }
      return t;
    });
    saveTasks(updated);

    // Sync to Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("user_todos").update({ progress: nextProgressVal }).eq("id", taskId);
      }
    } catch (err) {
      console.warn("Supabase todo progress update error:", err);
    }
  };

  // Delete a task
  const deleteTask = async (taskId: string) => {
    saveTasks(tasks.filter((t) => t.id !== taskId));

    // Sync to Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("user_todos").delete().eq("id", taskId);
      }
    } catch (err) {
      console.warn("Supabase todo delete error:", err);
    }
  };

  // Clear all tasks
  const handleClearAll = async () => {
    saveTasks([]);

    // Sync to Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("user_todos").delete().eq("user_id", user.id);
      }
    } catch (err) {
      console.warn("Supabase todos clear error:", err);
    }
  };

  // Delete a note
  const deleteNote = async (noteId: string) => {
    saveNotes(notes.filter((n) => n.id !== noteId));

    // Sync to Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("user_schedule_notes").delete().eq("id", noteId);
      }
    } catch (err) {
      console.warn("Supabase note delete error:", err);
    }
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
                  className="text-amber-500 hover:text-amber-800 transition-colors cursor-pointer"
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

      {/* ── To-Do List Section ── */}
      <div className="space-y-4 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            To-Do List
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNewEventModalOpen(true)}
              className="text-[11px] font-bold text-[#234B3B] hover:underline cursor-pointer"
            >
              + Add Task
            </button>
            {tasks.length > 0 && (
              <>
                <span className="text-slate-300">•</span>
                <button
                  onClick={handleClearAll}
                  className="text-xs font-bold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              </>
            )}
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/50">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600">No tasks in your to-do list yet</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Click "+ New event" or "+ Add Task" to plan your day!
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 no-scrollbar">
            {tasks.map((task) => {
              // 3-Segment Pill progress logic (0% -> 0 filled, 35% -> 1 filled, 65% -> 2 filled, 100% -> 3 filled)
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
                          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black inline-flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> DONE
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
                        className="text-slate-400 hover:text-[#234B3B] transition-colors p-1 cursor-pointer"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        title="Delete task"
                        className="text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* ── 3-Segment Pill Progress Bar ── */}
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

      {/* ── Modal 1: + New Event / Add To-Do Task ── */}
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
                        <h3 className="text-base font-extrabold text-slate-900">Add To-Do Task</h3>
                        <p className="text-[11px] text-slate-500 font-medium">Create an item for your to-do list</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsNewEventModalOpen(false)}
                      className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleAddEvent} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        Task Title
                      </label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="e.g. Complete Dynamic Programming module"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 font-medium placeholder-slate-400 focus:bg-white focus:border-[#234B3B] focus:ring-2 focus:ring-[#234B3B]/20 outline-none transition-all"
                        required
                        autoFocus
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
                        placeholder="e.g. Sep 10 or 5:00 PM"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-900 font-medium placeholder-slate-400 focus:bg-white focus:border-[#234B3B] focus:ring-2 focus:ring-[#234B3B]/20 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        Initial Progress
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[0, 35, 65, 100].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setNewProgress(val)}
                            className={`py-2.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
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
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-[#234B3B] text-white text-xs font-bold hover:bg-[#1b3b2e] shadow-md active:scale-95 transition-all cursor-pointer"
                      >
                        Create Task
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* ── Modal 2: Add a Note ── */}
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
                        <h3 className="text-base font-extrabold text-slate-900">Add Date Note</h3>
                        <p className="text-[11px] text-slate-500 font-medium">For {formattedSelectedDate}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsAddNoteModalOpen(false)}
                      className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleAddNote} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5">
                        Note Content
                      </label>
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="e.g. Group discussion at 4 PM, review graphs notes..."
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-medium placeholder-slate-400 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20 outline-none transition-all resize-none"
                        required
                        autoFocus
                      />
                    </div>

                    <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setIsAddNoteModalOpen(false)}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 shadow-md active:scale-95 transition-all cursor-pointer"
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
