"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { NotFoundModal } from "@/components/ui/not-found-modal";
import { useErrorHandler } from "@/hooks/use-error-handler";

interface ErrorContextType {
  showError: (message?: string) => void;
  handleNotFound: () => void;
  handleFeatureNotAvailable: (featureName?: string) => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const {
    isModalOpen,
    errorMessage,
    showError,
    hideError,
    handleNotFound,
    handleFeatureNotAvailable,
  } = useErrorHandler();

  const value = {
    showError,
    handleNotFound,
    handleFeatureNotAvailable,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
      <NotFoundModal
        isOpen={isModalOpen}
        onClose={hideError}
        message={errorMessage}
      />
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
} 