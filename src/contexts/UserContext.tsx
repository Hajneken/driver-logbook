import { createContext, useState } from "react";
import { getValue, storeValue, updateValue } from "../model/store";

export interface SavedPlace {
  name: string;
  address: string;
}

interface UserContextInterface {
  isSignedIn: boolean;
  setIsSignedIn: (isSignedIn: boolean) => void;
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  vehicle: string;
  setVehicle: (vehicle: string) => void;
  licensePlate: string;
  setLicensePlate: (licensePlate: string) => void;
  kmUntilService: number;
  setKmUntilService: (kmUntilService: number) => void;
  kmUntilOilChange: number;
  setKmUntilOilChange: (kmUntilOilChange: number) => void;
  vigneteUntil: Date;
  setVigneteUntil: (vigneteUntil: Date) => void;
  currentTireType: "summer" | "winter";
  setCurrentTireType: (currentTireType: "summer" | "winter") => void;
  resetUserContext: () => void;
  updateName: (name: string) => Promise<boolean>;
  updateEmail: (email: string) => Promise<boolean>;
  updateVehicle: (vehicle: string) => Promise<boolean>;
  updateLicensePlate: (licensePlate: string) => Promise<boolean>;
  updateKmUntilService: (kmUntilService: number) => Promise<boolean>;
  updateKmUntilOilChange: (kmUntilOilChange: number) => Promise<boolean>;
  updateVigneteUntil: (vigneteUntil: Date) => Promise<boolean>;
  updateCurrentTireType: (
    currentTireType: "summer" | "winter"
  ) => Promise<void>;
  updateSavedPlace: (
    name: string,
    newSavedPlaceValue: string
  ) => Promise<boolean>;
  addSavedPlace: (newSavedPlace: SavedPlace) => Promise<boolean>;
  addMultipleSavedPlaces: (newSavedPlaces: SavedPlace[]) => Promise<boolean>;
  getSavedPlaces: () => Promise<SavedPlace[] | null>;
  removeSavedPlace: (name: string) => Promise<boolean>;
  getSavedPlacesNames: () => Promise<string[]>;
}

// Creating Authentication Context: for details see https://stackoverflow.com/questions/41030361/how-to-update-react-context-from-inside-a-child-component
export const UserContext = createContext<UserContextInterface>({
  isSignedIn: false,
  setIsSignedIn: (isSignedIn: boolean) => {},
  name: "Default User",
  setName: (name: string) => {},
  email: "exampleexample.com",
  setEmail: (email: string) => {},
  vehicle: "Default Vehicle",
  setVehicle: (vehicle: string) => {},
  licensePlate: "Default License Plate",
  setLicensePlate: (licensePlate: string) => {},
  kmUntilService: 10000,
  setKmUntilService: (kmUntilService: number) => {},
  kmUntilOilChange: 5000,
  setKmUntilOilChange: (kmUntilOilChange: number) => {},
  vigneteUntil: new Date(),
  setVigneteUntil: (vigneteUntil: Date) => {},
  currentTireType: "winter",
  setCurrentTireType: (currentTireType: "summer" | "winter") => {},
  resetUserContext: () => {},
  updateName: (name: string) => new Promise(() => {}),
  updateEmail: (email: string) => new Promise(() => {}),
  updateVehicle: (vehicle: string) => new Promise(() => {}),
  updateLicensePlate: (licensePlate: string) => new Promise(() => {}),
  updateKmUntilService: (kmUntilService: number) => new Promise(() => {}),
  updateKmUntilOilChange: (kmUntilOilChange: number) => new Promise(() => {}),
  updateVigneteUntil: (vigneteUntil: Date) => new Promise(() => {}),
  addSavedPlace: (newSavedPlace: SavedPlace) => new Promise(() => {}),
  updateCurrentTireType: (currentTireType: "summer" | "winter") =>
    new Promise(() => {}),
  updateSavedPlace: (name: string, newSavedPlaceValue: string) =>
    new Promise(() => {}),
  addMultipleSavedPlaces: (newSavedPlaces: SavedPlace[]) =>
    new Promise(() => {}),
  getSavedPlaces: () => new Promise(() => {}),
  removeSavedPlace: (name: string) => new Promise(() => {}),
  getSavedPlacesNames: () => new Promise(() => null),
});

/**
 * Component for Managing User State
 **/
