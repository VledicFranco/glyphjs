import { useState, useEffect, useCallback } from 'react';

/**
 * Detects the current Starlight theme by observing the `data-theme`
 * attribute on `<html>`. Returns 'light' or 'dark' and reactively
 * updates when the user toggles the theme switcher.
 */
export function useStarlightTheme(): 'light' | 'dark' {
  const getTheme = useCallback(
    () =>
      (typeof document !== 'undefined' &&
      document.documentElement.getAttribute('data-theme') === 'dark'
        ? 'dark'
        : 'light') as 'light' | 'dark',
    [],
  );

  const [theme, setTheme] = useState<'light' | 'dark'>(getTheme);

  useEffect(() => {
    setTheme(getTheme());
    const observer = new MutationObserver(() => setTheme(getTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, [getTheme]);

  return theme;
}
