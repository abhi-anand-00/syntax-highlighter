import * as React from 'react';
import {
  Spinner,
  makeStyles,
  tokens,
  mergeClasses,
} from "@fluentui/react-components";
import type { SpinnerProps } from "@fluentui/react-components";

const useStyles = makeStyles({
  // Full page loader - covers entire viewport
  fullPage: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    width: "100%",
    backgroundColor: tokens.colorNeutralBackground2,
  },
  // Container loader - fills parent container
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    minHeight: "200px",
    backgroundColor: tokens.colorNeutralBackground1,
  },
  // Inline loader - minimal padding
  inline: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: tokens.spacingVerticalM,
  },
  // Overlay loader - absolute positioned over content
  overlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    zIndex: 100,
  },
  // Wrapper for overlay variant
  overlayWrapper: {
    position: "relative",
  },
});

type LoadingVariant = 'fullPage' | 'container' | 'inline' | 'overlay';

interface LoadingWrapperProps {
  /** Whether content is loading */
  isLoading: boolean;
  /** Content to render when not loading (for overlay variant, always rendered) */
  children?: React.ReactNode;
  /** Loading indicator label */
  label?: string;
  /** Spinner size */
  size?: SpinnerProps['size'];
  /** Variant determines layout behavior */
  variant?: LoadingVariant;
  /** Additional class name */
  className?: string;
}

/**
 * Generic loading wrapper component using Fluent UI Spinner.
 * 
 * Variants:
 * - `fullPage`: Full viewport loader (default for page transitions)
 * - `container`: Fills parent container with min-height
 * - `inline`: Minimal inline loader
 * - `overlay`: Renders content with loading overlay on top
 * 
 * @example
 * // Full page loader
 * <LoadingWrapper isLoading={isNavigating} variant="fullPage" label="Loading..." />
 * 
 * @example
 * // Inline loader in a button area
 * <LoadingWrapper isLoading={isSaving} variant="inline" size="tiny" />
 * 
 * @example
 * // Overlay loader - content stays visible
 * <LoadingWrapper isLoading={isUpdating} variant="overlay">
 *   <MyContent />
 * </LoadingWrapper>
 */
export const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  isLoading,
  children,
  label = "Loading...",
  size = "large",
  variant = "container",
  className,
}) => {
  const styles = useStyles();

  // For overlay variant, always render children with optional overlay
  if (variant === 'overlay') {
    return (
      <div className={mergeClasses(styles.overlayWrapper, className)}>
        {children}
        {isLoading && (
          <div className={styles.overlay}>
            <Spinner size={size} label={label} />
          </div>
        )}
      </div>
    );
  }

  // For other variants, show spinner OR children
  if (isLoading) {
    const variantStyle = variant === 'fullPage' 
      ? styles.fullPage 
      : variant === 'inline' 
        ? styles.inline 
        : styles.container;

    return (
      <div className={mergeClasses(variantStyle, className)}>
        <Spinner size={size} label={label} />
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * Full-page loading spinner - convenience export
 */
export const PageLoader: React.FC<{ label?: string }> = ({ label = "Loading..." }) => (
  <LoadingWrapper isLoading={true} variant="fullPage" label={label} />
);

/**
 * Inline loading spinner - convenience export
 */
export const InlineLoader: React.FC<{ label?: string; size?: SpinnerProps['size'] }> = ({ 
  label, 
  size = "small" 
}) => (
  <LoadingWrapper isLoading={true} variant="inline" label={label} size={size} />
);

export default LoadingWrapper;
