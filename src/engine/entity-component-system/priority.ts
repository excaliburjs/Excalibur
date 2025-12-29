/**
 * Higher priorities run earlier than others in the system update
 */
export const SystemPriority = {
  Highest: -Infinity,
  Higher: -5,
  Average: 0,
  Lower: 5,
  Lowest: Infinity
} as const;
