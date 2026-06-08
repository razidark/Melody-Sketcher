import { useState, useCallback, useRef } from 'react';

const AUTOCLOSE_MS = 3000;

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const idCounter = useRef(0);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = ++idCounter.current;
    setToasts(prev => [...prev, { id, message, type }]);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, AUTOCLOSE_MS);
  }, []);

  return { toasts, showToast, dismissToast };
}
