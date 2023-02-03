import AppBarTop from "../components/Appbar";
import HomeTabs from "./HomeTabs";
import { StackRoutes } from "./routes";
import { TransitionPresets } from "@react-navigation/stack";

// Navigation
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
// paths to screens
import { useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import SignInScreen from "../screens/SignIn";

import { getFocusedRouteNameFromRoute } from "@react-navigation/native";

const Stack = createNativeStackNavigator();

function getHeaderTitle(route) {
  const routeName = getFocusedRouteNameFromRoute(route) ?? "Overview";
  switch (routeName) {
    case "Overview":
      return "Overview";
    case "Profile":
      return "Profile";
    case "Saved Places":
      return "Saved Places";
    case "Settings":
      return "Settings";
  }
}

/**
 * Top Navigation is rendered by AppBarTop component featuring routes to the main functionality of the app
 * Secondary routes are included in Home where Routes are handled using Tab.Navigator (bottom navigation)
 */
export default function Navigation({ theme }) {
  const { isSignedIn } = useContext(UserContext);

  const config = {
    animation: "spring",
    config: {
      stiffness: 1000,
      damping: 500,
      mass: 3,
      overshootClamping: true,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    },
  };

  return (
    <>
      <NavigationContainer theme={theme}>
        <Stack.Navigator
          screenOptions={{ header: (props) => <AppBarTop {...props} /> }}
        >
          {!isSignedIn ? (
            <Stack.Screen
              name="SignIn"
              options={{
                header: () => null,
              }}
              component={SignInScreen}
            ></Stack.Screen>
          ) : (
            <>
              {/* Home is not a screen but a wrapper for Tab Navigation */}
              <Stack.Screen
                name="Home"
                component={HomeTabs}
                options={({ route }) => ({
                  headerTitle: getHeaderTitle(route),
                })}
              />
              {StackRoutes.map((route) => (
                <Stack.Screen
                  key={route.name}
                  name={route.name}
                  component={route.component}
                  options={route.options}
                />
              ))}
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
