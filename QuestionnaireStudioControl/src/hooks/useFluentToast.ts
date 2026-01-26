import { useToastController, ToastTitle, ToastBody, Toast } from "@fluentui/react-components";
import * as React from "react";

/**
 * Custom hook for showing Fluent UI toasts.
 * Uses the global toaster with id "global-toaster".
 */
export function useFluentToast() {
  const { dispatchToast } = useToastController("global-toaster");

  const showToast = React.useCallback(
    (message: string, intent: "success" | "error" | "warning" | "info" = "success", title?: string) => {
      dispatchToast(
        React.createElement(Toast, null,
          title && React.createElement(ToastTitle, null, title),
          React.createElement(ToastBody, null, message)
        ),
        { intent, timeout: 5000 }
      );
    },
    [dispatchToast]
  );

  return {
    success: (message: string, title?: string) => showToast(message, "success", title),
    error: (message: string, title?: string) => showToast(message, "error", title),
    warning: (message: string, title?: string) => showToast(message, "warning", title),
    info: (message: string, title?: string) => showToast(message, "info", title),
  };
}
