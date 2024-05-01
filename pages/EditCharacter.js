import * as React from 'react';

import * as fs from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import {
  Image,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  Appbar,
  Button,
  Icon,
  List,
  PaperProvider,
  Portal,
  withTheme,
} from 'react-native-paper';

import { useFocusEffect } from '@react-navigation/native';

import ContentEditDialog from '../components/ContentEditDialog';
import Message from '../components/Message';
import StickerSetSelector from '../components/StickerSetSelector';
import TTSServiceSelector from '../components/TTSServiceSelector';
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
  const [useTTSService, setUseTTSService] = React.useState(null)

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
        if (r.data.data.ttsServiceId !== 0) {
          Remote.getTTSServiceInfo(r.data.data.ttsServiceId).then(r => {
            if (r.status) {
              setUseTTSService(r.data.data)
            }
          })
        } else {
          setUseTTSService({
            id: 0,
            name: "None",
            description: "Do not use TTS service during conversation"
          })
        }
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

  function onSubmit(charId, charName, useTTSService, useStickerSet, charPrompt, pastMemories, exampleChats) {
    Remote.editCharacter(charId, charName, charPrompt, pastMemories, exampleChats, useStickerSet, useTTSService).then(r => {
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
                }}><Icon source={'file-image-plus'} /> Upload a new one</Button>

                <List.Section style={{width: '100%'}}>
                  <ContentEditDialog
                    title="Character Name"
                    description="The name of the character"
                    placeholder="Naganohara Yoimiya"
                    style={{ paddingHorizontal: 10, paddingVertical: 20 }}
                    defaultValue={charName}
                    onOk={v => setCharName(v)}
                  />

                  <TTSServiceSelector
                    style={{ paddingHorizontal: 10, paddingVertical: 20}}
                    onChange={v => setUseTTSService(v)}
                    defaultValue={useTTSService}
                    onErr={v => {
                      setMessageText(`Unable to select TTS service: ${v}`)
                      setMessageState(true)
                    }}></TTSServiceSelector>

                  <StickerSetSelector
                    style={{ paddingHorizontal: 10, paddingVertical: 20}}
                    onChange={v => setUseStickerSet(v)}
                    defaultValue={useStickerSet}
                    onErr={() => {
                      setMessageText(`Unable to select sticker set: ${v}`)
                      setMessageState(true)
                    }}></StickerSetSelector>


                  <ContentEditDialog
                    title="Character Prompt"
                    description="Prompt is a piece of information included character's personalities, and introduction."
                    style={{ paddingHorizontal: 10, paddingVertical: 20}}
                    defaultValue={charPrompt}
                    onOk={v => setCharPrompt(v)}
                  />

                  <ContentEditDialog
                    title="Character Memories"
                    description="This sets up character's past memories."
                    placeholder='...'
                    style={{ paddingHorizontal: 10, paddingVertical: 20}}
                    defaultValue={pastMemories}
                    multiline={true}
                    onOk={(v) => setPastMemories(v)}
                  />

                  <ContentEditDialog
                    title="Example chats"
                    description="Appropriate example chats can help the model grasp a better understanding of your character."
                    placeholder='...'
                    style={{ paddingHorizontal: 10, paddingVertical: 20}}
                    defaultValue={exampleChats}
                    multiline={true}
                    onOk={(v) => setExampleChats(v)}
                  />
                </List.Section>


                <Button mode='contained-tonal' style={{ width: '90%', marginTop: 20, marginBottom: 20 }} onPress={() => {
                  onSubmit(charId, charName, useTTSService.id, useStickerSet.id, charPrompt, pastMemories, exampleChats)
                }}>Edit</Button>
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


export default withTheme(EditCharacter);