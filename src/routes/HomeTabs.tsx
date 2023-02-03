import { createMaterialBottomTabNavigator } from "@react-navigation/material-bottom-tabs";
import { useTheme } from "react-native-paper";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { HomeRoutes } from "./routes";

const Tab = createMaterialBottomTabNavigator();

/**
 * Bottom Navigation renders secondary routes
 * For primary routes see NavigationTop
 */
export default function HomeTabs() {
  const theme = useTheme();

  return (
    <>
      <Tab.Navigator
        barStyle={{
          backgroundColor: theme.colors.background,
        }}
        activeColor={theme.colors.primary}
        shifting
      >
        {HomeRoutes.map((route) => (
          <Tab.Screen
            key={route.name}
            name={route.name}
            component={route.component}
            options={{
              tabBarIcon: ({ color, focused }) => (
                <>
                  <MaterialCommunityIcons
                    resizeMode="contain"
                    name={route.icon}
                    color={color}
                    size={focused ? 25 : 20}
                  />
                </>
              ),
            }}
          ></Tab.Screen>
        ))}
      </Tab.Navigator>
    </>
  );
}
