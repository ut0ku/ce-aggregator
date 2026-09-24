import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { applyPageBackground, captureThemeSnapshot, lockPageScroll, runThemeWave } from './themeWave.js';

export function useThemeTransition(initialDark = false) {
  const [dark, setDark] = useState(initialDark);
  const busyRef = useRef(false);
  const snapshotRef = useRef(null);
  const unlockScrollRef = useRef(null);
  const stopWaveRef = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    if (!busyRef.current) applyPageBackground(dark);
  }, [dark]);

  useLayoutEffect(() => {
    const snapshot = snapshotRef.current;
    if (!snapshot) return;

    snapshotRef.current = null;

    const unlock = () => {
      snapshot.remove();
      busyRef.current = false;
      unlockScrollRef.current?.();
      unlockScrollRef.current = null;
      applyPageBackground(dark);
      stopWaveRef.current = null;
    };

    stopWaveRef.current = runThemeWave(snapshot, unlock, dark ? 'to-dark' : 'to-light');
  }, [dark]);

  useEffect(() => {
    return () => {
      unlockScrollRef.current?.();
      snapshotRef.current?.remove();
    };
  }, []);

  const toggleTheme = useCallback(() => {
    if (busyRef.current) return;

    const nextDark = !dark;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDark(nextDark);
      return;
    }

    const snapshot = captureThemeSnapshot();
    if (!snapshot) {
      setDark(nextDark);
      return;
    }

    busyRef.current = true;
    unlockScrollRef.current = lockPageScroll();
    snapshotRef.current = snapshot;
    setDark(nextDark);
  }, [dark]);

  return { dark, toggleTheme };
}
