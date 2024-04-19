import * as React from 'react';

import {
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  Appbar,
  Button,
  Dialog,
  List,
  PaperProvider,
  Portal,
  Text,
  TextInput,
  withTheme,
} from 'react-native-paper';

import { CachedImage } from '@georstat/react-native-image-cache';
import { useFocusEffect } from '@react-navigation/native';

import Message from '../components/Message';
import * as Remote from '../shared/remote';
import { mdTheme } from '../shared/styles';

const NewStickerSetDialog = ({ state, onDismiss, onOk, onErr }) => {
  const [setName, setSetName] = React.useState('')
  const TextInputRef = React.useRef(null)

  const submit = (setName) => {
    Remote.createStickerSet(setName).then(data => {
      if (data.data.status) {
        onOk()
      } else {
        onErr(data.data.data)
      }
    }).catch(() => onErr('NetworkError'))
  }

  return <Dialog onDismiss={onDismiss} visible={state}>
    <Dialog.Title>Create a new sticker set</Dialog.Title>
    <Dialog.Content>
      <TouchableWithoutFeedback onPress={
        () => {
          TextInputRef.current?.blur()
        }
      }><View>
          <Text variant='bodyMedium'>
            Think of a name of your sticker set. Hmm, how about Naganohara Yoimiya?
          </Text>
          <TextInput ref={TextInputRef} style={{ marginTop: 10 }} label={'Sticker Set Name'} value={setName} onChangeText={v => setSetName(v)}></TextInput>
        </View>
      </TouchableWithoutFeedback>
    </Dialog.Content>
    <Dialog.Actions>
      <Button onPress={() => onDismiss()}>Cancel</Button>
      <Button onPress={() => submit(setName)}>Create</Button>
    </Dialog.Actions>
  </Dialog>
}

const Sticker = ({ navigation, route }) => {
  const [messageState, setMessageState] = React.useState(false)
  const [messageText, setMessageText] = React.useState("")
  const [stickerSetList, setStickerSetList] = React.useState(null)
  const [stickerSetDialogState, setStickerSetDialogState] = React.useState(false)

  const updateStickers = () => {
    Remote.stickerSetList().then(r => {
      if (r.data.status) {
        setStickerSetList(r.data.data)
      } else {
        setMessageText(`Unable to load sticker set list: ${r.data.data}`)
        setMessageState(true)
      }
    }).catch(e => {
      setMessageText(`Unable to load sticker set list: NetworkError`)
      setMessageState(true)
    })
  }

  useFocusEffect(React.useCallback(() => {
    updateStickers()
  }, []))

  return (
    <PaperProvider theme={mdTheme()}>
      <>
        <Appbar.Header>
          <Appbar.Content title={stickerSetList === null ? "Stickers (Loading...)" : "Stickers"}></Appbar.Content>
          <Appbar.Action icon="plus" onPress={() => setStickerSetDialogState(true)}></Appbar.Action>
        </Appbar.Header>
        <TouchableWithoutFeedback onPress={() => { }} accessible={false}>
          <>
            {(stickerSetList === null || stickerSetList.length == 0) &&
              <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, padding: 10 }}>
                <Text style={{ textAlign: 'center' }}>
                  Try to add a sticker set by pressing `+` button in Appbar
                </Text>
              </View>}
            {(stickerSetList !== null && stickerSetList.length > 0) &&
              <>
                <ScrollView>
                  {stickerSetList.map(r => (<List.Item
                    key={r.id}
                    title={r.setName}
                    left={props => <CachedImage style={{ width: 64, height: 64, borderRadius: 32, marginLeft: 10 }} imageStyle={{ borderRadius: 32 }} source={Remote.stickerGet(r.id, r.previewSticker)} />}
                    onPress={() => {
                      navigation.navigate('Edit Sticker Set', r)
                    }}>
                  </List.Item>))}
                </ScrollView>
              </>}
            <Portal>
              <NewStickerSetDialog state={stickerSetDialogState} onDismiss={() => setStickerSetDialogState(false)} onOk={() => {
                updateStickers()
                setStickerSetDialogState(false)
              }} onErr={(v) => {
                setStickerSetDialogState(false)
                setMessageText(`Unable to create sticker set: ${v}`)
                setMessageState(true)
              }}></NewStickerSetDialog>
              <Message timeout={5000} style={{ marginBottom: 64 }} state={messageState} onStateChange={() => { setMessageState(false) }} icon="alert-circle" text={messageText} />
            </Portal>
          </>
        </TouchableWithoutFeedback >
      </>
    </PaperProvider>
  )
};


export default withTheme(Sticker);