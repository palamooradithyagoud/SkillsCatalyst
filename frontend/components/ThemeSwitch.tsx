"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeSwitch() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-[4em] h-[2.2em]" />;

  const isDark = resolvedTheme === "dark";

  return (
    <>
      <style>{`
        .theme-switch {
          font-size: 17px;
          position: relative;
          display: inline-block;
          width: 4em;
          height: 2.2em;
          border-radius: 30px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          flex-shrink: 0;
        }
        .theme-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .theme-slider {
          position: absolute;
          cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background-color: #2a2a2a;
          transition: 0.4s;
          border-radius: 30px;
          overflow: hidden;
        }
        .theme-slider:before {
          position: absolute;
          content: "";
          height: 1.2em;
          width: 1.2em;
          border-radius: 20px;
          left: 0.5em;
          bottom: 0.5em;
          transition: 0.4s;
          transition-timing-function: cubic-bezier(0.81, -0.04, 0.38, 1.5);
          box-shadow: inset 8px -4px 0px 0px #fff;
        }
        .theme-switch input:checked + .theme-slider {
          background-color: #00a6ff;
        }
        .theme-switch input:checked + .theme-slider:before {
          transform: translateX(1.8em);
          box-shadow: inset 15px -4px 0px 15px #ffcf48;
        }
        .theme-star {
          background-color: #fff;
          border-radius: 50%;
          position: absolute;
          width: 5px;
          height: 5px;
          transition: all 0.4s;
        }
        .theme-star-1 { left: 2.5em; top: 0.5em; }
        .theme-star-2 { left: 2.2em; top: 1.2em; }
        .theme-star-3 { left: 3em;   top: 0.9em; }
        .theme-switch input:checked ~ .theme-slider .theme-star {
          opacity: 0;
        }
        .theme-cloud {
          width: 3.5em;
          position: absolute;
          bottom: -1.4em;
          left: -1.1em;
          opacity: 0;
          transition: all 0.4s;
        }
        .theme-switch input:checked ~ .theme-slider .theme-cloud {
          opacity: 1;
        }
      `}</style>

      <label className="theme-switch" title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
        <input
          type="checkbox"
          checked={!isDark}
          onChange={() => setTheme(isDark ? "light" : "dark")}
        />
        <span className="theme-slider">
          {/* Stars (visible in dark mode) */}
          <span className="theme-star theme-star-1" />
          <span className="theme-star theme-star-2" />
          <span className="theme-star theme-star-3" />

          {/* Cloud (visible in light mode) */}
          <svg className="theme-cloud" viewBox="0 0 64 32" fill="white" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="20" cy="20" rx="18" ry="12" />
            <ellipse cx="36" cy="16" rx="14" ry="10" />
            <ellipse cx="50" cy="20" rx="12" ry="9" />
            <rect x="2" y="20" width="60" height="12" />
          </svg>
        </span>
      </label>
    </>
  );
}
