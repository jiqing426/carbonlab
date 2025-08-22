"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-6 w-6 text-red-500" />
                <h2 className="text-lg font-semibold text-gray-900">功能暂未开放</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => this.setState({ hasError: false })}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-gray-600 mb-6">
              抱歉，您访问的功能目前正在开发中，暂时无法使用。我们会尽快完善相关功能。
            </p>
            
            <div className="flex space-x-3">
              <Button
                onClick={this.handleRetry}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                重试
              </Button>
              <Button
                onClick={this.handleGoHome}
                className="flex-1"
              >
                返回首页
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 