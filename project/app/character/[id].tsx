import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Phone, Video, ArrowLeft } from 'lucide-react-native';

const characters = {
  1: {
    name: 'Emma',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&h=400&fit=crop',
    description: 'Friendly and outgoing AI companion who loves to chat about art, music, and travel. Emma has a warm personality and always knows how to make people feel comfortable.',
    age: 25,
    interests: ['Art', 'Music', 'Travel'],
    personality: 'Warm and friendly',
  },
  // Add more characters as needed
};

export default function CharacterProfile() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const character = characters[id];

  const handleVoiceCall = () => {
    router.push(`/call/voice/${id}`);
  };

  const handleVideoCall = () => {
    router.push(`/call/video/${id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Image source={{ uri: character.image }} style={styles.profileImage} />
        <Text style={styles.name}>{character.name}</Text>
        
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{character.description}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Details</Text>
          <Text style={styles.detail}>Age: {character.age}</Text>
          <Text style={styles.detail}>Personality: {character.personality}</Text>
          <Text style={styles.detail}>Interests: {character.interests.join(', ')}</Text>
        </View>

        <View style={styles.callButtons}>
          <TouchableOpacity style={styles.callButton} onPress={handleVoiceCall}>
            <Phone color="#fff" size={24} />
            <Text style={styles.buttonText}>Voice Call</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.callButton, styles.videoButton]} onPress={handleVideoCall}>
            <Video color="#fff" size={24} />
            <Text style={styles.buttonText}>Video Call</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 16,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 16,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
  },
  infoSection: {
    width: '100%',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E50914',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
  },
  detail: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  callButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    marginTop: 'auto',
    marginBottom: 32,
  },
  callButton: {
    backgroundColor: '#E50914',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
  },
  videoButton: {
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#E50914',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});