/**
 * frontend/lib/api/ai-mentor-tasks.ts
 * API client layer for approving and executing AI Mentor task actions.
 * Enforces authenticated tenant requests with zero emojis.
 */

import { API_BASE, apiFetch, getAuthHeaders } from "./client";
import {
  ExecuteTaskActionPayload,
  ExecuteTaskActionResponse,
} from "@/types/ai-mentor-tasks";

export async function executeTaskAction(
  payload: ExecuteTaskActionPayload
): Promise<ExecuteTaskActionResponse> {
  const authHeaders = await getAuthHeaders();

  let res: Response;
  try {
    res = await apiFetch(`${API_BASE}/api/ai-mentor/tasks/execute-action`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(payload),
    });
  } catch (err: unknown) {
    const error = err as Error;
    throw new Error(
      error?.message || "Unable to connect to server to execute task action. Please check your connection."
    );
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const detailMsg = data?.detail?.message || data?.message || "Failed to execute approved action.";
    throw new Error(detailMsg);
  }

  return data;
}

export async function cancelTaskAction(
  actionId: string,
  approvalToken: string
): Promise<boolean> {
  const authHeaders = await getAuthHeaders();

  try {
    const res = await apiFetch(`${API_BASE}/api/ai-mentor/tasks/cancel-action`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ action_id: actionId, approval_token: approvalToken }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
