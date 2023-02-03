import AsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";
import { Trip, TripStoreEntry } from "../../contexts/TripContext";
import { mockTrips } from "../mocks";
import {
  deleteMultipleTrips,
  deleteTrip,
  getMultipleObjects,
  getMultipleTrips,
  getMultipleValues,
  getObject,
  getTrip,
  getValue,
  printAllValues,
  storeMultipleObjects,
  storeMultipleTrips,
  storeMultipleValues,
  storeTrip,
  storeValue,
  updateTrip,
} from "../store";

// Path: model/__tests__/store.test.ts

it("getValue: Given a key check if Async Storage is called", async () => {
  await getValue("TestingKey");
  expect(AsyncStorage.getItem).toBeCalledWith("@TestingKey");
});

it("storeValue: Given a key and value pair, checks if AsyncStorage stores a key value pair", async () => {
  await storeValue("TestingKey", "TestingValue");
  expect(AsyncStorage.setItem).toBeCalledWith("@TestingKey", "TestingValue");
});

it("storeMultipleValues: Given Multiple values, checks if AsyncStorage stores multiple values", async () => {
  storeMultipleValues([
    ["TestingKey1", "TestingValue1"],
    ["TestingKey2", "TestingValue2"],
    ["TestingKey3", "TestingValue3"],
  ]);
  expect(AsyncStorage.multiSet).toBeCalledWith([
    ["@TestingKey1", "TestingValue1"],
    ["@TestingKey2", "TestingValue2"],
    ["@TestingKey3", "TestingValue3"],
  ]);
});

it("storeMultipleObjects: Checks if multiple objects has been stored", async () => {
  await storeMultipleObjects([
    ["key1", { name: "John" }],
    ["key2", { name: "Jane" }],
    ["key3", { name: "Jack" }],
  ]);
  expect(AsyncStorage.multiSet).toBeCalled();
});

it("printAllValues: Checks if print all values from the store", async () => {
  await printAllValues();
  expect(AsyncStorage.getAllKeys).toBeCalled();
  expect(AsyncStorage.multiGet).toBeCalled();
});

it("getValue: Given that database has a value it returns the value", async () => {
  const value = await getValue("TestingKey");
  expect(value).toEqual("TestingValue");
});

it("getMultipleValues: Given that database has values it returns multiple values", async () => {
  const values = await getMultipleValues([
    "TestingKey1",
    "TestingKey2",
    "TestingKey3",
  ]);
  expect(values).toEqual([
    ["@TestingKey1", "TestingValue1"],
    ["@TestingKey2", "TestingValue2"],
    ["@TestingKey3", "TestingValue3"],
  ]);
});

it("getObject: Given that database has objects it returns an object", async () => {
  const value = await getObject("key1");
  expect(value).toEqual({ name: "John" });
});

it("getMultipleObjects: Given that database has multiple objects stored, it returns multiple objects", async () => {
  const values = await getMultipleObjects(["key1", "key2", "key3"]);
  expect(values).toEqual([
    ["@key1", { name: "John" }],
    ["@key2", { name: "Jane" }],
    ["@key3", { name: "Jack" }],
  ]);
});

it("storeTrip: Given a trip object, it is stored in the async storage", async () => {
  const trip = {
    id: "8c60e264-e5c7-49b7-81cc-62c9ece128d1",
    sequenceNumber: 1,
    date: "2021-01-01",
    startTime: "12:00:00",
    endTime: "13:00:00",
    startLocation: "Auckland",
    endLocation: "Wellington",
    odometerStart: 100,
    odometerEnd: 200,
    distanceInKm: 100,
  };
  await storeTrip(trip);
  expect(AsyncStorage.setItem).toBeCalledWith("@trip#1", JSON.stringify(trip));
});

it("getTrip: Given a stored strip with sequence number 1, when querying the trip, return the trip", async () => {
  const resultTrip = await getTrip(1);
  expect(resultTrip).toEqual({
    id: "8c60e264-e5c7-49b7-81cc-62c9ece128d1",
    sequenceNumber: 1,
    date: "2021-01-01",
    startTime: "12:00:00",
    endTime: "13:00:00",
    startLocation: "Auckland",
    endLocation: "Wellington",
    odometerStart: 100,
    odometerEnd: 200,
    distanceInKm: 100,
  });
});

it("storeMultipleTrips: Given multiple trips, store them in async storage", async () => {
  const trips: Array<TripStoreEntry> = mockTrips;
  await storeMultipleTrips(trips);
  expect(AsyncStorage.multiSet).toBeCalled();
});

it("getMultipleTrips: Given multiple trips are stored in async storage, when querying them by sequence numbers, return the trips", async () => {
  const trips = [1, 2, 3, 4];
  const resultTrips = await getMultipleTrips(trips);
  expect(resultTrips).toEqual(
    mockTrips.map((trip) => [`@trip#${trip.sequenceNumber}`, trip])
  );
});

it("updateTrip: Given a trip is stored in async storage, when updating the trip, the trip is updated", async () => {
  const updatedTrip = await updateTrip({
    tripId: "8c60e264-e5c7-49b7-81cc-62c9ece128d1",
    sequenceNumber: 1,
    tripEndImageId: "8c60e264-e5c7-49b7-81cc-62c9ece128d2",
    tripStartImageId: "8c60e264-e5c7-49b7-81cc-62c9ece128d3",
    timeStarted: "12:00:00",
    timeEnded: "13:00:00",
    locationStart: "changed",
    locationEnd: "changed",
    odometerStart: 1000,
    odometerEnd: 2000,
    distanceInKm: 1000,
    lastModified: "2021-01-01",
  });
  expect(AsyncStorage.mergeItem).toBeCalled();
  expect(updatedTrip).toEqual({
    tripId: "8c60e264-e5c7-49b7-81cc-62c9ece128d1",
    sequenceNumber: 1,
    tripEndImageId: "8c60e264-e5c7-49b7-81cc-62c9ece128d2",
    tripStartImageId: "8c60e264-e5c7-49b7-81cc-62c9ece128d3",
    timeStarted: "12:00:00",
    timeEnded: "13:00:00",
    locationStart: "changed",
    locationEnd: "changed",
    odometerStart: 1000,
    odometerEnd: 2000,
    distanceInKm: 1000,
    lastModified: "2021-01-01",
  });
});

it("deleteTrip: Given an existing trip in a async storage, when calling deleteTrip with sequenceNumbers, remove the corresponding trip", async () => {
  await deleteTrip(1);
  const nonExistingTrip = await getTrip(1);
  expect(AsyncStorage.removeItem).toBeCalled();
  expect(nonExistingTrip).toBeNull();
});

it("deleteMultipleTrips: Given multiple trips are stored in async storage, when calling deleteMultipleTrips with sequenceNumbers, remove the corresponding trips", async () => {
  await deleteMultipleTrips([2, 3, 4]);
  const nonExistingTrip2 = await getTrip(2);
  const nonExistingTrip3 = await getTrip(3);
  expect(AsyncStorage.multiRemove).toBeCalled();
  expect(nonExistingTrip2).toBeNull();
  expect(nonExistingTrip3).toBeNull();
});
