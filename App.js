import { StyleSheet, Text, View, Image, useColorScheme, AppRegistry } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import styles, { mdTheme, mdThemeDark, mdThemeLight } from './shared/styles'
import {
  MD3LightTheme,
  MD3DarkTheme,
  adaptNavigationTheme,
  PaperProvider,
  useTheme,
  Icon,
} from 'react-native-paper';
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
} from '@react-navigation/native'
import React from 'react'

import * as storage from './shared/storage'
import axios from 'axios'
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs'
import About from './pages/About'

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
      <Tab.Screen options={{
        tabBarIcon: "music"
      }} name="Music" component={Music} />
      <Tab.Screen options={{
        tabBarIcon: "account-circle"
      }} name="Profile" component={Profile} />
    </Tab.Navigator>
  )
}

export default function App() {
  const scheme = useColorScheme()

  return (

    <PaperProvider theme={mdTheme()}>
      <SafeAreaProvider>
        <NavigationContainer theme={scheme === 'dark' ? DarkTheme : LightTheme}>

          <Stack.Navigator initialRouteName='About'>
            <Stack.Screen name="About" options={{ headerShown: false, tabBarVisible: false }} component={
              About
            }
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
