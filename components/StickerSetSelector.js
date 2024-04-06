import * as React from 'react';

import {
  Dimensions,
  ScrollView,
  View,
} from 'react-native';
import {
  Button,
  Dialog,
  List,
  Portal,
  Text,
  TextInput,
  withTheme,
} from 'react-native-paper';

import { CachedImage } from '@georstat/react-native-image-cache';

import * as Remote from '../shared/remote';

function StickerSetSelector({ defaultValue, onChange, onErr, style }) {
  const [value, setValue] = React.useState('Select...')
  const [stickerList, setStickerList] = React.useState([])
  const [status, setStatus] = React.useState(false)
  const inputRef = React.useRef(null)
  const scrollHeight = Dimensions.get('window').height * 0.5

  React.useEffect(() => {
    Remote.stickerSetList().then(r => {
      if (r.data.status) {
        setStickerList(r.data.data)
      } else {
        onErr(r.data.data)
      }
    }).catch(r => {
      onErr('NetworkError')
    })
  }, [])

  React.useEffect(() => {
    if (defaultValue !== undefined && defaultValue !== null) {
      console.log(defaultValue)
      setValue(defaultValue.setName)
      onChange(defaultValue)
    }
  }, [defaultValue])

  return <>
    <TextInput ref={inputRef} label={'Sticker set'} value={value} onFocus={() => {
      inputRef.current?.blur()
      setStatus(true)
    }} style={{...style}}></TextInput>
    <Portal>
      <Dialog visible={status} onDismiss={() => setStatus(false)}>
        <Dialog.Title>Select sticker set</Dialog.Title>
        <Dialog.Content>
          <View>
            <Text>
              Choose a sticker set for character to use during conversation
            </Text>
            <ScrollView style={{ maxHeight: scrollHeight }}>
              {stickerList.map(r => <List.Item
                key={r.id}
                title={r.setName}
                left={() => <CachedImage style={{ width: 48, height: 48, borderRadius: 24 }} imageStyle={{ borderRadius: 24 }} source={Remote.stickerGet(r.id, r.previewSticker)} />}
                onPress={() => {
                  onChange(r)
                  setValue(r.setName)
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

export default withTheme(StickerSetSelector)