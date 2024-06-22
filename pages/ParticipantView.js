import * as React from 'react';

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  isTrackReference,
  useEnsureTrackRef,
  useIsMuted,
  useIsSpeaking,
  useParticipantInfo,
  VideoTrack,
} from '@livekit/react-native';
import { useTheme } from '@react-navigation/native';

export const ParticipantView = ({
  style = {},
  trackRef,
  zOrder,
  mirror,
}) => {
  const trackReference = useEnsureTrackRef(trackRef);
  const { identity, name } = useParticipantInfo({
    participant: trackReference.participant,
  });
  const isSpeaking = useIsSpeaking(trackRef.participant);
  const isVideoMuted = useIsMuted(trackRef);
  const { colors } = useTheme();
  let videoView;
  if (isTrackReference(trackRef) && !isVideoMuted) {
    videoView = (
      <VideoTrack
        style={styles.videoView}
        trackRef={trackRef}
        zOrder={zOrder}
        mirror={mirror}
      />
    );
  } else {
    videoView = (
      <View style={styles.videoView}>
        <View style={styles.spacer} />
        <View style={styles.spacer} />
      </View>
    );
  }

  const displayName = name ? name : identity;
  return (
    <View style={[styles.container, style]}>
      {videoView}
      <View style={styles.identityBar}>
        <Text style={{ color: colors.text }}>{displayName}</Text>
      </View>
      {isSpeaking && <View style={styles.speakingIndicator} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#00153C',
  },
  speakingIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '100%',
    borderColor: '#007DFF',
    borderWidth: 3,
  },
  spacer: {
    flex: 1,
  },
  videoView: {
    width: '100%',
    height: '100%',
  },
  identityBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  icon: {
    width: 40,
    height: 40,
    alignSelf: 'center',
  },
});