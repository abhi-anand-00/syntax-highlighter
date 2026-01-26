/**
 * PCF-Compatible Navigation Context
 * 
 * Provides state-based navigation for PCF controls.
 */

import * as React from 'react';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ViewState, NavigationState } from './types';

interface NavigationContextValue {
  currentView: ViewState;
  previousView: ViewState | null;
  navigate: (view: ViewState) => void;
  goBack: () => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export const useNavigation = (): NavigationContextValue => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: ReactNode;
  initialView?: ViewState;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ 
  children, 
  initialView = 'home' 
}) => {
  const [state, setState] = useState<NavigationState>({
    currentView: initialView,
    previousView: null,
  });

  const navigate = useCallback((view: ViewState) => {
    setState(prev => ({
      currentView: view,
      previousView: prev.currentView,
    }));
  }, []);

  const goBack = useCallback(() => {
    setState(prev => ({
      currentView: prev.previousView ?? 'home',
      previousView: null,
    }));
  }, []);

  return (
    <NavigationContext.Provider value={{
      currentView: state.currentView,
      previousView: state.previousView,
      navigate,
      goBack,
    }}>
      {children}
    </NavigationContext.Provider>
  );
};
