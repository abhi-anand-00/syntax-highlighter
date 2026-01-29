/**
 * PCF-Compatible Navigation Context
 * 
 * Provides state-based navigation for PCF controls with loading states.
 */

import * as React from 'react';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ViewState, NavigationState } from './types';

interface NavigationContextValue {
  currentView: ViewState;
  previousView: ViewState | null;
  isNavigating: boolean;
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
  const [isNavigating, setIsNavigating] = useState(false);

  const navigate = useCallback((view: ViewState) => {
    setIsNavigating(true);
    // Brief delay to show loading state and allow for smooth transitions
    setTimeout(() => {
      setState(prev => ({
        currentView: view,
        previousView: prev.currentView,
      }));
      setIsNavigating(false);
    }, 150);
  }, []);

  const goBack = useCallback(() => {
    setIsNavigating(true);
    setTimeout(() => {
      setState(prev => ({
        currentView: prev.previousView ?? 'home',
        previousView: null,
      }));
      setIsNavigating(false);
    }, 150);
  }, []);

  return (
    <NavigationContext.Provider value={{
      currentView: state.currentView,
      previousView: state.previousView,
      isNavigating,
      navigate,
      goBack,
    }}>
      {children}
    </NavigationContext.Provider>
  );
};
