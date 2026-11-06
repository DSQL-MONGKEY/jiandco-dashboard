'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'jiandco_money_hidden';

type MoneyVisibilityContextValue = {
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
  toggle: () => void;
};

const MoneyVisibilityContext = createContext<MoneyVisibilityContextValue | null>(null);

export function MoneyVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [hidden, setHiddenState] = useState(false);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect -- hydrate the persisted preference after mount
    setHiddenState(window.localStorage.getItem(STORAGE_KEY) === 'true');
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, String(hidden));
  }, [hidden]);

  const setHidden = useCallback((value: boolean) => setHiddenState(value), []);
  const toggle = useCallback(() => setHiddenState((value) => !value), []);

  const value = useMemo(() => ({ hidden, setHidden, toggle }), [hidden, setHidden, toggle]);

  return (
    <MoneyVisibilityContext.Provider value={value}>{children}</MoneyVisibilityContext.Provider>
  );
}

export function useMoneyVisibility() {
  const context = useContext(MoneyVisibilityContext);
  if (!context) {
    throw new Error('useMoneyVisibility must be used within MoneyVisibilityProvider');
  }
  return context;
}
