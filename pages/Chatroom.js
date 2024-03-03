import * as React from 'react';
import { ActivityIndicator, Appbar, Chip, IconButton, List, Drawer, Icon, PaperProvider, Portal, adaptNavigationTheme, withTheme } from 'react-native-paper';
import { Banner } from 'react-native-paper';
import { Image, Keyboard, KeyboardAvoidingView, Platform, ScrollView, TouchableWithoutFeedback, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { Avatar } from 'react-native-paper';
import { View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { Button } from 'react-native-paper';
import { mdTheme } from '../shared/styles';
import Message from '../components/Message';
import * as Linking from 'expo-linking';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  useFocusEffect,
} from '@react-navigation/native';
import * as Remote from '../shared/remote';
const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme
});

const MORE_ICON = Platform.OS === 'ios' ? 'dots-horizontal' : 'dots-vertical';

const Chatroom = ({ navigation, route }) => {
  const [messageState, setMessageState] = React.useState(false)
  const [messageText, setMessageText] = React.useState("")
  const [charName, setCharName] = React.useState('')
  const [charId, setCharId] = React.useState(0)

  useFocusEffect(React.useCallback(() => {
    setCharName(route.params.charName)
    setCharId(route.params.charId)
  }, []))

  function onSubmit(charName, charPrompt, pastMemories, exampleChats) {
    Remote.charNew(charName, charPrompt, pastMemories, exampleChats).then(r => {
      if (r.data.status) {
        navigation.goBack()
      } else {
        setMessageText(`Unable to create character: ${r.data.data}`)
        setMessageState(true)
      }
    }).catch(e => {
      setMessageText(`Unable to create character: ${e}`)
      setMessageState(true)
    })
  }

  return (
    <PaperProvider theme={mdTheme()}>
      <>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()}></Appbar.BackAction>
          <Appbar.Content title={charName}></Appbar.Content>
        </Appbar.Header>
        <TouchableWithoutFeedback onPress={() => {

        }} accessible={false}>
          <>
            <ScrollView style={{ flex: 1 }}>
            </ScrollView>
            <Portal>
              <View style={{ width: '100%', bottom: 0, position: 'absolute', marginTop: 20, backgroundColor: mdTheme().colors.surfaceVariant }}>
                <View style={{ flexDirection: 'row', alignContent: 'center', justifyContent: 'center', alignItems: 'center' }}>
                  <TextInput mode='flat' style={{ flex: 16 }} label={'Type messages'}></TextInput>
                  <IconButton icon="send" style={{ flex: 2 }} onPress={() => { }}></IconButton>
                  <IconButton icon="dots-vertical" style={{ flex: 2 }} onPress={() => { }}></IconButton>
                </View>
                
              </View>
              <Message timeout={5000} style={{ marginBottom: 64 }} state={messageState} onStateChange={() => { setMessageState(false) }} icon="alert-circle" text={messageText} />
            </Portal>
          </>
        </TouchableWithoutFeedback >
      </>
    </PaperProvider>
  )
};


export default withTheme(Chatroom);