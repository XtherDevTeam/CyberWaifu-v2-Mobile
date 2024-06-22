import * as React from 'react';

import { Track } from 'livekit-client';
import {
  FlatList,
  View,
} from 'react-native';
import {
  Button,
  IconButton,
  PaperProvider,
} from 'react-native-paper';

import { CachedImage } from '@georstat/react-native-image-cache';
import {
  AudioSession,
  isTrackReference,
  LiveKitRoom,
  registerGlobals,
  useEnsureTrackRef,
  useIOSAudioManagement,
  useIsMuted,
  useLocalParticipant,
  useRoomContext,
  useTracks,
  VideoTrack,
} from '@livekit/react-native';
import { mediaDevices } from '@livekit/react-native-webrtc';

import * as Remote from '../shared/remote';
import { mdTheme } from '../shared/styles';

registerGlobals()

function RoomControls({ onLayout, onDisconnected }) {
  const {
    isCameraEnabled,
    isMicrophoneEnabled,
    isScreenShareEnabled,
    localParticipant,
  } = useLocalParticipant();
  const [isFrontCameraFacing, setIsFrontCameraFacing] = React.useState(true)
  const room = useRoomContext();

  return (
    <View style={{
      flexDirection: 'row', justifyContent: 'space-between', width: '100%',
      bottom: 0,
      position: 'absolute',
      marginTop: 20,
    }} onLayout={onLayout}>
      <View style={{ 'width': '100%', flexDirection: 'row', alignContent: 'center', justifyContent: 'center', alignItems: 'center' }}>
        <Button icon="account-off" mode="contained" onPress={() => {
          onDisconnected()
        }}>
          Disconnect
        </Button>
        <IconButton
          icon={isCameraEnabled ? 'camera-image' : 'camera-off'}
          size={24}
          onPress={() => {
            localParticipant.setCameraEnabled(!isCameraEnabled);
          }}
        />
        <IconButton
          icon={'camera-flip'}
          size={24}
          onPress={async () => {
            let facingModeStr = !isFrontCameraFacing ? 'front' : 'environment';
            setIsFrontCameraFacing(!isFrontCameraFacing);
            let devices = await mediaDevices.enumerateDevices();
            var newDevice;
            for (const device of devices) {
              if (
                device.kind === 'videoinput' &&
                device.facing === facingModeStr
              ) {
                newDevice = device;
                break;
              }
            }

            if (newDevice == null) {
              return;
            }
            await room.switchActiveDevice('videoinput', newDevice.deviceId);
          }}
        />
        <IconButton
          icon={isMicrophoneEnabled ? 'microphone' : 'microphone-off'}
          size={24}
          onPress={() => {
            localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
          }}
        />
      </View>
    </View>
  )
}

function VideoTrackView({ track, charId }) {
  if (track == null) {
    return null;
  }
  const videoTrack = useEnsureTrackRef(track)
  const isMuted = useIsMuted(track) || !isTrackReference(track)
  return <>
    {isMuted && <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
      <Avatar.Image
        style={{ alignSelf: 'center' }}
        source={() =>
          <CachedImage
            style={{ width: 64, height: 64, borderRadius: 32 }}
            imageStyle={{ borderRadius: 32 }}
            source={Remote.charAvatar()}
          />}
      /></View>}
    {!isMuted && <VideoTrack trackRef={videoTrack} style={{ height: '100%', width: '100%' }} />}
  </>
}

function RoomView({ yPadding, charId }) {
  let room = useRoomContext();
  useIOSAudioManagement(room);

  const tracks = useTracks([Track.Source.Camera]);

  React.useEffect(() => {
    async function start() {

    }
  })

  return <View style={{
    height: '100%',
    width: '100%',
    paddingBottom: yPadding
  }}>
    <VideoTrackView track={tracks[0]} charId={charId} />
  </View>
}

const RoomView2 = () => {
  // Get all camera tracks.
  const tracks = useTracks([Track.Source.Camera]);

  const renderTrack = ({item}) => {
    // Render using the VideoTrack component.
    if(isTrackReference(item)) {
      return (<VideoTrack trackRef={item} style={styles.participantView} />)
    } else {
      return (<View style={styles.participantView} />)
    }
  };

  return (
    <View>
      <FlatList
        data={tracks}
        renderItem={renderTrack}
      />
    </View>
  );
};

function VoiceChat({ navigation, route }) {
  const [charName, setCharName] = React.useState(route.params.charName)
  const [accessToken, setAccessToken] = React.useState('')
  const [remoteUrl, setRemoteUrl] = React.useState('')
  const [sessionName, setSessionName] = React.useState('')
  const [connect, setConnect] = React.useState(false)
  const [controlPadding, setControlPadding] = React.useState(56)

  React.useEffect(() => {
    console.log('VoiceChat entered')
    Remote.rtVcEstablish(charName).then(r => {
      if (r.data.status) {
        console.log(r.data)
        setAccessToken(r.data.data.token)
        setRemoteUrl(r.data.data.url)
        setSessionName(r.data.data.session)
      } else {
        console.log(r.data)
        navigation.goBack()
      }
    })
    let start = async () => {
      await AudioSession.startAudioSession();
    };

    start();
    return () => {
      AudioSession.stopAudioSession();
    };
  }, [])

  React.useEffect(() => {
    if (accessToken !== '') {
      setConnect(true)
    }
  }, [accessToken])
  React.useEffect(() => {
    if (sessionName !== '' && !connect) {
      navigation.goBack()
    } else {
      console.log('Attempt to connect to room')
    }
  }, [connect])

  return <PaperProvider theme={mdTheme()}>
    <>
      <LiveKitRoom serverUrl={`wss://${remoteUrl}`} token={accessToken} connect={connect}
        options={{
          publishDefaults: {
            red: false,
          },
        }}
        audio={true}
        video={true}
        onConnected={() => {
          console.log('Connected to room')
        }}
        onDisconnected={() => {
          setConnect(false)
        }}
        onError={(e) => { console.log('error', e) }}
      >
        {connect && <RoomView yPadding={controlPadding} charId={route.params.charId} />}
        {connect && <RoomControls onLayout={e => {
          if (e.nativeEvent !== null) {
            setControlPadding(e.nativeEvent.layout.height)
          }
        }}
          onDisconnected={() => {
            setConnect(false)
          }}
        />}
      </LiveKitRoom>
    </>
  </PaperProvider>
}

export default VoiceChat;