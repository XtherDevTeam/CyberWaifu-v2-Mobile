import * as React from 'react';
import { Appbar, Card, DataTable, Dialog, Drawer, Icon, PaperProvider, Portal, withTheme } from 'react-native-paper';
import { Banner } from 'react-native-paper';
import { Image, Keyboard, Platform, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { Avatar } from 'react-native-paper';
import { View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Button } from 'react-native-paper';
import { mdTheme } from '../shared/styles';
import * as storage from '../shared/storage';
import * as Api from '../shared/api';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import Message from '../components/Message';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import * as Clipboard from 'expo-clipboard';
import { Audio } from 'expo-av';


const MORE_ICON = Platform.OS === 'ios' ? 'dots-horizontal' : 'dots-vertical';

let defaultConfirmDeletingDialogState = {
  item: { id: 114514 },
  state: false
}

const About = ({ navigation, route }) => {

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="About XmediaCenter 2 Music"></Appbar.Content>
      </Appbar.Header>
      <TouchableWithoutFeedback onPress={() => { }} accessible={false}>
        <>
          <ScrollView>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Card style={{ width: "95%" }}>
                <Card.Cover source={require('../assets/yoimiya.jpg')} style={{ height: 128 }} />
                <Card.Content style={{ marginTop: 15 }}>
                  <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Avatar.Image source={require('../assets/icon.png')} size={56}></Avatar.Image>
                    <Text variant="titleLarge">CyberWaifu-v2 Mobile</Text>
                    <Text variant="bodyMedium" style={{ textAlign: 'center' }}>Version: 1.0.0(1)</Text>
                    <Text variant="bodyMedium" style={{ textAlign: 'center' }}>Made with ❤️ by Jerry Chou and Naganohara Yoimiya</Text>
                  </View>
                  <View style={{ marginTop: 10 }}>
                    <Text variant='bodyMedium'>
                      Hello, world!
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            </View>
          </ScrollView>
        </>
      </TouchableWithoutFeedback >
    </>
  )
};

export default withTheme(About);