"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Search,
  RefreshCw,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertCircle,
  History,
  Lock,
  UserCheck,
  UserX,
  X,
  Check,
  Calendar,
  Layers,
  Copy,
} from "lucide-react";
import {
  fetchAdminUsers,
  fetchPermissionsCatalog,
  grantAdminAccess,
  revokeAdminAccess,
  updateAdminPermissions,
  fetchAdminAuditLogs,
  AdminUserItem,
  AuditLogItem,
} from "@/lib/api/permissions";

const SECTION_METADATA: Record<
  string,
  { label: string; description: string; operations: { key: string; label: string; desc: string }[] }
> = {
  scholarships: {
    label: "Scholarships",
    description: "Manage student scholarship opportunities and grants",
    operations: [
      { key: "read", label: "View Listings", desc: "Browse and view scholarship entries" },
      { key: "create", label: "Create Listings", desc: "Draft new scholarship opportunities" },
      { key: "update", label: "Edit Listings", desc: "Modify existing scholarship details" },
      { key: "publish", label: "Publish / Archive", desc: "Publish or unpublish scholarship items" },
      { key: "delete", label: "Delete Listings", desc: "Permanently remove scholarship records" },
    ],
  },
  events: {
    label: "Events",
    description: "Manage workshops, webinars, and tech meetups",
    operations: [
      { key: "read", label: "View Listings", desc: "Browse and inspect event schedules" },
      { key: "create", label: "Create Listings", desc: "Schedule new campus or virtual events" },
      { key: "update", label: "Edit Listings", desc: "Update dates, links, and descriptions" },
      { key: "publish", label: "Publish / Archive", desc: "Publish or unpublish event listings" },
      { key: "delete", label: "Delete Listings", desc: "Remove event records from directory" },
    ],
  },
  hackathons: {
    label: "Hackathons",
    description: "Manage competitive coding hackathons and challenges",
    operations: [
      { key: "read", label: "View Listings", desc: "Browse and view hackathon competitions" },
      { key: "create", label: "Create Listings", desc: "Post new hackathon challenges" },
      { key: "update", label: "Edit Listings", desc: "Update rules, prize pools, and timelines" },
      { key: "publish", label: "Publish / Archive", desc: "Publish or unpublish hackathon cards" },
      { key: "delete", label: "Delete Listings", desc: "Delete hackathon competitions" },
    ],
  },
  tech_news: {
    label: "Tech News",
    description: "Manage curated technology news feeds and editorial updates",
    operations: [
      { key: "read", label: "View Listings", desc: "Read curated tech news articles" },
      { key: "create", label: "Create Listings", desc: "Add new technology stories or sources" },
      { key: "update", label: "Edit Listings", desc: "Edit headlines, content, and source links" },
      { key: "publish", label: "Publish / Archive", desc: "Publish or archive tech news articles" },
      { key: "delete", label: "Delete Listings", desc: "Remove tech news stories from platform" },
    ],
  },
};

interface AdminUserGovernanceProps {
  onUserCountChange?: (count: number) => void;
}

