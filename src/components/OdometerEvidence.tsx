import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

import React, { useEffect } from "react";
import { Image, View } from "react-native";
import {
  ActivityIndicator,
  IconButton,
  Modal,
  Portal,
  Snackbar,
  Text,
  Title,
} from "react-native-paper";
import { BlobStorageURL } from "../api/AzureStorage";

export default function OdometerEvidence({
  modalIsVisible,
  modalDismissed,
  odometerImageIdStart,
  odometerImageIdEnd,
}: {
  modalIsVisible: boolean;
  modalDismissed: (dismissed: boolean) => void;
  odometerImageIdStart: string | null;
  odometerImageIdEnd: string | null;
}) {
  useEffect(() => {
    // On Request, show the modal
    if (modalIsVisible) {
      showModal();
    } else {
      hideModal();
    }
  }, [modalIsVisible]);

  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  const [snackVisible, setSnackVisible] = React.useState(false);

  const onDismissSnackBar = () => setSnackVisible(false);

  const [visible, setVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => {
    setVisible(false);
    modalDismissed(true);
  };

  async function downloadImage(imageId: string): Promise<string> {
    try {
      const URL = `${BlobStorageURL}/${imageId}.jpg`;
      console.log("Attempting to download resource from: ", URL);
      const downloadedImage = await FileSystem.downloadAsync(
        URL,
        `${FileSystem.documentDirectory}${imageId}.jpg`
      );
      console.log("Downloaded image:", downloadedImage.uri);
      return downloadedImage.uri;
    } catch (e) {
      console.log("Error while downloading image:", e);
    }
    return "";
  }

  async function saveImage(imageId: string = "demoOdometer") {
    setLoading(true);
    // get permission status
    if (permissionResponse?.granted === false) {
      console.log("Requesting permission");
      await requestPermission();
    }
    if (permissionResponse?.granted) {
      const imageUri = await downloadImage(imageId);
      if (imageUri === "") {
        console.log("Image does not exist");
        setLoading(true);
        return;
      }
      MediaLibrary.saveToLibraryAsync(imageUri);
    }
    setLoading(false);
    setSnackVisible(true);
  }

  return (
    <>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={{
            backgroundColor: "white",
            padding: 20,
          }}
        >
          <IconButton
            style={{ marginLeft: "auto" }}
            icon="close"
            onPress={hideModal}
          />
          <View style={{ width: `100%` }}>
            <Title>Odometer at the start</Title>
            <Image
              source={{ uri: `${BlobStorageURL}/${odometerImageIdStart}.jpg` }}
              style={{ width: `100%`, height: 150 }}
              resizeMode="contain"
            />
            {loading ? (
              <>
                <Text>Downloading image...</Text>
                <ActivityIndicator animating={true} />
              </>
            ) : (
              <IconButton
                style={{ marginLeft: "auto" }}
                icon={"download"}
                onPress={() => saveImage(odometerImageIdStart)}
              />
            )}
            <Title>Odometer at the end</Title>
            {loading ? (
              <>
                <Text>Downloading image...</Text>
                <ActivityIndicator animating={true} />
              </>
            ) : (
              <Image
                source={{ uri: `${BlobStorageURL}/${odometerImageIdEnd}.jpg` }}
                style={{ width: `100%`, height: 150 }}
                resizeMode="contain"
              />
            )}

            <IconButton
              style={{ marginLeft: "auto" }}
              icon={"download"}
              onPress={() => saveImage(odometerImageIdEnd)}
            />
            {loading ? <ActivityIndicator animating={true} /> : null}
          </View>
        </Modal>
        <Snackbar
          visible={snackVisible}
          onDismiss={onDismissSnackBar}
          action={{
            label: "Dismiss",
            onPress: () => {
              setSnackVisible(false);
            },
          }}
        >
          Picture successfully saved to your gallery.
        </Snackbar>
      </Portal>
    </>
  );
}
