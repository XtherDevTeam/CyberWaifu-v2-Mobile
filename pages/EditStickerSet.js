import * as React from 'react';

import * as fs from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import {
  Image,
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
  Dialog,
  Icon,
  IconButton,
  List,
  PaperProvider,
  Portal,
  Text,
  TextInput,
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

const AddStickerDialog = ({ state, onOk, onErr, onDismiss }) => {
  const [stickerName, setStickerName] = React.useState("")
  const [stickerFileUri, setStickerFileUri] = React.useState("")
  const stickerNameInputRef = React.useRef(null)

  return <Dialog visible={state} onDismiss={onDismiss}>
    <Dialog.Title>Add sticker</Dialog.Title>
    <Dialog.Content>
      <TouchableWithoutFeedback onPress={() => {
        stickerNameInputRef.current?.blur()
      }}>
        <View >
          <Text variant='bodyMedium'>
            The sticker name presenting to character prompt for available stickers.
          </Text>
          <TextInput
            ref={stickerNameInputRef}
            style={{ marginTop: 10, width: '100%' }}
            label={'Sticker name'}
            placeholder='E.g. happy, guility, awkward...'
            value={stickerName}
            onChangeText={v => setStickerName(v)}>
          </TextInput>
          <Button mode='contained-tonal' style={{ width: '100%', marginTop: 20 }} onPress={() => {
            ImagePicker.launchImageLibraryAsync({}).then(r => {
              if (!r.canceled) {
                setStickerFileUri(r.assets.at(0).uri)
              }
            })
          }}><Icon source='file-image-plus'></Icon> Choose a image</Button>
          <Image
            style={{ width: 64, height: 64, borderRadius: 32, marginTop: 20, alignSelf: 'center' }}
            imageStyle={{ borderRadius: 32 }}
            source={stickerFileUri === '' ? require('../assets/good_job.png') : { uri: stickerFileUri }} />
        </View>
      </TouchableWithoutFeedback>

    </Dialog.Content>
    <Dialog.Actions>
      <Button onPress={onDismiss}>Cancel</Button>
      <Button onPress={() => onOk(stickerName, stickerFileUri)}>Add</Button>
    </Dialog.Actions>
  </Dialog>
}


const DeleteStickerDialog = ({ state, stickerId, onOk, onErr, onDismiss }) => {
  return <Dialog onDismiss={onDismiss} visible={state}>
    <Dialog.Title>Confirm deleting sticker</Dialog.Title>
    <Dialog.Content>
      <Text variant='bodyMedium'>
        Are you really going to delete sticker {stickerId}?
      </Text>
    </Dialog.Content>
    <Dialog.Actions>
      <Button onPress={onDismiss}>Cancel</Button>
      <Button onPress={() => Remote.deleteSticker(stickerId).then(r => {
        if (r.data.status) {
          onOk()
        } else {
          onErr(r.data.data)
        }
      }).catch(r => {
        onErr('NetworkError')
      })}>Confirm</Button>
    </Dialog.Actions>
  </Dialog>
}


const EditStickerSet = ({ navigation, route }) => {
  const [messageState, setMessageState] = React.useState(false)
  const [messageText, setMessageText] = React.useState("")
  const [addStickerDialogState, setAddStickerDialogState] = React.useState(false)

  const [stickerSetName, setStickerSetName] = React.useState("")
  const [deleteStickerDialogState, setDeleteStickerDialogState] = React.useState({ state: false, stickerId: null })
  const [availableStickers, setAvailableStickers] = React.useState([])

  const scrollViewRef = React.useRef(null)

  const updateAvailableSticker = () => {
    Remote.stickerList(route.params.id).then(r => {
      if (r.data.status) {
        setAvailableStickers(r.data.data)
      } else {
        setMessageText(`Unable to update stickers: ${r.data.data}`)
        setMessageState(true)
      }
    }).catch(r => {
      setMessageText(`Unable to update stickers: NetworkError`)
      setMessageState(true)
    })
  }

  useFocusEffect(React.useCallback(() => {
    setStickerSetName(route.params.setName)
    updateAvailableSticker()
  }, []))

  return (
    <PaperProvider theme={mdTheme()}>
      <>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()}></Appbar.BackAction>
          <Appbar.Content title={"Edit Sticker Set"}></Appbar.Content>
        </Appbar.Header>
        <KeyboardAvoidingView behavior='padding' style={{ height: '100%' }}>
          <TouchableWithoutFeedback onPress={() => {
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }} accessible={false} style={{ height: '100%' }}>
            <>
              <ScrollView ref={scrollViewRef}>
                <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}>
                  <CachedImage style={{ width: 64, height: 64, borderRadius: 32, marginLeft: 10 }} imageStyle={{ borderRadius: 32 }} source={Remote.stickerGet(route.params.id, route.params.previewSticker)} />
                  <TextInput
                    label="Sticker set name"
                    placeholder='Naganohara Yoimiya'
                    style={{ width: '90%', marginTop: 20 }}
                    value={stickerSetName}
                    onChangeText={(v) => setStickerSetName(v)}
                  />
                  <Button mode='contained-tonal' style={{ width: '90%', marginTop: 20 }} onPress={() => {
                    Remote.renameStickerSet(route.params.id, stickerSetName).then(r => {
                      if (r.data.status) {
                        setMessageText('Updated sticker set name successfully.')
                        setMessageState(true)
                      } else {
                        setMessageText(`Unable to update sticker set name: ${r.data.data}`)
                        setMessageState(true)
                      }
                    }).catch(r => {
                      setMessageText(`Unable to update sticker set name: NetworkError`)
                      setMessageState(true)
                    })
                  }}><Icon source='pencil'></Icon> Rename</Button>
                  <Text variant='labelLarge' style={{ marginTop: 20 }}>
                    Available stickers ({availableStickers.length})
                  </Text>
                  {availableStickers.map((v, k) => <List.Item
                    key={v.id}
                    left={() => <CachedImage key={k} style={{ width: 48, height: 48, borderRadius: 24, marginLeft: 10 }} imageStyle={{ borderRadius: 32 }} source={Remote.stickerGet(route.params.id, v.name)} />}
                    title={v.name}
                    right={() => <IconButton icon={'delete'} onPress={() => {
                      setDeleteStickerDialogState({ state: true, stickerId: v.id })
                    }}></IconButton>}
                  ></List.Item>)}
                  <Button mode='contained-tonal' style={{ width: '90%', marginTop: 20 }} onPress={() => {
                    setAddStickerDialogState(true)
                  }}><Icon source='plus'></Icon> Add sticker</Button>
                </View>
              </ScrollView>
              <Portal>
                <DeleteStickerDialog
                  state={deleteStickerDialogState.state}
                  stickerId={deleteStickerDialogState.stickerId}
                  onOk={
                    () => {
                      updateAvailableSticker()
                      setDeleteStickerDialogState({ state: false, stickerId: null })
                    }
                  }
                  onErr={
                    r => {
                      setMessageText(`Unable to delete sticker: ${r}`)
                      setDeleteStickerDialogState({ state: false, stickerId: null })
                    }
                  }
                  onDismiss={
                    () => {
                      setDeleteStickerDialogState({ state: false, stickerId: null })
                    }
                  }
                >


                </DeleteStickerDialog>
                <AddStickerDialog state={addStickerDialogState} onOk={(name, v) => {
                  fs.uploadAsync(Remote.addStickerToSet(route.params.id, name), v, { httpMethod: 'POST', uploadType: fs.FileSystemUploadType.MULTIPART }).then(r => {
                    if (r.status == 200) {
                      data = JSON.parse(r.body)
                      if (data.status) {
                        updateAvailableSticker()
                      } else {
                        setMessageText(`Unable to add sticker: ${data.data}`)
                        setMessageState(true)
                      }
                    } else {
                      setMessageText(`Unable to add sticker: NetworkError`)
                      setMessageState(true)
                    }
                  })
                  setAddStickerDialogState(false)
                }} onErr={r => {
                  setMessageText(`Unable to add sticker: ${r}`)
                  setMessageState(true)
                  setAddStickerDialogState(false)
                }} onDismiss={() => {
                  setAddStickerDialogState(false)
                }}></AddStickerDialog>
                <Message timeout={5000} style={{ marginBottom: 64 }} state={messageState} onStateChange={() => { setMessageState(false) }} icon="alert-circle" text={messageText} />
              </Portal>
            </>
          </TouchableWithoutFeedback >
        </KeyboardAvoidingView>
      </>
    </PaperProvider>
  )
};


export default withTheme(EditStickerSet);