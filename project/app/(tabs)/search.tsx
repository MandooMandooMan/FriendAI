import { View, Text, StyleSheet, TextInput, FlatList, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search as SearchIcon } from 'lucide-react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';

const characters = [
  {
    id: '1',
    name: 'Emma',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&h=400&fit=crop',
    tags: ['Art', 'Music', 'Travel'],
  },
  {
    id: '2',
    name: 'James',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&h=400&fit=crop',
    tags: ['Science', 'Books', 'Philosophy'],
  },
  {
    id: '3',
    name: 'Sophie',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&h=400&fit=crop',
    tags: ['Fashion', 'Photography', 'Design'],
  },
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const filteredCharacters = characters.filter(
    (character) =>
      character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      character.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderCharacterItem = ({ item }) => (
    <TouchableOpacity
      style={styles.characterCard}
      onPress={() => router.push(`/character/${item.id}`)}>
      <Image source={{ uri: item.image }} style={styles.characterImage} />
      <View style={styles.characterInfo}>
        <Text style={styles.characterName}>{item.name}</Text>
        <View style={styles.tagsContainer}>
          {item.tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <SearchIcon color="#737373" size={20} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search characters..."
          placeholderTextColor="#737373"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredCharacters}
        renderItem={renderCharacterItem}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    margin: 16,
    padding: 12,
    borderRadius: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#fff',
    fontSize: 16,
  },
  listContent: {
    padding: 16,
  },
  characterCard: {
    flexDirection: 'row',
    backgroundColor: '#141414',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  characterImage: {
    width: 80,
    height: 80,
  },
  characterInfo: {
    flex: 1,
    padding: 12,
  },
  characterName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#2B2B2B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: '#E50914',
    fontSize: 12,
  },
});