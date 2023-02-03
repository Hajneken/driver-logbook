import AsyncStorage from "@react-native-async-storage/async-storage";
import { TripStoreEntry } from "../contexts/TripContext";

export async function restoreAsyncStorageFromJSON(jsonString: string) {
  try {
    console.log("Attempting to restore data from given JSON");
    JSON.parse(jsonString).forEach(async (el: any) => {
      await AsyncStorage.setItem(el[0], el[1]);
    });
  } catch (e) {
    console.log("Error while restoring data", e);
  }
}

/**
 * Removes all values in the async storage
 * @returns
 */
export async function purgeAsyncStorage() {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.log("Error while purging async storage", error);
    return null;
  }
}

/**
 * Stores a simple string value to the async storage
 * @param key
 * @param value
 */
export async function storeValue(key: string, value: string) {
  try {
    console.log(`Storing @${key} with value ${value}`);
    AsyncStorage.setItem(`@${key}`, value);
  } catch (e) {
    console.log("Error while persisting data", e);
  }
}

/**
 * Updates a string value to the async storage based on the key
 * @param key
 * @param value
 */
export async function updateValue(key: string, value: string) {
  try {
    await AsyncStorage.mergeItem(`@${key}`, value);
    const updatedValue = await getObject(key);
    return updatedValue;
  } catch (e) {
    console.log("Error while updating data", e);
  }
}

/**
 * Delete a value from the async storage based on the key
 * @param key
 */
export async function deleteValue(key: string) {
  try {
    await AsyncStorage.removeItem(`@${key}`);
  } catch (e) {
    console.log("Error while deleting data", e);
  }
}

export async function deleteMultipleValues(keys: string[]) {
  try {
    await AsyncStorage.multiRemove(keys.map((el) => `@${el}`));
  } catch (e) {
    console.log("Error while deleting data", e);
  }
}

/**
 * Updates an object value to the async storage based on the key
 * @param key
 * @param value
 */
export async function updateObject(key: string, value: Object) {
  try {
    await AsyncStorage.mergeItem(`@${key}`, JSON.stringify(value));
    const updatedObject = await getObject(key);
    return updatedObject;
  } catch (e) {
    console.log("Error while updating data", e);
  }
}

/**
 * Stores Multiple String values to the async storage
 * @param values Array of key value pairs
 * @returns
 */
export async function storeMultipleValues(
  keyValueArrays: Array<[string, string]>
) {
  try {
    await AsyncStorage.multiSet(
      keyValueArrays.map((el) => [`@${el[0]}`, el[1]])
    );
  } catch (e) {
    console.log("Error while persisting multiple values", e);
    return null;
  }
}

/**
 * Stores objects that are stringified before being stored in async storage
 * @param objects Array of key value pairs
 * @returns
 */
export async function storeMultipleObjects(
  objects: Array<[key: string, value: Object]>
) {
  try {
    await AsyncStorage.multiSet(
      objects.map((el) => [`@${el[0]}`, JSON.stringify(el[1])])
    );
  } catch (e) {
    console.log("Error while persisting multiple objects", e);
    return null;
  }
}

/**
 * Retrieves a value from the async storage based on the key
 * @param key
 * @returns
 */
export async function getValue(key: string): Promise<string | null> {
  try {
    const value = await AsyncStorage.getItem(`@${key}`);
    return value;
  } catch (e) {
    console.log("Error while retrieving data", e);
    return null;
  }
}

/**
 * Retrieves multiple values from the async storage based on the array of keys
 * @param keys
 * @returns
 */
export async function getMultipleValues(keys: string[]) {
  try {
    const values = await AsyncStorage.multiGet(keys.map((el) => `@${el}`));
    return values;
  } catch (e) {
    console.log("Error while retrieving data", e);
    return null;
  }
}

/**
 * Stores an object in the async storage as stringified JSON
 *
 * @param key
 * @param value
 * @returns
 */
export async function storeObject(key: string, value: Object) {
  try {
    await AsyncStorage.setItem(`@${key}`, JSON.stringify(value));
  } catch (e) {
    console.log("Error while persisting data", e);
    return null;
  }
}

/**
 * Retrieves an object from the async storage based on the key
 * @param key
 * @returns
 */
export async function getObject(key: string) {
  try {
    const jsonValue = await AsyncStorage.getItem(`@${key}`);
    return jsonValue !== null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.log("Error while retrieving data", e);
    return null;
  }
}

/**
 * Retrieves multiple objects from the async storage based on the array of keys
 * @param keys
 * @returns
 */
export async function getMultipleObjects(
  keys: string[]
): Promise<Array<[string, Object]> | null> {
  try {
    const jsonValues = await AsyncStorage.multiGet(
      keys.map((key) => `@${key}`)
    );
    return jsonValues !== null
      ? jsonValues.map((el) => [el[0], JSON.parse(el[1])])
      : null;
  } catch (e) {
    console.log("Error while retrieving multiple objects", e);
    return null;
  }
}

