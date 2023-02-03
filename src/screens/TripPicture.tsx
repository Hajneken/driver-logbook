import { Camera, CameraType } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import React, { useContext, useRef, useState } from "react";

import { Image, Text, View } from "react-native";
import {
  Button,
  FAB,
  IconButton,
  Snackbar,
  useTheme,
} from "react-native-paper";
import styled from "styled-components/native";
import { uploadImagesToAzureBlobStorage } from "../api/AzureStorage";
import { getOCRText } from "../api/OCR";
import CameraOverlay from "../components/CameraOverlay";
import ConnectionGuard from "../components/ConnectionGuard";
import InfoModal from "../components/InfoModal";
import { AppSettingsContext } from "../contexts/AppSettings";
import { TripContext } from "../contexts/TripContext";

/**
 * Component utilizing camera for Starting and Ending a Trip
 * Camera needs to be mounted before it can be used
 * missing an option to choose from media library is a design decision to avoid dealing with metadata forgery
 * Flow of the component:
 * 1. Camera is mounted
 * 2. User takes a picture
 * 3. Picture is sent to Azure for OCR
 * 4. User is redirected to TripConfirm screen with recognized values displayed
 */
export default function TripPictureScreen({ navigation }) {
  const theme = useTheme();
  // Global State of Trip Context
  const tripContext = useContext(TripContext);
  // Global State of App Settings Context
  const { isExperimentalMode, isDemoMode } = useContext(AppSettingsContext);

  // Local State
  const [cameraPermission, requestCameraPermission] =
    Camera.useCameraPermissions();
  const [requestPending, setRequestPending] = useState<boolean>(false);
  const [experimentalEndUnsuccessful, setExperimentalEndUnsuccessful] =
    useState<boolean>(false);

  const [snackbarVisible, setSnackbarVisible] = useState(true);
  const [capturedPhoto, setCapturedPhoto] =
    useState<ImageManipulator.ImageResult | null>(null);

  const onDismissSnackBar = () => setSnackbarVisible(false);
  const cameraRef = useRef<Camera>(null);

  const CameraFrame = styled.View`
    position: absolute;
    left: 25%;
    top: 25%;
    background-color: transparent;
    border-radius: 12px;
    height: 12%;
    width: 50%;
  `;

  const CroppedImage = styled(Image)`
    width: 100%;
    height: 100%;
  `;

  /**
   * Use camera to make a snapshot, process it by cropping and compressing it
   * When done request current location
   */
  const takePicture = async () => {
    const picture = await cameraRef.current
      .takePictureAsync()
      .then((res) => {
        return res;
      })
      .catch((err) => console.log("error while taking the picture", err));

    const croppedPicture = await manipulateAsync(
      picture.uri,
      [
        {
          crop: {
            originX: picture.width * 0.25,
            originY: picture.height * 0.25,
            width: picture.width * 0.5,
            height: picture.height * 0.12,
          },
        },
      ],
      {
        compress: 0.75,
        format: SaveFormat.JPEG,
      }
    );
    setCapturedPhoto(croppedPicture);
  };

  /**
   * Retrieve the recognize value from Microsoft OCR API and
   * Upload processed image to the blob storage
   * Update the Global Context with the image ID
   * @returns
   */
  const handleAPICalls = async (): Promise<Array<string> | null> => {
    if (isDemoMode && !isExperimentalMode) {
      console.log("Handling Demo Mode API calls (mocking) ...");

      if (tripContext.tripInProgress) {
        tripContext.setTripEndImageId("demoOdometer");
        return null;
      }
      tripContext.setTripStartImageId("demoOdometer");
      return null;
    }

    console.log("Handling API calls ...");

    if (capturedPhoto !== null) {
      const OCRresult = await getOCRText(capturedPhoto.uri);
      tripContext.setOcrResult(OCRresult);
      // setExperimentalOCRValue(OCRresult);
      const imageID = await uploadImagesToAzureBlobStorage(
        capturedPhoto.uri,
        `${new Date().getTime()}}`
      );
      if (tripContext.tripInProgress) {
        tripContext.setTripEndImageId(imageID);
        return OCRresult;
      }
      tripContext.setTripStartImageId(imageID);
      return OCRresult;
    }
    return null;
  };

  const proceedToTripInProgress = () => {
    setRequestPending(false);
    navigation.navigate("TripInProgress");
  };

  const proceedToTripSummary = () => {
    setRequestPending(false);
    navigation.navigate("TripSummary");
  };

  const proceedToTripConfirm = () => {
    setRequestPending(false);
    navigation.navigate("TripConfirm");
  };

  /**
   * checks if the trip is in progress, if so, ends the trip otherwise starts a new one
   */
  const handleTripStart = async () => {
    setRequestPending(true);
    const OCRResults = await handleAPICalls();
    await tripContext.requestLocation();

    if (isExperimentalMode) {
      handleTripExperimental(OCRResults);
      return;
    }

    proceedToTripConfirm();
  };

  const handleTripExperimental = async (OCRResults: Array<string> | null) => {
    if (tripContext.timeStarted === null) {
      if (OCRResults === null || OCRResults.length === 0) {
        await startTripExperimental(0);
        return;
      }
      await startTripExperimental(Number(OCRResults[0]));
      return;
    }

    // ending trip
    if (OCRResults === null) {
      console.log("Unable to recognize any odometer value.");
      setRequestPending(false);
      setExperimentalEndUnsuccessful(true);
      setSnackbarVisible(true);
      return;
    }
    await endTripExperimental(Number(OCRResults[0]));
  };

  /**
   * Experimental trip start does not require the user to confirm the values, but automatically assumes recognized value to be true, or takes the previous odometer value if no value was recognized or recognized value is invalid
   * 1. check if the the trip is successfully started using recognized data
   * 2. if not, check if the trip is successfully started using the latest trip end odometer value
   * 3. if not, start the trip with odometer value 0
   * @returns
   */
  async function startTripExperimental(
    OCRResultExperimental: number
  ): Promise<void> {
    const odometerEndFromLatestTrip =
      await tripContext.getLastTripEndOdometerValue();

    if (await tripContext.startTrip(OCRResultExperimental)) {
      proceedToTripInProgress();
      return;
    }

    if (odometerEndFromLatestTrip === null) {
      tripContext.startTrip(0);
      proceedToTripInProgress();
      return;
    }

    if (await tripContext.startTrip(Number(odometerEndFromLatestTrip))) {
      proceedToTripInProgress();
      return;
    }

    await tripContext.startTrip(0);
    proceedToTripInProgress();
  }

  /**
   * Experimental trip end does not require the user to confirm the values, but automatically assumes recognized value to be true, or takes the previous odometer value if no value was recognized or recognized value is invalid
   */
  async function endTripExperimental(
    OCRResultExperimental: number
  ): Promise<void> {
    if (await tripContext.endTrip(OCRResultExperimental)) {
      proceedToTripSummary();
      return;
    }

    setExperimentalEndUnsuccessful(true);
    setSnackbarVisible(true);
    setRequestPending(false);
  }

  if (!cameraPermission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!cameraPermission.granted) {
    // Camera permissions are not granted yet
    return (
      <TripPictureContainer>
        <Text style={{ textAlign: "center" }}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestCameraPermission} title="Grant Permission" />
      </TripPictureContainer>
    );
  }

  if (capturedPhoto === null) {
    return (
      <TripPictureContainer>
        <Camera
          autoFocus={true}
          style={{ flex: 1 }}
          type={CameraType.back}
          ref={cameraRef}
        >
          <Container>
            <CameraOverlay></CameraOverlay>
            <CameraFrame isSnapped={false}></CameraFrame>
            <CameraTrigger
              icon="camera"
              onPress={() => {
                takePicture();
              }}
            ></CameraTrigger>
          </Container>
        </Camera>
        <Helper
          mode="contained"
          icon="help-circle"
          color={theme.colors.accent}
          size={40}
          onPress={() => setSnackbarVisible(true)}
        />
        <CustomSnackBar
          visible={snackbarVisible}
          onDismiss={onDismissSnackBar}
          action={{
            label: "Dismiss",
            onPress: () => {
              setSnackbarVisible(false);
            },
          }}
        >
          {experimentalEndUnsuccessful
            ? `Recognized value is invalid, please take another image.`
            : `Take an image of the dashboard. Make sure pedometer is clearly visible in the frame above.`}
        </CustomSnackBar>
      </TripPictureContainer>
    );
  }

  if (capturedPhoto !== null) {
    return (
      <TripPictureContainer>
        <ConnectionGuard />
        <ImagePreview>
          <CameraFrame isSnapped={true}>
            <CroppedImage source={{ uri: capturedPhoto.uri }} />
          </CameraFrame>
          <OptionsContainer>
            <FAB
              label="Retake"
              icon="repeat"
              onPress={() => setCapturedPhoto(null)}
              size="large"
              variant="outlined"
            ></FAB>
            <FAB
              style={{ backgroundColor: theme.colors.primary }}
              label="USE"
              icon="check-decagram"
              onPress={handleTripStart}
            ></FAB>
          </OptionsContainer>
        </ImagePreview>
        <CustomSnackBar
          visible={snackbarVisible}
          onDismiss={onDismissSnackBar}
          action={{
            label: "Dismiss",
            onPress: () => {
              setSnackbarVisible(false);
            },
          }}
        >
          {experimentalEndUnsuccessful
            ? `Recognized value is invalid, please take another image.`
            : `Take an image of the dashboard. Make sure pedometer is clearly visible in the frame above.`}
        </CustomSnackBar>
        <InfoModal modalIsVisible={requestPending}></InfoModal>
      </TripPictureContainer>
    );
  }
}

const ImagePreview = styled(View)`
  flex: 1;
  background: #2e2e2e;
`;

const OptionsContainer = styled(View)`
  width: 100%;
  position: absolute;
  left: 0;
  bottom: 0;
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-bottom: 40px;
`;

const Helper = styled(IconButton)`
  z-index: 100;
  position: absolute;
  bottom: 0;
  right: 0;
`;

const CustomSnackBar = styled(Snackbar)`
  margin-bottom: 105px;
`;

const CameraTrigger = styled(FAB)`
  border: 2px solid #ffffffe5;
  margin-bottom: 40px;
  align-self: flex-end;
`;

const Container = styled.View`
  flex: 1;
  flex-direction: row;
  justify-content: center;
  background-color: transparent;
`;

const TripPictureContainer = styled(View)`
  flex: 1;
  justify-content: center;
`;
