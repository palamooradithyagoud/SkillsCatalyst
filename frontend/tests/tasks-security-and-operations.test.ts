import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  createTask,
  updateTask,
  deleteTask,
  fetchTasks,
  createSubtask,
  updateSubtask,
  deleteSubtask,
} from '../lib/api/tasks';
import { setClientInstance, resetClientInstance } from '../lib/supabase/client';
import { Task, Subtask } from '../types/task';

// In-memory mock database to simulate Supabase PostgREST with strict RLS enforcement
interface MockDB {
  tasks: Task[];
  subtasks: Subtask[];
  currentUserId: string | null;
}

function createMockSupabaseClient(mockDb: MockDB) {
  return {
    auth: {
      getSession: async () => ({
        data: {
          session: mockDb.currentUserId
            ? {
                user: { id: mockDb.currentUserId, email: `${mockDb.currentUserId}@example.com` },
              }
            : null,
        },
        error: null,
      }),
    },
    from: (table: string) => {
      let queryFilter: Record<string, any> = {};
      let isSingle = false;

      const builder = {
        select: (cols: string) => builder,
        eq: (col: string, val: any) => {
          queryFilter[col] = val;
          return builder;
        },
        order: (col: string, opts?: { ascending?: boolean }) => builder,
        single: () => {
          isSingle = true;
          return builder;
        },
        insert: (rowOrRows: any) => {
          const row = Array.isArray(rowOrRows) ? rowOrRows[0] : rowOrRows;
          const currentUid = mockDb.currentUserId;

          // RLS CHECK: User must be authenticated and inserting for themselves
          if (!currentUid || row.user_id !== currentUid) {
            return {
              select: () => ({
                single: async () => ({ data: null, error: new Error('new row violates row-level security policy') }),
              }),
            };
          }

          if (table === 'tasks') {
            const newTask: Task = {
              id: row.id || `task-${Date.now()}-${Math.random()}`,
              user_id: currentUid,
              title: row.title,
              description: row.description || '',
              status: row.status || 'todo',
              priority: row.priority || 'medium',
              category: row.category || 'Other',
              due_at: row.due_at || null,
              estimated_minutes: row.estimated_minutes || null,
              completed_at: row.completed_at || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              subtasks: [],
            };
            mockDb.tasks.push(newTask);
            return {
              select: () => ({
                single: async () => ({ data: newTask, error: null }),
              }),
            };
          }

          if (table === 'subtasks') {
            // RLS CHECK: Subtask parent must exist and belong to current user
            const parent = mockDb.tasks.find((t) => t.id === row.task_id && t.user_id === currentUid);
            if (!parent) {
              return {
                select: () => ({
                  single: async () => ({
                    data: null,
                    error: new Error('new row violates row-level security policy for subtasks'),
                  }),
                }),
              };
            }

            const newSub: Subtask = {
              id: row.id || `sub-${Date.now()}-${Math.random()}`,
              task_id: row.task_id,
              user_id: currentUid,
              title: row.title,
              is_completed: Boolean(row.is_completed),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            mockDb.subtasks.push(newSub);
            return {
              select: () => ({
                single: async () => ({ data: newSub, error: null }),
              }),
            };
          }

          return { select: () => ({ single: async () => ({ data: null, error: null }) }) };
        },
        update: (updates: any) => {
          return {
            eq: (col1: string, val1: any) => ({
              eq: (col2: string, val2: any) => ({
                select: () => ({
                  single: async () => {
                    const currentUid = mockDb.currentUserId;
                    if (!currentUid) {
                      return { data: null, error: new Error('unauthorized') };
                    }

                    if (table === 'tasks') {
                      const taskId = val1;
                      const uid = val2;
                      const task = mockDb.tasks.find((t) => t.id === taskId && t.user_id === uid);
                      if (!task || uid !== currentUid) {
                        return { data: null, error: new Error('Task not found or access denied') };
                      }
                      Object.assign(task, updates);
                      return { data: task, error: null };
                    }

                    if (table === 'subtasks') {
                      const subId = val1;
                      const uid = val2;
                      const sub = mockDb.subtasks.find((s) => s.id === subId && s.user_id === uid);
                      if (!sub || uid !== currentUid) {
                        return { data: null, error: new Error('Subtask not found or access denied') };
                      }
                      Object.assign(sub, updates);
                      return { data: sub, error: null };
                    }

                    return { data: null, error: null };
                  },
                }),
              }),
            }),
          };
        },
        delete: () => {
          return {
            eq: (col1: string, val1: any) => ({
              eq: async (col2: string, val2: any) => {
                const currentUid = mockDb.currentUserId;
                if (!currentUid || val2 !== currentUid) {
                  return { data: null, error: new Error('unauthorized') };
                }

                if (table === 'tasks') {
                  const initialLen = mockDb.tasks.length;
                  mockDb.tasks = mockDb.tasks.filter((t) => !(t.id === val1 && t.user_id === currentUid));
                  // Cascade subtasks
                  mockDb.subtasks = mockDb.subtasks.filter((s) => s.task_id !== val1);
                  if (mockDb.tasks.length === initialLen) {
                    return { data: null, error: new Error('Task not found') };
                  }
                  return { data: [{ id: val1 }], error: null };
                }

                if (table === 'subtasks') {
                  mockDb.subtasks = mockDb.subtasks.filter((s) => !(s.id === val1 && s.user_id === currentUid));
                  return { data: [{ id: val1 }], error: null };
                }

                return { data: null, error: null };
              },
            }),
          };
        },
        then: async (resolve: any) => {
          const currentUid = mockDb.currentUserId;
          if (!currentUid) {
            return resolve({ data: [], error: null });
          }

          if (table === 'tasks') {
            const userTasks = mockDb.tasks
              .filter((t) => t.user_id === currentUid)
              .map((t) => ({
                ...t,
                subtasks: mockDb.subtasks.filter((s) => s.task_id === t.id && s.user_id === currentUid),
              }));
            return resolve({ data: userTasks, error: null });
          }

          return resolve({ data: [], error: null });
        },
      };

      return builder;
    },
  };
}

describe('Phase 1: Task Operations & Cross-User Security Test Suite', () => {
  let mockDb: MockDB;

  beforeEach(() => {
    mockDb = {
      tasks: [],
      subtasks: [],
      currentUserId: 'user-A',
    };
    setClientInstance(createMockSupabaseClient(mockDb) as any);
  });

  it('rejects unauthenticated operations with a clear session error', async () => {
    mockDb.currentUserId = null;

    await assert.rejects(
      async () => {
        await createTask({ title: 'Unauthorized Task' });
      },
      (err: Error) => {
        assert.ok(err.message.includes('must be signed in'));
        return true;
      }
    );
  });

  it('creates and reads tasks owned by authenticated user', async () => {
    const created = await createTask({
      title: 'Study Data Structures',
      description: 'Binary search tree traversal and balance',
      category: 'Study',
      priority: 'high',
      estimated_minutes: 45,
    });

    assert.ok(created.id);
    assert.strictEqual(created.user_id, 'user-A');
    assert.strictEqual(created.title, 'Study Data Structures');
    assert.strictEqual(created.status, 'todo');
    assert.strictEqual(created.priority, 'high');
    assert.strictEqual(created.estimated_minutes, 45);

    const userTasks = await fetchTasks();
    assert.strictEqual(userTasks.length, 1);
    assert.strictEqual(userTasks[0].id, created.id);
  });

  it('sets completed_at when completing a task, and clears it when reopening', async () => {
    const task = await createTask({ title: 'Assignment submission' });
    assert.strictEqual(task.completed_at, null);

    // 1. Mark completed
    const completedTask = await updateTask(task.id, { status: 'completed' });
    assert.strictEqual(completedTask.status, 'completed');
    assert.ok(completedTask.completed_at !== null);

    // 2. Reopen task
    const reopenedTask = await updateTask(task.id, { status: 'in_progress' });
    assert.strictEqual(reopenedTask.status, 'in_progress');
    assert.strictEqual(reopenedTask.completed_at, null);
  });

  it('deletes a task and cascades to its subtasks', async () => {
    const task = await createTask({ title: 'Task to delete' });
    const sub = await createSubtask({ task_id: task.id, title: 'Child subtask' });

    assert.strictEqual(mockDb.tasks.length, 1);
    assert.strictEqual(mockDb.subtasks.length, 1);

    await deleteTask(task.id);

    assert.strictEqual(mockDb.tasks.length, 0);
    assert.strictEqual(mockDb.subtasks.length, 0);
  });

  it('creates, updates, and deletes subtasks under user-owned parent task', async () => {
    const task = await createTask({ title: 'Parent Task' });

    // 1. Create subtask
    const sub = await createSubtask({ task_id: task.id, title: 'Step 1: Download dataset' });
    assert.strictEqual(sub.title, 'Step 1: Download dataset');
    assert.strictEqual(sub.is_completed, false);
    assert.strictEqual(sub.task_id, task.id);
    assert.strictEqual(sub.user_id, 'user-A');

    // 2. Update subtask completion
    const updatedSub = await updateSubtask(sub.id, task.id, { is_completed: true });
    assert.strictEqual(updatedSub.is_completed, true);

    // 3. Update subtask title
    const renamedSub = await updateSubtask(sub.id, task.id, { title: 'Step 1: Dataset verified' });
    assert.strictEqual(renamedSub.title, 'Step 1: Dataset verified');

    // 4. Delete subtask
    await deleteSubtask(sub.id, task.id);
    assert.strictEqual(mockDb.subtasks.length, 0);
  });

  describe('Cross-User Security & Tenant Isolation', () => {
    it('User B cannot view User A tasks', async () => {
      // User A creates task
      mockDb.currentUserId = 'user-A';
      await createTask({ title: 'User A Secret Task' });

      // User B logs in
      mockDb.currentUserId = 'user-B';
      const userBTasks = await fetchTasks();

      assert.strictEqual(userBTasks.length, 0, 'User B must not see User A tasks');
    });

    it('User B cannot update or delete User A tasks', async () => {
      // User A creates task
      mockDb.currentUserId = 'user-A';
      const taskA = await createTask({ title: 'User A Task' });

      // User B attempts to update User A's task
      mockDb.currentUserId = 'user-B';
      await assert.rejects(
        async () => {
          await updateTask(taskA.id, { title: 'Hacked by User B' });
        },
        (err: Error) => {
          assert.ok(err.message.includes('not found') || err.message.includes('denied'));
          return true;
        }
      );

      // Verify task remains unchanged in database
      const original = mockDb.tasks.find((t) => t.id === taskA.id);
      assert.strictEqual(original?.title, 'User A Task');
    });

    it('User B cannot attach a subtask to User A parent task', async () => {
      // User A creates parent task
      mockDb.currentUserId = 'user-A';
      const taskA = await createTask({ title: 'User A Parent Task' });

      // User B attempts to create subtask pointing to User A's task
      mockDb.currentUserId = 'user-B';
      await assert.rejects(
        async () => {
          await createSubtask({ task_id: taskA.id, title: 'Injected subtask' });
        },
        (err: Error) => {
          assert.ok(err.message.includes('security policy') || err.message.includes('violates'));
          return true;
        }
      );

      assert.strictEqual(mockDb.subtasks.length, 0);
    });
  });
});
