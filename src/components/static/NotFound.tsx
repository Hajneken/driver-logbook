import { View } from "react-native";
import { Title, Text, Avatar } from "react-native-paper";

export default function NotFound(params) {
  return (
    <View style={{ alignItems: "center" }}>
      <Title style={{ color: "#9d9d9d" }}>Nothing Found</Title>
      <Text style={{ color: "#9d9d9d", marginBottom: 15 }}>
        Just a meaningless empty void
      </Text>
      <Avatar.Icon
        icon="robot-confused"
        size={100}
        style={{ backgroundColor: "#d1d1d199" }}
        color={"#fff"}
      />
    </View>
  );
}
