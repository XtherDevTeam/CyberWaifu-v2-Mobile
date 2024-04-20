import * as React from 'react';

import {
  Dimensions,
  ScrollView,
  View,
} from 'react-native';
import {
  Button,
  Dialog,
  Icon,
  List,
  Portal,
  Text,
  TextInput,
  withTheme,
} from 'react-native-paper';

import * as Remote from '../shared/remote';

function TTSServiceSelector({ defaultValue, onChange, onErr, style }) {
  const [value, setValue] = React.useState('Select...')
  const [ttsServiceList, setTTSServiceList] = React.useState([])
  const [status, setStatus] = React.useState(false)
  const inputRef = React.useRef(null)
  const scrollHeight = Dimensions.get('window').height * 0.5

  React.useEffect(() => {
    Remote.getTTSServiceList().then(r => {
      if (r.data.status) {
        setTTSServiceList([{
          id: 0,
          name: 'None',
          description: 'Do not use TTS service during conversation'
        },...r.data.data])
      } else {
        onErr(r.data.data)
      }
    }).catch(r => {
      onErr('NetworkError')
    })
  }, [])

  React.useEffect(() => {
    console.log(defaultValue, value)
    if (defaultValue !== undefined && defaultValue !== null && defaultValue.name !== value) {
      setValue(defaultValue.name)
      onChange(defaultValue)
    }
  }, [defaultValue])

  return <>
    <TextInput ref={inputRef} label={'TTS Service'}  value={value} onFocus={() => {
      inputRef.current?.blur()
      setStatus(true)
    }} style={{...style}}></TextInput>
    <Portal>
      <Dialog visible={status} onDismiss={() => setStatus(false)}>
        <Dialog.Title>Select TTS Service</Dialog.Title>
        <Dialog.Content>
          <View>
            <Text>
              Choose a TTS service for character to use during conversation
            </Text>
            <ScrollView style={{ maxHeight: scrollHeight }}>
              {ttsServiceList.map(r => <List.Item
                key={r.id}
                title={r.name}
                description={r.description}
                left={() => <View style={{padding: 10}}><Icon source={'server-network'} size={48}></Icon></View>}
                onPress={() => {
                  onChange(r)
                  setValue(r.name)
                  setStatus(false)
                }}
              >
              </List.Item>)}
            </ScrollView>
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => setStatus(false)}>Close</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  </>
}

export default withTheme(TTSServiceSelector)