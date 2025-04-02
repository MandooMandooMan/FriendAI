import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { getCharacters, Character } from "../../lib/characters"; // Make sure this path is correct

const categories = [
  { id: 1, name: "Popular" },
  { id: 2, name: "New Arrivals" },
  { id: 3, name: "Trending" },
  { id: 4, name: "Friends" },
  { id: 5, name: "Romance" },
];

export default function HomeScreen() {
  const router = useRouter();
  const [adultMode, setAdultMode] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCharacters();
        console.log("Characters:", data);
        setCharacters(data);
      } catch (err) {
        console.error("Error loading characters:", err);
      }
    };
    fetchData();
  }, []);

  const CharacterCard = ({ character }: { character: Character }) => (
    <TouchableOpacity
      style={styles.characterCard}
      onPress={() => router.push(`/character/${character.id}`)}
    >
      <Image source={{ uri: character.image }} style={styles.characterImage} />
      <Text style={styles.characterName}>{character.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Companions</Text>
        <View style={styles.adultModeContainer}>
          <Text style={styles.adultModeText}>Adult Mode</Text>
          <Switch
            value={adultMode}
            onValueChange={setAdultMode}
            trackColor={{ false: "#767577", true: "#E50914" }}
            thumbColor={adultMode ? "#fff" : "#f4f3f4"}
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {categories.map((category) => (
          <View key={category.id} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category.name}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.charactersRow}
            >
              {characters.map((character) => (
                <CharacterCard key={character.id} character={character} />
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E50914",
  },
  adultModeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  adultModeText: {
    color: "#fff",
    marginRight: 8,
  },
  content: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 16,
    marginBottom: 12,
  },
  charactersRow: {
    paddingLeft: 16,
  },
  characterCard: {
    marginRight: 16,
    width: 140,
  },
  characterImage: {
    width: 140,
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  characterName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
