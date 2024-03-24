import React from 'react';

import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  Card,
  IconButton,
} from 'react-native-paper';

const BottomDrawer = ({ drawerTitle, onClose, children, state }) => {
  return (
    <Modal
      visible={state}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={{ height: '100%' }}>
          <Card style={{ height: '100%' }}>
            <Card.Title title={drawerTitle} titleVariant='titleMedium' right={() => <IconButton icon={"close"} onPress={() => {
              onClose()
            }} />}></Card.Title>
            <ScrollView style={{ height: '100%' }}>
              {children}
            </ScrollView>
          </Card>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    height: '100%',
    maxHeight: Dimensions.get('window').height * 0.5,
    width: '100%',
    position: 'absolute',
    bottom: 0,
  },
});

export default BottomDrawer;