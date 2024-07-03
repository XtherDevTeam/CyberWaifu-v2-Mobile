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

const AddRefAudioDialog = ({ state, onOk, onErr, onDismiss }) => {
  const [refAudioPath, setRefAudioPath] = React.useState("")
  const [refAudioName, setRefAudioName] = React.useState("")
  const [refAudioText, setRefAudioText] = React.useState("")
  const [refAudioLanguage, setRefAudioLanguage] = React.useState("")

  const refAudioNameRef = React.useRef(null)
  const refAudioPathRef = React.useRef(null)
  const refAudioTextRef = React.useRef(null)
  const refAudioLanguageRef = React.useRef(null)

  return <Dialog visible={state} onDismiss={onDismiss}>
    <Dialog.Title>Add reference audio</Dialog.Title>
    <Dialog.Content>
      <TouchableWithoutFeedback onPress={() => {
        refAudioNameRef.current?.blur()
        refAudioPathRef.current?.blur()
        refAudioTextRef.current?.blur()
        refAudioLanguageRef.current?.blur()
      }}>
        <View >
          <Text variant='bodyMedium'>
            A reference audio is an audio file on TTS service that can used to generate audio from text in accordance with the character's voice.
          </Text>
          <TextInput
            mode='outlined'
            ref={refAudioNameRef}
            style={{ marginTop: 10, width: '100%' }}
            label={'Reference audio name'}
            placeholder='E.g. narrative, pleased, disappointed...'
            value={refAudioName}
            onChangeText={v => setRefAudioName(v)}>
          </TextInput>
          <TextInput
            mode='outlined'
            ref={refAudioTextRef}
            style={{ marginTop: 10, width: '100%' }}
            label={'Reference audio text'}
            placeholder='The text content of reference audio'
            value={refAudioText}
            onChangeText={v => setRefAudioText(v)}>
          </TextInput>
          <TextInput
            mode='outlined'
            ref={refAudioPathRef}
            style={{ marginTop: 10, width: '100%' }}
            label={'Reference audio path'}
            placeholder='The path to the audio file on TTS service'
            value={refAudioPath}
            onChangeText={v => setRefAudioPath(v)}>
          </TextInput>
          <TextInput
            mode='outlined'
            ref={refAudioLanguageRef}
            style={{ marginTop: 10, width: '100%' }}
            label={'Reference audio language'}
            placeholder='en, auto, ...'
            value={refAudioLanguage}
            onChangeText={v => setRefAudioLanguage(v)}>
          </TextInput>
        </View>
      </TouchableWithoutFeedback>

    </Dialog.Content>
    <Dialog.Actions>
      <Button onPress={onDismiss}>Cancel</Button>
      <Button onPress={() => onOk(refAudioName, refAudioText, refAudioPath, refAudioLanguage)}>Add</Button>
    </Dialog.Actions>
  </Dialog>
}


