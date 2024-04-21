import * as React from 'react';

import {
  Dimensions,
  TouchableWithoutFeedback,
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

function ContentEditDialog({ defaultValue, placeholder, style, title, description, onOk }) {
  const [value, setValue] = React.useState('')
  const [status, setStatus] = React.useState(false)
  const inputRef = React.useRef(null)

  React.useEffect(() => {
    console.log('???')
    setValue(defaultValue)
  }, [defaultValue])

  return <>
    <List.Item style={style} title={title} description={defaultValue} onPress={() => {
      setValue(defaultValue)
      setStatus(true)
    }}></List.Item>
    <Portal>
      <Dialog visible={status} onDismiss={() => {
        setValue("")
        setStatus(false)
      }}>
        <Dialog.Title>Edit</Dialog.Title>
        <Dialog.Content>
          <TouchableWithoutFeedback onPress={() => inputRef.current?.blur()}>
            <View>
              <Text variant='bodyMedium'>{description}</Text>
              <TextInput style={{marginTop: 10, maxHeight: Dimensions.get('window').height * 0.3}} label={title} ref={inputRef} mode='outlined' placeholder={placeholder} multiline={true} defaultValue={value} onChangeText={v => setValue(v)}></TextInput>
            </View>
          </TouchableWithoutFeedback>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => {
            setValue("")
            setStatus(false)
          }}>Close</Button>
          <Button onPress={() => {
            onOk(value)
            setStatus(false)
          }}>OK</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  </>
}

export default withTheme(ContentEditDialog)