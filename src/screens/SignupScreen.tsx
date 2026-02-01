import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch } from '../state/reduxStore';
import { setCredentials } from '../state/authSlice';
import { setStoredAuth } from '../services/authStorage';
import * as authApi from '../services/auth';
import { colors } from '../theme';
import type { RootStackParamList } from '../../App';

const backgroundSource = require('../assets/background.jpg');
const logoSource = require('../assets/wander-high-resolution-logo-transparent.png');

type SignupScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

export function SignupScreen() {
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    setError(null);
    if (confirmPassword !== password) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await authApi.signup(username, email, password);
      dispatch(setCredentials({ user, token }));
      await setStoredAuth({ token, user });
      navigation.replace('MainTabs');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={backgroundSource}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Image
              source={logoSource}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="Wander"
            />
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor={colors.placeholder}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={colors.placeholder}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={colors.placeholder}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm password"
              placeholderTextColor={colors.placeholder}
              secureTextEntry
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={loading}
              accessibilityLabel="Sign up"
              accessibilityRole="button"
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.buttonText}>Sign up</Text>
              )}
            </TouchableOpacity>
            <View style={styles.loginRow}>
              <Text style={styles.loginPrompt}>Already a user? </Text>
              <TouchableOpacity
                onPress={goToLogin}
                accessibilityLabel="Login"
                accessibilityRole="button"
              >
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'stretch',
  },
  logo: {
    width: 220,
    height: 56,
    alignSelf: 'center',
    marginBottom: 28,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  loginPrompt: {
    fontSize: 15,
    color: colors.textMuted,
  },
  loginLink: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.accent,
  },
  errorText: {
    color: '#c00',
    fontSize: 14,
    marginBottom: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
});
