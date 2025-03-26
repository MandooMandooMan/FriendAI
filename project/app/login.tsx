import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useState, useEffect } from 'react';
import { LogIn } from 'lucide-react-native';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState(null);
  
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "YOUR_ANDROID_CLIENT_ID",
    iosClientId: "997442604967-8aor4it7v6e5hq3qtfveo8j0r5cq3uk6.apps.googleusercontent.com",
    webClientId: "YOUR_WEB_CLIENT_ID",
  });

  useEffect(() => {
    if (response?.type === 'success') {
      // Handle successful login
      router.replace('/(tabs)');
    }
  }, [response]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1589254065878-42c9da997008?q=80&w=400&h=400&fit=crop' }}
            style={styles.logo}
          />
          <Text style={styles.title}>Welcome to AI Companions</Text>
          <Text style={styles.subtitle}>Connect with unique AI personalities</Text>
        </View>

        <View style={styles.loginSection}>
          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => promptAsync()}
          >
            <Image
              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }}
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guestButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <LogIn size={20} color="#E50914" />
            <Text style={styles.guestButtonText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.terms}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 48,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#737373',
    textAlign: 'center',
  },
  loginSection: {
    gap: 16,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  googleButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E50914',
  },
  guestButtonText: {
    color: '#E50914',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  terms: {
    color: '#737373',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
  },
});