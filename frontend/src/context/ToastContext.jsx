import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastCtx = createContext();
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);

  const push = useCallback((type, text) => {
    const id = Date.now() + Math.random();
    setItems((l) => [...l, { id, type, text }]);
    setTimeout(() => setItems((l) => l.filter((x) => x.id !== id)), 3500);
  }, []);

  const value = useMemo(
    () => ({
      success: (t) => push('success', t),
      error: (t) => push('error', t),
    }),
    [push]
  );

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="toasts">
        {items.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === 'success' ? '✅' : '⚠️'} {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}