import React from "react";
import {
  Divider,
  RadioButton,
  Text,
  TouchableRipple,
} from "react-native-paper";
import styled from "styled-components/native";

export default function RadioOptions({
  value,
  selectedValue,
  customValueSelected,
  handleFocus,
}) {
  return (
    <React.Fragment>
      <TouchableRipple onPress={() => handleFocus(value)}>
        <Row>
          <RadioButton
            value={value}
            status={
              selectedValue === value && !customValueSelected
                ? "checked"
                : "unchecked"
            }
            onPress={() => handleFocus(value)}
          />
          <Text style={{ fontWeight: "bold" }}>{value}</Text>
        </Row>
      </TouchableRipple>
      <Divider />
    </React.Fragment>
  );
}

const Row = styled.View`
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  margin: 10px 0;
`;
