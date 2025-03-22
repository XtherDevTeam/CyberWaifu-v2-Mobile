import * as React from 'react';

import {
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  adaptNavigationTheme,
  Appbar,
  Button,
  List,
  PaperProvider,
  Portal,
  Text,
  withTheme,
} from 'react-native-paper';

import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  useFocusEffect,
} from '@react-navigation/native';

import ContentEditDialog from '../components/ContentEditDialog';
import Message from '../components/Message';
import StickerSetSelector from '../components/StickerSetSelector';
import TTSServiceSelector from '../components/TTSServiceSelector';
import * as Remote from '../shared/remote';
import { mdTheme } from '../shared/styles';
import GPTSoVitsModelSelector from '../components/GPTSoVitsModelSelector';

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
  const [useStickerSet, setUseStickerSet] = React.useState({})
  const [useTTSModel, setUseTTSModel] = React.useState("None")

  const charNameInputRef = React.useRef(null)
  const charPromptInputRef = React.useRef(null)
  const pastMemoriesInputRef = React.useRef(null)
  const exampleChatsInputRef = React.useRef(null)
  const scrollViewRef = React.useRef(null)

  useFocusEffect(React.useCallback(() => {
    setUseTTSModel("None")
  }, []))

  function onSubmit(charName, useTTSModel, useStickerSet, charPrompt, pastMemories, exampleChats) {
    Remote.charNew(charName, useTTSModel, useStickerSet, charPrompt, pastMemories, exampleChats).then(r => {
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
        <TouchableWithoutFeedback onPress={() => {
        }} accessible={false} style={{ height: '100%' }}>
          <>
            <ScrollView>
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Text variant='bodyMedium' style={{ width: '95%', textAlign: 'center', marginVertical: 10 }}>
                  You can edit the new character's profile here.
                </Text>

                <List.Section style={{width: '100%'}}>
                  <ContentEditDialog
                    title="Character Name"
                    description="The name of the character"
                    placeholder="Naganohara Yoimiya"
                    style={{ paddingHorizontal: 10, paddingVertical: 20 }}
                    defaultValue={charName}
                    onOk={v => setCharName(v)}
                  />

                  <GPTSoVitsModelSelector
                    style={{ paddingHorizontal: 10, paddingVertical: 20 }}
                    onChange={v => setUseTTSModel(v)}
                    defaultValue={useTTSModel}
                    onErr={v => {
                      setMessageText(`Unable to select TTS model: ${v}`)
                      setMessageState(true)
                    }}></GPTSoVitsModelSelector>

                  <StickerSetSelector
                    style={{ paddingHorizontal: 10, paddingVertical: 20 }}
                    onChange={v => setUseStickerSet(v)}
                    onErr={() => {
                      setMessageText(`Unable to select sticker set: ${v}`)
                      setMessageState(true)
                    }}></StickerSetSelector>


                  <ContentEditDialog
                    title="Character Prompt"
                    description="Prompt is a piece of information included character's personalities, and introduction."
                    style={{ paddingHorizontal: 10, paddingVertical: 20 }}
                    defaultValue={charPrompt}
                    onOk={v => setCharPrompt(v)}
                  />

                  <ContentEditDialog
                    title="Character Memories"
                    description="This sets up character's past memories."
                    placeholder='...'
                    style={{ paddingHorizontal: 10, paddingVertical: 20 }}
                    defaultValue={pastMemories}
                    multiline={true}
                    onOk={(v) => setPastMemories(v)}
                  />

                  <ContentEditDialog
                    title="Example chats"
                    description="Appropriate example chats can help the model grasp a better understanding of your character."
                    placeholder='...'
                    style={{ paddingHorizontal: 10, paddingVertical: 20 }}
                    defaultValue={exampleChats}
                    multiline={true}
                    onOk={(v) => setExampleChats(v)}
                  />
                </List.Section>

                <Button mode='contained-tonal' style={{ width: '90%', marginTop: 20, marginBottom: 20 }} onPress={() => {
                  onSubmit(charName, useTTSModel, useStickerSet.id, charPrompt, pastMemories, exampleChats)
                }}>Create</Button>
              </View>

            </ScrollView>
            <Portal>
              <Message timeout={5000} style={{ marginBottom: 64 }} state={messageState} onStateChange={() => { setMessageState(false) }} icon="alert-circle" text={messageText} />
            </Portal>
          </>
        </TouchableWithoutFeedback >
      </>
    </PaperProvider>
  )
};


export default withTheme(NewCharacter);