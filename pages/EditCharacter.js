import * as React from 'react';

import * as fs from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import {
  Image,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  Appbar,
  Button,
  Icon,
  PaperProvider,
  Portal,
  Text,
  TextInput,
  withTheme,
} from 'react-native-paper';

import { useFocusEffect } from '@react-navigation/native';

import Message from '../components/Message';
import StickerSetSelector from '../components/StickerSetSelector';
import * as Remote from '../shared/remote';
import * as storage from '../shared/storage';
import { mdTheme } from '../shared/styles';

const EditCharacter = ({ navigation, route }) => {
  const [messageState, setMessageState] = React.useState(false)
  const [messageText, setMessageText] = React.useState("")
  const [charId, setCharId] = React.useState(route.params.charId)
  const [charName, setCharName] = React.useState(route.params.charName)
  const [charPrompt, setCharPrompt] = React.useState("")
  const [charAvatarUrl, setCharAvatarUrl] = React.useState("")
  const [pastMemories, setPastMemories] = React.useState("")
  const [exampleChats, setExampleChats] = React.useState("")
  const [useStickerSet, setUseStickerSet] = React.useState(null)

  const charNameInputRef = React.useRef(null)
  const charPromptInputRef = React.useRef(null)
  const pastMemoriesInputRef = React.useRef(null)
  const exampleChatsInputRef = React.useRef(null)
  const scrollViewRef = React.useRef(null)

  useFocusEffect(React.useCallback(() => {
    Remote.getCharacterInfo(charId).then(r => {
      if (r.data.status) {
        setCharAvatarUrl(Remote.charAvatar(r.data.data.id))
        setCharName(r.data.data.charName)
        setCharPrompt(r.data.data.charPrompt)
        setPastMemories(r.data.data.pastMemories)
        setExampleChats(r.data.data.exampleChats)
        Remote.getStickerSetInfo(r.data.data.emotionPack).then(r => {
          if (r.status) {
            setUseStickerSet(r.data.data)
          }
        })
      } else {
        setMessageText(`Unable to get character info: ${r.data.data}`)
        setMessageState(true)
      }
    }).catch(r => {
      setMessageText(`Unable to get character info: NetworkError`)
      setMessageState(true)
    })
  }, []))

  function onUpload(v) {
    fs.uploadAsync(Remote.updateCharacterAvatar(charId), v, { httpMethod: 'POST', uploadType: fs.FileSystemUploadType.MULTIPART }).then(r => {
      if (r.status == 200) {
        data = JSON.parse(r.body)
        if (data.status) {
          setCharAvatarUrl(v)
          storage.clearImageCache()
          setMessageText(`Character avatar updated.`)
          setMessageState(true)
        } else {
          setMessageText(`Unable to update avatar: ${data.data}`)
          setMessageState(true)
        }
      } else {
        setMessageText(`Unable to update avatar: NetworkError`)
        setMessageState(true)
      }
    })
  }

  function onSubmit(charId, charName, useStickerSet, charPrompt, pastMemories, exampleChats) {
    Remote.editCharacter(charId, charName, charPrompt, pastMemories, exampleChats, useStickerSet).then(r => {
      if (r.data.status) {
        navigation.goBack()
      } else {
        setMessageText(`Unable to edit character: ${r.data.data}`)
        setMessageState(true)
      }
    }).catch(e => {
      setMessageText(`Unable to edit character: ${e}`)
      setMessageState(true)
    })
  }

  return (
    <PaperProvider theme={mdTheme()}>
      <>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()}></Appbar.BackAction>
          <Appbar.Content title={"Edit Character"}></Appbar.Content>
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
                  <Image
                    style={{ width: 64, height: 64, borderRadius: 32, marginTop: 20, alignSelf: 'center' }}
                    imageStyle={{ borderRadius: 32 }}
                    source={{ uri: charAvatarUrl }} />
                  <Button mode='contained-tonal' style={{ width: '90%', marginTop: 20, marginBottom: 20 }} onPress={() => {
                    ImagePicker.launchImageLibraryAsync().then(r => {
                      if (!r.canceled) {
                        r.assets.forEach(v => onUpload(v.uri))
                      }
                    })
                  }}><Icon source={'file-image-plus'}/> Upload a new one</Button>

                  <TextInput
                    label="Character Name"
                    placeholder='Naganohara Yoimiya'
                    style={{ width: '90%', marginTop: 20 }}
                    ref={charNameInputRef}
                    value={charName}
                    onChangeText={(v) => setCharName(v)}
                  />

                  <Text variant='bodyMedium' style={{ width: '95%', textAlign: 'center', marginTop: 20 }}>
                    Choose the sticker set for character to use during conversations.
                  </Text>

                  <StickerSetSelector
                    style={{ width: '90%', marginTop: 20 }}
                    onChange={v => setUseStickerSet(v)}
                    defaultValue={useStickerSet}
                    onErr={v => {
                      setMessageText(`Unable to select sticker set: ${v}`)
                      setMessageState(true)
                    }}></StickerSetSelector>

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
                    onSubmit(charId, charName, useStickerSet.id, charPrompt, pastMemories, exampleChats)
                  }}>Edit</Button>
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


export default withTheme(EditCharacter);