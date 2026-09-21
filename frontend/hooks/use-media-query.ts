"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [value, setValue] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQueryList = window.matchMedia(query);
    setValue(mediaQueryList.matches);

    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches);
    }

    mediaQueryList.addEventListener("change", onChange);
    return () => mediaQueryList.removeEventListener("change", onChange);
  }, [query]);

  return value;
}
