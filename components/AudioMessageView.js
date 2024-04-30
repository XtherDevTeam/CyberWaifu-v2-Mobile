import * as React from 'react';

import { Audio } from 'expo-av';
import { View } from 'react-native';
import {
  IconButton,
  Text,
  withTheme,
} from 'react-native-paper';

import * as Remote from '../shared/remote';

function AudioMessageView({ audioAttachment, style }) {
  const [playStatus, setPlayStatus] = React.useState(false)
  const [playbackLength, setPlaybackLength] = React.useState(0)
  const [playbackPosition, setPlaybackPosition] = React.useState(0)
  const [isInitialState, setIsInitialState] = React.useState(true)

  const sound = React.useRef(null)

  React.useEffect(() => {
    if (!isInitialState) {
      (async () => {
        if (sound.current) {
          await sound.current.unloadAsync()
        }
        console.log('i dont know anything')
        sound.current = (await Audio.Sound.createAsync({ uri: Remote.attachmentDownload(audioAttachment) })).sound
        sound.current.setStatusAsync({shouldPlay: true})
        sound.current.setOnPlaybackStatusUpdate(status => {
          if (status.didJustFinish) {
            (async () => {
              let s = await sound.current.getStatusAsync()
              s.positionMillis = 0
              await sound.current.setStatusAsync(s)
            })()
          }
          setPlayStatus(status.isPlaying)
          setPlaybackLength(Math.floor(status.durationMillis / 1000))
          setPlaybackPosition(Math.floor(status.positionMillis / 1000))
        })
      })()
      return
    }
  }, [isInitialState])

  React.useState(() => () => {
    console.log('unloading audio')
    sound ? sound.unloadAsync() : null
  }, [])

  return (<View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <IconButton
      icon={playStatus ? 'pause' : 'play'}
      size={20}
      onPress={() => {
        if (isInitialState) {
          console.log('pressed')
          setIsInitialState(false)
        } else {
          if (playStatus) {
            sound.current.pauseAsync().then(r => setPlayStatus(false))
          } else {
            sound.current.playAsync().then(r => setPlayStatus(true))
          }
        }
      }}
    />
    {playbackLength === 0 && <Text style={{marginRight: 10}}>Voice</Text>}
    {playbackLength !== 0 && <Text variant="bodyMedium">{playbackPosition} / {playbackLength} s</Text>}
  </View>)
}

export default withTheme(AudioMessageView)