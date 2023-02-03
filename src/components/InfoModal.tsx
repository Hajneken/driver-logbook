import { useEffect, useState } from "react";
import { View } from "react-native";
import {
  ActivityIndicator,
  Avatar,
  Dialog,
  Modal,
  Portal,
} from "react-native-paper";
import styled from "styled-components/native";

/**
 * Programmatically triggered Modal Dialog that is meant as a dummy loading screens
 * @param params
 * @returns
 */
export default function InfoModal(params: {
  modalIsVisible: boolean;
  children?: React.ReactNode;
}) {
  const [modalIsVisible, setModalIsVisible] = useState<boolean>(false);

  useEffect(() => {
    // On Request, show the modal
    if (params.modalIsVisible) {
      showModal();
    } else {
      hideModal();
    }
  }, [params.modalIsVisible]);

  const showModal = () => setModalIsVisible(true);
  const hideModal = () => setModalIsVisible(false);

  return (
    <>
      <Portal>
        <CustomModal
          dismissable={false}
          visible={modalIsVisible}
          onDismiss={hideModal}
          contentContainerStyle={{
            backgroundColor: "white",
            padding: 15,
            borderRadius: 10,
          }}
        >
          
          <View style={{ alignItems: "center" }}>
            <Avatar.Icon icon="robot-happy" size={100} />
          </View>
          <Dialog.Title>Hang tight while we whip up your request!</Dialog.Title>
          <ActivityIndicator animating={true} size="large"></ActivityIndicator>
          {params.children}
        </CustomModal>
      </Portal>
    </>
  );
}

const CustomModal = styled(Modal)`
  flex: 1;
  align-items: center;
`;
