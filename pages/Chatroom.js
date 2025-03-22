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
  RefreshControl,
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

import AudioMessageView from '../components/AudioMessageView';
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

  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)

  const keepAliveTimer = React.useRef(null)
  const [isReceivingMessage, setIsReceivingMessage] = React.useState(false)
  const [isTyping, setIsTyping] = React.useState(false)
  const [pendingMsgChain, setPendingMsgChain] = React.useState([])
  const [pendingSendTimer, setPendingSendTimer] = React.useState(null)

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

  React.useEffect(() => {
    if (audioRecordingStatus) {
      console.log('triggerred audio recording status change')
      discardPendingMessageTimer()
    }
  }, [audioRecordingStatus])

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
    if (!isLoading) {
      setTimeout(() => {
        console.log('Scrolling')
        chatHistoryViewRef.current?.scrollToEnd({ animated: true })
      }, 100)
    } else {
      setIsLoading(false)
    }
  }, [chatHistoryView])

  React.useEffect(() => {
    console.log('triggerred reset pending msg timer by message chain change')
    addTemporaryMessage(pendingMsgChain)
    resetPendingMsgTimer()
  }, [pendingMsgChain])

  function clearTemporaryMessage() {
    let a = []
    chatHistoryView.forEach(k => { k.role.endsWith('_temporary') ? null : a.push(k) })
    setChatHistoryView(a)
  }

  function addTemporaryMessage(msgChain) {
    // setChatHistoryView([...chatHistoryView, { role: 'user_temporary', type: 0, text: 'Sending...' }])
    let a = []
    chatHistoryView.forEach(k => { k.role.endsWith('_temporary') ? null : a.push(k) })
    let to_push = msgChain.map(v => {
      if (v.startsWith('image:')) {
        return { role: 'user_temporary', type: 1, text: v.substring(6) }
      } else if (v.startsWith('audio:')) {
        return { role: 'user_temporary', type: 2, text: v.substring(6) }
      } else {
        return { role: 'user_temporary', type: 0, text: v }
      }
    })
    console.log('adding temporary message', to_push)
    setChatHistoryView([...a, ...to_push])
  }

  function receiveMessage(response, order = false) {
    setIsReceivingMessage(false)
    if (order) {
      console.log('reversed order')
      chatHistoryView.forEach(k => {
        response.push(k)
      })
      setChatHistoryView(response)
    } else {
      // Filter out temporary messages from the chat history
      const filteredHistory = chatHistoryView.filter(message => !message.role.endsWith('_temporary'));

      // Create a queue to maintain order of messages
      const messageQueue = []
      let firstFlag = true

      // Process each response and add it to the queue with calculated delay
      response.forEach(resp => {
        let delay = 0
        if (resp.role === 'model' && resp.type === 0) {
          if (firstFlag) {
            delay = resp.text.length * 10 // Calculate delay based on text length
          } else {
            firstFlag = false
          }
        }

        messageQueue.push({ message: resp, delay })
      });

      function timeout(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
      }

      // Process each message in the queue
      (async () => {
        for (let i = 0; i < messageQueue.length; i++) {
          const { message, delay } = messageQueue[i]
          console.log('Processing message', message, 'with delay', delay)
          await timeout(delay)
          filteredHistory.push(message)
          setChatHistoryView([...filteredHistory])
        }
      })()
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
        let r = await fs.uploadAsync(Remote.attachmentUploadImage(), chatImages.current[i], { httpMethod: 'POST', uploadType: fs.FileSystemUploadType.MULTIPART })
        if (r.status == 200) {
          data = JSON.parse(r.body)
          if (data.status) {
            chatImages.current[i] = data.id
          } else {
            throw data.data
          }
        } else {
          throw 'NetworkError'
        }
      }
    })()
  }

  function sendMessageChain(msgChain) {
    if (chatSession.current === null) {
      setIsReceivingMessage(true)
      Remote.chatEstablish(charName, msgChain).then(r => {
        if (r.data.status) {
          console.log(r.data)
          chatSession.current = r.data.session
          receiveMessage(r.data.response)
        }
        setPendingMsgChain([])
      })
    } else {
      setIsReceivingMessage(true)
      Remote.chatMessage(chatSession.current, msgChain).then(r => {
        if (r.data.status) {
          receiveMessage(r.data.response)
        } else {
          setMessageText(`Failed to send message: ${r.data.data}`)
          setMessageState(true)
        }
        setPendingMsgChain([])
      }).catch(r => {
        setMessageText(`Failed to send message: NetworkError`)
        setMessageState(true)
      })
    }
  }

  function sendAudio(attachmentId) {
    setPendingMsgChain([...pendingMsgChain, `audio:${attachmentId}`])
  }

  function buildMessageChain(text, images) {
    let msgChain = [...pendingMsgChain] // force copy, otherwise it can't trigger resetPendingMsgTimer
    if (text.length !== 0) {
      msgChain.push(text)
    }
    images.map(v => { msgChain.push('image:' + v) })
    clearChatImages()
    setChatMessageInput('')
    setPendingMsgChain(msgChain)
  }

  function discardPendingMessageTimer() {
    if (pendingSendTimer !== null) {
      clearTimeout(pendingSendTimer)
      setPendingSendTimer(null)
    }
  }

  function resetPendingMsgTimer() {
    if (pendingMsgChain.length === 0) {
      return
    }
    let f = () => sendMessageChain(pendingMsgChain)
    if (pendingSendTimer !== null) {
      clearTimeout(pendingSendTimer)
    }
    // if user is recording voice message, do not send message immediately
    // deprecated: cuz it will discard this timer directly.
    // if (audioRecordingStatus) {
    //   console.log('delayed sending message by 1145141919')
    //   setPendingSendTimer(setTimeout(f, 1145141919))
    // }

    // if user is typing message, wait for 10 seconds before sending
    // if (isTyping) {
    //   setPendingSendTimer(setTimeout(f, 10000))
    // }
    // if menu is open, user probably wants to send emotion stickers, so postpone sending message
    if (menuStatus) {
      setPendingSendTimer(setTimeout(f, 5000))
    } else {
      setPendingSendTimer(setTimeout(f, 1000))
    }
  }

  function buildTextView(availableStickers, text) {
    return Remote.splitEmotionAndText(availableStickers, text).map((v, k) => {
      if (v.startsWith('text:')) {
        return <Text key={k}>{v.substring(5)}</Text>
      } else {
        return <Text key={k}><CachedImage style={{ width: 48, height: 48, borderRadius: 24, display: '' }} imageStyle={{ borderRadius: 24 }} source={Remote.stickerGet(useStickerSet, v.substring('4'))} /></Text>
      }
    })
  }

  return (
    <PaperProvider theme={mdTheme()}>
      <>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()}></Appbar.BackAction>
          <Appbar.Content title={isReceivingMessage ? `${charName} (Typing...)` : charName}></Appbar.Content>
          <Appbar.Action icon={'book-edit'} onPress={() => navigation.navigate('Edit Character', { ...route.params })}></Appbar.Action>
        </Appbar.Header>
        <TouchableWithoutFeedback onPress={() => {
          triggerAnimation()
          setMenuStatus(false)
        }} accessible={false}>
          <>
            <ScrollView ref={chatHistoryViewRef}
              refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={() => {
                  setIsLoading(true)
                  loadChatHistory()
                }} />
              }
              style={{ height: '100%', paddingHorizontal: 10, marginBottom: messageAreaPadding }}>
              {chatHistoryView.map((v, k) => (
                <View
                  key={k}
                  style={{
                    flexDirection: 'row',
                    width: '100%',
                    marginBottom: 10,
                    justifyContent: v.role.startsWith('model') ? 'flex-start' : 'flex-end',
                  }}
                >
                  {(v.role.startsWith('model')) && (
                    <>
                      <Avatar.Image style={{ marginRight: 10 }} size={48} source={() => <CachedImage style={{ width: 48, height: 48, borderRadius: 24 }} imageStyle={{ borderRadius: 24 }} source={Remote.charAvatar(route.params.charId)} />}></Avatar.Image>
                      <View style={{ flexDirection: 'column' }}>
                        <Text style={{ marginBottom: 5, textAlign: 'left' }}>{route.params.charName}</Text>
                        {v.type == 0 &&
                          <Card style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
                            <Card.Content>
                              <Text>{buildTextView(availableStickers.map(r => r.name), v.text)}</Text>
                            </Card.Content>
                          </Card>
                        }
                        {v.type == 2 && <Card style={{ alignSelf: 'flex-start', minWidth: 100, maxWidth: '85%' }}><AudioMessageView audioAttachment={v.text}></AudioMessageView></Card>}
                      </View>
                    </>
                  )}
                  {v.role.startsWith('user') && (
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
                            setPreviewImage(Remote.attachmentDownload(v.text))
                            setImagePreviewVisibility(true)
                          }}>
                            <CachedImage style={{ flex: 1, padding: 10, borderRadius: 10 }} resizeMode="cover" imageStyle={{ borderRadius: 10 }} source={Remote.attachmentDownload(v.text)} />
                          </TouchableRipple>}
                        {v.type == 2 && <Card style={{ alignSelf: 'flex-end', minWidth: 100, maxWidth: '85%' }}><AudioMessageView audioAttachment={v.text}></AudioMessageView></Card>}
                      </View>
                      <Avatar.Image style={{ marginLeft: 10 }} size={48} source={() => <CachedImage style={{ width: 48, height: 48, borderRadius: 24 }} imageStyle={{ borderRadius: 24, height: 48, width: 48 }} source={Remote.getAvatar()} />}></Avatar.Image>
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
                <TextInput ref={chatMessageInputRef} value={chatMessageInput}
                  onFocus={() => {
                    setIsTyping(true)
                    setTimeout(() => chatHistoryViewRef.current?.scrollToEnd({ animated: true }), 100)
                    triggerAnimation()
                    discardPendingMessageTimer()
                    setMenuStatus(false)
                    if (chatSession.current !== null) {
                      keepAliveTimer.current = setInterval(() => {
                        Remote.chatKeepAlive(chatSession.current)
                      }, 5000)
                    }
                  }}
                  onBlur={() => {
                    setIsTyping(false)
                    resetPendingMsgTimer()
                    console.log('triggerred reset pending msg timer by blur')
                    clearInterval(keepAliveTimer.current)
                  }}
                  onSelectionChange={(e) => {
                    chatMessageInputCursorPosition.current = e.nativeEvent.selection.end + 1
                  }}
                  onChangeText={v => {
                    setChatMessageInput(v)
                    console.log('triggerred reset pending msg timer by typing')
                  }} mode='flat' style={{ flex: 16, maxHeight: Dimensions.get('window').height * 0.2 }} multiline={true} label={'Type messages'}></TextInput>
                <IconButton icon="send" style={{ flex: 2 }} onPress={() => {
                  uploadAllAttachment().then(() => {
                    buildMessageChain(chatMessageInput, chatImages.current)
                  }).catch(r => {
                    setMessageText(`Unable to upload attachments: ${r}`)
                    setMessageState(true)
                  })
                  chatImages.current = []
                }}></IconButton>
                <IconButton icon="microphone" style={{ flex: 2 }} onPress={() => {
                  navigation.navigate('Voice Chat', { charName: charName, charId: charId, })
                }}></IconButton>
                <IconButton icon="dots-vertical" style={{ flex: 2 }} onPress={() => {
                  if (menuStatus) {
                    triggerAnimation()
                    setMenuStatus(false)
                  } else {
                    chatMessageInputRef.current?.blur()
                    triggerAnimation()
                    setMenuStatus(true)
                    setTimeout(() => chatHistoryViewRef.current?.scrollToEnd({ animated: true }), 300)
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
                        fs.uploadAsync(Remote.attachmentUploadAudio(), audioRecordingRef.current.getURI(), { httpMethod: 'POST', uploadType: fs.FileSystemUploadType.MULTIPART }).then(r => {
                          if (r.status == 200) {
                            data = JSON.parse(r.body)
                            if (data.status) {
                              sendAudio(data.id)
                            } else {
                              setMessageText(`Unable to upload audio attachment: ${data.data}`)
                              setMessageState(true)
                            }
                          } else {
                            setMessageText(`Unable to upload audio attachment: NetworkError`)
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
              <ImageView visible={imagePreviewVisibility} images={[{ uri: previewImage }]} imageIndex={0} onRequestClose={() => setImagePreviewVisibility(false)}></ImageView>
              <Message timeout={5000} style={{ marginBottom: 64 }} state={messageState} onStateChange={() => { setMessageState(false) }} icon="alert-circle" text={messageText} />
            </Portal>
          </>
        </TouchableWithoutFeedback >
      </>
    </PaperProvider >
  )
};


export default withTheme(Chatroom);