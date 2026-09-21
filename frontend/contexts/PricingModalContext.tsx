"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import PricingModal from "@/components/PricingModal";

interface PricingModalContextType {
  isPricingModalOpen: boolean;
  openPricingModal: () => void;
  closePricingModal: () => void;
}

const PricingModalContext = createContext<PricingModalContextType | undefined>(undefined);

export function PricingModalProvider({ children }: { children: React.ReactNode }) {
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);

  const openPricingModal = useCallback(() => {
    setIsPricingModalOpen(true);
  }, []);

  const closePricingModal = useCallback(() => {
    setIsPricingModalOpen(false);
  }, []);

  return (
    <PricingModalContext.Provider
      value={{
        isPricingModalOpen,
        openPricingModal,
        closePricingModal,
      }}
    >
      {children}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={closePricingModal}
      />
    </PricingModalContext.Provider>
  );
}

export function usePricingModal(): PricingModalContextType {
  const context = useContext(PricingModalContext);
  if (!context) {
    // Graceful fallback if invoked outside provider (e.g. isolated test environments)
    return {
      isPricingModalOpen: false,
      openPricingModal: () => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("open-pricing-modal"));
        }
      },
      closePricingModal: () => {},
    };
  }
  return context;
}
