import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../api';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP
  const { login } = useAuth();
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (step === 1) {
      if (!email) {
        Alert.alert('Required', 'Please enter your email address');
        return;
      }
      // Basic check for SLIIT email format
      const sliitEmailRegex = /@(my\.)?sliit\.lk$/;
      if (!sliitEmailRegex.test(email)) {
        Alert.alert('Invalid Domain', 'Please use your official @sliit.lk or @my.sliit.lk email');
        return;
      }

      setLoading(true);
      try {
        await api.post('/auth/login', { email });
        setLoading(false);
        setStep(2);
        Alert.alert('OTP Sent', 'Check your email for the verification code.');
      } catch (error) {
        setLoading(false);
        console.log('LOGIN ERROR (send OTP):', error.message, error.response?.data);
        const msg = error.response?.data?.message || error.message || 'Something went wrong';
        Alert.alert('Error', msg);
      }
    } else {
      // Verify OTP step
      if (!otp) {
        Alert.alert('Required', 'Please enter the OTP');
        return;
      }

      setLoading(true);
      try {
        const res = await api.post('/auth/verify', { email, otp });
        setLoading(false);
        if (res.data.success) {
          login(res.data.token, res.data.user);
        }
      } catch (error) {
        setLoading(false);
        console.log('LOGIN ERROR (verify OTP):', error.message, error.response?.data);
        const msg = error.response?.data?.message || error.message || 'Invalid OTP';
        Alert.alert('Error', msg);
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <StatusBar style="light" />

        {/* Modern Dark Gradient Background */}
        <LinearGradient
          colors={['#0f0f1a', '#1a1a2e', '#2d3436']}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Abstract Decorative Elements */}
        <View style={styles.decorativeCircleTop} />
        <View style={styles.decorativeCircleBottom} />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            <View style={styles.headerContainer}>
              <Text style={styles.welcomeText}>{step === 1 ? 'Welcome' : 'Verify OTP'}</Text>
              <Text style={styles.subText}>{step === 1 ? "Sign in to SLIIT's Got Talent" : `Enter code sent to ${email}`}</Text>
            </View>

            <View style={styles.formContainer}>
              {step === 1 ? (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>ACADEMIC EMAIL</Text>
                  <View style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}>
                    <TextInput
                      style={styles.input}
                      placeholder="itxxxxxxxx@my.sliit.lk"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      selectionColor="#e94560"
                      editable={!loading}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>VERIFICATION CODE</Text>
                  <View style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}>
                    <TextInput
                      style={styles.input}
                      placeholder="123456"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      value={otp}
                      onChangeText={setOtp}
                      keyboardType="number-pad"
                      maxLength={6}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      selectionColor="#e94560"
                      editable={!loading}
                    />
                  </View>
                </View>
              )}

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleLogin}
                disabled={loading}
                style={styles.buttonShadow}
              >
                <LinearGradient
                  colors={loading ? ['#636e72', '#2d3436'] : ['#e94560', '#c1354b']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.loginButton}
                >
                  <Text style={styles.loginButtonText}>
                    {loading ? 'PROCESSING...' : (step === 1 ? 'SEND OTP' : 'VERIFY & LOGIN')}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              
              {step === 2 && (
                 <TouchableOpacity 
                   onPress={() => setStep(1)}
                   style={{ marginTop: 20, alignSelf: 'center' }}
                   disabled={loading}
                 >
                   <Text style={{ color: '#e94560', fontSize: 14 }}>Change Email</Text>
                 </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              disabled={loading}
            >
              <Text style={styles.backButtonText}>Back to Intro</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
  },
  // Abstract Shapes
  decorativeCircleTop: {
    position: 'absolute',
    top: -100,
    left: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#e94560',
    opacity: 0.15,
    transform: [{ scaleX: 1.5 }],
  },
  decorativeCircleBottom: {
    position: 'absolute',
    bottom: -50,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: '#6c5ce7',
    opacity: 0.1,
  },
  headerContainer: {
    marginBottom: 50,
  },
  welcomeText: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  subText: {
    fontSize: 16,
    color: '#b2bec3',
    marginTop: 5,
  },
  formContainer: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    color: '#e94560',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 1,
  },
  inputWrapper: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    height: 60,
    justifyContent: 'center',
  },
  inputWrapperFocused: {
    borderColor: '#e94560',
    backgroundColor: 'rgba(233, 69, 96, 0.1)',
  },
  input: {
    color: '#fff',
    fontSize: 18,
    paddingHorizontal: 20,
    height: '100%',
  },
  buttonShadow: {
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  loginButton: {
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  backButton: {
    alignSelf: 'center',
    padding: 15,
  },
  backButtonText: {
    color: '#636e72',
    fontSize: 14,
    fontWeight: '600',
  },
});
