/**
 * ID Generation Utilities
 * 
 * Centralized ID generation to ensure consistency across the application.
 * Uses a combination of timestamp and random suffix for uniqueness.
 */

/**
 * Generates a unique ID with an optional prefix
 * @param prefix - Optional prefix for the ID (e.g., 'page', 'question', 'section')
 * @returns A unique string identifier
 */
export const generateId = (prefix?: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
};

/**
 * Generates a short unique ID (for internal use where shorter IDs are preferred)
 * @param prefix - Optional prefix for the ID
 * @returns A shorter unique string identifier
 */
export const generateShortId = (prefix?: string): string => {
  const random = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}-${random}` : random;
};

/**
 * Entity-specific ID generators for type safety and consistency
 */
export const EntityId = {
  page: () => generateId('page'),
  section: () => generateId('section'),
  question: () => generateId('q'),
  answer: () => generateId('a'),
  answerSet: () => generateId('as'),
  branch: () => generateId('branch'),
  conditionGroup: () => generateId('cg'),
  condition: () => generateId('c'),
  draft: () => generateId('draft'),
  published: () => generateId('published'),
  ruleGroup: () => generateShortId('g'),
  rule: () => generateShortId('r'),
  answerRule: () => generateShortId('ar'),
  filter: () => generateId('filter'),
} as const;

/**
 * Validates if a string is a valid entity ID format
 * @param id - The ID to validate
 * @param prefix - Optional expected prefix
 * @returns True if the ID matches expected format
 */
export const isValidId = (id: string, prefix?: string): boolean => {
  if (!id || typeof id !== 'string') return false;
  if (prefix) return id.startsWith(`${prefix}-`);
  return id.length > 0;
};
