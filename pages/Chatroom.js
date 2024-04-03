import * as React from 'react';

// import AvatarImage from '../shared/AvatarImage'
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
  Avatar,
  Card,
  IconButton,
  PaperProvider,
  Portal,
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
  const chatHistoryViewRef = React.useRef(null)
  const charHistoryOffset = React.useRef(0)
  const chatSession = React.useRef(null)
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

  useFocusEffect(React.useCallback(() => {
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
          console.log(r.data.data.map(r => r.name))
          setAvailableStickers(r.data.data.map(r => r.name))
        }
      })
    }
  }, [useStickerSet])

  React.useEffect(() => {
    let r = []
    for (let i = 0; i < chatImages.current.length; i++) {
      // uploaded attachment url
      r.push(chatImages.current[i])
    }
    setChatImagesView(r)
  }, [chatImages])

  React.useEffect(() => {
    setTimeout(() => {
      console.log('Scrolling')
      chatHistoryViewRef.current?.scrollToEnd({ animated: true })
    }, 100)
  }, [chatHistoryView])

  function receiveMessage(response, order = false) {
    if (order) {
      console.log('reversed order')
      chatHistoryView.forEach(k => { response.push(k) })
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

  function buildMessageChainAndSend(text, images) {
    let msgChain = []
    msgChain.push(text)
    images.map(v => { msgChain.push('image:' + v) })
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

        }} accessible={false}>
          <>
            <ScrollView ref={chatHistoryViewRef} style={{ height: '100%', paddingHorizontal: 10, marginBottom: 56 }}>
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
                            <Text>{buildTextView(availableStickers, v.text)}</Text>
                          </Card.Content>
                        </Card>
                      </View>
                    </>
                  )}
                  {v.role === 'user' && (
                    <>
                      <View style={{ flexDirection: 'column' }}>
                        <Text style={{ marginBottom: 5, textAlign: 'right' }}>{sessionUsername}</Text>
                        <Card style={{ alignSelf: 'flex-end', minWidth: 76, maxWidth: '85%' }}>
                          <Card.Content>
                            <Text>{buildTextView(availableStickers, v.text)}</Text>
                          </Card.Content>
                        </Card>
                      </View>
                      <Avatar.Image style={{ marginLeft: 10 }} source={() => <CachedImage style={{ width: 64, height: 64, borderRadius: 32 }} imageStyle={{ borderRadius: 32 }} source={Remote.getAvatar()} />}></Avatar.Image>
                    </>
                  )}
                </View>
              ))}
            </ScrollView>
            <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? 'padding' : 'none'} style={{ width: '100%', bottom: 0, position: 'absolute', marginTop: 20, backgroundColor: mdTheme().colors.surfaceVariant }}>
              <View style={{ flexDirection: 'row', alignContent: 'center', justifyContent: 'center', alignItems: 'center' }}>
                <TextInput value={chatMessageInput} onFocus={() => chatHistoryViewRef.current?.scrollToEnd({ animated: true })} onChangeText={v => { setChatMessageInput(v) }} mode='flat' style={{ flex: 16 }} label={'Type messages'}></TextInput>
                <IconButton icon="send" style={{ flex: 2 }} onPress={() => {
                  buildMessageChainAndSend(chatMessageInput, chatImages.current)
                  setChatMessageInput('')
                  chatImages.current = []
                }}></IconButton>
                <IconButton icon="dots-vertical" style={{ flex: 2 }} onPress={() => { }}></IconButton>
              </View>
              <View style={{ flexDirection: 'row' }}>
                {chatImagesView.map((v, k) => <>
                  <TouchableRipple onPress={() => console.log('Pressed')}><Avatar.Image
                    style={{ margin: 5 }}
                    key={k}
                    source={{ uri: v }}
                    size={48}
                  /></TouchableRipple></>)}
              </View>
            </KeyboardAvoidingView>
            <Portal>
              <Message timeout={5000} style={{ marginBottom: 64 }} state={messageState} onStateChange={() => { setMessageState(false) }} icon="alert-circle" text={messageText} />
            </Portal>
          </>
        </TouchableWithoutFeedback >
      </>
    </PaperProvider >
  )
};


export default withTheme(Chatroom);