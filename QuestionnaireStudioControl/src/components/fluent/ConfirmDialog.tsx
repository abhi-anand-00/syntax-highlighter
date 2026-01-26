/**
 * Fluent UI Confirm Dialog
 * 
 * A centralized confirmation dialog using Fluent UI components.
 * Supports both trigger-based and programmatic (hook-based) usage.
 */

import * as React from 'react';
import { ReactNode, useState, useCallback, createContext, useContext, cloneElement, isValidElement, ReactElement } from "react";
import {
  Dialog,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { Warning24Regular } from "@fluentui/react-icons";

const useStyles = makeStyles({
  surface: {
    maxWidth: "450px",
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: tokens.spacingHorizontalS,
  },
  warningIcon: {
    color: tokens.colorPaletteRedForeground1,
  },
  description: {
    color: tokens.colorNeutralForeground2,
    marginTop: tokens.spacingVerticalS,
  },
  actions: {
    paddingTop: tokens.spacingVerticalL,
  },
});

// ============================================
// Trigger-based ConfirmDialog component
// ============================================

interface ConfirmDialogProps {
  trigger: ReactNode;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: "destructive" | "default";
}

export const ConfirmDialog = ({
  trigger,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  variant = "destructive",
}: ConfirmDialogProps) => {
  const styles = useStyles();
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(true);
  };

  // Clone the trigger element and inject our click handler
  const enhancedTrigger = isValidElement(trigger)
    ? cloneElement(trigger as ReactElement<{ onClick?: (e: React.MouseEvent) => void }>, {
        onClick: handleTriggerClick,
      })
    : <span onClick={handleTriggerClick}>{trigger}</span>;

  return (
    <>
      {enhancedTrigger}
      <Dialog open={open} onOpenChange={(_, data) => setOpen(data.open)}>
        <DialogSurface className={styles.surface}>
          <DialogBody>
            <DialogTitle>
              <div className={styles.titleRow}>
                {variant === "destructive" && (
                  <Warning24Regular className={styles.warningIcon} />
                )}
                {title}
              </div>
            </DialogTitle>
            <DialogContent>
              <p className={styles.description}>{description}</p>
            </DialogContent>
            <DialogActions className={styles.actions}>
              <Button appearance="secondary" onClick={() => setOpen(false)}>
                {cancelText}
              </Button>
              <Button
                appearance="primary"
                onClick={handleConfirm}
                style={variant === "destructive" ? { 
                  backgroundColor: tokens.colorPaletteRedBackground3,
                  color: tokens.colorNeutralForegroundOnBrand,
                } : undefined}
              >
                {confirmText}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </>
  );
};

// ============================================
// Hook-based confirmation dialog
// ============================================

export interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "default";
}

interface ConfirmDialogContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | null>(null);

interface ConfirmDialogProviderProps {
  children: ReactNode;
}

interface DialogState extends ConfirmOptions {
  isOpen: boolean;
  resolve: ((value: boolean) => void) | null;
}

/**
 * Provider component that enables useConfirmDialog hook
 */
export const ConfirmDialogProvider = ({ children }: ConfirmDialogProviderProps) => {
  const styles = useStyles();
  const [state, setState] = useState<DialogState>({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "default",
    resolve: null,
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        title: options.title,
        description: options.description,
        confirmText: options.confirmText ?? "Confirm",
        cancelText: options.cancelText ?? "Cancel",
        variant: options.variant ?? "default",
        resolve,
      });
    });
  }, []);

  const handleClose = (confirmed: boolean) => {
    state.resolve?.(confirmed);
    setState((prev) => ({ ...prev, isOpen: false, resolve: null }));
  };

  return (
    <ConfirmDialogContext.Provider value={{ confirm }}>
      {children}
      <Dialog 
        open={state.isOpen} 
        onOpenChange={(_, data) => {
          if (!data.open) handleClose(false);
        }}
      >
        <DialogSurface className={styles.surface}>
          <DialogBody>
            <DialogTitle>
              <div className={styles.titleRow}>
                {state.variant === "destructive" && (
                  <Warning24Regular className={styles.warningIcon} />
                )}
                {state.title}
              </div>
            </DialogTitle>
            <DialogContent>
              <p className={styles.description}>{state.description}</p>
            </DialogContent>
            <DialogActions className={styles.actions}>
              <Button appearance="secondary" onClick={() => handleClose(false)}>
                {state.cancelText}
              </Button>
              <Button
                appearance="primary"
                onClick={() => handleClose(true)}
                style={state.variant === "destructive" ? { 
                  backgroundColor: tokens.colorPaletteRedBackground3,
                  color: tokens.colorNeutralForegroundOnBrand,
                } : undefined}
              >
                {state.confirmText}
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </ConfirmDialogContext.Provider>
  );
};

/**
 * Hook for programmatic confirmation dialogs
 * Must be used within a ConfirmDialogProvider
 */
export const useConfirmDialog = (): ConfirmDialogContextValue => {
  const context = useContext(ConfirmDialogContext);
  if (!context) {
    throw new Error("useConfirmDialog must be used within a ConfirmDialogProvider");
  }
  return context;
};

export default ConfirmDialog;
