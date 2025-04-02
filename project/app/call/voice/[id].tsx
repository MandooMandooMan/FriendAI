import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Mic, Volume2, X } from "lucide-react-native";
import { useState, useEffect, useRef } from "react";
import { TextInput } from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { Buffer } from "buffer";

export default function VoiceCall() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const isPlayingAudio = useRef(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [statusText, setStatusText] = useState("🎙️ Listening...");
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const [showWaveform, setShowWaveform] = useState(false);

  useEffect(() => {
    if (showWaveform) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: 1.4,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      bounceAnim.stopAnimation();
    }
  }, [showWaveform]);

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

  const startRecordingLoop = async () => {
    while (true) {
      if (isPlayingAudio.current) {
        await new Promise((res) => setTimeout(res, 1000));
        continue;
      }

      console.log("🎤 Starting recording...");
      setStatusText("🎙️ Listening...");

      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        console.error("❌ Mic permission denied");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(recordingOptions);
      await rec.startAsync();
      setRecording(rec);

      await new Promise((res) => setTimeout(res, 5000));

      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      setRecording(null);
      if (!uri) continue;

      // Read and compute RMS
      const fileInfo = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const buffer = Buffer.from(fileInfo, "base64");
      const view = new DataView(buffer.buffer);

      let sumSquares = 0;
      for (let i = 0; i < view.byteLength; i += 2) {
        const sample = view.getInt16(i, true); // little endian
        sumSquares += sample * sample;
      }
      const rms = Math.sqrt(sumSquares / (view.byteLength / 2));
      console.log("🔈 RMS:", rms);

      if (rms < 500) {
        console.log("🤫 Too quiet, skipping transcription");
        continue;
      }

      const text = await transcribeAudio(uri);
      if (!text.trim()) continue;
      console.log("🎙️ You said:", text);

      setStatusText("🧠 Emma is thinking...");
      const aiResponse = await getAIResponse(text);

      await playTTS(aiResponse);
    }
  };

  const transcribeAudio = async (uri: string): Promise<string> => {
    try {
      const file = {
        uri,
        name: "audio.wav",
        type: "audio/wav",
      };
      const formData = new FormData();
      formData.append("file", file as any);

      const res = await fetch("http://192.168.0.16:5005/transcribe-audio", {
        method: "POST",
        body: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const json = await res.json();
      return json.transcription ?? "";
    } catch (e) {
      console.error("❌ Transcription error:", e);
      return "";
    }
  };

  const playTTS = async (text: string) => {
    try {
      isPlayingAudio.current = true;

      const res = await fetch("http://192.168.0.16:5005/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, speaker_id: 0 }),
      });
      if (!res.ok) throw new Error("TTS generation failed:");
      const blob = await res.blob();
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64 =
          typeof reader.result === "string"
            ? reader.result.split(",")[1]
            : null;
        if (!base64) return;

        const fileUri = FileSystem.documentDirectory + "tts.wav";
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
        soundRef.current = sound;
        setStatusText("🗣️ Emma is speaking...");
        setShowWaveform(true);

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            isPlayingAudio.current = false;
            setShowWaveform(false);
            setStatusText("🎙️ Listening...");
          }
        });

        await sound.playAsync();

        // Start mic monitor for user interruption
        const mic = new Audio.Recording();
        await mic.prepareToRecordAsync(recordingOptions);
        await mic.startAsync();

        let interrupted = false;
        for (let i = 0; i < 30; i++) {
          await new Promise((res) => setTimeout(res, 200));
          try {
            await mic.stopAndUnloadAsync();
            const uri = mic.getURI();
            if (!uri) continue;

            const fileInfo = await FileSystem.readAsStringAsync(uri, {
              encoding: FileSystem.EncodingType.Base64,
            });
            const buffer = Buffer.from(fileInfo, "base64");
            const view = new DataView(buffer.buffer);
            let sumSquares = 0;
            for (let i = 0; i < view.byteLength; i += 2) {
              const sample = view.getInt16(i, true);
              sumSquares += sample * sample;
            }
            const rms = Math.sqrt(sumSquares / (view.byteLength / 2));

            // if (rms > 500) {
            //   console.log("🛑 User interrupted with RMS:", rms);
            //   interrupted = true;
            //   break;
            // }

            await mic.startAsync();
          } catch {}
        }

        if (interrupted && soundRef.current) {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
          soundRef.current = null;
          setShowWaveform(false);
          setStatusText("🎙️ Listening...");
          isPlayingAudio.current = false;
        }
      };

      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("❌ TTS error:", err);
      isPlayingAudio.current = false;
      setStatusText("🎙️ Listening...");
    }
  };

  const recordingOptions: Audio.RecordingOptions = {
    android: {
      extension: ".m4a",
      outputFormat: 2,
      audioEncoder: 3,
      sampleRate: 44100,
      numberOfChannels: 1,
      bitRate: 128000,
    },
    ios: {
      extension: ".wav",
      audioQuality: 128,
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

  useEffect(() => {
    startRecordingLoop();
  }, []);

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

        <TouchableOpacity
          style={styles.endCallButton}
          onPress={() => router.back()}
        >
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
            setUserInput("");
            setStatusText("🧠 Emma is thinking...");
            const aiText = await getAIResponse(userInput);
            await playTTS(aiText);
          }}
        />

        {showWaveform && (
          <Animated.View
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: "#E50914",
              marginBottom: 12,
              transform: [{ scale: bounceAnim }],
            }}
          />
        )}

        <Text style={{ color: "#aaa", marginTop: 12 }}>{statusText}</Text>
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
