import * as Location from "expo-location";
import { LocationObject } from "expo-location";
import { createContext, useState } from "react";
import { v5 as uuidv5 } from "uuid";
import {
  deleteTrip,
  getTrip,
  getValue,
  purgeAsyncStorage,
  storeTrip,
  storeValue,
  transformLocation,
  updateTrip,
} from "../model/store";

/**
 * Represents a Trip as stored in the async storage
 */
export interface TripStoreEntry {
  tripId: string;
  sequenceNumber: number;
  tripStartImageId: string | null;
  tripEndImageId: string | null;
  timeStarted: string | Date | null;
  timeEnded: string | Date | null;
  odometerStart: number | null;
  odometerEnd: number | null;
  locationStart: string | null;
  locationEnd: string | null;
  distanceInKm: number | null;
  lastModified: string | Date;
}

/**
 * Represents a global state for the current trip
 */
export interface TripContextInterface {
  tripId: string;
  setTripId: (tripId: string) => void;
  latestTripNumber: number;
  setLatestTripNumber: (latestTripNumber: number) => void;
  sequenceNumber: number;
  setSequenceNumber: (tripOrder: number) => void;
  ocrResult: object | null;
  setOcrResult: (value: object | null) => void;
  tripStartImageId: string | null;
  setTripStartImageId: (tripStartImageId: string | null) => void;
  tripEndImageId: string | null;
  setTripEndImageId: (tripEndImageId: string | null) => void;
  tripInProgress: boolean;
  setTripInProgress: (tripInProgress: boolean) => void;
  timeStarted: Date | null;
  setTimeStarted: (timeStarted: Date | null) => void;
  timeEnded: Date | null;
  setTimeEnded: (timeEnded: Date | null) => void;
  odometerStart: number | null;
  setOdometerStart: (odometerStart: number | null) => void;
  odometerEnd: number | null;
  setOdometerEnd: (odometerEnd: number | null) => void;
  locationStart: object | null;
  setLocationStart: (locationStart: object | null) => void;
  locationEnd: object | null;
  setLocationEnd: (locationEnd: object | string | null) => void;
  initTripContext: () => Promise<void>;
  resetTripContext: () => void;
  purgeDatabase: () => Promise<void>;
  removeTrip: (tripId: string) => Promise<void>;
  persistTrip: () => Promise<void>;
  startTrip: (odometerStart: number) => Promise<boolean>;
  endTrip: (odometerEnd: number) => Promise<boolean>;
  updateTripValue: (
    updatedValue: object,
    sequenceNumber: number
  ) => Promise<boolean>;
  requestLocation: () => Promise<void>;
  confirmEndTripValues: () => Promise<void>;
  getLastTripEndOdometerValue: () => Promise<number>;
}

export const TripContext = createContext<TripContextInterface>({
  tripId: "",
  setTripId: (tripId: string) => {},
  latestTripNumber: -1,
  setLatestTripNumber: (latestTripNumber: number) => {},
  sequenceNumber: -1,
  setSequenceNumber: (tripOrder: number) => {},
  ocrResult: null,
  setOcrResult: (value: object | null) => {},
  tripStartImageId: null,
  setTripStartImageId: (tripStartImageId: string | null) => {},
  tripEndImageId: null,
  setTripEndImageId: (tripEndImageId: string | null) => {},
  tripInProgress: false,
  setTripInProgress: (tripInProgress: boolean) => {},
  timeStarted: new Date(),
  setTimeStarted: (timeStarted: Date | null) => {},
  timeEnded: new Date(),
  setTimeEnded: (timeEnded: Date | null) => {},
  odometerStart: 123456,
  setOdometerStart: (odometerStart: number | null) => {},
  odometerEnd: 123457,
  setOdometerEnd: (odometerEnd: number | null) => {},
  locationStart: null,
  setLocationStart: (locationStart: object | null) => {},
  locationEnd: null,
  setLocationEnd: (locationEnd: object | string | null) => {},
  initTripContext: async () => {},
  resetTripContext: () => {},
  purgeDatabase: async () => {},
  removeTrip: async (tripId: string) => {},
  persistTrip: async () => {},
  startTrip: async (odometerStart: number) => true,
  endTrip: async (odometerEnd: number) => true,
  updateTripValue: async (updatedValue: object, sequenceNumber: number) => true,
  requestLocation: async () => {},
  confirmEndTripValues: async () => {},
  getLastTripEndOdometerValue: async () => 0,
});

