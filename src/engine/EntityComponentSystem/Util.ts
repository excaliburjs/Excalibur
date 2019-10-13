import { ComponentType } from './ComponentTypes';

export const buildTypeKey = (types: ComponentType[]) => {
  const key = types.sort((a, b) => a.localeCompare(b)).join('+');
  return key;
};
