import { View } from "react-native";
import { Title, Text, Avatar } from "react-native-paper";

export default function AllLoaded(params) {
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ textAlign: "center", color: "#9d9d9d" }}>...</Text>
      <Title style={{ textAlign: "center", color: "#9d9d9d" }}>
        That's it folks!
      </Title>
      <Avatar.Icon
        icon="robot-happy"
        size={50}
        style={{ backgroundColor: "#d1d1d199" }}
        color={"#fff"}
      />
      <Text style={{ textAlign: "center", color: "#9d9d9d" }}>
        The data well has run dry and there's not a drop left to be found.
      </Text>
    </View>
  );
}
