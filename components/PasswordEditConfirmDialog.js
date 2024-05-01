import * as React from 'react';

import {
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

function PasswordEditConfirmDialog({ style, title, description, onOk, onErr }) {
  const [value, setValue] = React.useState('')
  const [confirmValue, setConfirmValue] = React.useState('')
  const [status, setStatus] = React.useState(false)
  const inputRef = React.useRef(null)
  const confirmInputRef = React.useRef(null)

  return <>
    <List.Item style={style} title={title} description={value.split('').map((v, i) => '*').join('')} onPress={() => {
      setStatus(true)
    }}></List.Item>
    <Portal>
      <Dialog visible={status} onDismiss={() => {
        setStatus(false)
      }}>
        <Dialog.Title>Edit Password</Dialog.Title>
        <Dialog.Content>
          <TouchableWithoutFeedback onPress={() => inputRef.current?.blur()}>
            <View>
              <Text variant='bodyMedium'>{description}</Text>
              <TextInput style={{ marginTop: 10 }}  label={'New Password'} secureTextEntry ref={inputRef} mode='outlined' value={value} onChangeText={v => setValue(v)}></TextInput>
              <TextInput style={{ marginTop: 10 }} label={'Confirm Password'} secureTextEntry ref={confirmInputRef} mode='outlined' value={confirmValue} onChangeText={v => setConfirmValue(v)}></TextInput>
            </View>
          </TouchableWithoutFeedback>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={() => {
            setStatus(false)
          }}>Close</Button>
          <Button onPress={() => {
            if (value !== confirmValue) {
              onErr('Passwords do not match')
              return
            }
            onOk(value)
            setStatus(false)
          }}>OK</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  </>
}

export default withTheme(PasswordEditConfirmDialog)