/**
 * Dumps contents of async storage to console
 * @returns
 */
export async function printAllValues() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const items = await AsyncStorage.multiGet(keys);
    console.log("DUMP of the Async Storage Contents:");
    items.forEach((item) => {
      const key = item[0];
      const value = item[1];
      console.log("\nKey: ", key, "Value: ", value);
    });
  } catch (e) {
    console.log("Error while retrieving data", e);
    return null;
  }
}

/**
 * Retrieves all keys from the async storage, useful for checking if database has any contents
 * @returns
 */
export async function getAllKeys() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    return keys;
  } catch (e) {
    console.log("Error while retrieving data", e);
    return null;
  }
}

export async function getAllValues() {
  try {
    const keys = await getAllKeys();
    if (keys === null) {
      return null;
    }
    // const values = await getMultipleValues(keys);
    const values = await AsyncStorage.multiGet(keys);
    return values;
  } catch (e) {
    console.log("Error while retrieving data", e);
    return null;
  }
}

/**
 * Checks if the async storage has any contents
 * @returns
 */
export async function hasContents() {
  const keys = await getAllKeys();
  if (keys === null) {
    return false;
  }
  return keys.length > 0;
}

/*
 Concrete Implementation for the Trip Model
 ==========================================
 */

export async function storeTrip(trip: TripStoreEntry) {
  try {
    await storeObject(`trip#${trip.sequenceNumber}`, trip);
  } catch (e) {
    console.log("Error while storing trip", e);
  }
}

/**
 * Obtain a specific trip by a sequence number
 * @param sequenceNumber
 * @returns
 */
export async function getTrip(
  sequenceNumber: number
): Promise<TripStoreEntry | null> {
  try {
    const trip = await getObject(`trip#${sequenceNumber}`);
    return trip;
  } catch (e) {
    console.log("Error while retrieving trip", e);
    return null;
  }
}

export async function storeMultipleTrips(trips: TripStoreEntry[]) {
  try {
    await storeMultipleObjects(
      trips.map((trip) => [`trip#${trip.sequenceNumber}`, trip])
    );
  } catch (e) {
    console.log("Error while storing multiple trips", e);
  }
}

export async function getMultipleTrips(
  sequenceNumbers: number[]
): Promise<Array<[string, TripStoreEntry]> | null> {
  try {
    const trips = await getMultipleObjects(
      sequenceNumbers.map((el) => `trip#${el}`)
    );
    return trips;
  } catch (e) {
    console.log("Error while retrieving multiple trips", e);
    return null;
  }
}

export async function getAllTrips(): Promise<Array<
  [string, TripStoreEntry]
> | null> {
  try {
    console.log("Latest Trip Number: ", latestTrip);
    if (latestTrip === null || latestTrip === "-1") {
      return [];
    }
    const latestTripNumber = parseInt(latestTrip, 10);

    const tripNumbers: Array<number> = Array(latestTripNumber)
      .fill()
      .map((_, i) => latestTripNumber - i);
    const trips = await getMultipleTrips(tripNumbers);
    return trips;
  } catch (e) {
    console.log("Error while retrieving latest trip", e);
    return null;
  }
}

/**
 * Merges objects of 2 trips, useful for partial update
 * @param trip
 * @returns
 */
export async function updateTrip(trip: TripStoreEntry) {
  try {
    const updatedTrip = await updateObject(`trip#${trip.sequenceNumber}`, trip);
    return updatedTrip;
  } catch (error) {
    console.log("Error while updating trip", error);
  }
}

/**
 * Replaces the contents of an existing trip, useful for full update
 * @param trip
 * @returns
 */
export async function overwriteTrip(trip: TripStoreEntry) {
  try {
    const overwrittenTrip = await storeTrip(trip);
    return overwrittenTrip;
  } catch (error) {
    console.log("Error while overwriting trip", error);
  }
}

export async function deleteTrip(trip: TripStoreEntry | number) {
  try {
    if (typeof trip === "number") {
      await deleteValue(`trip#${trip}`);
      return;
    }
    await deleteValue(`trip#${trip.sequenceNumber}`);
  } catch (error) {
    console.log("Error while deleting trip", error);
    return null;
  }
}

export async function deleteMultipleTrips(trips: TripStoreEntry[] | number[]) {
  try {
    if (typeof trips[0] === "number") {
      await deleteMultipleValues(trips.map((trip) => `trip#${trip}`));
      return;
    }
    await deleteMultipleValues(
      trips.map((trip) => `trip#${trip.sequenceNumber}`)
    );
  } catch (error) {
    console.log("Error while deleting multiple trips", error);
    return null;
  }
}

export const transformLocation = (location: object | string | null): string => {
  if (location === null) {
    return "No location";
  }
  if (typeof location === "string") {
    return location;
  }

  return `${location.address[0].street}, ${location.address[0].city}`;
};
