import React from "react";
import { Text } from "react-native";
import { Avatar, Button, Checkbox, TextInput } from "react-native-paper";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import styled from "styled-components/native";
import { UserContext } from "../contexts/UserContext";

export default function SignInScreen({ navigation, route }) {
  const [user, setUser] = React.useState<string>("");
  const [pswd, setPswd] = React.useState<string>("");
  const [securePassword, setSecurePassword] = React.useState<Boolean>(true);
  const [checked, setChecked] = React.useState(false);

  // use context to set isSignedIn to true
  const userContext = React.useContext(UserContext);

  const handleSignIn = async () => {
    if (user !== "") {
      userContext.setName(user);
    }
    // Handle Sign In
    userContext.setIsSignedIn(true);
  };

  return (
    <Layout>
      <Svg
        height="100%"
        width="100%"
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        <Defs>
          <LinearGradient id="0" x1="0.5" y1="0" x2="0.5" y2="1">
            <Stop offset="0%" stopColor="#3b5998" />
            <Stop offset="16%" stopColor="#5f82c2" />
            <Stop offset="48%" stopColor="#e4e9f3" />
            <Stop offset="65.33%" stopColor="#c3c9d6" />
            <Stop offset="100%" stopColor="#4267b6" />
          </LinearGradient>
        </Defs>
        <Rect fill="url(#0)" height="100%" width="100%" />
      </Svg>
      <AvatarContainer>
        <Avatar.Icon icon="car-back" size={100} />
      </AvatarContainer>
      <Input
        label="Email / Username"
        placeholder="don@joe.com"
        value={user}
        onChangeText={(text) => setUser(text)}
      />
      <Input
        label="Password"
        secureTextEntry={securePassword}
        value={pswd}
        right={
          <TextInput.Icon
            onPress={() => setSecurePassword(!securePassword)}
            name="eye"
          />
        }
        onChangeText={(pswd) => setPswd(pswd)}
      />
      <RowContainer>
        <Text>Keep me Signed In</Text>
        <Checkbox
          status={checked ? "checked" : "unchecked"}
          onPress={() => {
            setChecked(!checked);
          }}
        />
      </RowContainer>
      <CustomButton
        mode="contained"
        onPress={handleSignIn}
        contentStyle={{ padding: 10 }}
      >
        Sign In
      </CustomButton>
    </Layout>
  );
}

const Input = styled(TextInput)`
  margin: 10px;
`;

const Layout = styled.View`
  flex: 1;
  justify-content: center;
`;

const AvatarContainer = styled.View`
  align-items: center;
  margin-bottom: 20px;
`;

const RowContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
`;

const CustomButton = styled(Button)`
  margin: 0 auto;
`;
