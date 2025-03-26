import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock } from 'lucide-react-native';

const historyData = [
  {
    id: '1',
    character: {
      name: 'Emma',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&h=400&fit=crop',
    },
    lastCall: 'Today, 2:30 PM',
    duration: '15 minutes',
    type: 'video',
  },
  {
    id: '2',
    character: {
      name: 'James',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&h=400&fit=crop',
    },
    lastCall: 'Yesterday',
    duration: '30 minutes',
    type: 'voice',
  },
];

export default function HistoryScreen() {
  const router = useRouter();

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => router.push(`/character/${item.id}`)}>
      <Image source={{ uri: item.character.image }} style={styles.characterImage} />
      <View style={styles.callInfo}>
        <Text style={styles.characterName}>{item.character.name}</Text>
        <View style={styles.timeInfo}>
          <Clock size={14} color="#737373" />
          <Text style={styles.timeText}>{item.lastCall}</Text>
        </View>
        <Text style={styles.duration}>{item.duration}</Text>
      </View>
      <View style={[styles.callType, item.type === 'video' ? styles.videoCall : styles.voiceCall]}>
        <Text style={styles.callTypeText}>{item.type}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Call History</Text>
      </View>
      <FlatList
        data={historyData}
        renderItem={renderHistoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
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
    borderBottomWidth: 1,
    borderBottomColor: '#141414',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E50914',
  },
  listContent: {
    padding: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  characterImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  callInfo: {
    flex: 1,
    marginLeft: 12,
  },
  characterName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  timeText: {
    color: '#737373',
    fontSize: 14,
    marginLeft: 4,
  },
  duration: {
    color: '#737373',
    fontSize: 14,
  },
  callType: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  videoCall: {
    backgroundColor: '#E50914',
  },
  voiceCall: {
    backgroundColor: '#2B2B2B',
  },
  callTypeText: {
    color: '#fff',
    fontSize: 12,
    textTransform: 'uppercase',
  },
});