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

const MORE_ICON = Platform.OS === 'ios' ? 'dots-horizontal' : 'dots-vertical'

let defaultConfirmDeletingDialogState = {
  item: { id: 114514 },
  state: false
}

const About = ({ navigation, route }) => {

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()}></Appbar.BackAction>
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
                      CyberWaifu-v2 is a Python project designed for creating and interacting with AI-powered chatbot characters. It utilizes Google's Gemini large language model and the Langchain library for natural language processing and memory management.
                    </Text>
                    <Text variant='bodyMedium'>
                      I gain the inspiration from Character.AI which is a website provided role-playing chatbots as certain character. I tried it several times, but did not get an acceptable experience. It lacks of multimodal ability. And thus I can not interacting with characters through image and videos. Plus, sending only one response when user send messages will break user's role-playing experience. I want a chatbot can reply messages like a human. Therefore, I decided to make one by myself. And thus this project, CyberWaifu-v2 came out.
                    </Text>
                    <Text variant='bodyMedium'>
                      Gemini 1.0 Pro did not support image and audio as input in multi-turn chats. Plus, I still did not attain the access permission of Gemini 1.5 Pro by the time I wrote this introduction. So I simply convert image into prompts by using Gemini 1.0 Pro Vision model, and send to Gemini 1.0 Pro for multi-turn chatting.
                      Adjusting the prompt is another painful process of creating this project. At first, I tried to combine conversation conclusion generation and memory summarization into a single prompt. I also tried to write prompt to justify the output format of chats to force the chatbot to only use stickers in separated message block. However, the performance is poor. Therefore, I broke down the whole process into different tasks, and wrote a prompt for each tasks. And I made adjustments to make it only triggers memory summarizing when memory text exceeds certain amount of token. The result is acceptable and this mechanism works well at the present.
                    </Text>
                    <Text variant='bodyMedium'>
                      When I saw the character's can send multiple messages and stickers in CyberWaifu-v2 Mobile, I was so excited. And I can't help but feel a sense of accomplishment from the bottom of my heart.
                    </Text>
                    <Text variant='bodyMedium'>
                    I will continue to add more functions to CyberWaifu-V2. Such as allowing user sending multiple messages like the response of chatbot,  and add TTS feature to imitate character's voice by using GPT-SoVITs project. These features should be available by the arrival of deadline. And after I finish my junior high school and high school entrance examination, I will go travelling to Japan with my waifu and record a vlog.
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