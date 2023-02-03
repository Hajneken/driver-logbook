import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useContext, useState } from "react";
import {
  Avatar,
  Button,
  Dialog,
  IconButton,
  List,
  Modal,
  Paragraph,
  Portal,
  Snackbar,
  Text,
  TextInput,
  Title,
  useTheme,
} from "react-native-paper";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";
import { UserContext } from "../contexts/UserContext";
import { Scrollable } from "./Layout/Layout";
import RadioList from "./RadioList";

export interface DialogType {
  type: "string" | "list" | "number" | "date" | "time";
  time?: Date;
  items?: string[];
  pattern?: string;
}

export interface UpdateDialogInterface {
  icon?: IconSource;
  delete?: { deleteButton: boolean; deleteCallback: Function };
  title: String;
  currentValue: String;
  updateCallback: Function;
  component: DialogType;
}

/**
 * Modal Dialog for updating Data that can be parametrized
 */
export default function UpdateDialog({
  open,
  setOpen,
  options,
}: {
  open: boolean;
  setOpen: Function;
  options: UpdateDialogInterface;
}) {
  const [newValue, setNewValue] = useState<string | number | Date>("");
  const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);
  const [deletePrompt, setDeletePrompt] = useState<boolean>(false);

  const [date, setDate] = useState<null | Date>(null);
  const [showPicker, setShowPicker] = useState(false);

  const theme = useTheme();

  const onDateTimePickerChange = (event, selectedDate) => {
    const currentDate = selectedDate || options.component.time;
    // setShowPicker(Platform.OS === "ios");
    setDate(currentDate);
    setNewValue(currentDate);
    setShowPicker(false);
  };

  const hideModal = () => {
    setNewValue("");
    setOpen(false);
    setSnackbarVisible(false);
  };

  const handleUpdate = async () => {
    if (await options.updateCallback(newValue)) {
      hideModal();
      return;
    }
    setSnackbarVisible(true);
  };

  function renderComponent() {
    if (options.component?.type === "date") {
      return (
        <>
          {showPicker ? (
            <DateTimePicker
              testID="datePicker"
              value={date || options.component.time}
              mode={"date"}
              is24Hour={true}
              display="default"
              onChange={onDateTimePickerChange}
              onTouchCancel={() => setShowPicker(false)}
            />
          ) : (
            <>
              <Text>Modify To: {date?.toString()}</Text>
              <Button onPress={() => setShowPicker(true)}>Pick Date</Button>
            </>
          )}
        </>
      );
    }
    if (options.component?.type === "time") {
      return (
        <>
          {showPicker ? (
            <DateTimePicker
              testID="timePicker"
              value={date || options.component.time}
              mode={"time"}
              is24Hour={true}
              display="default"
              onChange={onDateTimePickerChange}
              onTouchCancel={() => setShowPicker(false)}
            />
          ) : (
            <>
              <List.Item title={"Modify To:"} description={date?.toString()} />
              <Button onPress={() => setShowPicker(true)}>Pick Time</Button>
            </>
          )}
        </>
      );
    }

    if (options.component?.type === "list") {
      return (
        <>
          {options.component.items.length === 0 ? (
            <List.Item
              left={(props) => <List.Icon {...props} icon={"alert"} />}
              title={"Nothing to select"}
              description={
                "It seems like there are no items to select from at the moment."
              }
            />
          ) : (
            <RadioList
              listItems={options.component.items}
              onItemSelected={(newValue) => setNewValue(newValue)}
            />
          )}
        </>
      );
    }

    if (options.component?.type === "number") {
      return (
        <TextInput
          label="New Value"
          value={newValue}
          onChangeText={(newValue) => setNewValue(newValue)}
          keyboardType="numeric"
        />
      );
    }

    return (
      <TextInput
        label="New Value"
        value={newValue}
        onChangeText={(newValue) => setNewValue(newValue)}
      />
    );
  }

  const containerStyle = { backgroundColor: "white", padding: 20 };

  function handleDelete() {
    setDeletePrompt(false);
    options.delete?.deleteCallback();
  }

  return (
    <Portal>
      <Modal
        visible={open}
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
            icon={options.icon ? options.icon : "pencil"}
          />
          <Title style={{ textAlign: "center" }}>
            Change value: {options.title}
          </Title>

          <List.Item
            title="Current Value"
            description={options.currentValue}
            right={() => (
              <>
                {options.delete?.deleteButton ? (
                  <IconButton
                    color={theme.colors.error}
                    icon={"delete"}
                    style={{ marginLeft: "auto" }}
                    onPress={() => setDeletePrompt(true)}
                  />
                ) : null}
              </>
            )}
          />
          {deletePrompt ? (
            <Portal>
              <Dialog
                visible={deletePrompt}
                onDismiss={() => setDeletePrompt(false)}
              >
                <Dialog.Title>Hold On</Dialog.Title>
                <Dialog.Content>
                  <Paragraph>
                    Are you sure you want to delete {options.currentValue} ?
                  </Paragraph>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button
                    mode="contained"
                    onPress={() => setDeletePrompt(false)}
                  >
                    No, take me back
                  </Button>
                  <Button color={theme.colors.error} onPress={handleDelete}>
                    Yes, Delete
                  </Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
          ) : null}
          {renderComponent()}

          <Button
            style={{ marginTop: 10 }}
            mode="contained"
            onPress={handleUpdate}
            disabled={newValue === "" || newValue === options.currentValue}
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
        Attempted value update has been rejected, please check sensibility of
        your value in the context of the current, previous and next trip and try
        again.
      </Snackbar>
    </Portal>
  );
}