const DeleteRefAudioDialog = ({ state, refAudioId, onOk, onErr, onDismiss }) => {
  return <Dialog onDismiss={onDismiss} visible={state}>
    <Dialog.Title>Confirm deleting reference audio</Dialog.Title>
    <Dialog.Content>
      <Text variant='bodyMedium'>
        Are you really going to delete reference audio {refAudioId}?
        This will not affect the audio file on TTS service.
      </Text>
    </Dialog.Content>
    <Dialog.Actions>
      <Button onPress={onDismiss}>Cancel</Button>
      <Button onPress={() => Remote.deleteTTSReferenceAudio(refAudioId).then(r => {
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


const EditTTSService = ({ navigation, route }) => {
  const [messageState, setMessageState] = React.useState(false)
  const [messageText, setMessageText] = React.useState("")
  const [addTTSReferenceAudioDialogState, setAddTTSReferenceAudioDialogState] = React.useState(false)

  const [TTSServiceName, setTTSServiceName] = React.useState("")
  const [TTSServiceUrl, setTTSServiceUrl] = React.useState("")
  const [TTSInferYaml, setTTSInferYaml] = React.useState("")
  const [TTSServiceDescription, setTTSServiceDescription] = React.useState("")
  const [deleteTTSReferenceDialogState, setDeleteTTSReferenceDialogState] = React.useState({ state: false, refAudioId: null })
  const [ttsServiceInfo, setTTSServiceInfo] = React.useState({
    reference_audios: []
  })

  const scrollViewRef = React.useRef(null)

  const updateTTSServiceInfo = () => {
    Remote.getTTSServiceInfo(route.params.id).then(r => {
      if (r.data.status) {
        setTTSServiceInfo(r.data.data)
      } else {
        setMessageText(`Unable to update TTS service infomation: ${r.data.data}`)
        setMessageState(true)
      }
    }).catch(r => {
      setMessageText(`Unable to update TTS service infomation: NetworkError`)
      setMessageState(true)
    })
  }

  useFocusEffect(React.useCallback(() => {
    setTTSServiceName(route.params.name)
    setTTSServiceDescription(route.params.description)
    setTTSServiceUrl(route.params.url)
    setTTSInferYaml(route.params.ttsInferYamlPath)
    updateTTSServiceInfo()
  }, []))

  return (
    <PaperProvider theme={mdTheme()}>
      <>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()}></Appbar.BackAction>
          <Appbar.Content title={"Edit TTS Service"}></Appbar.Content>
        </Appbar.Header>
        <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? 'padding' : 'none'} style={{ height: '100%' }}>
          <TouchableWithoutFeedback onPress={() => {
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }} accessible={false} style={{ height: '100%' }}>
            <>
              <ScrollView ref={scrollViewRef} style={{ 'height': '100%' }}>
                <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}>
                  <TextInput
                    label="TTS Service name"
                    placeholder='A nickname for the TTS service'
                    style={{ width: '90%', marginTop: 20 }}
                    value={TTSServiceName}
                    onChangeText={(v) => setTTSServiceName(v)}
                  />
                  <TextInput
                    label="TTS Service description"
                    multiline={true}
                    placeholder='The description for the TTS service'
                    style={{ width: '90%', marginTop: 20 }}
                    value={TTSServiceDescription}
                    onChangeText={(v) => setTTSServiceDescription(v)}
                  />
                  <TextInput
                    label="TTS Service Endpoint"
                    multiline={true}
                    placeholder='http://localhost:1145/'
                    style={{ width: '90%', marginTop: 20 }}
                    value={TTSServiceUrl}
                    onChangeText={(v) => setTTSServiceUrl(v)}
                  />
                  <TextInput
                    label="Path to tts_infer.yaml"
                    multiline={true}
                    placeholder='GPT_SoVITS/configs/tts_infer.yaml'
                    style={{ width: '90%', marginTop: 20 }}
                    value={TTSInferYaml}
                    onChangeText={(v) => setTTSInferYaml(v)}
                  />
                  <Button mode='contained-tonal' style={{ width: '90%', marginTop: 20 }} onPress={() => {
                    Remote.updateTTSService(route.params.id, TTSServiceName, TTSServiceDescription, TTSServiceUrl, TTSInferYaml).then(r => {
                      if (r.data.status) {
                        setMessageText('Updated TTS service information successfully.')
                        setMessageState(true)
                      } else {
                        setMessageText(`Unable to update TTS service information: ${r.data.data}`)
                        setMessageState(true)
                      }
                    }).catch(r => {
                      setMessageText(`Unable to update TTS service information: NetworkError`)
                      setMessageState(true)
                    })
                  }}><Icon source='pencil'></Icon> Edit</Button>
                  <Text variant='labelLarge' style={{ marginTop: 20 }}>
                    Available reference audio ({ttsServiceInfo.reference_audios.length})
                  </Text>
                  {ttsServiceInfo.reference_audios.map((v, k) => <List.Item
                    key={v.id}
                    title={v.name}
                    description={v.text}
                    right={() => <IconButton icon={'delete'} onPress={() => {
                      setDeleteTTSReferenceDialogState({ state: true, refAudioId: v.id })
                    }}></IconButton>}
                  ></List.Item>)}
                  <Button mode='contained-tonal' style={{ width: '90%', marginTop: 20 }} onPress={() => {
                    setAddTTSReferenceAudioDialogState(true)
                  }}><Icon source='plus'></Icon> Add reference audio</Button>
                </View>
              </ScrollView>
              <Portal>
                <DeleteRefAudioDialog
                  state={deleteTTSReferenceDialogState.state}
                  refAudioId={deleteTTSReferenceDialogState.refAudioId}
                  onOk={
                    () => {
                      updateTTSServiceInfo()
                      setDeleteTTSReferenceDialogState({ state: false, refAudioId: null })
                    }
                  }
                  onErr={
                    r => {
                      setMessageText(`Unable to delete reference audio: ${r}`)
                      setDeleteTTSReferenceDialogState({ state: false, refAudioId: null })
                    }
                  }
                  onDismiss={
                    () => {
                      setDeleteTTSReferenceDialogState({ state: false, refAudioId: null })
                    }
                  }
                >


                </DeleteRefAudioDialog>
                <AddRefAudioDialog state={addTTSReferenceAudioDialogState} onOk={(name, text, path, language) => {
                  Remote.addTTSReferenceAudio(route.params.id, name, text, path, language).then(r => {
                    if (r.data.status) {
                      updateTTSServiceInfo()
                      setAddTTSReferenceAudioDialogState(false)
                    } else {
                      setMessageText(`Unable to add reference audio: ${r.data.data}`)
                      setMessageState(true)
                      setAddTTSReferenceAudioDialogState(false)
                    }
                  }).catch(r => {
                    setMessageText(`Unable to add reference audio: NetworkError`)
                    setMessageState(true)
                    setAddTTSReferenceAudioDialogState(false)
                  })
                }} onErr={r => {
                  setMessageText(`Unable to add reference audio: ${r}`)
                  setMessageState(true)
                  setAddTTSReferenceAudioDialogState(false)
                }} onDismiss={() => {
                  setAddTTSReferenceAudioDialogState(false)
                }}></AddRefAudioDialog>
                <Message timeout={5000} style={{ marginBottom: 64 }} state={messageState} onStateChange={() => { setMessageState(false) }} icon="alert-circle" text={messageText} />
              </Portal>
            </>
          </TouchableWithoutFeedback >
        </KeyboardAvoidingView>
      </>
    </PaperProvider>
  )
};


export default withTheme(EditTTSService);