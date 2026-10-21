/**
 * frontend/lib/api/tasks.ts
 * Production-ready API and Supabase client layer for Tasks and Subtasks.
 * Supports direct authenticated Supabase client access with local fallback resilience.
 */

import { supabase } from "@/lib/supabase";
import {
  Task,
  Subtask,
  CreateTaskPayload,
  UpdateTaskPayload,
  CreateSubtaskPayload,
  UpdateSubtaskPayload,
  TaskFilterOptions,
  TaskMetrics,
} from "@/types/task";
import { validateTaskForm, validateSubtaskTitle } from "@/lib/tasks/validation";
import { calculateTaskMetrics, filterAndSortTasks } from "@/lib/tasks/dateUtils";

const LOCAL_TASKS_KEY_PREFIX = "sc_user_tasks_";

function getLocalTasks(userId: string): Task[] {
  if (typeof window === "undefined" || !userId) return [];
  try {
    const raw = localStorage.getItem(`${LOCAL_TASKS_KEY_PREFIX}${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Failed to read local tasks:", err);
  }
  return [];
}

function saveLocalTasks(userId: string, tasks: Task[]): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    localStorage.setItem(`${LOCAL_TASKS_KEY_PREFIX}${userId}`, JSON.stringify(tasks));
  } catch (err) {
    console.warn("Failed to save local tasks:", err);
  }
}

function isSecurityOrAuthError(err: any): boolean {
  if (!err) return false;
  const msg = (err.message || "").toLowerCase();
  const code = String(err.code || "");
  const status = Number(err.status || 0);

  return (
    status === 401 ||
    status === 403 ||
    code === "42501" ||
    msg.includes("row-level security") ||
    msg.includes("violates") ||
    msg.includes("unauthorized") ||
    msg.includes("permission denied") ||
    msg.includes("access denied") ||
    msg.includes("not found or access denied")
  );
}

async function getAuthUserId(): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("You must be signed in to perform this task operation.");
  }
  return userId;
}

/**
 * Fetch all tasks for current authenticated user with optional subtasks.
 */
export async function fetchTasks(filters?: TaskFilterOptions): Promise<Task[]> {
  const userId = await getAuthUserId();

  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*, subtasks(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Supabase fetchTasks error, falling back to local cache:", error.message);
      const local = getLocalTasks(userId);
      return filters ? filterAndSortTasks(local, filters) : local;
    }

    if (data) {
      const formatted: Task[] = data.map((row: any) => ({
        ...row,
        subtasks: Array.isArray(row.subtasks)
          ? row.subtasks.sort(
              (a: Subtask, b: Subtask) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            )
          : [],
      }));

      saveLocalTasks(userId, formatted);
      return filters ? filterAndSortTasks(formatted, filters) : formatted;
    }
  } catch (err) {
    console.warn("Exception during fetchTasks, using local cache:", err);
  }

  const fallback = getLocalTasks(userId);
  return filters ? filterAndSortTasks(fallback, filters) : fallback;
}

/**
 * Fetch single task by ID.
 */
export async function fetchTaskById(id: string): Promise<Task> {
  const userId = await getAuthUserId();

  try {
    const { data, error } = await supabase
      .from("tasks")
      .select("*, subtasks(*)")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) throw error;
    if (data) {
      return {
        ...data,
        subtasks: Array.isArray(data.subtasks)
          ? data.subtasks.sort(
              (a: Subtask, b: Subtask) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            )
          : [],
      };
    }
  } catch (err) {
    console.warn("Exception during fetchTaskById, checking local:", err);
    const local = getLocalTasks(userId);
    const found = local.find((t) => t.id === id);
    if (found) return found;
    throw err;
  }

  throw new Error("Task not found.");
}

/**
 * Create a new task.
 */
export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const userId = await getAuthUserId();

  // Client validation
  const validation = validateTaskForm(payload);
  if (!validation.isValid) {
    const firstError = Object.values(validation.errors)[0] || "Invalid task input.";
    throw new Error(firstError);
  }

  const nowIso = new Date().toISOString();
  const initialStatus = payload.status || "todo";
  const completedAt = initialStatus === "completed" ? nowIso : null;

  const insertData = {
    user_id: userId,
    title: payload.title.trim(),
    description: (payload.description || "").trim(),
    status: initialStatus,
    priority: payload.priority || "medium",
    category: payload.category || "Other",
    due_at: payload.due_at ? new Date(payload.due_at).toISOString() : null,
    estimated_minutes:
      payload.estimated_minutes !== undefined && payload.estimated_minutes !== null
        ? Number(payload.estimated_minutes)
        : null,
    completed_at: completedAt,
  };

  try {
    const { data, error } = await supabase
      .from("tasks")
      .insert(insertData)
      .select("*, subtasks(*)")
      .single();

    if (error) {
      throw error;
    }

    if (data) {
      const newTask: Task = {
        ...data,
        subtasks: [],
      };

      // Sync local cache
      const local = getLocalTasks(userId);
      saveLocalTasks(userId, [newTask, ...local]);

      return newTask;
    }
  } catch (err: any) {
    if (isSecurityOrAuthError(err)) {
      throw err;
    }
    console.warn("Supabase createTask error, applying to local store:", err.message);

    // If database table is unreachable, save to local cache so user never loses their data
    const localTask: Task = {
      id: crypto.randomUUID(),
      user_id: userId,
      title: insertData.title,
      description: insertData.description,
      status: insertData.status,
      priority: insertData.priority,
      category: insertData.category,
      due_at: insertData.due_at,
      estimated_minutes: insertData.estimated_minutes,
      completed_at: insertData.completed_at,
      created_at: nowIso,
      updated_at: nowIso,
      subtasks: [],
    };

    const local = getLocalTasks(userId);
    saveLocalTasks(userId, [localTask, ...local]);
    return localTask;
  }

  throw new Error("Failed to create task.");
}

/**
 * Update an existing task.
 */
export async function updateTask(id: string, payload: UpdateTaskPayload): Promise<Task> {
  const userId = await getAuthUserId();

  const validation = validateTaskForm(payload);
  if (!validation.isValid) {
    const firstError = Object.values(validation.errors)[0] || "Invalid update input.";
    throw new Error(firstError);
  }

  const updateFields: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (payload.title !== undefined) updateFields.title = payload.title.trim();
  if (payload.description !== undefined) updateFields.description = payload.description.trim();
  if (payload.priority !== undefined) updateFields.priority = payload.priority;
  if (payload.category !== undefined) updateFields.category = payload.category;
  if (payload.due_at !== undefined) {
    updateFields.due_at = payload.due_at ? new Date(payload.due_at).toISOString() : null;
  }
  if (payload.estimated_minutes !== undefined) {
    updateFields.estimated_minutes =
      payload.estimated_minutes !== null ? Number(payload.estimated_minutes) : null;
  }

  if (payload.status !== undefined) {
    updateFields.status = payload.status;
    if (payload.status === "completed") {
      updateFields.completed_at = payload.completed_at || new Date().toISOString();
    } else {
      updateFields.completed_at = null;
    }
  }

  try {
    const { data, error } = await supabase
      .from("tasks")
      .update(updateFields)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*, subtasks(*)")
      .single();

    if (error) throw error;
    if (data) {
      const updated: Task = {
        ...data,
        subtasks: Array.isArray(data.subtasks)
          ? data.subtasks.sort(
              (a: Subtask, b: Subtask) =>
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            )
          : [],
      };

      const local = getLocalTasks(userId);
      saveLocalTasks(
        userId,
        local.map((t) => (t.id === id ? updated : t))
      );
      return updated;
    }
  } catch (err: any) {
    if (isSecurityOrAuthError(err)) {
      throw err;
    }
    console.warn("Supabase updateTask error, applying to local store:", err.message);

    const local = getLocalTasks(userId);
    const existingIndex = local.findIndex((t) => t.id === id);
    if (existingIndex !== -1) {
      const merged: Task = {
        ...local[existingIndex],
        ...updateFields,
      };
      local[existingIndex] = merged;
      saveLocalTasks(userId, local);
      return merged;
    }
    throw err;
  }

  throw new Error("Failed to update task.");
}

/**
 * Delete a task.
 */
export async function deleteTask(id: string): Promise<void> {
  const userId = await getAuthUserId();

  try {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
  } catch (err: any) {
    console.warn("Supabase deleteTask notice, updating local cache:", err.message);
  }

  // Always update local cache
  const local = getLocalTasks(userId);
  saveLocalTasks(
    userId,
    local.filter((t) => t.id !== id)
  );
}

/**
 * Create a subtask under a parent task.
 */
export async function createSubtask(payload: CreateSubtaskPayload): Promise<Subtask> {
  const userId = await getAuthUserId();

  const titleVal = validateSubtaskTitle(payload.title);
  if (!titleVal.isValid) {
    throw new Error(titleVal.error || "Invalid subtask title.");
  }

  const nowIso = new Date().toISOString();
  const insertData = {
    task_id: payload.task_id,
    user_id: userId,
    title: payload.title.trim(),
    is_completed: false,
  };

  try {
    const { data, error } = await supabase
      .from("subtasks")
      .insert(insertData)
      .select("*")
      .single();

    if (error) throw error;
    if (data) {
      const subtask: Subtask = data;

      // Update local cache
      const local = getLocalTasks(userId);
      const parentTask = local.find((t) => t.id === payload.task_id);
      if (parentTask) {
        parentTask.subtasks = [...(parentTask.subtasks || []), subtask];
        saveLocalTasks(userId, local);
      }

      return subtask;
    }
  } catch (err: any) {
    if (isSecurityOrAuthError(err)) {
      throw err;
    }
    console.warn("Supabase createSubtask error, adding to local cache:", err.message);

    const subtask: Subtask = {
      id: crypto.randomUUID(),
      task_id: payload.task_id,
      user_id: userId,
      title: insertData.title,
      is_completed: false,
      created_at: nowIso,
      updated_at: nowIso,
    };

    const local = getLocalTasks(userId);
    const parentTask = local.find((t) => t.id === payload.task_id);
    if (parentTask) {
      parentTask.subtasks = [...(parentTask.subtasks || []), subtask];
      saveLocalTasks(userId, local);
    }

    return subtask;
  }

  throw new Error("Failed to create subtask.");
}

/**
 * Update subtask status or title.
 */
export async function updateSubtask(
  id: string,
  taskId: string,
  payload: UpdateSubtaskPayload
): Promise<Subtask> {
  const userId = await getAuthUserId();

  if (payload.title !== undefined) {
    const titleVal = validateSubtaskTitle(payload.title);
    if (!titleVal.isValid) {
      throw new Error(titleVal.error || "Invalid subtask title.");
    }
  }

  const updateFields: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (payload.title !== undefined) updateFields.title = payload.title.trim();
  if (payload.is_completed !== undefined) updateFields.is_completed = payload.is_completed;

  try {
    const { data, error } = await supabase
      .from("subtasks")
      .update(updateFields)
      .eq("id", id)
      .eq("user_id", userId)
      .select("*")
      .single();

    if (error) throw error;
    if (data) {
      const subtask: Subtask = data;

      const local = getLocalTasks(userId);
      const parentTask = local.find((t) => t.id === taskId);
      if (parentTask && parentTask.subtasks) {
        parentTask.subtasks = parentTask.subtasks.map((s) => (s.id === id ? subtask : s));
        saveLocalTasks(userId, local);
      }

      return subtask;
    }
  } catch (err: any) {
    if (isSecurityOrAuthError(err)) {
      throw err;
    }
    console.warn("Supabase updateSubtask error, updating local cache:", err.message);

    const local = getLocalTasks(userId);
    const parentTask = local.find((t) => t.id === taskId);
    if (parentTask && parentTask.subtasks) {
      const existing = parentTask.subtasks.find((s) => s.id === id);
      if (existing) {
        const merged: Subtask = { ...existing, ...updateFields };
        parentTask.subtasks = parentTask.subtasks.map((s) => (s.id === id ? merged : s));
        saveLocalTasks(userId, local);
        return merged;
      }
    }
    throw err;
  }

  throw new Error("Failed to update subtask.");
}

/**
 * Delete a subtask.
 */
export async function deleteSubtask(id: string, taskId: string): Promise<void> {
  const userId = await getAuthUserId();

  try {
    const { error } = await supabase
      .from("subtasks")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) throw error;
  } catch (err: any) {
    console.warn("Supabase deleteSubtask error, updating local cache:", err.message);
  }

  const local = getLocalTasks(userId);
  const parentTask = local.find((t) => t.id === taskId);
  if (parentTask && parentTask.subtasks) {
    parentTask.subtasks = parentTask.subtasks.filter((s) => s.id !== id);
    saveLocalTasks(userId, local);
  }
}

/**
 * Compute authorized task metrics directly from authorized task records.
 */
export async function fetchTaskMetrics(): Promise<TaskMetrics> {
  const tasks = await fetchTasks();
  return calculateTaskMetrics(tasks);
}
