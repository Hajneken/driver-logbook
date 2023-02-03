import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useContext, useState } from "react";
import { Avatar, Card, IconButton, List, useTheme } from "react-native-paper";
import { FABCustom } from "../components/CustomFAB";
import InfoModal from "../components/InfoModal";
import { Layout, Scrollable } from "../components/Layout/Layout";
import UpdateDialog, {
  DialogType,
  UpdateDialogInterface,
} from "../components/UpdateDialog";
import { TripContext } from "../contexts/TripContext";
import { UserContext } from "../contexts/UserContext";
import { transformLocation } from "../model/store";

/**
 * Screen for displaying trip summary after ending a trip
 * User can modify the summary data and save the trip
 * Confirming persists the trip to the database
 */
export default function TripSummaryScreen({ navigation }) {
  const tripContext = useContext(TripContext);
  const userContext = useContext(UserContext);
  const theme = useTheme();
  const [savedPlacesNames, setSavedPlacesNames] = useState<Array<string>>([]);

  useFocusEffect(
    useCallback(() => {
      getSavedPlacesNames();
      return () => {};
    }, [])
  );

  async function getSavedPlacesNames() {
    const places = await userContext.getSavedPlacesNames();
    if (places === null) {
      return;
    }
    setSavedPlacesNames(places);
  }

  const [requestPending, setRequestPending] = useState(false);
  const [updateDialogVisible, setUpdateDialogVisible] = useState(false);
  const [updatedDialogValue, setUpdatedDialogValue] = useState<
    [UpdateDialogInterface]
  >([
    {
      icon: "pencil",
      title: "Warmup",
      currentValue: "warmup current",
      updateCallback: () =>
        console.log("NO UPDATE CALLBACK PROVIDED, UPDATE UNSUCCESSFUL!"),
      checkCallback: () => true,
    },
  ]);

  const summaryInfo: Array<{
    title: string;
    value: any;
    icon: string;
    updateCallback: Function;
    component: DialogType;
  }> = [
    {
      title: "Start Location",
      value: transformLocation(tripContext.locationStart),
      updateCallback: async (updatedLocationStart): Promise<boolean> => {
        const places = await userContext.getSavedPlaces();
        if (places === null) {
          return false;
        }
        const place = places.find(
          (place) => place.name === updatedLocationStart
        );
        if (place === undefined) {
          return false;
        }
        tripContext.setLocationStart(place.address);
        return true;
      },
      icon: "map-marker",
      component: {
        type: "list",
        items: savedPlacesNames,
      },
    },
    {
      title: "End Location",
      value: transformLocation(tripContext.locationEnd),
      updateCallback: async (updatedLocationEnd): Promise<boolean> => {
        const places = await userContext.getSavedPlaces();
        if (places === null) {
          return false;
        }
        const place = places.find((place) => place.name === updatedLocationEnd);
        if (place === undefined) {
          return false;
        }
        tripContext.setLocationEnd(place.address);
        return true;
      },
      icon: "map-marker",
      component: {
        type: "list",
        items: savedPlacesNames,
      },
    },
    {
      title: "Start Odometer",
      value: tripContext.odometerStart,
      updateCallback: (updatedValue: string): boolean => {
        const updatedValueNumber: number = Number(updatedValue);
        if (
          updatedValueNumber <= tripContext.odometerEnd &&
          updatedValueNumber >= 0
        ) {
          tripContext.setOdometerStart(updatedValueNumber);
          return true;
        }
        return false;
      },
      icon: "counter",
      component: { type: "number" },
    },
    {
      title: "End Odometer",
      value: tripContext.odometerEnd,
      updateCallback: (updatedValue: string): boolean => {
        const updatedValueNumber: number = Number(updatedValue);
        if (
          updatedValueNumber >= tripContext.odometerStart &&
          updatedValueNumber >= 0
        ) {
          tripContext.setOdometerEnd(updatedValueNumber);
          return true;
        }
        return false;
      },
      icon: "counter",
      component: { type: "number" },
    },
    {
      title: "Start Time",
      value: tripContext.timeStarted?.toString(),
      updateCallback: (updatedValue: Date) => {
        if (updatedValue.getTime() <= tripContext.timeStarted.getTime()) {
          tripContext.setTimeStarted(updatedValue);
          return true;
        }
        return false;
      },
      icon: "clock",
      component: { type: "time", time: tripContext.timeStarted },
    },
    {
      title: "End Time",
      value: tripContext.timeEnded?.toString(),
      updateCallback: (updatedValue: Date): boolean => {
        if (updatedValue.getTime() >= tripContext.timeStarted.getTime()) {
          tripContext.setTimeEnded(updatedValue);
          return true;
        }
        return false;
      },
      icon: "clock",
      component: { type: "time", time: tripContext.timeStarted },
    },
  ];

  /**
   *  Confirms values and sends them to the store by calling handleConfirmTrip()
   */
  async function handleConfirmTrip() {
    setRequestPending(true);
    await tripContext.confirmEndTripValues();
    setRequestPending(false);
    navigation.navigate("Overview");
  }

  const summaryInfoComponents = summaryInfo.map((item) => {
    return (
      <List.Item
        key={item.title}
        title={item.title}
        description={item.value}
        left={() => <List.Icon icon={item.icon} />}
        right={() => (
          <IconButton
            icon="pencil"
            color={theme.colors.primary}
            onPress={() => {
              setUpdatedDialogValue({
                icon: item.icon,
                title: item.title,
                currentValue: item.value,
                updateCallback: item.updateCallback,
                component: item.component,
              });
              setUpdateDialogVisible(true);
            }}
          />
        )}
      />
    );
  });

  return (
    <Layout style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0 }}>
      <Scrollable>
        <Card style={{ paddingBottom: 40 }}>
          <Card.Content>
            <Card.Title
              title="Trip Summary"
              left={(props) => <Avatar.Icon {...props} icon="timeline-check" />}
            />

            <List.Item
              title="Distance Driven"
              description={`${
                tripContext.odometerEnd - tripContext.odometerStart
              } km`}
            />
            {summaryInfoComponents}
          </Card.Content>
        </Card>
      </Scrollable>
      <FABCustom
        icon="checkbox-marked-circle"
        extended={true}
        animateFrom={"right"}
        onPress={handleConfirmTrip}
        label={"Confirm"}
        style={{ backgroundColor: theme.colors.primary }}
      >
        Confirm
      </FABCustom>
      <InfoModal modalIsVisible={requestPending} />
      <UpdateDialog
        open={updateDialogVisible}
        setOpen={setUpdateDialogVisible}
        options={updatedDialogValue}
      />
    </Layout>
  );
}