export default function AdminUserGovernance({ onUserCountChange }: AdminUserGovernanceProps) {
  const [activeSubTab, setActiveSubTab] = useState<"directory" | "audit">("directory");
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "owner" | "admin" | "student">("all");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Permission Configuration Modal State
  const [permModalUser, setPermModalUser] = useState<AdminUserItem | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [auditReason, setAuditReason] = useState("");
  const [isSubmittingPerms, setIsSubmittingPerms] = useState(false);

  // Revocation Confirmation Dialog State
  const [revokeModalUser, setRevokeModalUser] = useState<AdminUserItem | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [isSubmittingRevoke, setIsSubmittingRevoke] = useState(false);

  const onUserCountChangeRef = useRef(onUserCountChange);
  useEffect(() => {
    onUserCountChangeRef.current = onUserCountChange;
  }, [onUserCountChange]);

  const lastReportedCount = useRef<number | null>(null);

  const loadUsers = useCallback(async () => {
    setLoadingUsers(true);
    setErrorMsg(null);
    try {
      const data = await fetchAdminUsers(100, 0, searchQuery);
      setUsers(data.users || []);
      if (lastReportedCount.current !== data.total) {
        lastReportedCount.current = data.total;
        onUserCountChangeRef.current?.(data.total);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load user directory.";
      setErrorMsg(msg);
    } finally {
      setLoadingUsers(false);
    }
  }, [searchQuery]);

  const loadAuditLogs = useCallback(async () => {
    setLoadingAudit(true);
    setErrorMsg(null);
    try {
      const data = await fetchAdminAuditLogs(50, 0);
      setAuditLogs(data.audit_logs || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load security audit trail.";
      setErrorMsg(msg);
    } finally {
      setLoadingAudit(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (activeSubTab === "audit") {
      loadAuditLogs();
    }
  }, [activeSubTab, loadAuditLogs]);

  // Open Permission Editor Modal
  const handleOpenPermModal = (targetUser: AdminUserItem) => {
    setPermModalUser(targetUser);
    setAuditReason("");
    const initialPerms = new Set<string>(targetUser.permissions || []);
    setSelectedPermissions(initialPerms);
  };

  const handleClosePermModal = () => {
    setPermModalUser(null);
    setSelectedPermissions(new Set());
    setAuditReason("");
  };

  // Toggle single permission
  const handleTogglePermission = (permKey: string) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permKey)) {
        next.delete(permKey);
      } else {
        next.add(permKey);
      }
      return next;
    });
  };

  // Toggle all permissions for a section
  const handleToggleSection = (sectionKey: string) => {
    const sectionOps = SECTION_METADATA[sectionKey]?.operations || [];
    const sectionPerms = sectionOps.map((op) => `${sectionKey}.${op.key}`);
    const allSelected = sectionPerms.every((p) => selectedPermissions.has(p));

    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        sectionPerms.forEach((p) => next.delete(p));
      } else {
        sectionPerms.forEach((p) => next.add(p));
      }
      return next;
    });
  };

  // Select all or clear all
  const handleSelectAllPermissions = () => {
    const all = new Set<string>();
    Object.keys(SECTION_METADATA).forEach((secKey) => {
      SECTION_METADATA[secKey].operations.forEach((op) => {
        all.add(`${secKey}.${op.key}`);
      });
    });
    setSelectedPermissions(all);
  };

  const handleClearAllPermissions = () => {
    setSelectedPermissions(new Set());
  };

  // Submit Permission Changes
  const handleSubmitPermissions = async () => {
    if (!permModalUser) return;
    setIsSubmittingPerms(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const permsList = Array.from(selectedPermissions);

    try {
      if (permModalUser.role === "admin") {
        await updateAdminPermissions(permModalUser.id, permsList, auditReason || undefined);
        setSuccessMsg(`Permissions successfully updated for ${permModalUser.email}.`);
      } else {
        await grantAdminAccess(permModalUser.id, permsList, auditReason || undefined);
        setSuccessMsg(`Admin access granted to ${permModalUser.email} with ${permsList.length} permissions.`);
      }
      handleClosePermModal();
      await loadUsers();
      if (activeSubTab === "audit") {
        await loadAuditLogs();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to apply permission changes.";
      setErrorMsg(msg);
    } finally {
      setIsSubmittingPerms(false);
    }
  };

  // Open Revocation Confirmation
  const handleOpenRevokeModal = (targetUser: AdminUserItem) => {
    setRevokeModalUser(targetUser);
    setRevokeReason("");
  };

  const handleCloseRevokeModal = () => {
    setRevokeModalUser(null);
    setRevokeReason("");
  };

  // Submit Revocation
  const handleSubmitRevoke = async () => {
    if (!revokeModalUser) return;
    setIsSubmittingRevoke(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await revokeAdminAccess(revokeModalUser.id, revokeReason || undefined);
      setSuccessMsg(`Admin privileges revoked for ${revokeModalUser.email}. User reset to student role.`);
      handleCloseRevokeModal();
      await loadUsers();
      if (activeSubTab === "audit") {
        await loadAuditLogs();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to revoke admin privileges.";
      setErrorMsg(msg);
    } finally {
      setIsSubmittingRevoke(false);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Banner & Subtab Navigation */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Users className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">User Governance &amp; Permissions</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Authoritative owner control over administrative access, granular CMS permissions, and security audit records.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
              <button
                onClick={() => setActiveSubTab("directory")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeSubTab === "directory"
                    ? "bg-purple-600 text-white shadow-xs font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>User Directory</span>
              </button>
              <button
                onClick={() => setActiveSubTab("audit")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeSubTab === "audit"
                    ? "bg-purple-600 text-white shadow-xs font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Audit Trail</span>
              </button>
            </div>

            <button
              onClick={() => (activeSubTab === "directory" ? loadUsers() : loadAuditLogs())}
              title="Refresh Data"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer border border-slate-700"
            >
              <RefreshCw
                className={`w-4 h-4 ${loadingUsers || loadingAudit ? "animate-spin text-purple-400" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Global Feedback Banners */}
        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* SUBTAB 1: USER DIRECTORY */}
      {activeSubTab === "directory" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, or user ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") loadUsers();
                }}
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-hidden focus:border-purple-500 cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="owner">Owners</option>
                <option value="admin">Admins</option>
                <option value="student">Students</option>
              </select>

              <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                {filteredUsers.length} Users Listed
              </span>
            </div>
          </div>

          {/* User Table */}
          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-700/80">
                <tr>
                  <th className="py-3 px-4">User / Identity</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Active Permissions</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loadingUsers ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-purple-400" />
                      <span>Loading user directory...</span>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500">
                      <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-400">No users found</p>
                      <p className="text-xs text-slate-600 mt-1">Try adjusting your search criteria or role filter.</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isOwnerAccount = u.role === "owner";
                    const isAdminAccount = u.role === "admin";
                    const isStudentAccount = u.role === "student" || (!isOwnerAccount && !isAdminAccount);
                    const permsCount = u.permissions?.length || 0;

                    return (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                        {/* User / Identity */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-900 to-indigo-900 border border-purple-700/50 flex items-center justify-center font-bold text-xs text-purple-200 shrink-0">
                              {(u.full_name || u.email || "U").charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-white truncate max-w-[200px]">
                                {u.full_name || "Platform Learner"}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{u.email}</p>
                              <div className="flex items-center gap-1 mt-0.5">
                                <span className="font-mono text-[10px] text-slate-500 truncate max-w-[150px]">
                                  {u.id}
                                </span>
                                <button
                                  onClick={() => handleCopyId(u.id)}
                                  title="Copy User ID"
                                  className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                                >
                                  {copiedId === u.id ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isOwnerAccount ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Owner</span>
                            </span>
                          ) : isAdminAccount ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              <Sliders className="w-3 h-3" />
                              <span>Admin</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
                              <span>Student</span>
                            </span>
                          )}
                        </td>

                        {/* Active Permissions Summary */}
                        <td className="py-3.5 px-4">
                          {isOwnerAccount ? (
                            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                              <Lock className="w-3.5 h-3.5 text-emerald-400" />
                              <span>All Administrative Capabilities</span>
                            </div>
                          ) : isAdminAccount ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-md bg-purple-950/80 border border-purple-800/80 text-purple-300 font-bold text-[10px]">
                                  {permsCount} of 20 Operations
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1 max-w-xs">
                                {Object.keys(SECTION_METADATA).map((secKey) => {
                                  const secOps = SECTION_METADATA[secKey].operations;
                                  const count = secOps.filter((op) =>
                                    u.permissions?.includes(`${secKey}.${op.key}`)
                                  ).length;
                                  if (count === 0) return null;
                                  return (
                                    <span
                                      key={secKey}
                                      className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700"
                                    >
                                      {SECTION_METADATA[secKey].label}: {count}/{secOps.length}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px]">No Admin Permissions</span>
                          )}
                        </td>

                        {/* Created Date */}
                        <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : "--"}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          {isOwnerAccount ? (
                            <span className="text-[11px] font-semibold text-slate-500 italic">
                              Authoritative Owner
                            </span>
                          ) : isAdminAccount ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenPermModal(u)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-colors cursor-pointer"
                              >
                                <Sliders className="w-3 h-3" />
                                <span>Configure</span>
                              </button>
                              <button
                                onClick={() => handleOpenRevokeModal(u)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-xs font-semibold transition-colors cursor-pointer"
                              >
                                <UserX className="w-3 h-3" />
                                <span>Revoke</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleOpenPermModal(u)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>Grant Admin</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: SECURITY AUDIT TRAIL */}
      {activeSubTab === "audit" && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Privilege Escalation &amp; Role Change History</h3>
              <p className="text-xs text-slate-400">
                Immutable server-side audit logs recording actor, target, deltas, timestamps, and security reasons.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-medium">{auditLogs.length} Records Logged</span>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-700/80">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target User ID</th>
                  <th className="py-3 px-4">Role Transition</th>
                  <th className="py-3 px-4">Permissions Delta</th>
                  <th className="py-3 px-4">Reason &amp; IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loadingAudit ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-purple-400" />
                      <span>Loading audit trail...</span>
                    </td>
                  </tr>
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-400">No audit events recorded</p>
                      <p className="text-xs text-slate-600 mt-1">
                        Administrative actions like granting or revoking admin access will appear here automatically.
                      </p>
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => {
                    const isGrant = log.action === "GRANT_ADMIN";
                    const isRevoke = log.action === "REVOKE_ADMIN";
                    const isUpdate = log.action === "UPDATE_PERMISSIONS";

                    return (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap text-slate-400 text-[11px] font-mono">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          {isGrant ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Grant Admin
                            </span>
                          ) : isRevoke ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              Revoke Admin
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              Update Permissions
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px] text-slate-300">
                          <span title={log.target_id}>{log.target_id.slice(0, 18)}...</span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap text-[11px]">
                          <span className="text-slate-400">{log.previous_role || "none"}</span>
                          <span className="text-slate-600 mx-1.5">&rarr;</span>
                          <span className="text-white font-semibold">{log.new_role || "none"}</span>
                        </td>

                        <td className="py-3 px-4 text-[11px]">
                          {log.new_permissions ? (
                            <span className="text-purple-300 font-mono">
                              {log.new_permissions.length} active permissions
                            </span>
                          ) : (
                            <span className="text-slate-500">None</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-[11px] text-slate-400 max-w-xs truncate">
                          <div>{log.reason || "Authoritative owner change"}</div>
                          {log.ip_address && (
                            <div className="font-mono text-[10px] text-slate-500 mt-0.5">{log.ip_address}</div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PERMISSIONS MATRIX CONFIGURATION MODAL */}
      {permModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {permModalUser.role === "admin" ? "Configure Admin Permissions" : "Grant Admin Access"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Assign explicit content sections and operations for <strong>{permModalUser.email}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={handleClosePermModal}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Target User Card */}
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Target Account</span>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {permModalUser.full_name || "Platform Learner"} &bull;{" "}
                    <span className="font-mono text-purple-300">{permModalUser.email}</span>
                  </p>
                  <p className="font-mono text-[10px] text-slate-500 mt-0.5">UUID: {permModalUser.id}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Role</span>
                  <p className="text-xs font-bold text-emerald-400 uppercase mt-0.5">{permModalUser.role}</p>
                </div>
              </div>

              {/* Quick Select Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-300">Sections &amp; Operations</span>
                  <span className="px-2 py-0.5 rounded-md bg-purple-950/80 border border-purple-800/80 text-purple-300 font-bold text-[11px]">
                    {selectedPermissions.size} of 20 Selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllPermissions}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAllPermissions}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Permission Matrix Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(SECTION_METADATA).map((sectionKey) => {
                  const section = SECTION_METADATA[sectionKey];
                  const sectionPermKeys = section.operations.map((op) => `${sectionKey}.${op.key}`);
                  const allSectionSelected = sectionPermKeys.every((k) => selectedPermissions.has(k));
                  const someSectionSelected =
                    !allSectionSelected && sectionPermKeys.some((k) => selectedPermissions.has(k));

                  return (
                    <div
                      key={sectionKey}
                      className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80 space-y-3"
                    >
                      {/* Section Card Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
                        <div>
                          <div className="flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-purple-400" />
                            <h4 className="font-bold text-white text-xs">{section.label}</h4>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">{section.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleSection(sectionKey)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded cursor-pointer transition-colors ${
                            allSectionSelected
                              ? "bg-purple-600 text-white"
                              : someSectionSelected
                              ? "bg-purple-950 text-purple-300 border border-purple-700"
                              : "bg-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          {allSectionSelected ? "Deselect" : "Select All"}
                        </button>
                      </div>

                      {/* Operation Checkboxes */}
                      <div className="space-y-2">
                        {section.operations.map((op) => {
                          const permKey = `${sectionKey}.${op.key}`;
                          const isChecked = selectedPermissions.has(permKey);

                          return (
                            <label
                              key={permKey}
                              onClick={() => handleTogglePermission(permKey)}
                              className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors ${
                                isChecked
                                  ? "bg-purple-950/40 border border-purple-800/60"
                                  : "hover:bg-slate-700/40 border border-transparent"
                              }`}
                            >
                              <div
                                className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                                  isChecked
                                    ? "bg-purple-600 text-white"
                                    : "border border-slate-600 bg-slate-800"
                                }`}
                              >
                                {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <div className="min-w-0">
                                <p className={`font-semibold text-xs ${isChecked ? "text-white" : "text-slate-300"}`}>
                                  {op.label}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-0.5">{op.desc}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Audit Reason Input */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-300 text-xs">
                  Reason for Role / Permission Change (Logged to Security Audit Trail)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Designating content editor for scholarship opportunities"
                  value={auditReason}
                  onChange={(e) => setAuditReason(e.target.value)}
                  className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Security Invariant Notice */}
              <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-indigo-300 text-xs flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>
                  Permissions are enforced server-side. Admins can never access user management, payments, or global settings.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/95 sticky bottom-0">
              <button
                type="button"
                onClick={handleClosePermModal}
                disabled={isSubmittingPerms}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitPermissions}
                disabled={isSubmittingPerms}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-600/25 flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmittingPerms && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {permModalUser.role === "admin" ? "Save Permissions" : "Grant Admin Access"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REVOKE ADMIN ACCESS CONFIRMATION DIALOG */}
      {revokeModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-100">
          <div className="bg-slate-900 border border-rose-800/60 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Revoke Admin Privileges?</h3>
                <p className="text-xs text-rose-300 mt-0.5">This action immediately revokes administrative access.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs space-y-1">
              <p className="text-slate-300 font-medium">
                Target User: <strong className="text-white">{revokeModalUser.full_name || "Learner"}</strong>
              </p>
              <p className="text-slate-400 font-mono text-[11px]">{revokeModalUser.email}</p>
              <p className="text-slate-500 font-mono text-[10px]">UUID: {revokeModalUser.id}</p>
            </div>

            <p className="text-xs text-slate-400">
              The user will be immediately downgraded to a standard Student role. All assigned CMS permissions will be deleted, and active backend sessions will be rejected on subsequent administrative requests.
            </p>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300 text-xs">Revocation Reason (Audit Log)</label>
              <input
                type="text"
                placeholder="e.g. End of internship / role transition"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-rose-500 transition-colors"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCloseRevokeModal}
                disabled={isSubmittingRevoke}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitRevoke}
                disabled={isSubmittingRevoke}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/25 flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {isSubmittingRevoke && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Revocation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
