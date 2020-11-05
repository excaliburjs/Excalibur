export const buildTypeKey = (types: readonly string[]) => {
  const key = [...types].sort((a, b) => a.localeCompare(b)).join('+');
  return key;
};
