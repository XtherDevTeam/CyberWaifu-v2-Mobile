import * as React from 'react';

import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  adaptNavigationTheme,
  Appbar,
  Button,
  PaperProvider,
  Portal,
  Text,
  TextInput,
  withTheme,
} from 'react-native-paper';

import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  useFocusEffect,
} from '@react-navigation/native';

import Message from '../components/Message';
import * as Remote from '../shared/remote';
import { mdTheme } from '../shared/styles';

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme
});

const MORE_ICON = Platform.OS === 'ios' ? 'dots-horizontal' : 'dots-vertical'

const NewCharacter = ({ navigation, route }) => {
  const [messageState, setMessageState] = React.useState(false)
  const [messageText, setMessageText] = React.useState("")
  const [charName, setCharName] = React.useState("")
  const [charPrompt, setCharPrompt] = React.useState("")
  const [pastMemories, setPastMemories] = React.useState("")
  const [exampleChats, setExampleChats] = React.useState("")

  const charNameInputRef = React.useRef(null)
  const charPromptInputRef = React.useRef(null)
  const pastMemoriesInputRef = React.useRef(null)
  const exampleChatsInputRef = React.useRef(null)
  const scrollViewRef = React.useRef(null)

  useFocusEffect(React.useCallback(() => {
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
          <Appbar.Content title={"New Character"}></Appbar.Content>
        </Appbar.Header>
        <KeyboardAvoidingView behavior='padding' style={{ height: '100%' }}>
          <TouchableWithoutFeedback onPress={() => {
            charNameInputRef.current?.blur()
            charPromptInputRef.current?.blur()
            exampleChatsInputRef.current?.blur()
            pastMemoriesInputRef.current?.blur()
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }} accessible={false} style={{ height: '100%' }}>
            <>
              <ScrollView ref={scrollViewRef}>
                <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Text variant='bodyMedium' style={{ width: '95%', textAlign: 'center' }}>
                    You can edit the new character's profile here.
                  </Text>

                  <TextInput
                    label="Character Name"
                    placeholder='Naganohara Yoimiya'
                    style={{ width: '90%', marginTop: 20 }}
                    ref={charNameInputRef}
                    value={charName}
                    onChangeText={(v) => setCharName(v)}
                  />

                  <Text variant='bodyMedium' style={{ width: '95%', textAlign: 'center', marginTop: 20 }}>
                    Prompt is a piece of information included character's personalities, and introduction.
                  </Text>

                  <TextInput
                    label="Character Prompt"
                    placeholder='...'
                    style={{ width: '90%', marginTop: 20 }}
                    ref={charPromptInputRef}
                    value={charPrompt}
                    multiline={true}
                    onChangeText={(v) => setCharPrompt(v)}
                  />

                  <Text variant='bodyMedium' style={{ width: '95%', textAlign: 'center', marginTop: 20 }}>
                    This sets up character's past memories.
                  </Text>

                  <TextInput
                    label="Character Memories"
                    placeholder='...'
                    style={{ width: '90%', marginTop: 20 }}
                    ref={pastMemoriesInputRef}
                    value={pastMemories}
                    multiline={true}
                    onChangeText={(v) => setPastMemories(v)}
                  />

                  <Text variant='bodyMedium' style={{ width: '95%', textAlign: 'center', marginTop: 20 }}>
                    Appropriate example chats can help the model grasp a better understanding of your character.
                  </Text>

                  <TextInput
                    label="Example chats"
                    placeholder='...'
                    style={{ width: '90%', marginTop: 20 }}
                    ref={exampleChatsInputRef}
                    value={exampleChats}
                    multiline={true}
                    onChangeText={(v) => setExampleChats(v)}
                  />

                  <Button mode='contained-tonal' style={{ width: '90%', marginTop: 20, marginBottom: 20 }} onPress={() => {
                    onSubmit(charName, charPrompt, pastMemories, exampleChats)
                  }}>Create</Button>
                </View>

              </ScrollView>
              <Portal>
                <Message timeout={5000} style={{ marginBottom: 64 }} state={messageState} onStateChange={() => { setMessageState(false) }} icon="alert-circle" text={messageText} />
              </Portal>
            </>
          </TouchableWithoutFeedback >
        </KeyboardAvoidingView>
      </>
    </PaperProvider>
  )
};


export default withTheme(NewCharacter);