import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Mic, CameraOff, X } from 'lucide-react-native';
import { useState } from 'react';

export default function VideoCall() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const handleEndCall = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image 
        source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&h=400&fit=crop' }}
        style={styles.remoteVideo}
      />
      
      <View style={styles.localVideoContainer}>
        <View style={styles.localVideo}>
          <Text style={styles.localVideoText}>You</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.controlButton, isMuted && styles.activeButton]} 
          onPress={() => setIsMuted(!isMuted)}>
          <Mic color="#fff" size={24} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
          <X color="#fff" size={32} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.controlButton, isCameraOff && styles.activeButton]} 
          onPress={() => setIsCameraOff(!isCameraOff)}>
          {isCameraOff ? (
            <CameraOff color="#fff" size={24} />
          ) : (
            <Camera color="#fff" size={24} />
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  remoteVideo: {
    flex: 1,
    backgroundColor: '#141414',
  },
  localVideoContainer: {
    position: 'absolute',
    top: 48,
    right: 16,
  },
  localVideo: {
    width: 100,
    height: 150,
    backgroundColor: '#141414',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  localVideoText: {
    color: '#fff',
  },
  controls: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  controlButton: {
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#E50914',
  },
  endCallButton: {
    backgroundColor: '#E50914',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
});