import { useTheme } from "@react-navigation/native";
import { Avatar, Button, IconButton, Modal, Portal, Text, Title } from "react-native-paper";

export default function DeleteDialog({
  open,
  setOpen,
  callback,
}: {
  open: boolean;
  setOpen: Function;
  callback: Function;
}) {
  const hideModal = () => {
    setOpen(false);
  };

  const theme = useTheme();

  const containerStyle = { backgroundColor: "white", padding: 20 };

  return (
    <Portal>
      <Modal
        visible={open}
        onDismiss={hideModal}
        contentContainerStyle={containerStyle}
      >
        <>
          <IconButton
            style={{ marginLeft: "auto" }}
            icon="close"
            onPress={hideModal}
          />
          <Avatar.Icon
            style={{ marginLeft: "auto", marginRight: "auto" }}
            icon={"delete"}
          />
          <Title>Hold Up!</Title>
          <Text>This action will irreversibly remove this trip!</Text>

          <Button style={{ marginTop: 10 }} mode="contained" onPress={callback} color={theme.colors.error}>
            Delete This Trip
          </Button>
        </>
      </Modal>
    </Portal>
  );
}
