import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { parse } from "json2csv";
import { useState } from "react";
import {
  Avatar,
  Button,
  Divider,
  IconButton,
  Modal,
  Portal,
  Snackbar,
  Title,
} from "react-native-paper";
import { getAllTrips, getAllValues } from "../model/store";
import InfoModal from "./InfoModal";
import styled from "styled-components/native";

export default function ShareDialog(params) {
  const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [requestPending, setRequestPending] = useState<boolean>(false);

  async function preprocessData() {
    const trips = await getAllTrips();
    if (trips === null) {
      console.log("No trips to export");
      setSnackbarVisible(true);
      return null;
    }
    const transformedTrips = trips
      .map((trip) => trip[1])
      .filter((trip) => trip !== null);
    return transformedTrips;
  }

  async function generateCsv(): Promise<string | null> {
    setVisible(false);
    const transformedTrips = await preprocessData();
    if (transformedTrips === null) {
      setRequestPending(false);
      return null;
    }
    const csv = parse(transformedTrips);
    const fileUri = `${
      FileSystem.documentDirectory
    }trips_${new Date().toISOString()}.csv`;
    await FileSystem.writeAsStringAsync(fileUri, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    setRequestPending(false);
    console.log(`The CSV successfully file saved at: ${fileUri}`);
    return fileUri;
  }

  async function generateJson(): Promise<string | null> {
    const transformedTrips = await preprocessData();
    if (transformedTrips === null) {
      setRequestPending(false);
      return null;
    }
    const json = JSON.stringify(transformedTrips);
    const fileUri = `${
      FileSystem.documentDirectory
    }trips_${new Date().toISOString()}.json`;
    await FileSystem.writeAsStringAsync(fileUri, json, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    setRequestPending(false);
    console.log(`The JSON successfully file saved at: ${fileUri}`);
    return fileUri;
  }

  async function handleShareJson() {
    setRequestPending(true);
    const jsonUri = await generateJson();
    if (jsonUri === null) {
      return;
    }

    await Sharing.shareAsync(jsonUri, {
      dialogTitle: "Share list of Trips in JSON",
      mimeType: "application/json",
    });
  }

  async function handleShareCsv() {
    setRequestPending(true);
    const csvUri = await generateCsv();
    if (csvUri === null) {
      return;
    }

    await Sharing.shareAsync(csvUri, {
      dialogTitle: "Share list of Trips in CSV",
      mimeType: "text/csv",
    });
  }

  async function handleExportBackup() {
    setRequestPending(true);
    const database = await getAllValues();
    const databaseJSON = JSON.stringify(database);

    console.log("Exporting database ...");

    const fileUri = `${
      FileSystem.documentDirectory
    }Driver_logbook_backup_${new Date().toISOString()}.json`;

    await FileSystem.writeAsStringAsync(fileUri, databaseJSON, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    await Sharing.shareAsync(fileUri, {
      dialogTitle: "Backup Trips",
      mimeType: "application/json",
    });

    setRequestPending(false);
  }

  return (
    <>
      <IconButton
        icon={"share"}
        style={{ marginLeft: "auto" }}
        onPress={() => setVisible(true)}
      />
      <Portal>
        <Modal
          visible={visible}
          onDismiss={() => setVisible(false)}
          contentContainerStyle={{ backgroundColor: "white", padding: 20 }}
        >
          <CloseButton icon="close" onPress={() => setVisible(false)} />
          <Title style={{ marginBottom: 15 }}>Export Trips</Title>
          <Button
            style={{ marginBottom: 15 }}
            icon={"file-delimited"}
            mode={"contained"}
            onPress={handleShareCsv}
          >
            Export as CSV
          </Button>
          <Button
            icon={"code-json"}
            mode={"contained"}
            onPress={handleShareJson}
          >
            Export as JSON
          </Button>
          <Divider></Divider>
          <Title style={{ marginBottom: 15 }}>Backup</Title>
          <Button
            icon={"backup-restore"}
            mode={"contained"}
            onPress={handleExportBackup}
          >
            Export Backup
          </Button>
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
          No trips to export!
        </Snackbar>
      </Portal>

      <InfoModal modalIsVisible={requestPending}></InfoModal>
    </>
  );
}

const CloseButton = styled(IconButton)`
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
`;
