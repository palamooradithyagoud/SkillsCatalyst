"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  BookOpen,
  Map,
  Target,
  Briefcase,
  Globe,
  Activity,
  Bot,
  Settings,
  LifeBuoy,
  LogOut,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Command,
  X,
  Hash,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useSubscription } from "@/hooks/useSubscription";

export type NavItemData = {
  id: string;
  title: string;
  href?: string;
  icon: React.ElementType;
  badge?: number | string;
  shortcut?: string;
  children?: NavItemData[];
};

export type NavGroupData = {
  heading?: string;
  items: NavItemData[];
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, isLoading, logout } = useAuth();
  const { isPremium } = useSubscription();

  const [isOpen, setIsOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState("SkillsCatalyst");

  // Keyboard shortcut listener for Command + K (Search) and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsSearchOpen(false);
        setIsWorkspaceOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Determine active item id based on current pathname
  const activeId = useMemo(() => {
    if (pathname.startsWith("/dashboard")) return "dashboard";
    if (pathname.startsWith("/learning")) return "learning";
    if (pathname.startsWith("/roadmaps")) return "roadmaps";
    if (pathname.startsWith("/practice")) return "practice";
    if (pathname.startsWith("/career")) return "career";
    if (pathname.startsWith("/explore")) return "explore";
    if (pathname.startsWith("/analytics")) return "analytics";
    if (pathname.startsWith("/ai-mentor")) return "ai-mentor";
    if (pathname.startsWith("/settings")) return "settings";
    if (pathname.startsWith("/support")) return "support";
    return "dashboard";
  }, [pathname]);

  const navGroups: NavGroupData[] = [
    {
      items: [
        {
          id: "search",
          title: "Search",
          icon: Search,
          shortcut: "⌘K",
        },
        {
          id: "dashboard",
          title: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          id: "learning",
          title: "Learning",
          href: "/learning",
          icon: BookOpen,
          badge: "AI",
          children: [
            { id: "learning-active", title: "Active Courses", href: "/learning", icon: Hash },
            { id: "roadmaps", title: "Career Roadmaps", href: "/roadmaps", icon: Map },
          ],
        },
        {
          id: "practice",
          title: "Practice",
          href: "/practice",
          icon: Target,
          badge: 12,
          children: [
            { id: "practice-dsa", title: "Coding Sheets", href: "/practice", icon: Hash },
            { id: "practice-interview", title: "Interview Prep", href: "/practice", icon: Hash },
          ],
        },
      ],
    },
    {
      heading: "Career & Intelligence",
      items: [
        {
          id: "career",
          title: "Career Goals",
          href: "/career",
          icon: Briefcase,
        },
        {
          id: "explore",
          title: "Explore Hub",
          href: "/explore",
          icon: Globe,
        },
        {
          id: "analytics",
          title: "Analytics",
          href: "/analytics",
          icon: Activity,
        },
        {
          id: "ai-mentor",
          title: "AI Mentor",
          href: "/ai-mentor",
          icon: Bot,
          badge: "Live",
        },
      ],
    },
  ];

  const bottomItems: NavItemData[] = [
    {
      id: "settings",
      title: "Settings",
      href: "/settings",
      icon: Settings,
      shortcut: "⌘,",
    },
    {
      id: "support",
      title: "Support & Help",
      href: "/support",
      icon: LifeBuoy,
    },
    {
      id: "logout",
      title: "Log out",
      icon: LogOut,
    },
  ];

  // Quick search items list
  const searchableRoutes = [
    { title: "Dashboard Overview", href: "/dashboard", category: "Navigation", icon: LayoutDashboard },
    { title: "Learning & Courses", href: "/learning", category: "Learning", icon: BookOpen },
    { title: "Career Roadmaps", href: "/roadmaps", category: "Learning", icon: Map },
    { title: "Placement Practice", href: "/practice", category: "Practice", icon: Target },
    { title: "Career Goals & ATS", href: "/career", category: "Career", icon: Briefcase },
    { title: "Explore Skills Hub", href: "/explore", category: "Explore", icon: Globe },
    { title: "Performance Analytics", href: "/analytics", category: "Analytics", icon: Activity },
    { title: "AI Mentor Career Assistant", href: "/ai-mentor", category: "AI", icon: Bot },
    { title: "Account & Profile Settings", href: "/settings", category: "Settings", icon: Settings },
    { title: "Help & Grievance Desk", href: "/support", category: "Support", icon: LifeBuoy },
  ];

  const filteredSearch = searchQuery.trim() === "" 
    ? searchableRoutes 
    : searchableRoutes.filter((r) => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.category.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleNavClick = (item: NavItemData) => {
    if (item.id === "search") {
      setIsSearchOpen(true);
      return;
    }
    if (item.id === "logout") {
      logout();
      router.push("/login");
      return;
    }
    if (item.href) {
      router.push(item.href);
    }
  };

  if (pathname === "/login" || isLoading) {
    return null;
  }

  const userDisplayName = session?.name || session?.email?.split("@")[0] || "Learner";
  const userInitials = (userDisplayName.charAt(0) || "S").toUpperCase();

  return (
    <>
      {/* ── Laptop / Desktop Sidebar: Primary Color = White (#FFFFFF), Secondary Color = Purple (#5227FF) ── */}
      <aside
        className={`hidden md:flex flex-col h-[calc(100vh-3.5rem)] sticky top-14 z-30 shrink-0 bg-white border-r border-slate-200/80 shadow-[1px_0_12px_rgba(0,0,0,0.02)] transition-all duration-300 ease-in-out select-none ${
          isOpen ? "w-[260px]" : "w-[68px]"
        }`}
      >
        {/* Top Header: Learner Profile + Collapse Toggle */}
        <div className="p-3 pb-2.5 border-b border-slate-100">
          <div className="flex items-center justify-between gap-1.5">
            {isOpen ? (
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5227FF] to-[#401bcc] text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-[#5227FF]/25 shrink-0">
                    {userInitials}
                  </div>
                  <div className="flex flex-col overflow-hidden min-w-0 text-left">
                    <span className="text-[13px] font-semibold leading-tight text-slate-900 truncate">
                      {userDisplayName}
                    </span>
                    <span className="text-[11px] text-slate-500 leading-tight flex items-center gap-1 mt-0.5">
                      {isPremium ? (
                        <>
                          <Sparkles className="w-2.5 h-2.5 text-[#5227FF]" />
                          <span className="text-[#5227FF] font-semibold">Pro Learner</span>
                        </>
                      ) : (
                        <span>Free Learner</span>
                      )}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(!isOpen)}
                  title="Collapse Sidebar"
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-[#5227FF]/10 hover:text-[#5227FF] transition-colors shrink-0"
                >
                  <PanelLeftClose className="w-4 h-4" strokeWidth={1.75} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsOpen(true)}
                title="Expand Sidebar"
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5227FF] to-[#401bcc] text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-[#5227FF]/30 cursor-pointer hover:scale-105 transition-transform mx-auto"
              >
                <PanelLeftOpen className="w-4 h-4 text-white" strokeWidth={1.75} />
              </button>
            )}
          </div>
        </div>

        {/* Middle Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col gap-4">
          {navGroups.map((group, idx) => (
            <div key={idx} className="flex flex-col gap-0.5">
              {isOpen && group.heading && (
                <span className="px-2 mb-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  {group.heading}
                </span>
              )}
              {group.items.map((item) => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  activeId={activeId}
                  isCollapsed={!isOpen}
                  onSelect={handleNavClick}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Bottom Section: Settings, Support, Logout */}
        <div className="mt-auto p-2.5 border-t border-slate-100 flex flex-col gap-0.5">
          {bottomItems.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              activeId={activeId}
              isCollapsed={!isOpen}
              onSelect={handleNavClick}
            />
          ))}
        </div>
      </aside>

      {/* ── Command Search Modal (⌘K) — Styled with White & #5227FF Purple ── */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh] bg-slate-900/35 backdrop-blur-xs px-4">
          <div className="fixed inset-0" onClick={() => setIsSearchOpen(false)} />
          <div className="relative w-full max-w-xl bg-white border border-slate-200/90 rounded-2xl shadow-2xl shadow-slate-900/15 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-slate-100 bg-white">
              <Search className="w-5 h-5 text-[#5227FF] mr-3 shrink-0" strokeWidth={2} />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
                placeholder="Search learning, roadmaps, problems, tools..."
              />
              <kbd
                onClick={() => setIsSearchOpen(false)}
                className="inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded cursor-pointer hover:text-[#5227FF] hover:border-[#5227FF]/40 transition-colors"
              >
                ESC
              </kbd>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="ml-2 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Results List */}
            <div className="max-h-[340px] overflow-y-auto p-2 bg-white">
              {filteredSearch.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-400">
                  No matching destinations found.
                </div>
              ) : (
                filteredSearch.map((res) => {
                  const Icon = res.icon;
                  return (
                    <div
                      key={res.title}
                      onClick={() => {
                        setIsSearchOpen(false);
                        router.push(res.href);
                      }}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer hover:bg-[#5227FF]/6 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-[#5227FF]/10 text-[#5227FF] group-hover:bg-[#5227FF] group-hover:text-white transition-colors">
                          <Icon className="w-4 h-4" strokeWidth={1.8} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-semibold text-slate-800 group-hover:text-[#5227FF] transition-colors">
                            {res.title}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {res.category}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 group-hover:text-[#5227FF] transition-colors">
                        Jump →
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5 text-slate-600">
                <Command className="w-3 h-3 text-[#5227FF]" /> Quick Navigator
              </span>
              <span>Use ESC or click outside to dismiss</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function SidebarItem({
  item,
  activeId,
  isCollapsed,
  onSelect,
  level = 0,
}: {
  item: NavItemData;
  activeId: string;
  isCollapsed: boolean;
  onSelect: (item: NavItemData) => void;
  level?: number;
}) {
  const isActive = activeId === item.id;
  const hasChildren = !!item.children && item.children.length > 0;
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (hasChildren && !isCollapsed) {
      setIsOpen(!isOpen);
    } else {
      onSelect(item);
    }
  };

  const IconComponent = item.icon;

  if (isCollapsed) {
    return (
      <div
        title={item.title}
        onClick={() => onSelect(item)}
        className={`relative flex items-center justify-center w-10 h-10 mx-auto rounded-xl cursor-pointer transition-all duration-150 ${
          isActive
            ? "bg-[#5227FF]/12 text-[#5227FF] font-semibold shadow-xs"
            : "text-slate-500 hover:bg-[#5227FF]/6 hover:text-[#5227FF]"
        }`}
      >
        <IconComponent className="w-4 h-4" strokeWidth={isActive ? 2 : 1.75} />
        {item.badge && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#5227FF]" />
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <div
        onClick={handleClick}
        style={{ paddingLeft: `${level * 14 + 10}px` }}
        className={`group flex items-center justify-between pr-2.5 py-2 rounded-xl cursor-pointer transition-all duration-150 select-none ${
          isActive
            ? "bg-[#5227FF]/10 text-[#5227FF] font-semibold"
            : "text-slate-600 hover:bg-[#5227FF]/5 hover:text-[#5227FF]"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <IconComponent
            className={`w-4 h-4 shrink-0 transition-colors ${
              isActive
                ? "text-[#5227FF]"
                : "text-slate-400 group-hover:text-[#5227FF]"
            }`}
            strokeWidth={isActive ? 2 : 1.75}
          />
          <span className={`text-[13px] tracking-normal truncate ${isActive ? "text-[#5227FF]" : "text-slate-700 group-hover:text-[#5227FF]"}`}>
            {item.title}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {item.shortcut && (
            <kbd className="hidden group-hover:inline-flex items-center justify-center h-4.5 px-1.5 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded">
              {item.shortcut}
            </kbd>
          )}
          {item.badge && (
            <span className="flex items-center justify-center min-w-[18px] h-4.5 px-1.5 text-[10px] font-semibold rounded-full bg-[#5227FF]/12 text-[#5227FF]">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronRight
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 group-hover:text-[#5227FF] ${
                isOpen ? "rotate-90 text-[#5227FF]" : ""
              }`}
              strokeWidth={2}
            />
          )}
        </div>
      </div>

      {hasChildren && (
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-200 ease-in-out ${
            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden min-h-0 relative flex flex-col gap-0.5 mt-0.5">
            <div
              className="absolute top-0 bottom-0 border-l border-slate-200/70"
              style={{ left: `${level * 14 + 17}px` }}
            />
            {item.children!.map((child) => (
              <SidebarItem
                key={child.id}
                item={child}
                activeId={activeId}
                isCollapsed={isCollapsed}
                onSelect={onSelect}
                level={level + 1}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
