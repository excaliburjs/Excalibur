import { ComponentType } from './ComponentTypes';

export const buildEntityComponentKey = (types: ComponentType[]) => {
  const key = types.sort((a, b) => a.localeCompare(b)).join('+');
  return key;
};
