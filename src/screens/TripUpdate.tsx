import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useContext, useState } from "react";
import {
  ActivityIndicator,
  Button,
  Card,
  Dialog,
  IconButton,
  List,
  Paragraph,
  Portal, useTheme
} from "react-native-paper";
import styled from "styled-components/native";
import UpdateDialog, {
  DialogType,
  UpdateDialogInterface
} from "../components/UpdateDialog";
import { TripContext } from "../contexts/TripContext";
import { UserContext } from "../contexts/UserContext";
import { getTrip } from "../model/store";

function Editable({ name, value, onPress, icon = "pencil" }) {
  const theme = useTheme();
  return (
    <List.Item
      title={name}
      description={value}
      right={(props) => (
        <IconButton
          {...props}
          color={theme.colors.primary}
          icon={icon}
          onPress={onPress}
        />
      )}
    />
  );
}
/**
 * Screen accessible from the Overview screen when Admin Mode is enabled.
 * Allows the user to update the trip details.
 */
export default function TripUpdateScreen({ navigation, route }) {
  const [updateDialogVisible, setUpdateDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [updatedDialogValue, setUpdatedDialogValue] =
    useState<UpdateDialogInterface>({
      icon: "pencil",
      label: "",
      currentValue: "",
      updateCallback: (value) => console.log(value),
    });
  const theme = useTheme();
  const tripContext = useContext(TripContext);
  const userContext = useContext(UserContext);

  const [tripInfo, setTripInfo] = useState<
    Array<{
      title: string;
      value: any;
      icon: string;
      updateCallback: Function;
      component: DialogType;
    } | null>
  >(null);

  useFocusEffect(
    useCallback(() => {
      transformTripDetails(route.params.sequenceNumber);

      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions
      };
    }, [route.params.sequenceNumber])
  );

  async function refreshView() {
    await transformTripDetails(route.params.sequenceNumber);
  }

  /**
   * Retrieves values of the current trip, previous trip and the next trip. Sets the trip information with respective update callbacks that contain checks against previous and next trip to prevent data inconsistencies.
   */
  async function transformTripDetails(sequenceNumber: number) {
    const tripDetails = await getTrip(route.params.sequenceNumber);
    const previousTrip = await getTrip(route.params.sequenceNumber - 1);
    const nextTrip = await getTrip(route.params.sequenceNumber + 1);
    // TODO when trip is deleted, further decrement sequenceNumber of the trip against which the check is then performed

    setTripInfo([
      {
        title: "Start Location",
        value: tripDetails.locationStart,
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
          if (
            await tripContext.updateTripValue(
              {
                locationStart: place.address,
                lastModified: new Date().toString(),
              },
              route.params.sequenceNumber
            )
          ) {
            refreshView();
            return true;
          }
          return false;
        },
        icon: "map-marker",
        component: {
          type: "list",
          items: await userContext.getSavedPlacesNames(),
        },
      },
      {
        title: "End Location",
        value: tripDetails.locationEnd,
        updateCallback: async (updatedValue): Promise<boolean> => {
          const places = await userContext.getSavedPlaces();
          if (places === null) {
            return false;
          }
          const place = places.find((place) => place.name === updatedValue);
          if (place === undefined) {
            return false;
          }

          if (
            await tripContext.updateTripValue(
              {
                locationEnd: place.address,
                lastModified: new Date().toString(),
              },
              route.params.sequenceNumber
            )
          ) {
            refreshView();
            return true;
          }
          return false;
        },
        icon: "map-marker",
        component: {
          type: "list",
          items: await userContext.getSavedPlacesNames(),
        },
      },
      {
        title: "Start Odometer",
        value: tripDetails.odometerStart,
        updateCallback: async (updatedOdometerStart): Promise<boolean> => {
          const updatedOdometerStartNumber = Number(updatedOdometerStart);
          // check against current trip
          if (
            updatedOdometerStartNumber > tripDetails.odometerEnd ||
            updatedOdometerStartNumber < 0
          ) {
            console.log(
              "Starting value of odometer cannot be greater than ending value of the trip!"
            );
            return false;
          }
          // check against previous trip
          if (
            previousTrip !== null &&
            updatedOdometerStartNumber < previousTrip.odometerEnd
          ) {
            console.log(
              "Starting value of odometer cannot be smaller than ending value of the previous trip!"
            );
            return false;
          }

          // check against next trip
          if (
            nextTrip !== null &&
            updatedOdometerStartNumber > nextTrip.odometerStart
          ) {
            return false;
          }

          if (
            await tripContext.updateTripValue(
              {
                odometerStart: updatedOdometerStartNumber,
                distanceInKm:
                  tripDetails.odometerEnd - updatedOdometerStartNumber,
                lastModified: new Date().toString(),
              },
              route.params.sequenceNumber
            )
          ) {
            refreshView();
            return true;
          }
          return false;
        },
        icon: "counter",
        component: { type: "number" },
      },
      {
        title: "End Odometer",
        value: tripDetails.odometerEnd,
        updateCallback: async (updatedOdometerEnd): Promise<boolean> => {
          const updatedOdometerEndNumber: number = Number(updatedOdometerEnd);
          // check against current trip
          if (
            updatedOdometerEndNumber < tripDetails.odometerStart ||
            updatedOdometerEndNumber < 0
          ) {
            return false;
          }
          // check against previous trip
          if (
            previousTrip !== null &&
            updatedOdometerEndNumber < previousTrip.odometerEnd
          ) {
            console.log(
              "End odometer value cannot be smaller than start odometer value of the previous trip!"
            );
            return false;
          }
          // check against next trip
          if (
            nextTrip !== null &&
            updatedOdometerEndNumber > nextTrip.odometerStart
          ) {
            console.log(
              "End odometer value cannot be greater than start odometer value of the next trip!"
            );
            return false;
          }

          if (
            await tripContext.updateTripValue(
              {
                odometerEnd: updatedOdometerEndNumber,
                distanceInKm:
                  updatedOdometerEndNumber - tripDetails.odometerStart,
                lastModified: new Date().toString(),
              },
              route.params.sequenceNumber
            )
          ) {
            refreshView();
            return true;
          }
          return false;
        },
        icon: "counter",
        component: { type: "number" },
      },
      {
        title: "Start Time",
        value: new Date(tripDetails?.timeStarted).toString(),
        updateCallback: async (
          updatedTimeStarted: string
        ): Promise<boolean> => {
          if (
            new Date(updatedTimeStarted).getTime() >
            new Date(tripDetails?.timeEnded).getTime()
          ) {
            return false;
          }
          // previous trip check
          if (
            previousTrip !== null &&
            new Date(updatedTimeStarted).getTime() <
              new Date(previousTrip.timeEnded).getTime()
          ) {
            console.log(
              "Start time of the trip cannot be smaller than end time of the previous trip!"
            );
            return false;
          }

          // next trip check
          if (
            nextTrip !== null &&
            new Date(updatedTimeStarted).getTime() >
              new Date(nextTrip.timeStarted).getTime()
          ) {
            console.log(
              "Start time of the trip cannot be later than start time of the next trip!"
            );
            return false;
          }

          if (
            await tripContext.updateTripValue(
              {
                timeStarted: updatedTimeStarted,
                lastModified: new Date().toString(),
              },
              route.params.sequenceNumber
            )
          ) {
            refreshView();
            return true;
          }
          return false;
        },
        icon: "clock",
        component: { type: "time", time: new Date(tripDetails?.timeStarted) },
      },
      {
        title: "End Time",
        value: new Date(tripDetails?.timeEnded).toString(),
        updateCallback: async (updatedTimeEnded: string): Promise<boolean> => {
          if (
            new Date(updatedTimeEnded).getTime() <
            new Date(tripDetails?.timeStarted).getTime()
          ) {
            return false;
          }

          // previous trip check
          if (
            previousTrip !== null &&
            new Date(updatedTimeEnded).getTime() <
              new Date(previousTrip.timeEnded).getTime()
          ) {
            console.log(
              "End time of the trip cannot be smaller than end time of the previous trip!"
            );
            return false;
          }

          // next trip check
          if (
            nextTrip !== null &&
            new Date(updatedTimeEnded).getTime() >
              new Date(nextTrip.timeStarted).getTime()
          ) {
            console.log(
              "End time of the trip cannot be later than start time of the next trip!"
            );
            return false;
          }

          if (
            await tripContext.updateTripValue(
              {
                timeEnded: updatedTimeEnded,
                lastModified: new Date().toString(),
              },
              route.params.sequenceNumber
            )
          ) {
            refreshView();
            return true;
          }
          return false;
        },
        icon: "clock",
        component: { type: "time", time: new Date(tripDetails?.timeEnded) },
      },
    ]);
  }

  async function handleDelete() {
    setDeleteDialogVisible(false);
    await tripContext.removeTrip(route.params.sequenceNumber);
    navigation.navigate("Overview");
  }

  return (
    <>
      <Layout>
        <DeleteButton
          color={theme.colors.error}
          icon="delete"
          onPress={() => setDeleteDialogVisible(true)}
        />
        <Card elevation={5} style={{ marginBottom: 12 }}>
          <Card.Title title={`Trip #${route.params.sequenceNumber}`} />
          {tripInfo !== null ? (
            tripInfo.map((item, index) => (
              <Editable
                key={`${item}-${item.title}`}
                name={item.title}
                value={item.value}
                onPress={() => {
                  setUpdateDialogVisible(true);
                  setUpdatedDialogValue({
                    icon: item.icon,
                    title: item.title,
                    currentValue: item.value,
                    updateCallback: item.updateCallback,
                    component: item.component,
                  });
                }}
              />
            ))
          ) : (
            <ActivityIndicator animating={true} />
          )}
        </Card>
      </Layout>

      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Title>Hold On</Dialog.Title>
          <Dialog.Content>
            <Paragraph>
              Are you sure you want to delete current trip ?
            </Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              mode="contained"
              onPress={() => setDeleteDialogVisible(false)}
            >
              No, take me back
            </Button>
            <Button color={theme.colors.error} onPress={handleDelete}>
              Yes, Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <UpdateDialog
        open={updateDialogVisible}
        setOpen={setUpdateDialogVisible}
        options={updatedDialogValue}
      />
    </>
  );
}

const Layout = styled.View`
  flex: 1;
  background-color: #d1d1d199;
  padding: 10px;
`;

const DeleteButton = styled(IconButton)`
  margin-left: auto;
`;

const Row = styled.View`
  display: flex;
  justify-content: space-between;
  flex-flow: row;
  flex-wrap: wrap;
  align-items: center;
  padding: 0 15px;
`;
