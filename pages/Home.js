import * as React from 'react';

import {
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  Appbar,
  Avatar,
  List,
  PaperProvider,
  Portal,
  Text,
  withTheme,
} from 'react-native-paper';

import { useFocusEffect } from '@react-navigation/native';

import Message from '../components/Message';
import * as Remote from '../shared/remote';
import { mdTheme } from '../shared/styles';

const MORE_ICON = Platform.OS === 'ios' ? 'dots-horizontal' : 'dots-vertical'

const Home = ({ navigation, route }) => {
  const [messageState, setMessageState] = React.useState(false)
  const [messageText, setMessageText] = React.useState("")
  const [characterList, setCharacterList] = React.useState(null)

  useFocusEffect(React.useCallback(() => {
    Remote.checkIfLoggedIn().then(r => {
      if (!r) {
        navigation.navigate('Sign In')
      } else {
        Remote.characterList().then(r => {
          if (r.data.status) {
            setCharacterList(r.data.data)
          } else {
            setMessageText(`Unable to load character list: ${r.data.data}`)
            setMessageState(true)
          }
        }).catch(e => {
          setMessageText(`Unable to load character list: NetworkError`)
          setMessageState(true)
        })
      }
    })
  }, []))

  return (
    <PaperProvider theme={mdTheme()}>
      <>
        <Appbar.Header>
          <Appbar.Content title={characterList === null ? "Chats (Loading...)" : "Chats"}></Appbar.Content>
          <Appbar.Action icon="plus" onPress={() => navigation.navigate('New Character')}></Appbar.Action>
        </Appbar.Header>
        <TouchableWithoutFeedback onPress={() => { }} accessible={false}>
          <>
            {(characterList === null || characterList.length == 0) &&
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Text>
                  Empty...
                </Text>
              </View>}
            {(characterList !== null && characterList.length > 0) &&
              <>
                <ScrollView>
                  {characterList.map(r => (<List.Item
                    key={r.id}
                    title={r.charName}
                    description={r.latestMsg}
                    left={props => <Avatar.Image style={{ borderRadius: '100%' }} {...props} source={{ uri: Remote.charAvatar(r.id) }} />}
                    onPress={() => {
                      console.log(r)
                      navigation.navigate('Chatroom', {
                        charName: r.charName,
                        charId: r.id
                      })
                    }}>
                  </List.Item>))}
                </ScrollView>
              </>}
            <Portal>
              <Message timeout={5000} style={{ marginBottom: 64 }} state={messageState} onStateChange={() => { setMessageState(false) }} icon="alert-circle" text={messageText} />
            </Portal>
          </>
        </TouchableWithoutFeedback >
      </>
    </PaperProvider>
  )
};


export default withTheme(Home);