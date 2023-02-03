import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import { useContext, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Avatar,
  Button,
  Card,
  IconButton,
  List,
  Modal,
  Portal,
  Snackbar,
  TextInput,
  Title,
} from "react-native-paper";
import { Layout, Scrollable } from "../components/Layout/Layout";
import NotFound from "../components/static/NotFound";
import UpdateDialog from "../components/UpdateDialog";
import { AppSettingsContext } from "../contexts/AppSettings";
import { SavedPlace, UserContext } from "../contexts/UserContext";
import { mockSavedPlaces } from "../model/mocks";

export default function Places(params) {
  // Global State
  const userContext = useContext(UserContext);
  const appSettingsContext = useContext(AppSettingsContext);
  //   local state
  const [loading, setLoading] = useState<boolean>(false);
  const [places, setPlaces] = useState<null | Array<SavedPlace>>(null);
  const [updateDialogVisible, setUpdateDialogVisible] = useState(false);
  //   add new place modal
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [nameValue, setNameValue] = useState<string>("");
  const [addressValue, setAddressValue] = useState<string>("");
  const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>(
    "Value has been rejected, please try again"
  );
  const [updatedDialogValue, setUpdatedDialogValue] = useState({
    icon: "pencil",
    label: "Warmup",
    currentValue: "warmup current",
    updateCallback: () =>
      console.log("NO UPDATE CALLBACK PROVIDED, UPDATE UNSUCCESSFUL!"),
  });

  const hideModal = () => setModalOpen(false);

  useEffect(() => {
    refresh();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      refresh();
      return () => {};
    }, [])
  );

  /**
   * refreshes the places list from DB
   */
  async function refresh() {
    setLoading(true);
    const refreshedPlaceList = await userContext.getSavedPlaces();
    console.log("refreshedPlaceList", refreshedPlaceList);
    setPlaces(refreshedPlaceList);
    setLoading(false);
  }

  function recognizeIcon(icon: string) {
    const processedIcon = icon.toLowerCase();
    switch (processedIcon) {
      case "school":
        return "school";
      case "work":
        return "briefcase";
      case "gym":
        return "dumbbell";
      case "home":
        return "home";
      default:
        return "map-marker";
    }
  }

  const containerStyle = { backgroundColor: "white", padding: 20 };

  async function handleSaveNewPlace() {
    console.log("Attempting to save a new place");
    if (places?.find((place) => place.name === nameValue)) {
      setSnackbarMessage(
        "A place with this name already exists, please use another name"
      );
      setSnackbarVisible(true);
      return;
    }

    if (
      await userContext.addSavedPlace({
        name: nameValue,
        address: addressValue,
      })
    ) {
      setModalOpen(false);
      setNameValue("");
      setAddressValue("");
      refresh();
    }
  }

  return (
    <>
      <Layout style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 0 }}>
        <Scrollable>
          <Card style={{ marginTop: 10, marginBottom: 40 }}>
            <Card.Title title={"Saved Places"} />
            {places !== null && loading === false
              ? places.map((place) => (
                  <List.Item
                    key={`${place.name}-${place.address}`}
                    title={place.name}
                    description={place.address}
                    left={(props) => (
                      <List.Icon
                        {...props}
                        icon={recognizeIcon(place.name)}
                        right={() => console.log(place.address)}
                      />
                    )}
                    right={() => (
                      <IconButton
                        onPress={() => {
                          setUpdateDialogVisible(true);
                          setUpdatedDialogValue({
                            icon: recognizeIcon(place.name),
                            title: place.name,
                            currentValue: place.address,
                            updateCallback: async (
                              updatedSavedPlaceAddress: string
                            ): Promise<boolean> => {
                              const successfulUpdate =
                                await userContext.updateSavedPlace(
                                  place.name,
                                  updatedSavedPlaceAddress
                                );
                              refresh();
                              return successfulUpdate;
                            },
                            component: { type: "string" },
                            delete: {
                              deleteButton: true,
                              deleteCallback: async () => {
                                await userContext.removeSavedPlace(place.name);
                                await refresh();
                                setUpdateDialogVisible(false);
                              },
                            },
                          });
                        }}
                        icon={"pencil"}
                      />
                    )}
                  />
                ))
              : null}
            {places === null && loading === false ? <NotFound /> : null}
            {loading ? <ActivityIndicator animating={true} /> : null}
            <Button
              style={{ margin: 10 }}
              mode="contained"
              onPress={() => {
                setModalOpen(true);
              }}
            >
              Add Place
            </Button>
          </Card>
        </Scrollable>
      </Layout>
      <UpdateDialog
        open={updateDialogVisible}
        setOpen={setUpdateDialogVisible}
        options={updatedDialogValue}
      />
      <Portal>
        <Modal
          visible={modalOpen}
          onDismiss={hideModal}
          contentContainerStyle={containerStyle}
        >
          <Scrollable>
            <IconButton
              style={{ marginLeft: "auto" }}
              icon="close"
              onPress={hideModal}
            />
            <Avatar.Icon
              style={{ marginLeft: "auto", marginRight: "auto" }}
              icon={"star"}
            />
            <Title style={{ textAlign: "center", marginBottom: 10 }}>
              Add a New Place
            </Title>

            <TextInput
              style={{ marginBottom: 10 }}
              label="name"
              value={nameValue}
              onChangeText={(newValue) => setNameValue(newValue)}
            />
            <TextInput
              label="address"
              value={addressValue}
              onChangeText={(newValue) => setAddressValue(newValue)}
            />
            <Button
              style={{ marginTop: 10 }}
              mode="contained"
              onPress={handleSaveNewPlace}
              disabled={nameValue === "" || addressValue === ""}
            >
              SAVE
            </Button>
          </Scrollable>
        </Modal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          action={{
            label: "Close",
            onPress: () => {
              setSnackbarVisible(false);
            },
          }}
        >
          {snackbarMessage}
        </Snackbar>
      </Portal>
    </>
  );
}
