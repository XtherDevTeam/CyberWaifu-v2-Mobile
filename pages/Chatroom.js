import * as React from 'react';

import { Audio } from 'expo-av';
import * as fs from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
// import AvatarImage from '../shared/AvatarImage'
import {
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import ImageView from 'react-native-image-viewing';
import {
  adaptNavigationTheme,
  Appbar,
  Avatar,
  Button,
  Card,
  Icon,
  IconButton,
  List,
  PaperProvider,
  Portal,
  SegmentedButtons,
  Text,
  TextInput,
  TouchableRipple,
  withTheme,
} from 'react-native-paper';

import { CachedImage } from '@georstat/react-native-image-cache';
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

const Chatroom = ({ navigation, route }) => {
  const theme = mdTheme()
  const chatMessageInputCursorPosition = React.useRef(0)
  const audioRecordingRef = React.useRef(null)
  const [audioRecordingStatus, setAudioRecordingStatus] = React.useState(false)
  const [messageAreaPadding, setMessageAreaPadding] = React.useState(56)
  const chatHistoryViewRef = React.useRef(null)
  const charHistoryOffset = React.useRef(0)
  const chatSession = React.useRef(null)
  const chatMessageInputRef = React.useRef(null)
  const [messageState, setMessageState] = React.useState(false)
  const [messageText, setMessageText] = React.useState("")
  const [charName, setCharName] = React.useState('')
  const [charId, setCharId] = React.useState(0)
  const [useStickerSet, setUseStickerSet] = React.useState(0)
  const [availableStickers, setAvailableStickers] = React.useState([])

  const chatImages = React.useRef([])
  const chatHistory = React.useRef([])
  const [chatHistoryView, setChatHistoryView] = React.useState([])
  const [chatImagesView, setChatImagesView] = React.useState([])
  const [chatMessageInput, setChatMessageInput] = React.useState("")
  const [sessionUsername, setSessionUsername] = React.useState('')
  const [currentMenuTab, setCurrentMenuTab] = React.useState('stickers')
  const [menuStatus, setMenuStatus] = React.useState(false)

  const [imagePreviewVisibility, setImagePreviewVisibility] = React.useState(false)
  const [previewImage, setPreviewImage] = React.useState('')

  function triggerAnimation() {
    LayoutAnimation.configureNext({ ...LayoutAnimation.Presets.linear, duration: 100 })
  }

  function insertIntoChatInput(newText) {
    console.log(chatMessageInputRef.current._lastNativeSelection)
    const currentPosition = chatMessageInputCursorPosition.current

    const updatedText = chatMessageInput.slice(0, currentPosition) + newText + chatMessageInput.slice(currentPosition)
    setChatMessageInput(updatedText)
  }

  React.useEffect(() => {
    console.log(currentMenuTab)
  }, [currentMenuTab])

  useFocusEffect(React.useCallback(() => {
    charHistoryOffset.current = 0
    setCharName(route.params.charName)
    setCharId(route.params.charId)
    Remote.getCharacterInfo(route.params.charId).then(r => {
      if (r.data.status) {
        setUseStickerSet(r.data.data.emotionPack)
      }
    })
    Remote.getUserName().then(r => {
      setSessionUsername(r)
    })
    loadChatHistory()
  }, []))

  React.useEffect(() => {
    if (useStickerSet !== 0) {
      Remote.stickerList(useStickerSet).then(r => {
        if (r.data.status) {
          console.log(r.data.data)
          setAvailableStickers(r.data.data)
        }
      })
    }
  }, [useStickerSet])

  React.useEffect(() => {
    triggerAnimation()
  }, [chatImagesView])

  function updateChatImages(uri) {
    chatImages.current.push(uri)
    let r = []
    for (let i = 0; i < chatImages.current.length; i++) {
      // uploaded attachment url
      r.push(chatImages.current[i])
    }
    setChatImagesView(r)
  }

  function removeChatImages(index) {
    chatImages.current.splice(index, 1)
    let r = []
    for (let i = 0; i < chatImages.current.length; i++) {
      // uploaded attachment url
      r.push(chatImages.current[i])
    }
    setChatImagesView(r)
  }

  function clearChatImages() {
    chatImages.current = []
    setChatImagesView([])
  }

  React.useEffect(() => {
    setTimeout(() => {
      console.log('Scrolling')
      chatHistoryViewRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }, [chatHistoryView])

  function receiveMessage(response, order = false) {
    if (order) {
      console.log('reversed order')
      chatHistoryView.forEach(k => {
        response.push(k)
      })
      setChatHistoryView(response)
    } else {
      let n = []
      let timeout = 0
      chatHistoryView.forEach(k => { n.push(k) })
      console.log('normal order', chatHistoryView)
      response.forEach(k => {
        if (k.role === 'model') {
          timeout += k.text.length * 0.01
        }
        n.push(k)
        setTimeout(() => {
          console.log('setting history view', n)
          setChatHistoryView(n)
        }, timeout)
      })
    }
  }

  function loadChatHistory() {
    Remote.charHistory(route.params.charId, charHistoryOffset.current++).then(r => {
      if (r.data.status) {
        console.log(route.params.charId, r.data.data)
        receiveMessage(r.data.data, true)
      } else {
        setMessageText(`Failed to fetch chat history: ${r.data.data}`)
        setMessageState(true)
      }
    }).catch(r => {
      setMessageText(`Failed to fetch chat history: NetworkError`)
      setMessageState(true)
    })
  }

  function uploadAllAttachment() {
    return (async () => {
      for (let i in chatImages.current) {
        console.log('No messages?', chatImages.current[i])
        let r = await fs.uploadAsync(Remote.attachmentUploadImage(), chatImages.current[i], { httpMethod: 'POST', uploadType: fs.FileSystemUploadType.MULTIPART })
        if (r.status == 200) {
          data = JSON.parse(r.body)
          if (data.status) {
            chatImages.current[i] = Remote.attachmentDownload(data.id)
          } else {
            throw data.data
          }
        } else {
          throw 'NetworkError'
        }
      }
    })()
  }

  function buildMessageChainAndSend(text, images) {
    let msgChain = []
    if (text.length !== 0) {
      msgChain.push(text)
    }
    images.map(v => { msgChain.push('image:' + v) })
    clearChatImages()
    console.log("???不是我日志呢？")
    if (chatSession.current === null) {
      console.log("Establishing a new session")
      Remote.chatEstablish(charName, msgChain).then(r => {
        if (r.data.status) {
          console.log(r.data)
          chatSession.current = r.data.session
          receiveMessage(r.data.response)
        }
      })
    } else {
      console.log("In chatting")
      Remote.chatMessage(chatSession.current, msgChain).then(r => {
        if (r.data.status) {
          console.log('?', r.data)
          receiveMessage(r.data.response)
        } else {
          setMessageText(`Failed to send message: ${r.data.data}`)
          setMessageState(true)
        }
      }).catch(r => {
        setMessageText(`Failed to send message: NetworkError`)
        setMessageState(true)
      })
    }
  }

  function buildTextView(availableStickers, text) {
    return Remote.splitEmotionAndText(availableStickers, text).map((v, k) => {
      if (v.startsWith('text:')) {
        return <Text key={k}>{v.substring(5)}</Text>
      } else {
        return <Text key={k}><CachedImage style={{ width: 48, height: 48, borderRadius: 24, display: '' }} imageStyle={{ borderRadius: 24 }} source={Remote.stickerGet(useStickerSet, v.substring('4'))} /></Text>
        // return <Text key={k}>{v.substring(4)}</Text>
      }
    })
  }

  return (
    <PaperProvider theme={mdTheme()}>
      <>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()}></Appbar.BackAction>
          <Appbar.Content title={charName}></Appbar.Content>
          <Appbar.Action icon={'book-edit'} onPress={() => navigation.navigate('Edit Character', { ...route.params })}></Appbar.Action>
        </Appbar.Header>
        <TouchableWithoutFeedback onPress={() => {
          triggerAnimation()
          setMenuStatus(false)
        }} accessible={false}>
          <>
            <ScrollView ref={chatHistoryViewRef} style={{ height: '100%', paddingHorizontal: 10, marginBottom: messageAreaPadding }}>
              {chatHistoryView.map((v, k) => (
                <View
                  key={k}
                  style={{
                    flexDirection: 'row',
                    width: '100%',
                    marginBottom: 10,
                    justifyContent: v.role === 'model' ? 'flex-start' : 'flex-end',
                  }}
                >
                  {v.role === 'model' && (
                    <>
                      <Avatar.Image style={{ marginRight: 10 }} source={() => <CachedImage style={{ width: 64, height: 64, borderRadius: 32 }} imageStyle={{ borderRadius: 32 }} source={Remote.charAvatar(route.params.charId)} />}></Avatar.Image>
                      <View style={{ flexDirection: 'column' }}>
                        <Text style={{ marginBottom: 5, textAlign: 'left' }}>{route.params.charName}</Text>
                        <Card style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                          <Card.Content>
                            <Text>{buildTextView(availableStickers.map(r => r.name), v.text)}</Text>
                          </Card.Content>
                        </Card>
                      </View>
                    </>
                  )}
                  {v.role === 'user' && (
                    <>
                      <View style={{ flexDirection: 'column' }}>
                        <Text style={{ marginBottom: 5, textAlign: 'right' }}>{sessionUsername}</Text>
                        {v.type == 0 &&
                          <Card style={{ alignSelf: 'flex-end', minWidth: 76, maxWidth: '85%' }}>
                            <Card.Content>
                              <Text>{buildTextView(availableStickers.map(r => r.name), v.text)}</Text>
                            </Card.Content>
                          </Card>}
                        {v.type == 1 &&
                          <TouchableRipple style={{ alignSelf: 'flex-end', width: 100, height: 100 }} onPress={() => {
                            setPreviewImage(v.text)
                            setImagePreviewVisibility(true)
                          }}>
                            <CachedImage style={{ flex: 1, padding: 10, borderRadius: 10 }} resizeMode="cover" imageStyle={{ borderRadius: 10 }} source={v.text} />
                          </TouchableRipple>}
                      </View>
                      <Avatar.Image style={{ marginLeft: 10 }} source={() => <CachedImage style={{ width: 64, height: 64, borderRadius: 32 }} imageStyle={{ borderRadius: 32 }} source={Remote.getAvatar()} />}></Avatar.Image>
                    </>
                  )}
                </View>
              ))}
            </ScrollView>
            <KeyboardAvoidingView onLayout={e => {
              if (e.nativeEvent !== null) {
                setMessageAreaPadding(e.nativeEvent.layout.height)
              }
            }} behavior={Platform.OS == 'ios' ? 'padding' : 'none'} style={{
              width: '100%',
              bottom: 0,
              position: 'absolute',
              marginTop: 20,
              backgroundColor: mdTheme().colors.surfaceVariant
            }}>
              <View style={{ flexDirection: 'row', alignContent: 'center', justifyContent: 'center', alignItems: 'center' }}>
                <TextInput ref={chatMessageInputRef} value={chatMessageInput} onFocus={() => {
                  setTimeout(() => chatHistoryViewRef.current?.scrollToEnd({ animated: true }), 100)
                  triggerAnimation()
                  setMenuStatus(false)
                }}
                  onSelectionChange={(e) => {
                    chatMessageInputCursorPosition.current = e.nativeEvent.selection.end + 1
                  }}
                  onChangeText={v => {
                    setChatMessageInput(v)
                  }} mode='flat' style={{ flex: 16 }} multiline={true} label={'Type messages'}></TextInput>
                <IconButton icon="send" style={{ flex: 2 }} onPress={() => {
                  uploadAllAttachment().then(() => {
                    buildMessageChainAndSend(chatMessageInput, chatImages.current)
                    setChatMessageInput('')
                  }).catch(r => {
                    setMessageText(`Unable to upload attachments: ${r}`)
                    setMessageState(true)
                  })

                  chatImages.current = []
                }}></IconButton>
                <IconButton icon="dots-vertical" style={{ flex: 2 }} onPress={() => {
                  if (menuStatus) {
                    triggerAnimation()
                    setMenuStatus(false)
                  } else {
                    chatMessageInputRef.current?.blur()
                    triggerAnimation()
                    setMenuStatus(true)
                    setTimeout(() => chatHistoryViewRef.current?.scrollToEnd({animated: true}), 300)
                  }
                }}></IconButton>
              </View>
              <View style={{ flexDirection: 'row' }}>
                {chatImagesView.map((v, k) => <>
                  <TouchableRipple onPress={() => removeChatImages(k)}><Image
                    key={k}
                    source={{ uri: v }}
                    style={{ width: 48, height: 48, margin: 5, borderRadius: 12 }}
                    imageStyle={{ borderRadius: 12 }}
                  /></TouchableRipple></>)}
              </View>
              {menuStatus && <Animated.View style={{ height: Dimensions.get('window').height * 0.25 }}>
                {currentMenuTab == 'stickers' && <ScrollView style={{ height: '100%', paddingHorizontal: 10 }}>
                  {availableStickers.map(r => <List.Item
                    key={r.id}
                    left={() => <CachedImage style={{ width: 48, height: 48, borderRadius: 24, display: '' }} imageStyle={{ borderRadius: 24 }} source={Remote.stickerGet(useStickerSet, r.name)} />}
                    title={r.name}
                    onPress={() => {
                      insertIntoChatInput(`(${r.name})`)
                    }}
                  >
                  </List.Item>)}
                </ScrollView>}

                {currentMenuTab == 'audio' && <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                  <IconButton
                    icon="microphone"
                    mode='contained'
                    size={56}
                    onTouchStart={(e) => {
                      Audio.requestPermissionsAsync().then(r => {
                        if (r.granted) {
                          (async () => {
                            await Audio.setAudioModeAsync({
                              allowsRecordingIOS: true,
                              playsInSilentModeIOS: true,
                            });
                            audioRecordingRef.current = new Audio.Recording()
                            await audioRecordingRef.current.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)
                            await audioRecordingRef.current.startAsync()
                            setAudioRecordingStatus(true)
                          })()
                        }
                      })
                    }}
                    onTouchEnd={(e) => {
                      (async () => {
                        await audioRecordingRef.current.stopAndUnloadAsync()
                        await Audio.setAudioModeAsync({ allowsRecordingIOS: false })
                        setAudioRecordingStatus(false)
                        console.log(audioRecordingRef.current.getURI())
                        fs.uploadAsync(
                          Remote.stt(),
                          audioRecordingRef.current.getURI(),
                          { httpMethod: 'POST', uploadType: fs.FileSystemUploadType.MULTIPART }).then(r => {
                            if (r.status == 200) {
                              data = JSON.parse(r.body)
                              if (data.status) {
                                insertIntoChatInput(data.data)
                              } else {
                                setMessageText(`Unable to invoke STT service: ${data.data}`)
                                setMessageState(true)
                              }
                            } else {
                              setMessageText(`Unable to invoke STT service: NetworkError`)
                              setMessageState(true)
                            }
                          })
                      })()
                    }}
                  />
                  {audioRecordingStatus && <Text variant='bodyMedium' style={{ marginTop: 10 }}>
                    Recording...
                  </Text>}
                  {!audioRecordingStatus && <Text variant='bodyMedium' style={{ marginTop: 10 }}>
                    Press to start
                  </Text>}
                </View>}
                {currentMenuTab == 'image' && <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                  <Button mode='contained' style={{ width: '75%', marginTop: 20 }} onPress={() => {
                    ImagePicker.launchImageLibraryAsync({ allowsMultipleSelection: true }).then(r => {
                      if (!r.canceled) {
                        r.assets.forEach(v => {
                          console.log('a', v)
                          updateChatImages(v.uri)
                        })
                      }
                    })
                  }}><Icon source='file-image-plus' color={theme.colors.primaryContainer}></Icon> Choose a image...</Button>
                  <Button mode='contained' style={{ width: '75%', marginTop: 20 }} onPress={() => {
                    ImagePicker.requestCameraPermissionsAsync().then(r => {
                      if (r.granted) {
                        ImagePicker.launchCameraAsync().then(r => {
                          if (!r.canceled) {
                            r.assets.forEach(v => {
                              console.log('a', v)
                              updateChatImages(v.uri)
                            })
                          }
                        })
                      }
                    })
                  }}><Icon source='camera' color={theme.colors.primaryContainer}></Icon> Or shoot one!</Button>
                </View>}
              </Animated.View>}
              {menuStatus && <View style={{ marginBottom: 20 }}>
                <SegmentedButtons
                  style={{ paddingHorizontal: 10 }}
                  value={currentMenuTab}
                  onValueChange={v => setCurrentMenuTab(v)}
                  buttons={[
                    {
                      value: 'stickers',
                      label: 'Stickers',
                      icon: 'sticker-emoji'
                    },
                    {
                      value: 'audio',
                      label: 'Audio',
                      icon: 'microphone'
                    },
                    {
                      value: 'image',
                      label: 'Image',
                      icon: 'camera'
                    },
                  ]}
                />
              </View>}
            </KeyboardAvoidingView>
            <Portal>
              <ImageView visible={imagePreviewVisibility} images={[{uri: previewImage}]} imageIndex={0} onRequestClose={() => setImagePreviewVisibility(false)}></ImageView>
              <Message timeout={5000} style={{ marginBottom: 64 }} state={messageState} onStateChange={() => { setMessageState(false) }} icon="alert-circle" text={messageText} />
            </Portal>
          </>
        </TouchableWithoutFeedback >
      </>
    </PaperProvider >
  )
};


export default withTheme(Chatroom);