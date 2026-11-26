import { createContext, useContext } from 'react';

interface LayoutContextValue {
  focusMode: boolean;
  setFocusMode: (focused: boolean) => void;
}

export const LayoutContext = createContext<LayoutContextValue>({ focusMode: false, setFocusMode: () => {} });

export function useLayoutContext() {
  return useContext(LayoutContext);
}
