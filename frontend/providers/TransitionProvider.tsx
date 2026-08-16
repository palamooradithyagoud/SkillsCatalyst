"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";

interface TransitionContextValue {
  isTransitionActive: boolean;
  dashboardReady: boolean;
  startLogoTransition: () => void;
  notifyDashboardReady: () => void;
  finishLogoTransition: () => void;
}

const TransitionContext = createContext<TransitionContextValue>({
  isTransitionActive: false,
  dashboardReady: false,
  startLogoTransition: () => {},
  notifyDashboardReady: () => {},
  finishLogoTransition: () => {},
});

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const [isTransitionActive, setIsTransitionActive] = useState(false);
  const [dashboardReady, setDashboardReady] = useState(false);

  const startLogoTransition = useCallback(() => {
    setDashboardReady(false);
    setIsTransitionActive(true);
  }, []);

  const notifyDashboardReady = useCallback(() => {
    setDashboardReady(true);
  }, []);

  const finishLogoTransition = useCallback(() => {
    setIsTransitionActive(false);
    setDashboardReady(false);
  }, []);

  return (
    <TransitionContext.Provider
      value={{
        isTransitionActive,
        dashboardReady,
        startLogoTransition,
        notifyDashboardReady,
        finishLogoTransition,
      }}
    >
      {children}
    </TransitionContext.Provider>
  );
}

export function useTransition() {
  return useContext(TransitionContext);
}
