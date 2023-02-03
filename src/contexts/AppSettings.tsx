import { createContext, useState } from "react";

interface AppSettingsContextInterface {
  isExperimentalMode: boolean;
  setIsExperimentalMode: (isExperimentalMode: boolean) => void;
  isAdminMode: boolean;
  setIsAdminMode: (isAdminMode: boolean) => void;
  isDemoMode: boolean;
  setIsDemoMode: (isDemoMode: boolean) => void;
  initialLoad: boolean;
  setInitialLoad: (initialLoad: boolean) => void;
  isDebugMode: boolean;
  setIsDebugMode: (debugMode: boolean) => void;
}

export const AppSettingsContext = createContext<AppSettingsContextInterface>({
  isExperimentalMode: false,
  setIsExperimentalMode: (isExperimentalMode: boolean) => {},
  isAdminMode: false,
  setIsAdminMode: (isAdminMode: boolean) => {},
  isDemoMode: false,
  setIsDemoMode: (isDemoMode: boolean) => {},
  initialLoad: true,
  setInitialLoad: (initialLoad: boolean) => {},
  isDebugMode: false,
  setIsDebugMode: (debugMode: boolean) => {},
});

/**
 * Configuration for the App
 *
 * Experimental Mode: Picture Recognition is assumed to be correct
 * Admin Mode: Enables User to modify Trips
 * Demo Mode: Uses dummy values for easier development
 *
 */
export default function AppSettingsContextProvider({ children }) {
  const [isExperimentalMode, setIsExperimentalMode] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [initialLoad, setInitialLoad] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(false);

  const value = {
    isExperimentalMode,
    setIsExperimentalMode,
    isAdminMode,
    setIsAdminMode,
    isDemoMode,
    setIsDemoMode,
    initialLoad,
    setInitialLoad,
    isDebugMode,
    setIsDebugMode,
  };

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}
