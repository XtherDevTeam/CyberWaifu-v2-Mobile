import React from 'react';

import { useColorScheme } from 'react-native';
import {
  adaptNavigationTheme,
  PaperProvider,
} from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  createMaterialBottomTabNavigator,
} from '@react-navigation/material-bottom-tabs';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import About from './pages/About';
import Chatroom from './pages/Chatroom';
import EditStickerSet from './pages/EditStickerSet';
import Home from './pages/Home';
import NewCharacter from './pages/NewCharacter';
import SignIn from './pages/SignIn';
import Sticker from './pages/Sticker';
import { mdTheme } from './shared/styles';

const { LightTheme, DarkTheme } = adaptNavigationTheme({
  reactNavigationLight: NavigationDefaultTheme,
  reactNavigationDark: NavigationDarkTheme
});

const Stack = createNativeStackNavigator()
const Tab = createMaterialBottomTabNavigator()

function MainPage({ }) {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" options={{
        tabBarIcon: "home"
      }} component={Home} />
      <Tab.Screen name="Stickers" options={{
        tabBarIcon: "sticker-emoji"
      }} component={Sticker} />
      <Tab.Screen name="About" options={{
        tabBarIcon: "information-outline"
      }} component={About} />
    </Tab.Navigator>
  )
}

export default function App() {
  const scheme = useColorScheme()

  return (

    <PaperProvider theme={mdTheme()}>
      <SafeAreaProvider>
        <NavigationContainer theme={scheme === 'dark' ? DarkTheme : LightTheme}>

          <Stack.Navigator initialRouteName='MainPage'>
            <Stack.Screen name="About" options={{ headerShown: false }} component={
              About
            }
            />
            <Stack.Screen name="Sign In" options={{ headerShown: false, tabBarVisible: false }} component={
              SignIn
            }
            />
            <Stack.Screen name="MainPage" options={{ headerShown: false }} component={
              MainPage
            }
            />
            <Stack.Screen name="New Character" options={{ headerShown: false }} component={
              NewCharacter
            }
            />
            <Stack.Screen name="Chatroom" options={{ headerShown: false }} component={
              Chatroom
            }
            />
            <Stack.Screen name="Edit Sticker Set" options={{ headerShown: false }} component={
              EditStickerSet
            }
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
