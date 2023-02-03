import React from "react";
import { Provider as PaperProvider } from "react-native-paper";
import Navigation from "./routes/Navigation";

import { UserContextProvider } from "./contexts/UserContext";
import { Theme } from "./theme/theme";
import AppSettingsContextProvider from "./contexts/AppSettings";
import { TripContextProvider } from "./contexts/TripContext";


/**
 * Application entry point for design systems and contexts
 * Contexts represent global states for different parts of the application
 */
export default function App() {
  return (
    <>
      <PaperProvider theme={Theme}>
        <UserContextProvider>
          <AppSettingsContextProvider>
            <TripContextProvider>
              <Navigation theme={Theme} />
            </TripContextProvider>
          </AppSettingsContextProvider>
        </UserContextProvider>
      </PaperProvider>
    </>
  );
}
