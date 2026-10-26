import { apiFetch, getAuthHeaders, API_BASE } from "./client";

export interface CallerPermissionsResponse {
  user_id: string;
  email: string;
  name: string;
  role: string;
  is_owner: boolean;
  is_admin: boolean;
  permissions: string[];
}

export interface PermissionsCatalogResponse {
  all_permissions: string[];
  sections: Record<string, string[]>;
}

export interface AdminUserItem {
  id: string;
  email: string;
  full_name: string;
  role: string;
  permissions?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface AdminUsersResponse {
  total: number;
  users: AdminUserItem[];
  limit: number;
  offset: number;
}

export interface AuditLogItem {
  id: string;
  actor_id: string;
  target_id: string;
  action: string;
  previous_role?: string;
  new_role?: string;
  previous_permissions?: string[];
  new_permissions?: string[];
  reason?: string;
  ip_address?: string;
  timestamp: string;
}

export interface AuditLogsResponse {
  total: number;
  audit_logs: AuditLogItem[];
  limit: number;
  offset: number;
}

export async function fetchMyPermissions(): Promise<CallerPermissionsResponse> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/me/permissions`, { headers });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Failed to fetch caller permissions (${res.status})`);
  }
  return res.json();
}

export async function fetchPermissionsCatalog(): Promise<PermissionsCatalogResponse> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/permissions-catalog`, { headers });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Failed to fetch permissions catalog (${res.status})`);
  }
  return res.json();
}

export async function fetchAdminUsers(
  limit: number = 50,
  offset: number = 0,
  search?: string
): Promise<AdminUsersResponse> {
  const headers = await getAuthHeaders();
  let url = `${API_BASE}/api/admin/users?limit=${limit}&offset=${offset}`;
  if (search && search.trim()) {
    url += `&search=${encodeURIComponent(search.trim())}`;
  }
  const res = await apiFetch(url, { headers });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Failed to fetch users list (${res.status})`);
  }
  return res.json();
}

export async function grantAdminAccess(
  targetUserId: string,
  permissions: string[],
  reason?: string
): Promise<{ status: string; message: string; target_id: string; permissions: string[] }> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/users/${targetUserId}/grant-admin`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ permissions, reason }),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Failed to grant admin privileges (${res.status})`);
  }
  return res.json();
}

export async function revokeAdminAccess(
  targetUserId: string,
  reason?: string
): Promise<{ status: string; message: string; target_id: string; new_role: string }> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/users/${targetUserId}/revoke-admin`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ reason }),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Failed to revoke admin privileges (${res.status})`);
  }
  return res.json();
}

export async function updateAdminPermissions(
  targetUserId: string,
  permissions: string[],
  reason?: string
): Promise<{ status: string; message: string; target_id: string; permissions: string[] }> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/users/${targetUserId}/permissions`, {
    method: "PUT",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ permissions, reason }),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Failed to update permissions (${res.status})`);
  }
  return res.json();
}

export async function fetchUserPermissions(
  targetUserId: string
): Promise<{ user_id: string; permissions: string[] }> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/users/${targetUserId}/permissions`, { headers });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Failed to fetch user permissions (${res.status})`);
  }
  return res.json();
}

export async function fetchAdminAuditLogs(
  limit: number = 50,
  offset: number = 0
): Promise<AuditLogsResponse> {
  const headers = await getAuthHeaders();
  const res = await apiFetch(`${API_BASE}/api/admin/audit-logs?limit=${limit}&offset=${offset}`, { headers });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Failed to fetch audit logs (${res.status})`);
  }
  return res.json();
}
