"use client";

import { useState, useCallback } from "react";

export function useErrorHandler() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const showError = useCallback((message?: string) => {
    setErrorMessage(message || "");
    setIsModalOpen(true);
  }, []);

  const hideError = useCallback(() => {
    setIsModalOpen(false);
    setErrorMessage("");
  }, []);

  const handleNotFound = useCallback(() => {
    showError("抱歉，您访问的页面或功能目前正在开发中，暂时无法使用。");
  }, [showError]);

  const handleFeatureNotAvailable = useCallback((featureName?: string) => {
    const message = featureName 
      ? `抱歉，${featureName}功能目前正在开发中，暂时无法使用。`
      : "抱歉，该功能目前正在开发中，暂时无法使用。";
    showError(message);
  }, [showError]);

  return {
    isModalOpen,
    errorMessage,
    showError,
    hideError,
    handleNotFound,
    handleFeatureNotAvailable,
  };
} 