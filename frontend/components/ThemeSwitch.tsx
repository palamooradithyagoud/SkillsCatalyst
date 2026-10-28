"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { SunMoonThemeToggle, SunMoonTheme, SunMoonThemeToggleProps } from "@/components/ui/sun-moon-theme-toggle";

export default function ThemeSwitch(props: SunMoonThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";
  const currentTheme = (resolvedTheme === "dark" ? "dark" : "light") as SunMoonTheme;

  if (!mounted) {
    return (
      <div
        className="rounded-full shrink-0 inline-flex items-center justify-center border border-transparent"
        style={{ width: props.size ?? 36, height: props.size ?? 36 }}
        aria-hidden="true"
      />
    );
  }

  return (
    <SunMoonThemeToggle
      theme={currentTheme}
      onThemeChange={(newTheme) => setTheme(newTheme)}
      storageKey="theme"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      size={props.size ?? 36}
      {...props}
    />
  );
}

export { SunMoonThemeToggle };
