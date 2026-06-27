import React, { useState } from 'react';
import { 
  ActivityIndicator,
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import DateTimePickerField from './DateTimePickerField';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps {
  nameInput: string;
  setNameInput: (name: string) => void;
  emailInput: string;
  setEmailInput: (email: string) => void;
  phoneInput: string;
  setPhoneInput: (phone: string) => void;
  passwordInput: string;
  setPasswordInput: (password: string) => void;
  birthDateInput: string;
  setBirthDateInput: (date: string) => void;
  rememberMe: boolean;
  setRememberMe: (val: boolean) => void;
  onLogin: () => void;
  onRegister: (confirmPassword: string) => void;
  isSubmitting: boolean;
  onAppeal: (statement: string) => void;
}

export default function WelcomeScreen({
  nameInput,
  setNameInput,
  emailInput,
  setEmailInput,
  phoneInput,
  setPhoneInput,
  passwordInput,
  setPasswordInput,
  birthDateInput,
  setBirthDateInput,
  rememberMe,
  setRememberMe,
  onLogin,
  onRegister,
  isSubmitting, onAppeal,
}: WelcomeScreenProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAppeal, setShowAppeal] = useState(false);
  const [appealStatement, setAppealStatement] = useState('');

  const slides = [
    {
      title: "Your #1 Nightlife Group",
      subtitle: "Find friends who share your vibe and never go to bars alone.",
      image: require('../../assets/onboarding_groups.jpg')
    },
    {
      title: "Discover Curated Venues",
      subtitle: "Explore the best wine rooms, rooftops, and karaoke spots in Poblacion and BGC.",
      image: require('../../assets/onboarding_venues.jpg')
    },
    {
      title: "Drink Moderately & Stay Safe",
      subtitle: "Coordinate safety timers, share location alerts, and look out for one another.",
      image: require('../../assets/logo.png')
    }
  ];

  const handleNext = () => {
    if (slideIndex < slides.length - 1) {
      setSlideIndex(slideIndex + 1);
    } else {
      setShowLoginForm(true);
    }
  };

  const handleSkip = () => {
    setShowLoginForm(true);
  };

  if (!showLoginForm) {
    /* 1. RESPONSIVE INTRO SLIDES (NO SCROLLING - FITS HEIGHT 100%) */
    return (
      <View style={styles.responsiveContainer}>
        
        {/* Top Spacer or Small Indicator */}
        <View style={{ height: 10 }} />

        {/* Dynamic Scaling Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={slides[slideIndex].image} 
            style={[
              styles.slideImage, 
              slideIndex === 2 && styles.logoSlideImage
            ]} 
            resizeMode="cover"
          />
        </View>

        {/* Text Details Area */}
        <View style={styles.textContainer}>
          <Text style={styles.slideTitle}>{slides[slideIndex].title}</Text>
          <Text style={styles.slideSubtitle}>{slides[slideIndex].subtitle}</Text>
        </View>

        {/* Dots Indicators Row */}
        <View style={styles.indicatorContainer}>
          {slides.map((_, i) => (
            <View 
              key={i} 
              style={[styles.indicator, slideIndex === i && styles.indicatorActive]} 
            />
          ))}
        </View>

        {/* Skip / Next Actions Row */}
        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextBtnText}>
              {slideIndex === slides.length - 1 ? "Get Started" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom padding to offset safe area indicator */}
        <View style={{ height: 16 }} />
      </View>
    );
  }

  /* 2. SCROLLABLE LOGIN FORM (TO PREVENT KEYBOARD OVERLAYS) */
  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
    <ScrollView
      contentContainerStyle={styles.welcomeContainer}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
    >
      <View style={styles.formWrapper}>
        <View style={styles.welcomeHero}>
          <View style={styles.welcomeLogoContainer}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={{ width: 77, height: 77, borderRadius: 22 }} 
            />
          </View>
          <Text style={styles.welcomeTitle}>NatsVibe</Text>
          <Text style={styles.welcomeTagline}>Go out with a group, not guesswork.</Text>
        </View>

        <View style={styles.welcomeForm}>
          <Text style={styles.formHeaderTitle}>{isRegister ? 'Create Account' : 'Welcome Back'}</Text>
          
          {isRegister && (
            <>
              <Text style={styles.welcomeInputLabel}>Full Name</Text>
              <TextInput 
                style={styles.welcomeInput} 
                placeholder="e.g. Renz Sicat" 
                placeholderTextColor="#6B7280"
                value={nameInput}
                onChangeText={setNameInput}
              />
            </>
          )}

          {isRegister && (
            <>
              <Text style={styles.welcomeInputLabel}>Date of Birth</Text>
              <DateTimePickerField
                value={birthDateInput}
                onChange={setBirthDateInput}
                mode="date"
                placeholder="Select your date of birth"
                maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
                defaultDate={new Date(2000, 0, 1)}
              />
            </>
          )}

          <Text style={styles.welcomeInputLabel}>Email Address</Text>
          <TextInput 
            style={styles.welcomeInput} 
            placeholder="e.g. renz@email.com" 
            placeholderTextColor="#6B7280"
            keyboardType="email-address"
            value={emailInput}
            onChangeText={setEmailInput}
          />

          {isRegister && (
            <>
              <Text style={styles.welcomeInputLabel}>Mobile Phone (for safety checks)</Text>
              <TextInput 
                style={styles.welcomeInput} 
                placeholder="e.g. +63 917 123 4567" 
                placeholderTextColor="#6B7280"
                keyboardType="phone-pad"
                value={phoneInput}
                onChangeText={setPhoneInput}
              />
            </>
          )}

          <Text style={styles.welcomeInputLabel}>Password</Text>
          <View style={styles.passwordInputRow}>
            <TextInput
              style={styles.passwordInput}
              placeholder={isRegister ? 'At least 10 letters and numbers' : 'Enter your password'}
              placeholderTextColor="#6B7280"
              secureTextEntry={!showPassword}
              value={passwordInput}
              onChangeText={setPasswordInput}
            />
            <TouchableOpacity style={styles.passwordToggle} onPress={() => setShowPassword(value => !value)}>
              <Text style={styles.passwordToggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          {isRegister && (
            <>
              <Text style={styles.welcomeInputLabel}>Confirm Password</Text>
              <TextInput
                style={styles.welcomeInput}
                placeholder="Enter your password again"
                placeholderTextColor="#6B7280"
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                returnKeyType="done"
                onSubmitEditing={() => onRegister(confirmPassword)}
              />
            </>
          )}

          {!isRegister && (
            <TouchableOpacity 
              style={styles.rememberMeRow} 
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.rememberMeText}>Remember Me</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.welcomeBtn, isSubmitting && { opacity: .55 }]}
            onPress={() => isRegister ? onRegister(confirmPassword) : onLogin()}
            disabled={isSubmitting}
          >
            {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.welcomeBtnText}>{isRegister ? 'Sign Up' : 'Log In'}</Text>}
          </TouchableOpacity>
          {!isRegister && <><TouchableOpacity onPress={() => setShowAppeal(value => !value)} style={{ marginTop: 12 }}><Text style={styles.toggleLinkText}>Appeal a suspended or banned account</Text></TouchableOpacity>{showAppeal && <><TextInput style={[styles.welcomeInput, { minHeight: 90, textAlignVertical: 'top' }]} multiline value={appealStatement} onChangeText={setAppealStatement} placeholder="Explain why the restriction should be reviewed" placeholderTextColor="#6B7280" /><TouchableOpacity style={[styles.welcomeBtn, appealStatement.trim().length < 20 && { opacity: .45 }]} disabled={appealStatement.trim().length < 20 || isSubmitting} onPress={() => onAppeal(appealStatement.trim())}><Text style={styles.welcomeBtnText}>Submit appeal</Text></TouchableOpacity></>}</>}

          <TouchableOpacity 
            onPress={() => {
              setIsRegister(value => !value);
              setConfirmPassword('');
              setShowPassword(false);
            }}
            style={{ marginTop: 12 }}
          >
            <Text style={styles.toggleLinkText}>
              {isRegister ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { setShowLoginForm(false); setSlideIndex(0); }} style={{ marginTop: 14 }}>
            <Text style={styles.backLinkText}>View feature details again</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By signing up, you agree to verified profile reviews and safe community guidelines.
          </Text>
        </View>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Compute responsive dimensions
