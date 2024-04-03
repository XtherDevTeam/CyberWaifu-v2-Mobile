import * as React from 'react';

import {
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  Appbar,
  Avatar,
  Card,
  Text,
  withTheme,
} from 'react-native-paper';

import StickerSetSelector from '../components/StickerSetSelector';

const MORE_ICON = Platform.OS === 'ios' ? 'dots-horizontal' : 'dots-vertical'

let defaultConfirmDeletingDialogState = {
  item: { id: 114514 },
  state: false
}

const About = ({ navigation, route }) => {

  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="About"></Appbar.Content>
      </Appbar.Header>
      <TouchableWithoutFeedback onPress={() => { }} accessible={false}>
        <>
          <ScrollView>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Card style={{ width: "95%", marginBottom: 10 }}>
                <Card.Cover source={require('../assets/yoimiya.jpg')} style={{ height: 128 }} />
                <Card.Content style={{ marginTop: 15 }}>
                  <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Avatar.Image source={require('../assets/icon.png')} size={56}></Avatar.Image>
                    <Text variant="titleLarge">CyberWaifu-v2 Mobile</Text>
                    <Text variant="bodyMedium" style={{ textAlign: 'center' }}>Version: 1.0.0(1)</Text>
                    <Text variant="bodyMedium" style={{ textAlign: 'center' }}>Made with ❤️ by Jerry Chou and Naganohara Yoimiya</Text>
                  </View>
                  <View style={{ marginTop: 10, marginBottom: 10 }}>
                    <Text variant='bodyMedium'>
                      Hello, world!
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            </View>
          </ScrollView>
        </>
      </TouchableWithoutFeedback >
    </>
  )
};

export default withTheme(About);