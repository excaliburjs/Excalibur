export const buildTypeKey = (types: string[]) => {
  const key = types.sort((a, b) => a.localeCompare(b)).join('+');
  return key;
};
