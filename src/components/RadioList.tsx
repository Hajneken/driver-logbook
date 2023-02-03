import { useState } from "react";
import { View } from "react-native";
import { Text } from "react-native-paper";
import RadioOptions from "./RadioOptions";

/**
 * Reusable generic implementation of radio list
 */
export default function RadioList({
  listItems,
  onItemSelected,
}: {
  listItems: Array<string> | undefined;
  onItemSelected: (value: string) => void;
}) {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  function handleRadioFocus(value: string): void {
    setSelectedValue(value);
    onItemSelected(value);
  }

  return (
    <>
      <View>
        {listItems?.map((item, index) => {
          return (
            <RadioOptions
              key={`radio-option#${index}:${item}`}
              value={item}
              customValueSelected={false}
              selectedValue={selectedValue}
              handleFocus={handleRadioFocus}
            />
          );
        })}
      </View>
    </>
  );
}