export function UserContextProvider({ children }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [name, setName] = useState<string>("Muster User");
  const [email, setEmail] = useState<string>("exampleemail.com");
  const [vehicle, setVehicle] = useState<string>("Toyota corola");
  const [licensePlate, setLicensePlate] = useState<string>("5C3 1111");
  const [kmUntilService, setKmUntilService] = useState<Number>(1234);
  const [kmUntilOilChange, setKmUntilOilChange] = useState<Number>(1234);
  const [vigneteUntil, setVigneteUntil] = useState<Date>(
    new Date("2023-01-31T00:00:00")
  );
  const [currentTireType, setCurrentTireType] = useState("winter");

  /**
   * Resets the User Context to default values
   */
  function resetUserContext() {
    setIsSignedIn(false);
    setName("Default User");
    setEmail("exampleemail.com");
    setVehicle("Default Vehicle");
    setLicensePlate("Default License Plate");
    setKmUntilService(1234);
    setKmUntilOilChange(1234);
    setVigneteUntil(new Date("2023-01-31T00:00:00"));
    setCurrentTireType("winter");
  }

  async function getSavedPlaces(): Promise<Array<SavedPlace> | null> {
    const savedPlaces = await getValue("savedPlaces");
    if (savedPlaces === null) {
      return null;
    }
    const parsedSavedPlaces = JSON.parse(savedPlaces);
    return parsedSavedPlaces;
  }

  async function getSavedPlacesNames(): Promise<Array<string> | null> {
    const savedPlaces = await getSavedPlaces();
    if (savedPlaces === null) {
      return null;
    }
    const savedPlacesNames = savedPlaces.map((place) => place.name);
    return savedPlacesNames;
  }

  async function addSavedPlace(place: SavedPlace): Promise<boolean> {
    const savedPlaces = await getValue("savedPlaces");
    if (savedPlaces === null) {
      await storeValue("savedPlaces", JSON.stringify([place]));
      return true;
    }
    const parsedSavedPlaces = JSON.parse(savedPlaces);
    const updatedSavedPlaces = [...parsedSavedPlaces, place];
    await storeValue("savedPlaces", JSON.stringify(updatedSavedPlaces));

    return true;
  }

  async function addMultipleSavedPlaces(
    places: Array<SavedPlace>
  ): Promise<boolean> {
    const savedPlaces = await getValue("savedPlaces");
    if (savedPlaces === null) {
      await storeValue("savedPlaces", JSON.stringify(places));
      return true;
    }
    const parsedSavedPlaces = JSON.parse(savedPlaces);
    const updatedSavedPlaces = [...parsedSavedPlaces, ...places];
    await storeValue("savedPlaces", JSON.stringify(updatedSavedPlaces));

    return true;
  }

  async function removeSavedPlace(name: string): Promise<boolean> {
    console.log("Attempting to remove saved place:", name);
    const savedPlaces = await getValue("savedPlaces");
    if (savedPlaces === null) return false;

    const parsedPlaces = JSON.parse(savedPlaces);
    const filteredPlaces = parsedPlaces.filter((place) => place.name !== name);
    await storeValue("savedPlaces", JSON.stringify(filteredPlaces));

    return true;
  }

  async function updateSavedPlace(
    name: string,
    newAddress: string
  ): Promise<boolean> {
    const savedPlaces = await getValue("savedPlaces");
    if (savedPlaces === null) return false;

    const parsedPlaces = JSON.parse(savedPlaces);

    parsedPlaces.forEach((place: SavedPlace) => {
      if (place.name === name) {
        place.address = newAddress;
      }
    });
    console.log("updatedPlaces", parsedPlaces);

    await storeValue("savedPlaces", JSON.stringify(parsedPlaces));

    return true;
  }

  async function updateName(name: string): Promise<boolean> {
    setName(name);
    await storeValue("name", name);
    return true;
  }

  async function updateEmail(email: string): Promise<boolean> {
    setEmail(email);
    await storeValue("email", email);
    return true;
  }

  async function updateVehicle(vehicle: string): Promise<boolean> {
    setVehicle(vehicle);
    await storeValue("vehicle", vehicle);
    return true;
  }

  async function updateLicensePlate(licensePlate: string): Promise<boolean> {
    setLicensePlate(licensePlate);
    await storeValue("licensePlate", licensePlate);
    return true;
  }

  async function updateKmUntilService(
    kmUntilService: number
  ): Promise<boolean> {
    setKmUntilService(kmUntilService);
    await storeValue("kmUntilService", `${kmUntilService}`);
    return true;
  }

  async function updateKmUntilOilChange(
    kmUntilOilChange: number
  ): Promise<boolean> {
    setKmUntilOilChange(kmUntilOilChange);
    await storeValue("kmUntilOilChange", `${kmUntilOilChange}`);
    return true;
  }

  async function updateVigneteUntil(vigneteUntil: Date): Promise<boolean> {
    setVigneteUntil(vigneteUntil);
    await storeValue("vigneteUntil", vigneteUntil.toISOString().split("T")[0]);
    return true;
  }

  async function updateCurrentTireType(
    currentTireType: "summer" | "winter"
  ): Promise<boolean> {
    setCurrentTireType(currentTireType);
    await storeValue("currentTireType", currentTireType);
    return true;
  }

  const value = {
    isSignedIn,
    setIsSignedIn,
    name,
    setName,
    email,
    setEmail,
    vehicle,
    setVehicle,
    licensePlate,
    setLicensePlate,
    kmUntilService,
    setKmUntilService,
    kmUntilOilChange,
    setKmUntilOilChange,
    vigneteUntil,
    setVigneteUntil,
    currentTireType,
    setCurrentTireType,
    getSavedPlaces,
    getSavedPlacesNames,
    addSavedPlace,
    addMultipleSavedPlaces,
    removeSavedPlace,
    updateSavedPlace,
    resetUserContext,
    updateName,
    updateEmail,
    updateVehicle,
    updateLicensePlate,
    updateKmUntilService,
    updateKmUntilOilChange,
    updateVigneteUntil,
    updateCurrentTireType,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
