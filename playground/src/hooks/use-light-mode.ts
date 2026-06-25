import { useEffect, useState } from 'react';

export function useLightMode(initialLightMode: boolean) {
  const [isLightMode, setIsLightMode] = useState(initialLightMode);

  useEffect(() => {
    updateLightMode(initialLightMode);
  }, [initialLightMode]);

  const updateLightMode = (isLightMode: boolean) => {
    setIsLightMode(isLightMode);
    document.documentElement.dataset.theme = isLightMode ? 'light' : 'dark';
  };

  // Value + Setter pair, mimicking same useState interface
  return [isLightMode, updateLightMode] as const;
}
