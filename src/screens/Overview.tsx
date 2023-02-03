import { useFocusEffect } from "@react-navigation/native";
import React, { useContext, useState } from "react";
import { RefreshControl, Share, View } from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  IconButton,
  Title,
  useTheme,
} from "react-native-paper";
import styled from "styled-components/native";
import { BlobStorageURL } from "../api/AzureStorage";
import { FABCustom } from "../components/CustomFAB";
import { Scrollable } from "../components/Layout/Layout";
import OdometerEvidence from "../components/OdometerEvidence";
import ShareDialog from "../components/ShareDialog";
import AllLoaded from "../components/static/AllLoaded";
import NotFound from "../components/static/NotFound";
import { AppSettingsContext } from "../contexts/AppSettings";
import { TripContext, TripStoreEntry } from "../contexts/TripContext";
import { UserContext } from "../contexts/UserContext";
import { mockSavedPlaces, mockTrips } from "../model/mocks";
import {
  getMultipleTrips,
  getValue,
  storeMultipleTrips,
  storeValue,
} from "../model/store";

/**
 * Initial Screen of the app, displays a list of trips, allows the user to start a new trip, share a trip and in admin mode to modify selected trip
 */
export default function OverviewScreen({ navigation }) {
  // GLOBAL STATE
  const theme = useTheme();
  const tripContext = useContext(TripContext);
  const userContext = useContext(UserContext);
  const appSettingsContext = useContext(AppSettingsContext);
  // LOCAL STATE
  const [tripList, setTripList] = useState<Array<TripStoreEntry> | null>(null);
  const [FABextended, setFABextended] = useState<boolean>(false);
  const [isFromLatest, setIsFromLatest] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [tripsLeft, setTripsLeft] = useState<number>(
    tripContext.latestTripNumber
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [modalIsVisible, setModalIsVisible] = useState<boolean>(false);
  const [odometerEvidence, setOdometerEvidence] = useState<{
    odometerStart: string;
    odometerEnd: string;
  } | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      if (appSettingsContext.isDemoMode && appSettingsContext.initialLoad) {
        initDemoMode();
        return;
      }
      refreshFeed(tripContext.latestTripNumber);
      return () => {
        setTripList(null);
      };
    }, [
      appSettingsContext.isDemoMode,
      appSettingsContext.initialLoad,
      tripContext.latestTripNumber,
    ])
  );

  async function initContextFromDb() {
    console.log(
      "Initializing trip context by fetching latestTripNumber from database..."
    );
    const latestTrip = await getValue("latestTripNumber");

    if (latestTrip === "-1" || latestTrip === null) {
      console.log("No trips in the database!");
      setTripList([]);
      return;
    }

    const latestTripNumber = parseInt(latestTrip, 10);
    tripContext.setLatestTripNumber(latestTripNumber);
    const trips = await fetchTripHistory(latestTripNumber);
    setTripList(trips);
  }

  async function initDemoMode() {
    console.log("Initializing demo mode");
    await tripContext.purgeDatabase();
    await populateDatabase();
    appSettingsContext.setInitialLoad(false);
  }

  /**
   * Intended for Demo Mode to warm up async storage database with initial mock values
   */
  async function populateDatabase() {
    if (!appSettingsContext.isDemoMode) {
      console.log("Not in demo mode, database should likely be empty.");
      return;
    }
    await userContext.addMultipleSavedPlaces(mockSavedPlaces);
    console.log("Demo mode is on, using mock data");
    const latestTripNumber = mockTrips.length;
    await storeMultipleTrips(mockTrips);
    await storeValue("latestTripNumber", `${latestTripNumber}`);
    tripContext.setLatestTripNumber(latestTripNumber);
  }

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshFeed(tripContext.latestTripNumber);
    setIsFromLatest(true);
    setRefreshing(false);
  }, [tripContext.latestTripNumber]);

  async function refreshFeed(latestTripNumber: number) {
    setLoading(true);
    console.log("Attempting to refresh feed ...");
    if (appSettingsContext.initialLoad) {
      console.log("Initial load, initializing context from database ...");
      await initContextFromDb();
      appSettingsContext.setInitialLoad(false);
      setLoading(false);
      return;
    }
    // in case of purged database
    if (latestTripNumber === -1) {
      console.log("DB likely purged!");
      await initContextFromDb();
      setLoading(false);
      return;
    }

    // runs on every subsequent screen visit
    const refreshedTrips = await fetchTripHistory(latestTripNumber);
    setTripList(refreshedTrips);
    setLoading(false);
  }

  /**
   * Fetches list of 5 latest finished trips starting with the trip number `fromTripNumber` and caches them into tripList
   *
   * look at the latestTripNumber, if it is null or -1, there are no trips in the database
   * from the latestTripNumber, get the last 5 trips, i.e. [n, n-1, n-2, n-3, n-4]
   */
  async function fetchTripHistory(
    fromTripNumber: number = tripContext.latestTripNumber
  ): Promise<Array<TripStoreEntry> | undefined> {
    if (fromTripNumber === -1) {
      console.log("No trips in the database!");
      return [];
    }

    // numbers correspond to the trips
    let tripNumbers: number[] = getArrayOfFiveFromNumber(fromTripNumber);

    if (tripNumbers.length === 0) {
      console.log(
        `Sequence of trips ${tripNumbers} does not correspond to any trips in the database!`
      );
      return;
    }

    console.log(`Fetching Trips: [${tripNumbers}] from The Local Storage...`);
    const trips = await getMultipleTrips(tripNumbers);
    const transformedTrips = transformTrips(trips);

    setTripsLeft(fromTripNumber - 5);

    return transformedTrips;
  }

  function transformTrips(trips: Array<TripStoreEntry>) {
    console.log("Transforming trips...");
    // trips are returned as Array<["@trip#1", tripInfoObj]>
    // filter trips that are null
    const tripsOnly = trips.map((trip) => trip[1]);
    return tripsOnly.filter((trip) => trip !== null);
  }

  /**
   * Loads more trips into the tripList by merging the new trips with the old ones
   * resets chronological order if the trips are loaded from the newest
   * @returns
   */
  async function handleLoadMoreTrips() {
    if (tripsLeft <= 0) {
      console.log("No more trips left to load!");
      return;
    }

    console.log("Attempting to load more trips ...");
    const moreTrips = await fetchTripHistory(tripsLeft);

    if (!isFromLatest) {
      console.log("Reversing the order of loaded trips");
      setTripList([...tripList.slice().reverse(), ...moreTrips]);
      setIsFromLatest(false);
      return;
    }

    setTripList((prev) => [...prev, ...moreTrips]);
  }

  /**
   * Given a number n, returns an array of numbers [n-4, n-3, n-2, n-1, n]
   * reduces the number of elements if the number is less than 5 accordingly
   */
  function getArrayOfFiveFromNumber(number: number): Array<number> {
    const result = [];
    // Loop through the numbers in the form [n, n-1, n-2, n-3, n-4]
    for (let i = number; i >= number - 4; i--) {
      if (i > 0) {
        result.push(i);
      }
    }
    return result;
  }

  /**
   * Chronologically sorts trips
   * slice() methods prevents mutation of the original array
   */
  const reverseTripList = () => setTripList(tripList.slice().reverse());

  /**
   * Shares information about the trip using native dialog
   */
  const handleShareTrip = async (trip: TripStoreEntry) => {
    try {
      const result = await Share.share({
        title: `Trip ${trip.timeStarted} information`,
        message: `Information About Trip on ${trip.timeStarted} | Duration: ${trip.timeStarted} - ${trip.timeEnded} | Distance: ${trip.distanceInKm} km | Odometer After: ${trip.odometerEnd} km | download start proof image: ${BlobStorageURL}/${trip.tripStartImageId}.jpg | download end proof image: ${BlobStorageURL}/${trip.tripEndImageId}.jpg`,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (e) {
      alert(e.message);
    }
  };

  function transformIsoDateStringToTime(isoDateString: string) {
    const date = new Date(isoDateString);
    return date.toLocaleTimeString();
  }

  function transformIsoDateStringToDate(isoDateString: string) {
    const date = new Date(isoDateString);
    return date.toLocaleDateString("en-GB");
  }

  const tripsAvailable =
    tripList !== null &&
    tripList.length !== 0 &&
    tripContext.latestTripNumber !== -1;
  // more trips are available to be loaded when the length of the trip list is as big as the latestTripNumber
  const moreTripsAvailable =
    tripsLeft > 0 && tripContext.latestTripNumber !== -1;

  return (
    <>
      <Layout
        onLayout={() =>
          setTimeout(() => {
            setFABextended(true);
          }, 500)
        }
      >
        <Scrollable
          onScrollEndDrag={() => setFABextended(true)}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={{ display: "flex", flexDirection: "row" }}>
            <CustomTitle>{`Trip History (${
              isFromLatest ? "latest" : "oldest"
            } first)`}</CustomTitle>
            {tripsAvailable ? (
              <>
                <ShareDialog />
                <SortButton
                  icon={
                    isFromLatest
                      ? "sort-clock-ascending-outline"
                      : "sort-clock-descending-outline"
                  }
                  animated={true}
                  color={theme.colors.primary}
                  onPress={() => {
                    setIsFromLatest((prev) => !prev);
                    reverseTripList();
                  }}
                />
              </>
            ) : null}
          </View>
          {loading ? <ActivityIndicator /> : null}
          {tripsAvailable
            ? tripList.map((trip, index) => {
                return (
                  <Card
                    key={trip.tripId}
                    elevation={5}
                    style={{ marginBottom: 12 }}
                  >
                    <Card.Content>
                      {appSettingsContext.isAdminMode ? (
                        <SettingsButton
                          icon="dots-horizontal"
                          onPress={() =>
                            navigation.navigate("TripUpdate", {
                              sequenceNumber: trip.sequenceNumber,
                            })
                          }
                        />
                      ) : null}
                      <Card.Title
                        title={`Trip on ${transformIsoDateStringToDate(
                          trip.timeStarted
                        )} (#${trip.sequenceNumber})`}
                        subtitleNumberOfLines={2}
                        subtitle={`start: ${transformIsoDateStringToTime(
                          trip.timeStarted
                        )}\nend: ${transformIsoDateStringToTime(
                          trip.timeEnded
                        )}`}
                        left={(props) => (
                          <Avatar.Text {...props} label={index + 1} />
                        )}
                      />
                      <Card.Title
                        title={`${trip.distanceInKm} km`}
                        subtitleNumberOfLines={4}
                        subtitle={`From: ${trip.locationStart}\nTo: ${trip.locationEnd}`}
                        left={(props) => (
                          <IconButton
                            icon={"image"}
                            style={{ marginLeft: "auto", marginRight: "auto" }}
                            color={theme.colors.primary}
                            onPress={() => {
                              setOdometerEvidence({
                                odometerStart: trip.tripStartImageId,
                                odometerEnd: trip.tripEndImageId,
                              });
                              setModalIsVisible(true);
                            }}
                          />
                        )}
                      />
                      <ShareButton
                        icon="export-variant"
                        color={theme.colors.primary}
                        onPress={() => handleShareTrip(trip)}
                      />
                    </Card.Content>
                  </Card>
                );
              })
            : null}
          {!loading && !tripsAvailable ? <NotFound /> : null}
          {!loading && moreTripsAvailable ? (
            <>
              <LoadMoreButton
                icon="chevron-down"
                mode="contained"
                onPress={handleLoadMoreTrips}
              >
                Load more
              </LoadMoreButton>
              <MarginBumper />
            </>
          ) : null}
          {!loading && tripsAvailable && !moreTripsAvailable ? (
            <>
              <AllLoaded />
              <MarginBumper />
            </>
          ) : null}
        </Scrollable>
        {/* New Trip */}
        {!tripContext.tripInProgress ? (
          <FABCustom
            icon={"plus"}
            label={"New Trip"}
            onPress={() => {
              navigation.navigate("TripPicture");
            }}
            visible={true}
            animateFrom={"right"}
            iconMode={"static"}
            extended={FABextended}
          />
        ) : null}
      </Layout>
      <OdometerEvidence
        modalIsVisible={modalIsVisible}
        modalDismissed={() => setModalIsVisible(false)}
        odometerImageIdStart={odometerEvidence?.odometerStart}
        odometerImageIdEnd={odometerEvidence?.odometerEnd}
      />
    </>
  );
}

const CustomTitle = styled(Title)`
  /* text-align: center; */
  margin: 10px 0 20px 0;
`;

const Layout = styled.View`
  flex: 1;
  background-color: #d1d1d199;
`;

const SortButton = styled(IconButton)``;

const ShareButton = styled(IconButton)`
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 10;
`;

const SettingsButton = styled(IconButton)`
  position: absolute;
  right: 0;
  top: 0;
  z-index: 10;
`;

const LoadMoreButton = styled(Button)`
  width: 50%;
  margin: 0 auto;
`;

const MarginBumper = styled.View`
  height: 80px;
`;
