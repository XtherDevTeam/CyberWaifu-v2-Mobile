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
  Icon,
  List,
  PaperProvider,
  Portal,
  Text,
  TextInput,
  withTheme,
} from 'react-native-paper';

import { useFocusEffect } from '@react-navigation/native';

import Message from '../components/Message';
import * as Remote from '../shared/remote';
import { mdTheme } from '../shared/styles';

const NewTTSServiceDialog = ({ state, onDismiss, onOk, onErr }) => {
  const [name, setName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [url, setUrl] = React.useState('')
  const [ttsInferYamlPath, setTTSInferYamlPath] = React.useState('')
  const TextInputRef1 = React.useRef(null)
  const TextInputRef2 = React.useRef(null)
  const TextInputRef3 = React.useRef(null)
  const TextInputRef4 = React.useRef(null)

  const submit = (name, description, url, ttsInferYamlPath) => {
    Remote.createTTSService(name, description, url, ttsInferYamlPath).then(data => {
      if (data.data.status) {
        onOk()
      } else {
        onErr(data.data.data)
      }
    }).catch(() => onErr('NetworkError'))
  }

  return <Dialog onDismiss={onDismiss} visible={state}>
    <Dialog.Title>Add a new TTS Service</Dialog.Title>
    <Dialog.Content>
      <TouchableWithoutFeedback onPress={
        () => {
          TextInputRef1.current?.blur()
          TextInputRef2.current?.blur()
          TextInputRef3.current?.blur()
          TextInputRef4.current?.blur()
        }
      }><View>
          <Text variant='bodyMedium'>
            If you are using fast_inference_ branch of GPT-SoVITS, you should provide the path to tts_infer.yaml properly.
          </Text>
          <TextInput ref={TextInputRef1} style={{ marginTop: 10 }} label={'TTS Service name'} value={name} onChangeText={v => setName(v)}></TextInput>
          <TextInput ref={TextInputRef2} style={{ marginTop: 10 }} label={'TTS Service description'} multiline={true} value={description} onChangeText={v => setDescription(v)}></TextInput>
          <TextInput ref={TextInputRef3} style={{ marginTop: 10 }} label={'TTS Service endpoint'} multiline={true} value={url} onChangeText={v => setUrl(v)}></TextInput>
          <TextInput ref={TextInputRef4} style={{ marginTop: 10 }} label={'Path to tts_infer.yaml'} placeholder='GPT_SoVITS/configs/tts_infer.yaml' multiline={true} value={ttsInferYamlPath} onChangeText={v => setTTSInferYamlPath(v)}></TextInput>
        </View>
      </TouchableWithoutFeedback>
    </Dialog.Content>
    <Dialog.Actions>
      <Button onPress={() => onDismiss()}>Cancel</Button>
      <Button onPress={() => submit(name, description, url, ttsInferYamlPath)}>Create</Button>
    </Dialog.Actions>
  </Dialog>
}

const TTSService = ({ navigation, route }) => {
  const [messageState, setMessageState] = React.useState(false)
  const [messageText, setMessageText] = React.useState("")
  const [ttsServiceList, setTTSServiceList] = React.useState(null)
  const [addTTSServiceDialogState, setAddTTSServiceDialogState] = React.useState(false)

  const updateTTSServiceList = () => {
    Remote.getTTSServiceList().then(r => {
      if (r.data.status) {
        setTTSServiceList(r.data.data)
      } else {
        setMessageText(`Unable to load TTS service list: ${r.data.data}`)
        setMessageState(true)
      }
    }).catch(e => {
      setMessageText(`Unable to load TTS service list: NetworkError`)
      setMessageState(true)
    })
  }

  useFocusEffect(React.useCallback(() => {
    updateTTSServiceList()
  }, []))

  return (
    <PaperProvider theme={mdTheme()}>
      <>
        <Appbar.Header>
          <Appbar.Content title={'TTS Services'}></Appbar.Content>
          <Appbar.Action icon="plus" onPress={() => setAddTTSServiceDialogState(true)}></Appbar.Action>
        </Appbar.Header>
        <TouchableWithoutFeedback onPress={() => { }} accessible={false}>
          <>
            {(ttsServiceList === null || ttsServiceList.length == 0) &&
              <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1, padding: 10 }}>
                <Text style={{ textAlign: 'center' }}>
                  Try to add a TTS service by pressing `+` button in Appbar
                </Text>
              </View>}
            {(ttsServiceList !== null && ttsServiceList.length > 0) &&
              <>
                <ScrollView>
                  {ttsServiceList.map(r => (<List.Item
                    left={() => <View style={{ marginLeft: 10, padding: 10 }}><Icon source={'server-network'} size={48}></Icon></View>}
                    key={r.id}
                    title={r.name}
                    description={r.description}
                    onPress={() => {
                      navigation.navigate('Edit TTS Service', r)
                    }}>
                  </List.Item>))}
                </ScrollView>
              </>}
            <Portal>
              <NewTTSServiceDialog state={addTTSServiceDialogState} onDismiss={() => setAddTTSServiceDialogState(false)} onOk={() => {
                updateTTSServiceList()
                setAddTTSServiceDialogState(false)
              }} onErr={(v) => {
                setAddTTSServiceDialogState(false)
                setMessageText(`Unable to add TTS service: ${v}`)
                setMessageState(true)
              }}></NewTTSServiceDialog>
              <Message timeout={5000} style={{ marginBottom: 64 }} state={messageState} onStateChange={() => { setMessageState(false) }} icon="alert-circle" text={messageText} />
            </Portal>
          </>
        </TouchableWithoutFeedback >
      </>
    </PaperProvider>
  )
};


export default withTheme(TTSService);