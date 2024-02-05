
export enum ContactSolveBias {
  None = 'none',
  VerticalFirst = 'vertical-first',
  HorizontalFirst = 'horizontal-first'
}

export interface ContactBias {
  vertical: number;
  horizontal: number;
}

export const VerticalFirst: ContactBias = {
  'vertical': 1,
  'horizontal': 2
} as const;

export const HorizontalFirst: ContactBias = {
  'horizontal': 1,
  'vertical': 2
} as const;

export const None: ContactBias = {
  'horizontal': 0,
  'vertical': 0
} as const;