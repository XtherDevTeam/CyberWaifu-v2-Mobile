import React from 'react';

import { ScrollView } from 'react-native';
import {
  Appbar,
  List,
  PaperProvider,
  Portal,
  withTheme,
} from 'react-native-paper';

import ContentEditDialog from '../components/ContentEditDialog';
import Message from '../components/Message';
import PasswordEditConfirmDialog from '../components/PasswordEditConfirmDialog';
import * as Remote from '../shared/remote';
import { mdTheme } from '../shared/styles';
import version from '../shared/version';

const Settings = ({ navigation }) => {
  const [userName, setUserName] = React.useState('');
  const [userPersona, setUserPersona] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [messageState, setMessageState] = React.useState(false)
  const [messageText, setMessageText] = React.useState("")

  React.useEffect(() => {
    Remote.getServiceInfo().then(d => {
      if (d.status) {
      setUserName(d.data.data.session_username)
      setUserPersona(d.data.data.user_persona)}
    }).catch(e => {
      setMessageState(true)
      setMessageText("NetworkError")
    })
  }, [])

  function submitUserPersona(userPersona) {
    Remote.updateUserPersona(userPersona).then(d => {
      if (d.data.status) {
        setMessageState(true)
        setMessageText("User persona updated successfully.")
      } else {
        setMessageState(true)
        setMessageText(d.data.data)
      }
    }).catch(e => {
      setMessageState(true)
      setMessageText("NetworkError")
    })
  }

  function submitUserName(userName) {
    Remote.updateUserName(userName).then(d => {
      if (d.data.status) {
        setMessageState(true)
        setMessageText("User name updated successfully.")
      } else {
        setMessageState(true)
        setMessageText(d.data.data)
      }
    }).catch(e => {
      setMessageState(true)
      setMessageText("NetworkError")
    })
  }

  function submitPassword(password) {
    Remote.updatePassword(password).then(d => {
      if (d.data.status) {
        setMessageState(true)
        setMessageText("User name updated successfully.")
      } else {
        setMessageState(true)
        setMessageText(d.data.data)
      }
    }).catch(e => {
      setMessageState(true)
      setMessageText("NetworkError")
    })
  }

  return (
    <PaperProvider theme={mdTheme()}>
      <>
        <Appbar.Header>
          <Appbar.Content title={'Settings'}></Appbar.Content>
        </Appbar.Header>

        <ScrollView>
          <List.Section>
            <ContentEditDialog
              title="User Name"
              description="The name you will be used to chat with your waifus."
              placeholder="Jerry Chou"
              style={{ paddingHorizontal: 10, paddingVertical: 20 }}
              defaultValue={userName}
              onOk={v => {setUserName(v); submitUserName(v)}}
            />
            <ContentEditDialog
              title="User Persona"
              description="User persona is used to describe your personality and interests so as to enhance your experience by helping waifu understand you better."
              placeholder="A high-school student, who loves playing video games and watching anime."
              style={{ paddingHorizontal: 10, paddingVertical: 20 }}
              defaultValue={userPersona}
              onOk={v => {setUserPersona(v); submitUserPersona(v)}}
            />
            <PasswordEditConfirmDialog
              title="Password"
              description="The password you will use to login to your server."
              placeholder="Jerry Chou"
              style={{ paddingHorizontal: 10,  paddingVertical: 20 }}
              onOk={v => {setPassword(v); submitPassword(v)}}
              onErr={e => {
                setMessageState(true)
                setMessageText(e)
              }}
            />
            <List.Item
              title="About"
              style={{ paddingHorizontal: 10, paddingVertical: 20 }}
              description={`CyberWaifu-v2-mobile ${version.version} (${version.build})`}
              onPress={() => { navigation.navigate('About') }}
            ></List.Item>
          </List.Section>
        </ScrollView>
        <Portal>
          <Message timeout={5000} style={{ marginBottom: 64 }} state={messageState} onStateChange={() => { setMessageState(false) }} icon="alert-circle" text={messageText} />
        </Portal>
      </>
    </PaperProvider>
  );
};

export default withTheme(Settings);