/**
 * Component for Trip State
 **/
export function TripContextProvider({ children }) {
  // Contains default values
  const [tripId, setTripId] = useState<string>("");
  const [latestTripNumber, setLatestTripNumber] = useState<number>(-1);
  const [sequenceNumber, setSequenceNumber] = useState<number>(-1);
  const [ocrResult, setOcrResult] = useState<object | null>(null);
  const [tripStartImageId, setTripStartImageId] = useState<string | null>(null);
  const [tripEndImageId, setTripEndImageId] = useState<string | null>(null);
  const [tripInProgress, setTripInProgress] = useState(false);
  const [timeStarted, setTimeStarted] = useState<Date | null>(null);
  const [timeEnded, setTimeEnded] = useState<Date | null>(null);
  const [odometerStart, setOdometerStart] = useState<number | null>(null);
  const [odometerEnd, setOdometerEnd] = useState<number | null>(null);
  const [locationStart, setLocationStart] = useState<object | string | null>(
    null
  );
  const [locationEnd, setLocationEnd] = useState<object | string | null>(null);

  async function initTripContext() {
    const latestTripNumber = await getValue("latestTripNumber");
    if (latestTripNumber === null) {
      setLatestTripNumber(-1);
      return;
    }
    setLatestTripNumber(latestTripNumber);
  }

  function resetTripContext() {
    setTripId("");
    setSequenceNumber(-1);
    setOcrResult(null);
    setTripStartImageId(null);
    setTripEndImageId(null);
    setTripInProgress(false);
    setTimeStarted(null);
    setTimeEnded(null);
    setOdometerStart(null);
    setOdometerEnd(null);
    setLocationStart(null);
    setLocationEnd(null);
  }

  async function purgeDatabase() {
    console.log("Purging Database ...");
    await purgeAsyncStorage();
    resetTripContext();
    setLatestTripNumber(-1);
    await storeValue("latestTripNumber", "-1");
  }

  /**
   * Throttles a function to be called at most once per delay
   * @param fn
   * @param delay
   * @returns
   */
  function debounceAsync<T extends (...args: any[]) => any>(
    fn: T,
    delay: number
  ): T {
    let timeoutId: number | undefined;
    return function (this: any, ...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        await fn.apply(this, args);
      }, delay);
    } as T;
  }

  async function persistTrip() {
    if (latestTripNumber === -1) {
      debounceAsync(
        storeTrip({
          tripId: tripId,
          sequenceNumber: 1,
          locationStart: transformLocation(locationStart),
          locationEnd: transformLocation(locationEnd),
          tripStartImageId: tripStartImageId,
          tripEndImageId: tripEndImageId,
          odometerStart: odometerStart,
          odometerEnd: odometerEnd,
          timeStarted: timeStarted,
          timeEnded: timeEnded,
          distanceInKm: calculateDistanceDriven(),
          lastModified: new Date().toString(),
        }),
        300
      );
    } else {
      debounceAsync(
        storeTrip({
          tripId: tripId,
          sequenceNumber: latestTripNumber + 1,
          locationStart: transformLocation(locationStart),
          locationEnd: transformLocation(locationEnd),
          tripStartImageId: tripStartImageId,
          tripEndImageId: tripEndImageId,
          odometerStart: odometerStart,
          odometerEnd: odometerEnd,
          timeStarted: timeStarted,
          timeEnded: timeEnded,
          distanceInKm: calculateDistanceDriven(),
          lastModified: new Date().toString(),
        }),
        300
      );
    }

    incrementLatestTripNumber();
    await persistLatestTripNumber();
    console.log("Trip persisted successfully!");
  }

  function incrementLatestTripNumber() {
    if (latestTripNumber === -1) {
      setLatestTripNumber(1);
    }
    if (latestTripNumber > 0) {
      setLatestTripNumber(
        (previousLatestTripNumber) => previousLatestTripNumber + 1
      );
    }
  }

  async function persistLatestTripNumber() {
    await storeValue("latestTripNumber", `${latestTripNumber}`);
  }

  function generateNewTripId() {
    const UUID_NAMESPACE = "cbd1a3ac-47e3-42ba-92e4-e7e82aae8234";
    let UUID: string = uuidv5(
      `${new Date()} trip:${sequenceNumber}`,
      UUID_NAMESPACE
    );
    setTripId(UUID);
  }

  /**
   * Make sure that starting value of the odometer is greater or equal to the last trip's ending value
   * @param odometerValueStart
   * @returns
   */
  async function validateOdometerStart(
    odometerValueStart: number
  ): Promise<boolean> {
    const lastTripEndOdometerValue = await getLastTripEndOdometerValue();
    if (lastTripEndOdometerValue === null) {
      return true;
    }
    return odometerValueStart >= Number(lastTripEndOdometerValue);
  }

  function validateOdometerEnd(odometerValueEnd: number): boolean {
    if (odometerStart === null) {
      return false;
    }
    return odometerValueEnd >= odometerStart;
  }

  /**
   * Starts a new trip, looks up the last trip's end odometer value and validates the start odometer value, if the value is falsy it will not start the trip
   */
  async function startTrip(odometerStart: number): Promise<boolean> {
    if (await validateOdometerStart(odometerStart)) {
      setOdometerStart(odometerStart);
      generateNewTripId();
      setTripInProgress(true);
      setTimeStarted(new Date());
      return true;
    }
    return false;
  }

  /**
   * Ends a trip by comparing the start and end odometer values, if the value is falsy it will not end the trip, returning false
   */
  async function endTrip(odometerEnd: number): Promise<boolean> {
    if (validateOdometerEnd(odometerEnd)) {
      setOdometerEnd(odometerEnd);
      setTripInProgress(false);
      setTimeEnded(new Date());
      return true;
    }
    return false;
  }

  /**
   * Persist trip and prepares context for next trip
   */
  async function confirmEndTripValues() {
    await persistTrip();

    resetTripContext();
  }

  /**
   * Obtain end odometer value of the last stored trip
   */
  async function getLastTripEndOdometerValue() {
    const lastTrip = await getTrip(latestTripNumber);
    if (lastTrip) {
      return lastTrip.odometerEnd;
    }
    return null;
  }

  /**
   * Request Location Permissions and get current location, performs reverse geocoding and updates global location state
   */
  async function requestLocation() {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission to access location was denied");
      alert("To use the app please enable location permissions");
      return;
    }
    // machine readable info
    let location: LocationObject = await Location.getCurrentPositionAsync({});
    // human readable info
    let address = await Location.reverseGeocodeAsync({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });

    // if trip is in progress, set locationEnd
    if (timeStarted === null) {
      console.log("Setting location start...");
      setLocationStart({ address: address, coords: location });
      return;
    }
    console.log("Setting location end...");
    setLocationEnd({ address: address, coords: location });
  }

  function calculateDistanceDriven() {
    if (odometerStart === null) {
      console.log("odometerStart is null");
      return -1;
    }
    if (odometerEnd === null) {
      console.log("odometerEnd is null");
      return -1;
    }
    return odometerEnd - odometerStart;
  }

  async function removeTrip(sequenceNumber: number) {
    if (sequenceNumber === latestTripNumber) {
      setLatestTripNumber(latestTripNumber - 1);
    }
    await deleteTrip(sequenceNumber);
  }

  /**
   * updates the trip, if second argument is not provided, trip that is not yet persisted is updated
   */
  async function updateTripValue(
    updatedValue: object,
    sequenceNumber: number
  ): Promise<boolean> {
    // existing trip

    const oldTrip = await getTrip(sequenceNumber);
    if (oldTrip === null) {
      console.log(
        `Attempted to update Trip ${sequenceNumber} that does not exist.`
      );
      return false;
    }
    console.log("oldTrip", oldTrip);
    const updatedTrip = { ...oldTrip, ...updatedValue };
    console.log("updatedTrip", updatedTrip);
    await updateTrip(updatedTrip);
    return true;
  }

  const value = {
    latestTripNumber,
    setLatestTripNumber,
    sequenceNumber,
    setSequenceNumber,
    ocrResult,
    setOcrResult,
    tripStartImageId,
    setTripStartImageId,
    tripEndImageId,
    setTripEndImageId,
    timeStarted,
    setTimeStarted,
    timeEnded,
    setTimeEnded,
    tripInProgress,
    setTripInProgress,
    odometerStart,
    setOdometerStart,
    odometerEnd,
    setOdometerEnd,
    locationStart,
    setLocationStart,
    locationEnd,
    setLocationEnd,
    initTripContext,
    resetTripContext,
    purgeDatabase,
    removeTrip,
    persistTrip,
    startTrip,
    endTrip,
    updateTripValue,
    requestLocation,
    confirmEndTripValues,
    getLastTripEndOdometerValue,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}
