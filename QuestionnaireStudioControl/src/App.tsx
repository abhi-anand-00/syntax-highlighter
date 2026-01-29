import * as React from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { 
  FluentThemeProvider, 
  Toaster,
  LoadingWrapper,
} from "./components/fluent";
import { DataverseProvider } from "./lib/dataverse/pcf";
import { NavigationProvider, useNavigation, ViewState } from "./lib/navigation";
import Index from "./pages/Index";
import Documentation from "./pages/Documentation";
import PCFDocumentation from "./pages/PCFDocumentation";
import DataversePlayground from "./pages/DataversePlayground";
import Execute from "./pages/Execute";

// PCF-safe QueryClient configuration
// - No caching (PCF can destroy/recreate controls)
// - No stale time (always refetch fresh data)
// - No auto-retry (handle errors explicitly with Result pattern)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 0,        // formerly cacheTime in v4
      staleTime: 0,
      retry: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

const ViewRouter = () => {
  const { currentView, isNavigating } = useNavigation();
  
  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Index />;
      case 'docs':
        return <Documentation />;
      case 'docs-pcf':
        return <PCFDocumentation />;
      case 'docs-playground':
        return <DataversePlayground />;
      case 'execute':
        return <Execute />;
      default:
        return <Index />;
    }
  };

  return (
    <LoadingWrapper isLoading={isNavigating} variant="fullPage" label="Loading...">
      {renderView()}
    </LoadingWrapper>
  );
};

const AppContent = () => (
  <>
    <Toaster toasterId="global-toaster" />
    <ViewRouter />
  </>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <FluentThemeProvider>
        <DataverseProvider>
          <NavigationProvider>
            <AppContent />
          </NavigationProvider>
        </DataverseProvider>
      </FluentThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
