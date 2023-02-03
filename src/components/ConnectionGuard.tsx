import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";
import { Avatar, Button, Dialog, Paragraph, Portal } from "react-native-paper";

export default function ConnectionGuard(params) {
  const [dialogVisible, setDialogVisible] = useState<boolean>(false);

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    NetInfo.fetch().then((state) => {
      if (state.isConnected === false) {
        setDialogVisible(true);
        return;
      }
      setDialogVisible(false);
    });
  }

  const hideDialog = () => setDialogVisible(false);

  const handleReconnect = () => {
    checkConnection();
  };

  return (
    <Portal>
      <Dialog
        visible={dialogVisible}
        onDismiss={hideDialog}
        dismissable={false}
      >
        <Dialog.Title>Internet Disconnected</Dialog.Title>
        <Dialog.Content>
          <Avatar.Icon size={32} icon="access-point-network-off" />
          <Paragraph>
            You're not connected to the information superhighway. This app needs
            a little taste of the internet to work its magic. But don't throw in
            the towel just yet, try again!
          </Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleReconnect}>Try Again</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
