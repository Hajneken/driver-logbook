import { useFocusEffect } from "@react-navigation/native";
import React, { useContext, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  IconButton,
  List,
  useTheme,
} from "react-native-paper";
import { Layout, Scrollable } from "../components/Layout/Layout";
import UpdateDialog, {
  DialogType,
  UpdateDialogInterface,
} from "../components/UpdateDialog";
import { AppSettingsContext } from "../contexts/AppSettings";
import { TripContext } from "../contexts/TripContext";
import { UserContext } from "../contexts/UserContext";

export default function ProfileScreen(params) {
  const [odometer, setOdometer] = useState<number>(0);
  const theme = useTheme();
  // Global State
  const userContext = useContext(UserContext);
  const tripContext = useContext(TripContext);

  useFocusEffect(
    React.useCallback(() => {
      updateOdometer();
      return () => {
        // Do something when the screen is unfocused
      };
    }, [])
  );

  async function updateOdometer() {
    const odometerValue = await tripContext.getLastTripEndOdometerValue();
    if (odometerValue === null) {
      return 0;
    }
    setOdometer(odometerValue);
  }

  const initialProfileInfo: Array<{
    title: string;
    value: any;
    icon: string;
    updateCallback: Function;
    component: DialogType;
  }> = [
    {
      title: "Vehicle",
      value: userContext.vehicle,
      icon: "car",
      updateCallback: userContext.updateVehicle,
      component: { type: "string" },
    },
    {
      title: "License Plate",
      value: userContext.licensePlate,
      icon: "car-info",
      updateCallback: userContext.updateLicensePlate,
      component: { type: "string" },
    },
    {
      title: "Next Service",
      value: userContext.kmUntilService,
      icon: "car-wrench",
      updateCallback: userContext.updateKmUntilService,
      component: { type: "number" },
    },
    {
      title: "Next Oil Change",
      value: userContext.kmUntilOilChange,
      icon: "oil",
      updateCallback: userContext.updateKmUntilOilChange,
      component: { type: "number" },
    },
    {
      title: "Vignette",
      value: userContext.vigneteUntil.toISOString().split("T")[0],
      icon: "highway",
      updateCallback: userContext.updateVigneteUntil,
      component: { type: "date", time: userContext.vigneteUntil },
    },
    {
      title: "Tires",
      value: userContext.currentTireType,
      icon: "tire",
      updateCallback: userContext.updateCurrentTireType,
      component: { type: "list", items: ["winter", "summer"] },
    },
  ];

  const { isAdminMode } = useContext(AppSettingsContext);
  // Modal Dialog State
  const [updateDialogVisible, setUpdateDialogVisible] = React.useState(false);
  const [updatedDialogValue, setUpdatedDialogValue] =
    React.useState<UpdateDialogInterface>({
      icon: "pencil",
      label: "Warmup",
      currentValue: "warmup current",
      updateCallback: () =>
        console.log("NO UPDATE CALLBACK PROVIDED, UPDATE UNSUCCESSFUL!"),
    });

  function handleModalValueUpdate(profileItem: {
    icon: string;
    title: string;
    value: string;
    updateCallback: Function;
    component: DialogType;
  }) {
    setUpdatedDialogValue({
      icon: profileItem.icon,
      label: profileItem.title,
      currentValue: profileItem.value,
      updateCallback: profileItem.updateCallback,
      component: profileItem.component,
    });
    setUpdateDialogVisible(true);
  }

  return (
    <>
      <Layout style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0 }}>
        <Scrollable>
          <Card elevation={5}>
            <Card.Title
              title={userContext.name}
              left={(props) => (
                <Avatar.Text {...props} label={userContext.name.charAt(0)} />
              )}
              right={() => (
                <IconButton
                  icon="pencil"
                  color={theme.colors.primary}
                  onPress={() =>
                    handleModalValueUpdate({
                      title: "Name",
                      value: userContext.name,
                      icon: "pencil",
                      updateCallback: userContext.updateName,
                      component: { type: "string" },
                    })
                  }
                />
              )}
            />
            <Card.Content>
              <List.Section>
                <List.Subheader>Vehicle Details</List.Subheader>
                <List.Item
                  title={`${odometer} km`}
                  left={() => <List.Icon icon={"counter"} />}
                ></List.Item>
                {isAdminMode
                  ? initialProfileInfo.map((item, index) => (
                      <List.Item
                        key={item.title}
                        title={item.value}
                        left={() => <List.Icon icon={item.icon} />}
                        right={() => (
                          <IconButton
                            icon="pencil"
                            color={theme.colors.primary}
                            onPress={() => handleModalValueUpdate(item)}
                          />
                        )}
                      />
                    ))
                  : initialProfileInfo.map((item, index) => (
                      <List.Item
                        key={item.title}
                        title={item.value}
                        left={() => <List.Icon icon={item.icon} />}
                      />
                    ))}
              </List.Section>
            </Card.Content>
          </Card>
        </Scrollable>
      </Layout>

      <UpdateDialog
        open={updateDialogVisible}
        setOpen={setUpdateDialogVisible}
        options={updatedDialogValue}
      />
    </>
  );
}
