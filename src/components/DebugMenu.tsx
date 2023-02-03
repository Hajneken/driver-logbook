import { useContext } from "react";
import { View } from "react-native";
import { Button, Title, useTheme } from "react-native-paper";
import styled from "styled-components/native";
import { AppSettingsContext } from "../contexts/AppSettings";
import { TripContext } from "../contexts/TripContext";
import { UserContext } from "../contexts/UserContext";
import { getAllTrips, getTrip, printAllValues } from "../model/store";

export default function DebugMenu(params) {
  const tripContext = useContext(TripContext);
  const userContext = useContext(UserContext);
  const appSettingsContext = useContext(AppSettingsContext);
  const theme = useTheme();

  return (
    <View>
      <Title style={{ marginTop: 10, marginBottom: 15, textAlign: "center" }}>
        Debug Menu
      </Title>
      {/* Latest Trip Number */}
      <DebugButton
        mode="contained"
        onPress={() =>
          console.log("latestTripNumber :>> ", tripContext.latestTripNumber)
        }
      >
        Log Latest Trip Number
      </DebugButton>
      {/* Latest Trip */}
      <DebugButton
        mode="contained"
        onPress={async () =>
          console.log(
            `Latest Trip #${tripContext.latestTripNumber}: `,
            await getTrip(tripContext.latestTripNumber)
          )
        }
      >
        Log latest trip
      </DebugButton>

      <DebugButton
        mode="contained"
        onPress={async () => console.log(`#${2}: `, await getTrip(2))}
      >
        Log trip #2
      </DebugButton>

      <DebugButton
        mode="contained"
        onPress={async () => {
          console.log(await getAllTrips());
        }}
      >
        Log All Trips
      </DebugButton>

      <DebugButton
        mode="contained"
        onPress={async () => await printAllValues()}
      >
        Dump Contents of the Database
      </DebugButton>

      <DebugButton
        mode="contained"
        color={theme.colors.accent}
        onPress={async () => {
          await tripContext.purgeDatabase();
          userContext.setIsSignedIn(false);
          appSettingsContext.setIsDemoMode(true);
          appSettingsContext.setInitialLoad(true);
          appSettingsContext.setIsDebugMode(false);
          appSettingsContext.setIsExperimentalMode(false);
          userContext.setIsSignedIn(false);
        }}
      >
        Restart App in Demo Mode
      </DebugButton>
      <DebugButton
        mode="contained"
        color={theme.colors.accent}
        onPress={() => {
          userContext.setIsSignedIn(false);
          appSettingsContext.setIsDemoMode(false);
          appSettingsContext.setInitialLoad(true);
          appSettingsContext.setIsDebugMode(false);
          appSettingsContext.setIsExperimentalMode(false);
          userContext.setIsSignedIn(false);
        }}
      >
        Restart App
      </DebugButton>
      <DebugButton
        mode="contained"
        onPress={async () => {
          await tripContext.purgeDatabase();
        }}
        color={theme.colors.error}
      >
        Purge Database
      </DebugButton>
    </View>
  );
}

const DebugButton = styled(Button)`
  margin: 10px;
`;
