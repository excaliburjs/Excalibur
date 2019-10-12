import { ComponentType } from './ComponentTypes';

export const buildEntityTypeKey = (types: ComponentType[]) => {
  const key = types.sort((a, b) => a.localeCompare(b)).join('+');
  return key;
};