const computedImageHeight = height * 0.28; // 28% of screen height (more compact & responsive)
const computedImageWidth = computedImageHeight; // square aspect ratio

const styles = StyleSheet.create({
  // Intro screen responsive container (no scroll, flex distribution)
  responsiveContainer: {
    flex: 1,
    backgroundColor: '#07050E',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    maxHeight: computedImageHeight + 20,
    marginTop: 15,
  },
  slideImage: {
    width: computedImageWidth,
    height: computedImageHeight,
    borderRadius: 24,
    backgroundColor: '#120E22',
  },
  logoSlideImage: {
    // scale logo slightly down to avoid overly massive display
    width: computedImageWidth * 0.7,
    height: computedImageWidth * 0.7,
    borderRadius: 24,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  slideTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  slideSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 19,
  },
  indicatorContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginVertical: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  indicatorActive: {
    backgroundColor: '#8B5CF6',
    width: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 12,
    marginTop: 4,
  },
  skipButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  skipText: {
    color: '#9CA3AF',
    fontSize: 15,
    fontWeight: '600',
  },
  nextBtn: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // Form View Layout
  keyboardView: {
    flex: 1,
  },
  welcomeContainer: {
    padding: 30,
    paddingBottom: 80,
    justifyContent: 'center',
    minHeight: '100%',
    backgroundColor: '#07050E',
  },
  formWrapper: {
    width: '100%',
  },
  welcomeHero: {
    alignItems: 'center',
    marginBottom: 28,
  },
  welcomeLogoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -1,
    marginBottom: 6,
  },
  welcomeTagline: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  welcomeForm: {
    gap: 12,
  },
  welcomeInputLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
    alignSelf: 'flex-start',
  },
  welcomeInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 15,
    marginBottom: 8,
  },
  passwordInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 12,
    marginBottom: 8,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 15,
  },
  passwordToggle: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  passwordToggleText: {
    color: '#8B5CF6',
    fontSize: 13,
    fontWeight: '700',
  },
  welcomeBtn: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  welcomeBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  backLinkText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  toggleLinkText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  formHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.5)',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  checkboxChecked: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  checkmark: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
  },
  rememberMeText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '500',
  },
  termsText: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 15,
  },
});
