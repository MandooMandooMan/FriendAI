import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Phone, Mic, Volume2, X } from "lucide-react-native";
import { useState } from "react";
import { TextInput } from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { useEffect, useRef } from "react";

export default function VoiceCall() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const isPlayingAudio = useRef(false);
  const [isListening, setIsListening] = useState(false);
  const handleEndCall = () => {
    router.back();
  };

  useEffect(() => {
    startRecordingLoop();
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);
  const handleUserInput = async (text: string) => {
    try {
      setIsLoading(true);
      const aiText = await getAIResponse(text);
      console.log("AI Response:", aiText);

      // TODO: Call local CSM Python script via native module or pre-generated audio
      // For now, just log the message
      console.log("🗣️ TTS Output would be:", aiText);
      handleSendInput(aiText);
      // Here you’d use expo-av or react-native-sound to play audio
    } catch (err) {
      console.error("Error handling user input:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getAIResponse = async (message: string) => {
    const res = await fetch("http://localhost:1234/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer no-key",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dolphin-3-llama3.1-8b",
        messages: [
          {
            role: "system",
            content:
              "You are a warm, friendly AI character named Emma. You speak like a real human friend, not like a robot.",
          },
          { role: "user", content: message },
        ],
      }),
    });

    const json = await res.json();
    return json.choices?.[0]?.message?.content;
  };

  async function handleSendInput(inputText: string) {
    const response = await fetch("https://6146-34-87-139-150.ngrok-free.app/generate-audio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: inputText, speaker_id: 0 }),
    });

    if (!response.ok) {
      console.error("❌ Error generating audio from CSM");
      return;
    }

    const blob = await response.blob();
    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64Audio =
        typeof reader.result === "string" ? reader.result.split(",")[1] : null;

      if (!base64Audio) {
        console.error("❌ Failed to read audio blob");
        return;
      }

      // Save to temporary file
      const fileUri = FileSystem.documentDirectory + "output.wav";
      await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Play it
      const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
      await sound.playAsync();
      console.log("🔊 Played audio from CSM");
    };

    reader.readAsDataURL(blob);
  }

  const startRecordingLoop = async () => {
    while (true) {
      if (isPlayingAudio.current) {
        // Wait while audio is playing
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      console.log("🎤 Starting recording...");
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        console.error("❌ Microphone permission denied");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(recordingOptions);
      await recording.startAsync();
      setRecording(recording);
      setIsListening(true);

      // Record for 5 seconds (or use silence detection logic later)
      await new Promise((resolve) => setTimeout(resolve, 5000));

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsListening(false);
      if (!uri) continue;

      await transcribeAndRespond(uri);
    }
  };

  const transcribeAndRespond = async (uri: string) => {
    try {
      const file = {
        uri,
        name: "audio.wav",
        type: "audio/wav",
      };

      const formData = new FormData();
      formData.append("file", file as any);

      const response = await fetch("https://6146-34-87-139-150.ngrok-free.app/transcribe-audio", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const result = await response.json();
      const userSpeech = result.transcription;
      console.log("🎙️ You said:", userSpeech);

      if (!userSpeech) return;

      const aiText = await getAIResponse(userSpeech);
      await playTTS(aiText);
    } catch (err) {
      console.error("🔥 Error during transcription or TTS:", err);
    }
  };

  const playTTS = async (text: string) => {
    try {
      isPlayingAudio.current = true;

      const response = await fetch("https://6146-34-87-139-150.ngrok-free.app/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, speaker_id: 0 }),
      });

      if (!response.ok) {
        console.error("❌ Error generating audio");
        return;
      }

      const blob = await response.blob();
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64Audio =
          typeof reader.result === "string"
            ? reader.result.split(",")[1]
            : null;

        if (!base64Audio) return;

        const fileUri = FileSystem.documentDirectory + "tts_output.wav";
        await FileSystem.writeAsStringAsync(fileUri, base64Audio, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && !status.isPlaying) {
            isPlayingAudio.current = false;
          }
        });
      };

      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("❌ Error playing TTS audio", err);
      isPlayingAudio.current = false;
    }
  };

  const recordingOptions: Audio.RecordingOptions = {
    android: {
      extension: ".m4a",
      outputFormat: 2, // MPEG_4
      audioEncoder: 3, // AAC
      sampleRate: 44100,
      numberOfChannels: 1,
      bitRate: 128000,
    },
    ios: {
      extension: ".wav",
      audioQuality: 128, // HIGH
      sampleRate: 44100,
      numberOfChannels: 1,
      bitRate: 128000,
      linearPCMBitDepth: 16,
      linearPCMIsBigEndian: false,
      linearPCMIsFloat: false,
    },
    web: {
      mimeType: "audio/webm",
      bitsPerSecond: 128000,
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.callerInfo}>
          <Text style={styles.callerName}>Emma</Text>
          <Text style={styles.callStatus}>00:42</Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.activeButton]}
            onPress={() => setIsMuted(!isMuted)}
          >
            <Mic color="#fff" size={24} />
            <Text style={styles.controlText}>Mute</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, isSpeaker && styles.activeButton]}
            onPress={() => setIsSpeaker(!isSpeaker)}
          >
            <Volume2 color="#fff" size={24} />
            <Text style={styles.controlText}>Speaker</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.endCallButton} onPress={handleEndCall}>
          <X color="#fff" size={32} />
        </TouchableOpacity>

        <TextInput
          value={userInput}
          onChangeText={setUserInput}
          placeholder="Type your message..."
          placeholderTextColor="#aaa"
          style={{
            color: "white",
            backgroundColor: "#1c1c1c",
            borderRadius: 10,
            padding: 12,
            marginBottom: 16,
            width: "100%",
          }}
          onSubmitEditing={async () => {
            await handleUserInput(userInput);
            setUserInput("");
          }}
        />
        {isListening && (
          <Text style={{ color: "#00FF99", marginTop: 12, fontWeight: "500" }}>
            🎙️ Listening...
          </Text>
        )}
        {isLoading && (
          <Text style={{ color: "#aaa" }}>Emma is thinking...</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
  },
  callerInfo: {
    alignItems: "center",
    marginTop: 48,
  },
  callerName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  callStatus: {
    fontSize: 18,
    color: "#737373",
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 32,
  },
  controlButton: {
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#141414",
  },
  activeButton: {
    backgroundColor: "#E50914",
  },
  controlText: {
    color: "#fff",
    marginTop: 8,
  },
  endCallButton: {
    backgroundColor: "#E50914",
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
});
