import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Upload, Wand as Wand2 } from 'lucide-react-native';
import { useState } from 'react';

export default function CreateScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [personality, setPersonality] = useState('');

  const personalityTraits = [
    'Friendly', 'Mysterious', 'Intellectual', 'Playful',
    'Caring', 'Adventurous', 'Creative', 'Romantic'
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Create AI Character</Text>
        
        <View style={styles.uploadSection}>
          <TouchableOpacity style={styles.uploadButton}>
            <Upload color="#fff" size={24} />
            <Text style={styles.uploadText}>Upload Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter character name"
            placeholderTextColor="#737373"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your character's background story"
            placeholderTextColor="#737373"
            multiline
            numberOfLines={4}
          />

          <Text style={styles.label}>Personality</Text>
          <View style={styles.traitsContainer}>
            {personalityTraits.map((trait) => (
              <TouchableOpacity
                key={trait}
                style={[
                  styles.traitButton,
                  personality === trait && styles.selectedTrait,
                ]}
                onPress={() => setPersonality(trait)}>
                <Text
                  style={[
                    styles.traitText,
                    personality === trait && styles.selectedTraitText,
                  ]}>
                  {trait}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.generateButton}>
          <Wand2 color="#fff" size={24} />
          <Text style={styles.generateText}>Generate Character</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E50914',
    marginBottom: 24,
  },
  uploadSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  uploadButton: {
    width: 200,
    height: 200,
    backgroundColor: '#141414',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E50914',
    borderStyle: 'dashed',
  },
  uploadText: {
    color: '#fff',
    marginTop: 8,
    fontSize: 16,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#141414',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  traitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  traitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#E50914',
  },
  selectedTrait: {
    backgroundColor: '#E50914',
  },
  traitText: {
    color: '#E50914',
  },
  selectedTraitText: {
    color: '#fff',
  },
  generateButton: {
    backgroundColor: '#E50914',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  generateText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 8,
  },
});