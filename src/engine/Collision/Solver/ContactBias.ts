/**
 * Tells the Arcade collision solver to prefer certain contacts over others
 */
export enum ContactSolveBias {
  None = 'none',
  VerticalFirst = 'vertical-first',
  HorizontalFirst = 'horizontal-first'
}

/**
 * Contact bias values
 */
export interface ContactBias {
  vertical: number;
  horizontal: number;
}

/**
 * Vertical First contact solve bias Used by the {@apilink ArcadeSolver} to sort contacts
 */
export const VerticalFirst: ContactBias = {
  vertical: 1,
  horizontal: 2
} as const;

/**
 * Horizontal First contact solve bias Used by the {@apilink ArcadeSolver} to sort contacts
 */
export const HorizontalFirst: ContactBias = {
  horizontal: 1,
  vertical: 2
} as const;

/**
 * None value, {@apilink ArcadeSolver} sorts contacts using distance by default
 */
export const None: ContactBias = {
  horizontal: 0,
  vertical: 0
} as const;
