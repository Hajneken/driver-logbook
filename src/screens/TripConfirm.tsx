import { NavigationProp, useFocusEffect } from "@react-navigation/native";
import React, { useContext, useEffect, useRef, useState } from "react";
import MaskInput from "react-native-mask-input";
import {
  Button,
  Caption,
  Card,
  RadioButton,
  Snackbar,
} from "react-native-paper";
import styled from "styled-components/native";
import { Layout } from "../components/Layout/Layout";
import RadioOptions from "../components/RadioOptions";
import { AppSettingsContext } from "../contexts/AppSettings";
import { TripContext } from "../contexts/TripContext";

export default function TripConfirmScreen({
  navigation,
}: {
  navigation: NavigationProp;
}) {
  const [snackVisible, setSnackVisible] = React.useState(false);
  const onDismissSnackBar = () => setSnackVisible(false);

  const ref = useRef(null);
  const tripContext = useContext(TripContext);
  const { isDemoMode } = useContext(AppSettingsContext);

  const [customValueSelected, setCustomValueSelected] = useState(false);
  const [recognizedValues, setRecognizedValues] =
    useState<Array<string> | null>(["initial"]);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [customValue, setCustomValue] = useState<string>("");

  useEffect(() => {
    // Values from OCR
    if (tripContext.ocrResult !== null && tripContext.ocrResult.length > 0) {
      setRecognizedValues(tripContext.ocrResult);
      setSelectedValue(tripContext.ocrResult[0]);
    }
    // No values from OCR
    if (tripContext.ocrResult === null) {
      if (isDemoMode) {
        useDemoMode();
        return;
      }
      setRecognizedValues([]);
      setCustomValueSelected(true);
    }
  }, [tripContext.ocrResult]);

  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused
      return () => {
        // Do something when the screen is unfocused
        tripContext.setOcrResult(null);
        setRecognizedValues(null);
      };
    }, [])
  );

  /**
   * performs checks on values obtained from the OCR
   * influences component rendering
   */
  function validateRecognizedValues(): boolean {
    if (recognizedValues === null) {
      return false;
    }
    if (recognizedValues.length === 0) {
      return false;
    }
    if (
      (recognizedValues.length === 1 && recognizedValues[0] === "") ||
      recognizedValues[0] === "initial"
    ) {
      return false;
    }
    return true;
  }

  function useDemoMode(): void {
    setRecognizedValues(["123456", "234567", "345678"]);
    setSelectedValue("123456");
  }

  /**
   * Parent method that decides if trip is ending or starting based on the tripContext.timeStarted
   */
  const handleConfirmValue = async (): Promise<void> => {
    if (tripContext.timeStarted === null) {
      await handleStartTrip();
      return;
    }
    await handleEndTrip();
  };

  /**
   * Starts trip by calling a tripContext.startTrip, passing the correct starting odometer value to it
   */
  async function handleStartTrip(): Promise<void> {
    let startTripSuccess: boolean;
    if (customValueSelected) {
      startTripSuccess = await tripContext.startTrip(Number(customValue));
    } else {
      startTripSuccess = await tripContext.startTrip(Number(selectedValue));
    }
    if (startTripSuccess) {
      navigation.navigate("TripInProgress");
      return
    }
    setSnackVisible(true);
  }

  /**
   * End trip by calling a tripContext.endTrip(), passing the correct end odometer value to it
   */
  async function handleEndTrip(): Promise<void> {
    let endTripSuccess: boolean;
    if (customValueSelected) {
      endTripSuccess = await tripContext.endTrip(Number(customValue));
    } else {
      endTripSuccess = await tripContext.endTrip(Number(selectedValue));
    }
    if (endTripSuccess) {
      navigation.navigate("TripSummary");
      return
    }
    setSnackVisible(true);
  }

  /**
   * updates selectedValue state triggering checked radio button in the corresponding field
   */
  function handleRadioFocus(value: string): void {
    setCustomValueSelected(false);
    setSelectedValue(value);
    ref.current.blur();
  }

  /**
   * Final check if input is 6 digit number e.g.: 000001, 000023, 123001
   */
  function validateSelectedValue() {
    if (customValueSelected) {
      return !customValue.match(/\d{6}/g);
    }
    if (selectedValue === null) {
      return false;
    }
    return !selectedValue.match(/\d{6}/g);
  }

  return (
    <Layout>
      {/* Unsuccessful Recognition */}
      <Card>
        <Card.Title
          title={
            validateRecognizedValues()
              ? `Recognized Odometer Value`
              : `Recognition Failed`
          }
          subtitle={
            validateRecognizedValues()
              ? `Select the correct value`
              : `Please enter the correct amount`
          }
        />
        <Card.Content>
          {validateRecognizedValues()
            ? recognizedValues?.map((value) => (
                <RadioOptions
                  key={value}
                  customValueSelected={customValueSelected}
                  selectedValue={selectedValue}
                  handleFocus={handleRadioFocus}
                  value={value}
                />
              ))
            : null}
          <Caption>Custom Value (6 digits):</Caption>
          <Row>
            <RadioButton
              value={customValue}
              status={customValueSelected ? "checked" : "unchecked"}
              onPress={() => {
                setCustomValueSelected(!customValueSelected),
                  ref.current.focus();
              }}
            />
            <CustomMaskedInput
              value={customValue}
              keyboardType="numeric"
              ref={ref}
              onFocus={() => setCustomValueSelected(true)}
              onChangeText={(masked, unmasked) => {
                setCustomValue(unmasked); // you can use the unmasked value as well
              }}
              mask={[/\d/, /\d/, /\d/, " ", /\d/, /\d/, /\d/]}
            />
          </Row>
          <CustomButton
            mode="contained"
            icon={"check-circle"}
            onPress={handleConfirmValue}
            disabled={validateSelectedValue()}
          >
            Confirm Selection
          </CustomButton>
        </Card.Content>
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
          It seems like the value that you have selected can't be used. Please
          try selecting another.
        </Snackbar>
      </Card>
    </Layout>
  );
}

const Row = styled.View`
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin: 10px 0;
`;

const CustomButton = styled(Button)`
  margin: 10px;
`;

const CustomMaskedInput = styled(MaskInput)`
  margin: 5px;
  font-weight: bold;
  font-size: 18px;
  width: 100%;
`;
