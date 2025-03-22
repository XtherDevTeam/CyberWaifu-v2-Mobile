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
  withTheme,
} from 'react-native-paper';

import * as Remote from '../shared/remote';

function GPTSoVitsModelSelector({ defaultValue, onChange, onErr, style }) {
  const [value, setValue] = React.useState('Select...')
  const [ttsModelList, setTTSModelList] = React.useState([])
  const [status, setStatus] = React.useState(false)
  const inputRef = React.useRef(null)
  const scrollHeight = Dimensions.get('window').height * 0.5

  React.useEffect(() => {
    Remote.getMiddlewareInfo().then(r => {
      if (r.data.status) {
        setTTSModelList(['None', ...Object.keys(r.data.data.models_path)])
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
      setValue(defaultValue)
      onChange(defaultValue)
    }
  }, [defaultValue])

  return <>
    <List.Item style={style} title={'TTS Model'} description={value} onPress={() => {
      setStatus(true)
    }} />
    <Portal>
      <Dialog visible={status} onDismiss={() => setStatus(false)}>
        <Dialog.Title>Select TTS Model</Dialog.Title>
        <Dialog.Content>
          <View>
            <Text>
              Choose a TTS model for character to use during conversation
            </Text>
            <ScrollView style={{ maxHeight: scrollHeight, paddingVertical: 10 }}>
              {ttsModelList.map(r => <List.Item
                key={r}
                title={r}
                left={() => <View style={{ marginHorizontal: 10 }}><Icon source={'server-network'} size={24}></Icon></View>}
                onPress={() => {
                  onChange(r)
                  setValue(r)
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

export default withTheme(GPTSoVitsModelSelector)