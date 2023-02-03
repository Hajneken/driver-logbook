import OverviewScreen from "../screens/Overview";
import Places from "../screens/Places";
import ProfileScreen from "../screens/Profile";
import SettingsScreenScreen from "../screens/Settings";
import TripConfirmScreen from "../screens/TripConfirm";
import TripPictureScreen from "../screens/TripPicture";
import TripProgressScreen from "../screens/TripProgress";
import TripSummaryScreen from "../screens/TripSummary";
import TripUpdateScreen from "../screens/TripUpdate";

export const HomeRoutes = [
  { name: "Overview", component: OverviewScreen, icon: "home-analytics" },
  { name: "Saved Places", component: Places, icon: "star" },
  { name: "Profile", component: ProfileScreen, icon: "account-circle" },
  { name: "Settings", component: SettingsScreenScreen, icon: "cog" },
];

// Except for SignIn page and HomeTAB page
export const StackRoutes = [
  {
    name: "TripPicture",
    component: TripPictureScreen,
    options: { headerTitle: "Trip" },
  },
  {
    name: "TripInProgress",
    component: TripProgressScreen,
    options: { headerTitle: "Trip In Progress" },
  },
  {
    name: "TripUpdate",
    component: TripUpdateScreen,
    options: { headerTitle: "Trip Update" },
  },
  {
    name: "TripConfirm",
    component: TripConfirmScreen,
    options: { headerTitle: "Confirm Value" },
  },
  {
    name: "TripSummary",
    component: TripSummaryScreen,
    options: { headerTitle: "Trip Summary" },
  },
];
