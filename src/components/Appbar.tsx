import { useContext } from "react";
import { View } from "react-native";
import { Appbar, Badge, useTheme } from "react-native-paper";
import { TripContext } from "../contexts/TripContext";
import { UserContext } from "../contexts/UserContext";

/**
 * Dynamically Managed Top navigation bar
 */
export default function AppBarTop({ navigation, route, back, options }) {
  const theme = useTheme();
  const { tripInProgress } = useContext(TripContext);

  return (
    <>
      <Appbar.Header>
        {back && route.name !== "TripInProgress" && route.name !== "TripSummary" ? (
          <Appbar.BackAction onPress={navigation.goBack} />
        ) : null}
        <Appbar.Content title={options.headerTitle} />
        {route.name === "TripInProgress" ? (
          <Appbar.Action
            icon="home"
            onPress={() => {
              navigation.navigate("Home");
            }}
          />
        ) : null}
        {/* Trip */}
        {tripInProgress && route.name !== "TripInProgress" && route.name !== "TripConfirm" ? (
          <View>
            <Badge
              size={8}
              style={{ position: "absolute", top: 12, right: 12 }}
            ></Badge>
            <Appbar.Action
              icon="car"
              size={30}
              color={theme.colors.accent}
              onPress={() => {
                navigation.navigate("TripInProgress");
              }}
            />
          </View>
        ) : null}
      </Appbar.Header>
    </>
  );
}
