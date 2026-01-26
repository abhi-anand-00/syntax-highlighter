import { clsx, type ClassValue } from "clsx";

/**
 * Utility function for combining class names
 * PCF-compatible version without tailwind-merge dependency
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
