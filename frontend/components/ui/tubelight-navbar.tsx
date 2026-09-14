"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

export interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBar({ items, className }: NavBarProps) {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState(items[0]?.name || "")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Synchronize active tab with current route on navigation
  useEffect(() => {
    if (!pathname) return
    const current = items.find(
      (item) =>
        item.url === pathname ||
        (pathname === "/" && item.url === "/dashboard") ||
        (item.url !== "/" && item.url !== "/dashboard" && pathname.startsWith(item.url))
    )
    if (current) {
      setActiveTab(current.name)
    }
  }, [pathname, items])

  return (
    <div
      className={cn(
        "fixed bottom-3 sm:top-0 left-1/2 -translate-x-1/2 z-50 mb-3 sm:mb-6 sm:pt-6 max-w-[calc(100vw-16px)] pointer-events-auto",
        className,
      )}
    >
      <div className="flex items-center gap-1 sm:gap-2 bg-white/30 sm:bg-white/40 backdrop-blur-xl border border-black/10 py-1.5 px-2 rounded-xl sm:rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative cursor-pointer flex flex-col items-center justify-center px-3 sm:px-4 py-1.5 transition-all min-w-[54px] sm:min-w-[62px]",
                "text-black/50 hover:text-black",
                isActive && "text-black font-black",
              )}
            >
              {/* Clean flat top active indicator (no curved bubble / blur dome) */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 sm:w-8 h-1 bg-black rounded-full"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}

              <Icon
                size={20}
                strokeWidth={isActive ? 2.6 : 2}
                className="text-black transition-transform"
              />
              <span
                className={cn(
                  "text-[10px] sm:text-[11px] text-black mt-1 leading-none tracking-tight transition-all",
                  isActive ? "font-black opacity-100" : "font-semibold opacity-60",
                )}
              >
                {item.name}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
