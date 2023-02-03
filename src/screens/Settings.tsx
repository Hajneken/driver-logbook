import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useTheme } from "@react-navigation/native";
import { useContext, useState } from "react";
import {
  Button,
  Caption,
  Card,
  Dialog,
  List,
  Paragraph,
  Portal,
  Switch,
  Text,
} from "react-native-paper";
import styled from "styled-components/native";
import DebugMenu from "../components/DebugMenu";
import { Layout, Scrollable } from "../components/Layout/Layout";
import { AppSettingsContext } from "../contexts/AppSettings";
import { TripContext } from "../contexts/TripContext";
import { UserContext } from "../contexts/UserContext";
import { restoreAsyncStorageFromJSON } from "../model/store";

export default function SettingsScreenScreen(params) {
  const theme = useTheme();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [backupUri, setBackupUri] = useState<string | null>(null);
  const appSettingsContext = useContext(AppSettingsContext);
  const userContext = useContext(UserContext);
  const tripContext = useContext(TripContext);

  const {
    isAdminMode,
    setIsAdminMode,
    isExperimentalMode,
    setIsExperimentalMode,
    isDemoMode,
    setIsDemoMode,
    isDebugMode,
    setIsDebugMode,
  } = useContext(AppSettingsContext);

  const hideDialog = () => setDialogVisible(false);

  function toggleExperimentalMode() {
    setIsExperimentalMode(!isExperimentalMode);
  }

  function toggleAdminMode() {
    setIsAdminMode(!isAdminMode);
  }

  function toggleDemoMode() {
    setIsDemoMode(!isDemoMode);
  }

  function toggleDebugMode() {
    setIsDebugMode(!isDebugMode);
  }

  async function triggerBackupWizard() {
    await pickDocument();
    setDialogVisible(true);
  }

  async function handleRestore() {
    await tripContext.purgeDatabase();
    if (backupUri === null) {
      console.log("No backup file selected");
      return;
    }
    const fileContents = await FileSystem.readAsStringAsync(backupUri, {
      encoding: "utf8",
    });
    await restoreAsyncStorageFromJSON(fileContents);

    appSettingsContext.setIsDemoMode(false);
    appSettingsContext.setIsDebugMode(false);
    appSettingsContext.setIsExperimentalMode(false);
    userContext.setIsSignedIn(false);
    appSettingsContext.setInitialLoad(true);
  }

  async function pickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        type: "application/json",
      });
      setBackupUri(result.uri);
    } catch (err) {
      console.log("Error while picking document", err);
    }
  }

  return (
    <Layout>
      <Scrollable>
        <Card elevation={5}>
          <Card.Content>
            <SwitchContainer>
              <Text>Experimental Mode</Text>
              <Switch
                value={isExperimentalMode}
                onValueChange={toggleExperimentalMode}
              />
            </SwitchContainer>
            <List.Accordion
              style={{ padding: 0 }}
              titleStyle={{ fontSize: 12 }}
              title="About Experimental Mode"
              left={(props) => (
                <List.Icon {...props} icon="information-outline" />
              )}
            >
              <Caption>
                In experimental mode (automatic mode) optical recognition is
                confirmed automatically or in case of failure, the value of the
                last trip is selected. This requires fewer manual checks and
                inputs from the user.
              </Caption>
            </List.Accordion>

            <SwitchContainer>
              <Text>Admin Mode</Text>
              <Switch value={isAdminMode} onValueChange={toggleAdminMode} />
            </SwitchContainer>
            <List.Accordion
              style={{ padding: 0 }}
              titleStyle={{ fontSize: 12 }}
              title="About Admin Mode"
              left={(props) => (
                <List.Icon {...props} icon="information-outline" />
              )}
            >
              <Caption>
                Admin mode enables editing of saved trips via 3 dots displayed
                in the corner of each trip card in the Overview screen.
                Additionally, it enables editing of profile information.
              </Caption>
            </List.Accordion>

            <SwitchContainer>
              <Text>Demo Mode</Text>
              <Switch value={isDemoMode} onValueChange={toggleDemoMode} />
            </SwitchContainer>

            <List.Accordion
              style={{ padding: 0 }}
              titleStyle={{ fontSize: 12 }}
              title="About Demo Mode"
              left={(props) => (
                <List.Icon {...props} icon="information-outline" />
              )}
            >
              <Caption>
                Demo mode allows the user to test features of the app with
                mocked data (trips, recognized values and saved places). Note
                that the app may behave inconsistently when switching to the
                demo mode with already existing data. To test the app with demo
                mode, it is recommended to tap Restart App in Demo Mode in the
                Debug Menu.
              </Caption>
            </List.Accordion>

            <SwitchContainer>
              <Text>Debug Mode</Text>
              <Switch value={isDebugMode} onValueChange={toggleDebugMode} />
            </SwitchContainer>
            <List.Accordion
              style={{ padding: 0 }}
              titleStyle={{ fontSize: 12 }}
              title="About Debug Mode"
              left={(props) => (
                <List.Icon {...props} icon="information-outline" />
              )}
            >
              <Caption>
                Intended for developers, the debug mode allows advanced logging
                and database cleanup (log latest trip, dump contents of
                database, purging database and restarting the app). Use with
                caution.
              </Caption>
            </List.Accordion>

            <Button
              color={theme.colors.accent}
              icon="backup-restore"
              mode="contained"
              style={{ marginTop: 20, marginBottom: 10 }}
              onPress={triggerBackupWizard}
            >
              Restore from Backup
            </Button>
          </Card.Content>
        </Card>
        <Portal>
          <Dialog visible={dialogVisible} onDismiss={hideDialog}>
            <Dialog.Title>Hold On</Dialog.Title>
            <Dialog.Content>
              <Paragraph>
                Are you sure you want to restore from backup? This will delete
                all current data and replace it with the data from the backup.
              </Paragraph>
            </Dialog.Content>
            <Dialog.Actions>
              <Button
                mode="contained"
                style={{ marginRight: 10 }}
                onPress={hideDialog}
              >
                No take me back
              </Button>
              <Button
                mode="contained"
                color={theme.colors.accent}
                onPress={handleRestore}
              >
                Yes I am sure
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>

        {isDebugMode ? <DebugMenu></DebugMenu> : null}
      </Scrollable>
    </Layout>
  );
}

const SwitchContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin: 10px 0;
`;
